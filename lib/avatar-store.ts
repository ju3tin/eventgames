import { create } from "zustand"

export type EditMode = "parts" | "vertex" | "animate"

export type PartSlot =
  | "head"
  | "torso"
  | "leftArm"
  | "rightArm"
  | "leftLeg"
  | "rightLeg"
  | "hair"
  | "eyes"

export type PartVariant = {
  id: string
  label: string
}

export const PART_VARIANTS: Record<PartSlot, PartVariant[]> = {
  head: [
    { id: "round", label: "Round" },
    { id: "square", label: "Square" },
    { id: "oval", label: "Oval" },
  ],
  torso: [
    { id: "standard", label: "Standard" },
    { id: "athletic", label: "Athletic" },
    { id: "broad", label: "Broad" },
  ],
  leftArm: [
    { id: "standard", label: "Standard" },
    { id: "thick", label: "Thick" },
    { id: "thin", label: "Thin" },
  ],
  rightArm: [
    { id: "standard", label: "Standard" },
    { id: "thick", label: "Thick" },
    { id: "thin", label: "Thin" },
  ],
  leftLeg: [
    { id: "standard", label: "Standard" },
    { id: "thick", label: "Thick" },
    { id: "thin", label: "Thin" },
  ],
  rightLeg: [
    { id: "standard", label: "Standard" },
    { id: "thick", label: "Thick" },
    { id: "thin", label: "Thin" },
  ],
  hair: [
    { id: "none", label: "None" },
    { id: "spiky", label: "Spiky" },
    { id: "flat", label: "Flat Top" },
    { id: "mohawk", label: "Mohawk" },
  ],
  eyes: [
    { id: "round", label: "Round" },
    { id: "narrow", label: "Narrow" },
    { id: "large", label: "Large" },
  ],
}

export type SpriteSettings = {
  frames: number
  columns: number
  cellWidth: number
  cellHeight: number
}

export type AnimationName = "idle" | "walk" | "run" | "jump"

interface AvatarState {
  editMode: EditMode
  selectedParts: Record<PartSlot, string>
  partColors: Record<PartSlot, string>
  selectedPartForEdit: PartSlot | null
  vertexOffsets: Record<string, number[]>
  showWireframe: boolean
  selectedAnimation: AnimationName
  isPlaying: boolean
  animationSpeed: number
  spriteSettings: SpriteSettings
  isExporting: boolean

  setEditMode: (mode: EditMode) => void
  setPartVariant: (slot: PartSlot, variantId: string) => void
  setPartColor: (slot: PartSlot, color: string) => void
  setSelectedPartForEdit: (slot: PartSlot | null) => void
  setVertexOffset: (partKey: string, offsets: number[]) => void
  resetVertexOffsets: (partKey: string) => void
  setShowWireframe: (show: boolean) => void
  setSelectedAnimation: (name: AnimationName) => void
  setIsPlaying: (playing: boolean) => void
  setAnimationSpeed: (speed: number) => void
  setSpriteSettings: (settings: Partial<SpriteSettings>) => void
  setIsExporting: (exporting: boolean) => void
}

export const useAvatarStore = create<AvatarState>((set) => ({
  editMode: "parts",
  selectedParts: {
    head: "round",
    torso: "standard",
    leftArm: "standard",
    rightArm: "standard",
    leftLeg: "standard",
    rightLeg: "standard",
    hair: "spiky",
    eyes: "round",
  },
  partColors: {
    head: "#e8b87a",
    torso: "#3b82f6",
    leftArm: "#e8b87a",
    rightArm: "#e8b87a",
    leftLeg: "#4a5568",
    rightLeg: "#4a5568",
    hair: "#4a2810",
    eyes: "#1a1a2e",
  },
  selectedPartForEdit: null,
  vertexOffsets: {},
  showWireframe: false,
  selectedAnimation: "idle",
  isPlaying: true,
  animationSpeed: 1,
  spriteSettings: {
    frames: 8,
    columns: 4,
    cellWidth: 128,
    cellHeight: 128,
  },
  isExporting: false,

  setEditMode: (mode) => set({ editMode: mode }),
  setPartVariant: (slot, variantId) =>
    set((state) => ({
      selectedParts: { ...state.selectedParts, [slot]: variantId },
    })),
  setPartColor: (slot, color) =>
    set((state) => ({
      partColors: { ...state.partColors, [slot]: color },
    })),
  setSelectedPartForEdit: (slot) => set({ selectedPartForEdit: slot }),
  setVertexOffset: (partKey, offsets) =>
    set((state) => ({
      vertexOffsets: { ...state.vertexOffsets, [partKey]: offsets },
    })),
  resetVertexOffsets: (partKey) =>
    set((state) => {
      const next = { ...state.vertexOffsets }
      delete next[partKey]
      return { vertexOffsets: next }
    }),
  setShowWireframe: (show) => set({ showWireframe: show }),
  setSelectedAnimation: (name) => set({ selectedAnimation: name }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  setSpriteSettings: (settings) =>
    set((state) => ({
      spriteSettings: { ...state.spriteSettings, ...settings },
    })),
  setIsExporting: (exporting) => set({ isExporting: exporting }),
}))
