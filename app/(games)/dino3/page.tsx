'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type ModelItem = {
  name: string;
  url: string;
};

export default function GLBPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const modelRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const clock = new THREE.Clock();

  const [models, setModels] = useState<ModelItem[]>([]);
  const [activeModel, setActiveModel] = useState<ModelItem | null>(null);

  const [animationNames, setAnimationNames] = useState<string[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [rotateEnabled, setRotateEnabled] = useState(false);
  const [bgColor, setBgColor] = useState<string | null>(null);

  /* ---------------- Fetch Models API ---------------- */
  useEffect(() => {
    fetch('/dino.json')
      .then((res) => res.json())
      .then((data: ModelItem[]) => {
        setModels(data);
        setActiveModel(data[0]);
      });
  }, []);

  /* ---------------- Scene Setup (once) ---------------- */
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
   // scene.background = new THREE.Color('#020617');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

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

  rendererRef.current = renderer;
  mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableRotate = false;
    controls.enablePan = false;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const onResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current)
        return;

      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };

    window.addEventListener('resize', onResize);

    const animate = () => {
      requestAnimationFrame(animate);
      mixerRef.current?.update(clock.getDelta());
      controls.enableRotate = rotateEnabled;
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [rotateEnabled]);

  useEffect(() => {
  if (!rendererRef.current) return;

  if (bgColor === null) {
    rendererRef.current.setClearColor(0x000000, 0);
  } else {
    rendererRef.current.setClearColor(bgColor, 1);
  }
}, [bgColor]);

  /* ---------------- Load Model ---------------- */
  useEffect(() => {
    if (!activeModel || !sceneRef.current || !cameraRef.current) return;

    const loader = new GLTFLoader();

    // Cleanup previous
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
    }
    mixerRef.current = null;
    actionsRef.current = {};
    setAnimationNames([]);
    setActiveAnimation(null);

    loader.load(activeModel.url, (gltf) => {
      const model = gltf.scene;
      modelRef.current = model;
      sceneRef.current!.add(model);

      // Center model
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const cameraZ =
        Math.abs(maxDim / Math.sin((cameraRef.current!.fov * Math.PI) / 360)) *
        1.2;

      cameraRef.current!.position.set(0, maxDim * 0.6, cameraZ);
      cameraRef.current!.lookAt(0, 0, 0);

      controlsRef.current!.target.set(0, 0, 0);
      controlsRef.current!.minDistance = cameraZ * 0.5;
      controlsRef.current!.maxDistance = cameraZ * 2;
      controlsRef.current!.update();

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
  }, [activeModel]);

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
        <h2 className="text-lg font-semibold">Models</h2>

        {models.map((model) => (
          <button
            key={model.name}
            className={`w-full rounded px-3 py-2 ${
              activeModel?.name === model.name
                ? 'bg-purple-500'
                : 'bg-slate-700'
            }`}
            onClick={() => setActiveModel(model)}
          >
            {model.name}
          </button>
        ))}

        <hr className="border-slate-700 my-3" />

        <h2 className="text-lg font-semibold">Animations</h2>

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

        <button className={`w-full rounded px-3 py-2`} onClick={() => setBgColor(null)}>Transparent</button>
<button className={`w-full rounded px-3 py-2`} onClick={() => setBgColor('#020617')}>Dark</button>
<button className={`w-full rounded px-3 py-2`} onClick={() => setBgColor('#0f172a')}>Slate</button>

      </div>
    </div>
  );
}
