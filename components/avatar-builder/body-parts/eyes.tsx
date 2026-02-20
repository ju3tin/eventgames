"use client"

import { useMemo } from "react"
import * as THREE from "three"
import { useAvatarStore } from "@/lib/avatar-store"

export function EyesPart() {
  const variant = useAvatarStore((s) => s.selectedParts.eyes)
  const color = useAvatarStore((s) => s.partColors.eyes)

  const eyeGeometry = useMemo(() => {
    switch (variant) {
      case "narrow":
        return new THREE.SphereGeometry(0.05, 8, 6).scale(1.2, 0.6, 0.8)
      case "large":
        return new THREE.SphereGeometry(0.08, 8, 6)
      case "round":
      default:
        return new THREE.SphereGeometry(0.06, 8, 6)
    }
  }, [variant])

  const pupilGeo = useMemo(() => new THREE.SphereGeometry(0.03, 6, 6), [])

  const spacing = variant === "large" ? 0.18 : 0.15

  return (
    <group position={[0, 1.9, 0.33]} userData={{ partSlot: "eyes" }}>
      {/* Left eye white */}
      <mesh geometry={eyeGeometry} position={[-spacing, 0, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Left pupil */}
      <mesh geometry={pupilGeo} position={[-spacing, 0, 0.04]}>
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      {/* Right eye white */}
      <mesh geometry={eyeGeometry} position={[spacing, 0, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Right pupil */}
      <mesh geometry={pupilGeo} position={[spacing, 0, 0.04]}>
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
    </group>
  )
}
