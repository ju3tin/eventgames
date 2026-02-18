let video, poseCanvas, poseCtx;
let detector;
let currentPose = "idle";
let cameraActive = false;
let lastPoseUpdate = 0;
const POSE_UPDATE_INTERVAL = 100;

// Initialize when page loads
if (document.readyState === "complete") {
    init();
} else {
    window.addEventListener("load", init); // Wait for load event
}

// Initialize the application
async function init() {
    // Get DOM elements
    video = document.getElementById("video");
    poseCanvas = document.getElementById("poseCanvas");
    poseCtx = poseCanvas.getContext("2d");

    // Add event listeners
    document
        .getElementById("cameraBtn")
        .addEventListener("click", toggleCamera);

    // Initialize game
    await gameManager.initGame();
    await toggleCamera();

    console.log("Game initialized.");
}

// Toggle camera on/off
async function toggleCamera() {
    const cameraBtn = document.getElementById("cameraBtn");
    const loadingIndicator = document.getElementById("loadingIndicator");

    if (!cameraActive) {
        try {
            // Disable button and show loading
            cameraBtn.disabled = true;
            cameraActive = true;
            loadingIndicator.classList.remove("hidden");

            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
            });

            // Set video source
            video.srcObject = stream;

            // Wait for video to be ready
            await new Promise((resolve) => {
                video.onloadedmetadata = () => resolve(video);
            });

            // Mirror video for better UX
            video.style.transform = "scaleX(-1)";

            // Set canvas dimensions to match video
            poseCanvas.width = video.videoWidth;
            poseCanvas.height = video.videoHeight;

            // Mirror canvas for better UX
            poseCtx.translate(poseCanvas.width, 0);
            poseCtx.scale(-1, 1);

            // Load pose detection model
            await loadPoseModel();

            // Start pose detection
            detectPose();

            // Update UI
            cameraBtn.textContent = "Stop Camera";
            cameraBtn.style.background = "#ff4500";
            cameraBtn.style.color = "#fff";
            cameraBtn.disabled = false;
            loadingIndicator.classList.add("hidden");
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert(
                "Could not access the camera. Please allow camera access and try again."
            );
            cameraBtn.disabled = false;
            loadingIndicator.classList.add("hidden");
        }
    } else {
        // Stop camera
        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }

        // Clear canvas
        poseCtx.clearRect(0, 0, poseCanvas.width, poseCanvas.height);

        // Update UI
        cameraActive = false;
        cameraBtn.textContent = "Start Camera";
        cameraBtn.style.background = "#333";
        cameraBtn.style.color = "#ffaa00";

        // Reset pose status
        document.getElementById("poseStatus").textContent = "IDLE";
        document
            .querySelectorAll(".pose-item")
            .forEach((item) => item.classList.remove("active"));
    }
}

async function loadPoseModel() {
    // Load the MoveNet model
    detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
    );
    console.log("Pose detection model loaded.");
}

async function detectPose() {
    if (!detector || !video || !cameraActive) return;

    try {
        // Estimate poses
        const poses = await detector.estimatePoses(video);

        // Clear canvas
        poseCtx.clearRect(0, 0, poseCanvas.width, poseCanvas.height);

        if (poses.length > 0) {
            const pose = poses[0];

            // Draw skeleton
            drawPose(pose);

            // Detect action
            const action = detectAction(pose);

            const now = Date.now();

            // Update pose status only at the specified interval
            if (now - lastPoseUpdate > POSE_UPDATE_INTERVAL) {
                lastPoseUpdate = now;

                // Update pose status
                if (action !== currentPose) {
                    currentPose = action;
                    document.getElementById("poseStatus").textContent =
                        action.toUpperCase();

                    // Update pose indicators
                    document
                        .querySelectorAll(".pose-item")
                        .forEach((item) => item.classList.remove("active"));

                    if (action === "left punch") {
                        document
                            .getElementById("pose-left")
                            .classList.add("active");
                    } else if (action === "right punch") {
                        document
                            .getElementById("pose-right")
                            .classList.add("active");
                    } else if (action === "block") {
                        document
                            .getElementById("pose-block")
                            .classList.add("active");
                    } else if (action === "dodge") {
                        document
                            .getElementById("pose-dodge")
                            .classList.add("active");
                    }
                }

                if (gameManager && gameManager.gameRunning) {
                    gameManager.handlePlayerAction(action);
                }
            }
        }
    } catch (error) {
        console.error("Pose detection error:", error);
    }

    requestAnimationFrame(detectPose);
}

function drawPose(pose) {
    const keypoints = pose.keypoints;

    // Draw keypoints
    keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.3) {
            poseCtx.beginPath();
            poseCtx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
            poseCtx.fillStyle = "#ffaa00";
            poseCtx.fill();
        }
    });

    // Draw skeleton
    const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
        poseDetection.SupportedModels.MoveNet
    );

    adjacentKeyPoints.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        if (kp1.score > 0.3 && kp2.score > 0.3) {
            poseCtx.beginPath();
            poseCtx.moveTo(kp1.x, kp1.y);
            poseCtx.lineTo(kp2.x, kp2.y);
            poseCtx.lineWidth = 2;
            poseCtx.strokeStyle = "#ff6600";
            poseCtx.stroke();
        }
    });
}

function detectAction(pose) {
    const keypoints = pose.keypoints;

    // Get key points
    const leftWrist = keypoints.find((kp) => kp.name === "left_wrist");
    const rightWrist = keypoints.find((kp) => kp.name === "right_wrist");
    const leftShoulder = keypoints.find((kp) => kp.name === "left_shoulder");
    const rightShoulder = keypoints.find((kp) => kp.name === "right_shoulder");
    const nose = keypoints.find((kp) => kp.name === "nose");
    const leftElbow = keypoints.find((kp) => kp.name === "left_elbow");
    const rightElbow = keypoints.find((kp) => kp.name === "right_elbow");

    // Detect actions based on pose
    if (rightElbow.y > rightWrist.y) {
        const right_punch_angle = getAngle(
            rightShoulder,
            rightElbow,
            rightWrist
        );
        if (right_punch_angle > 140) {
            return "right punch"; // Right hand extended
        }
    }

    if (leftElbow.y > leftWrist.y) {
        const left_punch_angle = getAngle(leftShoulder, leftElbow, leftWrist);
        if (left_punch_angle > 140) {
            return "left punch"; // Left hand extended
        }
    }

    // wrists above elbows (upright arms)
    const leftUpright = leftWrist.y < leftElbow.y;
    const rightUpright = rightWrist.y < rightElbow.y;
    if (leftUpright && rightUpright) {
        return "block";
    }

    // Distance between shoulders
    const shoulderDist = Math.abs(rightShoulder.x - leftShoulder.x);
    if (shoulderDist < 50) {
        // shoulders too close = rotated
        return "dodge";
    }

    return "idle";
}

function getAngle(a, b, c) {
    // Angle at point b (a-b-c)
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };

    const dot = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
    const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);

    const cosine = dot / (magAB * magCB);
    return Math.acos(cosine) * (180 / Math.PI); // degrees
}
