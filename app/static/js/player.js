/* ── SIMPLE AUDIO PLAYER ────────────────────────── */

let currentAudio = null;
let currentPlayerEl = null;

function renderPlayer(beatUrl, trackTitle) {
  const id = 'player-' + Math.random().toString(36).slice(2);
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const audio = new Audio(beatUrl);

    const playBtn = el.querySelector('.player-play-btn');
    const progressFill = el.querySelector('.player-progress-fill');
    const progressBar = el.querySelector('.player-progress');
    const timeEl = el.querySelector('.player-time');
    const waveEl = el.querySelector('.sound-wave');

    let playing = false;

    function formatTime(s) {
      if (isNaN(s)) return '0:00';
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60).toString().padStart(2, '0');
      return `${m}:${sec}`;
    }

    playBtn.addEventListener('click', () => {
      if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        if (currentPlayerEl) {
          currentPlayerEl.querySelector('.player-play-btn').textContent = '▶';
          currentPlayerEl.querySelector('.sound-wave').style.display = 'none';
        }
      }
      if (playing) {
        audio.pause();
        playBtn.textContent = '▶';
        waveEl.style.display = 'none';
        playing = false;
      } else {
        audio.play();
        playBtn.textContent = '⏸';
        waveEl.style.display = 'flex';
        playing = true;
        currentAudio = audio;
        currentPlayerEl = el;
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      timeEl.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    audio.addEventListener('ended', () => {
      playBtn.textContent = '▶';
      progressFill.style.width = '0%';
      waveEl.style.display = 'none';
      playing = false;
    });
  }, 50);

  return `
    <div class="mini-player" id="${id}">
      <button class="player-btn player-play-btn" title="Play/Pause">▶</button>
      <div style="flex:1;min-width:0">
        <div class="player-track-name" style="margin-bottom:6px">🎧 ${escapeHtml(trackTitle)}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="player-progress">
            <div class="player-progress-fill"></div>
          </div>
          <span class="player-time">0:00 / 0:00</span>
        </div>
      </div>
      <div class="sound-wave" style="display:none">
        <div class="bar" style="height:12px"></div>
        <div class="bar" style="height:18px"></div>
        <div class="bar" style="height:14px"></div>
        <div class="bar" style="height:20px"></div>
        <div class="bar" style="height:14px"></div>
      </div>
    </div>`;
}
