// @ts-nocheck
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore, LANE_WIDTH, playerPositionRef, groundHeightRef, particleSystemRef } from '@/store';
import { Train, Barrier, CoinInstances, HighBarrier, Ramp, StreetLight, TrackBase } from '@/components/Obstacles';
import { ParticleSystem } from '@/components/Particles';
import { audioManager } from '@/utils/audio';
import * as THREE from 'three';

const SEGMENT_LENGTH = 40;
const VISIBLE_SEGMENTS = 10; // Pool Size
const POOL_BUFFER_DIST = 25; // Distance behind player to trigger recycle
const WORLD_COLOR = "#0f172a"; 

type ObstacleType = 'train' | 'barrier' | 'high_barrier' | 'coins' | 'ramp' | 'none';

interface SegmentData {
  id: number;
  z: number;
  obstacles: { lane: number; type: ObstacleType; localZ: number; y?: number }[];
  sceneryLeft: number[]; 
  sceneryRight: number[];
  graffitiLeft: number[][]; 
  graffitiRight: number[][];
  hasArch: boolean;
  hasLight: boolean;
}

const HITBOXES: Record<ObstacleType, { w: number, h: number, d: number, y: number, isPlatform?: boolean }> = {
    train: { w: 3.4, h: 6.0, d: 15.5, y: 3.0, isPlatform: true },
    ramp: { w: 3.4, h: 6.0, d: 13.0, y: 0, isPlatform: true },
    barrier: { w: 3.2, h: 1.2, d: 0.3, y: 0.6 },
    high_barrier: { w: 3.4, h: 1.5, d: 0.4, y: 4.0 },
    coins: { w: 1.5, h: 1.5, d: 1.5, y: 0.5 },
    none: { w: 0, h: 0, d: 0, y: 0 }
};

// --- Generators ---
const generateSegment = (id: number, z: number, safe: boolean): SegmentData => {
    const obstacles: { lane: number; type: ObstacleType; localZ: number; y?: number }[] = [];
    
    // Scenery Generation
    const sceneryLeft = Array.from({ length: 3 }, () => 10 + Math.random() * 25);
    const sceneryRight = Array.from({ length: 3 }, () => 10 + Math.random() * 25);
    const hasArch = id % 3 === 0;
    const hasLight = id % 2 === 0;

    const generateGraffiti = () => Array.from({ length: 2 }, () => [
        Math.floor(Math.random() * 3), 
        (Math.random() - 0.5) * 8, 
        3 + Math.random() * 5, 
        1.0 + Math.random() * 2.0 
    ]);

    if (!safe) {
        const pattern = Math.random();
        
        // Pattern 1: RAMP RUN (35%)
        // Natural flow: Coins on ground -> Ramp -> Train -> Coins on Train
        if (pattern < 0.35) {
            const mainLane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
            
            // Lead-in Coins (Guiding player to the ramp)
            obstacles.push({ lane: mainLane, type: 'coins', localZ: -4, y: 1 });
            obstacles.push({ lane: mainLane, type: 'coins', localZ: -9, y: 1 });
            
            // The Ramp & Train Combo
            // Ramp at -16 allows space for lead-in. Train at -29.5 connects perfectly.
            obstacles.push({ lane: mainLane, type: 'ramp', localZ: -16 });
            obstacles.push({ lane: mainLane, type: 'train', localZ: -29.5 });
            
            // Coins on top (Reward)
            obstacles.push({ lane: mainLane, type: 'coins', localZ: -22, y: 5.5 }); // Top of ramp
            obstacles.push({ lane: mainLane, type: 'coins', localZ: -27, y: 6.5 }); // Train front
            obstacles.push({ lane: mainLane, type: 'coins', localZ: -32, y: 6.5 }); // Train back
            
            // Obstacles in other lanes to make the ramp attractive or forced
            [-1, 0, 1].forEach(l => {
                if (l !== mainLane) {
                    if (Math.random() > 0.5) {
                         // A train next to it creates a "Canyon" feel
                        obstacles.push({ lane: l, type: 'train', localZ: -25 });
                    } else {
                        // Barriers forcing the jump or move
                        obstacles.push({ lane: l, type: 'high_barrier', localZ: -15 });
                    }
                }
            });

        } 
        // Pattern 2: JUMP ARCS (30%)
        // Barriers with coins arching over them to encourage jumping
        else if (pattern < 0.65) {
             [-1, 0, 1].forEach(l => {
                 const typeR = Math.random();
                 if (typeR < 0.4) {
                     // Barrier with Coin Jump
                     obstacles.push({ lane: l, type: 'barrier', localZ: -20 });
                     obstacles.push({ lane: l, type: 'coins', localZ: -16, y: 1.2 }); // Launch
                     obstacles.push({ lane: l, type: 'coins', localZ: -20, y: 3.5 }); // Apex
                     obstacles.push({ lane: l, type: 'coins', localZ: -24, y: 1.2 }); // Land
                 } else if (typeR < 0.7) {
                     // Just a line of coins
                     obstacles.push({ lane: l, type: 'coins', localZ: -10, y: 1 });
                     obstacles.push({ lane: l, type: 'coins', localZ: -20, y: 1 });
                     obstacles.push({ lane: l, type: 'coins', localZ: -30, y: 1 });
                 } else {
                     // Empty or sparse
                 }
             });
        }
        // Pattern 3: THE GAUNTLET (35%)
        // 2 Trains and a narrow path, or zig-zag barriers
        else {
             const safeLane = Math.floor(Math.random() * 3) - 1;
             
             [-1, 0, 1].forEach(l => {
                 if (l === safeLane) {
                     // Safe path with coins
                     for(let k=0; k<6; k++) {
                        obstacles.push({ lane: l, type: 'coins', localZ: -5 - (k*6), y: 1 });
                     }
                 } else {
                     // Blocked
                     const obsR = Math.random();
                     if (obsR < 0.6) {
                         obstacles.push({ lane: l, type: 'train', localZ: -25 });
                     } else {
                         obstacles.push({ lane: l, type: 'high_barrier', localZ: -20 });
                     }
                 }
             });
        }
    }
    
    return { id, z, obstacles, sceneryLeft, sceneryRight, graffitiLeft: generateGraffiti(), graffitiRight: generateGraffiti(), hasArch, hasLight };
};

export const World = () => {
  const { isPlaying, isGameOver, endGame, collectCoin, incrementScore, triggerShake } = useGameStore();
  
  // Use a Ref Set for fast lookups, but force update via a state integer to re-render CoinInstances
  const collectedRef = useRef(new Set<string>());
  const [coinVersion, setCoinVersion] = useState(0); 
  
  // Segment Pool State
  const [segments, setSegments] = useState<SegmentData[]>([]);
  const segmentIdCounter = useRef(0);
  
  // Init Pool
  useEffect(() => {
    segmentIdCounter.current = 0;
    const initial: SegmentData[] = [];
    for (let i = 0; i < VISIBLE_SEGMENTS; i++) {
        initial.push(generateSegment(segmentIdCounter.current++, -i * SEGMENT_LENGTH, i < 3)); // First 3 segments safe
    }
    setSegments(initial);
    collectedRef.current.clear();
  }, [isPlaying]); 

  useFrame((state, delta) => {
    if (!isPlaying || isGameOver) return;

    const pPos = playerPositionRef.current; 
    incrementScore(delta * 25);

    // --- Segment Recycle Logic ---
    setSegments(prev => {
        let minZ = 0; 
        prev.forEach(s => { if(s.z < minZ) minZ = s.z });

        let changed = false;
        const next = prev.map(seg => {
            if (seg.z > pPos.z + POOL_BUFFER_DIST) {
                changed = true;
                return generateSegment(segmentIdCounter.current++, minZ - SEGMENT_LENGTH, false);
            }
            return seg;
        });

        return changed ? next : prev;
    });

    // --- Collision Logic ---
    const pWidth = 0.6;
    const pHeight = 1.8; 
    const pDepth = 0.5;
    let maxGroundY = 0;

    segments.forEach(seg => {
        // Broad phase cull
        if (Math.abs(seg.z - pPos.z) > SEGMENT_LENGTH + 20) return;

        seg.obstacles.forEach(obs => {
            const box = HITBOXES[obs.type];
            if (!box) return;

            const obsX = obs.lane * LANE_WIDTH;
            const obsZ = seg.z + obs.localZ;
            const obsY = obs.y || box.y;

            // Simple AABB
            const dx = Math.abs(pPos.x - obsX);
            const dz = Math.abs(pPos.z - obsZ);
            
            const collisionX = dx < (pWidth/2 + box.w/2 - 0.2); 
            const collisionZ = dz < (pDepth/2 + box.d/2);

            // Near Miss Effect
            if (!collisionX && collisionZ && dx < (pWidth/2 + box.w/2 + 0.5) && !box.isPlatform && obs.type !== 'coins') {
                triggerShake(0.05); 
            }

            if (collisionX && collisionZ) {
                // Platform Handling
                if (box.isPlatform) {
                    if (obs.type === 'ramp') {
                         const rampStartZ = obsZ + box.d/2; 
                         const distFromRampStart = rampStartZ - pPos.z; 
                         const safeProgress = Math.max(0, Math.min(1, distFromRampStart / box.d));
                         const rampHeight = safeProgress * 6.0;
                         if (rampHeight > maxGroundY) maxGroundY = rampHeight;

                    } else if (obs.type === 'train') {
                         // On top of train
                         if (pPos.y >= 5.0) {
                             if (6.0 > maxGroundY) maxGroundY = 6.0;
                         } else {
                             // Hit train
                             audioManager.playCrash();
                             particleSystemRef.current.emit(pPos.clone().add(new THREE.Vector3(0, 1, -1)), 'crash');
                             endGame();
                         }
                    }
                }
                
                // Y-Axis Collision
                const obsMinY = obsY - box.h / 2;
                const obsMaxY = obsY + box.h / 2;
                const pMinY = pPos.y; 
                const pMaxY = pPos.y + pHeight;
                const collisionY = (pMinY < obsMaxY && pMaxY > obsMinY);

                if (collisionY) {
                     if (obs.type === 'coins') {
                         const id = `c-${seg.id}-${obs.localZ}-${obs.lane}`;
                         if (!collectedRef.current.has(id)) {
                             collectedRef.current.add(id);
                             collectCoin();
                             audioManager.playCoin();
                             particleSystemRef.current.emit(new THREE.Vector3(obsX, obsY, obsZ), 'coin');
                             setCoinVersion(v => v + 1); // Trigger instance update
                         }
                    } else if (!box.isPlatform) {
                         audioManager.playCrash();
                         particleSystemRef.current.emit(pPos.clone().add(new THREE.Vector3(0, 1, 0)), 'crash');
                         endGame();
                    }
                }
            }
        });
    });

    groundHeightRef.current = maxGroundY;
  });

  // Extract all coins from all segments for the instanced mesh
  const allCoins = useMemo(() => {
      return segments.flatMap(seg => 
          seg.obstacles
            .filter(o => o.type === 'coins')
            .map(o => ({
                id: `c-${seg.id}-${o.localZ}-${o.lane}`,
                x: o.lane * LANE_WIDTH,
                y: o.y || 1,
                z: seg.z + o.localZ
            }))
      );
  }, [segments, coinVersion]); // Re-calc when coinVersion changes

  return (
    <>
      <color attach="background" args={[WORLD_COLOR]} />
      <fog attach="fog" args={[WORLD_COLOR, 10, 90]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 30, 20]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />

      <ParticleSystem />
      <CoinInstances data={allCoins} collectedIds={collectedRef.current} />

      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -90]}>
            <planeGeometry args={[300, 1000]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
        
        <DistantCity />

        {segments.map((seg, i) => (
            <group key={seg.id} position={[0, 0, seg.z]}>
                {/* Stable TrackBase Component (Uses Instances internally) */}
                <TrackBase /> 

                <UrbanScenery side="left" heights={seg.sceneryLeft} graffiti={seg.graffitiLeft} />
                <UrbanScenery side="right" heights={seg.sceneryRight} graffiti={seg.graffitiRight} />
                
                {seg.hasArch && <TunnelArch />}
                {seg.hasLight && <StreetLight position={[8, 0, -10]} />}

                {seg.obstacles.map((obs, idx) => {
                    const pos: [number, number, number] = [obs.lane * LANE_WIDTH, obs.y || 0, obs.localZ];
                    if (obs.type === 'train') return <Train key={idx} position={pos} />;
                    if (obs.type === 'barrier') return <Barrier key={idx} position={pos} />;
                    if (obs.type === 'high_barrier') return <HighBarrier key={idx} position={pos} />;
                    if (obs.type === 'ramp') return <Ramp key={idx} position={pos} />;
                    return null;
                })}
            </group>
        ))}
      </group>
    </>
  );
};

const UrbanScenery = React.memo(({ side, heights, graffiti }: { side: 'left' | 'right', heights: number[], graffiti: number[][] }) => {
    const xOffset = side === 'left' ? -20 : 20; 
    const graffitiColors = ["#ec4899", "#22d3ee", "#facc15"];

    return (
        <group>
            {heights.map((h, i) => (
                <group key={i} position={[xOffset, h/2, -(i * 12) - 5]}>
                    <mesh receiveShadow>
                        <boxGeometry args={[10, h, 11]} />
                        <meshStandardMaterial color="#1e293b" />
                    </mesh>
                    {i === 1 && (
                        <mesh position={[side === 'left' ? 5.1 : -5.1, h/4, 0]} rotation={[0, side === 'left' ? Math.PI/2 : -Math.PI/2, 0]}>
                            <planeGeometry args={[8, 4]} />
                            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1.5} />
                        </mesh>
                    )}
                    {i === 0 && graffiti.map((g, idx) => (
                        <mesh key={idx} position={[side === 'left' ? 5.1 : -5.1, g[2] - h/2, g[1]]} rotation={[0, side === 'left' ? Math.PI/2 : -Math.PI/2, 0]} scale={[g[3], g[3], 1]}>
                            <planeGeometry args={[2, 2]} />
                            <meshBasicMaterial color={graffitiColors[g[0]]} transparent opacity={0.6} />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
});

const TunnelArch = React.memo(() => (
    <group position={[0, 0, -SEGMENT_LENGTH / 2]}>
         <mesh position={[-10, 6, 0]}><boxGeometry args={[3, 12, 3]} /><meshStandardMaterial color="#475569" /></mesh>
         <mesh position={[10, 6, 0]}><boxGeometry args={[3, 12, 3]} /><meshStandardMaterial color="#475569" /></mesh>
         <mesh position={[0, 11, 0]}><boxGeometry args={[23, 2, 3]} /><meshStandardMaterial color="#334155" /></mesh>
    </group>
));

const DistantCity = React.memo(() => {
    const trains = useRef<THREE.Group[]>([]);
    useFrame((state, delta) => {
        trains.current.forEach((t, i) => {
            if(t) {
                t.position.z += delta * (25 + i * 5); 
                if (t.position.z > 50) t.position.z = -200; 
            }
        })
    });
    return (
        <group>
            {[-1, 1].map((dir, i) => (
                <group key={i} position={[dir * 35, 0, 0]} ref={(el) => { if(el) trains.current[i] = el }}>
                     <mesh position={[0, 3, 0]}>
                         <boxGeometry args={[4, 4, 60]} />
                         <meshStandardMaterial color="#0f172a" emissive="#1e293b" />
                     </mesh>
                     {Array.from({length: 12}).map((_, k) => (
                         <mesh key={k} position={[dir * 2.1, 3.5, -25 + k * 5]}>
                             <planeGeometry args={[0.4, 1.5]} />
                             <meshBasicMaterial color="#fbbf24" />
                         </mesh>
                     ))}
                </group>
            ))}
        </group>
    )
});