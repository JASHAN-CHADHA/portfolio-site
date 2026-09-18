import * as THREE from 'three';
import gsap from 'gsap';

// Global Scene variables
export let scene;
export let camera;
export let renderer;

// Lights references for dynamic theme transitions
let ambientLight;
let pointLightCyan;
let pointLightPurple;
let dirLight;

// Animation Tick Callbacks Registry
const tickCallbacks = [];

// Performance Settings
export const perfSettings = {
  highPerformance: true,
  maxParticles: 4000,
  useShadows: true,
  pixelRatioLimit: 2
};

/**
 * Initializes the Three.js scene environment on the given canvas element.
 * @param {HTMLCanvasElement} canvas
 */
export function initScene(canvas) {
  // 1. Create Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05050a);
  scene.fog = new THREE.FogExp2(0x05050a, 0.015); // Match CSS --bg-color

  // 2. Setup Camera
  camera = new THREE.PerspectiveCamera(
    60, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clip
    1000 // Far clip
  );
  // Default camera starting position (over the shoulder / home view)
  camera.position.set(0, 0, 80);

  // 3. Setup WebGL Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: false,
    antialias: true,
    powerPreference: 'high-performance'
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x05050a, 1);
  updatePixelRatio();
  
  // Color configuration
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // 4. Add Lights
  // Ambient fill
  ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
  scene.add(ambientLight);

  // Neon point light 1 (Cyan)
  pointLightCyan = new THREE.PointLight(0x00f2fe, 8, 150);
  pointLightCyan.position.set(-30, 20, 20);
  scene.add(pointLightCyan);

  // Neon point light 2 (Purple)
  pointLightPurple = new THREE.PointLight(0xbd00ff, 12, 180);
  pointLightPurple.position.set(30, -20, 10);
  scene.add(pointLightPurple);

  // Directional soft light for depth shadows
  dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
  dirLight.position.set(0, 50, 100);
  scene.add(dirLight);

  // 5. Handle Resize
  window.addEventListener('resize', onWindowResize);

  // 6. Start Render Loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.elapsedTime;

    // Execute registered tick callbacks
    for (const callback of tickCallbacks) {
      callback(elapsedTime, deltaTime);
    }

    renderer.render(scene, camera);
  }
  animate();
}

/**
 * Handle browser viewport resizing
 */
function onWindowResize() {
  if (!camera || !renderer) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  updatePixelRatio();
}

/**
 * Adjust pixel ratio based on quality setting
 */
function updatePixelRatio() {
  if (!renderer) return;
  const ratio = Math.min(window.devicePixelRatio, perfSettings.highPerformance ? perfSettings.pixelRatioLimit : 1);
  renderer.setPixelRatio(ratio);
}

/**
 * Register a callback to execute on every render frame
 * @param {Function} callback (elapsedTime, deltaTime) => {}
 */
export function addTickCallback(callback) {
  tickCallbacks.push(callback);
}

/**
 * Toggle performance configurations dynamically
 */
export function togglePerformanceMode() {
  perfSettings.highPerformance = !perfSettings.highPerformance;
  updatePixelRatio();
  
  // Return true if high-perf is active
  return perfSettings.highPerformance;
}

/**
 * Smoothly updates scene lighting, fog, and background clear colors based on theme.
 * @param {boolean} isLight
 * @param {number} duration
 */
export function setSceneTheme(isLight, duration = 0.6) {
  if (!scene || !renderer) return;

  const targetBgHex = isLight ? 0xf1f5f9 : 0x05050a;
  const targetBgColor = new THREE.Color(targetBgHex);
  
  const currentClearColor = new THREE.Color();
  renderer.getClearColor(currentClearColor);
  
  const colorProxy = {
    r: currentClearColor.r,
    g: currentClearColor.g,
    b: currentClearColor.b
  };

  if (duration === 0) {
    const col = targetBgColor;
    renderer.setClearColor(col, 1);
    if (scene.fog) scene.fog.color.copy(col);
    if (scene.background) scene.background.copy(col);
  } else {
    gsap.to(colorProxy, {
      r: targetBgColor.r,
      g: targetBgColor.g,
      b: targetBgColor.b,
      duration: duration,
      ease: 'power2.out',
      onUpdate: () => {
        const col = new THREE.Color(colorProxy.r, colorProxy.g, colorProxy.b);
        renderer.setClearColor(col, 1);
        if (scene.fog) scene.fog.color.copy(col);
        if (scene.background) scene.background.copy(col);
      }
    });
  }

  // Adjust lights
  if (ambientLight) {
    if (duration === 0) {
      ambientLight.intensity = isLight ? 0.4 : 0.08;
    } else {
      gsap.to(ambientLight, {
        intensity: isLight ? 0.4 : 0.08,
        duration: duration
      });
    }
  }

  if (pointLightCyan) {
    const targetCyan = new THREE.Color(isLight ? 0x0284c7 : 0x00f2fe);
    if (duration === 0) {
      pointLightCyan.color.copy(targetCyan);
      pointLightCyan.intensity = isLight ? 9 : 8;
    } else {
      gsap.to(pointLightCyan.color, {
        r: targetCyan.r,
        g: targetCyan.g,
        b: targetCyan.b,
        duration: duration
      });
      gsap.to(pointLightCyan, {
        intensity: isLight ? 9 : 8,
        duration: duration
      });
    }
  }

  if (pointLightPurple) {
    const targetPurple = new THREE.Color(isLight ? 0x7c3aed : 0xbd00ff);
    if (duration === 0) {
      pointLightPurple.color.copy(targetPurple);
      pointLightPurple.intensity = isLight ? 13 : 12;
    } else {
      gsap.to(pointLightPurple.color, {
        r: targetPurple.r,
        g: targetPurple.g,
        b: targetPurple.b,
        duration: duration
      });
      gsap.to(pointLightPurple, {
        intensity: isLight ? 13 : 12,
        duration: duration
      });
    }
  }

  if (dirLight) {
    if (duration === 0) {
      dirLight.intensity = isLight ? 0.65 : 0.4;
    } else {
      gsap.to(dirLight, {
        intensity: isLight ? 0.65 : 0.4,
        duration: duration
      });
    }
  }
}
