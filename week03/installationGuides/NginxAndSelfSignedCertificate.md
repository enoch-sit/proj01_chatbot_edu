# Complete Guide to Installing NGINX, Configuring Multi-Project Setup with SSL Certificate on Ubuntu

Installation Guide for hosting multiple chatbot projects on a server like `project-1-XX.eduhk.hk`.

## Multi-Project Architecture Overview

This guide covers setting up Nginx to serve multiple chatbot projects simultaneously:

- **Chatbot 01**: Node.js full-stack application (Port 3000)
- **Chatbot 02**: Environment variables demo (Port 3001)  
- **Chatbot 03**: CORS configuration demo (Port 3002)
- **Chatbot 04**: Python FastAPI with static files (Port 8001)
- **Chatbot 05**: React TypeScript + Python backend (Port 8002)

Each project is accessible via: `https://project-1-XX.eduhk.hk/chatbotXX/`

## Basic Linux Command Line

Before starting with NGINX installation, here are essential Linux commands you'll need:

### Navigation and File Operations

- **Show current directory**: `pwd` (print working directory)
- **List files and folders**: `ls` (basic) or `ls -la` (detailed with hidden files)
- **Change directory**: `cd /path/to/directory` or `cd ~` (home directory)
- **Create directory**: `mkdir directory_name`
- **Remove files**: `rm filename` or `rm -rf directory_name` (recursive/force)
- **Copy files**: `cp source destination`
- **Move/rename**: `mv old_name new_name`

### File Content Operations

- **View file content**: `cat filename` (entire file) or `less filename` (paginated)
- **Edit files**: `nano filename` (beginner-friendly) or `vim filename` (advanced)
- **Create/edit file**: `touch filename` (create empty) or `echo "content" > filename`
- **Search in files**: `grep "search_term" filename`

### System and Process Management

- **Check running processes**: `ps aux` or `top` (interactive)
- **Kill process**: `kill process_id` or `killall process_name`
- **Check disk usage**: `df -h` (disk space) or `du -sh directory` (directory size)
- **Check system info**: `uname -a` (system info) or `whoami` (current user)

### Permissions and Ownership

- **Change permissions**: `chmod 755 filename` (read/write/execute permissions)
- **Change ownership**: `chown user:group filename`
- **Run as administrator**: `sudo command` (requires admin privileges)

### Network and System Status

- **Check network**: `ping google.com` or `wget http://example.com`
- **Check listening ports**: `netstat -tuln` or `ss -tuln`
- **Check system services**: `systemctl status service_name`

### Tips for Beginners

- Use **Tab** to auto-complete commands and file names
- Use **Up/Down arrows** to navigate command history
- Use `Ctrl + C` to cancel/interrupt running commands
- Use `man command_name` to view manual/help for any command
- Always be careful with `rm` and `sudo` commands

## Using Nano Text Editor

`nano` is a simple terminal-based editor used for editing NGINX configs and files. Key shortcuts (especially for the ones mentioned):

- **Open a file**: `sudo nano /path/to/file` (e.g., `sudo nano /etc/nginx/sites-available/default`).
- **Remove all lines (clear content)**: Press `Ctrl + K` repeatedly to cut (delete) lines one by one, or hold it to clear faster.
- **Paste content**: Right-click in the terminal to paste (or use `Ctrl + U` to uncut/paste previously cut text).
- **Save and exit**: Press `Ctrl + X`, then `Y` (yes) to confirm saving changes.
- **Other useful shortcuts**:
  - `Ctrl + O`: Save without exiting.
  - `Ctrl + W`: Search.
  - `Ctrl + G`: View all shortcuts.

Always test configs after editing (e.g., `sudo nginx -t`).

## Part 1: Installing NGINX

### Step 1: Update Package Index
```bash
sudo apt update
```

### Step 2: Install NGINX
```bash
sudo apt install nginx
```

### Step 3: Verify and Start NGINX
```bash
sudo systemctl status nginx
sudo systemctl start nginx  # If not running
sudo systemctl enable nginx  # Start on boot
```

### Step 4: Test Basic Installation
Find your server IP:
```bash
ip addr show | grep inet  # Shows all IPs; look for e.g., 192.168.56.182 under ens33
# Or shorter: hostname -I
# Public IP (if needed): curl ifconfig.me
```

Visit `http://<your_ip>` (e.g., `http://192.168.56.182`) in a browser. You should see the NGINX welcome page.

## Part 2: Installing OpenSSL (for Certificates)
```bash
sudo apt install openssl
```

## Part 3: Generating a Self-Signed SSL Certificate

### Step 1: Create SSL Directory
```bash
sudo mkdir /etc/nginx/ssl
```

### Step 2: Generate Certificate
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt
```

During prompts (Distinguished Name fields):

- **Country Name (2 letter code)**: press Enter for defaults
- **State or Province Name (full name) [Some-State]**: `.`
- **Locality Name (e.g., city) []**: `.`
- **Organization Name (e.g., company) []**: `.`
- **Organizational Unit Name (e.g., section) []**: `.`
- **Common Name (e.g., server FQDN) []**: `project-1-12.eduhk.hk` (use your domain/FQDN; verify with `ping project-1-12.eduhk.hk`).
- **Email Address []**: `.`

This creates a 1-year valid, 2048-bit RSA self-signed cert. Secure files:
```bash
sudo chmod 600 /etc/nginx/ssl/nginx.key
sudo chmod 644 /etc/nginx/ssl/nginx.crt
```

## Part 4: Multi-Project NGINX Configuration

### Step 1: Edit Configuration for Multiple Projects

```bash
sudo nano /etc/nginx/sites-available/chatbot-projects
```

Use `Ctrl + K` to clear existing content if needed, paste the new config (right-click to paste), then `Ctrl + X` > `Y` to save/exit.

Replace with the complete multi-project configuration:

```nginx
server {
    listen 80;
    server_name project-1-XX.eduhk.hk;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name project-1-XX.eduhk.hk;

    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Default site root
    root /var/www/html;
    index index.html index.htm;
    location / {
       try_files $uri $uri/ =404;
    }

    # Chatbot 01 - Configuration (Pure backend service, frontend provided by backend)
    location /chatbot01/ {
        proxy_pass http://127.0.0.1:3000/;
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
    location = /chatbot04 {
        return 301 /chatbot04/;
    }

    location /chatbot04/ {
        alias /home/proj07/project-1-XX/chatbot_04_MVPPython/;
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

**Important**: Replace `project-1-XX.eduhk.hk` with your actual domain and adjust file paths as needed.

### Step 2: Enable Multi-Project Configuration

```bash
sudo ln -s /etc/nginx/sites-available/chatbot-projects /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### Step 2: Test and Reload
```bash
sudo nginx -t  # Check syntax
sudo systemctl reload nginx
```

### Step 3: Firewall (if using UFW)
```bash
sudo ufw allow 'Nginx Full'  # Allows 80 and 443
sudo ufw status
```

## Part 5: Creating Test Content

Default root: `/var/www/html` (not `/var/www/root`—that's non-standard).

```bash
ls -l /var/www/html  # Check contents
echo "<h1>Hello from project-1-12.eduhk.hk with HTTPS!</h1>" | sudo tee /var/www/html/index.html
sudo chown www-data:www-data /var/www/html/index.html
sudo systemctl reload nginx
```

## Part 6: Testing the Multi-Project Setup

### Step 1: Check All Project Ports

Install `netstat` if missing:

```bash
sudo apt install net-tools
```

Check that all required ports are listening:

```bash
sudo netstat -tuln | grep ':80\|:443\|:3000\|:3001\|:3002\|:8001\|:8002'
```

Expected output should show:

```text
tcp 0 0 0.0.0.0:80  0.0.0.0:* LISTEN
tcp 0 0 0.0.0.0:443 0.0.0.0:* LISTEN
tcp 0 0 127.0.0.1:3000 0.0.0.0:* LISTEN  # Chatbot 01
tcp 0 0 127.0.0.1:3001 0.0.0.0:* LISTEN  # Chatbot 02
tcp 0 0 127.0.0.1:3002 0.0.0.0:* LISTEN  # Chatbot 03
tcp 0 0 127.0.0.1:8001 0.0.0.0:* LISTEN  # Chatbot 04
tcp 0 0 127.0.0.1:8002 0.0.0.0:* LISTEN  # Chatbot 05
```

### Step 2: Test Individual Project Access

Test each project endpoint:

```bash
# Test main site
curl -k https://project-1-XX.eduhk.hk/

# Test chatbot projects
curl -k https://project-1-XX.eduhk.hk/chatbot01/
curl -k https://project-1-XX.eduhk.hk/chatbot02/
curl -k https://project-1-XX.eduhk.hk/chatbot03/
curl -k https://project-1-XX.eduhk.hk/chatbot04/
curl -k https://project-1-XX.eduhk.hk/chatbot05/

# Test API endpoints
curl -k https://project-1-XX.eduhk.hk/chatbot04/chat/completions
curl -k https://project-1-XX.eduhk.hk/api/v2/
```

### Step 3: Browser Testing

Visit each project in your browser:

- `https://project-1-XX.eduhk.hk/chatbot01/` - Node.js full-stack app
- `https://project-1-XX.eduhk.hk/chatbot02/` - Environment variables demo
- `https://project-1-XX.eduhk.hk/chatbot03/` - CORS configuration demo  
- `https://project-1-XX.eduhk.hk/chatbot04/` - Python FastAPI with static files
- `https://project-1-XX.eduhk.hk/chatbot05/` - React TypeScript frontend

Accept the "not private" warning for self-signed certificates.

### Step 4: Monitor Logs

Monitor access and error logs in separate terminal windows:

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## Part 7: Multi-Project Troubleshooting

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| `netstat: command not found` | Not installed | `sudo apt install net-tools` or use `ss`. |
| 502 Bad Gateway on /chatbotXX/ | Backend service not running | Check if service is running on correct port with `ps aux \| grep node` or `ps aux \| grep python`. |
| 404 for static files in chatbot04/05 | Incorrect file paths | Verify file paths exist: `ls -la /home/proj07/project-1-XX/chatbot_04_MVPPython/` |
| CORS errors | Missing CORS headers in backend | Ensure backend services include proper CORS configuration. |
| Assets not loading for chatbot05 | Asset path issues | Check rewrite rules and verify `/var/www/html/chatbot05/assets/` exists. |
| Streaming not working | Proxy buffering enabled | Verify `proxy_buffering off` is set for streaming endpoints. |
| Port already in use | Service conflict | Find conflicting service: `sudo lsof -i :PORT` and stop it. |

### Service Management Commands

Check if backend services are running:

```bash
# Check Node.js processes
ps aux | grep node

# Check Python processes  
ps aux | grep python

# Check specific ports
sudo lsof -i :3000  # Chatbot 01
sudo lsof -i :3001  # Chatbot 02
sudo lsof -i :3002  # Chatbot 03
sudo lsof -i :8001  # Chatbot 04
sudo lsof -i :8002  # Chatbot 05
```

### Logs for Debugging

```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log     # Nginx errors
sudo tail -f /var/log/nginx/access.log    # Access requests

# System logs for services
sudo journalctl -u nginx -f               # Nginx system logs
sudo journalctl -f                        # All system logs
```

## Part 8: Production Deployment Tips

### Security and Best Practices

- **Production Certificates**: Use Let's Encrypt or proper CA certificates instead of self-signed
- **Regular Updates**: Keep nginx and system packages updated: `sudo apt update && sudo apt upgrade`
- **Backup Configuration**: Regularly backup `/etc/nginx/` directory
- **Log Rotation**: Ensure proper log rotation is configured to prevent disk space issues
- **Firewall**: Configure UFW to only allow necessary ports from specific networks

### Service Management for Production

Create systemd service files for automatic startup:

```bash
# Example service file for chatbot01
sudo nano /etc/systemd/system/chatbot01.service
```

```ini
[Unit]
Description=Chatbot 01 Node.js Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/proj07/project-1-XX/chatbot_01_MVP
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable chatbot01
sudo systemctl start chatbot01
```

## Conclusion

This multi-project NGINX setup allows you to host multiple chatbot applications on a single server with proper SSL termination and reverse proxy configuration. Each project is accessible via its own URL path while sharing the same domain and SSL certificate.

Key benefits:

- **Scalability**: Easy to add new projects by adding location blocks
- **Security**: Single SSL certificate for all projects
- **Performance**: Nginx handles static files efficiently and proxies API requests
- **Maintenance**: Centralized configuration and logging

For production deployment, ensure all backend services are configured as systemd services for automatic startup and proper monitoring.