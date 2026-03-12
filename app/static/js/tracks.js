/* ── TRACKS VIEW ─────────────────────────────────── */

function renderTracksTab(tracks, projectId) {
  const trackItems = tracks.length
    ? tracks.map((t, i) => {
        const hasAudio = t.beat_file && t.beat_file.endsWith && (t.beat_file.match(/\.(mp3|wav|ogg)$/i));
        return `
          <div class="track-item stagger-${Math.min(i + 1, 6)}">
            <div class="track-number">${String(i + 1).padStart(2, '0')}</div>
            <div class="track-info">
              <div class="track-title">🎤 ${escapeHtml(t.title)}</div>
              <div class="track-meta">
                ${t.beat_link ? `<a href="${t.beat_link}" target="_blank" style="color:var(--accent-cyan);font-size:11px">🔗 Beat link</a> · ` : ''}
                ${t.notes ? `📝 Tem notas` : ''}
              </div>
              ${hasAudio ? renderPlayer(t.beat_file, t.title) : ''}
              ${t.beat_link && !hasAudio
                ? `<div style="margin-top:6px"><a href="${t.beat_link}" target="_blank" class="btn btn-secondary btn-sm">🎵 Abrir Beat</a></div>`
                : ''}
            </div>
            <span class="${getBadgeClass(t.status)}">${statusLabel(t.status)}</span>
            <div class="track-actions">
              <button class="btn-icon" onclick="openTrackDetail(${JSON.stringify(t).replace(/"/g, '&quot;')})" title="Ver detalhes">👁️</button>
              <button class="btn-icon" onclick="openEditTrackModal(${t.id}, ${projectId})" title="Editar">✏️</button>
              <button class="btn-icon" onclick="deleteTrack(${t.id}, ${projectId})" title="Excluir">🗑️</button>
            </div>
          </div>`;
      }).join('')
    : `<div class="empty-state">
        <div class="empty-icon">🎤</div>
        <h3>Nenhuma faixa adicionada</h3>
        <p>Adicione a primeira faixa deste projeto</p>
      </div>`;

  return `
    <div>
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        <button class="btn btn-primary btn-sm" onclick="openNewTrackModal(${projectId})">➕ Adicionar Faixa</button>
      </div>
      <div class="tracks-list">${trackItems}</div>
    </div>`;
}

function openTrackDetail(track) {
  const modal = document.getElementById('track-detail-modal');
  document.getElementById('td-title').textContent = track.title;
  document.getElementById('td-status').innerHTML = `<span class="${getBadgeClass(track.status)}">${statusLabel(track.status)}</span>`;
  document.getElementById('td-lyrics').textContent = track.lyrics || 'Sem letra cadastrada.';
  document.getElementById('td-notes').textContent = track.notes || 'Sem anotações.';
  const audioSection = document.getElementById('td-audio');
  const hasAudio = track.beat_file && track.beat_file.match(/\.(mp3|wav|ogg)$/i);
  audioSection.innerHTML = hasAudio
    ? renderPlayer(track.beat_file, track.title)
    : track.beat_link
      ? `<a href="${track.beat_link}" target="_blank" class="btn btn-secondary btn-sm">🎵 Abrir Beat Link</a>`
      : '<span style="color:var(--text-muted);font-size:13px">Nenhum beat cadastrado.</span>';
  modal.classList.add('open');
}

async function openNewTrackModal(projectId) {
  document.getElementById('track-modal-title').textContent = '➕ Adicionar Faixa';
  document.getElementById('track-form').reset();
  document.getElementById('track-id').value = '';
  document.getElementById('track-project-id').value = projectId;
  document.getElementById('beat-file-url').value = '';
  document.getElementById('track-modal').classList.add('open');
}

async function openEditTrackModal(trackId, projectId) {
  const track = await API.tracks.get(trackId);
  document.getElementById('track-modal-title').textContent = '✏️ Editar Faixa';
  document.getElementById('track-id').value = track.id;
  document.getElementById('track-project-id').value = projectId;
  document.getElementById('track-title-input').value = track.title;
  document.getElementById('track-status').value = track.status;
  document.getElementById('track-lyrics').value = track.lyrics;
  document.getElementById('track-beat-link').value = track.beat_link;
  document.getElementById('beat-file-url').value = track.beat_file;
  document.getElementById('track-notes').value = track.notes;
  document.getElementById('track-number').value = track.track_number;
  document.getElementById('track-modal').classList.add('open');
}

async function saveTrack() {
  const id = document.getElementById('track-id').value;
  const projectId = document.getElementById('track-project-id').value;
  const data = {
    project_id: parseInt(projectId),
    title: document.getElementById('track-title-input').value.trim(),
    status: document.getElementById('track-status').value,
    lyrics: document.getElementById('track-lyrics').value,
    beat_link: document.getElementById('track-beat-link').value.trim(),
    beat_file: document.getElementById('beat-file-url').value,
    notes: document.getElementById('track-notes').value,
    track_number: parseInt(document.getElementById('track-number').value) || 0,
  };
  if (!data.title) { showToast('O título da faixa é obrigatório.', 'error'); return; }

  try {
    if (id) {
      await API.tracks.update(id, data);
      showToast('Faixa atualizada!', 'success');
    } else {
      await API.tracks.create(data);
      showToast('Faixa adicionada!', 'success');
    }
    closeModal('track-modal');
    const project = await API.projects.get(projectId);
    window._currentProject = project;
    document.getElementById('tab-content').innerHTML = renderTracksTab(project.tracks, projectId);
    // Update tab count
    document.getElementById('tab-tracks').textContent = `🎤 Faixas (${project.tracks.length})`;
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
}

async function deleteTrack(trackId, projectId) {
  if (!confirm('Excluir esta faixa?')) return;
  try {
    await API.tracks.delete(trackId);
    showToast('Faixa excluída.', 'success');
    const project = await API.projects.get(projectId);
    window._currentProject = project;
    document.getElementById('tab-content').innerHTML = renderTracksTab(project.tracks, projectId);
    document.getElementById('tab-tracks').textContent = `🎤 Faixas (${project.tracks.length})`;
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
}
