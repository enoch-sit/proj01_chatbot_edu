# Week 03 Quick Reference Guides

## Nginx Configuration Quick Commands

### Start/Stop/Reload Nginx
```bash
sudo systemctl start nginx     # Start nginx
sudo systemctl stop nginx      # Stop nginx
sudo systemctl reload nginx    # Reload configuration
sudo systemctl restart nginx   # Full restart
sudo systemctl status nginx    # Check status
```

### Configuration Testing
```bash
sudo nginx -t                  # Test configuration syntax
sudo nginx -T                  # Test and display configuration
```

### Log Monitoring
```bash
sudo tail -f /var/log/nginx/access.log    # Monitor access logs
sudo tail -f /var/log/nginx/error.log     # Monitor error logs
```

## Project Port Reference

| Project | Port | Type | Description |
|---------|------|------|-------------|
| Chatbot 01 | 3000 | Node.js | Full-stack application with frontend served by backend |
| Chatbot 02 | 3001 | Node.js | Environment variables demonstration |
| Chatbot 03 | 3002 | Node.js | CORS configuration example |
| Chatbot 04 | 8001 | Python FastAPI | Backend API with static frontend via Nginx |
| Chatbot 05 | 8002 | Python FastAPI | React TypeScript frontend + Python backend |

## Common Nginx Location Blocks

### Static File Serving
```nginx
location /static/ {
    alias /path/to/static/files/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### API Proxy with Streaming
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Enable streaming for real-time responses
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
}
```

### SPA (Single Page Application) Support
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## SSL/TLS Quick Reference

### Generate Self-Signed Certificate
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/selfsigned.key \
    -out /etc/nginx/ssl/selfsigned.crt \
    -subj "/CN=your-domain.eduhk.hk"
```

### Certificate File Permissions
```bash
sudo chmod 600 /etc/nginx/ssl/*.key    # Private key
sudo chmod 644 /etc/nginx/ssl/*.crt    # Certificate
```

## Troubleshooting Checklist

### 502 Bad Gateway
- [ ] Backend service is running on correct port
- [ ] Firewall allows the port
- [ ] No binding conflicts with other services

### 404 Not Found
- [ ] File paths exist and are accessible
- [ ] Nginx user (www-data) has read permissions
- [ ] Correct `alias` or `root` directive

### SSL/TLS Issues
- [ ] Certificate files exist and are readable
- [ ] Certificate matches the domain name
- [ ] SSL protocols and ciphers are correctly configured

### CORS Issues
- [ ] Backend includes proper CORS headers
- [ ] Preflight OPTIONS requests are handled
- [ ] Origin, methods, and headers are allowed

## Useful Commands

### Process Management
```bash
ps aux | grep nginx               # Find nginx processes
sudo lsof -i :80                 # Check what's using port 80
sudo netstat -tlnp | grep :443   # Check HTTPS port usage
```

### File Operations
```bash
sudo find /var/www -name "*.html" -type f    # Find HTML files
sudo chown -R www-data:www-data /var/www     # Fix ownership
sudo chmod -R 755 /var/www                  # Fix permissions
```

### Backup Configuration
```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
sudo tar -czf nginx-backup-$(date +%Y%m%d).tar.gz /etc/nginx/
```