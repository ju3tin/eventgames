// @ts-nocheck
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, Environment } from '@react-three/drei';
import { Player } from './Player';
import { World } from './World';

export const Game = () => {
  return (
    <Canvas 
      shadows 
      camera={{ position: [0, 4, 6], fov: 50 }}
      dpr={[1, 1.5]} // Cap pixel ratio for performance on high-res screens
      gl={{ antialias: false, powerPreference: "high-performance" }} // Disable MSAA for performance, let pixel density handle it
    >
      <Suspense fallback={null}>
        {/* Optimized Environment */}
        <ambientLight intensity={0.6} />
        <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
        />
        <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
        {/* Reduced star count for performance */}
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="city" />
        
        <fog attach="fog" args={['#1e1e2e', 10, 50]} />

        {/* Game Entities */}
        <Player />
        <World />
        
      </Suspense>
    </Canvas>
  );
};