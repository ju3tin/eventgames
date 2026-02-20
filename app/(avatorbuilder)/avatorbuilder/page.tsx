"use client"

import { useRef, useState, useCallback } from "react"
import type * as THREE from "three"
import { useAvatarStore, type EditMode } from "@/lib/avatar-store"
import { AvatarCanvas } from "@/components/avatar-builder/avatar-canvas"
import { PartsPanel } from "@/components/panels/parts-panel"
import { VertexPanel } from "@/components/panels/vertex-panel"
import { AnimationPanel } from "@/components/panels/animation-panel"
import { ExportPanel } from "@/components/panels/export-panel"
import { renderSpriteSheet } from "@/components/sprite-builder/sprite-renderer"
import { downloadPng } from "@/lib/sprite-export"
import { sceneRefs } from "@/lib/scene-refs"
import { Puzzle, PenTool, Play } from "lucide-react"

const MODE_TABS: { id: EditMode; label: string; icon: React.ReactNode }[] = [
  { id: "parts", label: "Parts", icon: <Puzzle className="h-4 w-4" /> },
  { id: "vertex", label: "Vertex", icon: <PenTool className="h-4 w-4" /> },
  { id: "animate", label: "Animate", icon: <Play className="h-4 w-4" /> },
]

export default function Page() {
  const meshRefs = useRef<Record<string, THREE.Mesh | null>>({})
  const editMode = useAvatarStore((s) => s.editMode)
  const setEditMode = useAvatarStore((s) => s.setEditMode)

  const [spritePreview, setSpritePreview] = useState<string | null>(null)

  const handleExport = useCallback(async () => {
    console.log("[v0] Export clicked. sceneRefs:", {
      scene: !!sceneRefs.scene,
      camera: !!sceneRefs.camera,
      avatarGroup: !!sceneRefs.avatarGroup,
    })
    const { scene, camera, avatarGroup } = sceneRefs
    if (!scene || !camera || !avatarGroup) {
      console.error("[v0] Scene refs not available for export. scene:", !!scene, "camera:", !!camera, "avatarGroup:", !!avatarGroup)
      return
    }

    const store = useAvatarStore.getState()
    store.setIsExporting(true)

    try {
      console.log("[v0] Starting renderSpriteSheet with:", {
        animationName: store.selectedAnimation,
        spriteSettings: store.spriteSettings,
        avatarGroupChildren: avatarGroup.children.length,
      })
      const result = await renderSpriteSheet({
        scene,
        camera,
        animationName: store.selectedAnimation,
        spriteSettings: store.spriteSettings,
        avatarGroup,
      })
      console.log("[v0] Sprite sheet rendered, dataUrl length:", result.dataUrl.length)

      setSpritePreview(result.dataUrl)
      downloadPng(result.dataUrl, `${store.selectedAnimation}-sprite-sheet.png`)
    } catch (error) {
      console.error("[v0] Export failed:", error)
    } finally {
      store.setIsExporting(false)
    }
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top header bar */}
      <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground font-mono">AV</span>
          </div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            Avatar Builder
          </h1>
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
            / Sprite Sheet Generator
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
          <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
            {editMode === "parts" && "Part Swap Mode"}
            {editMode === "vertex" && "Vertex Edit Mode"}
            {editMode === "animate" && "Animation Mode"}
          </span>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-72 flex flex-col border-r border-border bg-card shrink-0">
          {/* Mode tabs */}
          <div className="flex border-b border-border shrink-0">
            {MODE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setEditMode(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  editMode === tab.id
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {editMode === "parts" && <PartsPanel />}
            {editMode === "vertex" && <VertexPanel />}
            {editMode === "animate" && <AnimationPanel />}
          </div>
        </aside>

        {/* Center viewport + bottom export bar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 3D Canvas */}
          <AvatarCanvas meshRefs={meshRefs} />

          {/* Bottom export bar */}
          <ExportPanel onExport={handleExport} spritePreview={spritePreview} />
        </div>
      </div>
    </div>
  )
}
