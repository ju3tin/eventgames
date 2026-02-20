"use client"

import { useRef, useMemo } from "react"
import * as THREE from "three"
import { useAvatarStore, type PartSlot } from "@/lib/avatar-store"

export function LegPart({
  side,
  onMeshRef,
}: {
  side: "left" | "right"
  onMeshRef?: (mesh: THREE.Mesh | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const slot: PartSlot = side === "left" ? "leftLeg" : "rightLeg"
  const variant = useAvatarStore((s) => s.selectedParts[slot])
  const color = useAvatarStore((s) => s.partColors[slot])
  const showWireframe = useAvatarStore((s) => s.showWireframe)
  const editMode = useAvatarStore((s) => s.editMode)
  const selectedPart = useAvatarStore((s) => s.selectedPartForEdit)

  const geometry = useMemo(() => {
    let radius = 0.14
    let height = 0.85
    switch (variant) {
      case "thick":
        radius = 0.18
        height = 0.8
        break
      case "thin":
        radius = 0.1
        height = 0.9
        break
    }
    return new THREE.CylinderGeometry(radius, radius * 0.95, height, 8, 4)
  }, [variant])

  const xPos = side === "left" ? -0.22 : 0.22
  const isSelected = editMode === "vertex" && selectedPart === slot

  return (
    <mesh
      ref={(ref) => {
        meshRef.current = ref!
        onMeshRef?.(ref)
      }}
      geometry={geometry}
      position={[xPos, 0.02, 0]}
      userData={{ partSlot: slot }}
    >
      <meshStandardMaterial
        color={color}
        wireframe={isSelected && showWireframe}
        roughness={0.7}
        metalness={0.05}
      />
    </mesh>
  )
}
