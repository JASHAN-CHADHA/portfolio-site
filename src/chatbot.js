import { startBikeGame } from './game.js';
import { toggleTerminal } from './terminal.js';
import gsap from 'gsap';

function playChatSound(type = 'send') {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.09);
    } else if (type === 'receive') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.06);
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.22);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.24);
    }
  } catch (_) {}
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const KNOWLEDGE = [
  {
    patterns: [/\b(who|about|background|bio|introduce|yourself|whoami)\b/i],
    response: () => pick([
      `<p>So, Jashan — that's <strong>Jashandeep Singh</strong> — is a Full Stack Developer from Punjab, India who's genuinely obsessed with building things that feel alive on screen. 😄</p><p>He bridges heavy backend work (Python &amp; Java) with interactive, immersive frontends using JavaScript, Vite, and Three.js. This whole 3D website? Yeah, he built that himself.</p><div class="chat-badges"><span class="chat-badge">5+ Years Exp</span><span class="chat-badge">20+ Projects</span><span class="chat-badge">Full-Stack Core</span></div>`,
      `<p>Jashandeep is a developer who doesn't just write code — he crafts experiences. Based in Punjab, India, he's spent 5+ years shipping full-stack products that actually <em>feel</em> good to use.</p><p>His sweet spot? Connecting robust Python/Java backends with seriously polished frontends. He's especially into 3D web and real-time interfaces.</p><div class="chat-badges"><span class="chat-badge">Full-Stack</span><span class="chat-badge">3D &amp; WebGL</span><span class="chat-badge">Open to Work</span></div>`,
      `<p>Here's the short version 😊 — Jashandeep is a full-stack engineer who loves the intersection of performance engineering and visual creativity.</p><p>Think: Python APIs that scale, Java systems that never break, and frontends that make people go "wait, how'd they do that?"</p><div class="chat-badges"><span class="chat-badge">5+ Years</span><span class="chat-badge">20+ Projects</span><span class="chat-badge">Punjab, India</span></div>`
    ]),
    suggestions: ['🛠️ Tech Stack', '📂 Showcase Projects', '💼 Hire Jashan']
  },
  {
    patterns: [/\b(skill|skills|stack|tech|technologies|languages|framework|tools)\b/i],
    response: () => pick([
      `<p>Jashan has a pretty solid tech stack — here's the breakdown:</p><ul><li><strong>Python &amp; Backend:</strong> Flask, Django, REST APIs, automation, data pipelines</li><li><strong>Frontend:</strong> JavaScript ES6+, HTML5, CSS3, Vite — with a love for smooth animations</li><li><strong>Java:</strong> OOP, multithreading, DSA, Spring SQL — serious systems-level stuff</li><li><strong>3D / Graphics:</strong> Three.js, WebGL shaders, procedural particle systems</li><li><strong>DevOps &amp; Tools:</strong> Git, GitHub, Render, WebSockets</li></ul><p>Want me to scroll you to the Skills section, or open the hacker terminal?</p>`,
      `<p>Honestly, his stack is broader than most. He's comfortable on both ends — and then some:</p><ul><li>🐍 <strong>Python:</strong> Flask, Django, REST — his go-to for backend logic</li><li>☕ <strong>Java:</strong> Multithreading, DSA, Spring SQL — enterprise-grade engineering</li><li>🌐 <strong>Web:</strong> JavaScript (ES6+), Vite, responsive CSS — fast and polished</li><li>🎮 <strong>3D:</strong> Three.js, WebGL — he literally built a playable game in this portfolio</li><li>🛠️ <strong>Tools:</strong> Git, Render, WebSockets</li></ul><p>Wanna check it out in the Skills section?</p>`
    ]),
    actions: [
      { text: 'Scroll to Skills', action: () => scrollToSection('skills') },
      { text: 'Open Terminal', action: () => toggleTerminal() }
    ],
    suggestions: ['📂 Showcase Projects', '💼 Available for hire?', '🏍️ Play Bike Game']
  },
  {
    patterns: [/\b(project|projects|portfolio|work|apps|showcase|built)\b/i],
    response: () => pick([
      `<p>Here's a taste of what Jashan's shipped 🚀</p><div class="chat-card"><strong>1. Easy PDF Tools</strong> <span class="chat-pill">Python / Render</span><br>Merge, split, compress, convert — all in the browser, no quality loss!<div><a href="https://easy-pdf-tools7.onrender.com/" target="_blank" class="chat-link">▶ Open Live App &rarr;</a></div></div><div class="chat-card"><strong>2. PyNetwork Nodes</strong> <span class="chat-pill">Python / WebSockets</span><br>Real-time network visualizer — super satisfying to watch.</div><div class="chat-card"><strong>3. Java Task Core</strong> <span class="chat-pill">Java / Spring</span><br>Multithreaded scheduler. Handles complex orchestration without breaking a sweat.</div>`,
      `<p>He's built a bunch of cool stuff — here are the highlights:</p><div class="chat-card"><strong>Easy PDF Tools</strong> <span class="chat-pill">Python / Render</span><br>A slick PDF utility that runs entirely in the browser. No installs, no quality loss — just works.<div><a href="https://easy-pdf-tools7.onrender.com/" target="_blank" class="chat-link">▶ Try it live &rarr;</a></div></div><div class="chat-card"><strong>PyNetwork Nodes</strong> <span class="chat-pill">Python / WebSockets</span><br>Real-time packet routing visualization. Oddly mesmerizing 😄</div><div class="chat-card"><strong>Java Task Core</strong> <span class="chat-pill">Java / Spring</span><br>Enterprise-grade multithreaded task scheduler. Runs quietly in production without drama.</div>`
    ]),
    actions: [
      { text: 'View Projects Section', action: () => scrollToSection('projects') }
    ],
    suggestions: ['🛠️ Skills', '💼 Hire Jashan', '🏍️ Play Game']
  },
  {
    patterns: [/\b(pdf|easy pdf)\b/i],
    response: () => pick([
      `<p><strong>Easy PDF Tools</strong> is honestly one of the cleanest tools he's built. 📄 Merge, split, compress, or convert PDFs right in your browser — no resolution loss, no sketchy uploads. Backend is a secure Python processor on Render.</p><div><a href="https://easy-pdf-tools7.onrender.com/" target="_blank" class="btn btn-primary btn-glow" style="display:inline-block; padding: 6px 14px; font-size: 0.7rem; margin-top: 6px;">Launch Easy PDF Tools</a></div>`,
      `<p>Oh, Easy PDF Tools is a great one! 📄 Fully browser-based PDF utility — clean UI, fast, no quality loss. Jashan built the whole thing with Python on the backend.</p><div><a href="https://easy-pdf-tools7.onrender.com/" target="_blank" class="btn btn-primary btn-glow" style="display:inline-block; padding: 6px 14px; font-size: 0.7rem; margin-top: 6px;">Open the App &rarr;</a></div>`
    ]),
    suggestions: ['📂 Other Projects', '🛠️ Tech Stack', '✉️ Contact Jashan']
  },
  {
    patterns: [/\b(hire|contract|job|freelance|availability|available|full-time|work with|opportunity)\b/i],
    response: () => pick([
      `<p>🎉 <strong>Yes — Jashan is actively looking for his next opportunity!</strong></p><p>He's open to:</p><ul><li>Full-time roles (remote or on-site — no problem either way)</li><li>Consulting &amp; architecture contracts</li><li>Collaborative projects — especially 3D web or real-time systems</li></ul><p>Best way to reach him? Drop an email at <a href="mailto:hello@jashandeepsingh.dev" class="chat-link">hello@jashandeepsingh.dev</a> — he usually responds pretty quickly!</p>`,
      `<p>Short answer: <strong>yes, very much available!</strong> 🙌</p><p>Jashan's open for full-time engineering roles, consulting work, or interesting project collabs. Especially excited about full-stack, 3D web, or systems-level stuff.</p><p>Ping him at <a href="mailto:hello@jashandeepsingh.dev" class="chat-link">hello@jashandeepsingh.dev</a> — or hit the contact form below.</p>`
    ]),
    actions: [
      { text: 'Go to Contact Form', action: () => scrollToSection('contact') },
      { text: '✉️ Send Email', action: () => window.location.href = 'mailto:hello@jashandeepsingh.dev?subject=Project%20Inquiry' }
    ],
    suggestions: ['✉️ What is your email?', '📂 View Projects', '🛠️ Technical Skills']
  },
  {
    patterns: [/\b(contact|email|reach|message|touch|location|where|social|github|linkedin|twitter)\b/i],
    response: () => pick([
      `<p>Easy! Here's where you can find or reach Jashan:</p><ul><li>📧 <strong>Email:</strong> <a href="mailto:hello@jashandeepsingh.dev" class="chat-link">hello@jashandeepsingh.dev</a></li><li>📍 <strong>Location:</strong> Punjab, India</li><li>💻 <strong>GitHub:</strong> <a href="https://github.com" target="_blank" class="chat-link">github.com</a></li><li>🔗 <strong>LinkedIn:</strong> <a href="https://linkedin.com" target="_blank" class="chat-link">linkedin.com</a></li></ul><p>The contact form works great too — he doesn't bite 😄</p>`,
      `<p>Here's how to get in touch — he's pretty responsive!</p><ul><li>📧 <a href="mailto:hello@jashandeepsingh.dev" class="chat-link">hello@jashandeepsingh.dev</a> — best way to reach him</li><li>📍 Punjab, India (open to remote though)</li><li>💻 <a href="https://github.com" target="_blank" class="chat-link">GitHub</a> — check out his code</li><li>🔗 <a href="https://linkedin.com" target="_blank" class="chat-link">LinkedIn</a> — professional stuff</li></ul>`
    ]),
    actions: [
      { text: 'Fill Contact Form', action: () => scrollToSection('contact') }
    ],
    suggestions: ['💼 Hire Jashan', '📂 Showcase Projects', '👋 Who is Jashan?']
  },
  {
    patterns: [/\b(game|bike|ride|play|arcade|simulation|drive)\b/i],
    response: () => pick([
      `<p>🏍️ Oh yeah, the <strong>Bike Ride game</strong> is one of the coolest things about this site! Fully 3D, runs on the Three.js canvas — neon cyberpunk highway, traffic to dodge, 4 checkpoints. It's actually really fun. Want me to kick it off?</p>`,
      `<p>Ha, the bike game is such a vibe 🎮 — neon city, 3D road, dodge traffic, hit checkpoints. Jashan built the whole thing inside the Three.js scene. Wanna ride? Just click below!</p>`
    ]),
    actions: [
      { text: '▶ Start Bike Ride Now', action: () => { closeChatbot(); startBikeGame(); } }
    ],
    suggestions: ['🏍️ Start Bike Ride Now', '🛠️ Skills', '🎨 Change Theme']
  },
  {
    patterns: [/\b(light\s*mode|theme\s*light|white\s*theme|day\s*mode)\b/i],
    response: () => {
      const isLight = document.body.classList.contains('light-theme');
      if (!isLight) document.getElementById('theme-toggle')?.click();
      return pick([
        `<p>☀️ Done! Switched to <strong>Light Mode</strong> — the whole site, 3D space, and particles all updated. Easier on the eyes in a bright room!</p>`,
        `<p>Light mode it is! ☀️ Everything's flipped — 3D scene, particles, and UI. Looks clean, right?</p>`
      ]);
    },
    suggestions: ['🌙 Switch to Dark Mode', '📂 Showcase Projects', '🏍️ Play Bike Game']
  },
  {
    patterns: [/\b(dark\s*mode|theme\s*dark|black\s*theme|night\s*mode)\b/i],
    response: () => {
      const isLight = document.body.classList.contains('light-theme');
      if (isLight) document.getElementById('theme-toggle')?.click();
      return pick([
        `<p>🌙 Back to the dark side! Obsidian cyberpunk mode restored — the way it was meant to look 😄</p>`,
        `<p>Dark mode on! 🌙 The galaxy's back. Love it.</p>`
      ]);
    },
    suggestions: ['☀️ Switch to Light Mode', '🛠️ Tech Stack', '💼 Hire Jashan']
  },
  {
    patterns: [/\b(theme|toggle theme|change theme|switch theme)\b/i],
    response: () => {
      document.getElementById('theme-toggle')?.click();
      const isLight = document.body.classList.contains('light-theme');
      return `<p>🎨 Done! Switched to <strong>${isLight ? 'Light Mode ☀️' : 'Dark Mode 🌙'}</strong>. How's that look?</p>`;
    },
    suggestions: ['🎨 Toggle Again', '🛠️ Tech Stack', '📂 Showcase Projects']
  },
  {
    patterns: [/\b(terminal|cli|hacker|command line|console)\b/i],
    response: () => pick([
      `<p>💻 Oh, the <strong>Hacker Terminal</strong> is super fun — a full retro-cyber CLI built right into the portfolio. Try <code>skills</code>, <code>projects</code>, <code>sudo hire</code>, or <code>matrix</code> for digital rain. Hit <strong>[&#96;]</strong> or click below 👇</p>`,
      `<p>The terminal is one of my favourite features 🤓 — proper hacker-style CLI. Type <code>help</code> for all commands, or go straight for <code>sudo hire</code> if you're feeling bold 😄 Press <strong>[&#96;]</strong> or click:</p>`
    ]),
    actions: [
      { text: '💻 Launch Terminal', action: () => toggleTerminal() }
    ],
    suggestions: ['💻 Launch Terminal', '🏍️ Play Bike Game', '🛠️ Skills']
  },
  {
    patterns: [/\b(hello|hi|hey|greetings|howdy|sup|good morning|good afternoon|good evening)\b/i],
    response: () => pick([
      `<p>Hey! 👋 Welcome to Jashan's little corner of the web. I'm <strong>Jashan.AI</strong> — ask me anything about his work, skills, or just have me do something cool on the site!</p>`,
      `<p>Oh hey, welcome! 😊 I'm <strong>Jashan.AI</strong>, Jashandeep's AI assistant. I can tell you about his projects, tech stack, or even flip the theme or launch a game. What's up?</p>`,
      `<p>Heyyy! 👋 Glad you stopped by. I'm <strong>Jashan.AI</strong> — basically Jashan's digital sidekick. Fire away with any questions!</p>`
    ]),
    suggestions: ['👋 Who is Jashan?', '🛠️ What can you do?', '📂 Show projects']
  },
  {
    patterns: [/\b(joke|funny|laugh)\b/i],
    response: () => {
      const jokes = [
        "Haha okay here's one 😄 — Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
        "Alright 😂 — There are 10 types of people in the world: those who understand binary, and those who don't.",
        "Classic: A SQL query walks into a bar and asks two tables — 'Can I join you?' 🍺",
        "Why was the JavaScript dev sad? Because they didn't Node how to Express themselves! 🚀",
        "What do you call a programmer from Finland? Nerdic. 😂 Okay that's bad, I'm sorry."
      ];
      return `<p>${pick(jokes)}</p>`;
    },
    suggestions: ['😂 Another joke!', '🛠️ Tech Stack', '🏍️ Start Bike Game']
  },
  {
    patterns: [/\b(why hire|why choose|value|benefits)\b/i],
    response: () => pick([
      `<p>Honestly? Here's why Jashan stands out:</p><ol><li><strong>He does both sides:</strong> Solid backend logic and frontends that actually delight people — no corners cut on either.</li><li><strong>Performance-obsessed:</strong> He genuinely cares about 60 FPS, clean architecture, and code that won't embarrass you in 2 years.</li><li><strong>Proven track record:</strong> 20+ projects shipped, happy clients, no drama. ✅</li></ol>`,
      `<p>Good question! A few things that make working with Jashan great:</p><ul><li>🔧 Full-stack means he talks to your backend devs <em>and</em> your designers fluently</li><li>⚡ Performance nerd — things he builds are fast and stay fast</li><li>✅ 20+ projects, 99% satisfaction — he sees things through</li></ul><p>Want to start a conversation? Hit the contact form!</p>`
    ]),
    actions: [
      { text: 'Commence Project', action: () => scrollToSection('contact') }
    ],
    suggestions: ['💼 Available for hire?', '✉️ Contact info', '📂 Projects']
  }
];

function getFallbackResponse(query) {
  const escaped = escapeHtml(query);
  return pick([
    `<p>Hmm, I don't have specific notes on <em>"${escaped}"</em> — but Jashan would love to chat about it! Check his <strong>Skills</strong>, browse his <strong>Projects</strong>, or just send him a message. 😊</p>`,
    `<p>Good one! I'm not 100% sure about <em>"${escaped}"</em> specifically, but I can point you to his work or connect you with him. What would help most?</p>`,
    `<p>That's a bit outside what I know off the top of my head 😅 — but Jashandeep would have a great answer. Want to scroll to his <strong>Skills</strong> or shoot him a message?</p>`
  ]);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

let chatbotTrigger = null;
let chatbotWindow = null;
let chatbotMessages = null;
let chatbotInput = null;
let chatbotSendBtn = null;
let chatbotChipsContainer = null;
let isChatOpen = false;
let isTyping = false;

const DEFAULT_SUGGESTIONS = [
  '👋 Who is Jashan?',
  '🛠️ Tech Stack',
  '📂 Showcase Projects',
  '🏍️ Start Bike Ride',
  '🎨 Switch Theme',
  '💼 Hire Jashan'
];

export function initChatbot() {
  chatbotTrigger = document.getElementById('chatbot-trigger');
  chatbotWindow = document.getElementById('chatbot-window');
  if (!chatbotTrigger || !chatbotWindow) return;
  chatbotMessages = chatbotWindow.querySelector('.chat-messages');
  chatbotInput = chatbotWindow.querySelector('#chat-input');
  chatbotSendBtn = chatbotWindow.querySelector('#chat-send-btn');
  chatbotChipsContainer = chatbotWindow.querySelector('.chat-chips');
  chatbotTrigger.addEventListener('click', toggleChatbot);
  chatbotWindow.querySelector('.chat-btn-close')?.addEventListener('click', closeChatbot);
  chatbotWindow.querySelector('.chat-btn-clear')?.addEventListener('click', clearChatHistory);
  chatbotSendBtn?.addEventListener('click', handleUserSubmit);
  chatbotInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUserSubmit(); }
  });
  renderChips(DEFAULT_SUGGESTIONS);
  loadChatHistory();
}

export function toggleChatbot() {
  if (isChatOpen) closeChatbot(); else openChatbot();
}

export function openChatbot() {
  isChatOpen = true;
  chatbotWindow.classList.remove('hidden');
  chatbotTrigger.classList.add('active');
  chatbotTrigger.querySelector('.chat-unread-dot')?.classList.add('hidden');
  gsap.fromTo(chatbotWindow, { opacity: 0, scale: 0.88, y: 25 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' });
  setTimeout(() => { chatbotInput?.focus(); scrollChatToBottom(); }, 100);
  playChatSound('receive');
}

export function closeChatbot() {
  if (!isChatOpen) return;
  isChatOpen = false;
  chatbotTrigger.classList.remove('active');
  gsap.to(chatbotWindow, { opacity: 0, scale: 0.88, y: 20, duration: 0.25, ease: 'power2.in', onComplete: () => chatbotWindow.classList.add('hidden') });
}

function handleUserSubmit() {
  if (!chatbotInput || isTyping) return;
  const text = chatbotInput.value.trim();
  if (!text) return;
  chatbotInput.value = '';
  addUserMessage(text);
  playChatSound('send');
  processBotReply(text);
}

function addUserMessage(text) {
  const msgEl = document.createElement('div');
  msgEl.className = 'chat-msg chat-msg-user';
  msgEl.innerHTML = `<div class="chat-bubble chat-bubble-user"><div class="chat-text">${escapeHtml(text)}</div><div class="chat-time">${formatTime()}</div></div>`;
  chatbotMessages.appendChild(msgEl);
  scrollChatToBottom();
  saveChatHistory();
}

function addBotMessage(htmlContent, actions = [], suggestions = null) {
  const msgEl = document.createElement('div');
  msgEl.className = 'chat-msg chat-msg-bot';
  let actionsHtml = '';
  if (actions && actions.length > 0) {
    actionsHtml = `<div class="chat-actions">` + actions.map((act, idx) => `<button class="chat-action-btn" data-act-idx="${idx}">${act.text}</button>`).join('') + `</div>`;
  }
  msgEl.innerHTML = `<div class="chat-avatar">🤖</div><div class="chat-bubble chat-bubble-bot"><div class="chat-sender">JASHAN.AI</div><div class="chat-text">${htmlContent}</div>${actionsHtml}<div class="chat-time">${formatTime()}</div></div>`;
  if (actions && actions.length > 0) {
    msgEl.querySelectorAll('.chat-action-btn').forEach((b, i) => b.addEventListener('click', () => actions[i].action()));
  }
  chatbotMessages.appendChild(msgEl);
  scrollChatToBottom();
  playChatSound('receive');
  renderChips(suggestions && suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS);
  saveChatHistory();
}

function showTypingIndicator() {
  isTyping = true;
  const typingEl = document.createElement('div');
  typingEl.id = 'chat-typing-indicator';
  typingEl.className = 'chat-msg chat-msg-bot';
  typingEl.innerHTML = `<div class="chat-avatar">🤖</div><div class="chat-bubble chat-bubble-bot chat-typing-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
  chatbotMessages.appendChild(typingEl);
  scrollChatToBottom();
}

function hideTypingIndicator() {
  isTyping = false;
  const indicator = document.getElementById('chat-typing-indicator');
  if (indicator) indicator.remove();
}

function processBotReply(query) {
  showTypingIndicator();
  const delay = Math.min(800, 350 + query.length * 15);
  setTimeout(() => {
    hideTypingIndicator();
    let matched = null;
    for (const item of KNOWLEDGE) {
      for (const pattern of item.patterns) {
        if (pattern.test(query)) { matched = item; break; }
      }
      if (matched) break;
    }
    if (matched) {
      addBotMessage(typeof matched.response === 'function' ? matched.response() : matched.response, matched.actions || [], matched.suggestions || null);
    } else {
      addBotMessage(getFallbackResponse(query), [
        { text: 'View Skills', action: () => scrollToSection('skills') },
        { text: 'View Projects', action: () => scrollToSection('projects') }
      ], DEFAULT_SUGGESTIONS);
    }
  }, delay);
}

function renderChips(chipsList) {
  if (!chatbotChipsContainer) return;
  chatbotChipsContainer.innerHTML = '';
  chipsList.forEach(chipText => {
    const btn = document.createElement('button');
    btn.className = 'chat-chip';
    btn.textContent = chipText;
    btn.addEventListener('click', () => {
      const cleanText = chipText.replace(/^[^\w\s]+/, '').trim();
      addUserMessage(chipText);
      playChatSound('send');
      processBotReply(cleanText || chipText);
    });
    chatbotChipsContainer.appendChild(btn);
  });
}

function scrollChatToBottom() {
  if (chatbotMessages) chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function formatTime() {
  const d = new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function clearChatHistory() {
  try { localStorage.removeItem('portfolio-chat-history'); } catch (_) {}
  if (chatbotMessages) chatbotMessages.innerHTML = '';
  renderWelcomeMessage();
  renderChips(DEFAULT_SUGGESTIONS);
}

function saveChatHistory() {
  try {
    if (!chatbotMessages) return;
    const messages = [];
    const msgEls = chatbotMessages.querySelectorAll('.chat-msg');
    const startIdx = Math.max(0, msgEls.length - 15);
    for (let i = startIdx; i < msgEls.length; i++) {
      if (msgEls[i].id !== 'chat-typing-indicator') messages.push(msgEls[i].outerHTML);
    }
    localStorage.setItem('portfolio-chat-history', JSON.stringify(messages));
  } catch (_) {}
}

function loadChatHistory() {
  try {
    const raw = localStorage.getItem('portfolio-chat-history');
    if (raw) {
      const messages = JSON.parse(raw);
      if (messages && messages.length > 0) {
        chatbotMessages.innerHTML = messages.join('');
        chatbotMessages.querySelectorAll('.chat-action-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const txt = btn.textContent.toLowerCase();
            if (txt.includes('skills')) scrollToSection('skills');
            else if (txt.includes('projects')) scrollToSection('projects');
            else if (txt.includes('contact')) scrollToSection('contact');
            else if (txt.includes('game') || txt.includes('ride')) { closeChatbot(); startBikeGame(); }
            else if (txt.includes('terminal')) toggleTerminal();
          });
        });
        scrollChatToBottom();
        return;
      }
    }
  } catch (_) {}
  renderWelcomeMessage();
}

function renderWelcomeMessage() {
  if (!chatbotMessages) return;
  const greetings = [
    `<p>Hey there! 👋 I'm <strong>Jashan.AI</strong> — Jashandeep's virtual assistant. Ask me about his work, skills, or have me do something fun on the site!</p><p>What can I help you with?</p>`,
    `<p>Hi! 👋 I'm <strong>Jashan.AI</strong>. I know everything about Jashandeep's projects and tech stack — or I can flip the theme, launch the game, or open the terminal. Pretty handy, right? 😄</p><p>What would you like to know?</p>`,
    `<p>Welcome! 🎉 I'm <strong>Jashan.AI</strong>, Jashandeep's AI sidekick. I can answer questions about him, his projects, or control parts of this 3D site.</p><p>Go ahead, ask me anything!</p>`
  ];
  chatbotMessages.innerHTML = `<div class="chat-msg chat-msg-bot"><div class="chat-avatar">🤖</div><div class="chat-bubble chat-bubble-bot"><div class="chat-sender">JASHAN.AI</div><div class="chat-text">${pick(greetings)}</div><div class="chat-time">${formatTime()}</div></div></div>`;
  scrollChatToBottom();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}
