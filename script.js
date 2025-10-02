
let chart = null;

async function fetchPatients(){
  const res = await fetch('/api/patients');
  const data = await res.json();
  const tbody = document.querySelector('#patientsTable tbody');
  tbody.innerHTML = '';
  data.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.name}</td><td>${p.age || ''}</td><td>${p.condition || ''}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('totalPatients').innerText = data.length;
}

async function fetchMetrics(){
  const res = await fetch('/api/metrics');
  const metrics = await res.json();
  const ctx = document.getElementById('lineChart').getContext('2d');
  const cfg = {
    type: 'line',
    data: {
      labels: metrics.labels || [],
      datasets: [{ label: 'Health Metric', data: metrics.values || [], fill:false, tension:0.4, borderWidth:3, pointRadius:4 }]
    },
    options: { plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
  };
  if(chart) chart.destroy();
  chart = new Chart(ctx, cfg);
}

async function addPatient(name, age, condition){
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({name, age, condition})
  });
  if(res.ok) {
    await fetchPatients();
    alert('Patient added (saved to data.json).');
  } else {
    const err = await res.json();
    alert('Error: ' + (err.error || 'unknown'));
  }
}

async function updateMetrics(labelsArr, valuesArr){
  const res = await fetch('/api/metrics', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ labels: labelsArr, values: valuesArr })
  });
  if(res.ok){
    await fetchMetrics();
    alert('Metrics updated (saved to data.json).');
  } else {
    alert('Failed to update metrics');
  }
}

document.addEventListener('DOMContentLoaded', function(){
  fetchPatients();
  fetchMetrics();

  document.getElementById('btnAdd').addEventListener('click', function(){
    const name = document.getElementById('inpName').value.trim();
    const age = parseInt(document.getElementById('inpAge').value || '0');
    const cond = document.getElementById('inpCond').value.trim();
    if(!name){ alert('Enter name'); return; }
    addPatient(name, age, cond);
    document.getElementById('inpName').value=''; document.getElementById('inpAge').value=''; document.getElementById('inpCond').value='';
  });

  document.getElementById('btnMetrics').addEventListener('click', function(){
    const labels = document.getElementById('metricsLabels').value.split(',').map(s=>s.trim()).filter(Boolean);
    const values = document.getElementById('metricsValues').value.split(',').map(s=>parseFloat(s.trim())).filter(v=>!isNaN(v));
    if(labels.length !== values.length){ alert('Labels and values count must match'); return; }
    updateMetrics(labels, values);
    document.getElementById('metricsLabels').value=''; document.getElementById('metricsValues').value='';
  });
});
