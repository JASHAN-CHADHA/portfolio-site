import { startBikeGame } from './game.js';
import gsap from 'gsap';

// Sound effect synthesizer for terminal keystrokes & command executions
function playTerminalSound(type = 'key') {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (type === 'key') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.025);
    } else if (type === 'enter') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.22);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    }
  } catch (_) {}
}

const ASCII_BANNER = `
<span class="term-cyan">============================================================</span>
<span class="term-purple">   ___    ____  ______ _____ ______ _____  _   _ </span>
<span class="term-purple">  |_  |  / ___| |_   _/|  ___||_   _||  _ \\| | | |</span>
<span class="term-cyan">    | |  \\___ \\   | |  | |__    | |  | |_) | |_| |</span>
<span class="term-cyan">|   | |   ___) |  | |  |  __|   | |  |  __/|  _  |</span>
<span class="term-pink">|___| |  |____/   |_|  |_|      |_|  |_|   |_| |_|</span>
<span class="term-cyan">============================================================</span>
<span class="term-gold">J.SINGH OS v2.6.4 (x86_64-cyber-kernel)</span>
Type <span class="term-cmd">'help'</span> for instructions. Press <span class="term-cmd">[Tab]</span> to autocomplete.
Press <span class="term-cmd">[\`]</span> (backtick) or click <span class="term-cmd">[âœ•]</span> to toggle this window.
`;

const COMMANDS_LIST = [
  { cmd: 'help', desc: 'List all available terminal commands' },
  { cmd: 'whoami', desc: 'Display developer profile and system identity' },
  { cmd: 'about', desc: 'Engineering background and technical philosophy' },
  { cmd: 'skills', desc: 'Render technical proficiencies & core languages' },
  { cmd: 'projects', desc: 'Showcase selected applications and live links' },
  { cmd: 'contact', desc: 'Subspace transmission frequencies & social URLs' },
  { cmd: 'ride', desc: 'Launch the 3D bike simulation mini-game' },
  { cmd: 'theme', desc: 'Toggle or set theme: theme [light|dark]' },
  { cmd: 'sound', desc: 'Toggle ambient synthesizer audio on/off' },
  { cmd: 'perf', desc: 'Toggle graphics performance mode' },
  { cmd: 'goto', desc: 'Navigate to section: goto [home|about|skills|projects|contact]' },
  { cmd: 'matrix', desc: 'Toggle matrix digital code rain effect' },
  { cmd: 'sudo hire', desc: 'Trigger developer recruitment protocol (Easter Egg)' },
  { cmd: 'date', desc: 'Show current timestamp and system uptime' },
  { cmd: 'history', desc: 'Display recent command history' },
  { cmd: 'echo', desc: 'Print message: echo [text]' },
  { cmd: 'clear', desc: 'Clear the terminal output screen' },
  { cmd: 'exit', desc: 'Close this terminal session' }
];

let terminalWindow = null;
let terminalBody = null;
let terminalOutput = null;
let terminalInput = null;
let terminalToggleBtn = null;
let headerTerminalBtn = null;
let isTerminalOpen = false;
let isMaximized = false;
let isMinimized = false;
let matrixInterval = null;

// Command history tracking
const history = [];
let historyIndex = -1;

/**
 * Initializes the Interactive Hacker Terminal
 */
export function initTerminal() {
  terminalWindow = document.getElementById('terminal-window');
  terminalToggleBtn = document.getElementById('terminal-toggle');
  headerTerminalBtn = document.getElementById('header-terminal-toggle');

  if (!terminalWindow) return;

  terminalBody = terminalWindow.querySelector('.terminal-body');
  terminalOutput = terminalWindow.querySelector('.terminal-output');
  terminalInput = terminalWindow.querySelector('#terminal-input');

  // Print welcome banner
  printOutput(ASCII_BANNER, false);

  // Setup event listeners
  setupWindowControls();
  setupInputHandlers();
  setupDraggable();
  setupGlobalHotkey();

  // Launcher buttons bindings
  if (terminalToggleBtn) {
    terminalToggleBtn.addEventListener('click', toggleTerminal);
  }
  if (headerTerminalBtn) {
    headerTerminalBtn.addEventListener('click', toggleTerminal);
  }
}

/**
 * Toggle Terminal Open/Close state
 */
export function toggleTerminal() {
  isTerminalOpen = !isTerminalOpen;

  if (isTerminalOpen) {
    terminalWindow.classList.remove('hidden');
    if (isMinimized) {
      isMinimized = false;
      terminalWindow.classList.remove('minimized');
    }
    gsap.fromTo(terminalWindow, 
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
    );
    if (terminalInput) {
      setTimeout(() => terminalInput.focus(), 100);
    }
    playTerminalSound('success');
  } else {
    stopMatrixRain();
    gsap.to(terminalWindow, {
      opacity: 0,
      scale: 0.9,
      y: 20,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        terminalWindow.classList.add('hidden');
      }
    });
  }

  // Sync button state
  if (terminalToggleBtn) {
    terminalToggleBtn.classList.toggle('active', isTerminalOpen);
  }
  if (headerTerminalBtn) {
    headerTerminalBtn.classList.toggle('active', isTerminalOpen);
  }
}

/**
 * Print message or HTML to terminal output
 */
function printOutput(htmlContent, isCommandEcho = false) {
  const line = document.createElement('div');
  line.className = isCommandEcho ? 'term-line term-echo' : 'term-line';
  line.innerHTML = htmlContent;
  terminalOutput.appendChild(line);

  // Scroll to bottom
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

/**
 * Executes a typed CLI command string
 */
function executeCommand(inputStr) {
  const trimmed = inputStr.trim();
  if (!trimmed) return;

  // Record into history
  history.push(trimmed);
  historyIndex = history.length;

  // Echo user command
  printOutput(`<span class="term-prompt">visitor@jashandeep:~$</span> <span class="term-input-echo">${escapeHtml(trimmed)}</span>`, true);

  playTerminalSound('enter');

  const tokens = trimmed.split(' ').filter(Boolean);
  const baseCmd = tokens[0].toLowerCase();
  const args = tokens.slice(1);

  // Handle 'sudo hire' specially
  if (baseCmd === 'sudo' && args[0]?.toLowerCase() === 'hire') {
    handleSudoHire();
    return;
  }

  switch (baseCmd) {
    case 'help':
    case '?':
      handleHelp();
      break;

    case 'whoami':
      printOutput(`
<div class="term-card">
  <div class="term-highlight">NAME:</div> Jashandeep Singh
  <div class="term-highlight">ROLE:</div> Full Stack Developer & Systems Architect
  <div class="term-highlight">STATUS:</div> <span class="term-green">ONLINE [â—] Available for Projects & Engineering Contracts</span>
  <div class="term-highlight">LOCATION:</div> Punjab, India (Subspace Planetary Coordinates)
  <div class="term-highlight">STACK:</div> Python, Java, JavaScript (ES6+), Vite, Three.js, REST APIs
</div>`);
      break;

    case 'about':
    case 'bio':
      printOutput(`
<div class="term-card">
  <div class="term-tag">/ WHO I AM</div>
  <p>Engineering robust, high-performance web systems and full-stack solutions. Bridging complex database backends with interactive, fluid frontend dimensions.</p>
  <p>Specializing in clean architectures, multithreaded systems, API designs, and scalable client-server pipelines.</p>
  <div class="term-row">
    <span class="term-pill">5+ Years Experience</span>
    <span class="term-pill">20+ Projects Deployed</span>
    <span class="term-pill">99% UX Rating</span>
  </div>
</div>`);
      break;

    case 'skills':
      handleSkills();
      break;

    case 'projects':
      handleProjects();
      break;

    case 'contact':
      printOutput(`
<div class="term-card">
  <div class="term-tag">/ DIRECT TRANSMISSION CHANNELS</div>
  <div><span class="term-cyan">Email:</span> <a href="mailto:hello@jashandeepsingh.dev" class="term-link">hello@jashandeepsingh.dev</a></div>
  <div><span class="term-cyan">GitHub:</span> <a href="https://github.com" target="_blank" class="term-link">github.com</a></div>
  <div><span class="term-cyan">LinkedIn:</span> <a href="https://linkedin.com" target="_blank" class="term-link">linkedin.com</a></div>
  <div><span class="term-cyan">Twitter/X:</span> <a href="https://twitter.com" target="_blank" class="term-link">twitter.com</a></div>
  <p class="term-muted">Tip: Type <span class="term-cmd">'sudo hire'</span> to launch fast transmission!</p>
</div>`);
      break;

    case 'ride':
    case 'bike':
    case 'game':
      printOutput(`<span class="term-green">â–¶ Initializing 3D Arcade Bike Simulation engine...</span>`);
      setTimeout(() => {
        toggleTerminal(); // minimize/close terminal
        startBikeGame();
      }, 600);
      break;

    case 'theme':
      handleTheme(args[0]);
      break;

    case 'sound':
    case 'audio':
    case 'mute':
      document.getElementById('sound-toggle')?.click();
      printOutput(`<span class="term-cyan">Audio state toggled.</span>`);
      break;

    case 'perf':
    case 'graphics':
      document.getElementById('perf-toggle')?.click();
      printOutput(`<span class="term-cyan">Graphics quality profile toggled.</span>`);
      break;

    case 'goto':
    case 'navigate':
    case 'nav':
      handleGoto(args[0]);
      break;

    case 'matrix':
      toggleMatrixRain();
      break;

    case 'hire':
      handleSudoHire();
      break;

    case 'date':
    case 'time':
      printOutput(`<span class="term-cyan">Local Timestamp:</span> ${new Date().toLocaleString()}<br><span class="term-muted">Kernel Uptime: 99.98% / Host: portfolio-node-01</span>`);
      break;

    case 'history':
      if (history.length === 0) {
        printOutput(`<span class="term-muted">No commands recorded in session history.</span>`);
      } else {
        const list = history.map((item, i) => `  ${i + 1}. ${escapeHtml(item)}`).join('<br>');
        printOutput(`<strong>Session History:</strong><br>${list}`);
      }
      break;

    case 'echo':
      printOutput(escapeHtml(args.join(' ')));
      break;

    case 'clear':
    case 'cls':
      terminalOutput.innerHTML = '';
      break;

    case 'exit':
    case 'close':
    case 'quit':
      toggleTerminal();
      break;

    default:
      playTerminalSound('error');
      printOutput(`<span class="term-red">zsh: command not found: ${escapeHtml(baseCmd)}</span>. Type <span class="term-cmd">'help'</span> for instructions.`);
      break;
  }
}

/**
 * Displays available commands table
 */
function handleHelp() {
  let out = `<strong>AVAILABLE SYSTEM COMMANDS:</strong><br><br>`;
  COMMANDS_LIST.forEach(item => {
    out += `  <span class="term-cmd">${item.cmd.padEnd(12, ' ')}</span> <span class="term-desc">${item.desc}</span><br>`;
  });
  out += `<br><span class="term-muted">Hint: Use [â†‘] / [â†“] for command history, [Tab] for completion.</span>`;
  printOutput(out);
}

/**
 * Displays visual skill bars
 */
function handleSkills() {
  const skills = [
    { name: 'Python Core / Backend', pct: 95, bar: 'â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘' },
    { name: 'Full-Stack Web (JS/HTML/CSS)', pct: 92, bar: 'â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘' },
    { name: 'Java Intermediate / OOP / DSA', pct: 88, bar: 'â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘' },
    { name: 'REST APIs & Architecture', pct: 94, bar: 'â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘' },
    { name: 'Three.js & WebGL 3D', pct: 85, bar: 'â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘' },
    { name: 'Git & Deployment Workflows', pct: 90, bar: 'â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘' }
  ];

  let out = `<div class="term-card"><div class="term-tag">/ THE ENGINE & PROFICIENCY RADAR</div><br>`;
  skills.forEach(s => {
    out += `<div class="term-skill-row">
      <span class="term-skill-name">${s.name}</span>
      <span class="term-skill-bar">${s.bar}</span>
      <span class="term-green">${s.pct}%</span>
    </div>`;
  });
  out += `</div>`;
  printOutput(out);
}

/**
 * Displays interactive projects showcase
 */
function handleProjects() {
  const projects = [
    {
      num: '01',
      title: 'Easy PDF Tools',
      tag: 'Python / Render API',
      url: 'https://easy-pdf-tools7.onrender.com/',
      desc: 'Cloud-hosted document utility to merge, split, compress & convert PDFs directly in browser.'
    },
    {
      num: '02',
      title: 'PyNetwork Nodes',
      tag: 'Python / WebSockets',
      url: '#',
      desc: 'Interactive network monitoring dashboard visualizing live simulated packet routing and latency.'
    },
    {
      num: '03',
      title: 'Java Task Core',
      tag: 'Java / Spring SQL',
      url: '#',
      desc: 'Multithreaded command scheduler orchestrating complex queue allocations & transaction lifecycles.'
    }
  ];

  let out = `<div class="term-card"><div class="term-tag">/ THE SHOWCASE (SELECTED WORK)</div><br>`;
  projects.forEach(p => {
    out += `<div class="term-project-item">
      <span class="term-cyan">${p.num} /</span> <strong>${p.title}</strong> <span class="term-pill">${p.tag}</span>
      <div class="term-desc">${p.desc}</div>
      <div><a href="${p.url}" target="_blank" class="term-link">â–¶ Open Live Application &rarr;</a></div>
    </div><br>`;
  });
  out += `</div>`;
  printOutput(out);
}

/**
 * Handles 'theme' CLI command
 */
function handleTheme(mode) {
  const currentIsLight = document.body.classList.contains('light-theme');
  const targetMode = mode ? mode.toLowerCase() : (currentIsLight ? 'dark' : 'light');

  if (targetMode === 'light' || targetMode === 'white') {
    if (!currentIsLight) {
      document.getElementById('theme-toggle')?.click();
    }
    printOutput(`<span class="term-gold">â˜€ï¸ Theme changed to LIGHT MODE.</span>`);
  } else if (targetMode === 'dark' || targetMode === 'black') {
    if (currentIsLight) {
      document.getElementById('theme-toggle')?.click();
    }
    printOutput(`<span class="term-purple">ðŸŒ™ Theme changed to DARK MODE.</span>`);
  } else {
    printOutput(`<span class="term-red">Invalid theme mode: ${escapeHtml(mode)}</span>. Usage: <span class="term-cmd">theme light</span> or <span class="term-cmd">theme dark</span>`);
  }
}

/**
 * Handles 'goto' navigation command
 */
function handleGoto(dest) {
  if (!dest) {
    printOutput(`<span class="term-red">Missing destination.</span> Usage: <span class="term-cmd">goto [home|about|skills|projects|contact]</span>`);
    return;
  }
  const cleanDest = dest.replace('#', '').toLowerCase();
  const valid = ['home', 'about', 'skills', 'projects', 'contact'];
  if (valid.includes(cleanDest)) {
    const el = document.getElementById(cleanDest);
    if (el) {
      printOutput(`<span class="term-green">Navigating camera to #${cleanDest}...</span>`);
      el.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    printOutput(`<span class="term-red">Unknown section '${escapeHtml(cleanDest)}'.</span> Available: ${valid.join(', ')}`);
  }
}

/**
 * Easter Egg: 'sudo hire' command
 */
function handleSudoHire() {
  playTerminalSound('success');
  printOutput(`
<div class="term-card term-hire-banner">
  <div class="term-gold">â˜…â˜…â˜… [CLEARANCE GRANTED: RECRUITMENT PROTOCOL] â˜…â˜…â˜…</div>
  <p>Thank you for your interest in hiring Jashandeep Singh!</p>
  <p>Engineering specialties: High-throughput Web Systems, Python Services, Scalable APIs, & Interactive 3D Interfaces.</p>
  <div><strong>Transmitting transmission request to:</strong> <span class="term-cyan">hello@jashandeepsingh.dev</span></div>
  <div style="margin-top: 10px;">
    <a href="mailto:hello@jashandeepsingh.dev?subject=Hiring%20Inquiry%20from%20Portfolio%20Terminal" class="btn btn-primary btn-glow" style="padding: 6px 16px; font-size: 0.7rem;">Open Mail Client</a>
  </div>
</div>`);
}

/**
 * Falling Matrix Code Rain effect inside terminal
 */
function toggleMatrixRain() {
  if (matrixInterval) {
    stopMatrixRain();
    printOutput(`<span class="term-muted">Matrix digital rain deactivated.</span>`);
    return;
  }

  printOutput(`<span class="term-green">â–¶ Activating Matrix digital rain overlay. Type 'matrix' again to stop.</span>`);

  const chars = '0123456789ABCDEF@#$%&*+<>{}[]=~XYZ';
  let counter = 0;

  matrixInterval = setInterval(() => {
    counter++;
    let line = '';
    for (let i = 0; i < 45; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      line += char;
    }
    const coloredLine = `<span class="term-matrix-rain">${line}</span>`;
    printOutput(coloredLine);

    if (counter > 30) {
      stopMatrixRain();
      printOutput(`<span class="term-green">Matrix buffer sequence complete.</span>`);
    }
  }, 100);
}

function stopMatrixRain() {
  if (matrixInterval) {
    clearInterval(matrixInterval);
    matrixInterval = null;
  }
}

/**
 * Setup terminal input keyboard interactions: Enter, History (Up/Down), Tab Autocomplete
 */
function setupInputHandlers() {
  if (!terminalInput) return;

  terminalInput.addEventListener('keydown', (e) => {
    playTerminalSound('key');

    // Enter: Execute
    if (e.key === 'Enter') {
      const val = terminalInput.value;
      terminalInput.value = '';
      executeCommand(val);
    }
    // Up: Previous history
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        if (historyIndex > 0) historyIndex--;
        terminalInput.value = history[historyIndex] || '';
      }
    }
    // Down: Next history
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length > 0) {
        if (historyIndex < history.length - 1) {
          historyIndex++;
          terminalInput.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          terminalInput.value = '';
        }
      }
    }
    // Tab: Autocomplete
    else if (e.key === 'Tab') {
      e.preventDefault();
      const current = terminalInput.value.trim().toLowerCase();
      if (!current) return;

      const matches = COMMANDS_LIST.filter(c => c.cmd.startsWith(current));
      if (matches.length === 1) {
        terminalInput.value = matches[0].cmd + ' ';
      } else if (matches.length > 1) {
        const listStr = matches.map(m => `<span class="term-cmd">${m.cmd}</span>`).join('  ');
        printOutput(`<strong>Suggestions:</strong> ${listStr}`);
      }
    }
  });

  // Clicking anywhere on terminal body refocuses the input
  terminalBody.addEventListener('click', () => {
    terminalInput.focus();
  });
}

/**
 * Setup window action buttons: Close, Minimize, Maximize
 */
function setupWindowControls() {
  const closeBtn = terminalWindow.querySelector('.term-btn-close');
  const minBtn = terminalWindow.querySelector('.term-btn-min');
  const maxBtn = terminalWindow.querySelector('.term-btn-max');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleTerminal());
  }

  if (minBtn) {
    minBtn.addEventListener('click', () => {
      isMinimized = !isMinimized;
      terminalWindow.classList.toggle('minimized', isMinimized);
    });
  }

  if (maxBtn) {
    maxBtn.addEventListener('click', () => {
      isMaximized = !isMaximized;
      terminalWindow.classList.toggle('maximized', isMaximized);
    });
  }
}

/**
 * Window Draggable system
 */
function setupDraggable() {
  const header = terminalWindow.querySelector('.terminal-header');
  if (!header) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initLeft = 0;
  let initTop = 0;

  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.terminal-actions') || isMaximized) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = terminalWindow.getBoundingClientRect();
    initLeft = rect.left;
    initTop = rect.top;

    terminalWindow.style.transform = 'none';
    terminalWindow.style.left = `${initLeft}px`;
    terminalWindow.style.top = `${initTop}px`;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    terminalWindow.style.left = `${Math.max(10, Math.min(window.innerWidth - 300, initLeft + dx))}px`;
    terminalWindow.style.top = `${Math.max(10, Math.min(window.innerHeight - 100, initTop + dy))}px`;
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }
}

/**
 * Global backtick [`] shortcut listener
 */
function setupGlobalHotkey() {
  window.addEventListener('keydown', (e) => {
    // Check for backtick (`) or tilde (~), ensuring user isn't in another input
    if (e.key === '`' || e.key === '~') {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' && document.activeElement.id !== 'terminal-input') return;
      if (activeTag === 'textarea') return;

      e.preventDefault();
      toggleTerminal();
    }
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}
