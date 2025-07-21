// ====== CONFIG ======
// Configuración para la página de espera
const WAITING_MODE = true;

// ====== DOM ======
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

// INIT
document.addEventListener('DOMContentLoaded', init);

function init(){
  console.log('Inicializando aplicación...');
  if (WAITING_MODE) {
    console.log('Modo de espera activado');
    // Modo de espera - cargar patrocinadores y fuegos artificiales
    cargarPatrocinadores();
    initFireworks();
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

// Sistema de Fuegos Artificiales Mejorado
function initFireworks() {
  const container = document.getElementById('fireworksContainer');
  if (!container) {
    console.log('No se encontró el contenedor de fuegos artificiales');
    return;
  }
  console.log('Iniciando fuegos artificiales...');
  
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];
  let isRunning = true;
  
  function createFirework() {
    if (!isRunning) return;
    
    console.log('Creando fuegos artificiales...');
    // Crear múltiples fuegos artificiales simultáneamente
    const count = 2 + Math.floor(Math.random() * 3); // 2-4 fuegos simultáneos
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!isRunning) return;
        
        const startX = Math.random() * window.innerWidth;
        const targetY = Math.random() * (window.innerHeight * 0.7) + (window.innerHeight * 0.1);
        
        const firework = document.createElement('div');
        firework.className = `firework ${colors[Math.floor(Math.random() * colors.length)]}`;
        firework.style.left = `${startX}px`;
        firework.style.setProperty('--target-y', `${targetY}px`);
        
        container.appendChild(firework);
        
        // Crear explosión después de 2 segundos
        setTimeout(() => {
          createExplosion(startX, targetY, firework.className.split(' ')[1]);
          firework.remove();
        }, 2000);
      }, i * 200); // Pequeño delay entre cada fuego
    }
  }
  
  function createExplosion(x, y, color) {
    const particleCount = 15 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = `firework-particle ${color}`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      const angle = (i / particleCount) * 2 * Math.PI + Math.random() * 0.5;
      const distance = 50 + Math.random() * 100;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      
      container.appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, 1500);
    }
  }
  
  // Iniciar fuegos artificiales más frecuentes
  function scheduleFireworks() {
    if (!isRunning) return;
    
    const delay = 500 + Math.random() * 1000; // 0.5-1.5 segundos entre grupos
    setTimeout(() => {
      createFirework();
      scheduleFireworks();
    }, delay);
  }
  
  // Iniciar después de un breve delay
  setTimeout(() => {
    scheduleFireworks();
  }, 1000);
  
  // Pausar cuando la ventana no está visible
  document.addEventListener('visibilitychange', () => {
    isRunning = !document.hidden;
  });
}
  