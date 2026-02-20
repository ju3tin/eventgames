"use client"

import { useRef, useMemo } from "react"
import * as THREE from "three"
import { useAvatarStore } from "@/lib/avatar-store"

export function TorsoPart({
  onMeshRef,
}: {
  onMeshRef?: (mesh: THREE.Mesh | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const variant = useAvatarStore((s) => s.selectedParts.torso)
  const color = useAvatarStore((s) => s.partColors.torso)
  const showWireframe = useAvatarStore((s) => s.showWireframe)
  const editMode = useAvatarStore((s) => s.editMode)
  const selectedPart = useAvatarStore((s) => s.selectedPartForEdit)

  const geometry = useMemo(() => {
    let geo: THREE.BufferGeometry
    switch (variant) {
      case "athletic":
        geo = new THREE.BoxGeometry(0.85, 1.0, 0.5, 4, 6, 4)
        break
      case "broad":
        geo = new THREE.BoxGeometry(1.1, 0.9, 0.55, 4, 6, 4)
        break
      case "standard":
      default:
        geo = new THREE.BoxGeometry(0.9, 1.0, 0.5, 4, 6, 4)
        break
    }
    return geo
  }, [variant])

  const isSelected = editMode === "vertex" && selectedPart === "torso"

  return (
    <mesh
      ref={(ref) => {
        meshRef.current = ref!
        onMeshRef?.(ref)
      }}
      geometry={geometry}
      position={[0, 0.95, 0]}
      userData={{ partSlot: "torso" }}
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
