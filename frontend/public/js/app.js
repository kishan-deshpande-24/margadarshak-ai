const API = 'http://localhost:5000/api';

// ── HTML escape helper (XSS prevention) ──────────────────────
function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// ── Auth helpers ──────────────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('token'),
  getUser: () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } },
  setSession: (token, user) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); },
  clear: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); },
  isLoggedIn: () => !!localStorage.getItem('token'),
  requireAuth: () => { if (!Auth.isLoggedIn()) { window.location.href = '/pages/login.html'; return false; } return true; },
  requireGuest: () => { if (Auth.isLoggedIn()) { window.location.href = '/pages/dashboard.html'; } }
};

// ── API fetch wrapper ─────────────────────────────────────────
async function api(method, path, body, isFormData = false) {
  const headers = {};
  if (Auth.getToken()) headers['Authorization'] = `Bearer ${Auth.getToken()}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const opts = { method, headers };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(`${API}${path}`, opts);
  const data = await res.json();

  const noRedirectPaths = ['/auth/login', '/auth/signup', '/auth/verify-email', '/auth/forgot-password', '/auth/reset-password'];
  if (res.status === 401 && !noRedirectPaths.some(p => path.startsWith(p))) {
    Auth.clear();
    toast('Session expired. Please login again.', 'error');
    setTimeout(() => { window.location.href = '/pages/login.html'; }, 1500);
    return data;
  }
  return data;
}

const get = (path) => api('GET', path);
const post = (path, body) => api('POST', path, body);
const put = (path, body) => api('PUT', path, body);
const del = (path) => api('DELETE', path);
const postForm = (path, formData) => api('POST', path, formData, true);
const putForm = (path, formData) => api('PUT', path, formData, true);

// ── Toast notifications ───────────────────────────────────────
function toast(message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.animation = 'slideOut .3s ease forwards'; setTimeout(() => el.remove(), 300); }, duration);
}

// ── Loading state helpers ─────────────────────────────────────
function setLoading(btn, loading, text = '') {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<div class="spinner" style="width:16px;height:16px;margin:0 auto"></div>`;
    btn.disabled = true;
  } else {
    btn.innerHTML = text || btn.dataset.originalText || btn.innerHTML;
    btn.disabled = false;
  }
}

// ── Sidebar setup ─────────────────────────────────────────────
function initSidebar(activePage) {
  const sidebarHTML = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon"><img src="/assets/logo-placeholder.svg" alt="logo" style="width:40px;height:40px;object-fit:contain"></div>
      <div>
        <div class="sidebar-logo-text">Margadarshak AI</div>
        <div class="sidebar-logo-tagline">Your AI Career Mentor</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Main</div>
      <a href="/pages/dashboard.html" class="nav-item ${activePage==='dashboard'?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        Dashboard
      </a>
      <a href="/pages/assessment.html" class="nav-item ${activePage==='assessment'?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        Interest Assessment
      </a>
      <a href="/pages/roadmap.html" class="nav-item ${activePage==='roadmap'?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        Roadmap
      </a>
      <div class="nav-section-label">Career Tools</div>
      <a href="/pages/resume.html" class="nav-item ${activePage==='resume'?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Resume Analyzer
      </a>
      <a href="/pages/interview.html" class="nav-item ${activePage==='interview'?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        Interview Simulator
      </a>
      <a href="/pages/english.html" class="nav-item ${activePage==='english'?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
        English Mentor
      </a>
      <a href="/pages/companies.html" class="nav-item ${activePage==='companies'?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Company Tracker
      </a>
      <div class="nav-section-label">Community</div>
      <a href="/pages/teams.html" class="nav-item ${activePage==='teams'?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        Team Finder
      </a>
      <a href="/pages/community.html" class="nav-item ${activePage==='community'?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        Community
      </a>
      <a href="/pages/profile.html" class="nav-item ${activePage==='profile'?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Profile
      </a>
    </nav>
    <div class="sidebar-bottom">
      <a href="/pages/settings.html" class="nav-item ${activePage==='settings'?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        Settings
      </a>
      <div class="nav-item" onclick="logout()" style="cursor:pointer;color:var(--red)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        Logout
      </div>
    </div>
  </aside>
  <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99"></div>`;

  const container = document.getElementById('sidebar-container');
  if (container) container.innerHTML = sidebarHTML;

  // Mobile toggle
  const toggle = document.getElementById('sidebarToggle');
  if (toggle) toggle.addEventListener('click', toggleSidebar);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar?.classList.toggle('open');
  if (overlay) overlay.style.display = sidebar?.classList.contains('open') ? 'block' : 'none';
}

function logout() {
  Auth.clear();
  window.location.href = '/pages/login.html';
}

// ── Topbar user info ──────────────────────────────────────────
function initTopbar(title) {
  const user = Auth.getUser();
  const topbar = document.getElementById('topbar');
  if (!topbar) return;
  const avatarSrc = escapeHtml(user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(user?.fullName || 'U'));
  topbar.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px">
      <button class="sidebar-toggle" id="sidebarToggle" onclick="toggleSidebar()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <span class="topbar-title">${escapeHtml(title)}</span>
    </div>
    <div class="topbar-actions">
      <button onclick="window.location.href='/pages/notifications.html'" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;position:relative;padding:6px">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
        <div class="notif-dot" id="notifDot" style="display:none"></div>
      </button>
      <img src="${avatarSrc}" 
           class="topbar-avatar" onclick="window.location.href='/pages/profile.html'" 
           alt="avatar" onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=U'">
    </div>`;
  loadNotifCount();
}

async function loadNotifCount() {
  try {
    const data = await get('/notifications');
    if (data.success && data.unreadCount > 0) {
      const dot = document.getElementById('notifDot');
      if (dot) dot.style.display = 'block';
    }
  } catch {}
}

// ── AI Chatbot ────────────────────────────────────────────────
function initChatbot() {
  const html = `
  <button class="chatbot-btn" onclick="toggleChatbot()" title="AI Career Assistant">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  </button>
  <div class="chatbot-window" id="chatbotWindow">
    <div class="chatbot-header">
      <div style="width:32px;height:32px;background:var(--gradient);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px">🧭</div>
      <div style="margin-left:10px">
        <div style="font-size:14px;font-weight:600">Margadarshak AI</div>
        <div style="font-size:11px;color:var(--green)">● Online</div>
      </div>
      <button onclick="toggleChatbot()" class="modal-close" style="margin-left:auto">✕</button>
    </div>
    <div class="chatbot-messages" id="chatbotMessages">
      <div class="chatbot-msg ai">👋 Hi! I'm your AI career mentor. Ask me anything about your career, interviews, resume, or skills!</div>
    </div>
    <div class="chatbot-input-area">
      <input class="chatbot-input" id="chatbotInput" placeholder="Ask anything..." onkeydown="if(event.key==='Enter')sendChatbotMsg()">
      <button class="btn btn-primary btn-sm" onclick="sendChatbotMsg()">➤</button>
    </div>
  </div>`;
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function toggleChatbot() {
  document.getElementById('chatbotWindow')?.classList.toggle('open');
}

let chatbotSessionId = null;
async function sendChatbotMsg() {
  const input = document.getElementById('chatbotInput');
  const msgs = document.getElementById('chatbotMessages');
  const msg = input?.value.trim();
  if (!msg || !msgs) return;

  input.value = '';
  msgs.innerHTML += `<div class="chatbot-msg user">${escapeHtml(msg)}</div>`;
  msgs.innerHTML += `<div class="chatbot-msg ai" id="chatbotTyping"><div class="spinner" style="width:14px;height:14px"></div></div>`;
  msgs.scrollTop = msgs.scrollHeight;

  try {
    const data = await post('/chat/message', { message: msg, context: 'general', sessionId: chatbotSessionId });
    document.getElementById('chatbotTyping')?.remove();
    if (data.success) {
      chatbotSessionId = data.chatId;
      const formatted = escapeHtml(data.response).replace(/\n/g, '<br>');
      msgs.innerHTML += `<div class="chatbot-msg ai">${formatted}</div>`;
      try { speak(data.response); } catch(e){}
    } else {
      msgs.innerHTML += `<div class="chatbot-msg ai">Sorry, I couldn't process that. Please try again.</div>`;
    }
  } catch {
    document.getElementById('chatbotTyping')?.remove();
    msgs.innerHTML += `<div class="chatbot-msg ai">Connection error. Please check your internet.</div>`;
  }
  msgs.scrollTop = msgs.scrollHeight;
}

// ── Score ring helper ─────────────────────────────────────────
function scoreRing(score, color = '#10b981') {
  const deg = Math.round((score / 100) * 360);
  return `conic-gradient(${color} ${deg}deg, rgba(255,255,255,0.08) ${deg}deg)`;
}

// ── Format helpers ────────────────────────────────────────────
function timeAgo(date) {
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

function scoreColor(score) {
  if (score >= 80) return 'var(--green)';
  if (score >= 60) return 'var(--yellow)';
  return 'var(--red)';
}

// ── Speech helpers (uses Web Speech API) ─────────────────────
function speak(text, opts = {}) {
  if (!window.speechSynthesis || !text) return;
  try {
    const utter = new SpeechSynthesisUtterance(typeof text === 'string' ? text : String(text));
    utter.lang = opts.lang || 'en-US';
    utter.rate = typeof opts.rate === 'number' ? opts.rate : 1;
    utter.pitch = typeof opts.pitch === 'number' ? opts.pitch : 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } catch (e) { console.warn('TTS failed', e); }
}

function startRecognition({ lang = 'en-US', interim = false } = {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recog = new SpeechRecognition();
  recog.lang = lang;
  recog.interimResults = interim;
  recog.maxAlternatives = 1;
  return recog;
}

function recognizeOnce({ lang = 'en-US', timeout = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    const recog = startRecognition({ lang, interim: false });
    if (!recog) return reject(new Error('SpeechRecognition not supported'));
    let finished = false;
    const timer = setTimeout(() => { if (!finished) { finished = true; try { recog.stop(); } catch{}; reject(new Error('Recognition timeout')); } }, timeout);
    recog.onresult = (e) => {
      finished = true;
      clearTimeout(timer);
      const t = e.results[0][0].transcript;
      try { recog.stop(); } catch {}
      resolve(t);
    };
    recog.onerror = (err) => { if (!finished) { finished = true; clearTimeout(timer); reject(err.error || err); } };
    recog.onend = () => { if (!finished) { finished = true; clearTimeout(timer); reject(new Error('No speech detected')); } };
    try { recog.start(); } catch (e) { clearTimeout(timer); reject(e); }
  });
}

// ── Init page ─────────────────────────────────────────────────
function initPage(activePage, title) {
  if (!Auth.requireAuth()) return;
  initSidebar(activePage);
  initTopbar(title);
  if (Auth.isLoggedIn()) initChatbot();
}
