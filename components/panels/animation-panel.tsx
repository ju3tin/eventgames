"use client"

import { useAvatarStore, type AnimationName } from "@/lib/avatar-store"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause } from "lucide-react"

const ANIMATION_LIST: { id: AnimationName; label: string; desc: string }[] = [
  { id: "idle", label: "Idle", desc: "Gentle breathing motion" },
  { id: "walk", label: "Walk", desc: "Walking cycle" },
  { id: "run", label: "Run", desc: "Running cycle" },
  { id: "jump", label: "Jump", desc: "Jump sequence" },
]

export function AnimationPanel() {
  const selectedAnimation = useAvatarStore((s) => s.selectedAnimation)
  const setSelectedAnimation = useAvatarStore((s) => s.setSelectedAnimation)
  const isPlaying = useAvatarStore((s) => s.isPlaying)
  const setIsPlaying = useAvatarStore((s) => s.setIsPlaying)
  const animationSpeed = useAvatarStore((s) => s.animationSpeed)
  const setAnimationSpeed = useAvatarStore((s) => s.setAnimationSpeed)

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Animations
          </h3>
          <p className="text-xs text-muted-foreground">
            Preview animations and configure sprite sheet export.
          </p>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">
              Speed: {animationSpeed.toFixed(1)}x
            </div>
            <Slider
              min={0.1}
              max={3}
              step={0.1}
              value={[animationSpeed]}
              onValueChange={([v]) => setAnimationSpeed(v)}
            />
          </div>
        </div>

        {/* Animation list */}
        <div className="flex flex-col gap-1.5">
          {ANIMATION_LIST.map((anim) => (
            <button
              key={anim.id}
              onClick={() => setSelectedAnimation(anim.id)}
              className={`flex flex-col gap-0.5 text-left px-3 py-2.5 rounded-lg transition-colors ${
                selectedAnimation === anim.id
                  ? "bg-primary/10 border border-primary/30 text-foreground"
                  : "bg-secondary/50 border border-transparent text-secondary-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-sm font-medium">{anim.label}</span>
              <span className="text-xs text-muted-foreground">{anim.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
