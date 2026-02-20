"use client"

import { useRef, useState, useCallback, useMemo, useEffect } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useAvatarStore, type PartSlot } from "@/lib/avatar-store"

const HANDLE_SIZE = 0.025
const HANDLE_COLOR = "#f5b731"
const HANDLE_ACTIVE_COLOR = "#ffd666"
const MAX_VISIBLE_VERTICES = 200

export function VertexEditor({
  meshRefs,
}: {
  meshRefs: React.MutableRefObject<Record<string, THREE.Mesh | null>>
}) {
  const editMode = useAvatarStore((s) => s.editMode)
  const selectedPart = useAvatarStore((s) => s.selectedPartForEdit)
  const setVertexOffset = useAvatarStore((s) => s.setVertexOffset)
  const vertexOffsets = useAvatarStore((s) => s.vertexOffsets)

  const { camera, gl, raycaster } = useThree()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const planeRef = useRef(new THREE.Plane())
  const intersectPoint = useRef(new THREE.Vector3())
  const dragOffset = useRef(new THREE.Vector3())
  const handleGroupRef = useRef<THREE.Group>(null!)

  const mesh = selectedPart ? meshRefs.current[selectedPart] : null

  const vertexPositions = useMemo(() => {
    if (!mesh || !mesh.geometry) return []
    const posAttr = mesh.geometry.getAttribute("position")
    if (!posAttr) return []

    const positions: THREE.Vector3[] = []
    const step = Math.max(1, Math.floor(posAttr.count / MAX_VISIBLE_VERTICES))

    for (let i = 0; i < posAttr.count; i += step) {
      const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
      // Transform to world space
      v.applyMatrix4(mesh.matrixWorld)
      positions.push(v)
    }
    return positions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesh, mesh?.geometry, selectedPart])

  // Apply stored vertex offsets when part changes
  useEffect(() => {
    if (!mesh || !selectedPart) return
    const key = `${selectedPart}-${useAvatarStore.getState().selectedParts[selectedPart]}`
    const offsets = vertexOffsets[key]
    if (!offsets) return

    const posAttr = mesh.geometry.getAttribute("position")
    if (!posAttr) return

    const step = Math.max(1, Math.floor(posAttr.count / MAX_VISIBLE_VERTICES))

    for (let handleIdx = 0; handleIdx < offsets.length / 3; handleIdx++) {
      const vertIdx = handleIdx * step
      if (vertIdx >= posAttr.count) break
      posAttr.setXYZ(
        vertIdx,
        offsets[handleIdx * 3],
        offsets[handleIdx * 3 + 1],
        offsets[handleIdx * 3 + 2]
      )
    }
    posAttr.needsUpdate = true
    mesh.geometry.computeVertexNormals()
  }, [mesh, selectedPart, vertexOffsets])

  const handlePointerDown = useCallback(
    (index: number, event: THREE.Event & { stopPropagation: () => void }) => {
      event.stopPropagation()
      if (!mesh) return

      setDragIndex(index)

      const handlePos = vertexPositions[index]
      if (!handlePos) return

      // Create drag plane facing the camera
      const cameraDir = new THREE.Vector3()
      camera.getWorldDirection(cameraDir)
      planeRef.current.setFromNormalAndCoplanarPoint(cameraDir.negate(), handlePos)

      raycaster.setFromCamera(
        getNDC(event as unknown as PointerEvent, gl.domElement),
        camera
      )
      raycaster.ray.intersectPlane(planeRef.current, intersectPoint.current)
      dragOffset.current.subVectors(handlePos, intersectPoint.current)

      gl.domElement.style.cursor = "grabbing"
    },
    [mesh, vertexPositions, camera, gl, raycaster]
  )

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (dragIndex === null || !mesh) return

      raycaster.setFromCamera(getNDC(event, gl.domElement), camera)
      raycaster.ray.intersectPlane(planeRef.current, intersectPoint.current)

      const newPos = intersectPoint.current.clone().add(dragOffset.current)

      // Transform back to local space
      const invMatrix = new THREE.Matrix4().copy(mesh.matrixWorld).invert()
      const localPos = newPos.clone().applyMatrix4(invMatrix)

      const posAttr = mesh.geometry.getAttribute("position")
      const step = Math.max(1, Math.floor(posAttr.count / MAX_VISIBLE_VERTICES))
      const vertIdx = dragIndex * step

      if (vertIdx < posAttr.count) {
        posAttr.setXYZ(vertIdx, localPos.x, localPos.y, localPos.z)
        posAttr.needsUpdate = true
        mesh.geometry.computeVertexNormals()

        // Store offsets
        if (selectedPart) {
          const key = `${selectedPart}-${useAvatarStore.getState().selectedParts[selectedPart as PartSlot]}`
          const offsets: number[] = []
          for (let i = 0; i < Math.ceil(posAttr.count / step); i++) {
            const vi = i * step
            if (vi >= posAttr.count) break
            offsets.push(posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi))
          }
          setVertexOffset(key, offsets)
        }
      }
    },
    [dragIndex, mesh, camera, gl, raycaster, selectedPart, setVertexOffset]
  )

  const handlePointerUp = useCallback(() => {
    setDragIndex(null)
    gl.domElement.style.cursor = "auto"
  }, [gl])

  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener("pointermove", handlePointerMove)
    canvas.addEventListener("pointerup", handlePointerUp)
    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove)
      canvas.removeEventListener("pointerup", handlePointerUp)
    }
  }, [gl, handlePointerMove, handlePointerUp])

  // Update handle positions each frame
  useFrame(() => {
    if (!mesh || !handleGroupRef.current) return

    const posAttr = mesh.geometry.getAttribute("position")
    if (!posAttr) return

    const step = Math.max(1, Math.floor(posAttr.count / MAX_VISIBLE_VERTICES))

    handleGroupRef.current.children.forEach((child, idx) => {
      const vertIdx = idx * step
      if (vertIdx >= posAttr.count) return

      const v = new THREE.Vector3(
        posAttr.getX(vertIdx),
        posAttr.getY(vertIdx),
        posAttr.getZ(vertIdx)
      )
      v.applyMatrix4(mesh.matrixWorld)
      child.position.copy(v)
    })
  })

  if (editMode !== "vertex" || !selectedPart || !mesh || vertexPositions.length === 0) {
    return null
  }

  return (
    <group ref={handleGroupRef}>
      {vertexPositions.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          onPointerDown={(e) => handlePointerDown(i, e)}
          onPointerEnter={() => setHoverIndex(i)}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <sphereGeometry args={[HANDLE_SIZE, 6, 6]} />
          <meshBasicMaterial
            color={
              dragIndex === i
                ? HANDLE_ACTIVE_COLOR
                : hoverIndex === i
                ? HANDLE_ACTIVE_COLOR
                : HANDLE_COLOR
            }
            transparent
            opacity={dragIndex === i ? 1 : 0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

function getNDC(event: PointerEvent | { clientX: number; clientY: number }, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  return new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  )
}
