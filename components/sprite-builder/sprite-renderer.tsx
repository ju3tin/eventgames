import * as THREE from "three"
import { ANIMATIONS, getAnimationFrame } from "@/lib/animation-utils"
import type { AnimationName, SpriteSettings } from "@/lib/avatar-store"

/**
 * Renders a sprite sheet by cloning the avatar into an off-screen scene,
 * stepping through animation frames, and stitching each rendered frame
 * onto a 2D canvas grid.
 */
export async function renderSpriteSheet({
  scene,
  camera,
  animationName,
  spriteSettings,
  avatarGroup,
}: {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  animationName: AnimationName
  spriteSettings: SpriteSettings
  avatarGroup: THREE.Group
}): Promise<{ dataUrl: string; metadata: object }> {
  const { frames, columns, cellWidth, cellHeight } = spriteSettings
  const rows = Math.ceil(frames / columns)
  const sheetWidth = columns * cellWidth
  const sheetHeight = rows * cellHeight

  console.log("[v0] renderSpriteSheet - avatarGroup children:", avatarGroup.children.length)

  // Create off-screen renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  })
  renderer.setSize(cellWidth, cellHeight)
  renderer.setPixelRatio(1)
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  // Create stitch canvas
  const stitchCanvas = document.createElement("canvas")
  stitchCanvas.width = sheetWidth
  stitchCanvas.height = sheetHeight
  const ctx = stitchCanvas.getContext("2d")!
  ctx.clearRect(0, 0, sheetWidth, sheetHeight)

  // Build off-screen scene with lights
  const offScene = new THREE.Scene()
  offScene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(5, 8, 5)
  offScene.add(dirLight)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
  fillLight.position.set(-3, 4, -2)
  offScene.add(fillLight)

  // Clone the avatar group deeply
  const clonedAvatar = avatarGroup.clone(true)
  offScene.add(clonedAvatar)

  // Clone camera
  const offCamera = camera.clone()
  offCamera.aspect = cellWidth / cellHeight
  offCamera.updateProjectionMatrix()

  const anim = ANIMATIONS[animationName]

  // The avatar model structure is:
  //   avatarGroup > bodyGroup (children[0]) > [head, hair, eyes, torso, leftArmPivot, rightArmPivot, leftLegPivot, rightLegPivot]
  // Walk the cloned tree to find the named groups/pivots.
  const bodyGroup = clonedAvatar.children[0] as THREE.Group | undefined

  console.log("[v0] bodyGroup children count:", bodyGroup?.children.length ?? "N/A")
  if (bodyGroup) {
    bodyGroup.children.forEach((c, i) => {
      console.log(`[v0] bodyGroup child[${i}]:`, c.type, c.userData?.partSlot ?? "(no partSlot)")
    })
  }

  // The pivot groups at indices 4-7 are THREE.Group wrappers. If the children count
  // is wrong we fall back to null so we just skip animation for that limb.
  const leftArmPivot = bodyGroup && bodyGroup.children.length > 4 ? bodyGroup.children[4] as THREE.Group : null
  const rightArmPivot = bodyGroup && bodyGroup.children.length > 5 ? bodyGroup.children[5] as THREE.Group : null
  const leftLegPivot = bodyGroup && bodyGroup.children.length > 6 ? bodyGroup.children[6] as THREE.Group : null
  const rightLegPivot = bodyGroup && bodyGroup.children.length > 7 ? bodyGroup.children[7] as THREE.Group : null

  for (let i = 0; i < frames; i++) {
    const normalizedTime = i / frames
    const frame = getAnimationFrame(anim, normalizedTime)

    // Apply body transform
    if (frame.body && bodyGroup) {
      if (frame.body.position) bodyGroup.position.set(...frame.body.position)
      if (frame.body.rotation) bodyGroup.rotation.set(...frame.body.rotation)
    }
    // Apply limb rotations
    if (frame.leftArm?.rotation && leftArmPivot) {
      leftArmPivot.rotation.set(...frame.leftArm.rotation)
    }
    if (frame.rightArm?.rotation && rightArmPivot) {
      rightArmPivot.rotation.set(...frame.rightArm.rotation)
    }
    if (frame.leftLeg?.rotation && leftLegPivot) {
      leftLegPivot.rotation.set(...frame.leftLeg.rotation)
    }
    if (frame.rightLeg?.rotation && rightLegPivot) {
      rightLegPivot.rotation.set(...frame.rightLeg.rotation)
    }

    // Update matrices
    offScene.updateMatrixWorld(true)

    // Render this frame
    renderer.render(offScene, offCamera)

    // Stitch into the sheet
    const col = i % columns
    const row = Math.floor(i / columns)
    ctx.drawImage(renderer.domElement, col * cellWidth, row * cellHeight, cellWidth, cellHeight)
  }

  // Cleanup
  renderer.dispose()

  const dataUrl = stitchCanvas.toDataURL("image/png")
  const metadata = {
    animation: animationName,
    frames,
    columns,
    rows,
    cellWidth,
    cellHeight,
    sheetWidth,
    sheetHeight,
  }

  console.log("[v0] Sprite sheet generated:", metadata)
  return { dataUrl, metadata }
}
