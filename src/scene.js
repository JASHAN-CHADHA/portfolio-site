import * as THREE from 'three';

// Global Scene variables
export let scene;
export let camera;
export let renderer;

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
  updatePixelRatio();
  
  // Color configuration
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // 4. Add Lights
  // Ambient fill
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
  scene.add(ambientLight);

  // Neon point light 1 (Cyan)
  const pointLightCyan = new THREE.PointLight(0x00f2fe, 8, 150);
  pointLightCyan.position.set(-30, 20, 20);
  scene.add(pointLightCyan);

  // Neon point light 2 (Purple)
  const pointLightPurple = new THREE.PointLight(0xbd00ff, 12, 180);
  pointLightPurple.position.set(30, -20, 10);
  scene.add(pointLightPurple);

  // Directional soft light for depth shadows
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
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
