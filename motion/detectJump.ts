// motion/detectJump.ts

/**
 * Jump detection state
 */
let lastY: number = 0
let isJumping: boolean = false

/**
 * detectJump
 * Checks if a jump occurred based on MoveNet pose keypoints.
 * @param pose - MoveNet pose object
 * @returns true if jump detected
 */
export function detectJump(pose: { keypoints: Array<{ name: string; x: number; y: number; score: number }> }): boolean {
  if (!pose?.keypoints || pose.keypoints.length === 0) return false

  const leftAnkle = pose.keypoints.find(k => k.name === "left_ankle")
  const rightAnkle = pose.keypoints.find(k => k.name === "right_ankle")

  if (!leftAnkle || !rightAnkle) return false

  // average Y position of ankles
  const avgY = (leftAnkle.y + rightAnkle.y) / 2

  // detect upward movement exceeding threshold
  const JUMP_THRESHOLD = 20 // pixels, adjust as needed

  if (!isJumping && avgY < lastY - JUMP_THRESHOLD) {
    isJumping = true
    lastY = avgY
    return true
  }

  // reset jumping state when returning down
  if (isJumping && avgY >= lastY) {
    isJumping = false
  }

  lastY = avgY
  return false
}