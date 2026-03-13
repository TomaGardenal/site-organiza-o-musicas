/* ── MARKETING VIEW ─────────────────────────────── */

const PLATFORM_ICONS = {
  'Instagram': '📸',
  'TikTok': '🎵',
  'YouTube': '▶️',
  'Twitter': '🐦',
  'Facebook': '👥',
  'Spotify': '🟢',
  'Outro': '📣',
};

function renderMarketingTab(posts, projectId) {
  const postCards = posts.length
    ? posts.map((p, i) => `
        <div class="post-card stagger-${Math.min(i + 1, 6)}">
          <div class="post-card-header">
            <span class="platform-badge platform-${p.platform}">${PLATFORM_ICONS[p.platform] || '📣'} ${p.platform}</span>
            <span class="${getBadgeClass(p.status)}">${statusLabel(p.status)}</span>
          </div>
          ${p.media_file ? `<img src="${p.media_file}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:10px" alt="média">` : ''}
          <div class="post-caption">${escapeHtml(p.caption) || '<em style="color:var(--text-muted)">Sem legenda</em>'}</div>
          ${p.idea_notes ? `<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">💡 ${escapeHtml(p.idea_notes)}</div>` : ''}
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span class="post-date">📅 ${p.planned_date ? new Date(p.planned_date).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}) : 'Sem data/hora'}</span>
            <div style="display:flex;gap:6px">
              <button class="btn-icon" onclick="openEditPostModal(${p.id}, ${projectId})" title="Editar">✏️</button>
              <button class="btn-icon" onclick="deletePost(${p.id}, ${projectId})" title="Excluir">🗑️</button>
            </div>
          </div>
        </div>`).join('')
    : `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">📢</div>
        <h3>Nenhum post de divulgação</h3>
        <p>Planeje seus posts de marketing aqui</p>
      </div>`;

  return `
    <div>
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        <button class="btn btn-primary btn-sm" onclick="openNewPostModal(${projectId})">➕ Adicionar Post</button>
      </div>
      <div class="posts-grid">${postCards}</div>
    </div>`;
}

function openNewPostModal(projectId) {
  document.getElementById('post-modal-title').textContent = '➕ Novo Post';
  document.getElementById('post-form').reset();
  document.getElementById('post-id').value = '';
  document.getElementById('post-project-id').value = projectId;
  document.getElementById('post-media-url').value = '';
  document.getElementById('post-modal').classList.add('open');
}

async function openEditPostModal(postId, projectId) {
  const post = await API.marketing.get ? await API.marketing.get(postId) : null;
  if (!post) {
    // fallback: find in current project
    const found = (window._currentProject?.marketing_posts || []).find(p => p.id === postId);
    if (!found) return;
    _fillPostModal(found, projectId);
    return;
  }
  _fillPostModal(post, projectId);
}

function _fillPostModal(post, projectId) {
  document.getElementById('post-modal-title').textContent = '✏️ Editar Post';
  document.getElementById('post-id').value = post.id;
  document.getElementById('post-project-id').value = projectId;
  document.getElementById('post-platform').value = post.platform;
  document.getElementById('post-caption').value = post.caption;
  document.getElementById('post-planned-date').value = post.planned_date;
  document.getElementById('post-status').value = post.status;
  document.getElementById('post-idea-notes').value = post.idea_notes;
  document.getElementById('post-media-url').value = post.media_file;
  document.getElementById('post-modal').classList.add('open');
}

async function savePost() {
  const id = document.getElementById('post-id').value;
  const projectId = document.getElementById('post-project-id').value;
  const data = {
    project_id: parseInt(projectId),
    platform: document.getElementById('post-platform').value,
    caption: document.getElementById('post-caption').value,
    planned_date: document.getElementById('post-planned-date').value,
    status: document.getElementById('post-status').value,
    idea_notes: document.getElementById('post-idea-notes').value,
    media_file: document.getElementById('post-media-url').value,
  };
  if (!data.platform) { showToast('Selecione a plataforma.', 'error'); return; }

  try {
    if (id) {
      await API.marketing.update(id, data);
      showToast('Post atualizado!', 'success');
    } else {
      await API.marketing.create(data);
      showToast('Post criado!', 'success');
    }
    closeModal('post-modal');
    const project = await API.projects.get(projectId);
    window._currentProject = project;
    document.getElementById('tab-content').innerHTML = renderMarketingTab(project.marketing_posts, projectId);
    document.getElementById('tab-marketing').textContent = `📢 Divulgação (${project.marketing_posts.length})`;
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
}

async function deletePost(postId, projectId) {
  if (!confirm('Excluir este post?')) return;
  try {
    await API.marketing.delete(postId);
    showToast('Post excluído.', 'success');
    const project = await API.projects.get(projectId);
    window._currentProject = project;
    document.getElementById('tab-content').innerHTML = renderMarketingTab(project.marketing_posts, projectId);
    document.getElementById('tab-marketing').textContent = `📢 Divulgação (${project.marketing_posts.length})`;
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
}
