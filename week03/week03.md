# Tutorial Project Setup and chatbot backend

## Updated Step-by-Step Guide to Set Up Nginx with Self-Signed TLS on Ubuntu, Serving a Frontend (Internal Network, No Docker)

#### Step 1: Prerequisites

For easy copying, here are the executable commands from this step wrapped in a single code block (copy and paste them into your terminal one by one, adjusting the subnet in the UFW commands as needed for your internal network range). The last point is a non-command note—ensure it's true for your setup before proceeding.

```
sudo apt update && sudo apt upgrade -y
sudo ufw allow from 10.0.0.0/8 to any port 80
sudo ufw allow from 10.0.0.0/8 to any port 443
sudo ufw reload
```

- Your domain resolves internally to the server's IP (via EduHK's internal DNS).

#### Step 2: Install Nginx

1. Install Nginx:

   ```
   sudo apt install nginx
   ```

2. Verify it's running:

   ```
   sudo systemctl status nginx
   ```

   press 'q' to exit

   It should be active (running).

#### Step 3: Prepare Static Frontend Files

1. Create directory:

   ```
   sudo mkdir -p /var/www/frontend
   ```

2. Create index.html:

   ```
   echo '<html><body><h1>Welcome to My Frontend!</h1></body></html>' | sudo tee /var/www/frontend/index.html
   ```

3. Set permissions:

   ```
   sudo chown -R www-data:www-data /var/www/frontend
   sudo chmod -R 755 /var/www/frontend
   ```

#### Step 4: Generate Self-Signed Certificate

Use OpenSSL to create a self-signed cert (valid for 365 days; adjust as needed).

1. Create a directory for certs:

   ```
   sudo mkdir /etc/nginx/ssl
   ```

2. Generate the cert and key:

   ```
   sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/selfsigned.key -out /etc/nginx/ssl/selfsigned.crt -subj "/CN=project-1-04.eduhk.hk"
   ```

   - This creates `selfsigned.crt` and `selfsigned.key`. The `-subj` sets the Common Name to your domain.

3. Set permissions:

   ```
   sudo chmod 600 /etc/nginx/ssl/selfsigned.*
   ```

#### Step 5: Configure Nginx for Serving Frontend and Self-Signed TLS

Nginx uses config files in `/etc/nginx/sites-available/`.

1. Create a config file:

   ```
   sudo nano /etc/nginx/sites-available/project
   ```

2. Add this configuration (paste into the editor and save):

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
   }
   ```

   - This enables HTTPS on 443, redirects HTTP to HTTPS, and serves static files from `/var/www/frontend`.

3. Enable the site:

   ```
   sudo ln -s /etc/nginx/sites-available/project /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # Remove default site if present
   ```

4. Test config:

   ```
   sudo nginx -t
   ```

5. Reload Nginx:

   ```
   sudo systemctl reload nginx
   ```

#### Step 6: Trust the Self-Signed Certificate (For Browser Trust)

Nginx's self-signed cert isn't trusted by default, leading to browser warnings. To fix this, copy the cert to client devices and install it as a trusted root CA. This is a one-time step per device.

1. On the **server**, make the cert accessible:

   ```
   sudo cp /etc/nginx/ssl/selfsigned.crt /tmp/nginx-root.crt
   sudo chown $USER:$USER /tmp/nginx-root.crt
   ```

2. Transfer `nginx-root.crt` to clients (e.g., via SCP from client terminal):

   ```
   scp proj04@project-1-04.eduhk.hk:/tmp/nginx-root.crt ~/Downloads/
   ```

   - Replace `proj04` and hostname/IP as needed.

3. Install on clients (OS-specific):
   - **Ubuntu/Linux**:

     ```
     sudo cp ~/Downloads/nginx-root.crt /usr/local/share/ca-certificates/nginx-root.crt
     sudo update-ca-certificates
     ```

     Restart browser.
   - **Windows**: Double-click the file > Install Certificate > Local Machine > Next > Place in "Trusted Root Certification Authorities" > Finish. Restart browser.
   - **macOS**: Double-click file > Add to "System" keychain > Double-click cert > Trust > Always Trust. Restart browser.

#### Step 7: Test the Setup

1. From an internal client, visit <https://project-1-04.eduhk.hk/>: Should show your frontend index.html (after trusting cert).
2. Check Nginx logs if issues: `sudo tail -f /var/log/nginx/project.access.log` or `error.log`.
3. Locally on server: `curl -k https://localhost` (ignores verification for testing).

#### Troubleshooting

- Cert warnings: Ensure cert is trusted on clients; clear browser cache.
- Access issues: Confirm internal DNS and firewall allows 80/443.
- Renewal: Regenerate cert with OpenSSL when expired (repeat Step 4) and reload Nginx.
- If you need to add a reverse proxy later (e.g., to a backend on localhost:8080), edit the config to add a `location /api/ { proxy_pass http://localhost:8080/; ... }` block.

This Nginx setup is straightforward and avoids Caddy's complexities. If you run into errors or want to add back a backend, share details!

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
