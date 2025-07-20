// ====== CONFIG ======
// Un CSV por categoría en /data. Deben existir los archivos referenciados.
const CSV_LOCAL = {
    "Principiante HH": "data/Sollte Fest 06 - Principiante HH.csv",
    "Principiante MM": "data/Sollte Fest 06 - Principiante MM.csv",
    "Intermedio HH":  "data/Sollte Fest 06 - Intermedio HH.csv",
    "Intermedio MM":  "data/Sollte Fest 06 - Intermedio MM.csv",
    "RX":             "data/Sollte Fest 06 - RX.csv",
    "Sollte Fest":    "data/Sollte Fest 06 - Sollte Fest.csv"
  };
  
  // Columnas WOD que se sumarán si activas "Recalcular Total" (nombres normalizados).
  const WOD_COLUMNS = ["wod1","wod2a","wod2b","wod3","wod4semifinal","wod5afinal","wod5bfinal"];
  
  // ====== DOM ======
  const categoriaSelect = document.getElementById('categoriaSelect');
  const tableHead       = document.getElementById('tableHead');
  const tableBody       = document.getElementById('tableBody');
  const reloadBtn       = document.getElementById('reloadBtn');
  const lastUpdateSpan  = document.getElementById('lastUpdate');
  const recalcularChk   = document.getElementById('recalcularTotal');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const yearEl          = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
  
  // INIT
  document.addEventListener('DOMContentLoaded', init);
  
  function init(){
    Object.keys(CSV_LOCAL).forEach(cat=>{
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      categoriaSelect.appendChild(opt);
    });
    categoriaSelect.addEventListener('change', loadData);
    reloadBtn.addEventListener('click', loadData);
    recalcularChk.addEventListener('change', loadData);
    loadData();
  }
  
  async function loadData(){
    const categoria = categoriaSelect.value || Object.keys(CSV_LOCAL)[0];
    const url = CSV_LOCAL[categoria];
    
    // Mostrar indicador de carga
    showLoading(true);
    
    try {
      const res = await fetch(url + '?t=' + Date.now()); // evitar cache
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const rows = parseCSV(text);
      renderTable(rows);
      lastUpdateSpan.textContent = `Categoría: ${categoria} • Actualizado: ${new Date().toLocaleString()}`;
    } catch(err){
      console.error(err);
      tableHead.innerHTML='';
      tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #d32f2f; padding: 2rem;">Error cargando ${url}: ${err.message}</td></tr>`;
    } finally {
      showLoading(false);
    }
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
  function parseCSV(text){
    const lines = text.trim().split(/\r?\n/);
    if(lines.length===0) return [];
    const headers = lines[0].split(',').map(h=>normalize(h));
    return lines.slice(1)
      .filter(l=>l.trim().length>0)
      .map(line=>{
        const cells = splitCSV(line);
        const obj = {};
        headers.forEach((h,i)=> obj[h] = (cells[i] ?? '').trim());
        return obj;
      });
  }
  
  function normalize(h){
    return h.toLowerCase()
            .replace(/\s+/g,'')
            .replace(/[^a-z0-9]/g,'');
  }
  
  function splitCSV(line){
    const out=[]; let cur=''; let q=false;
    for(let i=0;i<line.length;i++){
      const c=line[i];
      if(c==='"'){ 
        if(q && line[i+1]==='"'){ cur+='"'; i++; }
        else { q=!q; }
      } else if(c===',' && !q){
        out.push(cur); cur='';
      } else {
        cur+=c;
      }
    }
    out.push(cur);
    return out;
  }
  
  // ====== RENDER ======
  function renderTable(rows){
    if(rows.length===0){
      tableHead.innerHTML=''; tableBody.innerHTML='<tr><td colspan="3" style="text-align: center; padding: 2rem;">Sin datos disponibles</td></tr>'; return;
    }
    const cols = Object.keys(rows[0]);
    const equipoKey = cols.find(c=>/equipo|team/.test(c)) || cols[0];
    const totalKey  = cols.find(c=>/total/.test(c));
  
    if(recalcularChk.checked){
      rows.forEach(r=>{
        r.__total = WOD_COLUMNS.reduce((acc,k)=>{
          const val = parseFloat(r[k]);
          return acc + (isNaN(val)?0:val);
        },0);
      });
    }
  
    // Ordenar de menor a mayor puntos (mejor puntuación primero)
    rows.sort((a,b)=>{
      const ta = parseFloat(recalcularChk.checked ? a.__total : (a[totalKey]||0));
      const tb = parseFloat(recalcularChk.checked ? b.__total : (b[totalKey]||0));
      if(isNaN(ta) && isNaN(tb)) return 0;
      if(isNaN(ta)) return 1;
      if(isNaN(tb)) return -1;
      return ta - tb;
    });
  
    // Crear tabla simplificada con solo equipo y total
    tableHead.innerHTML = `<tr><th>#</th><th>EQUIPO</th><th>TOTAL</th></tr>`;
    
    let tableHTML = '';
    rows.forEach((r, i) => {
      const rank = i + 1;
      const tval = recalcularChk.checked ? r.__total : r[totalKey];
      const badge = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
      const teamName = r[equipoKey] || 'Sin nombre';
      
      // Fila principal del equipo
      tableHTML += `
        <tr class="team-row" data-team-index="${i}">
          <td><span class="rank-badge ${badge}">${rank}</span></td>
          <td>
            <span class="team-name" onclick="toggleTeamDetails(${i})">
              <span class="expand-icon" id="expand-${i}">▶</span>
              ${teamName}
            </span>
          </td>
          <td><strong>${(typeof tval === 'number' ? tval : parseFloat(tval)) || 0}</strong></td>
        </tr>
      `;
      
      // Fila desplegable con detalles de WODs
      const wodDetails = WOD_COLUMNS.filter(c => cols.includes(c) && r[c] && r[c] !== '');
      if (wodDetails.length > 0) {
        tableHTML += `
          <tr class="wod-details" id="wod-details-${i}">
            <td colspan="3">
              <div style="padding: 0.5rem 0;">
                <strong>Resultados por WOD:</strong><br>
                ${wodDetails.map(wod => {
                  const wodName = formatHeader(wod);
                  const wodValue = r[wod];
                  return `<span style="display: inline-block; margin: 0.25rem 0.5rem; padding: 0.25rem 0.5rem; background: #e9ecef; border-radius: 4px; font-size: 0.8rem;">
                    <strong>${wodName}:</strong> ${wodValue}
                  </span>`;
                }).join('')}
              </div>
            </td>
          </tr>
        `;
      }
    });
    
    tableBody.innerHTML = tableHTML;
  }
  
  function formatHeader(k){
    if(k==='__total') return 'TOTAL';
    return k
      .replace(/^wod/,'WOD ')
      .replace('2a','2A')
      .replace('2b','2B')
      .replace('wod4semifinal','WOD 4 Semifinal')
      .replace('wod5afinal','WOD 5A Final')
      .replace('wod5bfinal','WOD 5B Final')
      .toUpperCase()
      .replace(/EQUIPO|TEAM/,'EQUIPO');
  }
  
  // Función global para alternar detalles del equipo
  window.toggleTeamDetails = function(teamIndex) {
    const detailsRow = document.getElementById(`wod-details-${teamIndex}`);
    const expandIcon = document.getElementById(`expand-${teamIndex}`);
    
    if (detailsRow) {
      const isVisible = detailsRow.classList.contains('show');
      
      if (isVisible) {
        detailsRow.classList.remove('show');
        expandIcon.classList.remove('expanded');
      } else {
        detailsRow.classList.add('show');
        expandIcon.classList.add('expanded');
      }
    }
  };
  
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
  