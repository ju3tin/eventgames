// /components/AnimationControls.tsx
interface AnimationControlsProps {
  isAnimating: boolean;
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>;
  speed: number;
  setSpeed: React.Dispatch<React.SetStateAction<number>>;
  loop: boolean;
  setLoop: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnimationControls = ({
  isAnimating,
  setIsAnimating,
  speed,
  setSpeed,
  loop,
  setLoop,
}: AnimationControlsProps) => {
  return (
    <div>
      <button onClick={() => setIsAnimating(!isAnimating)}>
        {isAnimating ? 'Pause' : 'Play'}
      </button>
      <div>
        <label>Animation Speed: </label>
        <input
          type="range"
          min="100"
          max="1000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
        <span>{speed}ms</span>
      </div>
      <label>
        Loop Animation:
        <input
          type="checkbox"
          checked={loop}
          onChange={() => setLoop(!loop)}
        />
      </label>
    </div>
  );
};

export default AnimationControls;
