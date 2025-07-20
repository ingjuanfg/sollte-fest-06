// ====== CONFIG ======
// Configuración para la página de espera
const WAITING_MODE = true;

// ====== DOM ======
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

// INIT
document.addEventListener('DOMContentLoaded', init);

function init(){
  if (WAITING_MODE) {
    // Modo de espera - solo cargar patrocinadores
    cargarPatrocinadores();
    return;
  }
  
  // Código original para cuando no esté en modo espera
  // Object.keys(CSV_LOCAL).forEach(cat=>{
  //   const opt = document.createElement('option');
  //   opt.value = cat; opt.textContent = cat;
  //   categoriaSelect.appendChild(opt);
  // });
  // categoriaSelect.addEventListener('change', loadData);
  // reloadBtn.addEventListener('click', loadData);
  // recalcularChk.addEventListener('change', loadData);
  // loadData();
}

// ====== PATROCINADORES ======
document.addEventListener('DOMContentLoaded', cargarPatrocinadores);

function cargarPatrocinadores() {
  const grid = document.getElementById('patrocinadoresGrid');
  if (!grid) return;
  // Lista de archivos detectados en la carpeta (puedes agregar más si subes nuevos logos)
  const logos = [
    'cheladas.png',
    'CALDEBURGER.png',
    'desayunos.jpg',
    'MANANTIAL.PNG',
    'PEREIRA PLAZA.jpg',
    'ENDURANCE .jpg',
    'JEN.png'
  ];
  grid.innerHTML = logos.map(file => `
    <div class="patrocinador-logo-box">
      <img src="assets/patrocinadores/${file}" alt="Patrocinador" class="patrocinador-logo-img" loading="lazy" />
    </div>
  `).join('');
}
  