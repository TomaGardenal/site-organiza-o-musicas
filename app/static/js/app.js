/* ── APP.JS — SPA ROUTER & UTILITIES ──────────────── */

// ── UTILITIES ──────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${escapeHtml(message)}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-dismiss');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

function handleFileUploadZone(zoneId, inputId, previewId, urlFieldId) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file, preview, urlFieldId);
  });

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) handleFileUpload(file, preview, urlFieldId);
  });
}

async function handleFileUpload(file, previewEl, urlFieldId) {
  try {
    showToast('Enviando arquivo...', 'success');
    const result = await API.uploadFile(file);
    if (urlFieldId) document.getElementById(urlFieldId).value = result.url;
    if (previewEl && file.type.startsWith('image/')) {
      previewEl.src = result.url;
      previewEl.style.display = 'block';
    }
    showToast('Arquivo enviado!', 'success');
  } catch (e) {
    showToast('Erro no upload: ' + e.message, 'error');
  }
}

// ── NAVIGATION ─────────────────────────────────────
let currentRoute = 'dashboard';
let currentProjectId = null;

function navigate(route, id = null) {
  currentRoute = route;
  currentProjectId = id;

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.remove('active');
    if (l.dataset.route === route) l.classList.add('active');
  });

  // Update topbar title
  const titles = {
    dashboard: 'Visão geral',
    projects: 'Projetos',
    project: 'Detalhes do projeto',
  };
  document.getElementById('topbar-title').textContent = titles[route] || '🎵 Music Manager';

  // Render view
  const main = document.getElementById('page-content');
  main.innerHTML = '';

  if (route === 'dashboard') renderDashboard();
  else if (route === 'projects') renderProjects();
  else if (route === 'project' && id) renderProjectDetail(id);
}

// ── SIDEBAR TOGGLE ─────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── MODAL CLICK-OUTSIDE CLOSE ──────────────────────
document.addEventListener('click', (e) => {
  document.querySelectorAll('.modal-overlay.open').forEach(overlay => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ── UPLOAD ZONE INIT ──────────────────────────────
function initUploadZones() {
  // Cover image
  handleFileUploadZone('cover-upload-zone', 'cover-file-input', 'cover-preview', 'project-cover-url');
  // Beat file
  handleFileUploadZone('beat-upload-zone', 'beat-file-input', null, 'beat-file-url');
  // Post media
  handleFileUploadZone('post-media-zone', 'post-media-input', 'post-media-preview', 'post-media-url');
}

// ── App NAMESPACE (for onclick access) ─────────────
const App = {
  openNewProjectModal,
};

// ── INIT ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initUploadZones();
  navigate('dashboard');
});
