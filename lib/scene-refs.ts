import * as THREE from "three"

/**
 * Shared mutable references to the Three.js scene and camera.
 * Set by SceneCapture inside the Canvas, read by the export logic.
 */
export const sceneRefs: {
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  avatarGroup: THREE.Group | null
} = {
  scene: null,
  camera: null,
  avatarGroup: null,
}
