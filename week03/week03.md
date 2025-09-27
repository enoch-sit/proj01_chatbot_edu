# Tutorial Project Setup and chatbot backend

## Updated Step-by-Step Guide to Set Up Nginx with Self-Signed TLS on Ubuntu, Serving Multiple Chatbot Projects

This tutorial covers setting up Nginx to serve multiple chatbot projects with proper SSL configuration and reverse proxy setup.

## Production-Ready Multi-Project Nginx Configuration

The following configuration supports multiple chatbot projects running on different ports, with proper SSL termination and static file serving:

```nginx
server {
    listen 80;
    server_name project-1-xx;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name project-1-xx;
    ssl_certificate /etc/nginx/ssl/dept-wildcard.eduhk/fullchain.crt;
    ssl_certificate_key /etc/nginx/ssl/dept-wildcard.eduhk/dept-wildcard.eduhk.hk.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    ssl_trusted_certificate /etc/nginx/ssl/dept-wildcard.eduhk/fullchain.crt;

    # Added: Forward all requests starting with /api to port 3001 (no need to modify frontend code)
    # Uncomment if you need a global API proxy
    # location /api/ {
    #     proxy_pass http://127.0.0.1:3001/api/;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    # }

    # Default site root (customize if needed)
    root /var/www/html;
    index index.html index.htm;
    location / {
       try_files $uri $uri/ =404;
    }

    # Chatbot 01 - Configuration (Pure backend service, frontend provided by backend)
    location /chatbot01/ {
        proxy_pass http://127.0.0.1:3000/;  # Forward to local port 3000
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Handle access without trailing slash
    location = /chatbot01 {
        return 301 /chatbot01/;
    }

    # Chatbot 02 - Environment Variables Demo
    location /chatbot02/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Chatbot 03 - CORS Configuration Demo
    location /chatbot03/ {
        proxy_pass http://127.0.0.1:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Chatbot 04 - Minimal Configuration
    # 1. Frontend pages served directly by Nginx
    # Match access without trailing slash
    location = /chatbot04 {
        return 301 /chatbot04/;
    }

    # Match access with trailing slash
    location /chatbot04/ {
        alias /home/proj07/project-1-xx/chatbot_04_MVPPython/;
        index index.html;
        try_files $uri $uri/ /chatbot04/index.html;
    }

    # Chatbot 04 - Python FastAPI Demo
    location /chatbot04/chat/completions {
        proxy_pass http://127.0.0.1:8001/chat/completions;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        # Important for streaming responses
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
    }

    # Chatbot 05 - Full-Stack React TypeScript

    # Resolve resource path issue: redirect root directory /assets requests to chatbot05 assets directory
    rewrite ^/assets/(.*)$ /chatbot05/assets/$1 last;

    location /chatbot05/ {
        alias /var/www/html/chatbot05/;
        try_files $uri $uri/ /chatbot05/index.html;
        index index.html;
    }

    # Additional mapping for assets directory (ensure subdirectory files can be accessed)
    location /chatbot05/assets/ {
        alias /var/www/html/chatbot05/assets/;
    }

    # API routes for chatbot 05 backend
    location /api/v2/ {
        proxy_pass http://127.0.0.1:8002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        # Enable streaming
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
    }
}
```

## Configuration Explanation

### SSL Configuration

- Uses proper SSL protocols (TLSv1.2 and TLSv1.3)
- Implements SSL stapling for improved performance
- Includes strong cipher suites for security

### Project-Specific Configurations

1. **Chatbot 01** (Port 3000): Full-stack Node.js application
2. **Chatbot 02** (Port 3001): Environment variables demonstration
3. **Chatbot 03** (Port 3002): CORS configuration example
4. **Chatbot 04** (Port 8001): Python FastAPI with static file serving
5. **Chatbot 05** (Port 8002): React TypeScript frontend with Python backend

### Multi-Project Features

- **Automatic HTTPS redirect**: All HTTP traffic redirected to HTTPS
- **Trailing slash handling**: Proper URL normalization
- **Static file serving**: Direct serving of frontend assets
- **Streaming support**: Configured for real-time chat responses
- **Asset path resolution**: Handles React build asset paths correctly

## Implementation Guide

### Step 1: Prerequisites

For easy copying, here are the executable commands from this step wrapped in a single code block (copy and paste them into your terminal one by one, adjusting the subnet in the UFW commands as needed for your internal network range). The last point is a non-command note—ensure it's true for your setup before proceeding.

```bash
sudo apt update && sudo apt upgrade -y
sudo ufw allow from 10.0.0.0/8 to any port 80
sudo ufw allow from 10.0.0.0/8 to any port 443
sudo ufw reload
```

- Your domain resolves internally to the server's IP (via EduHK's internal DNS).

### Step 2: Install Nginx

1. Install Nginx:

   ```bash
   sudo apt install nginx
   ```

2. Verify it's running:

   ```bash
   sudo systemctl status nginx
   ```

   Press 'q' to exit. It should be active (running).

### Step 3: Prepare Project Directories

1. Create directory structure for multiple chatbots:

   ```bash
   sudo mkdir -p /var/www/html/chatbot05
   sudo mkdir -p /home/proj07/project-1-xx
   ```

2. Set proper permissions:

   ```bash
   sudo chown -R www-data:www-data /var/www/html
   sudo chmod -R 755 /var/www/html
   ```

### Step 4: Configure SSL Certificate

If using a wildcard certificate (production environment):

```bash
# Ensure certificate directory exists
sudo mkdir -p /etc/nginx/ssl/dept-wildcard.eduhk
```

For development with self-signed certificates:

```bash
sudo mkdir /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/selfsigned.key \
    -out /etc/nginx/ssl/selfsigned.crt \
    -subj "/CN=project-1-xx.eduhk.hk"
sudo chmod 600 /etc/nginx/ssl/selfsigned.*
```

### Step 5: Deploy Multi-Project Nginx Configuration

1. Create the configuration file:

   ```bash
   sudo nano /etc/nginx/sites-available/chatbot-projects
   ```

2. Copy the complete multi-project configuration from above into this file.

3. Enable the site:

   ```bash
   sudo ln -s /etc/nginx/sites-available/chatbot-projects /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # Remove default site
   ```

4. Test configuration:

   ```bash
   sudo nginx -t
   ```

5. Reload Nginx:

   ```bash
   sudo systemctl reload nginx
   ```

### Step 6: Deploy Individual Chatbot Projects

For each chatbot project, ensure the backend services are running on their respective ports:

- **Chatbot 01**: Node.js on port 3000
- **Chatbot 02**: Node.js on port 3001  
- **Chatbot 03**: Node.js on port 3002
- **Chatbot 04**: Python FastAPI on port 8001
- **Chatbot 05**: Python FastAPI on port 8002

Example for starting a Node.js project:

```bash
cd /path/to/chatbot_01_MVP
npm install
node server.js
```

Example for starting a Python project:

```bash
cd /path/to/chatbot_04_MVPPython
pip install -r requirements.txt
python main.py
```

   ```
   server {
       listen 80;
       server_name project-1-04.eduhk.hk;

       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl;
       server_name project-1-04.eduhk.hk;

       # Self-signed SSL setup
       ssl_certificate /etc/nginx/ssl/selfsigned.crt;
       ssl_certificate_key /etc/nginx/ssl/selfsigned.key;

       # Serve static frontend files
       root /var/www/frontend;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }

       # Optional: Access logging
       access_log /var/log/nginx/project.access.log;
### Step 7: Testing the Multi-Project Setup

1. **Test individual project access:**
   - `https://project-1-xx.eduhk.hk/chatbot01/` - Node.js full-stack app
   - `https://project-1-xx.eduhk.hk/chatbot02/` - Environment variables demo
   - `https://project-1-xx.eduhk.hk/chatbot03/` - CORS configuration demo
   - `https://project-1-xx.eduhk.hk/chatbot04/` - Python FastAPI with static files
   - `https://project-1-xx.eduhk.hk/chatbot05/` - React TypeScript frontend

2. **Check API endpoints:**
   - `https://project-1-xx.eduhk.hk/chatbot04/chat/completions` - FastAPI streaming endpoint
   - `https://project-1-xx.eduhk.hk/api/v2/` - Chatbot 05 backend API

3. **Monitor logs:**
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

### Troubleshooting

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| 502 Bad Gateway | Backend service not running | Check if the service is running on the correct port |
| 404 for static files | Incorrect alias path | Verify file paths in nginx config match actual directories |
| CORS errors | Missing CORS headers | Ensure backend services include proper CORS configuration |
| Streaming not working | Proxy buffering enabled | Verify `proxy_buffering off` is set for streaming endpoints |
| Assets not loading | Asset path issues | Check rewrite rules and asset directory mappings |

### Production Deployment Checklist

- [ ] All backend services are running as systemd services
- [ ] SSL certificates are properly configured and valid
- [ ] Firewall rules allow ports 80 and 443
- [ ] Log rotation is configured for nginx logs
- [ ] Backup procedures are in place for configuration files
- [ ] Monitoring is set up for all services

## Service Management

### Creating Systemd Services

For production deployment, create systemd service files for each chatbot:

```bash
# Example for chatbot 01
sudo nano /etc/systemd/system/chatbot01.service
```

```ini
[Unit]
Description=Chatbot 01 Node.js Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/proj07/project-1-xx/chatbot_01_MVP
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable chatbot01
sudo systemctl start chatbot01
```

## Reference

### Docker IP Configuration Repository

**Repository:** <https://github.com/enoch-sit/change-docker-default-ip/>

#### Description

This repository contains a comprehensive bash script that automates the process of Docker installation and network configuration on Ubuntu systems. The main purpose is to change Docker's default IP range from the standard `172.17.0.0/16` to a custom range of `10.20.0.0/24`.

#### Key Features

- **Automated Docker Installation**: Installs Docker via Snap package manager if not already present
- **Network Configuration**: Modifies Docker daemon configuration to use custom IP ranges
- **Backup & Safety**: Creates automatic backups of existing configurations before making changes
- **Verification System**: Includes built-in testing to verify the IP changes are working correctly
- **Error Handling**: Robust error handling with exit-on-error strategy
- **Cleanup Process**: Automatic cleanup of test containers and temporary files

#### Technical Details

- **Target IP Range**: Changes Docker bridge network from default to `10.20.0.0/24`
- **Bridge IP**: Sets Docker bridge IP to `10.20.0.1/24`
- **Configuration File**: Modifies `/var/snap/docker/current/config/daemon.json`
- **Verification**: Tests the configuration by creating a temporary container and checking its gateway

#### Use Cases

This script is particularly useful for:

- Development environments where specific IP ranges are required
- Avoiding IP conflicts with existing network infrastructure
- Educational purposes for learning Docker network configuration
- DevOps workflows requiring standardized Docker networking

#### Usage

Run the script with sudo privileges:

```bash
sudo ./script.sh
```

The script handles the entire process automatically, from installation to verification, making it ideal for setting up consistent Docker environments across multiple systems.
