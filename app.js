// ====== CONFIG ======
const CATEGORIES_BY_SEDE = {
  pereira: [
    { label: 'Principiante Mujer', file: 'Resultados Sollte Fest 07 Pereira - Prinp Mujer.csv' },
    { label: 'Principiante Hombre', file: 'Resultados Sollte Fest 07 Pereira - Prinp Hombre.csv' },
    { label: 'Intermedio Mujer', file: 'Resultados Sollte Fest 07 Pereira - Interm Mujer.csv' },
    { label: 'Intermedio Hombre', file: 'Resultados Sollte Fest 07 Pereira - Interm Hombre.csv' },
    { label: 'Avanzado Hombre', file: 'Resultados Sollte Fest 07 Pereira - Avanz Hombre.csv' },
    { label: 'Elite Mixto', file: 'Resultados Sollte Fest 07 Pereira - Elite.csv' }
  ],
  envigado: [
    { label: 'Hombres Principiantes', file: 'Sollte Fest Resultados - Hombres Principiantes.csv' },
    { label: 'Mujeres Principiantes', file: 'Sollte Fest Resultados - Mujeres Principiantes.csv' },
    { label: 'Hombres Intermedios', file: 'Sollte Fest Resultados - Hombres Intermedios.csv' },
    { label: 'Mujeres Avanzadas', file: 'Sollte Fest Resultados - Mujeres Avanzadas.csv' },
    { label: 'Hombres Avanzados', file: 'Sollte Fest Resultados - Hombres Avanzados.csv' }
  ]
};

const DEFAULT_SEDE = 'pereira';
const SEDE_STORAGE_KEY = 'sollte-sede';

let currentSede = DEFAULT_SEDE;
let setCategoriaFn = null;
let rebuildCategoriaOptionsFn = null;

function getCategoriesForSede(sede = currentSede) {
  return CATEGORIES_BY_SEDE[sede] || CATEGORIES_BY_SEDE.pereira;
}

function getCsvPath(categoria, sede = currentSede) {
  const found = getCategoriesForSede(sede).find(item => item.label === categoria);
  if (found) return `data/${sede}/${found.file}`;
  return `data/${sede}/${categoria}.csv`;
}

const PLACEHOLDER_MSG = 'Aquí podrás ver los resultados próximamente';

const COUNTRY_FLAGS = {
  'paises bajos': '🇳🇱',
  'holanda': '🇳🇱',
  'austria': '🇦🇹',
  'austri': '🇦🇹',
  'francia': '🇫🇷',
  'canada': '🇨🇦',
  'jordania': '🇯🇴',
  'irak': '🇮🇶',
  'iraq': '🇮🇶',
  'noruega': '🇳🇴',
  'egipto': '🇪🇬',
  'estados unidos': '🇺🇸',
  'eeuu': '🇺🇸',
  'usa': '🇺🇸',
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
  'arabia saudita': '🇸🇦',
  'escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'portugal': '🇵🇹',
  'uzbe': '🇺🇿',
  'uzbekistan': '🇺🇿',
  'haiti': '🇭🇹',
  'haití': '🇭🇹',
  'nueva zelanda': '🇳🇿',
  'zelanda': '🇳🇿',
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
  'costarica': '🇨🇷',
  'qatar': '🇶🇦',
  'cabo': '🇨🇻',
  'cabo verde': '🇨🇻',
  'ghana': '🇬🇭',
  'iran': '🇮🇷',
  'irán': '🇮🇷',
  'alemania': '🇩🇪',
  'argentina': '🇦🇷',
  'australia': '🇦🇺',
  'bosnia': '🇧🇦',
  'camerun': '🇨🇲',
  'camerún': '🇨🇲',
  'chile': '🇨🇱',
  'china': '🇨🇳',
  'congo': '🇨🇬',
  'costa de marfil': '🇨🇮',
  'marfil': '🇨🇮',
  'croacia': '🇭🇷',
  'dinamarca': '🇩🇰',
  'filandia': '🇫🇮',
  'finlandia': '🇫🇮',
  'italia': '🇮🇹',
  'korea': '🇰🇷',
  'corea': '🇰🇷',
  'corea del sur': '🇰🇷',
  'nigeria': '🇳🇬',
  'paraguay': '🇵🇾',
  'polonia': '🇵🇱',
  'suecia': '🇸🇪',
  'turquia': '🇹🇷',
  'turquía': '🇹🇷'
};

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const HONORARY_CATEGORY = 'Mujeres Principiantes';
const HONORARY_ATHLETE = 'esmeralda bustamante';

const PODIUM_BADGES = {
  1: { label: 'Campeon', ribbonClass: 'podium-ribbon--gold' },
  2: { label: 'Subcampeon', ribbonClass: 'podium-ribbon--silver' },
  3: { label: 'Tercer Puesto', ribbonClass: 'podium-ribbon--bronze' }
};

const ELIMINATED_CATEGORY = 'Hombres Intermedios';

const ADVANCED_CATEGORIES = ['Mujeres Avanzadas', 'Hombres Avanzados'];
const HOMBRES_AVANZADOS_CATEGORY = 'Hombres Avanzados';

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
  initSedeSwitch();
  initCategoriaPicker();
  reloadBtn.addEventListener('click', loadData);
  window.addEventListener('resize', scheduleTableHintUpdate);
}

function initSedeSwitch() {
  const stored = localStorage.getItem(SEDE_STORAGE_KEY);
  currentSede = stored === 'envigado' || stored === 'pereira' ? stored : DEFAULT_SEDE;

  const buttons = document.querySelectorAll('.sede-switch__btn');
  if (!buttons.length) return;

  function applySede(sede, { reload = true } = {}) {
    currentSede = sede;
    localStorage.setItem(SEDE_STORAGE_KEY, sede);
    buttons.forEach(btn => {
      const active = btn.dataset.sede === sede;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    cargarPatrocinadores(sede);
    const categories = getCategoriesForSede(sede);
    rebuildCategoriaOptionsFn?.(categories);
    if (reload) {
      setCategoriaFn?.(categories[0]?.label, { close: true });
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.sede === currentSede) return;
      applySede(btn.dataset.sede);
    });
  });

  applySede(currentSede, { reload: false });
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

  function rebuildCategoriaOptions(categories) {
    categoriaSelect.innerHTML = '';
    menu.innerHTML = '';

    categories.forEach(({ label }) => {
      const opt = document.createElement('option');
      opt.value = label;
      opt.textContent = label;
      categoriaSelect.appendChild(opt);

      const item = document.createElement('li');
      item.role = 'option';
      item.dataset.value = label;
      item.textContent = label;
      item.tabIndex = -1;
      item.addEventListener('click', () => setCategoria(label));
      menu.appendChild(item);
    });
  }

  function setCategoria(cat, { close = true } = {}) {
    const categories = getCategoriesForSede();
    const valid = categories.some(item => item.label === cat);
    const nextCat = valid ? cat : categories[0]?.label;
    if (!nextCat) return;

    categoriaSelect.value = nextCat;
    valueSpan.textContent = nextCat;
    menu.querySelectorAll('[role="option"]').forEach(item => {
      const selected = item.dataset.value === nextCat;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', selected);
    });
    if (close) closeMenu();
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

  setCategoriaFn = setCategoria;
  rebuildCategoriaOptionsFn = rebuildCategoriaOptions;

  rebuildCategoriaOptions(getCategoriesForSede());
  setCategoria(getCategoriesForSede()[0]?.label);
}

async function loadData() {
  const categories = getCategoriesForSede();
  const categoria = categoriaSelect.value || categories[0]?.label;
  const url = getCsvPath(categoria);

  showLoading(true);

  try {
    const res = await fetch(encodeURI(url) + '?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const parsed = parseResultsCSV(text);
    renderTable(parsed, categoria);
    const sedeLabel = currentSede === 'envigado' ? 'Envigado' : 'Pereira';
    lastUpdateSpan.textContent = `${sedeLabel} • Categoría: ${categoria} • Actualizado: ${new Date().toLocaleString()}`;
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
        if (isNAValue(wod.puntos)) return sum;
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
  if (isNAValue(puntos)) return 'NA';
  const n = parseInt(puntos, 10);
  if (isNaN(n)) return '—';
  return `${n}º`;
}

function normalizeAthleteName(name) {
  return String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function isHonoraryAthlete(name) {
  return normalizeAthleteName(name) === HONORARY_ATHLETE;
}

function isNAValue(value) {
  return String(value).trim().toUpperCase() === 'NA';
}

function athleteHasNA(athlete) {
  return athlete.wods.some(wod => isNAValue(wod.puntos) || isNAValue(wod.detalle));
}

function orderIntermediosAthletes(athletes) {
  const sorted = [...athletes].sort((a, b) => a.total - b.total);
  const withNA = sorted.filter(athlete => athleteHasNA(athlete));
  const withoutNA = sorted.filter(athlete => !athleteHasNA(athlete));

  if (!withNA.length) return sorted;

  const ordered = [...withoutNA];
  const insertAt = Math.max(0, ordered.length + withNA.length - 3);
  ordered.splice(insertAt, 0, ...withNA);
  return ordered;
}

function orderMujeresPrincipiantesAthletes(athletes) {
  const sorted = [...athletes].sort((a, b) => a.total - b.total);
  const honorary = sorted.find(athlete => isHonoraryAthlete(athlete.atleta));
  const withNA = sorted.filter(
    athlete => athleteHasNA(athlete) && !isHonoraryAthlete(athlete.atleta)
  );
  const middle = sorted.filter(
    athlete => !athleteHasNA(athlete) && !isHonoraryAthlete(athlete.atleta)
  );

  const ordered = [];
  if (honorary) ordered.push(honorary);
  ordered.push(...middle, ...withNA);
  return ordered;
}

function orderAvanzadosAthletes(athletes) {
  const sorted = [...athletes].sort((a, b) => a.total - b.total);
  const withNA = sorted.filter(athlete => athleteHasNA(athlete));
  const withoutNA = sorted.filter(athlete => !athleteHasNA(athlete));
  return [...withoutNA, ...withNA];
}

function isAdvancedCategory(categoria) {
  return ADVANCED_CATEGORIES.includes(categoria);
}

function prepareAthletesForDisplay(athletes, categoria) {
  let ordered;

  if (categoria === HONORARY_CATEGORY) {
    ordered = orderMujeresPrincipiantesAthletes(athletes);

    return ordered.map((athlete, index) => {
      const displayRank = index === 0 ? 1 : index;
      return {
        ...athlete,
        displayRank,
        isHonorary: isHonoraryAthlete(athlete.atleta)
      };
    });
  }

  if (categoria === ELIMINATED_CATEGORY) {
    ordered = orderIntermediosAthletes(athletes);
  } else if (categoria === HOMBRES_AVANZADOS_CATEGORY) {
    ordered = [...athletes].sort((a, b) => a.total - b.total);
  } else if (isAdvancedCategory(categoria)) {
    ordered = orderAvanzadosAthletes(athletes);
  } else {
    ordered = [...athletes].sort((a, b) => a.total - b.total);
  }

  return ordered.map((athlete, index) => ({
    ...athlete,
    displayRank: index + 1,
    isHonorary: false
  }));
}

function isPereiraSede() {
  return currentSede === 'pereira';
}

function getDisplayRankClass(displayRank) {
  if (isPereiraSede()) return '';
  if (displayRank === 1) return 'top1';
  if (displayRank === 2) return 'top2';
  if (displayRank === 3) return 'top3';
  return '';
}

function getPodiumBadge(displayRank) {
  if (isPereiraSede()) return null;
  return PODIUM_BADGES[displayRank] || null;
}

function getPodiumRowClass(displayRank) {
  if (isPereiraSede()) return '';
  if (displayRank === 1) return ' team-row--podium-gold';
  if (displayRank === 2) return ' team-row--podium-silver';
  if (displayRank === 3) return ' team-row--podium-bronze';
  return '';
}

function getDisplayMedal(displayRank) {
  if (isPereiraSede()) return '';
  return RANK_MEDALS[displayRank] || '';
}

function renderTable({ athletes, wodNames }, categoria) {
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

  const displayAthletes = prepareAthletesForDisplay(athletes, categoria);
  let tableHTML = '';

  displayAthletes.forEach((athlete, index) => {
    const { displayRank } = athlete;
    const medal = getDisplayMedal(displayRank);
    const rankClass = getDisplayRankClass(displayRank);
    const podiumRowClass = getPodiumRowClass(displayRank);
    const flag = getCountryFlag(athlete.pais);

    const podium = getPodiumBadge(displayRank);
    const podiumBadge = podium
      ? `<span class="podium-banner" aria-label="${podium.label}">
           <span class="podium-ribbon ${podium.ribbonClass}">${podium.label}</span>
         </span>`
      : '';

    const wodCells = athlete.wods.map(wod =>
      `<td class="wod-pos-cell">${formatWodPosition(wod.puntos)}</td>`
    ).join('');

    tableHTML += `
      <tr class="team-row${podiumRowClass}" data-team-index="${index}">
        <td class="pos-cell">
          <span class="rank-badge ${rankClass}">${displayRank}</span>
          ${medal ? `<span class="rank-medal" aria-hidden="true">${medal}</span>` : ''}
        </td>
        <td class="name-cell">
          <div class="team-name-cell">
            <button type="button" class="team-name" onclick="toggleTeamDetails(${index})" aria-expanded="false" id="team-btn-${index}">
              <span class="expand-icon" id="expand-${index}" aria-hidden="true">▶</span>
              <span class="team-name__text">${escapeHtml(athlete.atleta)}</span>
            </button>
            ${podiumBadge}
          </div>
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
const SPONSORS_BY_SEDE = {
  pereira: [
    'IMG_1427.PNG',
    'IMG_1428.PNG',
    'IMG_1429.PNG',
    'IMG_1430.PNG',
    'IMG_1431.PNG',
    'IMG_1432.PNG',
    'IMG_1433.PNG',
    'IMG_1434.PNG',
    'IMG_1435.PNG',
    'IMG_1436.PNG',
    'IMG_1437.PNG',
    'IMG_1438.PNG'
  ],
  envigado: [
    'Equimovi.jpeg',
    'Imagen1.png',
    'LOGO DOMIVET.png',
    'culto.png',
    'intellygence.png',
    'mues.png'
  ]
};

function cargarPatrocinadores(sede = currentSede) {
  const grid = document.getElementById('patrocinadoresGrid');
  if (!grid) return;

  const logos = SPONSORS_BY_SEDE[sede] || SPONSORS_BY_SEDE.pereira;
  grid.dataset.sede = sede;
  grid.classList.toggle('patrocinadores-grid--pereira', sede === 'pereira');
  grid.classList.toggle('patrocinadores-grid--envigado', sede === 'envigado');

  grid.innerHTML = logos.map(file => `
    <div class="patrocinador-logo-box">
      <img
        src="assets/patrocinadores/${sede}/${encodeURIComponent(file)}"
        alt="Patrocinador"
        class="patrocinador-logo-img"
        loading="lazy"
      />
    </div>
  `).join('');
}
