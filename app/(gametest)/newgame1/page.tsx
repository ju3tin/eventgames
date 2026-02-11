'use client'
import React, { useEffect } from 'react';
import { Game } from '@/components/Game';
import { useGameStore } from '@/store';
import { Coins, Trophy, Play, RotateCcw } from 'lucide-react';
import { audioManager } from '@/utils/audio';

const App = () => {
  const { score, coins, isPlaying, isGameOver, startGame, resetGame } = useGameStore();

  useEffect(() => {
    if (isPlaying && !isGameOver) {
       audioManager.init(); // User gesture assumed if we are here (from button click)
       audioManager.startBGM();
    } else {
       audioManager.stopBGM();
    }
  }, [isPlaying, isGameOver]);

  const handleStart = () => {
    audioManager.init(); // Init context on user click
    startGame();
  }
  
  const handleReset = () => {
      audioManager.init();
      resetGame();
  }

  return (
    <div className="relative w-full h-full bg-gray-900 select-none overflow-hidden font-sans">
      {/* 3D Game Canvas */}
      <div className="absolute inset-0 z-0">
        <Game />
      </div>

      {/* HUD (Heads Up Display) */}
      {isPlaying && !isGameOver && (
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white shadow-lg border border-white/10">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-xl tracking-wider">{Math.floor(score).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white shadow-lg border border-white/10">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-xl">{coins}</span>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {!isPlaying && !isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center max-w-md w-full mx-4">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2 italic transform -skew-x-12">
              METRO
            </h1>
            <h2 className="text-4xl font-bold text-white mb-8 tracking-widest uppercase">Runner</h2>
            
            <p className="text-gray-300 mb-8 text-sm">
              Use <span className="font-bold text-white bg-white/20 px-1 rounded">Arrow Keys</span> to Move, Jump & Duck.
              <br/>Dodge trains and collect coins!
            </p>

            <button 
              onClick={handleStart}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-white text-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <span className="flex items-center gap-2">
                <Play className="fill-current" /> PLAY NOW
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-red-900/40 backdrop-blur-md">
           <div className="bg-black/80 p-10 rounded-3xl border border-red-500/30 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-300">
            <h2 className="text-5xl font-black text-red-500 mb-2 uppercase italic">Wasted</h2>
            <div className="w-full h-px bg-white/20 my-4"></div>
            
            <div className="flex justify-between w-full mb-2">
                 <span className="text-gray-400 uppercase text-xs font-bold">Score</span>
                 <span className="text-white font-mono text-xl">{Math.floor(score).toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-full mb-8">
                 <span className="text-gray-400 uppercase text-xs font-bold">Coins</span>
                 <span className="text-yellow-400 font-mono text-xl flex items-center gap-1">
                    <Coins className="w-4 h-4" /> {coins}
                 </span>
            </div>

            <button 
              onClick={handleReset}
              className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> TRY AGAIN
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile Controls Overlay (Optional but good for responsive) */}
      {isPlaying && (
         <div className="absolute bottom-10 left-0 w-full flex justify-center gap-8 md:hidden pointer-events-none opacity-50">
             <div className="text-white/50 text-sm">Swipe to Move</div>
         </div>
      )}
    </div>
  );
};

export default App;