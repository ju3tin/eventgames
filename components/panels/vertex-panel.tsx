"use client"

import { useAvatarStore, type PartSlot } from "@/lib/avatar-store"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

const EDITABLE_PARTS: { slot: PartSlot; label: string }[] = [
  { slot: "head", label: "Head" },
  { slot: "torso", label: "Torso" },
  { slot: "leftArm", label: "Left Arm" },
  { slot: "rightArm", label: "Right Arm" },
  { slot: "leftLeg", label: "Left Leg" },
  { slot: "rightLeg", label: "Right Leg" },
]

export function VertexPanel() {
  const selectedPart = useAvatarStore((s) => s.selectedPartForEdit)
  const setSelectedPartForEdit = useAvatarStore((s) => s.setSelectedPartForEdit)
  const showWireframe = useAvatarStore((s) => s.showWireframe)
  const setShowWireframe = useAvatarStore((s) => s.setShowWireframe)
  const resetVertexOffsets = useAvatarStore((s) => s.resetVertexOffsets)
  const selectedParts = useAvatarStore((s) => s.selectedParts)

  const handleReset = () => {
    if (!selectedPart) return
    const key = `${selectedPart}-${selectedParts[selectedPart]}`
    resetVertexOffsets(key)
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Vertex Editor
          </h3>
          <p className="text-xs text-muted-foreground">
            Select a body part, then drag vertex handles to sculpt.
          </p>
        </div>

        <div className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
          <span className="text-sm text-secondary-foreground">Wireframe</span>
          <Switch checked={showWireframe} onCheckedChange={setShowWireframe} />
        </div>

        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Select Part
          </h4>
          <div className="flex flex-col gap-1.5">
            {EDITABLE_PARTS.map(({ slot, label }) => (
              <Button
                key={slot}
                variant={selectedPart === slot ? "default" : "ghost"}
                size="sm"
                className="justify-start text-sm h-9"
                onClick={() =>
                  setSelectedPartForEdit(
                    selectedPart === slot ? null : slot
                  )
                }
              >
                <span
                  className="w-2 h-2 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      selectedPart === slot
                        ? "hsl(var(--handle))"
                        : "hsl(var(--muted-foreground))",
                  }}
                />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {selectedPart && (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Editing:{" "}
                {EDITABLE_PARTS.find((p) => p.slot === selectedPart)?.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Drag the yellow vertex handles in the viewport to reshape the geometry.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="mt-1"
              onClick={handleReset}
            >
              Reset Vertices
            </Button>
          </div>
        )}

        {!selectedPart && (
          <div className="border border-dashed border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Click a body part in the viewport or select one from the list above
              to start editing vertices.
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
