import * as THREE from 'three';
import { scene, camera, addTickCallback } from './scene.js';
import { setNavEnabled } from './navigation.js';
import gsap from 'gsap';

// ─────────────────────────────────────────────
//  Game State
// ─────────────────────────────────────────────
export const gameState = {
  active: false,
  score: 0,
  collected: [false, false, false, false],
  bikeZ: 0,
  bikeX: 0,
  speed: 0,
};

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const ROAD_WIDTH = 14;
const SEG_LEN = 40;
const NUM_SEGS = 20;
const CHECKPOINT_Z = [-100, -240, -380, -520];
const MIN_SPEED = 0.08;   // slow crawl
const BASE_SPEED = 0.18;  // default cruise
const MAX_SPEED = 0.55;   // full throttle
const STEER = 0.055;
const MAX_LATERAL = 5.0;

// ─────────────────────────────────────────────
//  Scene objects
// ─────────────────────────────────────────────
let bikeGroup = null;
let roadGroup = null;
let envGroup = null;
const checkpoints = [];
const roadSegs = [];

// ─────────────────────────────────────────────
//  Input
// ─────────────────────────────────────────────
const keys = { left: false, right: false, up: false, down: false };

// ─────────────────────────────────────────────
//  DOM
// ─────────────────────────────────────────────
let hudEl = null;
let victoryModal = null;
let startBtn = null;

// ─────────────────────────────────────────────
//  Portfolio checkpoint content
// ─────────────────────────────────────────────
const nodeInfo = [
  {
    icon: '👤',
    title: 'ABOUT ME',
    text: 'Full Stack Developer dedicated to engineering robust, high-performance web systems. Proficient in Python, Java, and modern web technologies — bridging complex backends with polished frontends.',
    stats: 'Class: Full-Stack Dev | XP: 9999 | Status: Online',
    color: '#00f2fe',
  },
  {
    icon: '⚙️',
    title: 'SKILLS ENGINE',
    text: 'Python (Django / Flask) · Java OOP & DSA · HTML5 · CSS3 · ES6+ JavaScript · REST APIs · Git / GitHub · Database Architecture.',
    stats: 'Backend: 95% | Frontend: 92% | OOP/DSA: 90%',
    color: '#bd00ff',
  },
  {
    icon: '🚀',
    title: 'PROJECTS',
    text: '01. Easy PDF Tools — comprehensive cloud-hosted document utility\n02. PyNetwork Nodes — interactive dashboard visualiser\n03. Java Task Core — multithreaded processor scheduler',
    stats: 'Build Success: 100% | Deployments: Render',
    color: '#ff007a',
  },
  {
    icon: '📡',
    title: 'CONTACT',
    text: 'Ready to build something great together? Reach out at hello@jashandeepsingh.dev or use the contact form at the bottom of this page.',
    stats: 'Availability: Active | Status: Open for Hire',
    color: '#00ff88',
  },
];

// ─────────────────────────────────────────────
//  PUBLIC: init
// ─────────────────────────────────────────────
export function initGame() {
  startBtn = document.getElementById('start-game-btn');
  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!gameState.active) startBikeGame();
    });
  }

  // ── HUD ──────────────────────────────────────
  hudEl = document.createElement('div');
  hudEl.id = 'game-hud';
  hudEl.className = 'glass-card hidden';
  hudEl.innerHTML = `
    <div class="hud-header">
      <span class="hud-icon">🏍️</span>
      <span>PORTFOLIO RIDE</span>
    </div>
    <div class="hud-row">
      <span class="hud-label">Checkpoints</span>
      <span class="hud-value" id="hud-count">0 / 4</span>
    </div>
    <div class="hud-row">
      <span class="hud-label">Speed</span>
      <span class="hud-value" id="hud-speed">0 km/h</span>
    </div>
    <div class="hud-mini-map" id="hud-mini-map">
      <div class="mini-road"></div>
      <div class="mini-bike" id="mini-bike"></div>
    </div>
    <div class="hud-controls">↑ W = Throttle &nbsp;↓ S = Brake<br>← → / A D = Steer</div>
    <button id="exit-sim-btn" class="hud-exit-btn">✕ Exit Ride</button>
  `;
  document.body.appendChild(hudEl);

  // ── Victory Modal ────────────────────────────
  victoryModal = document.createElement('div');
  victoryModal.id = 'victory-modal';
  victoryModal.className = 'glass-card hidden';
  victoryModal.innerHTML = `
    <div class="victory-emoji">🏁</div>
    <h2>RIDE COMPLETE!</h2>
    <p>You've discovered all four sections of Jashandeep's portfolio on your city ride.</p>
    <div class="victory-badge">EXPLORER BADGE UNLOCKED</div>
    <button id="victory-close-btn" class="btn btn-primary btn-glow">Return to Portfolio</button>
  `;
  document.body.appendChild(victoryModal);

  // ── Mobile Controls ──────────────────────────
  const mobileControls = document.createElement('div');
  mobileControls.id = 'mobile-game-controls';
  mobileControls.className = 'hidden';
  mobileControls.innerHTML = `
    <div class="mobile-steer-cluster">
      <button id="mobile-btn-left" class="mobile-btn" aria-label="Steer Left">◀</button>
      <button id="mobile-btn-right" class="mobile-btn" aria-label="Steer Right">▶</button>
    </div>
    <div class="mobile-pedal-cluster">
      <button id="mobile-btn-down" class="mobile-btn brake-btn" aria-label="Brake">BRAKE</button>
      <button id="mobile-btn-up" class="mobile-btn gas-btn" aria-label="Accelerate">GAS</button>
    </div>
  `;
  document.body.appendChild(mobileControls);

  const setupMobileButton = (btnId, keyName) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    const press = (e) => {
      e.preventDefault();
      keys[keyName] = true;
      btn.classList.add('active');
    };

    const release = (e) => {
      e.preventDefault();
      keys[keyName] = false;
      btn.classList.remove('active');
    };

    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend', release, { passive: false });
    btn.addEventListener('touchcancel', release, { passive: false });

    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
  };

  setupMobileButton('mobile-btn-left', 'left');
  setupMobileButton('mobile-btn-right', 'right');
  setupMobileButton('mobile-btn-up', 'up');
  setupMobileButton('mobile-btn-down', 'down');

  document.getElementById('exit-sim-btn').addEventListener('click', exitBikeGame);
  document.getElementById('victory-close-btn').addEventListener('click', () => {
    victoryModal.classList.add('hidden');
    exitBikeGame();
  });

  addTickCallback(updateBikeGame);
}

// ─────────────────────────────────────────────
//  Start game
// ─────────────────────────────────────────────
export function startBikeGame() {
  gameState.active = true;
  gameState.score = 0;
  gameState.collected = [false, false, false, false];
  gameState.bikeZ = 0;
  gameState.bikeX = 0;
  gameState.speed = BASE_SPEED; // start moving immediately

  // Disable navigation camera so it doesn't override the game camera
  setNavEnabled(false);
  // Kill any running camera tweens from navigation
  gsap.killTweensOf(camera.position);

  document.getElementById('hud-count').textContent = '0 / 4';
  document.getElementById('hud-speed').textContent = '0 km/h';

  // Scroll to top so the page doesn't fight with the game
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Fade page content
  document.querySelector('.scroll-container').style.opacity = '0.02';
  document.querySelector('.scroll-container').style.pointerEvents = 'none';
  document.querySelector('header').style.opacity = '0.1';

  hudEl.classList.remove('hidden');

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);
  if (isTouchDevice) {
    document.getElementById('mobile-game-controls').classList.remove('hidden');
  }

  // Build 3-D world
  buildRoad();
  buildEnvironment();
  buildBike();
  buildCheckpoints();

  // Keyboard
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Move camera to behind the bike
  camera.position.set(0, 6, 16);
  camera.lookAt(0, 1, -10);
}

// ─────────────────────────────────────────────
//  Road
// ─────────────────────────────────────────────
function buildRoad() {
  roadGroup = new THREE.Group();
  scene.add(roadGroup);

  for (let i = 0; i < NUM_SEGS; i++) {
    const seg = makeRoadSegment(i * -SEG_LEN);
    roadSegs.push(seg);
    roadGroup.add(seg);
  }
}

function makeRoadSegment(zOff) {
  const g = new THREE.Group();
  g.position.z = zOff;

  // Asphalt
  const asphalt = new THREE.Mesh(
    new THREE.PlaneGeometry(ROAD_WIDTH, SEG_LEN),
    new THREE.MeshBasicMaterial({ color: 0x141420 })
  );
  asphalt.rotation.x = -Math.PI / 2;
  g.add(asphalt);

  // Center dashes
  const dashCount = 6;
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.55 });
  for (let d = 0; d < dashCount; d++) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 3.5), dashMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.01, -SEG_LEN / 2 + d * (SEG_LEN / dashCount) + 2);
    g.add(dash);
  }

  // Edge lines
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
  for (const side of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.18, SEG_LEN), edgeMat);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(side * (ROAD_WIDTH / 2 - 0.1), 0.01, 0);
    g.add(edge);
  }

  // Kerbs
  const kerbMat = new THREE.MeshBasicMaterial({ color: 0x2d2d50 });
  for (const side of [-1, 1]) {
    const kerb = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.22, SEG_LEN), kerbMat);
    kerb.position.set(side * (ROAD_WIDTH / 2 + 1.25), 0.1, 0);
    g.add(kerb);
  }

  return g;
}

// ─────────────────────────────────────────────
//  Environment (buildings + street lights)
// ─────────────────────────────────────────────
function buildEnvironment() {
  envGroup = new THREE.Group();
  scene.add(envGroup);

  const buildingZ = 35;
  for (let i = 0; i < buildingZ; i++) {
    const z = -(i * 16 + 4);
    for (const side of [-1, 1]) {
      envGroup.add(makeBuilding(side * (ROAD_WIDTH / 2 + 5 + Math.random() * 10), z));
    }
    if (i % 2 === 0) {
      for (const side of [-1, 1]) {
        envGroup.add(makeStreetLight(side * (ROAD_WIDTH / 2 + 1.3), z));
      }
    }
  }
}

function makeBuilding(x, z) {
  const g = new THREE.Group();
  const h = 8 + Math.random() * 28;
  const w = 5 + Math.random() * 6;
  const d = 4 + Math.random() * 6;

  const baseColors = [0x0c1526, 0x141932, 0x0f1a2e, 0x0a1220];
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshBasicMaterial({ color: baseColors[Math.floor(Math.random() * baseColors.length)] })
  );
  body.position.set(x, h / 2, z);
  g.add(body);

  // Windows
  const winColors = [0x00f2fe, 0xffd700, 0xbd00ff, 0xff6b35, 0xaaddff];
  const cols = Math.floor(w / 1.6);
  const rows = Math.floor(h / 2.8);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < 0.55) {
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(0.55, 0.65),
          new THREE.MeshBasicMaterial({
            color: winColors[Math.floor(Math.random() * winColors.length)],
            transparent: true,
            opacity: 0.3 + Math.random() * 0.6,
          })
        );
        win.position.set(
          x - w / 2 + 0.9 + c * 1.6,
          -h / 2 + 1.6 + r * 2.8,
          z + d / 2 + 0.01
        );
        g.add(win);
      }
    }
  }
  return g;
}

function makeStreetLight(x, z) {
  const g = new THREE.Group();

  // Pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 5.5, 6),
    new THREE.MeshBasicMaterial({ color: 0x445566 })
  );
  pole.position.set(x, 2.75, z);
  g.add(pole);

  // Globe
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff4cc })
  );
  globe.position.set(x + Math.sign(x) * -0.8, 5.5, z);
  g.add(globe);

  return g;
}

// ─────────────────────────────────────────────
//  Bike + Rider (built from primitives)
// ─────────────────────────────────────────────
function buildBike() {
  bikeGroup = new THREE.Group();

  // --- Frame ---
  const cyan = 0x00f2fe;
  const darkBlue = 0x0d0d2b;
  const silver = 0xaabbcc;

  const frameMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.55, 1.9),
    new THREE.MeshBasicMaterial({ color: cyan })
  );
  frameMesh.position.set(0, 0.9, 0);
  bikeGroup.add(frameMesh);

  // Tank
  const tank = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.38, 0.85),
    new THREE.MeshBasicMaterial({ color: darkBlue })
  );
  tank.position.set(0, 1.22, 0.1);
  bikeGroup.add(tank);

  // Seat
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.12, 1.0),
    new THREE.MeshBasicMaterial({ color: 0x111122 })
  );
  seat.position.set(0, 1.32, -0.45);
  bikeGroup.add(seat);

  // Front fairing (cone)
  const fairing = new THREE.Mesh(
    new THREE.ConeGeometry(0.33, 1.05, 6),
    new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.88 })
  );
  fairing.rotation.x = Math.PI / 2;
  fairing.position.set(0, 0.95, 1.18);
  bikeGroup.add(fairing);

  // Headlight
  const headlight = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  headlight.position.set(0, 0.98, 1.65);
  bikeGroup.add(headlight);

  // Wheels
  const wheelMat = new THREE.MeshBasicMaterial({ color: 0x222244 });
  const hubMat = new THREE.MeshBasicMaterial({ color: cyan });
  for (const zOff of [0.88, -0.88]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.13, 8, 24), wheelMat);
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(0, 0.55, zOff);
    bikeGroup.add(wheel);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 8), hubMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(0, 0.55, zOff);
    bikeGroup.add(hub);
  }

  // Front fork
  const fork = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.72, 0.1),
    new THREE.MeshBasicMaterial({ color: silver })
  );
  fork.position.set(0, 0.55, 0.88);
  fork.rotation.x = 0.18;
  bikeGroup.add(fork);

  // Exhaust
  const exhaust = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.075, 1.1, 8),
    new THREE.MeshBasicMaterial({ color: silver })
  );
  exhaust.rotation.z = Math.PI / 2;
  exhaust.position.set(0.34, 0.52, -0.28);
  bikeGroup.add(exhaust);

  // Handlebar
  const handlebar = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.08, 0.08),
    new THREE.MeshBasicMaterial({ color: silver })
  );
  handlebar.position.set(0, 1.38, 0.8);
  bikeGroup.add(handlebar);

  // --- Rider ---
  const riderMat = new THREE.MeshBasicMaterial({ color: 0x1a1a3e });
  const jacketMat = new THREE.MeshBasicMaterial({ color: 0x0d1b3e });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.68, 0.42), jacketMat);
  torso.position.set(0, 2.0, -0.08);
  torso.rotation.x = -0.28;
  bikeGroup.add(torso);

  // Helmet (sphere)
  const helmetMat = new THREE.MeshBasicMaterial({ color: cyan });
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 12), helmetMat);
  helmet.position.set(0, 2.65, 0.12);
  bikeGroup.add(helmet);

  // Visor
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.13, 0.14),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.65 })
  );
  visor.position.set(0, 2.62, 0.36);
  bikeGroup.add(visor);

  // Arms
  for (const side of [-0.3, 0.3]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.52), riderMat);
    arm.position.set(side, 2.05, 0.38);
    arm.rotation.x = 0.42;
    bikeGroup.add(arm);
  }

  // Legs
  for (const side of [-0.17, 0.17]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.58, 0.15), riderMat);
    leg.position.set(side, 1.52, -0.42);
    bikeGroup.add(leg);
  }

  bikeGroup.position.set(0, 0, 0);
  scene.add(bikeGroup);
}

// ─────────────────────────────────────────────
//  Checkpoints
// ─────────────────────────────────────────────
function buildCheckpoints() {
  const colors = [0x00f2fe, 0xbd00ff, 0xff007a, 0x00ff88];
  const labels = ['ABOUT', 'SKILLS', 'PROJECTS', 'CONTACT'];

  CHECKPOINT_Z.forEach((zPos, idx) => {
    const g = new THREE.Group();
    g.position.set(0, 0, zPos);

    const col = colors[idx];

    // Outer ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(4.2, 0.18, 10, 44),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 })
    );
    ring.position.y = 4.5;
    g.add(ring);

    // Inner glow ring
    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.07, 8, 40),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
    );
    innerRing.position.y = 4.5;
    g.add(innerRing);

    // Pillars
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 9, 0.22),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.65 })
      );
      pillar.position.set(side * 4.0, 4.5, 0);
      g.add(pillar);
    }

    // Crossbar
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 0.2, 0.2),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5 })
    );
    bar.position.set(0, 9.1, 0);
    g.add(bar);

    // Canvas label texture
    const canvas2d = document.createElement('canvas');
    canvas2d.width = 512;
    canvas2d.height = 96;
    const ctx = canvas2d.getContext('2d');
    const hex = '#' + col.toString(16).padStart(6, '0');
    ctx.clearRect(0, 0, 512, 96);
    ctx.font = 'bold 52px monospace';
    ctx.fillStyle = hex;
    ctx.textAlign = 'center';
    ctx.shadowColor = hex;
    ctx.shadowBlur = 18;
    ctx.fillText(labels[idx], 256, 62);
    const tex = new THREE.CanvasTexture(canvas2d);
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 1.05),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    labelMesh.position.set(0, 10.3, 0);
    g.add(labelMesh);

    g.userData = { index: idx, collected: false };
    scene.add(g);
    checkpoints.push(g);
  });
}

// ─────────────────────────────────────────────
//  Input handlers
// ─────────────────────────────────────────────
function onKeyDown(e) {
  if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keys.left  = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
  if (e.key === 'ArrowUp'   || e.key === 'w' || e.key === 'W') keys.up    = true;
  if (e.key === 'ArrowDown'  || e.key === 's' || e.key === 'S') keys.down  = true;
}
function onKeyUp(e) {
  if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keys.left  = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  if (e.key === 'ArrowUp'   || e.key === 'w' || e.key === 'W') keys.up    = false;
  if (e.key === 'ArrowDown'  || e.key === 's' || e.key === 'S') keys.down  = false;
}

// ─────────────────────────────────────────────
//  Per-frame game update
// ─────────────────────────────────────────────
function updateBikeGame(elapsedTime, deltaTime) {
  if (!gameState.active || !bikeGroup) return;

  const dt60 = deltaTime * 60; // normalise to ~60 fps

  // ── Speed control ──────────────────────────
  if (keys.up) {
    // Throttle — ramp up fast
    gameState.speed = Math.min(MAX_SPEED, gameState.speed + 0.012 * dt60);
  } else if (keys.down) {
    // Brake — slow down quickly
    gameState.speed = Math.max(MIN_SPEED, gameState.speed - 0.018 * dt60);
  } else {
    // Cruise to BASE_SPEED when neither held
    if (gameState.speed < BASE_SPEED) {
      gameState.speed = Math.min(BASE_SPEED, gameState.speed + 0.004 * dt60);
    } else if (gameState.speed > BASE_SPEED) {
      gameState.speed = Math.max(BASE_SPEED, gameState.speed - 0.006 * dt60);
    }
  }

  // ── Steer ──────────────────────────────────
  if (keys.left) {
    gameState.bikeX = Math.max(-MAX_LATERAL, gameState.bikeX - STEER * dt60);
    bikeGroup.rotation.z = THREE.MathUtils.lerp(bikeGroup.rotation.z,  0.18, 0.12);
    bikeGroup.rotation.y = THREE.MathUtils.lerp(bikeGroup.rotation.y,  0.22, 0.06);
  } else if (keys.right) {
    gameState.bikeX = Math.min( MAX_LATERAL, gameState.bikeX + STEER * dt60);
    bikeGroup.rotation.z = THREE.MathUtils.lerp(bikeGroup.rotation.z, -0.18, 0.12);
    bikeGroup.rotation.y = THREE.MathUtils.lerp(bikeGroup.rotation.y, -0.22, 0.06);
  } else {
    bikeGroup.rotation.z = THREE.MathUtils.lerp(bikeGroup.rotation.z, 0, 0.15);
    bikeGroup.rotation.y = THREE.MathUtils.lerp(bikeGroup.rotation.y, 0, 0.1);
  }

  // ── Move forward ───────────────────────────
  gameState.bikeZ -= gameState.speed * dt60;
  bikeGroup.position.x = THREE.MathUtils.lerp(bikeGroup.position.x, gameState.bikeX, 0.18);
  bikeGroup.position.z = gameState.bikeZ;

  // Suspension bounce
  bikeGroup.position.y = Math.sin(elapsedTime * 22 * gameState.speed * 5) * 0.025;

  // ── Camera follow (smooth) ──────────────────
  const camTargetX = gameState.bikeX * 0.28;
  const camTargetZ = gameState.bikeZ + 15;
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.07);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, 5.5, 0.05);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.07);
  camera.lookAt(gameState.bikeX * 0.5, 1.2, gameState.bikeZ - 18);

  // ── Recycle road segments ───────────────────
  for (const seg of roadSegs) {
    if (seg.position.z > gameState.bikeZ + SEG_LEN * 2.5) {
      seg.position.z -= NUM_SEGS * SEG_LEN;
    }
  }

  // ── HUD ────────────────────────────────────
  const kmh = Math.round(gameState.speed * 320);
  document.getElementById('hud-speed').textContent = `${kmh} km/h`;

  // Mini-map bike position
  const miniEl = document.getElementById('mini-bike');
  if (miniEl) {
    const pct = Math.abs((gameState.bikeZ % 560) / 560);
    miniEl.style.top = `${pct * 80}%`;
  }

  // ── Checkpoint detection ────────────────────
  checkpoints.forEach((cp, idx) => {
    if (gameState.collected[idx]) return;

    // Animate ring spin
    if (cp.children[0]) cp.children[0].rotation.z = elapsedTime * 1.8;
    if (cp.children[1]) cp.children[1].rotation.z = -elapsedTime * 1.2;

    const dz = Math.abs(gameState.bikeZ - CHECKPOINT_Z[idx]);
    if (dz < 4 && Math.abs(bikeGroup.position.x) < 5.5) {
      collectCheckpoint(idx, cp);
    }
  });
}

// ─────────────────────────────────────────────
//  Collect checkpoint
// ─────────────────────────────────────────────
function collectCheckpoint(idx, cpGroup) {
  gameState.collected[idx] = true;
  gameState.score++;

  playChime(idx);

  // Flash + shrink
  gsap.to(cpGroup.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.25, yoyo: true, repeat: 1 });
  setTimeout(() => { cpGroup.visible = false; }, 650);

  document.getElementById('hud-count').textContent = `${gameState.score} / 4`;

  showDataCard(idx);

  if (gameState.score === 4) {
    setTimeout(triggerVictory, 2200);
  }
}

// ─────────────────────────────────────────────
//  Chime
// ─────────────────────────────────────────────
function playChime(index) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const f = 440 + index * 120;
    osc.frequency.setValueAtTime(f, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f * 2.2, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (_) {}
}

// ─────────────────────────────────────────────
//  Data card slide-in
// ─────────────────────────────────────────────
function showDataCard(idx) {
  const existing = document.querySelector('.game-data-card');
  if (existing) existing.remove();

  const info = nodeInfo[idx];
  const card = document.createElement('div');
  card.className = 'glass-card game-data-card';
  card.style.setProperty('--card-accent', info.color);
  card.innerHTML = `
    <div class="game-data-card-top">
      <span class="game-data-icon">${info.icon}</span>
      <div>
        <div class="game-data-tag">CHECKPOINT DISCOVERED</div>
        <h3 class="game-data-title">${info.title}</h3>
      </div>
    </div>
    <p class="game-data-text">${info.text.replace(/\n/g, '<br>')}</p>
    <div class="card-stats">${info.stats}</div>
    <button class="close-card-btn">Continue Riding ›</button>
  `;
  document.body.appendChild(card);

  gsap.fromTo(card,
    { x: '115%', opacity: 0 },
    { x: '0%',   opacity: 1, duration: 0.55, ease: 'back.out(1.4)' }
  );

  card.querySelector('.close-card-btn').addEventListener('click', () => {
    gsap.to(card, { x: '115%', opacity: 0, duration: 0.38, onComplete: () => card.remove() });
  });
}

// ─────────────────────────────────────────────
//  Victory
// ─────────────────────────────────────────────
function triggerVictory() {
  const card = document.querySelector('.game-data-card');
  if (card) card.remove();
  victoryModal.classList.remove('hidden');
  gsap.fromTo(victoryModal,
    { scale: 0.75, opacity: 0 },
    { scale: 1,    opacity: 1, duration: 0.55, ease: 'back.out(1.5)' }
  );
}

// ─────────────────────────────────────────────
//  Exit game
// ─────────────────────────────────────────────
export function exitBikeGame() {
  gameState.active = false;
  gameState.speed  = 0;
  hudEl.classList.add('hidden');

  const mobileCtrl = document.getElementById('mobile-game-controls');
  if (mobileCtrl) {
    mobileCtrl.classList.add('hidden');
  }

  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup',   onKeyUp);
  keys.left = keys.right = keys.up = keys.down = false;

  // Remove 3-D objects
  if (bikeGroup)  { scene.remove(bikeGroup);  bikeGroup  = null; }
  if (roadGroup)  { scene.remove(roadGroup);  roadGroup  = null; roadSegs.length  = 0; }
  if (envGroup)   { scene.remove(envGroup);   envGroup   = null; }
  checkpoints.forEach(cp => scene.remove(cp));
  checkpoints.length = 0;

  // Restore page
  document.querySelector('.scroll-container').style.opacity = '';
  document.querySelector('.scroll-container').style.pointerEvents = '';
  document.querySelector('header').style.opacity = '';

  // Re-enable navigation camera and restore position
  setNavEnabled(true);
  gsap.to(camera.position, { x: 0, y: 0, z: 38, duration: 1.6, ease: 'power2.out' });

  document.querySelectorAll('.game-data-card').forEach(c => c.remove());
}
