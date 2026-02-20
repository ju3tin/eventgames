"use client"

import { useAvatarStore } from "@/lib/avatar-store"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Download, Image, FileJson } from "lucide-react"

export function ExportPanel({
  onExport,
  spritePreview,
}: {
  onExport: () => void
  spritePreview: string | null
}) {
  const spriteSettings = useAvatarStore((s) => s.spriteSettings)
  const setSpriteSettings = useAvatarStore((s) => s.setSpriteSettings)
  const isExporting = useAvatarStore((s) => s.isExporting)
  const selectedAnimation = useAvatarStore((s) => s.selectedAnimation)

  return (
    <div className="border-t border-border bg-card">
      <div className="flex items-start gap-6 p-4">
        {/* Settings */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sprite Sheet Export
            </h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">
              {selectedAnimation}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Frames: {spriteSettings.frames}
              </label>
              <Slider
                min={4}
                max={32}
                step={1}
                value={[spriteSettings.frames]}
                onValueChange={([v]) => setSpriteSettings({ frames: v })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Columns: {spriteSettings.columns}
              </label>
              <Slider
                min={2}
                max={8}
                step={1}
                value={[spriteSettings.columns]}
                onValueChange={([v]) => setSpriteSettings({ columns: v })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Cell Width: {spriteSettings.cellWidth}px
              </label>
              <Slider
                min={32}
                max={512}
                step={32}
                value={[spriteSettings.cellWidth]}
                onValueChange={([v]) => setSpriteSettings({ cellWidth: v })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Cell Height: {spriteSettings.cellHeight}px
              </label>
              <Slider
                min={32}
                max={512}
                step={32}
                value={[spriteSettings.cellHeight]}
                onValueChange={([v]) => setSpriteSettings({ cellHeight: v })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-muted-foreground">
              Sheet:{" "}
              {spriteSettings.columns * spriteSettings.cellWidth}x
              {Math.ceil(spriteSettings.frames / spriteSettings.columns) *
                spriteSettings.cellHeight}
              px
            </span>
          </div>
        </div>

        {/* Preview + Actions */}
        <div className="flex flex-col items-center gap-2 min-w-[160px]">
          {spritePreview ? (
            <div className="w-32 h-32 bg-secondary rounded-lg overflow-hidden border border-border flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spritePreview}
                alt="Sprite sheet preview"
                className="max-w-full max-h-full object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          ) : (
            <div className="w-32 h-32 bg-secondary rounded-lg border border-dashed border-border flex items-center justify-center">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={onExport}
              disabled={isExporting}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              {isExporting ? "Exporting..." : "Export PNG"}
            </Button>
            {spritePreview && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const { spriteSettings: s, selectedAnimation: anim } =
                    useAvatarStore.getState()
                  const rows = Math.ceil(s.frames / s.columns)
                  const meta = {
                    animation: anim,
                    frames: s.frames,
                    columns: s.columns,
                    rows,
                    cellWidth: s.cellWidth,
                    cellHeight: s.cellHeight,
                    sheetWidth: s.columns * s.cellWidth,
                    sheetHeight: rows * s.cellHeight,
                  }
                  const blob = new Blob([JSON.stringify(meta, null, 2)], {
                    type: "application/json",
                  })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement("a")
                  link.href = url
                  link.download = `${anim}-sprite-meta.json`
                  link.click()
                  URL.revokeObjectURL(url)
                }}
              >
                <FileJson className="h-3 w-3 mr-1" />
                JSON
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
