# 🚀 Quick Start with PM2

## Configure .env File First
Before deploying, copy and edit your environment file:

```bash
copy .env.example .env
```

Edit `.env` with your FlowiseAI details:
```bash
VITE_FLOWISE_BASE_URL=https://your-flowise-instance.com
VITE_FLOWISE_CHATFLOW_ID=your-chatflow-id
VITE_FLOWISE_API_KEY=your-api-key
VITE_BASE_PATH=/projectui
VITE_PORT=3002
```

## One-Command Deployment
```bash
# Install PM2 globally (first time only)
npm install -g pm2

# Deploy and start
deploy.bat
```

## Or Manual Steps
```bash
# 1. Install dependencies
npm install

# 2. Build the app
npm run build

# 3. Start with PM2
npm run pm2:start
```

## Management Commands
```bash
# Use the interactive manager
pm2-manager.bat

# Or use npm scripts
npm run pm2:status    # Check status
npm run pm2:logs      # View logs
npm run pm2:restart   # Restart app
npm run pm2:stop      # Stop app
```

## Access Your App
- **URL**: <http://localhost:3002/projectui/>
- **Monitor**: `pm2 monit`
- **Logs**: `pm2 logs flowise-frontend`

## Auto-Start on Boot
```bash
pm2 startup
pm2 save
```

That's it! Your FlowiseAI frontend is now running with PM2! 🎉