import type { AnimationName } from "./avatar-store"

export type PartTransform = {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export type AnimationKeyframe = {
  time: number
  parts: Record<string, PartTransform>
}

export type AnimationData = {
  name: AnimationName
  duration: number
  loop: boolean
  keyframes: AnimationKeyframe[]
}

export const ANIMATIONS: Record<AnimationName, AnimationData> = {
  idle: {
    name: "idle",
    duration: 2,
    loop: true,
    keyframes: [
      {
        time: 0,
        parts: {
          body: { position: [0, 0, 0] },
          leftArm: { rotation: [0, 0, 0.05] },
          rightArm: { rotation: [0, 0, -0.05] },
          leftLeg: { rotation: [0, 0, 0] },
          rightLeg: { rotation: [0, 0, 0] },
        },
      },
      {
        time: 0.5,
        parts: {
          body: { position: [0, 0.05, 0] },
          leftArm: { rotation: [0, 0, 0.08] },
          rightArm: { rotation: [0, 0, -0.08] },
          leftLeg: { rotation: [0, 0, 0] },
          rightLeg: { rotation: [0, 0, 0] },
        },
      },
      {
        time: 1,
        parts: {
          body: { position: [0, 0, 0] },
          leftArm: { rotation: [0, 0, 0.05] },
          rightArm: { rotation: [0, 0, -0.05] },
          leftLeg: { rotation: [0, 0, 0] },
          rightLeg: { rotation: [0, 0, 0] },
        },
      },
    ],
  },
  walk: {
    name: "walk",
    duration: 1,
    loop: true,
    keyframes: [
      {
        time: 0,
        parts: {
          body: { position: [0, 0, 0] },
          leftArm: { rotation: [0.4, 0, 0] },
          rightArm: { rotation: [-0.4, 0, 0] },
          leftLeg: { rotation: [-0.4, 0, 0] },
          rightLeg: { rotation: [0.4, 0, 0] },
        },
      },
      {
        time: 0.25,
        parts: {
          body: { position: [0, 0.06, 0] },
          leftArm: { rotation: [0, 0, 0] },
          rightArm: { rotation: [0, 0, 0] },
          leftLeg: { rotation: [0, 0, 0] },
          rightLeg: { rotation: [0, 0, 0] },
        },
      },
      {
        time: 0.5,
        parts: {
          body: { position: [0, 0, 0] },
          leftArm: { rotation: [-0.4, 0, 0] },
          rightArm: { rotation: [0.4, 0, 0] },
          leftLeg: { rotation: [0.4, 0, 0] },
          rightLeg: { rotation: [-0.4, 0, 0] },
        },
      },
      {
        time: 0.75,
        parts: {
          body: { position: [0, 0.06, 0] },
          leftArm: { rotation: [0, 0, 0] },
          rightArm: { rotation: [0, 0, 0] },
          leftLeg: { rotation: [0, 0, 0] },
          rightLeg: { rotation: [0, 0, 0] },
        },
      },
    ],
  },
  run: {
    name: "run",
    duration: 0.6,
    loop: true,
    keyframes: [
      {
        time: 0,
        parts: {
          body: { position: [0, 0, 0], rotation: [0.1, 0, 0] },
          leftArm: { rotation: [0.7, 0, 0] },
          rightArm: { rotation: [-0.7, 0, 0] },
          leftLeg: { rotation: [-0.7, 0, 0] },
          rightLeg: { rotation: [0.7, 0, 0] },
        },
      },
      {
        time: 0.15,
        parts: {
          body: { position: [0, 0.12, 0], rotation: [0.1, 0, 0] },
          leftArm: { rotation: [0, 0, 0] },
          rightArm: { rotation: [0, 0, 0] },
          leftLeg: { rotation: [0, 0, 0] },
          rightLeg: { rotation: [0, 0, 0] },
        },
      },
      {
        time: 0.3,
        parts: {
          body: { position: [0, 0, 0], rotation: [0.1, 0, 0] },
          leftArm: { rotation: [-0.7, 0, 0] },
          rightArm: { rotation: [0.7, 0, 0] },
          leftLeg: { rotation: [0.7, 0, 0] },
          rightLeg: { rotation: [-0.7, 0, 0] },
        },
      },
      {
        time: 0.45,
        parts: {
          body: { position: [0, 0.12, 0], rotation: [0.1, 0, 0] },
          leftArm: { rotation: [0, 0, 0] },
          rightArm: { rotation: [0, 0, 0] },
          leftLeg: { rotation: [0, 0, 0] },
          rightLeg: { rotation: [0, 0, 0] },
        },
      },
    ],
  },
  jump: {
    name: "jump",
    duration: 1.2,
    loop: true,
    keyframes: [
      {
        time: 0,
        parts: {
          body: { position: [0, 0, 0] },
          leftArm: { rotation: [0, 0, 0.2] },
          rightArm: { rotation: [0, 0, -0.2] },
          leftLeg: { rotation: [0.3, 0, 0] },
          rightLeg: { rotation: [0.3, 0, 0] },
        },
      },
      {
        time: 0.2,
        parts: {
          body: { position: [0, -0.15, 0] },
          leftArm: { rotation: [0, 0, 0.1] },
          rightArm: { rotation: [0, 0, -0.1] },
          leftLeg: { rotation: [0.5, 0, 0] },
          rightLeg: { rotation: [0.5, 0, 0] },
        },
      },
      {
        time: 0.5,
        parts: {
          body: { position: [0, 0.6, 0] },
          leftArm: { rotation: [0, 0, -1.2] },
          rightArm: { rotation: [0, 0, 1.2] },
          leftLeg: { rotation: [-0.2, 0, 0] },
          rightLeg: { rotation: [-0.2, 0, 0] },
        },
      },
      {
        time: 0.8,
        parts: {
          body: { position: [0, 0.3, 0] },
          leftArm: { rotation: [0, 0, -0.8] },
          rightArm: { rotation: [0, 0, 0.8] },
          leftLeg: { rotation: [0.1, 0, 0] },
          rightLeg: { rotation: [0.1, 0, 0] },
        },
      },
      {
        time: 1,
        parts: {
          body: { position: [0, 0, 0] },
          leftArm: { rotation: [0, 0, 0.2] },
          rightArm: { rotation: [0, 0, -0.2] },
          leftLeg: { rotation: [0.3, 0, 0] },
          rightLeg: { rotation: [0.3, 0, 0] },
        },
      },
    ],
  },
}

function lerpValue(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpArray(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerpValue(a[0], b[0], t), lerpValue(a[1], b[1], t), lerpValue(a[2], b[2], t)]
}

export function getAnimationFrame(
  animation: AnimationData,
  normalizedTime: number
): Record<string, PartTransform> {
  const t = animation.loop
    ? normalizedTime % 1
    : Math.min(normalizedTime, 1)

  const actualTime = t * animation.duration

  const keyframes = animation.keyframes
  let prevFrame = keyframes[0]
  let nextFrame = keyframes[keyframes.length - 1]
  let segmentT = 0

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (actualTime >= keyframes[i].time && actualTime <= keyframes[i + 1].time) {
      prevFrame = keyframes[i]
      nextFrame = keyframes[i + 1]
      const segmentDuration = nextFrame.time - prevFrame.time
      segmentT = segmentDuration > 0 ? (actualTime - prevFrame.time) / segmentDuration : 0
      break
    }
  }

  const result: Record<string, PartTransform> = {}
  const allParts = new Set([
    ...Object.keys(prevFrame.parts),
    ...Object.keys(nextFrame.parts),
  ])

  for (const partName of allParts) {
    const prev = prevFrame.parts[partName] || {}
    const next = nextFrame.parts[partName] || {}

    const transform: PartTransform = {}

    if (prev.position || next.position) {
      const p = prev.position || [0, 0, 0]
      const n = next.position || [0, 0, 0]
      transform.position = lerpArray(
        p as [number, number, number],
        n as [number, number, number],
        segmentT
      )
    }

    if (prev.rotation || next.rotation) {
      const p = prev.rotation || [0, 0, 0]
      const n = next.rotation || [0, 0, 0]
      transform.rotation = lerpArray(
        p as [number, number, number],
        n as [number, number, number],
        segmentT
      )
    }

    result[partName] = transform
  }

  return result
}
