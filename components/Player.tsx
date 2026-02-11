// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, MathUtils } from 'three';
import { useGameStore, LANE_WIDTH, JUMP_FORCE, GRAVITY, SLIDE_DURATION, playerPositionRef, groundHeightRef, cameraShakeRef } from '../store';
import { RoundedBox, Sphere } from '@react-three/drei';
import { audioManager } from '../utils/audio';

export const Player = () => {
  const group = useRef<Group>(null);
  const bodyGroup = useRef<Group>(null);
  const spinGroup = useRef<Group>(null);
  const modelGroup = useRef<Group>(null);

  const { isPlaying, isGameOver, speed, increaseSpeed } = useGameStore();

  const lane = useRef(0);
  const velocityY = useRef(0);
  const grounded = useRef(true);
  const isJumping = useRef(false);
  const isSliding = useRef(false);
  const slideTimer = useRef(0);
  const runTime = useRef(0);

  // Touch handling refs
  const touchStart = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      handleInput(e.key.toLowerCase());
    };

    const handleTouchStart = (e: TouchEvent) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (!touchStart.current || !isPlaying || isGameOver) return;
        
        const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        const diffX = touchEnd.x - touchStart.current.x;
        const diffY = touchEnd.y - touchStart.current.y;
        
        // Threshold for swipe
        if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal
                handleInput(diffX > 0 ? 'arrowright' : 'arrowleft');
            } else {
                // Vertical
                handleInput(diffY > 0 ? 'arrowdown' : 'arrowup');
            }
        }
        touchStart.current = null;
    };

    const handleInput = (key: string) => {
      if (key === 'arrowleft' || key === 'a') {
        lane.current = Math.max(lane.current - 1, -1);
      } else if (key === 'arrowright' || key === 'd') {
        lane.current = Math.min(lane.current + 1, 1);
      } 
      else if (key === 'arrowup' || key === ' ' || key === 'w') {
        if (grounded.current && !isSliding.current) {
          velocityY.current = JUMP_FORCE;
          grounded.current = false;
          isJumping.current = true;
          audioManager.playJump();
        }
      } 
      else if (key === 'arrowdown' || key === 's') {
        if (!grounded.current) {
          velocityY.current = -JUMP_FORCE * 1.5; 
        } else if (!isSliding.current) {
          isSliding.current = true;
          slideTimer.current = 0;
          audioManager.playSlide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPlaying, isGameOver]);

  useFrame((state, delta) => {
    if (!group.current) return;

    if (isGameOver) {
       if (bodyGroup.current) {
         bodyGroup.current.rotation.x = MathUtils.lerp(bodyGroup.current.rotation.x, -Math.PI / 2, delta * 10);
         bodyGroup.current.position.y = MathUtils.lerp(bodyGroup.current.position.y, groundHeightRef.current + 0.5, delta * 10);
       }
       const camTarget = new Vector3(playerPositionRef.current.x, groundHeightRef.current + 2, playerPositionRef.current.z + 5);
       state.camera.position.lerp(new Vector3(playerPositionRef.current.x + 4, groundHeightRef.current + 5, playerPositionRef.current.z + 10), delta * 2);
       state.camera.lookAt(camTarget);
       return;
    }

    if (!isPlaying) return;

    playerPositionRef.current.z -= speed * delta;
    increaseSpeed();
    runTime.current += delta * speed * 1.2;

    const groundY = groundHeightRef.current;
    let newY = playerPositionRef.current.y + velocityY.current * delta;
    let newVelY = velocityY.current - GRAVITY * delta;

    // Ground Collision
    if (newY <= groundY) {
      newY = groundY;
      newVelY = 0;
      grounded.current = true;
      isJumping.current = false;
    } else {
      grounded.current = false;
    }
    
    playerPositionRef.current.y = newY;
    velocityY.current = newVelY;

    let rollAngle = 0;
    if (isSliding.current) {
      slideTimer.current += delta;
      const slideProgress = slideTimer.current / SLIDE_DURATION;
      rollAngle = -slideProgress * Math.PI * 4; 
      if (slideTimer.current > SLIDE_DURATION) {
        isSliding.current = false;
      }
    }

    const targetX = lane.current * LANE_WIDTH;
    playerPositionRef.current.x = MathUtils.lerp(playerPositionRef.current.x, targetX, delta * 12);
    
    group.current.position.copy(playerPositionRef.current);

    if (bodyGroup.current && spinGroup.current && modelGroup.current) {
        const xDiff = targetX - playerPositionRef.current.x;
        bodyGroup.current.rotation.z = MathUtils.lerp(bodyGroup.current.rotation.z, -xDiff * 0.15, delta * 10);
        bodyGroup.current.rotation.y = MathUtils.lerp(bodyGroup.current.rotation.y, xDiff * 0.05, delta * 5);
        
        if (isSliding.current) {
            spinGroup.current.position.y = 0.9;
            spinGroup.current.rotation.x = rollAngle;
            modelGroup.current.position.y = -0.9;
        } else {
            spinGroup.current.position.y = 0;
            spinGroup.current.rotation.x = 0;
            modelGroup.current.position.y = 0;

            if (!grounded.current) {
                spinGroup.current.rotation.x = MathUtils.lerp(spinGroup.current.rotation.x, -0.4, delta * 5);
            } else {
                spinGroup.current.position.y = Math.sin(runTime.current * 2) * 0.12;
                spinGroup.current.rotation.x = 0;
            }
        }
    }

    // --- Dynamic Camera ---
    // 1. Zoom based on speed
    const baseFov = 55; // Wider FOV for bigger world
    const speedFov = Math.min(80, baseFov + (speed - 20) * 1.5);
    state.camera.fov = MathUtils.lerp(state.camera.fov, speedFov, delta * 2);
    state.camera.updateProjectionMatrix();

    // 2. Camera Offset with "Sway"
    const swayX = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    // Camera is placed higher and further back to see the wider lanes
    const camOffset = new Vector3(swayX, 7.5, 11); 
    const targetCam = playerPositionRef.current.clone().add(camOffset);
    targetCam.y = Math.max(playerPositionRef.current.y, groundY) + 7.5; 

    // 3. Apply Camera Shake
    if (cameraShakeRef.current > 0.01) {
        const shake = cameraShakeRef.current;
        targetCam.x += (Math.random() - 0.5) * shake * 2;
        targetCam.y += (Math.random() - 0.5) * shake * 2;
        cameraShakeRef.current = MathUtils.lerp(cameraShakeRef.current, 0, delta * 5);
    }

    state.camera.position.x = MathUtils.lerp(state.camera.position.x, targetCam.x * 0.8, delta * 4);
    state.camera.position.y = MathUtils.lerp(state.camera.position.y, targetCam.y, delta * 6);
    state.camera.position.z = targetCam.z;
    
    // Look at player with a bit of "Look Ahead"
    const lookAtPos = playerPositionRef.current.clone();
    lookAtPos.z -= 15;
    lookAtPos.y = Math.max(playerPositionRef.current.y, groundY) + 3;
    state.camera.lookAt(lookAtPos);
    
    // Slight Roll on turns
    state.camera.rotation.z = MathUtils.lerp(state.camera.rotation.z, - (targetX - playerPositionRef.current.x) * 0.02, delta * 5);
  });

  return (
    <group ref={group}>
        <group ref={bodyGroup}>
            <group ref={spinGroup}>
                <group ref={modelGroup}>
                    <CharacterModel 
                        runTime={runTime} 
                        isJumpingRef={isJumping} 
                        isSlidingRef={isSliding} 
                    />
                </group>
            </group>
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <circleGeometry args={[0.75, 32]} />
            <meshBasicMaterial color="black" transparent opacity={0.4} />
        </mesh>
    </group>
  );
};

const CharacterModel = ({ runTime, isJumpingRef, isSlidingRef }: { 
    runTime: React.MutableRefObject<number>, 
    isJumpingRef: React.MutableRefObject<boolean>,
    isSlidingRef: React.MutableRefObject<boolean> 
}) => {
    const leftLeg = useRef<Group>(null);
    const rightLeg = useRef<Group>(null);
    const leftArm = useRef<Group>(null);
    const rightArm = useRef<Group>(null);

    useFrame(() => {
        if (!leftLeg.current || !rightLeg.current || !leftArm.current || !rightArm.current) return;

        const t = runTime.current;
        const jumping = isJumpingRef.current;
        const sliding = isSlidingRef.current;

        if (sliding) {
            leftLeg.current.rotation.x = -2.2;
            rightLeg.current.rotation.x = -2.2;
            leftArm.current.rotation.x = -1.8;
            rightArm.current.rotation.x = -1.8;
        } else if (jumping) {
            leftLeg.current.rotation.x = 0.9;
            rightLeg.current.rotation.x = -1.5;
            leftArm.current.rotation.x = -2.8;
            rightArm.current.rotation.x = 2.8;
        } else {
            leftLeg.current.rotation.x = Math.sin(t) * 1.3;
            rightLeg.current.rotation.x = Math.sin(t + Math.PI) * 1.3;
            leftArm.current.rotation.x = Math.sin(t + Math.PI) * 1.0;
            rightArm.current.rotation.x = Math.sin(t) * 1.0;
        }
    });

    const skinColor = "#f59e0b"; 
    const shirtColor = "#3b82f6"; 
    const pantsColor = "#1e293b"; 
    const shoesColor = "#ef4444"; 

    // Scale up character slightly to match new world scale
    return (
        <group scale={1.3}> 
            <RoundedBox args={[0.7, 0.9, 0.45]} radius={0.05} position={[0, 1.45, 0]}><meshStandardMaterial color={shirtColor} /></RoundedBox>
            <RoundedBox args={[0.55, 0.65, 0.25]} radius={0.1} position={[0, 1.5, 0.35]}><meshStandardMaterial color="#10b981" /></RoundedBox>
            <group position={[0, 2.15, 0]}>
                 <Sphere args={[0.35, 16, 16]}><meshStandardMaterial color={skinColor} /></Sphere>
                <mesh position={[0, 0.15, -0.05]} rotation={[0.1, 0, 0]}><cylinderGeometry args={[0.36, 0.36, 0.3, 32]} /><meshStandardMaterial color={shoesColor} /></mesh>
                <mesh position={[0, 0.15, 0.25]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.4, 0.05, 0.2]} /><meshStandardMaterial color={shoesColor} /></mesh>
            </group>
            <group position={[-0.45, 1.75, 0]} ref={leftArm}>
                <RoundedBox args={[0.18, 0.7, 0.18]} radius={0.05} position={[0, -0.3, 0]}><meshStandardMaterial color={skinColor} /></RoundedBox>
                <RoundedBox args={[0.2, 0.35, 0.2]} radius={0.05} position={[0, -0.1, 0]}><meshStandardMaterial color={shirtColor} /></RoundedBox>
            </group>
             <group position={[0.45, 1.75, 0]} ref={rightArm}>
                <RoundedBox args={[0.18, 0.7, 0.18]} radius={0.05} position={[0, -0.3, 0]}><meshStandardMaterial color={skinColor} /></RoundedBox>
                 <RoundedBox args={[0.2, 0.35, 0.2]} radius={0.05} position={[0, -0.1, 0]}><meshStandardMaterial color={shirtColor} /></RoundedBox>
            </group>
            <RoundedBox args={[0.72, 0.35, 0.42]} radius={0.05} position={[0, 0.95, 0]}><meshStandardMaterial color={pantsColor} /></RoundedBox>
            <group position={[-0.2, 0.8, 0]} ref={leftLeg}>
                <RoundedBox args={[0.24, 0.85, 0.24]} radius={0.05} position={[0, -0.4, 0]}><meshStandardMaterial color={pantsColor} /></RoundedBox>
                <RoundedBox args={[0.26, 0.25, 0.5]} radius={0.05} position={[0, -0.85, 0.1]}><meshStandardMaterial color={shoesColor} /></RoundedBox>
            </group>
             <group position={[0.2, 0.8, 0]} ref={rightLeg}>
                <RoundedBox args={[0.24, 0.85, 0.24]} radius={0.05} position={[0, -0.4, 0]}><meshStandardMaterial color={pantsColor} /></RoundedBox>
                <RoundedBox args={[0.26, 0.25, 0.5]} radius={0.05} position={[0, -0.85, 0.1]}><meshStandardMaterial color={shoesColor} /></RoundedBox>
            </group>
        </group>
    );
}