'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type ModelItem = {
  name: string;
  url: string;
};

interface Props {
  params: { slug: string };
}

export default function GLBViewerPage({ params }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentModelRef = useRef<THREE.Object3D | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});

  const [models, setModels] = useState<ModelItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [animationNames, setAnimationNames] = useState<string[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [rotateEnabled, setRotateEnabled] = useState(false);
  const [bgHex, setBgHex] = useState('#020617');
  const [bgTransparent, setBgTransparent] = useState(true);

  const router = useRouter();
  const clock = new THREE.Clock();

  // ────────────────────────────────────────────────
  // 1. Load models list once
  // ────────────────────────────────────────────────
  useEffect(() => {
    console.log('[INIT] Fetching dino.json...');
    fetch('/dino.json')
      .then((res) => res.json())
      .then((data: ModelItem[]) => {
        console.log('[MODELS LOADED]', data.length, 'models found');
        setModels(data);
      })
      .catch((err) => console.error('[ERROR] Failed to load dino.json:', err));
  }, []);

  // ────────────────────────────────────────────────
  // 2. Sync activeIndex from URL slug whenever slug changes
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (models.length === 0) {
      console.log('[SLUG SYNC] Waiting for models to load...');
      return;
    }

    const idx = parseInt(params.slug, 10);
    const validIndex = isNaN(idx) || idx < 0 || idx >= models.length ? 0 : idx;

    console.log(
      `[SLUG CHANGED] params.slug = ${params.slug}, calculated index = ${validIndex}`
    );

    setActiveIndex((prev) => {
      if (prev !== validIndex) {
        console.log(`[ACTIVE INDEX UPDATED] ${prev} → ${validIndex}`);
      }
      return validIndex;
    });
  }, [params.slug, models]);

  // ────────────────────────────────────────────────
  // 3. Three.js scene setup (once)
  // ────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    console.log('[SCENE SETUP] Initializing Three.js...');

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(8, 10, 6);
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.minDistance = 1;
    controls.maxDistance = 80;

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !mountRef.current) return;
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixerRef.current?.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      console.log('[SCENE CLEANUP] Disposing Three.js resources...');
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mat) => mat?.dispose());
        }
      });
    };
  }, []);

  // Rotate toggle
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enableRotate = rotateEnabled;
      controlsRef.current.autoRotate = rotateEnabled;
      controlsRef.current.autoRotateSpeed = 1.2;
    }
  }, [rotateEnabled]);

  // Background
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(bgTransparent ? 0x000000 : bgHex, bgTransparent ? 0 : 1);
    }
  }, [bgHex, bgTransparent]);

  // ────────────────────────────────────────────────
  // 4. Load/switch model when activeIndex changes
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (models.length === 0) return;

    const model = models[activeIndex];
    if (!model?.url) {
      console.warn('[MODEL] No URL for active index:', activeIndex);
      return;
    }

    if (!sceneRef.current || !cameraRef.current) {
      console.warn('[MODEL] Scene or camera not ready yet');
      return;
    }

    console.log(
      `[MODEL LOAD TRIGGERED] Index: ${activeIndex}, Name: ${model.name}, URL: ${model.url}`
    );

    const scene = sceneRef.current;
    const camera = cameraRef.current;

    // Cleanup previous model
    if (currentModelRef.current) {
      console.log('[MODEL] Removing previous model');
      const prev = currentModelRef.current;
      if (prev.parent) prev.parent.remove(prev);
      prev.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => m?.dispose());
        }
      });
      currentModelRef.current = null;
    }

    mixerRef.current?.stopAllAction();
    actionsRef.current = {};
    setAnimationNames([]);
    setActiveAnimation(null);

    const loader = new GLTFLoader();
    console.log('[GLTF] Starting load:', model.url);

    loader.load(
      model.url,
      (gltf) => {
        console.log('[GLTF] Load SUCCESS:', model.name);
        const obj = gltf.scene;
        currentModelRef.current = obj;
        scene.add(obj);

        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        obj.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fovRad = (camera.fov * Math.PI) / 180;
        const distance = (maxDim * 1.5) / Math.sin(fovRad / 2);

        camera.position.set(0, maxDim * 0.45, distance);
        camera.lookAt(0, 0, 0);

        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.minDistance = distance * 0.3;
          controlsRef.current.maxDistance = distance * 4;
          controlsRef.current.update();
        }

        const mixer = new THREE.AnimationMixer(obj);
        mixerRef.current = mixer;

        const names: string[] = [];
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          actionsRef.current[clip.name] = action;
          names.push(clip.name);
        });
        setAnimationNames(names);

        if (names.length > 0) {
          actionsRef.current[names[0]]?.reset().fadeIn(0.4).play();
          setActiveAnimation(names[0]);
        }
      },
      undefined,
      (err) => {
        console.error('[GLTF] Load FAILED:', model.url, err);
      }
    );

    return () => {
      if (currentModelRef.current?.parent) {
        console.log('[MODEL] Cleanup on unmount/change');
        currentModelRef.current.parent.remove(currentModelRef.current);
      }
    };
  }, [models, activeIndex]);

  const playAnimation = (name: string) => {
    if (!mixerRef.current) return;
    Object.values(actionsRef.current).forEach((a) => a.fadeOut(0.3));
    const action = actionsRef.current[name];
    if (action) {
      action.reset().fadeIn(0.3).play();
      setActiveAnimation(name);
    }
  };

  const changeModel = (index: number) => {
    if (index < 0 || index >= models.length) return;
    console.log(`[UI] User clicked model index: ${index}`);
    setActiveIndex(index);
    router.push(`/dino4/${index}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <div ref={mountRef} className="flex-1" />
      <div className="w-80 bg-slate-900/95 text-white p-5 border-l border-slate-700 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Dino Viewer</h2>
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Select Model</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {models.map((m, i) => (
              <button
                key={m.name}
                onClick={() => changeModel(i)}
                className={`px-4 py-2.5 rounded text-sm transition-colors ${
                  activeIndex === i
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
        <hr className="border-slate-700 my-6" />
        <h3 className="text-lg font-semibold mb-3">Animations</h3>
        <div className="space-y-2 mb-8">
          {animationNames.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No animations available</p>
          ) : (
            animationNames.map((name) => (
              <button
                key={name}
                onClick={() => playAnimation(name)}
                className={`w-full text-left px-4 py-2.5 rounded transition-colors ${
                  activeAnimation === name
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {name}
              </button>
            ))
          )}
        </div>
        <hr className="border-slate-700 my-6" />
        <div className="space-y-4">
          <button
            onClick={() => setRotateEnabled((v) => !v)}
            className={`w-full py-3 rounded font-medium transition-colors ${
              rotateEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {rotateEnabled ? 'Disable Auto-Rotate' : 'Enable Auto-Rotate'}
          </button>
          <div>
            <label className="block text-sm font-medium mb-2">Background</label>
            <input
              type="color"
              value={bgHex}
              onChange={(e) => {
                setBgHex(e.target.value);
                setBgTransparent(false);
              }}
              className="w-full h-10 rounded cursor-pointer bg-transparent border border-slate-600"
            />
          </div>
          <button
            onClick={() => setBgTransparent((v) => !v)}
            className={`w-full py-3 rounded font-medium transition-colors ${
              bgTransparent ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {bgTransparent ? 'Transparent BG' : 'Solid BG'}
          </button>
        </div>
      </div>
    </div>
  );
}
