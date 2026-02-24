/* ==============================
   BOXING MOVE RECORDER MODULE
   ============================== */

   let previousPose = null;
   let recordedMoves = [];
   let moveCooldown = 0;
   
   function detectBoxingMove(currentPose) {
     if (!previousPose) {
       previousPose = currentPose;
       return null;
     }
   
     const get = (name, pose) =>
       pose.keypoints.find(k => k.name === name);
   
     const currRW = get("right_wrist", currentPose);
     const prevRW = get("right_wrist", previousPose);
   
     const currLW = get("left_wrist", currentPose);
     const prevLW = get("left_wrist", previousPose);
   
     const nose = get("nose", currentPose);
   
     if (!currRW || !prevRW || !currLW || !prevLW) {
       previousPose = currentPose;
       return null;
     }
   
     const calcMove = (curr, prev) => {
       const dx = curr.x - prev.x;
       const dy = curr.y - prev.y;
       const speed = Math.sqrt(dx*dx + dy*dy);
       return { dx, dy, speed };
     };
   
     const right = calcMove(currRW, prevRW);
     const left = calcMove(currLW, prevLW);
   
     let move = null;
   
     /* ---- JAB (forward fast motion) ---- */
     if (right.speed > 20 && right.dx < -15) {
       move = "RIGHT_JAB";
     }
   
     if (left.speed > 20 && left.dx > 15) {
       move = "LEFT_JAB";
     }
   
     /* ---- UPPERCUT (fast upward motion) ---- */
     if (right.speed > 20 && right.dy < -15) {
       move = "RIGHT_UPPERCUT";
     }
   
     if (left.speed > 20 && left.dy < -15) {
       move = "LEFT_UPPERCUT";
     }
   
     /* ---- BLOCK (hand near head) ---- */
     const distRightToHead = Math.hypot(
       currRW.x - nose.x,
       currRW.y - nose.y
     );
   
     const distLeftToHead = Math.hypot(
       currLW.x - nose.x,
       currLW.y - nose.y
     );
   
     if (distRightToHead < 70) move = "RIGHT_BLOCK";
     if (distLeftToHead < 70) move = "LEFT_BLOCK";
   
     previousPose = currentPose;
   
     /* ---- Cooldown (prevents spam) ---- */
     const now = Date.now();
     if (move && now - moveCooldown > 500) {
       moveCooldown = now;
       return move;
     }
   
     return null;
   }
   
   /* ==============================
      RECORD FUNCTION
      ============================== */
   
   function recordMoveIfDetected(pose, isRecording) {
     if (!isRecording) return;
   
     const move = detectBoxingMove(pose);
   
     if (move) {
       recordedMoves.push({
         move: move,
         timestamp: Date.now()
       });
   
       console.log("Detected:", move);
     }
   }
   
   /* ==============================
      DOWNLOAD FUNCTION
      ============================== */
   
   function downloadMoves() {
     const blob = new Blob(
       [JSON.stringify(recordedMoves, null, 2)],
       { type: "application/json" }
     );
   
     const url = URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = "boxingMoves.json";
     a.click();
   }