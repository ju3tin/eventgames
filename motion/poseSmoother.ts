let lastPose:any | null = null

export function smoothPose(pose:any){
  if(!lastPose) { lastPose = pose; return pose }
  pose.keypoints.forEach((kp:any, i:number) => {
    kp.x = kp.x*0.6 + lastPose.keypoints[i].x*0.4
    kp.y = kp.y*0.6 + lastPose.keypoints[i].y*0.4
  })
  lastPose = pose
  return pose
}