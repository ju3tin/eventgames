// /components/ExportControls.tsx
interface ExportControlsProps {
  canvasRef: any;
  spriteName: string;
  savedSprites: string[];
  exportAnimationJson: () => void;
}

const ExportControls = ({
  canvasRef,
  spriteName,
  savedSprites,
  exportAnimationJson,
}: ExportControlsProps) => {
  const handleExport = () => {
    const data = canvasRef.current.toDataURL();
    const link = document.createElement('a');
    link.href = data;
    link.download = `${spriteName}_sprite_sheet.png`;
    link.click();
  };

  const handleExportSection = (x: number, y: number, width: number, height: number) => {
    const canvas = canvasRef.current.drawing;
    const ctx = canvas.getContext('2d');
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    croppedCtx?.drawImage(canvas, x, y, width, height, 0, 0, width, height);

    const dataURL = croppedCanvas.toDataURL();
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${spriteName}_section.png`;
    link.click();
  };

  return (
    <div>
      <button onClick={handleExport}>Export Sprite Sheet</button>
      <button onClick={() => handleExportSection(0, 0, 32, 32)}>
        Export Section (32x32)
      </button>
      <button onClick={exportAnimationJson}>Export Animation JSON</button>
    </div>
  );
};

export default ExportControls;
