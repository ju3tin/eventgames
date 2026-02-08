'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function GLBPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [bgColor, setBgColor] = useState<string | null>(null);
   const [bgHex, setBgHex] = useState<string>('#020617');
  
  const [bgTransparent, setBgTransparent] = useState<boolean>(true);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const clock = new THREE.Clock();

  const [animationNames, setAnimationNames] = useState<string[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [rotateEnabled, setRotateEnabled] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    /* ---------------- Scene ---------------- */
    const scene = new THREE.Scene();
   // scene.background = new THREE.Color('#020617');

    /* ---------------- Camera ---------------- */
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    /* ---------------- Renderer ---------------- */
       const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    /* ---------------- Controls ---------------- */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Zoom defaults
    controls.enableZoom = true;
    controls.zoomSpeed = 0.6;
    controls.minDistance = 1;
    controls.maxDistance = 20;

    // Disable by default
    controls.enableRotate = false;
    controls.enablePan = false;

    // Mobile tuning
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

    /* ---------------- Lights ---------------- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    /* ---------------- Load GLB ---------------- */
    const loader = new GLTFLoader();
    loader.load('/assets/models/Triceratops.glb', (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      /* ---- Fit camera to model bounds ---- */
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      model.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
      cameraZ *= 1.2;

      camera.position.set(0, maxDim * 0.6, cameraZ);
      camera.lookAt(0, 0, 0);

      controls.target.set(0, 0, 0);
      controls.update();

      controls.minDistance = cameraZ * 0.5;
      controls.maxDistance = cameraZ * 2;

      /* ---- Animations ---- */
      const mixer = new THREE.AnimationMixer(model);
      mixerRef.current = mixer;

      gltf.animations.forEach((clip) => {
        actionsRef.current[clip.name] = mixer.clipAction(clip);
      });

      const names = gltf.animations.map((a) => a.name);
      setAnimationNames(names);

      if (names.length > 0) {
        actionsRef.current[names[0]].play();
        setActiveAnimation(names[0]);
      }
    });

    /* ---------------- Resize ---------------- */
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

    /* ---------------- Loop ---------------- */
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      mixerRef.current?.update(clock.getDelta());
      controls.enableRotate = rotateEnabled;
      controls.update();

      renderer.render(scene, camera);
    };

    animate();

     useEffect(() => {
  if (!rendererRef.current) return;

  if (bgColor === null) {
    rendererRef.current.setClearColor(0x000000, 0);
  } else {
    rendererRef.current.setClearColor(bgColor, 1);
  }
}, [bgColor]);

  useEffect(() => {
  if (!rendererRef.current) return;

  if (bgTransparent) {
    rendererRef.current.setClearColor(0x000000, 0);
  } else {
    rendererRef.current.setClearColor(bgHex, 1);
  }
}, [bgHex, bgTransparent]);


    /* ---------------- Cleanup ---------------- */
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [rotateEnabled]);

  /* ---------------- Animation Switch ---------------- */
  const playAnimation = (name: string) => {
    if (!mixerRef.current) return;

    Object.values(actionsRef.current).forEach((action) =>
      action.fadeOut(0.25)
    );

    actionsRef.current[name].reset().fadeIn(0.25).play();
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

        <hr className="border-slate-700 my-3" />

        <button
          className={`w-full rounded px-3 py-2 ${
            rotateEnabled ? 'bg-emerald-500' : 'bg-slate-700'
          }`}
          onClick={() => setRotateEnabled((v) => !v)}
        >
          {rotateEnabled ? 'Disable Rotate' : 'Enable Rotate'}
        </button>

        <button className={`w-full rounded px-3 py-2 bg-emerald-500`} onClick={() => setBgColor(null)}>Transparent</button>
<button className={`w-full rounded px-3 py-2 bg-emerald-500`} onClick={() => setBgColor('#020617')}>Dark</button>
<button className={`w-full rounded px-3 py-2 bg-emerald-500`} onClick={() => setBgColor('#0f172a')}>Slate</button>
<div className="space-y-2">
  {/* Hex picker */}
  <input
    type="color"
    value={bgHex}
    onChange={(e) => {
      setBgHex(e.target.value);
      setBgTransparent(false);
    }}
    className="w-full h-10 rounded cursor-pointer"
  />

  {/* Transparent toggle */}
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
    </div>
  );
}
