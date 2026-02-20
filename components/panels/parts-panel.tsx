"use client"

import {
  useAvatarStore,
  PART_VARIANTS,
  type PartSlot,
} from "@/lib/avatar-store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const SLOT_LABELS: Record<PartSlot, string> = {
  head: "Head",
  torso: "Torso",
  leftArm: "Left Arm",
  rightArm: "Right Arm",
  leftLeg: "Left Leg",
  rightLeg: "Right Leg",
  hair: "Hair",
  eyes: "Eyes",
}

const SLOT_ICONS: Record<PartSlot, string> = {
  head: "H",
  torso: "T",
  leftArm: "LA",
  rightArm: "RA",
  leftLeg: "LL",
  rightLeg: "RL",
  hair: "Hr",
  eyes: "Ey",
}

export function PartsPanel() {
  const selectedParts = useAvatarStore((s) => s.selectedParts)
  const setPartVariant = useAvatarStore((s) => s.setPartVariant)
  const partColors = useAvatarStore((s) => s.partColors)
  const setPartColor = useAvatarStore((s) => s.setPartColor)

  const slotOrder: PartSlot[] = [
    "hair",
    "head",
    "eyes",
    "torso",
    "leftArm",
    "rightArm",
    "leftLeg",
    "rightLeg",
  ]

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Body Parts
          </h3>
        </div>

        {slotOrder.map((slot) => (
          <div key={slot} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-secondary flex items-center justify-center text-xs font-mono font-bold text-secondary-foreground">
                  {SLOT_ICONS[slot]}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {SLOT_LABELS[slot]}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <label
                  className="w-6 h-6 rounded-full border border-border cursor-pointer overflow-hidden relative"
                  title={`${SLOT_LABELS[slot]} color`}
                >
                  <input
                    type="color"
                    value={partColors[slot]}
                    onChange={(e) => setPartColor(slot, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: partColors[slot] }}
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PART_VARIANTS[slot].map((variant) => (
                <Button
                  key={variant.id}
                  variant={
                    selectedParts[slot] === variant.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setPartVariant(slot, variant.id)}
                  className="text-xs h-7 px-2.5"
                >
                  {variant.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
