const HEAT_IMAGES = {
  1: ['panama.png', 'marruecos.png'],
  2: ['belgica.png', 'senegal.png'],
  3: ['austria.png', 'bajos.png', 'francia.png'],
  4: ['canada.png', 'irak.png', 'jordania.png'],
  5: ['eeuu.png', 'egipto.png', 'noruega.png'],
  6: ['argelia.png', 'suiza.png', 'uruguay.png'],
  7: ['arabia.png', 'checa.png'],
  8: ['escocia.png', 'portugal.png', 'uzbe.png'],
  9: ['haiti.png', 'nueva zelanda.png'],
  10: ['curazao.png', 'japon.png'],
  11: ['espana.png', 'sudafrica.png'],
  12: ['inglaterra.png', 'mexico.png', 'sudafrica.png'],
  13: ['brasil.png', 'tiben.png', 'tunez.png'],
  14: ['colombia.png', 'costa.png', 'qatar.png'],
  15: ['cabo.png', 'ghana.png', 'iran.png']
};

const SPONSOR_LOGOS = [
  'Equimovi.jpeg',
  'Imagen1.png',
  'LOGO DOMIVET.png',
  'culto.png',
  'intellygence.png',
  'mues.png'
];

const HEAT_CATEGORIES = [
  { from: 1, to: 2, label: 'Categoría Hombres Principiantes' },
  { from: 3, to: 6, label: 'Categoría Hombres Intermedios' },
  { from: 7, to: 9, label: 'Categoría Mujeres Principiantes' },
  { from: 10, to: 12, label: 'Categoría Mujeres Avanzadas' },
  { from: 13, to: 15, label: 'Categoría Hombres Avanzados' }
];

const TOTAL_HEATS = Object.keys(HEAT_IMAGES).length;

function isWodViewer() {
  return /\/wod1\/?$/i.test(window.location.pathname);
}

function getHeatFromUrl() {
  const match = window.location.pathname.match(/\/heat(\d+)\/?/i);
  return match ? Number(match[1]) : null;
}

function getInitialHeatFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = Number(params.get('heat'));
  if (fromQuery >= 1 && fromQuery <= TOTAL_HEATS) return fromQuery;

  const hashMatch = window.location.hash.match(/^#(\d+)/);
  if (hashMatch) {
    const fromHash = Number(hashMatch[1]);
    if (fromHash >= 1 && fromHash <= TOTAL_HEATS) return fromHash;
  }

  return 1;
}

function getCategory(heatNum) {
  const found = HEAT_CATEGORIES.find(({ from, to }) => heatNum >= from && heatNum <= to);
  return found ? found.label : 'Categoría';
}

function formatAlt(filename) {
  const base = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function createAthlete(heatNum, filename) {
  const article = document.createElement('article');
  article.className = 'heat-athlete';

  const card = document.createElement('div');
  card.className = 'heat-athlete__card';

  const img = document.createElement('img');
  img.src = `../assets/heats/heat${heatNum}/${encodeURIComponent(filename)}`;
  img.alt = formatAlt(filename);
  img.loading = 'lazy';

  card.appendChild(img);
  article.appendChild(card);
  return article;
}

function createVsBadge() {
  const vs = document.createElement('div');
  vs.className = 'heat-vs';
  vs.setAttribute('aria-hidden', 'true');
  vs.innerHTML = '<span class="heat-vs__badge">VS</span>';
  return vs;
}

function renderMatchup(heatNum, images) {
  const matchup = document.getElementById('heatMatchup');
  if (!matchup) return;

  const isTrio = images.length === 3;
  document.body.classList.toggle('heat-page--trio', isTrio);
  matchup.classList.toggle('heat-matchup--trio', isTrio);
  matchup.replaceChildren();

  if (isTrio) {
    images.forEach(file => matchup.appendChild(createAthlete(heatNum, file)));
    return;
  }

  matchup.appendChild(createAthlete(heatNum, images[0]));
  matchup.appendChild(createVsBadge());
  matchup.appendChild(createAthlete(heatNum, images[1]));
}

function updatePageMeta(heatNum) {
  const category = getCategory(heatNum);
  const title = isWodViewer()
    ? `WOD 1 — Heat ${heatNum} — Sollte Fest 07`
    : `Heat ${heatNum} — Sollte Fest 07`;

  document.title = title;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = `${title} — ${category} — WOD #1 Partido Inaugural`;
  }

  const heatTitle = document.getElementById('heatTitle');
  const heatCategory = document.getElementById('heatCategory');

  if (heatTitle) heatTitle.textContent = `Heat ${heatNum}`;
  if (heatCategory) heatCategory.textContent = category;
}

function updatePager(heatNum) {
  const indicator = document.getElementById('heatIndicator');
  const prevBtn = document.getElementById('heatPrev');
  const nextBtn = document.getElementById('heatNext');

  if (indicator) indicator.textContent = `${heatNum} / ${TOTAL_HEATS}`;
  if (prevBtn) prevBtn.disabled = false;
  if (nextBtn) nextBtn.disabled = false;
}

function updateViewerUrl(heatNum) {
  if (!isWodViewer()) return;
  const url = new URL(window.location.href);
  url.searchParams.set('heat', String(heatNum));
  window.history.replaceState({ heat: heatNum }, '', url);
}

function renderHeat(heatNum) {
  const images = HEAT_IMAGES[heatNum];
  if (!images || !images.length) return false;

  updatePageMeta(heatNum);
  renderMatchup(heatNum, images);
  updatePager(heatNum);
  updateViewerUrl(heatNum);
  return true;
}

function initSponsorsGrid() {
  const grid = document.getElementById('heatSponsorsGrid');
  if (!grid || !SPONSOR_LOGOS.length || grid.childElementCount > 0) return;

  grid.innerHTML = SPONSOR_LOGOS.map(file => `
    <div class="patrocinador-logo-box heat-sponsor-box">
      <img
        src="../assets/patrocinadores/${encodeURIComponent(file)}"
        alt="Patrocinador"
        class="patrocinador-logo-img"
        loading="lazy"
      />
    </div>
  `).join('');
}

function initWodViewer() {
  let currentHeat = getInitialHeatFromQuery();

  const prevBtn = document.getElementById('heatPrev');
  const nextBtn = document.getElementById('heatNext');

  function goTo(target) {
    let heatNum = target;
    if (heatNum < 1) heatNum = TOTAL_HEATS;
    if (heatNum > TOTAL_HEATS) heatNum = 1;
    if (!renderHeat(heatNum)) return;
    currentHeat = heatNum;
  }

  prevBtn?.addEventListener('click', () => goTo(currentHeat - 1));
  nextBtn?.addEventListener('click', () => goTo(currentHeat + 1));

  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') goTo(currentHeat - 1);
    if (event.key === 'ArrowRight') goTo(currentHeat + 1);
  });

  initSponsorsGrid();
  goTo(currentHeat);
}

function initSingleHeatPage() {
  const heatNum = getHeatFromUrl();
  const images = heatNum ? HEAT_IMAGES[heatNum] : null;

  if (!heatNum || !images || !images.length) {
    document.body.innerHTML = '<main style="color:#fff;padding:2rem;text-align:center;">Heat no encontrado.</main>';
    return;
  }

  renderHeat(heatNum);
  initSponsorsGrid();
}

function initHeatPage() {
  if (isWodViewer()) {
    initWodViewer();
    return;
  }
  initSingleHeatPage();
}

document.addEventListener('DOMContentLoaded', initHeatPage);
