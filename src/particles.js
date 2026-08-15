import * as THREE from 'three';
import { scene, camera, addTickCallback, perfSettings } from './scene.js';

// Mouse tracking coordinates for parallax
export const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

// Visual meshes references
let starfield;
let homeMesh;
let aboutMesh;
let skillsMesh;
let projectsMesh;
let contactMesh;

// Interactive Click Explosion Particle Pool variables
const maxExplosionParticles = 300;
let explosionGeometry;
let explosionParticles = [];

// Track mouse movement
window.addEventListener('mousemove', (e) => {
  // Normalize coordinates (-1 to +1)
  mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
});

/**
 * Initializes and adds all procedural 3D elements to the WebGL scene.
 */
export function initParticles() {
  // 1. Create Background Starfield
  createStarfield();

  // 2. Create Section 0 (Home): Nested Reactor Mesh Core
  createHomeVisual();

  // 3. Create Section 1 (About): Hollow Sphere Grid
  createAboutVisual();

  // 4. Create Section 2 (Skills): Constellation / Neural Net
  createSkillsVisual();

  // 5. Create Section 3 (Projects): Planetary Rings
  createProjectsVisual();

  // 6. Create Section 4 (Contact): Swirling Vortex
  createContactVisual();

  // 7. Initialize click-based particle explosion bursts
  initExplosions();

  // 8. Register Update ticks
  addTickCallback(updateElements);
}

/**
 * Background starfield generator
 */
function createStarfield() {
  const count = 3000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Spread in a large sphere
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 150 + Math.random() * 250; // Distance between 150 and 400

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Random colors: cyan, purple, and white
    const mix = Math.random();
    if (mix < 0.4) {
      colors[i * 3] = 0.5; // Red channel
      colors[i * 3 + 1] = 0.95; // Green channel
      colors[i * 3 + 2] = 1.0; // Blue channel (Cyan glow)
    } else if (mix < 0.8) {
      colors[i * 3] = 0.8; 
      colors[i * 3 + 1] = 0.2; 
      colors[i * 3 + 2] = 1.0; // Purple glow
    } else {
      colors[i * 3] = 1.0; 
      colors[i * 3 + 1] = 1.0; 
      colors[i * 3 + 2] = 1.0; // Pure white
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Round glowing points material
  const material = new THREE.PointsMaterial({
    size: 0.9,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    depthWrite: false
  });

  starfield = new THREE.Points(geometry, material);
  scene.add(starfield);
}

/**
 * Section 0 Visual: Nested Futuristic Reactor
 * - Inner morphing particle sphere (Cyan)
 * - Outer counter-rotating wireframe Box (Purple)
 * - Orbiting satellite planetoid (Pink)
 */
function createHomeVisual() {
  homeMesh = new THREE.Group();
  homeMesh.position.set(0, 0, 0);

  // 1. Inner morphing particle sphere
  const sphereGeom = new THREE.SphereGeometry(7, 20, 20);
  const sphereMat = new THREE.PointsMaterial({
    color: 0x00f2fe,
    size: 0.28,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });
  const innerSphere = new THREE.Points(sphereGeom, sphereMat);
  innerSphere.name = "innerSphere";
  homeMesh.add(innerSphere);

  // 2. Outer wireframe geometric cube
  const boxGeom = new THREE.BoxGeometry(13, 13, 13);
  const edges = new THREE.EdgesGeometry(boxGeom);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xbd00ff,
    transparent: true,
    opacity: 0.5,
    depthWrite: false
  });
  const outerCube = new THREE.LineSegments(edges, lineMat);
  outerCube.name = "outerCube";
  homeMesh.add(outerCube);

  // 3. Orbiting satellite particle (mesh)
  const satelliteGeom = new THREE.SphereGeometry(0.8, 8, 8);
  const satMat = new THREE.MeshBasicMaterial({
    color: 0xff007a,
    transparent: true,
    opacity: 0.85
  });
  const satellite = new THREE.Mesh(satelliteGeom, satMat);
  satellite.name = "satellite";
  homeMesh.add(satellite);

  scene.add(homeMesh);
}

/**
 * Section 1 Visual: Hollow Spinning Sphere
 */
function createAboutVisual() {
  const geometry = new THREE.SphereGeometry(14, 32, 32);
  
  const material = new THREE.PointsMaterial({
    color: 0xbd00ff,
    size: 0.28,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true
  });

  aboutMesh = new THREE.Points(geometry, material);
  // Place to the right and slightly back (aligned with grid layout)
  aboutMesh.position.set(30, -35, -50);
  scene.add(aboutMesh);
}

/**
 * Section 2 Visual: Constellation Neural Net
 */
function createSkillsVisual() {
  const nodeCount = 50;
  const positions = new Float32Array(nodeCount * 3);
  const velocity = [];

  // Generate node coordinates
  for (let i = 0; i < nodeCount; i++) {
    const x = (Math.random() - 0.5) * 40;
    const y = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    velocity.push({
      x: (Math.random() - 0.5) * 0.05,
      y: (Math.random() - 0.5) * 0.05,
      z: (Math.random() - 0.5) * 0.05
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xff007a,
    size: 0.65,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  });

  // Points mesh
  skillsMesh = new THREE.Points(geometry, material);
  skillsMesh.position.set(-30, -95, -110);
  
  // Custom property to hold velocity array for updating
  skillsMesh.userData = { velocity, originalPositions: positions.slice() };
  scene.add(skillsMesh);

  // Line connections to complete the constellation feel
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff007a,
    transparent: true,
    opacity: 0.15,
    depthWrite: false
  });

  const lineGeometry = new THREE.BufferGeometry();
  const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  skillsMesh.add(lineMesh); // Add lines as child of skills mesh
}

/**
 * Section 3 Visual: Planetary Rings
 */
function createProjectsVisual() {
  projectsMesh = new THREE.Group();
  projectsMesh.position.set(0, -155, -170);

  const ringConfigs = [
    { radius: 10, speed: 0.12, color: 0x00f2fe, count: 180 },
    { radius: 18, speed: -0.07, color: 0xbd00ff, count: 280 },
    { radius: 25, speed: 0.04, color: 0xff007a, count: 350 }
  ];

  ringConfigs.forEach(config => {
    const positions = new Float32Array(config.count * 3);
    for (let i = 0; i < config.count; i++) {
      const angle = (i / config.count) * Math.PI * 2 + Math.random() * 0.1;
      const spread = (Math.random() - 0.5) * 1.2;
      positions[i * 3] = (config.radius + spread) * Math.cos(angle);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8; // Flat in Y
      positions[i * 3 + 2] = (config.radius + spread) * Math.sin(angle);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: config.color,
      size: 0.22,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const ring = new THREE.Points(geometry, material);
    ring.userData = { speed: config.speed };
    projectsMesh.add(ring);
  });

  scene.add(projectsMesh);
}

/**
 * Section 4 Visual: Swirling Funnel/Vortex
 */
function createContactVisual() {
  const count = 1500;
  const positions = new Float32Array(count * 3);

  // Generate spiral coordinates
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 20; // Multiple revolutions
    const radius = 24 * (1 - t) + 1; // Tapering funnel towards the base
    const z = -20 * t + 10;          // Extended vertically

    positions[i * 3] = radius * Math.cos(angle) + (Math.random() - 0.5) * 1.5;
    positions[i * 3 + 1] = z;
    positions[i * 3 + 2] = radius * Math.sin(angle) + (Math.random() - 0.5) * 1.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x00f2fe,
    size: 0.28,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true
  });

  contactMesh = new THREE.Points(geometry, material);
  contactMesh.position.set(30, -215, -230);
  // Pitch the vortex forward for layout visibility
  contactMesh.rotation.x = Math.PI / 3;
  scene.add(contactMesh);
}

/**
 * Click Particle Burst System setup
 */
function initExplosions() {
  explosionGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(maxExplosionParticles * 3);
  const colors = new Float32Array(maxExplosionParticles * 3);

  // Initialize particles off-screen
  for (let i = 0; i < maxExplosionParticles; i++) {
    positions[i * 3] = 9999;
    positions[i * 3 + 1] = 9999;
    positions[i * 3 + 2] = 9999;

    colors[i * 3] = 0;
    colors[i * 3 + 1] = 0;
    colors[i * 3 + 2] = 0;

    explosionParticles.push({
      x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      r: 0, g: 0, b: 0,
      life: 0,
      maxLife: 1.0
    });
  }

  explosionGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  explosionGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.85,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const explosionMesh = new THREE.Points(explosionGeometry, material);
  scene.add(explosionMesh);

  // Click listener for particle bursts
  window.addEventListener('click', triggerExplosion);
}

/**
 * Spawn burst particles relative to current section focus
 */
function triggerExplosion(e) {
  if (e.target.closest('a, button, input, textarea, label')) return;

  const clickX = (e.clientX / window.innerWidth) * 2 - 1;
  const clickY = -(e.clientY / window.innerHeight) * 2 + 1;

  // Unproject coordinates to 3D space relative to camera
  const vector = new THREE.Vector3(clickX, clickY, 0.5);
  if (!camera) return;
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  
  // Position vector projection at Z level of current camera focus
  const depth = 45;
  const spawnPoint = camera.position.clone().add(dir.multiplyScalar(depth));

  // Spawn 25 particles from pool
  let spawned = 0;
  for (let i = 0; i < maxExplosionParticles; i++) {
    if (explosionParticles[i].life <= 0) {
      const p = explosionParticles[i];
      p.x = spawnPoint.x;
      p.y = spawnPoint.y;
      p.z = spawnPoint.z;

      // Spherical velocity burst
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 12 + Math.random() * 18;

      p.vx = speed * Math.sin(phi) * Math.cos(theta);
      p.vy = speed * Math.sin(phi) * Math.sin(theta);
      p.vz = speed * Math.cos(phi);

      // Neon colors
      const colVal = Math.random();
      if (colVal < 0.33) {
        p.r = 0.0; p.g = 0.95; p.b = 1.0; // Cyan
      } else if (colVal < 0.66) {
        p.r = 0.74; p.g = 0.0; p.b = 1.0; // Purple
      } else {
        p.r = 1.0; p.g = 0.0; p.b = 0.48; // Pink
      }

      p.life = 1.0;
      p.maxLife = 0.4 + Math.random() * 0.4;

      spawned++;
      if (spawned >= 25) break;
    }
  }
}

/**
 * Burst particles physics updates
 */
function updateExplosions(deltaTime) {
  if (!explosionGeometry) return;
  const positions = explosionGeometry.attributes.position.array;
  const colors = explosionGeometry.attributes.color.array;

  for (let i = 0; i < maxExplosionParticles; i++) {
    const p = explosionParticles[i];
    if (p.life > 0) {
      // Movement physics
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.z += p.vz * deltaTime;

      // Friction
      p.vx *= 0.90;
      p.vy *= 0.90;
      p.vz *= 0.90;

      // Decay age
      p.life -= deltaTime / p.maxLife;

      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;

      // Alpha drop glow decay
      const alpha = Math.max(0, p.life);
      colors[i * 3] = p.r * alpha;
      colors[i * 3 + 1] = p.g * alpha;
      colors[i * 3 + 2] = p.b * alpha;
    } else {
      positions[i * 3] = 9999;
      positions[i * 3 + 1] = 9999;
      positions[i * 3 + 2] = 9999;
    }
  }

  explosionGeometry.attributes.position.needsUpdate = true;
  explosionGeometry.attributes.color.needsUpdate = true;
}

/**
 * Render Tick update logic
 */
function updateElements(elapsedTime, deltaTime) {
  // Smooth mouse inertia drift (Parallax)
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  // 1. Starfield drifts gently based on mouse position
  if (starfield) {
    starfield.rotation.y = elapsedTime * 0.015 + mouse.x * 0.05;
    starfield.rotation.x = mouse.y * 0.05;
  }

  // 2. Home Visual: Nested Reactor Core updates
  if (homeMesh) {
    const inner = homeMesh.getObjectByName("innerSphere");
    const outer = homeMesh.getObjectByName("outerCube");
    const sat = homeMesh.getObjectByName("satellite");

    if (inner) {
      inner.rotation.y = elapsedTime * 0.15;
      
      const positions = inner.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        const dist = Math.sqrt(x*x + y*y + z*z);
        
        // Morphing wave ripple
        const wave = Math.sin(dist * 0.6 - elapsedTime * 2.5) * 0.018;
        positions[i] += wave * (x / dist);
        positions[i + 1] += wave * (y / dist);
        positions[i + 2] += wave * (z / dist);
      }
      inner.geometry.attributes.position.needsUpdate = true;
    }

    if (outer) {
      // Counter-rotate the outer cube
      outer.rotation.y = -elapsedTime * 0.06;
      outer.rotation.x = elapsedTime * 0.08;
      
      // Pulse scale
      const scale = 1.0 + Math.sin(elapsedTime * 1.5) * 0.08;
      outer.scale.set(scale, scale, scale);
    }

    if (sat) {
      // Sat orbit coordinates
      const angle = elapsedTime * 1.5;
      const radius = 10;
      sat.position.set(
        radius * Math.cos(angle),
        Math.sin(elapsedTime * 1.0) * 3,
        radius * Math.sin(angle)
      );
    }
  }

  // Update clicking explosions physics
  updateExplosions(deltaTime);

  // 3. About Visual spins
  if (aboutMesh) {
    aboutMesh.rotation.y = -elapsedTime * 0.08;
    aboutMesh.rotation.x = elapsedTime * 0.05;
    
    // Bounce visual up/down slightly
    aboutMesh.position.y = -35 + Math.sin(elapsedTime * 0.8) * 1.5;
  }

  // 4. Update Neural Network Constellation
  if (skillsMesh) {
    const positionAttr = skillsMesh.geometry.attributes.position;
    const positions = positionAttr.array;
    const velocity = skillsMesh.userData.velocity;
    const originals = skillsMesh.userData.originalPositions;

    // Move nodes
    for (let i = 0; i < velocity.length; i++) {
      positions[i * 3] += velocity[i].x;
      positions[i * 3 + 1] += velocity[i].y;
      positions[i * 3 + 2] += velocity[i].z;

      // Bounce nodes back to stay within boundaries
      const dx = positions[i * 3] - originals[i * 3];
      const dy = positions[i * 3 + 1] - originals[i * 3 + 1];
      const dz = positions[i * 3 + 2] - originals[i * 3 + 2];
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      if (distance > 8) { // Max drift radius
        velocity[i].x *= -1;
        velocity[i].y *= -1;
        velocity[i].z *= -1;
      }
    }
    positionAttr.needsUpdate = true;

    // Dynamically rebuild lines linking near points
    const lineMesh = skillsMesh.children[0];
    if (lineMesh) {
      const linePositions = [];
      const threshold = 12; // Draw line if distance is under 12 units

      for (let i = 0; i < velocity.length; i++) {
        for (let j = i + 1; j < velocity.length; j++) {
          const x1 = positions[i * 3], y1 = positions[i * 3 + 1], z1 = positions[i * 3 + 2];
          const x2 = positions[j * 3], y2 = positions[j * 3 + 1], z2 = positions[j * 3 + 2];
          
          const dist = Math.sqrt((x1-x2)**2 + (y1-y2)**2 + (z1-z2)**2);
          if (dist < threshold) {
            linePositions.push(x1, y1, z1);
            linePositions.push(x2, y2, z2);
          }
        }
      }

      lineMesh.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(linePositions), 3)
      );
    }
  }

  // 5. Update Projects Planetary Rings
  if (projectsMesh) {
    projectsMesh.children.forEach(ring => {
      ring.rotation.y += ring.userData.speed * deltaTime;
    });
    // Wave-like floating motion
    projectsMesh.position.y = -155 + Math.cos(elapsedTime * 0.6) * 2;
  }

  // 6. Update Contact Vortex
  if (contactMesh) {
    // Fast spiral rotation
    contactMesh.rotation.z += 0.4 * deltaTime;
    
    // Pulsate speed slightly based on mouse interaction
    const acceleration = 1.0 + Math.abs(mouse.x) * 1.5;
    contactMesh.rotation.z += 0.2 * deltaTime * acceleration;
  }
}

/**
 * Handle high/low quality details adjustment
 */
export function adjustParticleQuality(isHigh) {
  if (!starfield || !homeMesh || !contactMesh) return;
  
  const inner = homeMesh.getObjectByName("innerSphere");
  const outer = homeMesh.getObjectByName("outerCube");
  
  if (isHigh) {
    starfield.material.opacity = 0.5;
    if (inner) inner.material.size = 0.28;
    if (outer) outer.material.opacity = 0.5;
  } else {
    starfield.material.opacity = 0.15;
    if (inner) inner.material.size = 0.45;
    if (outer) outer.material.opacity = 0.15;
  }
}
