'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function GLBPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});

  const clock = new THREE.Clock();

  const [animationNames, setAnimationNames] = useState<string[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [rotateEnabled, setRotateEnabled] = useState(false);

  const [bgHex, setBgHex] = useState('#020617');
  const [bgTransparent, setBgTransparent] = useState(true);

  /* ---------------- Scene Setup (once) ---------------- */
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    // Renderer (transparent)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.enableRotate = false;
    controls.enablePan = false;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Load GLB
    const loader = new GLTFLoader();
    loader.load('/assets/models/Triceratops.glb', (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      // Fit camera
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const cameraZ =
        Math.abs(maxDim / Math.sin((camera.fov * Math.PI) / 360)) * 1.2;

      camera.position.set(0, maxDim * 0.6, cameraZ);
      camera.lookAt(0, 0, 0);

      controls.target.set(0, 0, 0);
      controls.minDistance = cameraZ * 0.5;
      controls.maxDistance = cameraZ * 2;
      controls.update();

      // Animations
      const mixer = new THREE.AnimationMixer(model);
      mixerRef.current = mixer;

      gltf.animations.forEach((clip) => {
        actionsRef.current[clip.name] = mixer.clipAction(clip);
      });

      const names = gltf.animations.map((a) => a.name);
      setAnimationNames(names);

      if (names.length) {
        actionsRef.current[names[0]].play();
        setActiveAnimation(names[0]);
      }
    });

    // Resize
    const onResize = () => {
      if (!mountRef.current) return;

      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };

    window.addEventListener('resize', onResize);

    // Render loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      mixerRef.current?.update(clock.getDelta());
    //  controls.enableRotate = rotateEnabled;
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
  if (!controlsRef.current) return;
  controlsRef.current.enableRotate = rotateEnabled;
}, [rotateEnabled]);


  /* ---------------- Background Control ---------------- */
  useEffect(() => {
    if (!rendererRef.current) return;

    if (bgTransparent) {
      rendererRef.current.setClearColor(0x000000, 0);
    } else {
      rendererRef.current.setClearColor(bgHex, 1);
    }
  }, [bgHex, bgTransparent]);

  /* ---------------- Animation Switch ---------------- */
  const playAnimation = (name: string) => {
    if (!mixerRef.current) return;

    Object.values(actionsRef.current).forEach((a) => a.fadeOut(0.25));
    actionsRef.current[name].reset().fadeIn(0.25).play();
    setActiveAnimation(name);
  };

  return (
    <div className="flex h-screen">
      <div ref={mountRef} className="flex-1" />

      <div className="w-72 bg-slate-900 text-white p-4 space-y-2">
        <h2 className="text-lg font-semibold">Animations</h2>

        {animationNames.map((name) => (
          <button
            key={name}
            className={`w-full rounded px-3 py-2 ${
              activeAnimation === name ? 'bg-sky-500' : 'bg-slate-700'
            }`}
            onClick={() => playAnimation(name)}
          >
            {name}
          </button>
        ))}

        <hr className="border-slate-700 my-3" />

        <button
          className={`w-full rounded px-3 py-2 ${
            rotateEnabled ? 'bg-emerald-500' : 'bg-slate-700'
          }`}
          onClick={() => setRotateEnabled((v) => !v)}
        >
          {rotateEnabled ? 'Disable Rotate' : 'Enable Rotate'}
        </button>

        <hr className="border-slate-700 my-3" />

        {/* Hex Picker */}
        <input
          type="color"
          value={bgHex}
          onChange={(e) => {
            setBgHex(e.target.value);
            setBgTransparent(false);
          }}
          className="w-full h-10 rounded cursor-pointer"
        />

        {/* Transparent Toggle */}
        <button
          className={`w-full rounded px-3 py-2 ${
            bgTransparent ? 'bg-emerald-500' : 'bg-slate-700'
          }`}
          onClick={() => setBgTransparent((v) => !v)}
        >
          {bgTransparent ? 'Transparent ON' : 'Transparent OFF'}
        </button>
      </div>
    </div>
  );
}
