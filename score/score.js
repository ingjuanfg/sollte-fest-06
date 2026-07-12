const SEDE_STORAGE_KEY = 'sollte-sede';
const DEFAULT_SEDE = 'pereira';

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

const COUNTRY_FLAGS = {
  'paises bajos': '🇳🇱', holanda: '🇳🇱', austria: '🇦🇹', austri: '🇦🇹', francia: '🇫🇷',
  canada: '🇨🇦', jordania: '🇯🇴', irak: '🇮🇶', iraq: '🇮🇶', noruega: '🇳🇴', egipto: '🇪🇬',
  'estados unidos': '🇺🇸', eeuu: '🇺🇸', usa: '🇺🇸', uruguay: '🇺🇾', suiza: '🇨🇭',
  argelia: '🇩🇿', panama: '🇵🇦', marruecos: '🇲🇦', belgica: '🇧🇪', senegal: '🇸🇳',
  inglaterra: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', mexico: '🇲🇽', sudafrica: '🇿🇦', arabia: '🇸🇦', checa: '🇨🇿',
  'republica checa': '🇨🇿', 'arabia saudita': '🇸🇦', escocia: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', portugal: '🇵🇹',
  uzbe: '🇺🇿', uzbekistan: '🇺🇿', haiti: '🇭🇹', 'nueva zelanda': '🇳🇿', zelanda: '🇳🇿',
  curazao: '🇨🇼', curacao: '🇨🇼', japon: '🇯🇵', espana: '🇪🇸', ecuador: '🇪🇨',
  brasil: '🇧🇷', tunez: '🇹🇳', colombia: '🇨🇴', costa: '🇨🇷', 'costa rica': '🇨🇷',
  costarica: '🇨🇷', qatar: '🇶🇦', cabo: '🇨🇻', 'cabo verde': '🇨🇻', ghana: '🇬🇭',
  iran: '🇮🇷', alemania: '🇩🇪', argentina: '🇦🇷', australia: '🇦🇺', bosnia: '🇧🇦',
  camerun: '🇨🇲', chile: '🇨🇱', china: '🇨🇳', congo: '🇨🇬', 'costa de marfil': '🇨🇮',
  marfil: '🇨🇮', croacia: '🇭🇷', dinamarca: '🇩🇰', filandia: '🇫🇮', finlandia: '🇫🇮',
  italia: '🇮🇹', korea: '🇰🇷', corea: '🇰🇷', nigeria: '🇳🇬', paraguay: '🇵🇾',
  polonia: '🇵🇱', suecia: '🇸🇪', turquia: '🇹🇷'
};

function getSede() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = (params.get('sede') || '').toLowerCase();
  if (fromQuery === 'pereira' || fromQuery === 'envigado') return fromQuery;
  const stored = (localStorage.getItem(SEDE_STORAGE_KEY) || '').toLowerCase();
  if (stored === 'pereira' || stored === 'envigado') return stored;
  return DEFAULT_SEDE;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeCountryKey(pais) {
  return String(pais)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getCountryFlag(pais) {
  return COUNTRY_FLAGS[normalizeCountryKey(pais)] || '🏳️';
}

function isNAValue(value) {
  return String(value).trim().toUpperCase() === 'NA';
}

function isRetiradoValue(value) {
  return String(value).trim().toUpperCase() === 'RETIRADO';
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

function parseResultsCSV(text) {
  const rows = parseCSVRows(text.trim());
  if (rows.length < 3) return [];

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
          puntos: values[col] ?? '',
          detalle: values[col + 1] ?? ''
        });
        col += 2;
      }

      const isRetirado = [values[1], ...wods.flatMap(wod => [wod.puntos, wod.detalle])]
        .some(isRetiradoValue);

      const total = wods.reduce((sum, wod) => {
        if (isNAValue(wod.puntos) || isRetiradoValue(wod.puntos)) return sum;
        const pts = parseFloat(wod.puntos);
        return sum + (isNaN(pts) ? 0 : pts);
      }, 0);

      return {
        atleta: values[0],
        pais: values[1] ?? '',
        total,
        isRetirado
      };
    })
    .filter(Boolean);

  const active = athletes.filter(a => !a.isRetirado).sort((a, b) => a.total - b.total);
  const retirados = athletes.filter(a => a.isRetirado);
  return [...active, ...retirados].map((athlete, index) => ({
    ...athlete,
    displayRank: index + 1
  }));
}

async function loadCategory(sede, category) {
  const url = `../data/${sede}/${encodeURIComponent(category.file)}?t=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${category.file}`);
  const text = await res.text();
  return {
    label: category.label,
    athletes: parseResultsCSV(text)
  };
}

function renderCategoryBlock(category) {
  const section = document.createElement('section');
  section.className = 'score-category';

  const title = document.createElement('h2');
  title.className = 'score-category__title';
  title.textContent = category.label;
  section.appendChild(title);

  if (!category.athletes.length) {
    const empty = document.createElement('p');
    empty.className = 'score-category__empty';
    empty.textContent = 'Sin resultados';
    section.appendChild(empty);
    return section;
  }

  const table = document.createElement('table');
  table.className = 'score-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th class="col-pos">#</th>
        <th class="col-name">Nombre</th>
        <th class="col-flag">País</th>
        <th class="col-pts">Pts</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');
  category.athletes.forEach(athlete => {
    const tr = document.createElement('tr');
    if (athlete.isRetirado) tr.className = 'is-retirado';
    tr.innerHTML = `
      <td class="col-pos">${athlete.displayRank}</td>
      <td class="col-name">${escapeHtml(athlete.atleta)}</td>
      <td class="col-flag" title="${escapeHtml(athlete.pais)}">${getCountryFlag(athlete.pais)}</td>
      <td class="col-pts">${athlete.isRetirado ? '—' : athlete.total}</td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  section.appendChild(table);
  return section;
}

async function initScorePage() {
  const board = document.getElementById('scoreBoard');
  const meta = document.getElementById('scoreMeta');
  if (!board) return;

  const sede = getSede();
  const sedeLabel = sede === 'envigado' ? 'Envigado' : 'Pereira';
  if (meta) meta.textContent = sedeLabel;

  const categories = CATEGORIES_BY_SEDE[sede] || CATEGORIES_BY_SEDE.pereira;

  try {
    const results = await Promise.all(
      categories.map(async category => {
        try {
          return await loadCategory(sede, category);
        } catch (err) {
          console.error(err);
          return { label: category.label, athletes: [] };
        }
      })
    );

    board.replaceChildren();
    results.forEach(category => {
      board.appendChild(renderCategoryBlock(category));
    });
  } catch (err) {
    console.error(err);
    board.innerHTML = '<p class="score-loading">No se pudo cargar la clasificación.</p>';
  }
}

document.addEventListener('DOMContentLoaded', initScorePage);
