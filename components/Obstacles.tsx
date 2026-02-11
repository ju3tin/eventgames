// @ts-nocheck
'use client'
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { RoundedBox, Cylinder, Box } from '@react-three/drei';
import { LANE_WIDTH } from '@/store';

const COLORS = {
  trainBody: "#475569", // Darker slate
  trainFront: "#334155",
  trainStripe: "#f59e0b", // Amber stripe
  trainWindow: "#0f172a", // Dark tint
  coin: "#fbbf24", 
  barrier: "#ef4444", 
  ramp: "#64748b",
  ladder: "#94a3b8",
  metal: "#1e293b",
  light: "#fef3c7"
};

interface ObstacleProps {
  position: [number, number, number];
  name?: string;
}

export const Train: React.FC<ObstacleProps> = ({ position }) => {
  // Train dimensions
  const width = 3.6; // Fits within LANE_WIDTH 4.0
  const height = 6.0; // Standardized to 6.0 for physics consistency
  const length = 16;
  
  return (
    <group position={position}>
      {/* Main Body */}
      <RoundedBox args={[width, height, length]} radius={0.2} position={[0, height/2 + 0.5, 0]}>
        <meshStandardMaterial color={COLORS.trainBody} metalness={0.5} roughness={0.3} />
      </RoundedBox>

      {/* Front/Back Face Detail */}
      <RoundedBox args={[width + 0.1, height * 0.6, 0.5]} radius={0.1} position={[0, height/2 + 0.5, length/2]}>
          <meshStandardMaterial color={COLORS.trainFront} />
      </RoundedBox>
      <RoundedBox args={[width + 0.1, height * 0.6, 0.5]} radius={0.1} position={[0, height/2 + 0.5, -length/2]}>
          <meshStandardMaterial color={COLORS.trainFront} />
      </RoundedBox>

      {/* Undercarriage / Wheels */}
      <group position={[0, 0.5, 0]}>
          {/* Front Bogie */}
          <group position={[0, 0, length/2 - 2]}>
             <mesh rotation={[0, 0, Math.PI/2]} position={[0, 0.5, 0]}>
                 <cylinderGeometry args={[0.5, 0.5, width + 0.2]} />
                 <meshStandardMaterial color="#111" />
             </mesh>
             <mesh rotation={[0, 0, Math.PI/2]} position={[0, 0.5, -1.5]}>
                 <cylinderGeometry args={[0.5, 0.5, width + 0.2]} />
                 <meshStandardMaterial color="#111" />
             </mesh>
             <Box args={[width - 0.5, 1, 3]} position={[0, 0.5, -0.75]}>
                 <meshStandardMaterial color="#222" />
             </Box>
          </group>
           {/* Back Bogie */}
          <group position={[0, 0, -length/2 + 3.5]}>
             <mesh rotation={[0, 0, Math.PI/2]} position={[0, 0.5, 0]}>
                 <cylinderGeometry args={[0.5, 0.5, width + 0.2]} />
                 <meshStandardMaterial color="#111" />
             </mesh>
             <mesh rotation={[0, 0, Math.PI/2]} position={[0, 0.5, -1.5]}>
                 <cylinderGeometry args={[0.5, 0.5, width + 0.2]} />
                 <meshStandardMaterial color="#111" />
             </mesh>
             <Box args={[width - 0.5, 1, 3]} position={[0, 0.5, -0.75]}>
                 <meshStandardMaterial color="#222" />
             </Box>
          </group>
      </group>

      {/* Stripe */}
      <mesh position={[0, height/2, 0]}>
          <boxGeometry args={[width + 0.1, 0.4, length + 0.1]} />
          <meshStandardMaterial color={COLORS.trainStripe} />
      </mesh>

      {/* Roof Details */}
      <group position={[0, height + 0.5, 0]}>
          <Box args={[2, 0.5, 4]} position={[0, 0.25, -3]}>
              <meshStandardMaterial color={COLORS.metal} />
          </Box>
          <Box args={[2, 0.5, 4]} position={[0, 0.25, 3]}>
              <meshStandardMaterial color={COLORS.metal} />
          </Box>
          {/* Vents */}
          {Array.from({length: 3}).map((_, i) => (
               <Cylinder key={i} args={[0.4, 0.4, 0.3]} position={[0, 0.15, i * 2 - 2]} rotation={[0,0,0]}>
                   <meshStandardMaterial color="#222" />
               </Cylinder>
          ))}
      </group>

      {/* Windows */}
      <group>
           <mesh position={[width/2 + 0.05, height/2 + 1.5, 0]}>
              <boxGeometry args={[0.1, 1.5, length - 4]} />
              <meshStandardMaterial color={COLORS.trainWindow} metalness={0.9} roughness={0.1} />
           </mesh>
            <mesh position={[-width/2 - 0.05, height/2 + 1.5, 0]}>
              <boxGeometry args={[0.1, 1.5, length - 4]} />
              <meshStandardMaterial color={COLORS.trainWindow} metalness={0.9} roughness={0.1} />
           </mesh>
      </group>

      {/* Headlights */}
      <mesh position={[-1, 1.5, length/2 + 0.3]}>
         <cylinderGeometry args={[0.3, 0.3, 0.2]} rotation={[Math.PI/2, 0, 0]} />
         <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <mesh position={[1, 1.5, length/2 + 0.3]}>
         <cylinderGeometry args={[0.3, 0.3, 0.2]} rotation={[Math.PI/2, 0, 0]} />
         <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const StreetLight: React.FC<ObstacleProps> = ({ position }) => {
    return (
        <group position={position}>
            {/* Pole */}
            <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 8]} />
                <meshStandardMaterial color="#334155" />
            </mesh>
            {/* Arm */}
            <mesh position={[0.8, 7.5, 0]} rotation={[0, 0, -0.2]}>
                <cylinderGeometry args={[0.1, 0.1, 2.5]} />
                <meshStandardMaterial color="#334155" />
            </mesh>
            {/* Lamp Head */}
            <mesh position={[1.8, 7.2, 0]}>
                <boxGeometry args={[0.8, 0.3, 0.5]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            {/* Glow */}
            <mesh position={[1.8, 7.0, 0]} rotation={[Math.PI/2, 0, 0]}>
                <planeGeometry args={[0.6, 0.4]} />
                <meshBasicMaterial color="#fef3c7" toneMapped={false} />
            </mesh>
        </group>
    )
}

export const Barrier: React.FC<ObstacleProps> = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[-1.2, 0.6, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[1.2, 0.6, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <RoundedBox args={[3.2, 1.0, 0.3]} radius={0.1} position={[0, 1.0, 0]}>
        <meshStandardMaterial color={COLORS.barrier} />
      </RoundedBox>
      {/* Stripes */}
       <mesh position={[0, 1.0, 0.16]}>
          <planeGeometry args={[3.0, 0.8]} />
          <meshStandardMaterial color="#fff" />
       </mesh>
       <mesh position={[0, 1.0, 0.17]}>
           <planeGeometry args={[0.5, 0.8]} />
           <meshStandardMaterial color={COLORS.barrier} />
       </mesh>
    </group>
  );
};

export const HighBarrier: React.FC<ObstacleProps> = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[-1.5, 2.5, 0]}><cylinderGeometry args={[0.15, 0.15, 5]} /><meshStandardMaterial color="#333" /></mesh>
      <mesh position={[1.5, 2.5, 0]}><cylinderGeometry args={[0.15, 0.15, 5]} /><meshStandardMaterial color="#333" /></mesh>
      <RoundedBox args={[3.6, 1.5, 0.4]} radius={0.1} position={[0, 4.0, 0]}>
         <meshStandardMaterial color={COLORS.barrier} />
      </RoundedBox>
    </group>
  );
};

export const Ramp: React.FC<ObstacleProps> = ({ position }) => {
    // Calculated for 6.0 height over 14 length
    // Angle to reach 6.0 height over 14 unit hypotenuse is asin(6/14) ~ 0.44 rad ~ 25 deg
    // We rotate NEGATIVE on X so that -Z is HIGHER (Uphill for player running -Z)
    return (
        <group position={position}>
            {/* The inclined plane */}
            {/* Visual Center Y adjusted to 3.0 (half of 6.0) */}
            <mesh position={[0, 3.0, 0]} rotation={[-0.44, 0, 0]}>
                <boxGeometry args={[3.6, 0.3, 14]} />
                <meshStandardMaterial color={COLORS.ramp} roughness={0.8} />
            </mesh>
            {/* Support structure beneath */}
            <mesh position={[0, 1.0, 4]}>
                <boxGeometry args={[3.4, 2.0, 6]} />
                <meshStandardMaterial color="#333" />
            </mesh>
             <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[3.4, 1.0, 10]} />
                <meshStandardMaterial color="#222" />
            </mesh>
        </group>
    )
}

export const Coin: React.FC<ObstacleProps> = ({ position, name }) => {
  const ref = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 3;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ref} name={name} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} /> 
        <meshStandardMaterial 
            color={COLORS.coin} 
            metalness={0.8} 
            roughness={0.2} 
            emissive="#ffb700" 
            emissiveIntensity={0.6} 
        />
      </mesh>
    </group>
  );
};