// Global variables
let hands;
let camera;
let videoElement;
let canvasElement;
let canvasCtx;
let startButton;
let stopButton;
let cameraSelect;
let handDataElement;
let fingerCountElement;
let gesturesElement;
let isTracking = false;

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    videoElement = document.getElementsByClassName('input_video')[0];
    canvasElement = document.getElementsByClassName('output_canvas')[0];
    canvasCtx = canvasElement.getContext('2d');
    startButton = document.getElementById('startButton');
    stopButton = document.getElementById('stopButton');
    cameraSelect = document.getElementById('cameraSelect');
    handDataElement = document.getElementById('handData');
    fingerCountElement = document.getElementById('fingerCount');
    gesturesElement = document.getElementById('gestures');

    // Set up event listeners
    startButton.addEventListener('click', startTracking);
    stopButton.addEventListener('click', stopTracking);

    // Initialize camera selection
    initCameraSelection();

    // Initialize the hand tracking solution
    initHandTracking();

    // Add loading state management
    window.updateStatus = function(message, type = 'info') {
        const statusBar = document.getElementById('statusBar');
        const statusMessage = statusBar.querySelector('.status-message');

        statusMessage.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-triangle' :
            type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;

        statusBar.className = 'status-bar';
        if (type !== 'info') {
            statusBar.classList.add(type);
        }
    };

    // Add video overlay management
    window.toggleVideoOverlay = function(show, message = '') {
        const overlay = document.getElementById('videoOverlay');
        if (show) {
            overlay.style.display = 'flex';
            if (message) {
                overlay.querySelector('.overlay-content p').textContent = message;
            }
        } else {
            overlay.style.display = 'none';
        }
    };

    // Initialize overlay
    toggleVideoOverlay(true);
    updateStatus('Ready to start tracking', 'info');
});

// Initialize camera selection dropdown
async function initCameraSelection() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraSelect.options.length}`;
            cameraSelect.appendChild(option);
        });

        if (videoDevices.length > 0) {
            cameraSelect.disabled = false;
        }
    } catch (error) {
        console.error('Error enumerating devices:', error);
        updateStatus('Could not access camera list', 'error');
    }
}

// Initialize the hand tracking solution
function initHandTracking() {
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onHandResults);
}

// Start the hand tracking
async function startTracking() {
    if (isTracking) return;

    updateStatus('Initializing camera...', 'info');
    toggleVideoOverlay(true, 'Loading camera...');
    startButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';
    startButton.disabled = true;

    const deviceId = cameraSelect.value;
    const constraints = {
        video: {
            width: {
                ideal: 1280
            },
            height: {
                ideal: 720
            },
            deviceId: deviceId ? {
                exact: deviceId
            } : undefined,
            facingMode: deviceId ? undefined : 'user'
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;

        // Wait for video to be ready
        await new Promise((resolve) => {
            videoElement.onloadedmetadata = resolve;
        });

        camera = new Camera(videoElement, {
            onFrame: async () => {
                if (isTracking) {
                    await hands.send({
                        image: videoElement
                    });
                }
            },
            width: 1280,
            height: 720
        });

        camera.start();
        isTracking = true;
        startButton.innerHTML = '<i class="fas fa-play"></i> Start Tracking';
        stopButton.disabled = false;
        cameraSelect.disabled = true;
        toggleVideoOverlay(false);

        updateStatus('Tracking active - show your hands to the camera', 'success');
    } catch (error) {
        console.error('Error accessing camera:', error);
        updateStatus(`Camera error: ${error.message}`, 'error');
        toggleVideoOverlay(true, 'Could not access camera');
        startButton.innerHTML = '<i class="fas fa-play"></i> Start Tracking';
        startButton.disabled = false;
    }
}

// Stop the hand tracking
function stopTracking() {
    if (!isTracking) return;

    updateStatus('Stopping tracking...', 'info');

    if (camera) {
        camera.stop();
    }

    if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }

    isTracking = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    cameraSelect.disabled = false;
    toggleVideoOverlay(true, 'Tracking stopped');

    // Clear the canvas
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Clear the data display
    handDataElement.textContent = 'No hand data available';
    fingerCountElement.textContent = '0';
    gesturesElement.textContent = 'No gestures detected';
    updateFingerVisualization(0);
    updateGesturePreview('');

    updateStatus('Ready to start tracking', 'info');
}

// Process hand tracking results
function onHandResults(results) {
    // Clear the canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the video frame
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Draw the hand landmarks and connections
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 2
            });
            drawLandmarks(canvasCtx, landmarks, {
                color: '#FF0000',
                lineWidth: 1,
                radius: 3
            });
        }
    }

    canvasCtx.restore();

    // Update the data display
    updateHandData(results);
}

// Update the hand data display
function updateHandData(results) {
    let handData = '';
    let fingerCount = 0;
    let gestures = '';

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        results.multiHandLandmarks.forEach((landmarks, handIndex) => {
            const handedness = results.multiHandedness[handIndex].label;
            const confidence = results.multiHandedness[handIndex].score.toFixed(2);

            handData += `Hand ${handIndex + 1} (${handedness}, Confidence: ${confidence}):\n`;

            const count = countFingers(landmarks, handedness);
            fingerCount += count;

            const gesture = detectGesture(landmarks, handedness);

            landmarks.forEach((landmark, index) => {
                handData += `  Landmark ${index}: X=${landmark.x.toFixed(3)}, Y=${landmark.y.toFixed(3)}, Z=${landmark.z.toFixed(3)}\n`;
            });

            handData += `  Finger Count: ${count}\n`;
            gestures += `${handedness} hand: ${gesture}\n`;
        });

        updateFingerVisualization(fingerCount);
        updateGesturePreview(gestures);
    } else {
        handData = 'No hands detected';
        gestures = 'No gestures detected';
        updateFingerVisualization(0);
        updateGesturePreview('');
    }

    handDataElement.textContent = handData;
    fingerCountElement.textContent = fingerCount;
    gesturesElement.textContent = gestures;
}

// Update finger visualization
function updateFingerVisualization(count) {
    const fingers = document.querySelectorAll('.finger');
    fingers.forEach((finger, index) => {
        finger.classList.toggle('active', index < count);
    });
}

// Update gesture preview
function updateGesturePreview(gesture) {
    const preview = document.getElementById('gesturePreview');
    const iconMap = {
        'OK Sign 👌': 'far fa-hand-peace',
        'Rock On 🤘': 'far fa-hand-rock',
        'Fist ✊': 'far fa-hand-fist',
        'Open Hand 🖐️': 'far fa-hand-paper',
        'Hang Loose 🤙': 'far fa-hand-spock',
        'Thumbs Up 👍': 'far fa-thumbs-up',
        'Thumbs Down 👎': 'far fa-thumbs-down',
        'Unknown Gesture': 'far fa-question-circle'
    };

    let iconClass = 'far fa-question-circle';
    for (const [key, value] of Object.entries(iconMap)) {
        if (gesture.includes(key.split(' ')[0])) {
            iconClass = value;
            break;
        }
    }

    preview.innerHTML = `<i class="${iconClass}"></i>`;
}

// Count the number of extended fingers
function countFingers(landmarks, handedness) {
    // Finger tip landmarks
    const fingerTips = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky
    const fingerJoints = {
        thumb: [2, 3],
        index: [6, 7],
        middle: [10, 11],
        ring: [14, 15],
        pinky: [18, 19]
    };

    let count = 0;

    // Check each finger
    for (let i = 0; i < fingerTips.length; i++) {
        const tip = landmarks[fingerTips[i]];
        let joint1, joint2;

        if (i === 0) { // thumb
            // Thumb is special - check if it's extended outward
            joint1 = landmarks[fingerJoints.thumb[0]];
            joint2 = landmarks[fingerJoints.thumb[1]];

            // Different logic for left/right hand
            if (handedness === 'Left') {
                if (tip.x < joint1.x && tip.x < joint2.x) {
                    count++;
                }
            } else {
                if (tip.x > joint1.x && tip.x > joint2.x) {
                    count++;
                }
            }
        } else {
            // For other fingers, check if the tip is above the joints
            const fingerName = Object.keys(fingerJoints)[i];
            joint1 = landmarks[fingerJoints[fingerName][0]];
            joint2 = landmarks[fingerJoints[fingerName][1]];

            if (tip.y < joint1.y && tip.y < joint2.y) {
                count++;
            }
        }
    }

    return count;
}

// Detect simple gestures
function detectGesture(landmarks, handedness) {
    // Get key landmarks
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const palmBase = landmarks[0];

    // Calculate distances between finger tips
    const thumbIndexDist = distance(thumbTip, indexTip);
    const indexMiddleDist = distance(indexTip, middleTip);
    const middleRingDist = distance(middleTip, ringTip);
    const ringPinkyDist = distance(ringTip, pinkyTip);
    const thumbPinkyDist = distance(thumbTip, pinkyTip);

    // Thresholds (relative to hand size)
    const handSize = distance(landmarks[0], landmarks[5]);
    const closeThreshold = handSize * 0.15;
    const farThreshold = handSize * 0.3;

    // Check for common gestures
    if (thumbIndexDist < closeThreshold &&
        indexMiddleDist > farThreshold &&
        middleRingDist > farThreshold &&
        ringPinkyDist > farThreshold) {
        return "OK Sign 👌";
    }

    if (thumbIndexDist < closeThreshold &&
        thumbPinkyDist < closeThreshold) {
        return "Rock On 🤘";
    }

    if (thumbIndexDist < closeThreshold &&
        indexMiddleDist < closeThreshold &&
        middleRingDist < closeThreshold &&
        ringPinkyDist < closeThreshold) {
        return "Fist ✊";
    }

    if (thumbIndexDist > farThreshold &&
        indexMiddleDist > farThreshold &&
        middleRingDist > farThreshold &&
        ringPinkyDist > farThreshold) {
        return "Open Hand 🖐️";
    }

    if (thumbIndexDist < closeThreshold &&
        indexMiddleDist > farThreshold &&
        middleRingDist > farThreshold &&
        ringPinkyDist < closeThreshold) {
        return "Hang Loose 🤙";
    }

    if (thumbTip.y < palmBase.y &&
        indexTip.y > palmBase.y &&
        middleTip.y > palmBase.y &&
        ringTip.y > palmBase.y &&
        pinkyTip.y > palmBase.y) {
        return "Thumbs Up 👍";
    }

    if (thumbTip.y > palmBase.y &&
        indexTip.y < palmBase.y &&
        middleTip.y < palmBase.y &&
        ringTip.y < palmBase.y &&
        pinkyTip.y < palmBase.y) {
        return "Thumbs Down 👎";
    }

    return "Unknown Gesture";
}

// Calculate distance between two landmarks
function distance(a, b) {
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) +
        Math.pow(a.y - b.y, 2) +
        Math.pow(a.z - b.z, 2)
    );
}