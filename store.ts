import { create } from 'zustand';
import { Vector3 } from 'three';

// Game Constants
export const LANE_WIDTH = 4.0; // Increased from 2.5
export const PLAYER_SPEED_INITIAL = 20; // Slightly faster to match scale
export const JUMP_HEIGHT = 4.5; // Slightly higher jump for scale, but trains will be taller
export const JUMP_DURATION = 0.7; 
export const SLIDE_DURATION = 0.8;

// Physics Derived Constants
export const GRAVITY = (8 * JUMP_HEIGHT) / (JUMP_DURATION * JUMP_DURATION);
export const JUMP_FORCE = (4 * JUMP_HEIGHT) / JUMP_DURATION;

// Mutable Global Refs
export const playerPositionRef = { current: new Vector3(0, 0, 0) };
export const groundHeightRef = { current: 0 }; 
export const cameraShakeRef = { current: 0 }; // Strength of shake
export const particleSystemRef = { current: { emit: (pos: Vector3, type: 'coin' | 'crash') => {} } };

interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  coins: number;
  speed: number;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  incrementScore: (delta: number) => void;
  collectCoin: () => void;
  increaseSpeed: () => void;
  triggerShake: (intensity: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPlaying: false,
  isGameOver: false,
  score: 0,
  coins: 0,
  speed: PLAYER_SPEED_INITIAL,

  startGame: () => {
    playerPositionRef.current.set(0, 0, 0);
    groundHeightRef.current = 0;
    cameraShakeRef.current = 0;
    set({ isPlaying: true, isGameOver: false, score: 0, coins: 0, speed: PLAYER_SPEED_INITIAL });
  },
  endGame: () => set({ isPlaying: false, isGameOver: true }),
  resetGame: () => {
    playerPositionRef.current.set(0, 0, 0);
    groundHeightRef.current = 0;
    cameraShakeRef.current = 0;
    set({ isPlaying: false, isGameOver: false, score: 0, coins: 0, speed: PLAYER_SPEED_INITIAL });
  },
  incrementScore: (delta) => set((state) => ({ score: state.score + delta })),
  collectCoin: () => set((state) => ({ coins: state.coins + 1, score: state.score + 50 })), // More score per coin
  increaseSpeed: () => set((state) => ({ speed: state.speed + 0.0001 })),
  triggerShake: (intensity) => {
    cameraShakeRef.current = intensity;
  }
}));