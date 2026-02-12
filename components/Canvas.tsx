// /components/Canvas.tsx
"use client"
import React, { useRef, useEffect } from 'react';

interface CanvasProps {
  canvasWidth: number;
  canvasHeight: number;
  brushColor: string;
  brushSize: number;
  brushShape: string;
  gridSize: number;
  snapToGrid: boolean;
  onChange: (canvas: any) => void;
}

// Forward ref to the canvas element
const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>(({
  canvasWidth,
  canvasHeight,
  brushColor,
  brushSize,
  brushShape,
  gridSize,
  snapToGrid,
  onChange,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // When the component mounts, we use the forwarded ref to point to the canvas element
  useEffect(() => {
    if (ref) {
      // @ts-ignore Ignore TypeScript error for ref forwarding
      ref.current = canvasRef.current;
    }
  }, [ref]);

  const handleDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const gridSizePixels = gridSize;
    const rect = canvas.getBoundingClientRect();
    const drawX = Math.floor((rect.left - canvas.offsetLeft) / gridSizePixels) * gridSizePixels;
    const drawY = Math.floor((rect.top - canvas.offsetTop) / gridSizePixels) * gridSizePixels;

    ctx?.beginPath();
    if (brushShape === 'circle') {
      ctx?.arc(drawX, drawY, brushSize, 0, Math.PI * 2);
    } else {
      ctx?.rect(drawX - brushSize / 2, drawY - brushSize / 2, brushSize, brushSize);
    }
    ctx!.fillStyle = brushColor;
    ctx?.fill();
    onChange(canvas);  // Notify parent about the canvas change
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseMove={handleDrawing}
        onMouseDown={handleDrawing}
        className="border"
      />
    </div>
  );
});

export default Canvas;
