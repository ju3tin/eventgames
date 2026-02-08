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
  const currentModelRef = useRef<THREE.Group | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});

  const [models, setModels] = useState<ModelItem[]>([]);
  const [activeModel, setActiveModel] = useState<ModelItem | null>(null);
  const [animationNames, setAnimationNames] = useState<string[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [rotateEnabled, setRotateEnabled] = useState(false);
  const [bgHex, setBgHex] = useState('#020617');
  const [bgTransparent, setBgTransparent] = useState(true);

  const router = useRouter();
  const clock = new THREE.Clock();

  // 1. Load model list
  useEffect(() => {
    fetch('/dino.json')
      .then((res) => res.json())
      .then((data: ModelItem[]) => {
        setModels(data);
        const index = parseInt(params.slug, 10);
        const validIndex = isNaN(index) || index < 0 || index >= data.length ? 0 : index;
        setActiveModel(data[validIndex]);
      })
      .catch((err) => console.error('Failed to load dino.json', err));
  }, [params.slug]);

  // 2. One-time scene + renderer + controls setup
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(8, 10, 6);
    scene.add(dirLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableRotate = false; // controlled via state
    controls.minDistance = 1;
    controls.maxDistance = 80;

    // Resize handler
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !mountRef.current) return;
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (mixerRef.current) mixerRef.current.update(delta);
      if (controlsRef.current) controlsRef.current.update();

      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // one-time setup

  // 3. Update rotate controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enableRotate = rotateEnabled;
    }
  }, [rotateEnabled]);

  // 4. Update background
  useEffect(() => {
    if (!rendererRef.current) return;
    if (bgTransparent) {
      rendererRef.current.setClearColor(0x000000, 0);
    } else {
      rendererRef.current.setClearColor(bgHex, 1);
    }
  }, [bgHex, bgTransparent]);

  // 5. Load & switch model when activeModel changes
  useEffect(() => {
    if (!activeModel?.url || !sceneRef.current) return;

    const scene = sceneRef.current;

    // Cleanup previous model
    if (currentModelRef.current) {
      scene.remove(currentModelRef.current);

      // Dispose geometry & materials (basic version)
      currentModelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m?.dispose?.());
          } else {
            child.material?.dispose?.();
          }
        }
      });

      currentModelRef.current = null;
    }

    // Stop & clear old animations
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
    }
    actionsRef.current = {};
    setAnimationNames([]);
    setActiveAnimation(null);

    // Load new model
    const loader = new GLTFLoader();
    loader.load(
      activeModel.url,
      (gltf) => {
        const model = gltf.scene;
        currentModelRef.current = model;
        scene.add(model);

        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Fit camera
        const maxDim = Math.max(size.x, size.y, size.z);
        const fovRad = (cameraRef.current!.fov * Math.PI) / 180;
        const distance = (maxDim * 1.4) / Math.sin(fovRad / 2);

        cameraRef.current!.position.set(0, maxDim * 0.4, distance);
        cameraRef.current!.lookAt(0, 0, 0);

        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.minDistance = distance * 0.4;
          controlsRef.current.maxDistance = distance * 3;
          controlsRef.current.update();
        }

        // Setup animations
        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;

        const names: string[] = [];
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          actionsRef.current[clip.name] = action;
          names.push(clip.name);
        });

        setAnimationNames(names);

        if (names.length > 0) {
          actionsRef.current[names[0]]?.reset().fadeIn(0.3).play();
          setActiveAnimation(names[0]);
        }
      },
      undefined,
      (err) => console.error('GLTF load failed:', err)
    );

    // Cleanup function (for when component unmounts or model changes again)
    return () => {
      if (currentModelRef.current && scene.contains(currentModelRef.current)) {
        scene.remove(currentModelRef.current);
      }
    };
  }, [activeModel]);

  const playAnimation = (name: string) => {
    if (!mixerRef.current) return;

    // Fade out all
    Object.values(actionsRef.current).forEach((action) => {
      action.fadeOut(0.25);
    });

    const target = actionsRef.current[name];
    if (target) {
      target.reset().fadeIn(0.25).play();
      setActiveAnimation(name);
    }
  };

  const changeModel = (index: number) => {
    if (index < 0 || index >= models.length) return;
    setActiveModel(models[index]);
    router.push(`/dino4/${index}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* 3D Canvas */}
      <div ref={mountRef} className="flex-1 relative" />

      {/* Sidebar Controls */}
      <div className="w-80 bg-slate-900/90 backdrop-blur-sm text-white p-5 border-l border-slate-700 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Dino Viewer</h2>

        {/* Model selector */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Select Model</h3>
          <div className="grid grid-cols-2 gap-2">
            {models.map((model, idx) => (
              <button
                key={model.name}
                onClick={() => changeModel(idx)}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  activeModel?.name === model.name
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-slate-700 my-5" />

        {/* Animations */}
        <h3 className="text-lg font-semibold mb-2">Animations</h3>
        <div className="space-y-2 mb-6">
          {animationNames.length === 0 ? (
            <p className="text-slate-400 text-sm">No animations found</p>
          ) : (
            animationNames.map((name) => (
              <button
                key={name}
                onClick={() => playAnimation(name)}
                className={`w-full text-left px-4 py-2 rounded transition-colors ${
                  activeAnimation === name
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {name}
              </button>
            ))
          )}
        </div>

        <hr className="border-slate-700 my-5" />

        {/* Rotate toggle */}
        <button
          onClick={() => setRotateEnabled((v) => !v)}
          className={`w-full px-4 py-3 rounded font-medium transition-colors mb-4 ${
            rotateEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          {rotateEnabled ? 'Disable Auto-Rotate' : 'Enable Auto-Rotate'}
        </button>

        {/* Background */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">Background Color</label>
          <input
            type="color"
            value={bgHex}
            onChange={(e) => {
              setBgHex(e.target.value);
              setBgTransparent(false);
            }}
            className="w-full h-10 rounded cursor-pointer bg-transparent border border-slate-600"
          />

          <button
            onClick={() => setBgTransparent((v) => !v)}
            className={`w-full px-4 py-3 rounded font-medium transition-colors ${
              bgTransparent ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {bgTransparent ? 'Transparent Background' : 'Solid Background'}
          </button>
        </div>
      </div>
    </div>
  );
}
