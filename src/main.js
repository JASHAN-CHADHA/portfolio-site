import './style.css';
import { initScene } from './scene.js';
import { initParticles } from './particles.js';
import { initNavigation } from './navigation.js';
import { initUI } from './ui.js';
import { initGame } from './game.js';
import { initTerminal } from './terminal.js';
import { initChatbot } from './chatbot.js';

// Bootstrapping the entire application sequence
function startApp() {
  const canvas = document.getElementById('webgl');
  
  if (canvas) {
    // 1. Initialize WebGL Scene, Camera, Lights and Renderer
    initScene(canvas);
    
    // 2. Generate 3D procedural visual segments
    initParticles();
    
    // 3. Setup scroll-linked and navigation-linked camera movements
    initNavigation();
    
    // 4. Mount mouse movements, audio context, controls, loaders and forms
    initUI();

    // 5. Mount the arcade simulator mini-game
    initGame();

    // 6. Mount interactive hacker developer terminal
    initTerminal();

    // 7. Mount AI portfolio assistant chatbot
    initChatbot();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
