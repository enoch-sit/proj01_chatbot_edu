# PM2 Deployment Guide - FlowiseAI Frontend

## 🚀 Complete PM2 Setup Guide

### Prerequisites
- Node.js 18+ installed
- PM2 installed globally

### Step 0: Install Node.js with NVM (Ubuntu/Linux)

If you don't have Node.js installed, use NVM (Node Version Manager) for easy installation and management:

#### Simple Guide to Install NVM on Ubuntu

1. **Install NVM**:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
   ```

2. **Reload shell**:
   Close/reopen terminal or run `source ~/.bashrc` (or `~/.zshrc` if using zsh).

3. **Verify**:
   ```bash
   nvm --version  # Should show 0.40.3
   ```

4. **Install Node.js (includes npm)**:
   ```bash
   nvm install node  # Latest version
   ```
   Or for LTS: `nvm install 20`

5. **Use it**:
   ```bash
   nvm use 20
   node -v  # Verify
   npm -v
   ```

#### For Windows Users
Use Node.js installer from [nodejs.org](https://nodejs.org/) or install via:
- **Chocolatey**: `choco install nodejs`
- **Winget**: `winget install OpenJS.NodeJS`
- **NVM-Windows**: [github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows)

### Step 1: Install PM2 Globally
```bash
npm install -g pm2
```

### Step 1.5: Scan and Clean Existing PM2 Processes

Before deploying, it's important to check for existing PM2 processes that might conflict with your deployment.

#### Scan Current PM2 Usage
```bash
# Check all running PM2 processes
pm2 list

# Show detailed status with resource usage
pm2 status

# Monitor real-time resource usage
pm2 monit
```

#### Clean Up Existing Processes

**Option A: Stop All PM2 Processes (Nuclear Option)**
```bash
# Stop all PM2 processes
pm2 stop all

# Delete all PM2 processes
pm2 delete all

# Kill PM2 daemon and restart fresh
pm2 kill
```

**Option B: Selective Cleanup (Recommended)**
```bash
# List processes to see what's running
pm2 list

# Stop specific processes by name
pm2 stop process-name-here

# Delete specific processes by name
pm2 delete process-name-here

# Or stop/delete by ID
pm2 stop 0
pm2 delete 0
```

#### Check for Port Conflicts

```bash
# Linux/Mac: Check what's using port 3002
lsof -ti:3002

# Kill process using port 3002
lsof -ti:3002 | xargs kill -9
```

#### Clean PM2 Logs and Cache
```bash
# Clear all PM2 logs
pm2 flush

# Reset PM2 configuration
pm2 save --force
```

#### Verify Clean State
```bash
# Confirm no processes are running
pm2 list

# Should show "No processes"
# Now you're ready for fresh deployment
```

#### Emergency Reset (Complete PM2 Reset)
```bash
# If PM2 is acting strange, completely reset it
pm2 kill
pm2 resurrect
pm2 save

# Or remove PM2 data entirely (nuclear option)
# Windows: rmdir /s %USERPROFILE%\.pm2
# Linux/Mac: rm -rf ~/.pm2
```

### Step 2: Configure Environment Variables

Before deploying, you need to set up your `.env` file with your FlowiseAI configuration.

#### Option A: Copy from Example (Recommended)
```bash
# Copy the example file
cp .env.example .env

# Edit with nano
nano .env
```

**Nano Editor Tips:**
- Use arrow keys to navigate
- Edit the values after the `=` signs
- `Ctrl+O` to save (write out)
- `Ctrl+X` to exit
- `Ctrl+K` to cut a line
- `Ctrl+U` to paste a line

#### Option B: Create .env Manually
```bash
# Create and edit .env file with nano
nano .env
```

Then copy and paste this content into nano:

```bash
# FlowiseAI Configuration
VITE_FLOWISE_BASE_URL=https://your-flowise-instance.com
VITE_FLOWISE_CHATFLOW_ID=your-chatflow-id-here
VITE_FLOWISE_API_KEY=your-api-key-here

# Application Configuration  
VITE_BASE_PATH=/projectui
VITE_PORT=3002

# Optional Settings
VITE_APP_TITLE=FlowiseAI Chat
VITE_STREAMING_ENABLED=true
```

#### How to Get Your FlowiseAI Information:

**1. VITE_FLOWISE_BASE_URL:**
   - This is your FlowiseAI server URL
   - Example: `https://project-1-13.eduhk.hk`
   - Example: `https://your-domain.com`
   - Example: `http://localhost:3000` (for local FlowiseAI)

**2. VITE_FLOWISE_CHATFLOW_ID:**
   - Log into your FlowiseAI dashboard
   - Go to your chatflow
   - Copy the chatflow ID from the URL or settings
   - Example: `415615d3-ee34-4dac-be19-f8a20910f692`

**3. VITE_FLOWISE_API_KEY:**
   - In FlowiseAI dashboard, go to Settings → API Keys
   - Create a new API key or copy existing one
   - Example: `4jrOiUe8inxQu7JUIs8xdCUPw8X2yq78TstyyT0TOO8`
   - **Important**: Keep this secure and never commit to version control

**4. VITE_BASE_PATH:**
   - This is the URL path where your app will be served
   - Default: `/projectui`
   - Change if you want different URL: `/my-chat` → `http://localhost:3002/my-chat/`

#### Example Complete .env File:
```bash
# FlowiseAI Configuration
VITE_FLOWISE_BASE_URL=https://project-1-13.eduhk.hk
VITE_FLOWISE_CHATFLOW_ID=415615d3-ee34-4dac-be19-f8a20910f692
VITE_FLOWISE_API_KEY=4jrOiUe8inxQu7JUIs8xdCUPw8X2yq78TstyyT0TOO8

# Application Configuration
VITE_BASE_PATH=/projectui
VITE_PORT=3002

# Optional Settings
VITE_APP_TITLE=My AI Assistant
VITE_STREAMING_ENABLED=true
```

#### Security Notes:
- **Never commit .env to version control** (it's in .gitignore)
- Keep your API key secure
- Use different API keys for development/production
- Consider using environment-specific .env files for different deployments

#### Quick Edit Commands:
```bash
# Edit existing .env file
nano .env

# View .env file contents (read-only)
cat .env

# Backup .env file before editing
cp .env .env.backup

# Check if .env file exists
ls -la .env
```

**Advanced nano usage:**
```bash
# Open nano with line numbers
nano -c .env

# Search in nano: Ctrl+W
# Replace in nano: Ctrl+\
# Go to line: Ctrl+_ (then enter line number)
```

### Step 3: Create PM2 Ecosystem File
Create `ecosystem.config.cjs` in your project root (note the `.cjs` extension for compatibility with ES modules):

```javascript
module.exports = {
  apps: [{
    name: 'flowise-frontend',
    script: 'npm',
    args: 'run preview -- --host 0.0.0.0 --port 3002',
    cwd: '/path/to/your/project',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};
```

### Step 4: Deployment Commands

#### Quick Start (One-liner)
```bash
# Install, build, and start with PM2
npm install && npm run build && pm2 start ecosystem.config.cjs --env production
```

#### Step-by-step Deployment
```bash
# 1. Install dependencies
npm install

# 2. Build the application
npm run build

# 3. Create logs directory
mkdir logs

# 4. Start with PM2
pm2 start ecosystem.config.cjs --env production

# 5. Save PM2 configuration (auto-start on reboot)
pm2 save
pm2 startup
```

### Step 5: PM2 Management Commands

#### Application Control
```bash
# Start application
pm2 start flowise-frontend

# Stop application
pm2 stop flowise-frontend

# Restart application
pm2 restart flowise-frontend

# Reload application (zero downtime)
pm2 reload flowise-frontend

# Delete application from PM2
pm2 delete flowise-frontend
```

#### Monitoring
```bash
# View application status
pm2 status

# View logs (real-time)
pm2 logs flowise-frontend

# View logs (last 100 lines)
pm2 logs flowise-frontend --lines 100

# Monitor CPU/Memory usage
pm2 monit

# Web-based monitoring
pm2 web
```

#### Process Management
```bash
# List all processes
pm2 list

# Show detailed info about process
pm2 show flowise-frontend

# View process logs
pm2 logs

# Clear all logs
pm2 flush
```

### Step 6: Environment Configuration

Your `.env` file should contain:
```bash
VITE_FLOWISE_BASE_URL=https://project-1-13.eduhk.hk
VITE_FLOWISE_CHATFLOW_ID=415615d3-ee34-4dac-be19-f8a20910f692
VITE_FLOWISE_API_KEY=your-api-key
VITE_BASE_PATH=/projectui
VITE_PORT=3002
VITE_APP_TITLE=FlowiseAI Chat
VITE_STREAMING_ENABLED=true
```

### Step 7: Nginx Reverse Proxy (Optional)

If using nginx for reverse proxy:

```nginx
# /etc/nginx/sites-available/flowise-frontend
server {
    listen 80;
    server_name your-domain.com;

    location /projectui/ {
        proxy_pass http://localhost:3002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 8: Auto-Start on System Boot

```bash
# Generate startup script (run as root/administrator)
pm2 startup

# Save current PM2 processes
pm2 save
```

### Step 9: Health Monitoring

Create a simple health check endpoint in your Vite config or add monitoring:

```bash
# Check if service is running
curl http://localhost:3002/projectui/

# Or use PM2's built-in health check
pm2 ping flowise-frontend
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3002
lsof -ti:3002 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :3002   # Windows
```

#### PM2 Not Starting
```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs flowise-frontend

# Restart PM2 daemon
pm2 kill
pm2 start ecosystem.config.cjs
```

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean build
rm -rf dist
npm run build
```

### Performance Tuning

#### For High Traffic
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'flowise-frontend',
    script: 'npm',
    args: 'run preview -- --host 0.0.0.0 --port 3002',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    // ... other config
  }]
};
```

## 🎯 One-Command Deployment

Create `deploy.sh` (Linux/Mac) or `deploy.bat` (Windows):

### deploy.bat (Windows)
```batch
@echo off
echo 🚀 Deploying FlowiseAI Frontend...

echo 📦 Installing dependencies...
npm install

echo 🔨 Building application...
npm run build

echo 📁 Creating logs directory...
if not exist logs mkdir logs

echo 🎯 Starting with PM2...
pm2 start ecosystem.config.cjs --env production

echo 💾 Saving PM2 configuration...
pm2 save

echo ✅ Deployment complete!
echo 🌐 Access your app at: http://localhost:3002/projectui/
echo 📊 Monitor with: pm2 monit
echo 📋 View logs with: pm2 logs flowise-frontend

pause
```

### deploy.sh (Linux/Mac)
```bash
#!/bin/bash
echo "🚀 Deploying FlowiseAI Frontend..."

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

echo "📁 Creating logs directory..."
mkdir -p logs

echo "🎯 Starting with PM2..."
pm2 start ecosystem.config.js --env production

echo "💾 Saving PM2 configuration..."
pm2 save

echo "✅ Deployment complete!"
echo "🌐 Access your app at: http://localhost:3002/projectui/"
echo "📊 Monitor with: pm2 monit"
echo "📋 View logs with: pm2 logs flowise-frontend"
```

## 📋 Quick Reference Commands

```bash
# Deploy (first time)
npm install && npm run build && pm2 start ecosystem.config.cjs --env production && pm2 save

# Update (redeploy)
pm2 stop flowise-frontend && npm run build && pm2 restart flowise-frontend

# Monitor
pm2 monit

# Logs
pm2 logs flowise-frontend --lines 50

# Status
pm2 status

# Stop all
pm2 stop all

# Restart all
pm2 restart all
```

## 🎉 You're All Set!

Your FlowiseAI frontend will be running on `http://localhost:3002/projectui/` with PM2 managing the process automatically!