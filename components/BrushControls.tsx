// /components/BrushControls.tsx
interface BrushControlsProps {
  brushColor: string;
  setBrushColor: React.Dispatch<React.SetStateAction<string>>;
  brushSize: number;
  setBrushSize: React.Dispatch<React.SetStateAction<number>>;
  brushShape: string;
  setBrushShape: React.Dispatch<React.SetStateAction<string>>;
}

const BrushControls = ({
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  brushShape,
  setBrushShape,
}: BrushControlsProps) => {
  return (
    <div>
      <label>Brush Size: </label>
      <input
        type="number"
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
        min="1"
        max="10"
      />
      <label>Brush Color: </label>
      <input
        type="color"
        value={brushColor}
        onChange={(e) => setBrushColor(e.target.value)}
      />
      <label>Brush Shape: </label>
      <select value={brushShape} onChange={(e) => setBrushShape(e.target.value)}>
        <option value="circle">Circle</option>
        <option value="square">Square</option>
      </select>
    </div>
  );
};

export default BrushControls;
