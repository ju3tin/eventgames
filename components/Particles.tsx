// @ts-nocheck
import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, MathUtils, Color, DynamicDrawUsage } from 'three';
import { particleSystemRef } from '@/store';

const COUNT = 300;
const DUMMY = new Object3D();
const COLOR_COIN = new Color("#fbbf24");
const COLOR_CRASH = new Color("#ef4444");
const COLOR_WHITE = new Color("#ffffff");

type ParticleData = {
    time: number;
    life: number;
    vel: Vector3;
    scale: number;
    color: Color;
    active: boolean;
};

export const ParticleSystem = () => {
    const meshRef = useRef<InstancedMesh>(null);
    const particles = useMemo(() => {
        return new Array(COUNT).fill(0).map(() => ({
            time: 0,
            life: 0,
            vel: new Vector3(),
            scale: 1,
            color: new Color(),
            active: false
        } as ParticleData));
    }, []);

    useLayoutEffect(() => {
        // Expose emit function to global ref
        particleSystemRef.current.emit = (pos: Vector3, type: 'coin' | 'crash') => {
            const count = type === 'coin' ? 10 : 30;
            let spawned = 0;
            
            for (let i = 0; i < COUNT; i++) {
                if (!particles[i].active) {
                    const p = particles[i];
                    p.active = true;
                    p.time = 0;
                    p.life = type === 'coin' ? 0.5 + Math.random() * 0.3 : 0.8 + Math.random() * 0.5;
                    
                    // Position
                    DUMMY.position.copy(pos);
                    // Scatter origin slightly
                    DUMMY.position.x += (Math.random() - 0.5) * 0.5;
                    DUMMY.position.y += (Math.random() - 0.5) * 0.5;
                    DUMMY.position.z += (Math.random() - 0.5) * 0.5;
                    
                    // Velocity
                    if (type === 'coin') {
                        p.vel.set(
                            (Math.random() - 0.5) * 5, 
                            (Math.random() * 5) + 2, 
                            (Math.random() - 0.5) * 5
                        );
                        p.scale = 0.15 + Math.random() * 0.1;
                        p.color.copy(COLOR_COIN);
                    } else {
                        // Crash
                        p.vel.set(
                            (Math.random() - 0.5) * 15, 
                            (Math.random() * 10) + 5, 
                            (Math.random() - 0.5) * 15 + 5 // Forward momentum
                        );
                        p.scale = 0.3 + Math.random() * 0.3;
                        p.color.copy(Math.random() > 0.5 ? COLOR_CRASH : COLOR_WHITE);
                    }

                    spawned++;
                    if (spawned >= count) break;
                }
            }
        };
    }, [particles]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        
        let activeCount = 0;
        for (let i = 0; i < COUNT; i++) {
            const p = particles[i];
            
            if (p.active) {
                p.time += delta;
                
                // Physics
                p.vel.y -= 25 * delta; // Gravity
                
                // Move dummy
                DUMMY.position.x += p.vel.x * delta;
                DUMMY.position.y += p.vel.y * delta;
                DUMMY.position.z += p.vel.z * delta;
                
                // Scale out
                const progress = p.time / p.life;
                const currentScale = MathUtils.lerp(p.scale, 0, progress);
                DUMMY.scale.setScalar(currentScale);
                
                DUMMY.updateMatrix();
                meshRef.current.setMatrixAt(i, DUMMY.matrix);
                meshRef.current.setColorAt(i, p.color);

                if (p.time >= p.life || DUMMY.position.y < 0) {
                    p.active = false;
                    DUMMY.scale.setScalar(0);
                    DUMMY.updateMatrix();
                    meshRef.current.setMatrixAt(i, DUMMY.matrix);
                }
                activeCount++;
            }
        }
        
        if (activeCount > 0) {
            meshRef.current.instanceMatrix.needsUpdate = true;
            if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
        }
    });

    return (
        <instancedMesh 
            ref={meshRef} 
            args={[undefined, undefined, COUNT]} 
            frustumCulled={false}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
    );
};