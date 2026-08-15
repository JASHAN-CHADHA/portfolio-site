import { togglePerformanceMode } from './scene.js';
import { adjustParticleQuality } from './particles.js';
import gsap from 'gsap';

// Audio State
let audioCtx = null;
let ambientOsc = null;
let ambientGain = null;
let isMuted = true; // Keep muted by default (browser policies)

// Cursor positions
const cursorLoc = { x: 0, y: 0 };
const cursorDotLoc = { x: 0, y: 0 };

/**
 * Initializes all client-side UI interactive features: Custom cursor, loader, audio nodes, form feedback.
 */
export function initUI() {
  // 1. Setup Custom Cursor Tracking
  initCustomCursor();

  // 2. Setup Preloader Timeout
  initLoader();

  // 3. Audio & Control Toggles Setup
  initControls();

  // 4. Contact Form Validation and Mock Transmission
  initContactForm();

  // 5. Setup Project Details Modals
  initProjectModals();
}

/**
 * Custom Cursor follow loop with inertia
 */
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Inertia follow loops
  function renderCursor() {
    // Inner dot follows mouse immediately
    cursorDotLoc.x += (mouseX - cursorDotLoc.x);
    cursorDotLoc.y += (mouseY - cursorDotLoc.y);
    cursorDot.style.left = `${cursorDotLoc.x}px`;
    cursorDot.style.top = `${cursorDotLoc.y}px`;

    // Outer ring follows with easing lag
    cursorLoc.x += (mouseX - cursorLoc.x) * 0.15;
    cursorLoc.y += (mouseY - cursorLoc.y) * 0.15;
    cursor.style.left = `${cursorLoc.x}px`;
    cursor.style.top = `${cursorLoc.y}px`;

    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Cursor Hover Scale Event bindings
  const interactiveSelector = 'a, button, input, textarea, .project-card, .skill-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.add('hovering-link');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (!e.target.closest(interactiveSelector)) {
      document.body.classList.remove('hovering-link');
    }
  });
}

/**
 * Web audio initializer (ambient synthesizer)
 */
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // 1. Create Sub-Bass Ambient Hum
  ambientOsc = audioCtx.createOscillator();
  ambientGain = audioCtx.createGain();
  
  ambientOsc.type = 'triangle';
  ambientOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // A1 note
  
  // 2. Setup Lowpass filter to keep it deep and soft
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(90, audioCtx.currentTime);

  ambientGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
  
  ambientOsc.connect(filter);
  filter.connect(ambientGain);
  ambientGain.connect(audioCtx.destination);
  
  ambientOsc.start();
  
  // 3. Pulse generator (LFO) to swell ambient sound volume gently
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.setValueAtTime(0.18, audioCtx.currentTime); // 0.18 Hz frequency
  lfoGain.gain.setValueAtTime(0.015, audioCtx.currentTime);
  
  lfo.connect(lfoGain);
  lfoGain.connect(ambientGain.gain);
  lfo.start();
}

/**
 * Procedural synthesis of click sounds
 */
function playClickChime() {
  if (isMuted || !audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  // Fast frequency sweep (sci-fi chime)
  osc.frequency.setValueAtTime(580, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.08);
  
  gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

/**
 * Controls bindings for graphics & sound buttons
 */
function initControls() {
  const soundBtn = document.getElementById('sound-toggle');
  const perfBtn = document.getElementById('perf-toggle');
  const soundOnIcon = soundBtn.querySelector('.icon-sound-on');
  const soundOffIcon = soundBtn.querySelector('.icon-sound-off');

  // Trigger click chime on links and buttons
  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, input[type="submit"]')) {
      playClickChime();
    }
  });

  // Sound Control Click Listener
  soundBtn.addEventListener('click', () => {
    initAudio(); // Resume context if suspended
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isMuted = !isMuted;
    
    if (isMuted) {
      soundOnIcon.classList.add('hidden');
      soundOffIcon.classList.remove('hidden');
      gsap.to(ambientGain.gain, { value: 0, duration: 0.8 });
    } else {
      soundOnIcon.classList.remove('hidden');
      soundOffIcon.classList.add('hidden');
      gsap.to(ambientGain.gain, { value: 0.03, duration: 0.8 }); // Soft ambient level
    }
  });

  // Graphics Quality Control Click Listener
  perfBtn.addEventListener('click', () => {
    const isHighQuality = togglePerformanceMode();
    adjustParticleQuality(isHighQuality);
    
    // Add brief flash animation on canvas to show change
    const canvas = document.getElementById('webgl');
    gsap.fromTo(canvas, { opacity: 0.4 }, { opacity: 1, duration: 0.5 });
    
    // Alert button state
    perfBtn.style.color = isHighQuality ? '' : '#ff007a';
    perfBtn.style.borderColor = isHighQuality ? '' : '#ff007a';
  });
}

/**
 * Loader removal script
 */
function initLoader() {
  const preloader = document.getElementById('preloader');
  const progressBar = document.querySelector('.loader-progress');
  
  // Simulate loading stages for smooth layout presentation
  gsap.to(progressBar, {
    width: '100%',
    duration: 1.2,
    ease: 'power2.inOut',
    onComplete: () => {
      // Fade-out loading screen
      preloader.classList.add('fade-out');
    }
  });
}

/**
 * Form Submission handling
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const btn = form.querySelector('button[type="submit"]');
  const btnSpan = btn.querySelector('span');
  const feedback = document.getElementById('form-feedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Visual transmission loading phase
    btn.disabled = true;
    btnSpan.textContent = 'TRANSMITTING SIGNAL...';
    btn.style.filter = 'saturate(0.5)';

    setTimeout(() => {
      // Simulated server success callback
      btn.disabled = false;
      btnSpan.textContent = 'TRANSMIT SIGNAL';
      btn.style.filter = '';

      feedback.classList.remove('hidden', 'error');
      feedback.classList.add('success');
      feedback.textContent = 'TRANSMISSION RECEIVED. WE WILL MAKE CONTACT SHORTLY.';
      
      form.reset();

      // Fade out feedback notification after 5 seconds
      setTimeout(() => {
        gsap.to(feedback, {
          opacity: 0,
          duration: 0.8,
          onComplete: () => {
            feedback.classList.add('hidden');
            feedback.style.opacity = 1;
          }
        });
      }, 5000);
      
    }, 1800); // 1.8s mock transmission lag
  });
}

/**
 * Project Detail Modals interaction
 */
function initProjectModals() {
  const projectDetails = [
    {
      title: "Easy PDF Tools",
      subtitle: "Comprehensive Cloud-Hosted Document Utility",
      desc: "Easy PDF Tools is a clean, responsive full-stack web application that allows users to merge, split, compress, and convert PDF documents directly in their browser. Built with a Python-based backend handling secure file processing, and deployed onto Render API servers. The utility features robust PDF formatting algorithms that preserve text layouts and compress page sizes without degradation of document resolution."
    },
    {
      title: "PyNetwork Nodes",
      subtitle: "Interactive Network Monitoring Dashboard",
      desc: "PyNetwork Nodes is a Python-powered visual dashboard mapping local area networks. It utilizes WebSockets to push live packet transfers from simulated client routers directly to a lightweight frontend canvas. The graph renders dynamically showing bottleneck structures, data traffic volume, and signal latencies, providing visual alerts for network overload conditions."
    },
    {
      title: "Java Task Core",
      subtitle: "Multithreaded Queue Processor Scheduler",
      desc: "Java Task Core is a multithreaded command scheduler engineered in Java. Built to analyze resource allocations and queue workloads, the app orchestrates backend processes concurrently. It incorporates Spring frameworks for managing database transaction lifecycles, ensuring thread-safe task completion feeds and rollover recovery scripts."
    }
  ];

  const projectLinks = document.querySelectorAll('.project-link');

  projectLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const id = parseInt(link.getAttribute('data-project-id')) - 1;
      const project = projectDetails[id];

      if (!project) return;

      // Show details modal
      const modal = document.createElement('div');
      modal.className = 'glass-card project-detail-modal';
      modal.innerHTML = `
        <div class="modal-header">
          <span class="project-num">0${id + 1} / PROJECT DETAILS</span>
          <h3>${project.title}</h3>
        </div>
        <p class="modal-subtitle">${project.subtitle}</p>
        <p class="modal-desc">${project.desc}</p>
        <button class="close-modal-btn">Acknowledge</button>
      `;

      // Custom style injection for layout positioning
      Object.assign(modal.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0.9)',
        width: '500px',
        maxWidth: '90%',
        padding: '35px',
        zIndex: '3000',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        boxShadow: 'var(--glow-cyan), var(--card-shadow)',
        opacity: '0'
      });

      // Style inner sub-items
      const headerSpan = modal.querySelector('.project-num');
      headerSpan.style.fontFamily = 'var(--font-title)';
      headerSpan.style.fontSize = '0.7rem';
      headerSpan.style.color = 'var(--primary-color)';
      headerSpan.style.display = 'block';
      headerSpan.style.marginBottom = '5px';

      const headerTitle = modal.querySelector('h3');
      headerTitle.style.fontFamily = 'var(--font-title)';
      headerTitle.style.fontSize = '1.35rem';
      headerTitle.style.color = '#fff';

      const subtitle = modal.querySelector('.modal-subtitle');
      subtitle.style.fontFamily = 'var(--font-title)';
      subtitle.style.fontSize = '0.75rem';
      subtitle.style.textTransform = 'uppercase';
      subtitle.style.color = 'var(--text-muted)';
      subtitle.style.letterSpacing = '0.05rem';

      const desc = modal.querySelector('.modal-desc');
      desc.style.fontSize = '0.9rem';
      desc.style.lineHeight = '1.6';
      desc.style.color = 'var(--text-color)';

      const closeBtn = modal.querySelector('.close-modal-btn');
      closeBtn.className = 'close-modal-btn btn btn-primary btn-glow btn-full';
      
      document.body.appendChild(modal);

      // Open transition
      gsap.to(modal, {
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1,
        duration: 0.4,
        ease: 'back.out'
      });

      // Dim body backdrop
      const dimOverlay = document.createElement('div');
      dimOverlay.className = 'modal-backdrop';
      Object.assign(dimOverlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 5, 10, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: '2999'
      });
      document.body.appendChild(dimOverlay);

      const closeModal = () => {
        gsap.to(modal, {
          transform: 'translate(-50%, -50%) scale(0.9)',
          opacity: 0,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => {
            modal.remove();
            dimOverlay.remove();
          }
        });
      };

      closeBtn.addEventListener('click', closeModal);
      dimOverlay.addEventListener('click', closeModal);
    });
  });
}
