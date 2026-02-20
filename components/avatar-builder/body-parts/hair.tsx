"use client"

import { useMemo } from "react"
import * as THREE from "three"
import { useAvatarStore } from "@/lib/avatar-store"

export function HairPart() {
  const variant = useAvatarStore((s) => s.selectedParts.hair)
  const color = useAvatarStore((s) => s.partColors.hair)

  const geometries = useMemo(() => {
    switch (variant) {
      case "spiky": {
        const spikes: { geo: THREE.BufferGeometry; pos: [number, number, number]; rot: [number, number, number] }[] = []
        for (let i = 0; i < 5; i++) {
          const angle = ((i - 2) * Math.PI) / 8
          const geo = new THREE.ConeGeometry(0.08, 0.3, 6)
          spikes.push({
            geo,
            pos: [Math.sin(angle) * 0.25, 2.2 + Math.cos(angle) * 0.1, 0],
            rot: [0, 0, angle * 0.5],
          })
        }
        return spikes
      }
      case "flat": {
        const geo = new THREE.BoxGeometry(0.75, 0.15, 0.7, 2, 2, 2)
        return [{ geo, pos: [0, 2.15, 0] as [number, number, number], rot: [0, 0, 0] as [number, number, number] }]
      }
      case "mohawk": {
        const pieces: { geo: THREE.BufferGeometry; pos: [number, number, number]; rot: [number, number, number] }[] = []
        for (let i = 0; i < 4; i++) {
          const geo = new THREE.BoxGeometry(0.06, 0.25 + i * 0.05, 0.5)
          pieces.push({
            geo,
            pos: [0, 2.15 + i * 0.06, -i * 0.02],
            rot: [0, 0, 0],
          })
        }
        return pieces
      }
      case "none":
      default:
        return []
    }
  }, [variant])

  if (variant === "none" || geometries.length === 0) return null

  return (
    <group userData={{ partSlot: "hair" }}>
      {geometries.map((item, i) => (
        <mesh key={i} geometry={item.geo} position={item.pos} rotation={item.rot}>
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}
