import * as THREE from "three"

export type SpriteExportOptions = {
  frames: number
  columns: number
  cellWidth: number
  cellHeight: number
  scene: THREE.Scene
  camera: THREE.Camera
  renderCallback: (normalizedTime: number) => void
}

export async function exportSpriteSheet(
  options: SpriteExportOptions
): Promise<{ png: string; metadata: object }> {
  const { frames, columns, cellWidth, cellHeight, scene, camera, renderCallback } = options

  const rows = Math.ceil(frames / columns)
  const sheetWidth = columns * cellWidth
  const sheetHeight = rows * cellHeight

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  })
  renderer.setSize(cellWidth, cellHeight)
  renderer.setPixelRatio(1)
  renderer.setClearColor(0x000000, 0)

  const stitchCanvas = document.createElement("canvas")
  stitchCanvas.width = sheetWidth
  stitchCanvas.height = sheetHeight
  const ctx = stitchCanvas.getContext("2d")!

  for (let i = 0; i < frames; i++) {
    const normalizedTime = i / frames
    renderCallback(normalizedTime)

    renderer.render(scene, camera)

    const col = i % columns
    const row = Math.floor(i / columns)
    const x = col * cellWidth
    const y = row * cellHeight

    ctx.drawImage(renderer.domElement, x, y, cellWidth, cellHeight)
  }

  renderer.dispose()

  const png = stitchCanvas.toDataURL("image/png")

  const metadata = {
    frames,
    columns,
    rows,
    cellWidth,
    cellHeight,
    sheetWidth,
    sheetHeight,
  }

  return { png, metadata }
}

export function downloadPng(dataUrl: string, filename: string) {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function downloadJson(data: object, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
