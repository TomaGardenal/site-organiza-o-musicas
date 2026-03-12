/* ── PROJECTS VIEW ──────────────────────────────── */

async function renderProjects() {
  const container = document.getElementById('page-content');
  container.innerHTML = `<div class="loading-spinner"><div class="spinner"></div></div>`;

  try {
    const projects = await API.projects.list();
    const coverMap = { Single: '🎵', EP: '🎶', Mixtape: '📀', Álbum: '🎼' };

    const cardsHtml = projects.length
      ? projects.map((p, i) => `
          <div class="project-card stagger-${Math.min(i + 1, 6)}" onclick="navigate('project', ${p.id})">
            <div class="project-card-cover">
              ${p.cover_image
                ? `<img src="${p.cover_image}" alt="${escapeHtml(p.name)}">`
                : `<div class="cover-placeholder" style="background:linear-gradient(135deg,rgba(124,58,237,0.3),rgba(6,182,212,0.2))">${coverMap[p.project_type] || '🎧'}</div>`}
              <span class="project-type-badge">${p.project_type}</span>
            </div>
            <div class="project-card-body">
              <div class="project-card-name">${escapeHtml(p.name)}</div>
              <div class="project-card-desc">${escapeHtml(p.description) || '<em style="color:var(--text-muted)">Sem descrição</em>'}</div>
              <div class="project-card-meta">
                <div class="project-card-stats">
                  <span class="project-stat">🎤 ${p.track_count} faixas</span>
                  <span class="project-stat">📢 ${p.post_count} posts</span>
                </div>
                <span class="${getBadgeClass(p.status)}">${statusLabel(p.status)}</span>
              </div>
              ${p.genre_tags && p.genre_tags.length
                ? `<div class="tags-container">${p.genre_tags.filter(t => t).map(t => `<span class="tag">${t}</span>`).join('')}</div>`
                : ''}
              ${p.release_date ? `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">📅 ${p.release_date}</div>` : ''}
            </div>
          </div>`).join('')
      : `<div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon float">♪</div>
          <h3>Nenhum projeto ainda</h3>
          <p>Crie o seu primeiro projeto musical</p>
          <button class="btn btn-primary" onclick="App.openNewProjectModal()">Novo projeto</button>
        </div>`;

    container.innerHTML = `
      <div class="page-enter">
        <div class="section-header">
          <div>
            <h1 class="section-title">Projetos</h1>
            <p class="section-subtitle">${projects.length} projeto(s)</p>
          </div>
          <button class="btn btn-primary" onclick="App.openNewProjectModal()">Novo projeto</button>
        </div>
        <div class="projects-grid">${cardsHtml}</div>
      </div>`;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><p>Erro: ${e.message}</p></div>`;
  }
}

async function renderProjectDetail(projectId) {
  const container = document.getElementById('page-content');
  container.innerHTML = `<div class="loading-spinner"><div class="spinner"></div></div>`;

  try {
    const project = await API.projects.get(projectId);
    const coverMap = { Single: '🎵', EP: '🎶', Mixtape: '📀', Álbum: '🎼' };

    container.innerHTML = `
      <div class="page-enter">
          <div style="margin-bottom:16px">
          <button class="btn btn-ghost btn-sm" onclick="navigate('projects')">← Voltar</button>
        </div>

        <div class="project-hero">
          <div class="project-hero-banner">
            ${project.cover_image
              ? `<img src="${project.cover_image}" alt="${escapeHtml(project.name)}">`
              : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:80px;background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.2))">${coverMap[project.project_type] || '🎧'}</div>`}
            <div class="banner-overlay"></div>
          </div>
          <div class="project-hero-body">
            <div class="project-hero-type">${project.project_type}</div>
            <h1 class="project-hero-name">${escapeHtml(project.name)}</h1>
            ${project.description ? `<p class="project-hero-desc">${escapeHtml(project.description)}</p>` : ''}
            <div class="project-hero-meta">
              <span class="${getBadgeClass(project.status)}">${statusLabel(project.status)}</span>
              ${project.release_date ? `<span class="project-meta-item">📅 ${project.release_date}</span>` : ''}
              <span class="project-meta-item">🎤 ${project.track_count} faixas</span>
              <span class="project-meta-item">📢 ${project.post_count} posts</span>
            </div>
            ${project.genre_tags?.length ? `<div class="tags-container">${project.genre_tags.filter(t=>t).map(t=>`<span class="tag">${t}</span>`).join('')}</div>` : ''}
          </div>
        </div>

        <!-- Action buttons -->
        <div style="display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" onclick="openEditProjectModal(${project.id})">Editar projeto</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteProject(${project.id})">Excluir</button>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab-btn active" id="tab-tracks" onclick="switchTab('tracks', ${project.id})">Faixas (${project.tracks.length})</button>
          <button class="tab-btn" id="tab-marketing" onclick="switchTab('marketing', ${project.id})">Divulgação (${project.marketing_posts.length})</button>
        </div>

        <div id="tab-content">
          ${renderTracksTab(project.tracks, project.id)}
        </div>
      </div>`;

    // Store project for later use
    window._currentProject = project;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><p>Erro: ${e.message}</p></div>`;
  }
}

function switchTab(tab, projectId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  const content = document.getElementById('tab-content');
  if (tab === 'tracks') {
    content.innerHTML = renderTracksTab((window._currentProject?.tracks || []), projectId);
  } else {
    content.innerHTML = renderMarketingTab((window._currentProject?.marketing_posts || []), projectId);
  }
}

/* ── PROJECT MODAL ──────────────────────────────────── */
function openNewProjectModal(defaults = {}) {
  const modal = document.getElementById('project-modal');
  document.getElementById('project-modal-title').textContent = '➕ Novo Projeto';
  document.getElementById('project-form').reset();
  document.getElementById('project-id').value = '';
  document.getElementById('cover-preview').src = '';
  document.getElementById('cover-preview').style.display = 'none';
  document.getElementById('project-cover-url').value = '';
  modal.classList.add('open');
}

async function openEditProjectModal(projectId) {
  const project = await API.projects.get(projectId);
  const modal = document.getElementById('project-modal');
  document.getElementById('project-modal-title').textContent = '✏️ Editar Projeto';
  document.getElementById('project-id').value = project.id;
  document.getElementById('project-name').value = project.name;
  document.getElementById('project-type').value = project.project_type;
  document.getElementById('project-desc').value = project.description;
  document.getElementById('project-release').value = project.release_date;
  document.getElementById('project-status').value = project.status;
  document.getElementById('project-tags').value = (project.genre_tags || []).join(', ');
  document.getElementById('project-cover-url').value = project.cover_image;
  if (project.cover_image) {
    const prev = document.getElementById('cover-preview');
    prev.src = project.cover_image;
    prev.style.display = 'block';
  }
  modal.classList.add('open');
}

async function saveProject() {
  const id = document.getElementById('project-id').value;
  const tagsRaw = document.getElementById('project-tags').value;
  const data = {
    name: document.getElementById('project-name').value.trim(),
    project_type: document.getElementById('project-type').value,
    description: document.getElementById('project-desc').value.trim(),
    release_date: document.getElementById('project-release').value,
    cover_image: document.getElementById('project-cover-url').value,
    status: document.getElementById('project-status').value,
    genre_tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
  };
  if (!data.name) { showToast('O nome do projeto é obrigatório.', 'error'); return; }

  try {
    if (id) {
      await API.projects.update(id, data);
      showToast('Projeto atualizado!', 'success');
    } else {
      await API.projects.create(data);
      showToast('Projeto criado!', 'success');
    }
    closeModal('project-modal');
    navigate('projects');
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
}

async function confirmDeleteProject(projectId) {
  if (!confirm('Excluir este projeto e todas as suas faixas e posts? Essa ação não pode ser desfeita.')) return;
  try {
    await API.projects.delete(projectId);
    showToast('Projeto excluído.', 'success');
    navigate('projects');
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
}
