"use client"

import { useRef, useMemo } from "react"
import * as THREE from "three"
import { useAvatarStore } from "@/lib/avatar-store"

export function HeadPart({
  onMeshRef,
}: {
  onMeshRef?: (mesh: THREE.Mesh | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const variant = useAvatarStore((s) => s.selectedParts.head)
  const color = useAvatarStore((s) => s.partColors.head)
  const showWireframe = useAvatarStore((s) => s.showWireframe)
  const editMode = useAvatarStore((s) => s.editMode)
  const selectedPart = useAvatarStore((s) => s.selectedPartForEdit)

  const geometry = useMemo(() => {
    let geo: THREE.BufferGeometry
    switch (variant) {
      case "square":
        geo = new THREE.BoxGeometry(0.7, 0.75, 0.7, 4, 4, 4)
        break
      case "oval":
        geo = new THREE.SphereGeometry(0.38, 16, 12)
        geo.scale(1, 1.2, 0.9)
        break
      case "round":
      default:
        geo = new THREE.SphereGeometry(0.4, 16, 12)
        break
    }
    return geo
  }, [variant])

  const isSelected = editMode === "vertex" && selectedPart === "head"

  return (
    <mesh
      ref={(ref) => {
        meshRef.current = ref!
        onMeshRef?.(ref)
      }}
      geometry={geometry}
      position={[0, 1.85, 0]}
      userData={{ partSlot: "head" }}
    >
      <meshStandardMaterial
        color={color}
        wireframe={isSelected && showWireframe}
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  )
}
