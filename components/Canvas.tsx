// /components/Canvas.tsx
import { useRef, useEffect } from 'react';

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

const Canvas = ({
  canvasWidth,
  canvasHeight,
  brushColor,
  brushSize,
  brushShape,
  gridSize,
  snapToGrid,
  onChange,
}: CanvasProps) => {
  const canvasRef = useRef<any>(null);

  const handleDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.drawing.getContext('2d');
    const gridSizePixels = gridSize;
    const rect = canvas.drawing.getBoundingClientRect();
    const drawX = Math.floor((rect.left - canvas.offsetLeft) / gridSizePixels) * gridSizePixels;
    const drawY = Math.floor((rect.top - canvas.offsetTop) / gridSizePixels) * gridSizePixels;

    ctx.beginPath();
    if (brushShape === 'circle') {
      ctx.arc(drawX, drawY, brushSize, 0, Math.PI * 2);
    } else {
      ctx.rect(drawX - brushSize / 2, drawY - brushSize / 2, brushSize, brushSize);
    }
    ctx.fillStyle = brushColor;
    ctx.fill();
    onChange(canvas);  // Notify parent about the canvas change
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseMove={handleDrawing}
        onMouseDown={handleDrawing}
      />
    </div>
  );
};

export default Canvas;
