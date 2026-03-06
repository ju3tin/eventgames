export function detectSquat(pose:any){
    const hip = pose.keypoints.find((k:any)=>k.name==="left_hip")
    const knee = pose.keypoints.find((k:any)=>k.name==="left_knee")
    return hip && knee && hip.y > knee.y
  }
  
  export function detectJump(pose:any){
    const ankle = pose.keypoints.find((k:any)=>k.name==="left_ankle")
    return ankle && ankle.y < 200
  }
  
  export function detectPushup(pose:any){
    const elbow = pose.keypoints.find((k:any)=>k.name==="left_elbow")
    return elbow && elbow.y < 150
  }
  
  export function detectPunch(pose:any){
    const wrist = pose.keypoints.find((k:any)=>k.name==="left_wrist")
    return wrist && wrist.x > 500
  }