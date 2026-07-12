const TROPHY_IMAGE = '../assets/copa-final.png';
const ATLETAS_BASE = '../assets/atletas';
const SEDE_STORAGE_KEY = 'sollte-sede';
const DEFAULT_SEDE = 'pereira';

function isFinalPage() {
  return /\/final\/?$/i.test(window.location.pathname);
}

function getWodNumberFromPath() {
  if (isFinalPage()) return null;
  const match = window.location.pathname.match(/\/wod(\d+)\/?/i);
  return match ? Number(match[1]) : 1;
}

function getSede() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = (params.get('sede') || '').toLowerCase();
  if (fromQuery === 'pereira' || fromQuery === 'envigado') return fromQuery;

  const stored = (localStorage.getItem(SEDE_STORAGE_KEY) || '').toLowerCase();
  if (stored === 'pereira' || stored === 'envigado') return stored;
  return DEFAULT_SEDE;
}

function getHeatsCsvPath(sede, wodNum) {
  const label = sede === 'envigado' ? 'Envigado' : 'Pereira';
  if (isFinalPage()) {
    return `./Heats Sollte Fest ${label} - final.csv`;
  }
  return `./Heats Sollte Fest ${label} - wod${wodNum}.csv`;
}

function parseCSVRows(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some(v => String(v).trim().length > 0)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += c;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    if (row.some(v => String(v).trim().length > 0)) rows.push(row);
  }

  return rows;
}

function parseHeatsCSV(text) {
  const rows = parseCSVRows(text.trim());
  if (rows.length < 2) return [];

  const header = rows[0];
  const heatStarts = [];

  header.forEach((cell, index) => {
    const value = String(cell).trim();
    if (/^\d+$/.test(value)) {
      heatStarts.push({ heatNum: Number(value), col: index });
    }
  });

  return heatStarts
    .map(({ heatNum, col }) => {
      const athletes = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const name = String(row[col] ?? '').trim();
        const country = String(row[col + 1] ?? '').trim();
        if (!name || !country) continue;
        athletes.push({ name, country });
      }
      return { heatNum, athletes };
    })
    .filter(heat => heat.athletes.length > 0)
    .sort((a, b) => a.heatNum - b.heatNum);
}

const COUNTRY_IMAGE_ALIASES = {
  'costa de marfil': 'marfil',
  'costa rica': 'costarica',
  'cabo verde': 'cabo',
  'nueva zelanda': 'zelanda',
  'corea del sur': 'korea',
  'corea': 'korea',
  'finlandia': 'filandia',
  'estados unidos': 'eeuu',
  'paises bajos': 'holanda'
};

function countryToImage(country) {
  const key = String(country)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  const fileKey = COUNTRY_IMAGE_ALIASES[key] || key;
  return `${ATLETAS_BASE}/${encodeURIComponent(fileKey)}.png`;
}

function createAthleteCard(athlete) {
  const article = document.createElement('article');
  article.className = 'heat-athlete';

  const caption = document.createElement('p');
  caption.className = 'heat-athlete__name';
  caption.textContent = athlete.name;

  const card = document.createElement('div');
  card.className = 'heat-athlete__card';

  const img = document.createElement('img');
  img.src = countryToImage(athlete.country);
  img.alt = athlete.name;
  img.loading = 'lazy';
  img.onerror = () => {
    img.style.opacity = '0.35';
  };

  card.appendChild(img);
  article.appendChild(caption);
  article.appendChild(card);
  return article;
}

function renderAthleteGrid(athletes, matchup) {
  matchup.replaceChildren();
  matchup.className = 'heat-matchup heat-matchup--grid';

  const count = Math.min(athletes.length, 5);
  const visible = athletes.slice(0, count);

  document.body.classList.remove(
    'heat-page--count-1',
    'heat-page--count-2',
    'heat-page--count-3',
    'heat-page--count-4',
    'heat-page--count-5'
  );
  document.body.classList.add(`heat-page--count-${count || 1}`);

  const grid = document.createElement('div');
  grid.className = `heat-grid heat-grid--${count || 1}`;
  visible.forEach(athlete => grid.appendChild(createAthleteCard(athlete)));
  matchup.appendChild(grid);
}

function renderEmptyMatchup(matchup, message) {
  matchup.replaceChildren();
  matchup.className = 'heat-matchup heat-matchup--empty';
  const empty = document.createElement('p');
  empty.className = 'heat-empty';
  empty.textContent = message;
  matchup.appendChild(empty);
}

function updatePageMeta(wodNum, heatNum, sede, totalHeats) {
  const sedeLabel = sede === 'envigado' ? 'Envigado' : 'Pereira';
  const isFinal = isFinalPage();
  document.title = isFinal
    ? `Final — Heat ${heatNum} — ${sedeLabel} — Sollte Fest 07`
    : `WOD ${wodNum} — Heat ${heatNum} — ${sedeLabel} — Sollte Fest 07`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = document.title;

  const heatFinal = document.getElementById('heatFinal');
  const heatTitle = document.getElementById('heatTitle');
  const heatCategory = document.getElementById('heatCategory');
  const wodLabel = document.getElementById('wodLabel');
  const heatKicker = document.getElementById('heatKicker');

  if (heatFinal) heatFinal.textContent = isFinal ? 'FINAL' : `WOD #${wodNum}`;
  if (heatTitle) heatTitle.textContent = `HEAT ${heatNum}`;
  if (heatCategory) heatCategory.textContent = sedeLabel;
  if (wodLabel) wodLabel.textContent = `${sedeLabel} · ${totalHeats} heats`;
  if (heatKicker) heatKicker.textContent = isFinal ? '★ HEATS FINAL ★' : `★ HEATS WOD ${wodNum} ★`;
}

function updatePager(index, total) {
  const indicator = document.getElementById('heatIndicator');
  const prevBtn = document.getElementById('heatPrev');
  const nextBtn = document.getElementById('heatNext');

  if (indicator) indicator.textContent = total ? `${index} / ${total}` : '0 / 0';
  if (prevBtn) prevBtn.disabled = total <= 1;
  if (nextBtn) nextBtn.disabled = total <= 1;
}

function updateViewerUrl(heatIndex, sede) {
  const url = new URL(window.location.href);
  url.searchParams.set('heat', String(heatIndex));
  url.searchParams.set('sede', sede);
  window.history.replaceState({ heat: heatIndex, sede }, '', url);
}

function getInitialHeatIndex(total) {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = Number(params.get('heat'));
  if (fromQuery >= 1 && fromQuery <= total) return fromQuery;

  const hashMatch = window.location.hash.match(/^#(\d+)/);
  if (hashMatch) {
    const fromHash = Number(hashMatch[1]);
    if (fromHash >= 1 && fromHash <= total) return fromHash;
  }

  return 1;
}

async function loadHeats(sede, wodNum) {
  const path = getHeatsCsvPath(sede, wodNum);
  const res = await fetch(encodeURI(path) + '?t=' + Date.now());
  if (!res.ok) {
    throw new Error(`No se encontró ${path}`);
  }
  const text = await res.text();
  return parseHeatsCSV(text);
}

async function initWodPage() {
  const matchup = document.getElementById('heatMatchup');
  if (!matchup) return;

  const wodNum = getWodNumberFromPath();
  const sede = getSede();
  const isFinal = isFinalPage();
  let heats = [];

  try {
    heats = await loadHeats(sede, wodNum);
  } catch (err) {
    console.error(err);
    const sedeLabel = sede === 'envigado' ? 'Envigado' : 'Pereira';
    renderEmptyMatchup(
      matchup,
      isFinal
        ? `Aún no hay heats de ${sedeLabel} para la Final.`
        : `Aún no hay heats de ${sedeLabel} para WOD ${wodNum}.`
    );
    updatePager(0, 0);
    updatePageMeta(wodNum, 1, sede, 0);
    return;
  }

  if (!heats.length) {
    renderEmptyMatchup(matchup, 'No hay atletas en el archivo de heats.');
    updatePager(0, 0);
    updatePageMeta(wodNum, 1, sede, 0);
    return;
  }

  let currentIndex = getInitialHeatIndex(heats.length);

  function goTo(target) {
    let next = target;
    if (next < 1) next = heats.length;
    if (next > heats.length) next = 1;

    const entry = heats[next - 1];
    if (!entry) return;

    updatePageMeta(wodNum, entry.heatNum, sede, heats.length);
    renderAthleteGrid(entry.athletes, matchup);
    updatePager(next, heats.length);
    updateViewerUrl(next, sede);
    currentIndex = next;
  }

  document.getElementById('heatPrev')?.addEventListener('click', () => goTo(currentIndex - 1));
  document.getElementById('heatNext')?.addEventListener('click', () => goTo(currentIndex + 1));

  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') goTo(currentIndex - 1);
    if (event.key === 'ArrowRight') goTo(currentIndex + 1);
  });

  goTo(currentIndex);
}

document.addEventListener('DOMContentLoaded', initWodPage);
