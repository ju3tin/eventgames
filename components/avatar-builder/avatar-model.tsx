"use client"

import { useRef, useCallback } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { HeadPart } from "./body-parts/head"
import { TorsoPart } from "./body-parts/torso"
import { ArmPart } from "./body-parts/arm"
import { LegPart } from "./body-parts/leg"
import { HairPart } from "./body-parts/hair"
import { EyesPart } from "./body-parts/eyes"
import { useAvatarStore } from "@/lib/avatar-store"
import { ANIMATIONS, getAnimationFrame } from "@/lib/animation-utils"

export function AvatarModel({
  meshRefs,
}: {
  meshRefs: React.MutableRefObject<Record<string, THREE.Mesh | null>>
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const bodyRef = useRef<THREE.Group>(null!)
  const leftArmRef = useRef<THREE.Group>(null!)
  const rightArmRef = useRef<THREE.Group>(null!)
  const leftLegRef = useRef<THREE.Group>(null!)
  const rightLegRef = useRef<THREE.Group>(null!)

  const editMode = useAvatarStore((s) => s.editMode)
  const selectedAnimation = useAvatarStore((s) => s.selectedAnimation)
  const isPlaying = useAvatarStore((s) => s.isPlaying)
  const animationSpeed = useAvatarStore((s) => s.animationSpeed)

  const clockRef = useRef(0)

  const setMeshRef = useCallback(
    (slot: string) => (mesh: THREE.Mesh | null) => {
      meshRefs.current[slot] = mesh
    },
    [meshRefs]
  )

  useFrame((_, delta) => {
    if (editMode !== "animate" || !isPlaying) return

    const anim = ANIMATIONS[selectedAnimation]
    if (!anim) return

    clockRef.current += delta * animationSpeed
    const normalizedTime = (clockRef.current / anim.duration) % 1

    const frame = getAnimationFrame(anim, normalizedTime)

    if (frame.body && bodyRef.current) {
      if (frame.body.position) {
        bodyRef.current.position.set(...frame.body.position)
      }
      if (frame.body.rotation) {
        bodyRef.current.rotation.set(...frame.body.rotation)
      }
    }

    if (frame.leftArm && leftArmRef.current) {
      if (frame.leftArm.rotation) {
        leftArmRef.current.rotation.set(...frame.leftArm.rotation)
      }
    }
    if (frame.rightArm && rightArmRef.current) {
      if (frame.rightArm.rotation) {
        rightArmRef.current.rotation.set(...frame.rightArm.rotation)
      }
    }
    if (frame.leftLeg && leftLegRef.current) {
      if (frame.leftLeg.rotation) {
        leftLegRef.current.rotation.set(...frame.leftLeg.rotation)
      }
    }
    if (frame.rightLeg && rightLegRef.current) {
      if (frame.rightLeg.rotation) {
        rightLegRef.current.rotation.set(...frame.rightLeg.rotation)
      }
    }
  })

  // Reset transforms when not animating
  useFrame(() => {
    if (editMode === "animate" && isPlaying) return

    if (bodyRef.current) {
      bodyRef.current.position.set(0, 0, 0)
      bodyRef.current.rotation.set(0, 0, 0)
    }
    if (leftArmRef.current) leftArmRef.current.rotation.set(0, 0, 0)
    if (rightArmRef.current) rightArmRef.current.rotation.set(0, 0, 0)
    if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0)
    if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0)
  })

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        <HeadPart onMeshRef={setMeshRef("head")} />
        <HairPart />
        <EyesPart />
        <TorsoPart onMeshRef={setMeshRef("torso")} />

        {/* Left arm pivot at shoulder */}
        <group ref={leftArmRef} position={[0, 1.35, 0]}>
          <group position={[0, -0.4, 0]}>
            <ArmPart side="left" onMeshRef={setMeshRef("leftArm")} />
          </group>
        </group>

        {/* Right arm pivot at shoulder */}
        <group ref={rightArmRef} position={[0, 1.35, 0]}>
          <group position={[0, -0.4, 0]}>
            <ArmPart side="right" onMeshRef={setMeshRef("rightArm")} />
          </group>
        </group>

        {/* Left leg pivot at hip */}
        <group ref={leftLegRef} position={[0, 0.45, 0]}>
          <group position={[0, -0.43, 0]}>
            <LegPart side="left" onMeshRef={setMeshRef("leftLeg")} />
          </group>
        </group>

        {/* Right leg pivot at hip */}
        <group ref={rightLegRef} position={[0, 0.45, 0]}>
          <group position={[0, -0.43, 0]}>
            <LegPart side="right" onMeshRef={setMeshRef("rightLeg")} />
          </group>
        </group>
      </group>
    </group>
  )
}
