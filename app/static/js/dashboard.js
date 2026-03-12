/* ── DASHBOARD VIEW ─────────────────────────────── */

function statusLabel(s) {
  const map = {
    'em produção': 'Em produção',
    'finalizado': 'Finalizado',
    'lançado': 'Lançado',
    'gravada': 'Gravada',
    'mixagem': 'Mixagem',
    'finalizada': 'Finalizada',
    'ideia': 'Ideia',
    'pronto': 'Pronto',
    'publicado': 'Publicado',
  };
  return map[s] || s;
}

function getBadgeClass(status) {
  const s = (status || '').toLowerCase().replace(/\s/g, '-');
  return `badge badge-${s}`;
}

async function renderDashboard() {
  const container = document.getElementById('page-content');
  container.innerHTML = `<div class="loading-spinner"><div class="spinner"></div></div>`;

  try {
    const data = await API.dashboard.get();

    const projectTypeRows = Object.entries(data.project_types || {}).map(([type, count]) =>
      `<div style="margin-bottom:10px;display:flex;align-items:center;gap:8px">
        <span style="font-size:13px;color:var(--text-secondary);flex:1">${type}</span>
        <span style="font-weight:700;color:var(--text-primary);font-size:17px;font-family:'Outfit',sans-serif">${count}</span>
      </div>`
    ).join('');

    const recentProjectCards = data.recent_projects.length
      ? data.recent_projects.map((p, i) => `
          <div class="track-item stagger-${i + 1}" onclick="navigate('project', ${p.id})" style="cursor:pointer">
            <div class="track-number" style="font-size:11px;color:var(--text-muted);min-width:28px;text-transform:uppercase;letter-spacing:0.5px">${p.project_type.slice(0,2)}</div>
            <div class="track-info">
              <div class="track-title">${p.name}</div>
              <div class="track-meta">${p.track_count} faixas · ${p.post_count} posts</div>
            </div>
            <span class="${getBadgeClass(p.status)}">${statusLabel(p.status)}</span>
          </div>`).join('')
      : `<div class="empty-state" style="padding:24px 0"><p>Nenhum projeto criado ainda.</p></div>`;

    container.innerHTML = `
      <div class="page-enter">
        <div class="section-header" style="margin-bottom:24px">
          <div>
            <h1 class="section-title">Visão geral</h1>
            <p class="section-subtitle">Acompanhe o progresso dos seus projetos</p>
          </div>
          <button class="btn btn-primary" onclick="App.openNewProjectModal()">Novo projeto</button>
        </div>

        <div class="stats-grid">
          <div class="stat-card stat-card-violet stagger-1">
            <div class="stat-number">${data.total_projects}</div>
            <div class="stat-label">Projetos</div>
          </div>
          <div class="stat-card stat-card-cyan stagger-2">
            <div class="stat-number">${data.total_tracks}</div>
            <div class="stat-label">Faixas</div>
          </div>
          <div class="stat-card stat-card-pink stagger-3">
            <div class="stat-number">${data.total_posts}</div>
            <div class="stat-label">Posts de divulgação</div>
          </div>
          <div class="stat-card stat-card-gold stagger-4">
            <div class="stat-number">${data.project_statuses?.['lançado'] || 0}</div>
            <div class="stat-label">Lançados</div>
          </div>
          <div class="stat-card stat-card-green stagger-5">
            <div class="stat-number">${data.track_statuses?.['finalizada'] || 0}</div>
            <div class="stat-label">Faixas finalizadas</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          <div class="card">
            <div class="card-header">
              <h3 style="font-size:14px;font-weight:600;color:var(--text-secondary);letter-spacing:0.3px">Projetos recentes</h3>
              <button class="btn btn-ghost btn-sm" onclick="navigate('projects')">Ver todos</button>
            </div>
            <div class="tracks-list" style="gap:8px">${recentProjectCards}</div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 style="font-size:14px;font-weight:600;color:var(--text-secondary);letter-spacing:0.3px">Por tipo</h3>
            </div>
            ${projectTypeRows || '<p style="font-size:13px;color:var(--text-muted)">Nenhum projeto ainda.</p>'}

            <div style="margin-top:22px;padding-top:18px;border-top:1px solid var(--border)">
              <h4 style="font-size:11px;font-weight:500;color:var(--text-muted);margin-bottom:10px;letter-spacing:0.6px;text-transform:uppercase">Faixas por status</h4>
              ${renderStatusBar(data.track_statuses, data.total_tracks)}
            </div>

            <div style="margin-top:16px">
              <h4 style="font-size:11px;font-weight:500;color:var(--text-muted);margin-bottom:10px;letter-spacing:0.6px;text-transform:uppercase">Posts por status</h4>
              ${renderStatusBar(data.post_statuses, data.total_posts)}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><p>Erro ao carregar: ${e.message}</p></div>`;
  }
}

function renderStatusBar(statuses, total) {
  if (!total) return '<p style="font-size:12px;color:var(--text-muted)">Nenhum item ainda.</p>';
  const colors = {
    'em produção': '#d97706', 'gravada': '#0891b2', 'mixagem': '#8b5cf6',
    'finalizada': '#059669', 'finalizado': '#059669', 'lançado': '#db2777',
    'ideia': '#4b5563', 'pronto': '#06b6d4', 'publicado': '#059669',
  };
  return Object.entries(statuses).map(([status, count]) => {
    const pct = Math.round((count / total) * 100);
    const color = colors[status] || '#6d28d9';
    return `
      <div style="margin-bottom:7px">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px">
          <span style="font-size:12px;color:var(--text-secondary)">${statusLabel(status)}</span>
          <span style="font-size:12px;color:var(--text-muted)">${count} · ${pct}%</span>
        </div>
        <div style="height:4px;background:var(--border);border-radius:999px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:999px;transition:width 0.8s ease"></div>
        </div>
      </div>`;
  }).join('');
}
