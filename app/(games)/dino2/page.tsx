'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default function GLBPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const clock = new THREE.Clock();

  const [animationNames, setAnimationNames] = useState<string[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.5, 3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Load GLB
    const loader = new GLTFLoader();
    loader.load('/models/character.glb', (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      // Animation system
      const mixer = new THREE.AnimationMixer(model);
      mixerRef.current = mixer;

      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        actionsRef.current[clip.name] = action;
      });

      const names = gltf.animations.map((a) => a.name);
      setAnimationNames(names);

      // Auto-play first animation
      if (names.length > 0) {
        actionsRef.current[names[0]].play();
        setActiveAnimation(names[0]);
      }
    });

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      mixerRef.current?.update(delta);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const playAnimation = (name: string) => {
    if (!mixerRef.current) return;

    Object.values(actionsRef.current).forEach((action) =>
      action.fadeOut(0.2)
    );

    const action = actionsRef.current[name];
    action.reset().fadeIn(0.2).play();

    setActiveAnimation(name);
  };

  return (
    <div className="flex h-screen">
      <div ref={mountRef} className="flex-1" />

      <div className="w-72 bg-slate-900 text-white p-4 space-y-2">
        <h2 className="text-lg font-semibold mb-2">Animations</h2>

        {animationNames.map((name) => (
          <button
            key={name}
            className={`w-full rounded px-3 py-2 ${
              activeAnimation === name
                ? 'bg-sky-500'
                : 'bg-slate-700'
            }`}
            onClick={() => playAnimation(name)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
