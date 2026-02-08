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
  const [activeModel, setActiveModel] = useState<ModelItem | null>(null);
  const [animationNames, setAnimationNames] = useState<string[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [rotateEnabled, setRotateEnabled] = useState(false);
  const [bgHex, setBgHex] = useState('#020617');
  const [bgTransparent, setBgTransparent] = useState(true);

  const router = useRouter();
  const clock = new THREE.Clock();

  // 1. Load list of models
  useEffect(() => {
    fetch('/dino.json')
      .then((res) => res.json())
      .then((data: ModelItem[]) => {
        setModels(data);
        const index = parseInt(params.slug, 10);
        const validIndex = isNaN(index) || index < 0 || index >= data.length ? 0 : index;
        setActiveModel(data[validIndex]);
      })
      .catch((err) => console.error('Failed to load dino.json:', err));
  }, [params.slug]);

  // 2. One-time Three.js setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

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

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // Aggressive dispose
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((mat) => mat?.dispose());
        }
      });
    };
  }, []);

  // 3. Rotate toggle
  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      controls.enableRotate = rotateEnabled;
      controls.autoRotate = rotateEnabled;
      controls.autoRotateSpeed = 1.2;
    }
  }, [rotateEnabled]);

  // 4. Background
  useEffect(() => {
    const renderer = rendererRef.current;
    if (renderer) {
      renderer.setClearColor(bgTransparent ? 0x000000 : bgHex, bgTransparent ? 0 : 1);
    }
  }, [bgHex, bgTransparent]);

  // 5. Model loading & switching
  useEffect(() => {
    if (!activeModel?.url || !sceneRef.current || !cameraRef.current) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;

    // Remove & clean previous model
    if (currentModelRef.current) {
      const prev = currentModelRef.current;
      if (prev.parent) {
        prev.parent.remove(prev);
      }
      prev.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => m?.dispose());
        }
      });
      currentModelRef.current = null;
    }

    // Clear old animations
    mixerRef.current?.stopAllAction();
    actionsRef.current = {};
    setAnimationNames([]);
    setActiveAnimation(null);

    const loader = new GLTFLoader();
    loader.load(
      activeModel.url,
      (gltf) => {
        const model = gltf.scene;
        currentModelRef.current = model;
        scene.add(model);

        // Center
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Frame camera
        const maxDim = Math.max(size.x, size.y, size.z);
        const fovRad = (camera.fov * Math.PI) / 180;
        const distance = (maxDim * 1.5) / Math.sin(fovRad / 2);

        camera.position.set(0, maxDim * 0.45, distance);
        camera.lookAt(0, 0, 0);

        const controls = controlsRef.current;
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.minDistance = distance * 0.3;
          controls.maxDistance = distance * 4;
          controls.update();
        }

        // Animations
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
          actionsRef.current[names[0]]?.reset().fadeIn(0.4).play();
          setActiveAnimation(names[0]);
        }
      },
      undefined,
      (err) => console.error('GLTF load failed:', err)
    );

    // Cleanup for next effect run / unmount
    return () => {
      if (currentModelRef.current?.parent) {
        currentModelRef.current.parent.remove(currentModelRef.current);
      }
    };
  }, [activeModel]);

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
    router.push(`/dino4/${index}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Canvas */}
      <div ref={mountRef} className="flex-1" />

      {/* Sidebar */}
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
                  activeModel?.name === m.name
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
