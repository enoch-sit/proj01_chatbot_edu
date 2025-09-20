# Complete Guide: Setting Up Flowise with PostgreSQL, Authentication, and Subdirectory Access

## Overview

This guide will help you deploy Flowise at `https://yourdomain.com/flowise2025` with:

- PostgreSQL database with Record Manager support
- Authentication enabled
- SSL/HTTPS support
- Proper reverse proxy configuration

## Prerequisites

- Docker and Docker Compose installed
- A domain name pointing to your server
- SSL certificates (Let's Encrypt recommended)
- Basic knowledge of Linux/Ubuntu

## Step 1: Create Project Directory Structure

```bash
# Create project directory
mkdir ~/flowise-production
cd ~/flowise-production

# Create necessary subdirectories
mkdir -p nginx/conf.d
mkdir -p init-db
mkdir -p ssl/certs
```

## Step 2: Create Docker Compose Configuration

```yaml name=docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: flowise-postgres
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d
    networks:
      - flowise-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  flowise:
    image: flowiseai/flowise:latest
    container_name: flowise
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      # Database configuration
      DATABASE_TYPE: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: ${POSTGRES_USER}
      DATABASE_PASSWORD: ${POSTGRES_PASSWORD}
      DATABASE_NAME: ${POSTGRES_DB}
      
      # Authentication
      FLOWISE_USERNAME: ${FLOWISE_USERNAME}
      FLOWISE_PASSWORD: ${FLOWISE_PASSWORD}
      
      # Security
      FLOWISE_SECRETKEY_OVERWRITE: ${FLOWISE_SECRETKEY_OVERWRITE}
      
      # Server configuration
      PORT: 3000
      FLOWISE_FILE_SIZE_LIMIT: 50mb
    volumes:
      - flowise_data:/root/.flowise
    networks:
      - flowise-network
    command: /bin/sh -c "sleep 3; flowise start"

  nginx:
    image: nginx:alpine
    container_name: flowise-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./ssl/certs:/etc/ssl/certs
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - flowise
    networks:
      - flowise-network

networks:
  flowise-network:
    driver: bridge

volumes:
  postgres_data:
  flowise_data:
```

## Step 3: Create Environment Configuration

```bash name=.env
# Database Configuration
POSTGRES_DB=flowise_production
POSTGRES_USER=flowise_admin
POSTGRES_PASSWORD=SuperSecurePassword123!

# Flowise Authentication
FLOWISE_USERNAME=admin
FLOWISE_PASSWORD=FlowiseAdmin2025!

# Encryption key for credentials (generate a random string)
FLOWISE_SECRETKEY_OVERWRITE=your-very-long-random-secret-key-here-change-this
```

## Step 4: Create Database Initialization Script

```sql name=init-db/01-init-record-manager.sql
-- Create the record manager table for upsert operations
CREATE TABLE IF NOT EXISTS record_manager (
    id SERIAL PRIMARY KEY,
    namespace VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    group_id VARCHAR(255),
    UNIQUE(namespace, key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_record_manager_namespace ON record_manager(namespace);
CREATE INDEX IF NOT EXISTS idx_record_manager_key ON record_manager(key);
CREATE INDEX IF NOT EXISTS idx_record_manager_group_id ON record_manager(group_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_record_manager_updated_at 
    BEFORE UPDATE ON record_manager 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON TABLE record_manager TO flowise_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO flowise_admin;
```

## Step 5: Create Nginx Configuration

```nginx name=nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Increase buffer sizes for Flowise
    client_max_body_size 50M;
    client_body_buffer_size 50M;
    
    include /etc/nginx/conf.d/*.conf;
}
```

```nginx name=nginx/conf.d/flowise.conf
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Flowise location with subdirectory
    location /flowise2025/ {
        proxy_pass http://flowise:3000/;
        proxy_http_version 1.1;
        
        # Headers for proper proxying
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Prefix /flowise2025;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # API specific location
    location /flowise2025/api/ {
        proxy_pass http://flowise:3000/api/;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Larger timeouts for API calls
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }
    
    # Socket.IO specific handling
    location /flowise2025/socket.io/ {
        proxy_pass http://flowise:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Step 6: SSL Certificate Setup

```bash
# Using Let's Encrypt (recommended)
# First, install certbot
sudo apt update
sudo apt install certbot

# Generate certificates (run this before starting Docker)
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to your project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/certs/
sudo chown -R $USER:$USER ./ssl/certs/
```

## Step 7: Security Script

```bash name=secure-setup.sh
#!/bin/bash

# Generate secure passwords
echo "Generating secure passwords..."

# Generate random password for PostgreSQL
POSTGRES_PASS=$(openssl rand -base64 32)
echo "PostgreSQL Password: $POSTGRES_PASS"

# Generate random password for Flowise
FLOWISE_PASS=$(openssl rand -base64 20)
echo "Flowise Password: $FLOWISE_PASS"

# Generate secret key
SECRET_KEY=$(openssl rand -hex 32)
echo "Secret Key: $SECRET_KEY"

# Update .env file
cat > .env << EOF
# Database Configuration
POSTGRES_DB=flowise_production
POSTGRES_USER=flowise_admin
POSTGRES_PASSWORD=$POSTGRES_PASS

# Flowise Authentication
FLOWISE_USERNAME=admin
FLOWISE_PASSWORD=$FLOWISE_PASS

# Encryption key for credentials
FLOWISE_SECRETKEY_OVERWRITE=$SECRET_KEY
EOF

echo "Passwords saved to .env file"
echo "IMPORTANT: Save these passwords in a secure location!"

# Set proper permissions
chmod 600 .env
```

## Step 8: Deployment Commands

```bash name=deploy.sh
#!/bin/bash

# Make scripts executable
chmod +x secure-setup.sh deploy.sh

# Generate secure passwords
./secure-setup.sh

# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 9: Backup Script

```bash name=backup.sh
#!/bin/bash

# Backup directory
BACKUP_DIR="/home/$USER/flowise-backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U flowise_admin flowise_production > $BACKUP_DIR/flowise_db_$DATE.sql

# Backup Flowise data
docker run --rm -v flowise-production_flowise_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/flowise_data_$DATE.tar.gz -C /data .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
```

## Step 10: Monitoring and Maintenance

```bash name=monitor.sh
#!/bin/bash

# Check container status
echo "=== Container Status ==="
docker-compose ps

# Check disk usage
echo -e "\n=== Disk Usage ==="
docker system df

# Check logs for errors
echo -e "\n=== Recent Errors ==="
docker-compose logs --tail=50 | grep -i error

# Database connection test
echo -e "\n=== Database Status ==="
docker-compose exec postgres pg_isready -U flowise_admin

# Check Flowise health
echo -e "\n=== Flowise Health ==="
curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/flowise2025/
```

## Step 11: Setup Cron Jobs

```bash
# Add to crontab
crontab -e

# Add these lines:
# Daily backup at 2 AM
0 2 * * * /home/yourusername/flowise-production/backup.sh >> /var/log/flowise-backup.log 2>&1

# SSL renewal check weekly
0 3 * * 0 certbot renew --quiet && docker-compose restart nginx
```

## Final Steps

1. **Update domain**: Replace `yourdomain.com` with your actual domain
2. **Run deployment**:

   ```bash
   cd ~/flowise-production
   chmod +x *.sh
   ./deploy.sh
   ```

3. **Access Flowise**: `https://yourdomain.com/flowise2025`
4. **Login**: Use the credentials from `.env`

## Troubleshooting

```bash
# Check logs
docker-compose logs -f flowise

# Restart services
docker-compose restart

# Database issues
docker-compose exec postgres psql -U flowise_admin -d flowise_production

# Reset everything
docker-compose down -v
./deploy.sh
```

## Security Checklist

- [ ] Changed all default passwords
- [ ] SSL certificates installed
- [ ] Firewall configured (ports 80, 443 only)
- [ ] Regular backups scheduled
- [ ] Monitoring in place
- [ ] .env file permissions set to 600

This complete setup provides a production-ready Flowise installation with PostgreSQL, authentication, SSL, and proper backup strategies!
