// Programa Acción Climática 2026 - Dashboard Global & Comparativo
// Badijoly / Antigravity

// -----------------------------------------------------------------
// AUTHENTICATION & ACCESS CONTROL (PASSWORD: pac2026)
// -----------------------------------------------------------------
window.handleAuthSubmit = function(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('auth-password');
  const error = document.getElementById('auth-error');
  const gate = document.getElementById('auth-gate');
  const app = document.getElementById('dashboard-app');

  if (!input) return;
  const val = input.value.trim();

  if (val === 'pac2026') {
    sessionStorage.setItem('pac_auth_token', 'authenticated');
    document.documentElement.classList.add('pac-authed');
    if (gate) {
      gate.classList.add('transition-opacity', 'duration-300', 'opacity-0');
      setTimeout(() => {
        gate.style.display = 'none';
        if (app) {
          app.classList.remove('hidden');
          app.style.display = 'flex';
        }
        if (window.lucide) lucide.createIcons();
        if (typeof updateDashboard === 'function') updateDashboard();
      }, 250);
    }
  } else {
    if (error) error.classList.remove('hidden');
    input.classList.add('border-rose-400', 'bg-rose-50');
    input.value = '';
    input.focus();
  }
};

window.togglePasswordVisibility = function() {
  const input = document.getElementById('auth-password');
  const icon = document.getElementById('auth-eye-icon');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    if (icon) icon.setAttribute('data-lucide', 'eye');
  }
  if (window.lucide) lucide.createIcons();
};

window.lockDashboard = function() {
  sessionStorage.removeItem('pac_auth_token');
  document.documentElement.classList.remove('pac-authed');
  location.reload();
};

let rawData = null;
let allEvaluaciones = [];
let chartSchools = null;
let chartGender = null;
let chartCompHito3 = null;
let chartCompHito4 = null;
let currentTab = 'general';

// DOM Elements
const elFilterSchool = document.getElementById('filter-school');
const elFilterRole = document.getElementById('filter-role');
const elFilterGender = document.getElementById('filter-gender');
const elBtnReset = document.getElementById('btn-reset-filters');
const elActiveCount = document.getElementById('lbl-active-count');
const elSearchSchool = document.getElementById('input-search-school');

// Tab Elements
const elTabBtnGeneral = document.getElementById('tab-btn-general');
const elTabBtnComparativa = document.getElementById('tab-btn-comparativa');
const elViewGeneral = document.getElementById('view-general');
const elViewComparativa = document.getElementById('view-comparativa');

// KPI Elements
const elKpiFavorablePct = document.getElementById('kpi-favorable-pct');
const elKpiFavorableN = document.getElementById('kpi-favorable-n');
const elKpiFavorableTotal = document.getElementById('kpi-favorable-total');
const elKpiMejoraronN = document.getElementById('kpi-mejoraron-n');
const elKpiMantuvieronN = document.getElementById('kpi-mantuvieron-n');
const elKpiRetrocedieronN = document.getElementById('kpi-retrocedieron-n');
const elKpiPostPct = document.getElementById('kpi-post-pct');
const elKpiPrePct = document.getElementById('kpi-pre-pct');
const elKpiDeltaPct = document.getElementById('kpi-delta-pct');
const elKpiHakeG = document.getElementById('kpi-hake-g');
const elKpiHakeTier = document.getElementById('kpi-hake-tier');

// Gender Elements
const elGenderFN = document.getElementById('gender-f-n');
const elGenderFPre = document.getElementById('gender-f-pre');
const elGenderFPost = document.getElementById('gender-f-post');
const elGenderFDelta = document.getElementById('gender-f-delta');
const elGenderFHake = document.getElementById('gender-f-hake');
const elGenderFFav = document.getElementById('gender-f-fav');

const elGenderMN = document.getElementById('gender-m-n');
const elGenderMPre = document.getElementById('gender-m-pre');
const elGenderMPost = document.getElementById('gender-m-post');
const elGenderMDelta = document.getElementById('gender-m-delta');
const elGenderMHake = document.getElementById('gender-m-hake');
const elGenderMFav = document.getElementById('gender-m-fav');

const elTableBody = document.getElementById('table-schools-body');
const elSchoolsChartNote = document.getElementById('lbl-schools-chart-note');
const elPillTotalStudents = document.getElementById('pill-total-students');
const elPillTotalEvals = document.getElementById('pill-total-evals');
const elPillLabelStudents = document.getElementById('pill-label-students');
const elPillSubStudents = document.getElementById('pill-sub-students');
const elPillHakeG = document.getElementById('pill-hake-g');

// Safe textContent setter to protect against missing/cached DOM nodes
function safeSetText(el, val) {
  if (el) el.textContent = val;
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('data.json?v=' + Date.now());
    if (!response.ok) throw new Error('No se pudo cargar data.json');
    rawData = await response.json();
    allEvaluaciones = rawData.evaluaciones;

    // Populate School Dropdown
    populateSchoolDropdown();

    // Event Listeners for Filters
    if (elFilterSchool) elFilterSchool.addEventListener('change', updateDashboard);
    if (elFilterRole) elFilterRole.addEventListener('change', updateDashboard);
    if (elFilterGender) elFilterGender.addEventListener('change', updateDashboard);
    if (elBtnReset) elBtnReset.addEventListener('click', resetFilters);
    if (elSearchSchool) elSearchSchool.addEventListener('input', renderSchoolsTable);

    // Initial render
    updateDashboard();

    // Render Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  } catch (err) {
    console.error('Error inicializando el dashboard:', err);
    alert('Error al cargar datos del dashboard: ' + err.message);
  }
});

// TAB SWITCHING FUNCTION (GLOBAL)
window.switchTab = function(tabName) {
  currentTab = tabName;
  if (tabName === 'general') {
    elTabBtnGeneral.className = 'tab-active px-5 py-3 rounded-t-2xl text-sm font-bold transition flex items-center gap-2';
    elTabBtnComparativa.className = 'tab-inactive px-5 py-3 rounded-t-2xl text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2';
    elViewGeneral.classList.remove('hidden');
    elViewComparativa.classList.add('hidden');
    // resize charts
    if (chartSchools) chartSchools.resize();
    if (chartGender) chartGender.resize();
  } else {
    elTabBtnGeneral.className = 'tab-inactive px-5 py-3 rounded-t-2xl text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2';
    elTabBtnComparativa.className = 'tab-active px-5 py-3 rounded-t-2xl text-sm font-bold transition flex items-center gap-2';
    elViewGeneral.classList.add('hidden');
    elViewComparativa.classList.remove('hidden');
    renderComparativeCharts();
  }
  if (window.lucide) {
    lucide.createIcons();
  }
};

function populateSchoolDropdown() {
  const schools = rawData.metadata.establecimientos || [];
  elFilterSchool.innerHTML = '<option value="all">Todos los Establecimientos (15)</option>';
  schools.forEach(sch => {
    const opt = document.createElement('option');
    opt.value = sch;
    opt.textContent = sch;
    elFilterSchool.appendChild(opt);
  });
}

function resetFilters() {
  elFilterSchool.value = 'all';
  elFilterRole.value = 'all';
  elFilterGender.value = 'all';
  elSearchSchool.value = '';
  updateDashboard();
}

function getFilteredData() {
  const selectedSchool = elFilterSchool.value;
  const selectedRole = elFilterRole.value;
  const selectedGender = elFilterGender.value;

  return allEvaluaciones.filter(ev => {
    if (selectedSchool !== 'all' && ev.school !== selectedSchool) return false;
    if (selectedRole !== 'all' && ev.role !== selectedRole) return false;
    if (selectedGender !== 'all' && ev.gender !== selectedGender) return false;
    return true;
  });
}

function updateDashboard() {
  const filtered = getFilteredData();
  const n = filtered.length;

  safeSetText(elActiveCount, n);
  safeSetText(elPillTotalEvals, n);

  // Actualizar conteo dinámico de estudiantes evaluados en la pastilla superior
  const selectedRole = elFilterRole ? elFilterRole.value : 'all';
  const estudiantesList = filtered.filter(e => (e.role || '').toLowerCase().includes('estudiante'));
  const uniqueStudents = new Set(estudiantesList.map(e => (e.name || '').trim().toLowerCase())).size;
  const uniqueTotal = new Set(filtered.map(e => (e.name || '').trim().toLowerCase())).size;

  if (selectedRole === 'Docente') {
    safeSetText(elPillLabelStudents, 'Docentes');
    safeSetText(elPillTotalStudents, uniqueTotal);
    safeSetText(elPillSubStudents, 'Docentes Evaluados');
  } else {
    safeSetText(elPillLabelStudents, 'Estudiantes');
    safeSetText(elPillTotalStudents, uniqueStudents);
    safeSetText(elPillSubStudents, 'Alumnos Evaluados');
  }

  if (n === 0) {
    renderZeroState();
    return;
  }

  // 1. Calculate Global KPIs
  const favCount = filtered.filter(e => e.favorable).length;
  const mejoraronCount = filtered.filter(e => e.status === 'Mejoró').length;
  const mantuvieronCount = filtered.filter(e => e.status === 'Mantuvo').length;
  const retrocedieronCount = filtered.filter(e => e.status === 'Retrocedió').length;

  const preSum = filtered.reduce((acc, e) => acc + e.pre_pct, 0);
  const postSum = filtered.reduce((acc, e) => acc + e.post_pct, 0);
  const preMean = preSum / n;
  const postMean = postSum / n;
  const deltaMean = postMean - preMean;
  const hakeGlobal = preMean < 100 ? (postMean - preMean) / (100 - preMean) : 0;

  // Update KPI DOM
  const favPct = ((favCount / n) * 100).toFixed(1);
  safeSetText(elKpiFavorablePct, `${favPct}%`);
  safeSetText(elKpiFavorableN, favCount);
  safeSetText(elKpiFavorableTotal, n);
  safeSetText(elKpiMejoraronN, mejoraronCount);
  safeSetText(elKpiMantuvieronN, mantuvieronCount);
  safeSetText(elKpiRetrocedieronN, retrocedieronCount);

  safeSetText(elKpiPostPct, `${postMean.toFixed(1)}%`);
  safeSetText(elKpiPrePct, `${preMean.toFixed(1)}%`);

  const sign = deltaMean >= 0 ? '+' : '';
  safeSetText(elKpiDeltaPct, `${sign}${deltaMean.toFixed(1)}%`);

  const hakeFormatted = hakeGlobal.toFixed(2);
  safeSetText(elKpiHakeG, hakeFormatted);
  safeSetText(elPillHakeG, hakeFormatted);

  let tier = 'Ganancia Baja';
  if (hakeGlobal >= 0.70) tier = 'Ganancia Alta (≥0.70)';
  else if (hakeGlobal >= 0.30) tier = 'Ganancia Media (0.30-0.69)';
  else if (hakeGlobal < 0) tier = 'Regresión (<0)';
  safeSetText(elKpiHakeTier, tier);

  // 2. Render Charts
  renderSchoolsChart(filtered);
  renderGenderChart(filtered);

  // 3. Render Table
  renderSchoolsTable();

  // If in comparative tab, refresh it too
  if (currentTab === 'comparativa') {
    renderComparativeCharts();
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderZeroState() {
  safeSetText(elKpiFavorablePct, '0%');
  safeSetText(elKpiFavorableN, 0);
  safeSetText(elKpiFavorableTotal, 0);
  safeSetText(elKpiPostPct, '0%');
  safeSetText(elKpiPrePct, '0%');
  safeSetText(elKpiDeltaPct, '0%');
  safeSetText(elKpiHakeG, '0.00');
  safeSetText(elKpiHakeTier, 'Sin Datos');
  if (elTableBody) elTableBody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400">No se encontraron evaluaciones con los filtros seleccionados.</td></tr>`;
  
  if (chartSchools) chartSchools.destroy();
  if (chartGender) chartGender.destroy();
}

function renderSchoolsChart(filtered) {
  const bySchool = {};
  filtered.forEach(e => {
    if (!bySchool[e.school]) {
      bySchool[e.school] = { name: e.school, preList: [], postList: [], line: e.line };
    }
    bySchool[e.school].preList.push(e.pre_pct);
    bySchool[e.school].postList.push(e.post_pct);
  });

  const schoolAgg = Object.values(bySchool).map(s => {
    const preAvg = s.preList.reduce((a, b) => a + b, 0) / s.preList.length;
    const postAvg = s.postList.reduce((a, b) => a + b, 0) / s.postList.length;
    const delta = postAvg - preAvg;
    const g = preAvg < 100 ? (postAvg - preAvg) / (100 - preAvg) : 0;
    return {
      school: s.name,
      preAvg: Number(preAvg.toFixed(1)),
      postAvg: Number(postAvg.toFixed(1)),
      delta: Number(delta.toFixed(1)),
      hake: Number(g.toFixed(2)),
      count: s.preList.length,
      line: s.line
    };
  });

  schoolAgg.sort((a, b) => b.postAvg - a.postAvg);
  safeSetText(elSchoolsChartNote, `${schoolAgg.length} establecimientos graficados (${filtered.length} evaluaciones)`);

  const labels = schoolAgg.map(s => {
    let name = s.school
      .replace('Escuela ', 'Esc. ')
      .replace('Colegio ', 'Col. ')
      .replace('Liceo Bicentenario ', 'Lic. Bic. ')
      .replace('Liceo ', 'Lic. ')
      .replace('Humberto González Echegoyen', 'H. González')
      .replace('Padre Alberto Hurtado', 'P. Hurtado')
      .replace('Héroes de la Concepción', 'Héroes Concep.')
      .replace('República de Estados Unidos', 'Rep. EE.UU.')
      .replace('República de Italia', 'Rep. Italia')
      .replace('Domingo Herrera Rivera', 'D. Herrera');
    return name;
  });

  const preData = schoolAgg.map(s => s.preAvg);
  const postData = schoolAgg.map(s => s.postAvg);

  const ctx = document.getElementById('chart-schools-comparison').getContext('2d');
  if (chartSchools) {
    chartSchools.destroy();
  }

  chartSchools = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Estado Inicial PRE (%)',
          data: preData,
          backgroundColor: 'rgba(148, 163, 184, 0.75)',
          borderColor: 'rgb(100, 116, 139)',
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.8,
          categoryPercentage: 0.7
        },
        {
          label: 'Estado Final POST (%)',
          data: postData,
          backgroundColor: 'rgba(13, 148, 136, 0.85)',
          borderColor: 'rgb(15, 118, 110)',
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.8,
          categoryPercentage: 0.7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { size: 12, family: 'Plus Jakarta Sans', weight: 'bold' },
          bodyFont: { size: 11, family: 'Plus Jakarta Sans' },
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            title: (items) => schoolAgg[items[0].dataIndex].school,
            afterBody: (items) => {
              const s = schoolAgg[items[0].dataIndex];
              const sign = s.delta >= 0 ? '+' : '';
              return [
                `Línea: ${s.line}`,
                `N° Evaluaciones: ${s.count}`,
                `Δ Avance Neto: ${sign}${s.delta}%`,
                `Ganancia de Hake (g): ${s.hake}`
              ];
            },
            label: (item) => `${item.dataset.label}: ${item.raw}%`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 10, family: 'Plus Jakarta Sans', weight: '500' },
            color: '#475569',
            maxRotation: 45,
            minRotation: 30
          }
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            callback: (val) => `${val}%`,
            font: { size: 10, family: 'Plus Jakarta Sans' },
            color: '#64748b'
          },
          grid: { color: '#f1f5f9' }
        }
      }
    }
  });
}

function renderGenderChart(filtered) {
  const femEvals = filtered.filter(e => e.gender === 'Femenino');
  const mascEvals = filtered.filter(e => e.gender === 'Masculino');

  const calcGenderStats = (list) => {
    const n = list.length;
    if (n === 0) return { n: 0, pre: 0, post: 0, delta: 0, hake: 0, fav: 0 };
    const pre = list.reduce((a, b) => a + b.pre_pct, 0) / n;
    const post = list.reduce((a, b) => a + b.post_pct, 0) / n;
    const delta = post - pre;
    const hake = pre < 100 ? (post - pre) / (100 - pre) : 0;
    const favCount = list.filter(e => e.favorable).length;
    return {
      n,
      pre: Number(pre.toFixed(1)),
      post: Number(post.toFixed(1)),
      delta: Number(delta.toFixed(1)),
      hake: Number(hake.toFixed(2)),
      fav: Number(((favCount / n) * 100).toFixed(1))
    };
  };

  const statF = calcGenderStats(femEvals);
  const statM = calcGenderStats(mascEvals);

  safeSetText(elGenderFN, `N=${statF.n}`);
  safeSetText(elGenderFPre, `${statF.pre}%`);
  safeSetText(elGenderFPost, `${statF.post}%`);
  safeSetText(elGenderFDelta, `${statF.delta >= 0 ? '+' : ''}${statF.delta}%`);
  safeSetText(elGenderFHake, statF.hake);
  safeSetText(elGenderFFav, `${statF.fav}%`);

  safeSetText(elGenderMN, `N=${statM.n}`);
  safeSetText(elGenderMPre, `${statM.pre}%`);
  safeSetText(elGenderMPost, `${statM.post}%`);
  safeSetText(elGenderMDelta, `${statM.delta >= 0 ? '+' : ''}${statM.delta}%`);
  safeSetText(elGenderMHake, statM.hake);
  safeSetText(elGenderMFav, `${statM.fav}%`);

  const ctx = document.getElementById('chart-gender-comparison').getContext('2d');
  if (chartGender) {
    chartGender.destroy();
  }

  chartGender = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Femenino', 'Masculino'],
      datasets: [
        {
          label: 'Estado Inicial PRE',
          data: [statF.pre, statM.pre],
          backgroundColor: 'rgba(148, 163, 184, 0.75)',
          borderColor: 'rgb(100, 116, 139)',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'Estado Final POST',
          data: [statF.post, statM.post],
          backgroundColor: ['rgba(236, 72, 153, 0.85)', 'rgba(59, 130, 246, 0.85)'],
          borderColor: ['rgb(219, 39, 119)', 'rgb(37, 99, 235)'],
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, font: { size: 10, family: 'Plus Jakarta Sans' } }
        },
        tooltip: {
          callbacks: { label: (item) => `${item.dataset.label}: ${item.raw}%` }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20, callback: (v) => `${v}%` },
          grid: { color: '#f1f5f9' }
        }
      }
    }
  });
}

function renderSchoolsTable() {
  const filtered = getFilteredData();
  const searchTerm = (elSearchSchool.value || '').toLowerCase().trim();

  const bySchool = {};
  filtered.forEach(e => {
    if (!bySchool[e.school]) {
      bySchool[e.school] = { name: e.school, line: e.line, evals: [] };
    }
    bySchool[e.school].evals.push(e);
  });

  let schoolsList = Object.values(bySchool).map(s => {
    const n = s.evals.length;
    const estEvals = s.evals.filter(e => (e.role || '').toLowerCase().includes('estudiante'));
    const docEvals = s.evals.filter(e => (e.role || '').toLowerCase().includes('docente') || (e.role || '').toLowerCase().includes('profesor') || (e.role || '').toLowerCase().includes('lider'));
    const nEst = estEvals.length;
    const nDoc = docEvals.length;

    const preSum = s.evals.reduce((a, b) => a + b.pre_pct, 0);
    const postSum = s.evals.reduce((a, b) => a + b.post_pct, 0);
    const pre = preSum / n;
    const post = postSum / n;
    const delta = post - pre;
    const favCount = s.evals.filter(e => e.favorable).length;
    const favRate = (favCount / n) * 100;
    const hake = pre < 100 ? (post - pre) / (100 - pre) : 0;

    return {
      name: s.name,
      line: s.line,
      n,
      nEst,
      nDoc,
      pre: Number(pre.toFixed(1)),
      post: Number(post.toFixed(1)),
      delta: Number(delta.toFixed(1)),
      favRate: Number(favRate.toFixed(1)),
      hake: Number(hake.toFixed(2))
    };
  });

  if (searchTerm) {
    schoolsList = schoolsList.filter(s => s.name.toLowerCase().includes(searchTerm));
  }
  schoolsList.sort((a, b) => b.post - a.post);

  if (schoolsList.length === 0) {
    elTableBody.innerHTML = `<tr><td colspan="10" class="text-center py-6 text-slate-400">No se encontraron establecimientos coincidentes.</td></tr>`;
    return;
  }

  elTableBody.innerHTML = schoolsList.map(s => {
    const lineBadge = s.line === 'Línea Verde' 
      ? '<span class="badge-verde px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">Línea Verde</span>'
      : '<span class="badge-azul px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">Línea Azul</span>';

    const deltaClass = s.delta > 0 ? 'text-emerald-600 font-bold' : (s.delta === 0 ? 'text-slate-600' : 'text-amber-600 font-bold');
    const deltaSign = s.delta > 0 ? '+' : '';

    let hakeBadge = '<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Media</span>';
    if (s.hake >= 0.7) {
      hakeBadge = '<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Alta</span>';
    } else if (s.hake < 0.3 && s.hake >= 0) {
      hakeBadge = '<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Baja</span>';
    } else if (s.hake < 0) {
      hakeBadge = '<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Regresión</span>';
    }

    const docBadge = s.nDoc > 0 
      ? `<span class="inline-flex items-center justify-center font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200">${s.nDoc}</span>`
      : `<span class="text-slate-300 font-mono">-</span>`;

    const noteTag = s.name === 'Escuela La Bandera' ? '<sup class="text-teal-600 font-bold ml-1 cursor-help" title="Ver Nota 1 al pie: 19 evaluaciones de estudiantes + 4 de líderes docentes en 2 hitos">*1</sup>' : '';

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 px-4 font-semibold text-slate-900">${s.name}${noteTag}</td>
        <td class="py-3 px-2">${lineBadge}</td>
        <td class="py-3 px-2 text-center font-medium text-slate-700 bg-slate-50/40">${s.nEst}</td>
        <td class="py-3 px-2 text-center bg-slate-50/40">${docBadge}</td>
        <td class="py-3 px-2 text-center font-black text-slate-900 bg-slate-100/70 font-mono">${s.n}</td>
        <td class="py-3 px-3 text-right font-mono text-slate-600">${s.pre}%</td>
        <td class="py-3 px-3 text-right font-mono font-bold text-slate-900">${s.post}%</td>
        <td class="py-3 px-3 text-right font-mono ${deltaClass}">${deltaSign}${s.delta}%</td>
        <td class="py-3 px-3 text-center">
          <span class="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
            ${s.favRate}%
          </span>
        </td>
        <td class="py-3 px-3 text-center">
          <span class="font-mono font-bold text-slate-800 mr-1.5">${s.hake}</span>
          ${hakeBadge}
        </td>
      </tr>
    `;
  }).join('');
}

// -----------------------------------------------------------------
// COMPARATIVE TAB RENDERING (HITO 3 & HITO 4 DEEP DIVE)
// -----------------------------------------------------------------
function renderComparativeCharts() {
  if (!rawData || !rawData.comparativa_detallada) return;

  const h3 = rawData.comparativa_detallada.hito_3_comparativa;
  const h4 = rawData.comparativa_detallada.hito_4_comparativa;

  // Chart Hito 3
  const ctx3 = document.getElementById('chart-comp-hito3').getContext('2d');
  if (chartCompHito3) chartCompHito3.destroy();

  chartCompHito3 = new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: ['Línea Verde (Hito 3)', 'Línea Azul (Challwa)'],
      datasets: [
        {
          label: 'Línea Base PRE (%)',
          data: [h3.verde.pre_pct, h3.azul.pre_pct],
          backgroundColor: 'rgba(148, 163, 184, 0.75)',
          borderColor: 'rgb(100, 116, 139)',
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.6
        },
        {
          label: 'Nivel Logrado POST (%)',
          data: [h3.verde.post_pct, h3.azul.post_pct],
          backgroundColor: ['rgba(5, 150, 105, 0.85)', 'rgba(2, 132, 199, 0.85)'],
          borderColor: ['rgb(4, 120, 87)', 'rgb(3, 105, 161)'],
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } },
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              const idx = items[0].dataIndex;
              if (idx === 0) {
                return [`Δ Avance: +${h3.verde.delta_pct}%`, `Ganancia Hake (g): ${h3.verde.hake_g}`, `Muestra: N=${h3.verde.n_pares} pares`];
              } else {
                return [`Δ Avance: +${h3.azul.delta_pct}%`, `Ganancia Hake (g): ${h3.azul.hake_g}`, `Muestra: N=${h3.azul.n_pares} pares`];
              }
            },
            label: (item) => `${item.dataset.label}: ${item.raw}%`
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20, callback: (v) => `${v}%` },
          grid: { color: '#f1f5f9' }
        },
        x: { grid: { display: false } }
      }
    }
  });

  // Chart Hito 4
  const ctx4 = document.getElementById('chart-comp-hito4').getContext('2d');
  if (chartCompHito4) chartCompHito4.destroy();

  chartCompHito4 = new Chart(ctx4, {
    type: 'bar',
    data: {
      labels: ['Línea Verde (Hito 4)', 'Línea Azul (Desierto Azul)'],
      datasets: [
        {
          label: 'Línea Base PRE (%)',
          data: [h4.verde.pre_pct, h4.azul.pre_pct],
          backgroundColor: 'rgba(148, 163, 184, 0.75)',
          borderColor: 'rgb(100, 116, 139)',
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.6
        },
        {
          label: 'Nivel Logrado POST (%)',
          data: [h4.verde.post_pct, h4.azul.post_pct],
          backgroundColor: ['rgba(5, 150, 105, 0.85)', 'rgba(2, 132, 199, 0.85)'],
          borderColor: ['rgb(4, 120, 87)', 'rgb(3, 105, 161)'],
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } },
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              const idx = items[0].dataIndex;
              if (idx === 0) {
                return [`Δ Avance: +${h4.verde.delta_pct}%`, `Ganancia Hake (g): ${h4.verde.hake_g}`, `Muestra: N=${h4.verde.n_pares} pares`];
              } else {
                return [`Δ Avance: +${h4.azul.delta_pct}%`, `Ganancia Hake (g): ${h4.azul.hake_g}`, `Muestra: N=${h4.azul.n_pares} pares`];
              }
            },
            label: (item) => `${item.dataset.label}: ${item.raw}%`
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20, callback: (v) => `${v}%` },
          grid: { color: '#f1f5f9' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}
