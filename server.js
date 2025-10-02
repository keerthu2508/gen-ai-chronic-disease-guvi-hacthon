
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: read/write data file
function readData(){
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch(e) {
    return { patients: [], metrics: { labels: [], values: [] }, appointments: [] };
  }
}
function writeData(data){
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API endpoints
app.get('/api/patients', (req, res) => {
  const data = readData();
  res.json(data.patients || []);
});

app.post('/api/patients', (req, res) => {
  const data = readData();
  const patient = req.body;
  // basic validation
  if(!patient || !patient.name) return res.status(400).json({error:'name required'});
  patient.id = Date.now();
  data.patients.push(patient);
  writeData(data);
  res.json(patient);
});

app.get('/api/metrics', (req, res) => {
  const data = readData();
  res.json(data.metrics || { labels: [], values: [] });
});

app.post('/api/metrics', (req, res) => {
  const data = readData();
  const metrics = req.body;
  if(!metrics || !Array.isArray(metrics.labels) || !Array.isArray(metrics.values)) {
    return res.status(400).json({error:'metrics require labels and values arrays'});
  }
  data.metrics = metrics;
  writeData(data);
  res.json(data.metrics);
});

app.get('/api/appointments', (req, res) => {
  const data = readData();
  res.json(data.appointments || []);
});

// fallback to index.html for SPA behaviour (optional)
app.get('*', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
