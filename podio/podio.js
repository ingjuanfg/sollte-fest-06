const TROPHY_IMAGE = '../assets/copa-final.png';

const PODIO_SLIDES = [
  {
    folder: 'hombres princ',
    title: 'PODIO 1',
    category: 'Categoría Hombres Principiantes',
    first: ['1.png'],
    second: ['2.png'],
    third: ['3.png']
  },
  {
    folder: 'mujeres princ',
    title: 'PODIO 2',
    category: 'Categoría Mujeres Principiantes',
    first: ['1.png', '1-1.png'],
    second: ['2.png'],
    third: ['3.png']
  },
  {
    folder: 'hombres inter',
    title: 'PODIO 3',
    category: 'Categoría Hombres Intermedios',
    first: ['1.png'],
    second: ['2.png'],
    third: ['3.png']
  },
  {
    folder: 'mujer ava',
    title: 'PODIO 4',
    category: 'Categoría Mujeres Avanzadas',
    first: ['1.png'],
    second: ['2.png'],
    third: ['3.png']
  },
  {
    folder: 'hombre ava',
    title: 'PODIO 5',
    category: 'Categoría Hombres Avanzados',
    first: ['1.png'],
    second: ['2.png'],
    third: ['3.png']
  }
];

const TOTAL_PODIOS = PODIO_SLIDES.length;

function formatAlt(filename) {
  const base = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function getPodioAssetUrl(folder, filename) {
  return `../assets/podio/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
}

function getInitialPodioFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = Number(params.get('podio'));
  if (fromQuery >= 1 && fromQuery <= TOTAL_PODIOS) return fromQuery;

  const hashMatch = window.location.hash.match(/^#(\d+)/);
  if (hashMatch) {
    const fromHash = Number(hashMatch[1]);
    if (fromHash >= 1 && fromHash <= TOTAL_PODIOS) return fromHash;
  }

  return 1;
}

function createPhoto(folder, filename, medalClass) {
  const photo = document.createElement('div');
  photo.className = `podio-photo podio-photo--${medalClass}`;

  const img = document.createElement('img');
  img.src = getPodioAssetUrl(folder, filename);
  img.alt = formatAlt(filename);
  img.loading = 'eager';

  photo.appendChild(img);
  return photo;
}

function createTrophy() {
  const trophy = document.createElement('div');
  trophy.className = 'podio-trophy';

  const img = document.createElement('img');
  img.src = TROPHY_IMAGE;
  img.alt = 'Copa Mundial FIFA';
  img.className = 'podio-trophy__img';
  img.loading = 'eager';

  trophy.appendChild(img);
  return trophy;
}

function createColumn(position, medalClass, files, folder, options = {}) {
  const column = document.createElement('div');
  column.className = `podio-column podio-column--${position}`;

  const photosWrap = document.createElement('div');
  photosWrap.className = 'podio-column__photos';
  if (options.dualFirst) photosWrap.classList.add('podio-column__photos--dual');

  if (options.showTrophy) {
    photosWrap.appendChild(createTrophy());
  }

  const photosRow = document.createElement('div');
  photosRow.className = 'podio-column__photo-row';
  if (options.dualFirst) photosRow.classList.add('podio-column__photo-row--dual');

  files.forEach(filename => {
    photosRow.appendChild(createPhoto(folder, filename, medalClass));
  });

  photosWrap.appendChild(photosRow);

  const block = document.createElement('div');
  block.className = `podio-block podio-block--${position} podio-block--${medalClass}`;
  block.innerHTML = `<span class="podio-block__num">${position}</span>`;

  column.appendChild(photosWrap);
  column.appendChild(block);
  return column;
}

function renderPodioStage(slide) {
  const stage = document.getElementById('podioStage');
  if (!stage) return;

  const isDualFirst = slide.first.length > 1;
  stage.classList.toggle('podio-stage--dual-first', isDualFirst);
  stage.replaceChildren();

  const columns = document.createElement('div');
  columns.className = 'podio-columns';

  columns.appendChild(createColumn(2, 'silver', slide.second, slide.folder));
  columns.appendChild(createColumn(1, 'gold', slide.first, slide.folder, {
    showTrophy: true,
    dualFirst: isDualFirst
  }));
  columns.appendChild(createColumn(3, 'bronze', slide.third, slide.folder));

  stage.appendChild(columns);
}

function updatePageMeta(index) {
  const slide = PODIO_SLIDES[index - 1];
  if (!slide) return;

  const title = `${slide.title} — Sollte Fest 07`;
  document.title = title;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = `${title} — ${slide.category}`;

  const podioLabel = document.getElementById('podioLabel');
  const podioTitle = document.getElementById('podioTitle');
  const podioCategory = document.getElementById('podioCategory');

  if (podioLabel) podioLabel.textContent = 'PODIO';
  if (podioTitle) podioTitle.textContent = slide.title;
  if (podioCategory) podioCategory.textContent = slide.category;
}

function updatePager(index) {
  const indicator = document.getElementById('podioIndicator');
  if (indicator) indicator.textContent = `${index} / ${TOTAL_PODIOS}`;
}

function updateViewerUrl(index) {
  const url = new URL(window.location.href);
  url.searchParams.set('podio', String(index));
  window.history.replaceState({ podio: index }, '', url);
}

function renderPodio(index) {
  const slide = PODIO_SLIDES[index - 1];
  if (!slide) return false;

  updatePageMeta(index);
  renderPodioStage(slide);
  updatePager(index);
  updateViewerUrl(index);
  return true;
}

function initPodioViewer() {
  let currentPodio = getInitialPodioFromQuery();

  const prevBtn = document.getElementById('podioPrev');
  const nextBtn = document.getElementById('podioNext');

  function goTo(target) {
    let podioNum = target;
    if (podioNum < 1) podioNum = TOTAL_PODIOS;
    if (podioNum > TOTAL_PODIOS) podioNum = 1;
    if (!renderPodio(podioNum)) return;
    currentPodio = podioNum;
  }

  prevBtn?.addEventListener('click', () => goTo(currentPodio - 1));
  nextBtn?.addEventListener('click', () => goTo(currentPodio + 1));

  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') goTo(currentPodio - 1);
    if (event.key === 'ArrowRight') goTo(currentPodio + 1);
  });

  goTo(currentPodio);
}

document.addEventListener('DOMContentLoaded', initPodioViewer);
