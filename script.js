/* script.js
   Terminal portfolio logic: boot sequence, terminal commands, modals, GitHub fetch (optional),
   history, autocomplete, matrix effect, draggable windows, contact form, language switching.
*/

/* =========================
   Data (profile, skills, projects)
   ========================= */
const state = {
  lang: 'pt', // 'pt' or 'en'
  user: {
    name: 'Guilherme Yuji',
    title: { pt: 'Python & AI Developer Student', en: 'Python & AI Developer Student' },
    description: {
      pt: 'Sou estudante focado em Python, Inteligência Artificial e desenvolvimento de soluções inteligentes. Tenho interesse em automação, machine learning, análise de dados e construção de aplicações modernas que utilizam IA para resolver problemas reais.',
      en: 'I am a student focused on Python, Artificial Intelligence and developing intelligent solutions. I have interest in automation, machine learning, data analysis and building modern applications that use AI to solve real problems.'
    },
    languages: ['Português', 'English']
  },
  commands: ['help','about','skills','projects','education','github','contact','clear','lang pt','lang en','coffee','sudo hire Guilherme','matrix','whoami','open','ai'],
  skills: {
    python: [
      { id:'python', name:'Python', lvl:'Advanced', desc:'Linguagem versátil para desenvolvimento com IA, automação e análise de dados.', apps:'IA, automação, análise de dados', examples:'Scripts, frameworks de ML' },
      { id:'fastapi', name:'FastAPI', lvl:'Intermediate', desc:'Framework moderno para APIs rápidas e eficientes.', apps:'APIs REST, aplicações IA', examples:'Endpoints, validação' },
      { id:'pandas', name:'Pandas', lvl:'Intermediate', desc:'Manipulação e análise de dados estruturados.', apps:'Análise de dados, preparação', examples:'DataFrames, groupby' },
      { id:'numpy', name:'NumPy', lvl:'Intermediate', desc:'Computação numérica e arrays multidimensionais.', apps:'Processamento de dados, IA', examples:'Operações matriciais' }
    ],
    ai: [
      { id:'ml', name:'Machine Learning', lvl:'Intermediate', desc:'Desenvolvimento de modelos de aprendizado automático.', apps:'Previsões, classificação', examples:'Regressão, clustering' },
      { id:'dl', name:'Deep Learning', lvl:'Learning', desc:'Redes neurais profundas para problemas complexos.', apps:'Visão computacional, NLP', examples:'TensorFlow, PyTorch' },
      { id:'openai', name:'OpenAI API', lvl:'Intermediate', desc:'Integração com modelos de linguagem e IA generativa.', apps:'Chatbots, análise de texto', examples:'GPT integration' },
      { id:'prompting', name:'Prompt Engineering', lvl:'Intermediate', desc:'Otimização de prompts para melhores respostas de IA.', apps:'Automação inteligente', examples:'Técnicas de prompting' }
    ],
    programming: [
      { id:'java', name:'Java', lvl:'Intermediate', desc:'Linguagem orientada a objetos robusta.', apps:'Aplicações robustas', examples:'POO, padrões' },
      { id:'javascript', name:'JavaScript', lvl:'Intermediate', desc:'Desenvolvimento full-stack e interatividade web.', apps:'Frontend, automação', examples:'DOM, async/await' },
      { id:'git', name:'Git', lvl:'Intermediate', desc:'Controle de versão distribuído.', apps:'Fluxos de trabalho', examples:'Branches, commits' },
      { id:'linux', name:'Linux', lvl:'Intermediate', desc:'Administração de sistemas e linha de comando.', apps:'Servidores, scripting', examples:'Bash, comandos' }
    ],
    data: [
      { id:'postgres', name:'PostgreSQL', lvl:'Intermediate', desc:'Bancos de dados relacionais robustos.', apps:'Aplicações IA, analytics', examples:'Queries, indexes' },
      { id:'mongodb', name:'MongoDB', lvl:'Basic', desc:'Banco NoSQL flexível para dados não estruturados.', apps:'Aplicações modernas', examples:'Documents, schemas' }
    ]
  },
  projects: [
    {
      id:1, name:'Landing Page',
      short:'Landing page moderna com design responsivo e foco em experiência do usuário.',
      description:'Landing page moderna com design responsivo, otimizada para conversão e experiência do usuário. Demonstra proficiência em design web e implementação de interfaces intuitivas.',
      url:'https://guilherme-yuj1.github.io/LandingPage/',
      technologies:['HTML5','CSS3','JavaScript','Responsive Design'],
      features:[
        'Design responsivo',
        'Interface moderna',
        'Otimização UX',
        'Performance'
      ]
    },
    {
      id:2, name:'Angry Birds Login',
      short:'Tela de login temática inspirada no universo Angry Birds, com foco em interface visual e interatividade.',
      description:'Tela de login criativa e temática inspirada no universo Angry Birds. Demonstra proficiência em design visual, animações e criação de interfaces divertidas e funcionais.',
      url:'https://guilherme-yuj1.github.io/angry-birds-login/',
      technologies:['HTML5','CSS3','JavaScript','Animações'],
      features:[
        'Design temático',
        'Animações fluidas',
        'Interface interativa',
        'Responsivo'
      ]
    }
  ],
  githubUsername: 'guilherme-yuj1' // optional: used to fetch public profile
};

/* =========================
   DOM references
   ========================= */
const bootEl = document.getElementById('boot');
const bootOutput = document.getElementById('boot-output');
const terminalSection = document.getElementById('terminal-section');
const outputEl = document.getElementById('output');
const inputEl = document.getElementById('cmdline');
const statusEl = document.getElementById('status');
const sidebarEl = document.getElementById('sidebar');
const matrixCanvas = document.getElementById('matrix-canvas');
const bgCanvas = document.getElementById('bg-canvas');
const toggleSoundBtn = document.getElementById('toggle-sound');
const clearBtn = document.getElementById('clear-btn');
const bootCursor = document.querySelector('.boot-cursor');
const modalTemplate = document.getElementById('modal-template');
const modalOverlay = document.getElementById('modal-overlay');

// Track open modals
const openModals = new Map();

/* =========================
   UI Helpers
   ========================= */
function t(pt, en){
  return state.lang === 'pt' ? pt : en;
}

function printLine(text = '', opts = {}) {
  // opts: typewriter (bool), delay (ms), preserve (append container), className
  const container = opts.container || outputEl;
  const line = document.createElement('div');
  line.className = 'line';
  if (opts.className) line.classList.add(opts.className);

  container.appendChild(line);
  container.scrollTop = container.scrollHeight;

  if (opts.typewriter) {
    // typewriter effect
    const speed = opts.speed || 18;
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'line-cursor';
    line.appendChild(cursor);

    const iv = setInterval(()=> {
      if (i >= text.length) {
        clearInterval(iv);
        cursor.remove();
        if (opts.onComplete) opts.onComplete();
        container.scrollTop = container.scrollHeight;
        return;
      }
      const ch = document.createTextNode(text[i]);
      line.insertBefore(ch, cursor);
      i++;
      container.scrollTop = container.scrollHeight;
    }, speed);
  } else {
    line.textContent = text;
  }
  container.scrollTop = container.scrollHeight;
  return line;
}

function clearOutput() {
  outputEl.innerHTML = '';
}

/* =========================
   Modal System
   ========================= */
function openModal(id) {
  if (openModals.has(id)) {
    openModals.get(id).win.focus();
    return;
  }
  modalOverlay.classList.add('active');
}

function closeModal(id) {
  if (openModals.has(id)) {
    const modal = openModals.get(id);
    modal.win.classList.remove('active');
    setTimeout(() => {
      if (modal.win.parentNode) {
        modal.win.parentNode.removeChild(modal.win);
      }
      openModals.delete(id);
      if (openModals.size === 0) {
        modalOverlay.classList.remove('active');
      }
      inputEl.focus();
    }, 200);
  }
}

function closeAllModals() {
  const ids = Array.from(openModals.keys());
  ids.forEach(id => closeModal(id));
}

/* =========================
   Boot sequence (typing)
   ========================= */
const bootLines = [
  'Initializing Portfolio System...',
  'Loading User Profile...',
  'Loading Projects...',
  'Loading Skills...',
  'Loading GitHub Integration...',
  'System Ready.',
  '',
  `Welcome to ${state.user.name} Portfolio v2.0`,
  `Type "help" to begin.`
];

async function runBootSequence(){
  bootOutput.innerHTML = '';
  for (const line of bootLines) {
    await new Promise(res => {
      // print with typing and small delay
      printBootLine(line, { speed: 20, onComplete: ()=> setTimeout(res, 200) });
    });
  }
  // fade boot and show terminal
  bootEl.setAttribute('aria-hidden','true');
  bootEl.style.transition = 'opacity 400ms ease, transform 400ms ease';
  bootEl.style.opacity = '0';
  bootEl.style.transform = 'translateY(-8px)';
  setTimeout(()=> bootEl.style.display = 'none', 450);
  terminalSection.setAttribute('aria-hidden','false');
  inputEl.focus();
  printLine(t('Digite "help" para começar.', 'Type "help" to begin.'), { typewriter:true });
}

/* Boot print helper */
function printBootLine(text, opts = {}) {
  return new Promise(res => {
    const speed = opts.speed || 18;
    const line = document.createElement('div');
    line.className = 'boot-line';
    bootOutput.appendChild(line);
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'line-cursor';
    line.appendChild(cursor);
    const iv = setInterval(()=> {
      if (i >= text.length) {
        clearInterval(iv);
        cursor.remove();
        if (opts.onComplete) opts.onComplete();
        res();
        return;
      }
      const ch = document.createTextNode(text[i]);
      line.insertBefore(ch, cursor);
      i++;
    }, speed);
  });
}

/* =========================
   Terminal interaction
   ========================= */
let history = [];
let histIndex = -1;
let typingSound = false;
let audioContext;
function playKeySound(){
  if (!typingSound) return;
  if (!audioContext) audioContext = new (window.AudioContext||window.webkitAudioContext)();
  const o = audioContext.createOscillator();
  const g = audioContext.createGain();
  o.type = 'square';
  o.frequency.value = 800;
  g.gain.value = 0.01;
  o.connect(g); g.connect(audioContext.destination);
  o.start();
  setTimeout(()=> { o.stop(); }, 40);
}

/* Autocomplete support */
function getAutocompleteMatches(prefix) {
  const words = [...state.commands, ...state.projects.map(p=>`open ${p.id}`)];
  const p = prefix.trim().toLowerCase();
  if (!p) return words;
  return words.filter(w => w.toLowerCase().startsWith(p));
}

/* Key handlers */
inputEl.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') {
    ev.preventDefault();
    const raw = inputEl.value.trim();
    if (raw.length === 0) {
      printLine('$', { className:'muted' });
      inputEl.value = '';
      return;
    }
    executeCommand(raw);
    history.push(raw);
    histIndex = history.length;
    inputEl.value = '';
  } else if (ev.key === 'ArrowUp') {
    ev.preventDefault();
    if (history.length === 0) return;
    histIndex = Math.max(0, histIndex - 1);
    inputEl.value = history[histIndex] || '';
  } else if (ev.key === 'ArrowDown') {
    ev.preventDefault();
    histIndex = Math.min(history.length, histIndex + 1);
    inputEl.value = history[histIndex] || '';
  } else if (ev.key === 'Tab') {
    ev.preventDefault();
    const cur = inputEl.value;
    const matches = getAutocompleteMatches(cur);
    if (matches.length === 1) {
      inputEl.value = matches[0] + (matches[0].startsWith('open') ? ' ' : '');
    } else if (matches.length > 1) {
      printLine(matches.join('    '));
    }
  } else if (ev.key === 'Escape') {
    closeAllModals();
  } else {
    // sound on keypress
    playKeySound();
  }
});

/* Execute command parser */
function executeCommand(raw) {
  // echo command
  const echo = document.createElement('div');
  echo.className = 'line';
  const prm = document.createElement('span');
  prm.className = 'prompt';
  prm.textContent = `guilherme@yuji:~$ `;
  echo.appendChild(prm);
  const txt = document.createElement('span');
  txt.textContent = raw;
  echo.appendChild(txt);
  outputEl.appendChild(echo);

  // parse
  const args = raw.split(' ').filter(Boolean);
  const cmd = args[0].toLowerCase();

  switch (cmd) {
    case 'help': return cmdHelp();
    case 'about': return cmdAbout();
    case 'skills': return cmdSkills();
    case 'projects': return cmdProjects();
    case 'open': return cmdOpen(args.slice(1));
    case 'education': return cmdEducation();
    case 'github': return cmdGithub();
    case 'contact': return cmdContact();
    case 'clear': return (clearOutput(), printLine(t('Terminal limpo.', 'Terminal cleared.')));
    case 'lang': return cmdLang(args.slice(1));
    case 'coffee': return printLine('Developer fuel level: 98%');
    case 'ai': return printLine('Artificial Intelligence Module Loaded.\n\nStatus:\nREADY\n\nModel:\nGPT Integrated');
    case 'sudo':
      if (args[1] && args[1].toLowerCase() === 'hire' && args[2] && args[2].toLowerCase().startsWith('guilherme')) {
        printLine('Access granted.');
        return printLine('Hiring recommendation: APPROVED');
      }
      return printLine('sudo: command not recognized');
    case 'matrix': return toggleMatrix();
    case 'whoami': return printLine(`${state.user.name}\n${state.user.title[state.lang]}`);
    default:
      return printLine(`${cmd}: command not found. Type "help".`);
  }
}

/* =========================
   Command implementations
   ========================= */

function cmdHelp(){
  const lines = [
    t('Comandos disponíveis:','Available commands:'),
    'about',
    'skills',
    'projects',
    'education',
    'github',
    'contact',
    'clear',
    'lang pt',
    'lang en',
    '',
    t('Easter eggs: coffee, ai, sudo hire Guilherme, matrix, whoami','Easter eggs: coffee, ai, sudo hire Guilherme, matrix, whoami'),
    t('Use "open <n>" para abrir projeto','Use "open <n>" to open project')
  ];
  lines.forEach(l => printLine(l));
}

function cmdAbout(){
  printLine(`Nome: ${state.user.name}`);
  printLine(`Cargo: ${state.user.title[state.lang]}`);
  printLine('');
  printLine(state.user.description[state.lang], { typewriter:true });
}

function cmdSkills(){
  printLine(t('Skills (clique para detalhes):','Skills (click for details):'));
  // group by category
  Object.entries(state.skills).forEach(([category, items])=>{
    const catLine = document.createElement('div');
    catLine.className = 'line';
    const catTitle = document.createElement('div');
    const categoryLabels = {
      python: 'Python',
      ai: 'Artificial Intelligence',
      programming: 'Programming',
      data: 'Data'
    };
    catTitle.textContent = categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);
    catTitle.style.fontWeight = '600';
    catTitle.style.marginBottom = '6px';
    catLine.appendChild(catTitle);
    outputEl.appendChild(catLine);

    const row = document.createElement('div');
    row.className = 'line';
    items.forEach(s => {
      const el = document.createElement('span');
      el.className = 'cmd-link clickable';
      el.textContent = ` ${s.name} `;
      el.style.marginRight = '8px';
      el.style.padding = '4px 6px';
      el.style.borderRadius = '6px';
      el.style.background = 'rgba(255,255,255,0.01)';
      el.style.display = 'inline-block';
      el.style.cursor = 'pointer';
      el.setAttribute('role','button');
      el.tabIndex = 0;
      el.addEventListener('click', ()=> openSkillModal(s));
      el.addEventListener('keydown', (e)=>{ if (e.key==='Enter') openSkillModal(s) });
      row.appendChild(el);
    });
    outputEl.appendChild(row);
  });
  outputEl.scrollTop = outputEl.scrollHeight;
}

function cmdProjects(){
  printLine(t('Projetos:','Projects:'));
  state.projects.forEach(p => {
    const line = document.createElement('div');
    line.className = 'line';
    line.innerHTML = `<span class="badge">[${p.id}]</span> <strong>${p.name}</strong> — ${p.short} <span style="color:var(--accent1);margin-left:8px;cursor:pointer" class="cmd-link" data-open="${p.id}">(open)</span>`;
    outputEl.appendChild(line);
  });

  // attach click handlers for open anchors
  outputEl.querySelectorAll('.cmd-link[data-open]').forEach(el=>{
    el.addEventListener('click', ()=> {
      const id = parseInt(el.getAttribute('data-open'),10);
      openProjectModal(id);
    });
  });
}

function cmdOpen(args){
  if (!args.length) return printLine(t('Usage: open <n>', 'Usage: open <n>'));
  const id = parseInt(args[0],10);
  if (isNaN(id)) return printLine(t('Número de projeto inválido', 'Invalid project number'));
  openProjectModal(id);
}

function cmdEducation(){
  printLine(t('Timeline de Educação:', 'Education timeline:'));
  const timeline = [
    { year: '2024', text: t('Início dos estudos em Python e IA','Started studying Python and AI') },
    { year: '2025', text: t('Desenvolvimento de projetos com Machine Learning','Building ML projects') },
    { year: '2026', text: t('Especialização em Inteligência Artificial aplicada','Specialization in Applied AI') }
  ];
  timeline.forEach(item=>{
    const el = document.createElement('div');
    el.className = 'line';
    el.innerHTML = `<span class="timeline-dot" aria-hidden="true"></span> <strong>${item.year}</strong> → ${item.text}`;
    outputEl.appendChild(el);
  });
}

async function cmdGithub(){
  // show sidebar with simulated or fetched data
  sidebarEl.innerHTML = '';
  sidebarEl.setAttribute('aria-hidden','false');
  sidebarEl.style.display = 'flex';

  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'sidebar-close';
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('title', t('Fechar', 'Close'));
  closeBtn.addEventListener('click', (e)=> {
    e.preventDefault();
    e.stopPropagation();
    sidebarEl.style.display = 'none';
    sidebarEl.setAttribute('aria-hidden','true');
    inputEl.focus();
  });
  sidebarEl.appendChild(closeBtn);

  const card = document.createElement('div');
  card.className = 'gh-card';
  const avatar = document.createElement('div');
  avatar.className = 'gh-avatar';
  avatar.textContent = state.user.name.split(' ').map(s=>s[0]).slice(0,2).join('');
  const info = document.createElement('div');
  info.innerHTML = `<div class="gh-name">${state.user.name}</div><div class="gh-bio">${state.user.title[state.lang]}</div><div style="margin-top:8px"><a class="cmd-link" href="https://github.com/${state.githubUsername}" target="_blank" rel="noopener">Visit Profile</a></div>`;
  card.appendChild(avatar);
  card.appendChild(info);
  sidebarEl.appendChild(card);

  // Attempt to fetch GitHub public profile
  try {
    const res = await fetch(`https://api.github.com/users/${state.githubUsername}`);
    if (!res.ok) throw new Error('no github');
    const data = await res.json();
    const stats = document.createElement('div');
    stats.style.marginTop = '12px';
    stats.innerHTML = `<div style="display:flex;gap:8px"><div class="badge">Repos: ${data.public_repos}</div><div class="badge">Followers: ${data.followers}</div></div><div style="margin-top:8px;color:#9aa6b2;font-size:12px">${data.bio || ''}</div>`;
    sidebarEl.appendChild(stats);

    // top languages / sample repos (simplified)
    const reposRes = await fetch(`https://api.github.com/users/${state.githubUsername}/repos?per_page=8&sort=updated`);
    if (reposRes.ok){
      const repos = await reposRes.json();
      const list = document.createElement('div');
      list.style.marginTop='12px';
      list.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Repositories</div>`;
      repos.slice(0,6).forEach(r=>{
        const li = document.createElement('div');
        li.innerHTML = `<a class="cmd-link" href="${r.html_url}" target="_blank" rel="noopener">${r.name}</a> <span style="color:#8892a6">— ${r.language || ''}</span>`;
        list.appendChild(li);
      });
      sidebarEl.appendChild(list);
    }
  } catch (err) {
    // fallback simulated stats
    const fake = document.createElement('div');
    fake.style.marginTop='12px';
    fake.innerHTML = `<div class="badge">Repos: 12</div> <div class="badge">Followers: 42</div><div style="margin-top:8px;color:#9aa6b2">Simulated GitHub stats (rate limits may prevent live fetch)</div>`;
    sidebarEl.appendChild(fake);
  }
}

/* Contact form modal */
function cmdContact(){
  const modalId = 'contact-' + Date.now();
  const modal = createWindow(t('Contact','Contato'), modalId);
  const form = document.createElement('form');
  form.innerHTML = `
    <div style="font-family:var(--mono);margin-bottom:8px">${t('Envie uma mensagem para Guilherme','Send a message to Guilherme')}</div>
    <label style="display:block;margin-bottom:6px"><span class="sr-only">Name</span><input name="name" placeholder="${t('Nome','Name')}" required style="width:100%;padding:8px;border-radius:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);color:var(--text);font-family:var(--mono);font-size:13px"></label>
    <label style="display:block;margin-bottom:6px"><span class="sr-only">Email</span><input name="email" placeholder="${t('Email','Email')}" type="email" required style="width:100%;padding:8px;border-radius:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);color:var(--text);font-family:var(--mono);font-size:13px"></label>
    <label style="display:block;margin-bottom:8px"><span class="sr-only">Message</span><textarea name="message" placeholder="${t('Mensagem','Message')}" required style="width:100%;height:120px;padding:8px;border-radius:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);color:var(--text);font-family:var(--mono);font-size:13px;resize:none"></textarea></label>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button type="submit" style="padding:8px 12px;border-radius:8px;background:var(--accent1);border:0;color:var(--panel);font-weight:600;cursor:pointer">${t('Enviar','Send Message')}</button>
    </div>
  `;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const f = new FormData(form);
    const name = f.get('name').trim();
    const email = f.get('email').trim();
    const message = f.get('message').trim();
    if (!name || !email || !message) return showFormStatus(modal, t('Preencha todos os campos.','Please fill all fields.'));
    if (!/^\S+@\S+\.\S+$/.test(email)) return showFormStatus(modal, t('Email inválido.','Invalid email.'));
    // Simulate sending
    showFormStatus(modal, t('Enviando mensagem...','Sending message...'));
    setTimeout(()=> {
      showFormStatus(modal, t('Mensagem enviada com sucesso!','Message sent successfully!'));
    }, 900);
  });
  modal.body.appendChild(form);
}

function showFormStatus(mod, text){
  // show small status line in modal
  let st = mod.body.querySelector('.form-status');
  if(!st){
    st = document.createElement('div'); st.className='form-status'; st.style.marginTop='8px';
    mod.body.appendChild(st);
  }
  st.textContent = text;
}

/* Skills modal */
function openSkillModal(skill){
  const modalId = 'skill-' + skill.id + '-' + Date.now();
  const modal = createWindow(skill.name, modalId);
  const body = document.createElement('div');
  body.innerHTML = `
    <div style="font-family:var(--mono);margin-bottom:8px"><strong>${skill.name}</strong> — ${skill.lvl}</div>
    <div style="color:#b9c1cc;margin-bottom:8px">${skill.desc}</div>
    <div style="font-weight:600;margin-bottom:6px">${t('Aplicações','Applications')}</div>
    <div style="margin-bottom:8px">${skill.apps}</div>
    <div style="font-weight:600;margin-bottom:6px">${t('Exemplos','Examples')}</div>
    <pre style="background:rgba(255,255,255,0.02);padding:8px;border-radius:6px;font-family:var(--mono);font-size:13px;overflow:auto">${skill.examples}</pre>
  `;
  modal.body.appendChild(body);
}

/* Project modal */
function openProjectModal(id){
  const p = state.projects.find(x=>x.id===id);
  if(!p) return printLine(t('Projeto não encontrado','Project not found'));
  const modalId = 'project-' + p.id + '-' + Date.now();
  const modal = createWindow(p.name, modalId);
  const body = document.createElement('div');
  body.innerHTML = `
    <div style="font-weight:600;margin-bottom:8px">${p.short}</div>
    <div class="project-snapshot" aria-hidden="true">${p.name} — preview</div>
    <div style="margin-top:12px;color:#b9c1cc">${p.description}</div>
    <div style="margin-top:12px;font-weight:600">${t('Tecnologias','Technologies')}</div>
    <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">${p.technologies.map(t=>`<span class="badge">${t}</span>`).join('')}</div>
    <div style="margin-top:12px;font-weight:600">${t('Recursos','Features')}</div>
    <ul style="margin-top:6px">${p.features.map(f=>`<li>${f}</li>`).join('')}</ul>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><a class="cmd-link" href="${p.url}" target="_blank" rel="noopener">${t('Visit Project','Visitar Projeto')}</a><a class="cmd-link" href="${p.url}" target="_blank" rel="noopener">${t('Open in New Tab','Abrir em Nova Aba')}</a></div>
  `;
  modal.body.appendChild(body);
}

/* Create window (modal) helper: draggable */
function createWindow(title = 'Window', id = null){
  const windowId = id || 'window-' + Date.now();
  const tpl = modalTemplate.content.cloneNode(true);
  const win = tpl.querySelector('.window');
  win.id = windowId;
  const header = win.querySelector('.window-header');
  win.querySelector('.window-title').textContent = title;
  const body = win.querySelector('.window-body');
  document.body.appendChild(win);
  
  // Track modal
  openModals.set(windowId, { win, header, body });

  // Activate modal after a tick
  setTimeout(() => {
    win.classList.add('active');
    openModal(windowId);
  }, 10);

  // make draggable
  let isDown = false, startX=0, startY=0, origX=0, origY=0;
  header.addEventListener('pointerdown', (e)=>{
    isDown = true;
    win.classList.add('dragging');
    startX = e.clientX; startY = e.clientY;
    const rect = win.getBoundingClientRect();
    origX = rect.left; origY = rect.top;
    header.setPointerCapture(e.pointerId);
  });
  header.addEventListener('pointermove', (e)=>{
    if(!isDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    win.style.left = (origX + dx) + 'px';
    win.style.top = (origY + dy) + 'px';
    win.style.transform = 'translate(0,0)';
  });
  header.addEventListener('pointerup', (e)=>{
    isDown = false;
    win.classList.remove('dragging');
    header.releasePointerCapture(e.pointerId);
  });

  // Close button - FIXED with proper event handling
  const closeBtn = win.querySelector('.close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e)=> {
      e.preventDefault();
      e.stopPropagation();
      closeModal(windowId);
      return false;
    });
  }

  // Minimize button
  const minimizeBtn = win.querySelector('.minimize');
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', ()=> {
      if (win.style.height && win.style.height!=='auto') {
        win.style.height = ''; win.style.overflow = 'visible';
      } else {
        win.style.height = '40px'; win.style.overflow = 'hidden';
      }
    });
  }

  // Close on ESC key (only for this specific window)
  const escapeHandler = (e)=> { 
    if (e.key === 'Escape' && openModals.has(windowId)) {
      e.preventDefault();
      closeModal(windowId);
    }
  };
  document.addEventListener('keydown', escapeHandler);

  // Close on outside click (overlay click)
  const overlayClickHandler = (e)=> {
    if (e.target === modalOverlay && openModals.has(windowId)) {
      e.preventDefault();
      e.stopPropagation();
      closeModal(windowId);
    }
  };
  modalOverlay.addEventListener('click', overlayClickHandler);

  // Store cleanup handlers
  win._handlers = {
    escapeHandler,
    overlayClickHandler
  };

  return { win, header, body };
}

/* =========================
   Matrix effect
   ========================= */
let matrixActive = false;
let matrixInterval;
function toggleMatrix(){
  matrixActive = !matrixActive;
  if (matrixActive) startMatrix();
  else stopMatrix();
  printLine(matrixActive ? 'Matrix mode: ON' : 'Matrix mode: OFF');
}

function startMatrix(){
  matrixCanvas.style.display = 'block';
  const ctx = matrixCanvas.getContext('2d');
  function resize(){
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  const cols = Math.floor(matrixCanvas.width/14);
  const drops = Array(cols).fill(0);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  matrixInterval = setInterval(()=> {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0,0,matrixCanvas.width,matrixCanvas.height);
    ctx.fillStyle = '#00FF41';
    ctx.font = '14px monospace';
    for (let i=0;i<drops.length;i++){
      const text = String.fromCharCode(0x30A0 + Math.random()*96);
      ctx.fillText(text, i*14, drops[i]*14);
      if (drops[i]*14 > matrixCanvas.height && Math.random() > 0.975) drops[i]=0;
      drops[i]++;
    }
  }, 50);
}

function stopMatrix(){
  clearInterval(matrixInterval);
  const ctx = matrixCanvas.getContext('2d');
  ctx && ctx.clearRect(0,0,matrixCanvas.width,matrixCanvas.height);
  matrixCanvas.style.display = 'none';
}

/* =========================
   Particles background (discrete)
   ========================= */
(function bgParticles(){
  const c = bgCanvas;
  const ctx = c.getContext('2d');
  let w,h, particles = [];
  function resize(){ w = c.width = innerWidth; h = c.height = innerHeight; init(); }
  function init(){
    particles = [];
    for (let i=0;i<80;i++){
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: Math.random()*1.8 + 0.3,
        vx: (Math.random()-0.5)*0.25,
        vy: (Math.random()-0.5)*0.25,
        hue: 180 + Math.random()*90,
        life: Math.random() * 0.8 + 0.2
      });
    }
  }
  function loop(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if (p.x<0) p.x = w;
      if (p.x>w) p.x = 0;
      if (p.y<0) p.y = h;
      if (p.y>h) p.y = 0;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${(0.04 + p.r*0.06) * p.life})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  resize();
  window.addEventListener('resize', resize);
  loop();
})();

/* =========================
   Language switching
   ========================= */
function cmdLang(args){
  if (!args.length) return printLine(t('Use: lang pt | lang en','Use: lang pt | lang en'));
  const l = args[0].toLowerCase();
  if (l !== 'pt' && l !== 'en') return printLine(t('Idioma desconhecido','Unknown language'));
  state.lang = l;
  printLine(t('Idioma alterado para Português','Language switched to English'));
}

/* =========================
   UI hooks
   ========================= */
toggleSoundBtn.addEventListener('click', ()=>{
  typingSound = !typingSound;
  toggleSoundBtn.setAttribute('aria-pressed', typingSound ? 'true' : 'false');
});

clearBtn.addEventListener('click', ()=> clearOutput());

/* =========================
   Accessibility and focus considerations
   ========================= */
document.addEventListener('click', (e)=> {
  // Only focus input if clicking on terminal or sidebar areas
  if (e.target.closest('.terminal') || e.target.closest('.output')) {
    inputEl.focus();
  }
});

document.addEventListener('keydown', (e)=> {
  // quick focus ctrl+/
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault(); inputEl.focus();
  }
});

/* =========================
   Init
   ========================= */
window.addEventListener('load', ()=>{
  // start boot sequence then show terminal
  runBootSequence();

  // prepare matrix canvas hidden
  matrixCanvas.style.position = 'fixed';
  matrixCanvas.style.inset = 0;
  matrixCanvas.style.zIndex = 1;
  matrixCanvas.style.display = 'none';

  // Welcome splash entry printed already, ensure focus
  setTimeout(()=> inputEl.focus(), 800);
});

/* =========================
   Exported globals for inline handlers
   ========================= */
window.openProjectModal = openProjectModal;
window.openSkillModal = openSkillModal;

/* =========================
   End of script
   ========================= */
