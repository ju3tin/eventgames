
const video = document.getElementById("video");
const poseCanvas = document.getElementById("poseCanvas");
const ctx = poseCanvas.getContext("2d");
const countdownEl = document.getElementById("countdown");

let poseDetector, handDetector;
let isRecording = false;
let recordedFrames = [];

const ui = {
  showStart() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('start-screen').classList.remove('hidden');
  },

  showArenaSelect() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('arena-screen').classList.remove('hidden');
  },

  showCharacterSelect() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('character-screen').classList.remove('hidden');
  },

  showGame() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('game-container').classList.remove('hidden');
  },

  showJoin() {
    document.getElementById('join-input').classList.remove('hidden');
  },

  start(mode) {
    game.mode = mode;
    this.showArenaSelect();
  },

  selectArena(index) {
    game.arena = index;
    this.showCharacterSelect();
  },

  selectCharacter(index) {
    game.character = index;
    startGame();
  },

  join() {
    const code = document.getElementById('room-code').value.trim();
    if (!code) return alert("Enter room code");
    game.channel = code;
    this.showArenaSelect();
  }
};
  
  // Copy room code helper
  document.getElementById('copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(game.channel);
    alert('Room code copied!');
  });

const game = {
    mode: null,         // 'ai', 'host', 'join'
    channel: null,
    arena: 0,
    character: 0,
  
    me: {
      x: 200,
      y: 400,
      health: 100,
      side: 'left',
      attacking: false,
      ducking: false
    },
  
    opponent: {
      x: 0,
      y: 400,
      health: 100,
      side: 'right',
      attacking: false,
      ducking: false
    },
  
    lastPunch: 0
  };
/* ---------------- CANVAS RESIZE ---------------- */
function resizeCanvas(){
  poseCanvas.width = window.innerWidth;
  poseCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

/* ---------------- CAMERA ---------------- */
async function setupCamera(){
  const stream = await navigator.mediaDevices.getUserMedia({
    video:{width:640,height:480},
    audio:false
  });
  video.srcObject = stream;
  return new Promise(resolve=>{
    video.onloadedmetadata=()=>{
      video.play();
      resolve();
    }
  });
}

/* ---------------- DRAW HELPERS ---------------- */
function drawPoint(x,y,color="red"){
  ctx.beginPath();
  ctx.arc(x,y,6,0,2*Math.PI);
  ctx.fillStyle=color;
  ctx.fill();
}

function drawLine(x1,y1,x2,y2,color="yellow"){
  ctx.strokeStyle=color;
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
}

const skeletonPairs=[
[0,1],[1,3],[0,2],[2,4],
[5,7],[7,9],[6,8],[8,10],
[5,6],[11,12],[5,11],[6,12],
[11,13],[13,15],[12,14],[14,16]
];

/* ---------------- COUNTDOWN ---------------- */
async function startCountdown(seconds=3){
  countdownEl.style.display="block";
  for(let i=seconds;i>0;i--){
    countdownEl.innerText=i;
    await new Promise(r=>setTimeout(r,1000));
  }
  countdownEl.innerText="FIGHT!";
  await new Promise(r=>setTimeout(r,700));
  countdownEl.style.display="none";
}

/* ---------------- RECORD BUTTON ---------------- */recordBtn.onclick = async ()=>{
  if(isRecording) return;

  recordedFrames=[];
  await startCountdown(3);
  isRecording=true;

  setTimeout(()=>{
    isRecording=false;

    const blob=new Blob([JSON.stringify(recordedFrames)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="moveData.json";
    a.click();

  },3000);
};

/* ---------------- DETECT LOOP ---------------- */
async function detect(){

  ctx.clearRect(0,0,poseCanvas.width,poseCanvas.height);

  ctx.save();
  ctx.scale(-1,1);
  ctx.drawImage(video,-poseCanvas.width,0,poseCanvas.width,poseCanvas.height);
  ctx.restore();

  const scaleX=poseCanvas.width/video.videoWidth;
  const scaleY=poseCanvas.height/video.videoHeight;
  const toCanvas=(x,y)=>({
    x:poseCanvas.width-x*scaleX,
    y:y*scaleY
  });

  /* -------- FIGHT BOX (Adaptive) -------- */
  const isPortrait = poseCanvas.height > poseCanvas.width;

  let boxWidth, boxHeight;

  if(isPortrait){
    boxWidth = poseCanvas.width * 0.7;
    boxHeight = poseCanvas.height * 0.5;
  }else{
    boxWidth = poseCanvas.width * 0.4;
    boxHeight = poseCanvas.height * 0.7;
  }

  const boxX = (poseCanvas.width - boxWidth) / 2;
  const boxY = (poseCanvas.height - boxHeight) / 2;

  ctx.strokeStyle="red";
  ctx.lineWidth=4;
  ctx.strokeRect(boxX,boxY,boxWidth,boxHeight);

  /* -------- POSE -------- */
  const poses=await poseDetector.estimatePoses(video);
  const hands=await handDetector.estimateHands(video,{flipHorizontal:false});

  if(poses.length>0){

    const keypoints=poses[0].keypoints.map(k=>{
      const p=toCanvas(k.x,k.y);
      return {...p,score:k.score,name:k.name||k.part};
    });

    /* --- Check if inside fight box --- */
    const leftHip = keypoints.find(k=>k.name==="left_hip");
    const rightHip = keypoints.find(k=>k.name==="right_hip");

    let insideBox=true;

    if(leftHip && rightHip){
      const centerX=(leftHip.x+rightHip.x)/2;
      const centerY=(leftHip.y+rightHip.y)/2;

      if(centerX<boxX || centerX>boxX+boxWidth ||
         centerY<boxY || centerY>boxY+boxHeight){
        insideBox=false;
      }
    }

    if(!insideBox){
      ctx.fillStyle="rgba(255,0,0,0.25)";
      ctx.fillRect(0,0,poseCanvas.width,poseCanvas.height);
    }

    /* --- Draw Skeleton --- */
    skeletonPairs.forEach(([i,j])=>{
      if(keypoints[i].score>0.5 && keypoints[j].score>0.5)
        drawLine(keypoints[i].x,keypoints[i].y,keypoints[j].x,keypoints[j].y,"yellow");
    });

    keypoints.forEach(k=>{
      if(k.score>0.5) drawPoint(k.x,k.y,"yellow");
    });
  }

  /* -------- HANDS -------- */
  hands.forEach(hand=>{
    const color=hand.handedness==="Right"?"lime":"cyan";

    hand.keypoints.forEach(k=>{
      const p=toCanvas(k.x,k.y);
      drawPoint(p.x,p.y,color);
    });
  });

  /* -------- RECORD -------- */
  if(isRecording){
    recordedFrames.push({
      timestamp:Date.now(),
      pose:poses.length>0?poses[0].keypoints:null,
      hands:hands
    });
  }

  requestAnimationFrame(detect);
}

/* ---------------- MAIN ---------------- */
async function main(){
  await tf.setBackend("webgl");
  await tf.ready();
  resizeCanvas();
  await setupCamera();

  poseDetector=await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {modelType:poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING}
  );

  handDetector=await handPoseDetection.createDetector(
    handPoseDetection.SupportedModels.MediaPipeHands,
    {
      runtime:"mediapipe",
      modelType:"full",
      solutionPath:"https://cdn.jsdelivr.net/npm/@mediapipe/hands"
    }
  );

  detect();
}

main();