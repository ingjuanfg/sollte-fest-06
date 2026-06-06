// ====== CONFIG ======
const CSV_LOCAL = {
  "Hombres Principiantes": "data/Hombres Principiantes.csv",
  "Mujeres Principiantes": "data/Mujeres Principiantes.csv",
  "Hombres Intermedios":   "data/Hombres Intermedios.csv",
  "Mujeres Avanzadas":     "data/Mujeres Avanzadas.csv",
  "Hombres Avanzados":     "data/Hombres Avanzados.csv"
};

const PLACEHOLDER_MSG = 'Aquí podrás ver los resultados próximamente';

const COUNTRY_FLAGS = {
  'paises bajos': '🇳🇱',
  'austria': '🇦🇹',
  'francia': '🇫🇷',
  'canada': '🇨🇦',
  'jordania': '🇯🇴',
  'irak': '🇮🇶',
  'noruega': '🇳🇴',
  'egipto': '🇪🇬',
  'estados unidos': '🇺🇸',
  'uruguay': '🇺🇾',
  'suiza': '🇨🇭',
  'argelia': '🇩🇿',
  'panama': '🇵🇦',
  'panamá': '🇵🇦',
  'marruecos': '🇲🇦',
  'belgica': '🇧🇪',
  'bélgica': '🇧🇪',
  'senegal': '🇸🇳',
  'inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'mexico': '🇲🇽',
  'méxico': '🇲🇽',
  'sudafrica': '🇿🇦',
  'sudáfrica': '🇿🇦',
  'arabia': '🇸🇦',
  'checa': '🇨🇿',
  'republica checa': '🇨🇿',
  'escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'portugal': '🇵🇹',
  'uzbe': '🇺🇿',
  'uzbekistan': '🇺🇿',
  'haiti': '🇭🇹',
  'nueva zelanda': '🇳🇿',
  'curazao': '🇨🇼',
  'curacao': '🇨🇼',
  'japon': '🇯🇵',
  'japón': '🇯🇵',
  'espana': '🇪🇸',
  'españa': '🇪🇸',
  'ecuador': '🇪🇨',
  'brasil': '🇧🇷',
  'tunez': '🇹🇳',
  'túnez': '🇹🇳',
  'colombia': '🇨🇴',
  'costa': '🇨🇷',
  'costa rica': '🇨🇷',
  'qatar': '🇶🇦',
  'cabo': '🇨🇻',
  'cabo verde': '🇨🇻',
  'ghana': '🇬🇭',
  'iran': '🇮🇷',
  'irán': '🇮🇷'
};

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

// ====== DOM ======
const categoriaSelect = document.getElementById('categoriaSelect');
const tableHead       = document.getElementById('tableHead');
const tableBody       = document.getElementById('tableBody');
const reloadBtn       = document.getElementById('reloadBtn');
const lastUpdateSpan  = document.getElementById('lastUpdate');
const loadingIndicator = document.getElementById('loadingIndicator');
const tableHint        = document.getElementById('tableHint');
const tableWrapper     = document.querySelector('.table-wrapper');
const yearEl          = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

let resizeHintTimer;

document.addEventListener('DOMContentLoaded', init);

function init() {
  initCategoriaPicker();
  reloadBtn.addEventListener('click', loadData);
  window.addEventListener('resize', scheduleTableHintUpdate);
}

function scheduleTableHintUpdate() {
  clearTimeout(resizeHintTimer);
  resizeHintTimer = setTimeout(updateTableScrollHint, 120);
}

function updateTableScrollHint() {
  if (!tableHint || !tableWrapper) return;

  const isNarrow = window.matchMedia('(max-width: 780px)').matches;
  const isCompact = window.matchMedia('(max-width: 640px)').matches;
  const scrollPart = tableHint.querySelector('.table-hint__scroll');
  const hasData = tableBody.querySelector('tr.team-row');

  if (!isNarrow || !hasData) {
    tableHint.hidden = true;
    tableWrapper.classList.remove('is-scrollable');
    return;
  }

  tableHint.hidden = false;
  const scrollable = !isCompact && tableWrapper.scrollWidth > tableWrapper.clientWidth + 2;
  if (scrollPart) scrollPart.hidden = !scrollable;
  tableWrapper.classList.toggle('is-scrollable', scrollable);
}

function initCategoriaPicker() {
  const trigger = document.getElementById('categoriaTrigger');
  const valueSpan = document.getElementById('categoriaValue');
  const menu = document.getElementById('categoriaMenu');
  if (!categoriaSelect || !trigger || !valueSpan || !menu) return;

  Object.keys(CSV_LOCAL).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoriaSelect.appendChild(opt);

    const item = document.createElement('li');
    item.role = 'option';
    item.dataset.value = cat;
    item.textContent = cat;
    item.tabIndex = -1;
    item.addEventListener('click', () => setCategoria(cat));
    menu.appendChild(item);
  });

  function setCategoria(cat) {
    categoriaSelect.value = cat;
    valueSpan.textContent = cat;
    menu.querySelectorAll('[role="option"]').forEach(item => {
      const selected = item.dataset.value === cat;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', selected);
    });
    closeMenu();
    loadData();
  }

  function openMenu() {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    if (menu.hidden) openMenu();
    else closeMenu();
  }

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener('click', e => {
    if (!menu.hidden && !document.getElementById('categoriaPicker').contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  setCategoria(Object.keys(CSV_LOCAL)[0]);
}

async function loadData() {
  const categoria = categoriaSelect.value || Object.keys(CSV_LOCAL)[0];
  const url = CSV_LOCAL[categoria];

  showLoading(true);

  try {
    const res = await fetch(url + '?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const parsed = parseResultsCSV(text);
    renderTable(parsed);
    lastUpdateSpan.textContent = `Categoría: ${categoria} • Actualizado: ${new Date().toLocaleString()}`;
  } catch (err) {
    console.error(err);
    showPlaceholderMessage();
  } finally {
    showLoading(false);
  }
}

function showPlaceholderMessage() {
  tableHead.innerHTML = '';
  tableBody.innerHTML = `<tr><td colspan="8" class="results-placeholder">${PLACEHOLDER_MSG}</td></tr>`;
  if (lastUpdateSpan) lastUpdateSpan.textContent = '—';
  updateTableScrollHint();
}

function showLoading(show) {
  if (loadingIndicator) {
    loadingIndicator.style.display = show ? 'block' : 'none';
  }
  if (reloadBtn) {
    reloadBtn.disabled = show;
    reloadBtn.style.opacity = show ? '0.5' : '1';
  }
}

// ====== CSV PARSER ======
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

function parseResultsCSV(text) {
  const rows = parseCSVRows(text.trim());
  if (rows.length < 3) return { athletes: [], wodNames: [] };

  const headerRow = rows[0].map(h => h.trim());
  const wodNames = [];

  for (let i = 2; i < headerRow.length; i++) {
    if (headerRow[i]) wodNames.push(headerRow[i]);
  }

  const athletes = rows.slice(2)
    .map(cells => {
      const values = cells.map(v => String(v).trim());
      if (!values[0]) return null;

      const wods = [];
      let col = 2;

      for (let w = 0; w < wodNames.length; w++) {
        wods.push({
          name: wodNames[w],
          puntos: values[col] ?? '',
          detalle: values[col + 1] ?? ''
        });
        col += 2;
      }

      const total = wods.reduce((sum, wod) => {
        const pts = parseFloat(wod.puntos);
        return sum + (isNaN(pts) ? 0 : pts);
      }, 0);

      return {
        atleta: values[0],
        pais: values[1] ?? '',
        wods,
        total
      };
    })
    .filter(Boolean);

  athletes.sort((a, b) => a.total - b.total);

  return { athletes, wodNames };
}

// ====== RENDER ======
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDetalle(text) {
  return escapeHtml(text).replace(/\r?\n/g, '<br>');
}

function normalizeCountryKey(pais) {
  return pais
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getCountryFlag(pais) {
  const key = normalizeCountryKey(pais);
  return COUNTRY_FLAGS[key] || '🏳️';
}

function formatWodPosition(puntos) {
  const n = parseInt(puntos, 10);
  if (isNaN(n)) return '—';
  return `${n}º`;
}

function renderTable({ athletes, wodNames }) {
  if (!athletes.length) {
    showPlaceholderMessage();
    return;
  }

  const colCount = 4 + wodNames.length;

  const headCells = [
    '<th class="col-pos"><span class="th-full">Posición</span><span class="th-short">#</span></th>',
    '<th class="col-name"><span class="th-full">Nombre</span><span class="th-short">Atleta</span></th>',
    '<th class="col-country"><span class="th-full">País</span><span class="th-short" aria-hidden="true">🌐</span></th>',
    '<th class="col-puntos"><span class="th-full">Puntos</span><span class="th-short">Pts</span></th>',
    ...wodNames.map(name => `<th class="col-wod">${escapeHtml(name)}</th>`)
  ];

  tableHead.innerHTML = `<tr>${headCells.join('')}</tr>`;

  let tableHTML = '';

  athletes.forEach((athlete, index) => {
    const rank = index + 1;
    const medal = RANK_MEDALS[rank] || '';
    const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
    const flag = getCountryFlag(athlete.pais);

    const wodCells = athlete.wods.map(wod =>
      `<td class="wod-pos-cell">${formatWodPosition(wod.puntos)}</td>`
    ).join('');

    tableHTML += `
      <tr class="team-row" data-team-index="${index}">
        <td class="pos-cell">
          <span class="rank-badge ${rankClass}">${rank}</span>
          ${medal ? `<span class="rank-medal" aria-hidden="true">${medal}</span>` : ''}
        </td>
        <td>
          <button type="button" class="team-name" onclick="toggleTeamDetails(${index})" aria-expanded="false" id="team-btn-${index}">
            <span class="expand-icon" id="expand-${index}" aria-hidden="true">▶</span>
            <span class="team-name__text">${escapeHtml(athlete.atleta)}</span>
          </button>
        </td>
        <td class="country-cell">
          <span class="country-flag" title="${escapeHtml(athlete.pais)}">${flag}</span>
        </td>
        <td class="points-cell"><strong>${athlete.total}</strong></td>
        ${wodCells}
      </tr>
      <tr class="wod-details" id="wod-details-${index}">
        <td colspan="${colCount}">
          <div class="wod-details-panel">
            ${athlete.wods.map(wod => `
              <p class="wod-detail-line">
                <span class="wod-detail-line__name">${escapeHtml(wod.name)}</span>
                <span class="wod-detail-line__pos"> (${formatWodPosition(wod.puntos)})</span>
                <span class="wod-detail-line__sep"> — </span>
                <span class="wod-detail-line__value">${formatDetalle(wod.detalle)}</span>
              </p>
            `).join('')}
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = tableHTML;
  requestAnimationFrame(updateTableScrollHint);
}

window.toggleTeamDetails = function(teamIndex) {
  const detailsRow = document.getElementById(`wod-details-${teamIndex}`);
  const expandIcon = document.getElementById(`expand-${teamIndex}`);
  const teamBtn = document.getElementById(`team-btn-${teamIndex}`);
  const mainRow = document.querySelector(`tr.team-row[data-team-index="${teamIndex}"]`);

  if (!detailsRow) return;

  const isVisible = detailsRow.classList.contains('show');

  if (isVisible) {
    detailsRow.classList.remove('show');
    expandIcon?.classList.remove('expanded');
    teamBtn?.setAttribute('aria-expanded', 'false');
    mainRow?.classList.remove('team-row--expanded');
  } else {
    detailsRow.classList.add('show');
    expandIcon?.classList.add('expanded');
    teamBtn?.setAttribute('aria-expanded', 'true');
    mainRow?.classList.add('team-row--expanded');
  }
};

// ====== PATROCINADORES ======
document.addEventListener('DOMContentLoaded', cargarPatrocinadores);

function cargarPatrocinadores() {
  const grid = document.getElementById('patrocinadoresGrid');
  if (!grid) return;

  const logos = [
    'Equimovi.jpeg',
    'Imagen1.png',
    'LOGO DOMIVET.png',
    'culto.png',
    'intellygence.png',
    'mues.png'
  ];

  grid.innerHTML = logos.map(file => `
    <div class="patrocinador-logo-box">
      <img src="assets/patrocinadores/${file}" alt="Patrocinador" class="patrocinador-logo-img" loading="lazy" />
    </div>
  `).join('');
}
