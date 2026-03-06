// motion/detectJump.ts

let lastY = 0           // tracks previous ankle height
let isJumping = false    // state to avoid multiple detections per jump

/**
 * Detects a jump based on MoveNet pose keypoints
 * @param pose MoveNet pose object
 * @returns true if a jump is detected
 */
export function detectJump(pose: any): boolean {
  if (!pose || !pose.keypoints) return false

  // get left and right ankle
  const leftAnkle = pose.keypoints.find((k: any) => k.name === "left_ankle")
  const rightAnkle = pose.keypoints.find((k: any) => k.name === "right_ankle")
  if (!leftAnkle || !rightAnkle) return false

  // average Y position of ankles
  const avgY = (leftAnkle.y + rightAnkle.y) / 2

  // detect upward motion (jump)
  if (!isJumping && avgY < lastY - 20) {  // threshold: 20 pixels
    isJumping = true
    lastY = avgY
    return true
  }

  // reset jumping state when returning to baseline
  if (isJumping && avgY >= lastY) {
    isJumping = false
  }

  lastY = avgY
  return false
}