import { camera, addTickCallback } from './scene.js';
import gsap from 'gsap';
import * as THREE from 'three';

// Define camera settings for each page section
const sectionViews = [
  { // 0. Home
    camPos: { x: 0, y: 0, z: 38 },
    lookAt: { x: 0, y: 0, z: 0 }
  },
  { // 1. About
    camPos: { x: 12, y: -35, z: -12 },
    lookAt: { x: 22, y: -35, z: -50 }
  },
  { // 2. Skills
    camPos: { x: -22, y: -95, z: -70 },
    lookAt: { x: -30, y: -95, z: -110 }
  },
  { // 3. Projects
    camPos: { x: -15, y: -142, z: -125 },
    lookAt: { x: 0, y: -155, z: -170 }
  },
  { // 4. Contact
    camPos: { x: 15, y: -202, z: -190 },
    lookAt: { x: 30, y: -215, z: -230 }
  }
];

let currentSection = 0;
const lookTarget = new THREE.Vector3(0, 0, 0);

// Flag to pause nav camera control during the bike game
let navCameraEnabled = true;
export function setNavEnabled(val) { navCameraEnabled = val; }

// Elements list
let navLinks = [];
let sections = [];
let header;

/**
 * Initializes navigation event handlers and GSAP viewport tracking
 */
export function initNavigation() {
  navLinks = document.querySelectorAll('.nav-link');
  sections = document.querySelectorAll('.panel-section');
  header = document.querySelector('header');

  // Initial setup of camera positioning
  const startView = sectionViews[0];
  camera.position.set(startView.camPos.x, startView.camPos.y, startView.camPos.z);
  lookTarget.set(startView.lookAt.x, startView.lookAt.y, startView.lookAt.z);

  // Bind navigation click handlers
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Scroll smoothly to target element
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Track scrolling
  window.addEventListener('scroll', handleScroll);
  
  // Register render loop updates to keep lookAt synced
  // Only runs when nav is enabled (paused during bike game)
  addTickCallback(() => {
    if (navCameraEnabled) camera.lookAt(lookTarget);
  });
}

/**
 * Throttled scroll monitoring to trigger camera adjustments and header styles
 */
let isScrolling = false;
function handleScroll() {
  if (isScrolling || !navCameraEnabled) return;
  
  isScrolling = true;
  requestAnimationFrame(() => {
    if (!navCameraEnabled) { isScrolling = false; return; }
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    // Toggle header translucent class
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Determine current active section based on scroll offset
    let activeIndex = 0;
    let minDiff = Infinity;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const diff = Math.abs(sectionCenter - viewportCenter);

      if (diff < minDiff) {
        minDiff = diff;
        activeIndex = index;
      }
    });

    // If active section changes, trigger camera transition
    if (activeIndex !== currentSection) {
      transitionCamera(activeIndex);
    }
    
    isScrolling = false;
  });
}

/**
 * Tween camera position and target smoothly using GSAP
 * @param {number} index Section index (0 to 4)
 */
function transitionCamera(index) {
  currentSection = index;

  // Update navigation items active state
  navLinks.forEach((link, idx) => {
    if (idx === index) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const targetView = sectionViews[index];

  // Animate Camera Position
  gsap.to(camera.position, {
    x: targetView.camPos.x,
    y: targetView.camPos.y,
    z: targetView.camPos.z,
    duration: 1.8,
    ease: 'power3.out',
    overwrite: 'auto'
  });

  // Animate Camera LookAt Target
  gsap.to(lookTarget, {
    x: targetView.lookAt.x,
    y: targetView.lookAt.y,
    z: targetView.lookAt.z,
    duration: 2.0,
    ease: 'power3.out',
    overwrite: 'auto'
  });
}
