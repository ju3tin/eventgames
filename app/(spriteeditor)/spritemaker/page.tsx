// /pages/index.tsx
"use client"
import { useState, useEffect, useRef } from 'react';
import Canvas from '@/components/Canvas';
import AnimationControls from '@/components/AnimationControls';
import ExportControls from '@/components/ExportControls';
import BrushControls from '@/components/BrushControls';

const SpriteEditor = () => {
  const [canvasWidth, setCanvasWidth] = useState(256);
  const [canvasHeight, setCanvasHeight] = useState(256);
  const [spriteName, setSpriteName] = useState('Sprite 1');
  const [brushSize, setBrushSize] = useState(5);
  const [gridSize, setGridSize] = useState(16);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushShape, setBrushShape] = useState('circle');
  const [savedSprites, setSavedSprites] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [loop, setLoop] = useState(true);

  const canvasRef = useRef<any>(null);

  const handleSave = () => {
    const data = canvasRef.current.toDataURL();
    setSavedSprites((prev) => [...prev, data]);
  };

  const exportAnimationJson = () => {
    const animationData = savedSprites.map((spriteData, index) => ({
      frame: index,
      spriteData,
    }));
    const json = JSON.stringify(animationData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${spriteName}_animation.json`;
    link.click();
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Sprite Editor</h1>
      <input
        type="text"
        value={spriteName}
        onChange={(e) => setSpriteName(e.target.value)}
        placeholder="Enter sprite name"
      />

      <BrushControls
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        brushShape={brushShape}
        setBrushShape={setBrushShape}
      />

      <Canvas
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        brushColor={brushColor}
        brushSize={brushSize}
        brushShape={brushShape}
        gridSize={gridSize}
        snapToGrid={snapToGrid}
        onChange={handleSave}
        ref={canvasRef}
      />

      <ExportControls
        canvasRef={canvasRef}
        spriteName={spriteName}
        savedSprites={savedSprites}
        exportAnimationJson={exportAnimationJson}
      />

      <AnimationControls
        isAnimating={isAnimating}
        setIsAnimating={setIsAnimating}
        speed={speed}
        setSpeed={setSpeed}
        loop={loop}
        setLoop={setLoop}
      />
    </div>
  );
};

export default SpriteEditor;
