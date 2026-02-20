"use client"

import { useCallback, useRef, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import * as THREE from "three"
import { AvatarModel } from "./avatar-model"
import { VertexEditor } from "./vertex-editor"
import { useAvatarStore, type PartSlot } from "@/lib/avatar-store"
import { sceneRefs } from "@/lib/scene-refs"

/**
 * Captures the R3F scene + camera into our shared module-level refs
 * so the sprite export logic can access them from outside the Canvas.
 */
function SceneCapture({ avatarGroupRef }: { avatarGroupRef: React.RefObject<THREE.Group | null> }) {
  const { scene, camera } = useThree()
  useEffect(() => {
    sceneRefs.scene = scene
    sceneRefs.camera = camera as THREE.PerspectiveCamera
    return () => {
      sceneRefs.scene = null
      sceneRefs.camera = null
    }
  }, [scene, camera])

  useEffect(() => {
    sceneRefs.avatarGroup = avatarGroupRef.current
  })

  return null
}

function SceneContent({
  meshRefs,
}: {
  meshRefs: React.MutableRefObject<Record<string, THREE.Mesh | null>>
}) {
  const editMode = useAvatarStore((s) => s.editMode)
  const setSelectedPartForEdit = useAvatarStore((s) => s.setSelectedPartForEdit)
  const avatarGroupRef = useRef<THREE.Group>(null)

  const handleClick = useCallback(
    (event: THREE.Event & { object: THREE.Object3D; stopPropagation: () => void }) => {
      if (editMode !== "vertex") return

      let obj: THREE.Object3D | null = event.object
      while (obj) {
        if (obj.userData?.partSlot) {
          setSelectedPartForEdit(obj.userData.partSlot as PartSlot)
          event.stopPropagation()
          return
        }
        obj = obj.parent
      }
    },
    [editMode, setSelectedPartForEdit]
  )

  return (
    <>
      <SceneCapture avatarGroupRef={avatarGroupRef} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />

      <group ref={avatarGroupRef} onClick={handleClick}>
        <AvatarModel meshRefs={meshRefs} />
      </group>

      <VertexEditor meshRefs={meshRefs} />

      <Grid
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#1a2332"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#253547"
        fadeDistance={12}
        fadeStrength={1}
        position={[0, -0.42, 0]}
      />

      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={1.5}
        maxDistance={8}
        target={[0, 1, 0]}
      />
    </>
  )
}

export function AvatarCanvas({
  meshRefs,
}: {
  meshRefs: React.MutableRefObject<Record<string, THREE.Mesh | null>>
}) {
  return (
    <div className="flex-1 relative" style={{ background: "hsl(220 20% 6%)" }}>
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0c1018", 1)
        }}
      >
        <SceneContent meshRefs={meshRefs} />
      </Canvas>

      {/* Viewport overlay info */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <span className="bg-card/80 px-2 py-1 rounded">
          Scroll to zoom | Drag to orbit | Right-click to pan
        </span>
      </div>
    </div>
  )
}
