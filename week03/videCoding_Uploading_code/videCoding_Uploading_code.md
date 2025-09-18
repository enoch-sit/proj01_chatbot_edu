# Guide to Transferring Files to an Ubuntu Server Using SSH

Yes, it's absolutely possible (and recommended) to use SSH for secure file transfers to your Ubuntu server. The most common methods are **SCP (Secure Copy)** for command-line transfers or **SFTP (SSH File Transfer Protocol)** for GUI-based tools. These use your existing SSH credentials (username, password, or key) and encrypt the transfer.

This guide assumes:

- You have SSH access to the server (e.g., `ssh username@server-ip` or `ssh username@project-1-12.eduhk.hk`).
- Server details: Username `proj12`, IP `project-1-12.eduhk.hk`, domain `project-1-12.eduhk.hk` (from your context; replace with yours).
- Target on server: Upload to a temp folder like `/home/proj12/uploads/project`, then build, and copy to NGINX root `/var/www/html`.
- Project: Assuming a web app (e.g., Node.js with `npm build` for static files). Adjust build steps if it's different (e.g., Python, Java).

**Prerequisites**:

- SSH client installed (built-in on Mac/Linux; on Windows, use PowerShell or install OpenSSH via Settings > Apps > Optional Features).
- Server SSH enabled (usually is on Ubuntu; check with `sudo systemctl status ssh`).
- Firewall allows SSH (port 22): `sudo ufw allow ssh`.

## General Workflow

1. **Transfer files** from local to server (using SCP/SFTP).
2. **SSH into server** and build the project.
3. **Copy built files** to NGINX serve point (`/var/www/html`).
4. **Test**: Reload NGINX (`sudo systemctl reload nginx`) and visit `https://project-1-12.eduhk.hk`.

---

## Windows Guide

On Windows, use **WinSCP** (GUI, easy for beginners) or **PowerShell with SCP** (command-line).

### Option 1: WinSCP (Recommended for GUI)

1. **Download and Install**:
   - Go to [winscp.net](https://winscp.net) and download the installer. Run it (no admin needed).

2. **Connect to Server**:
   - Open WinSCP.
   - Protocol: SFTP.
   - Hostname: `project-1-12.eduhk.hk` (or `project-1-12.eduhk.hk`).
   - Port: 22.
   - Username: `proj12`.
   - Password: Your server password (or use private key if set up).
   - Click **Login**.

3. **Transfer Files** (Example Path: `C:\Users\user\Downloads\project-bolt-sb1-4ekquaf8\project`):
   - Left pane: Local files—navigate to `C:\Users\user\Downloads\project-bolt-sb1-4ekquaf8\project`.
   - Right pane: Remote files—navigate to `/home/proj12/uploads/` (create folder if needed: right-click > New > Directory).
   - Drag the entire `project` folder (or specific files like `src/`) from left to right.
   - Wait for transfer (progress bar shows status).

4. **Disconnect**: Close WinSCP.

### Option 2: PowerShell with SCP (Command-Line)

1. **Open PowerShell**: Search "PowerShell" in Start menu (run as admin if needed).

2. **Transfer Files**:

   ```powershell
   # First, create the remote upload directory via SSH
   ssh proj12@project-1-12.eduhk.hk "mkdir -p /home/proj12/uploads"
   
   # Then transfer the files
   scp -r "C:\Users\user\Downloads\project-bolt-sb1-4ekquaf8\project" proj12@project-1-12.eduhk.hk:/home/proj12/uploads/
   ```

   - `-r`: Recursive (for folders).
   - Enter password when prompted.
   - This uploads the entire `project` folder to `/home/proj12/uploads/project` on the server.

---

## Mac Guide

On Mac, use the built-in **Terminal with SCP** (simple command-line).

### Steps

1. **Open Terminal**: Spotlight search (Cmd + Space) > "Terminal".

2. **Transfer Files** (Example Path: `/Users/user/Downloads/my-project-folder`—replace with yours, e.g., download your project there first):

   ```bash
   # First, create the remote upload directory via SSH
   ssh proj12@project-1-12.eduhk.hk "mkdir -p /home/proj12/uploads"

   # Then transfer the folder
   scp -r "/Users/user/Downloads/my-project-folder" proj12@project-1-12.eduhk.hk:/home/proj12/uploads/
   ```

   - `-r`: Recursive for folders.
   - Enter password when prompted.
   - This uploads `my-project-folder` to `/home/proj12/uploads/my-project-folder` on the server.

3. **For GUI Alternative**: Use **Cyberduck** (free from [cyberduck.io](https://cyberduck.io)):
   - Install and open.
   - Connection: SFTP > Server: `project-1-12.eduhk.hk`, Username: `proj12`, Password: Your password.
   - Bookmark and connect.
   - Drag local folder (`/Users/user/Downloads/my-project-folder`) to remote `/home/proj12/uploads/`.

---

## On the Server: Build and Deploy to NGINX

1. **SSH into Server**:

   ```bash
   ssh proj12@project-1-12.eduhk.hk
   # Or ssh proj12@project-1-12.eduhk.hk
   ```

   - Enter password.

2. **Navigate and Build** (Assuming Node.js project; adjust for yours):

   ```bash
   cd /home/proj12/uploads/project  # Or my-project-folder
   ls  # Verify files uploaded (e.g., package.json, src/)

   # Install dependencies (if needed)
   sudo apt install nodejs npm  # If not installed
   npm install

   # Build (e.g., for React/Vue static site)
   npm run build  # Outputs to /build or dist/ folder
   ```

3. **Copy Built Files to NGINX Serve Point**:

   ```bash
   # Backup existing (optional)
   sudo cp -r /var/www/html /var/www/html.backup

   # Copy built files (adjust source path: build/ or dist/)
   sudo cp -r /home/proj12/uploads/project/build/* /var/www/html/

   # Set permissions
   sudo chown -R www-data:www-data /var/www/html
   sudo chmod -R 755 /var/www/html
   ```

4. **Reload NGINX and Test**:

   ```bash
   sudo systemctl reload nginx
   sudo nginx -t  # Check config
   ```

   - Exit SSH: `exit`.
   - Browser: Visit `https://project-1-12.eduhk.hk` (accept self-signed warning). Your built site should load.

---

## Troubleshooting

- **Permission Denied**: Use `sudo` for server copies; ensure SSH user has write access to upload folder (`chmod 755 /home/proj12/uploads`).
- **Connection Refused**: Check server IP/domain, SSH service (`sudo systemctl start ssh`), firewall (`sudo ufw status`).
- **Large Files Slow**: Use `rsync` instead of `scp` for resumable transfers: `rsync -avz -e ssh local-folder/ username@server:/remote/`.
- **Keys for Passwordless**: Generate SSH key (`ssh-keygen`), copy to server (`ssh-copy-id username@server`).
- **Build Errors**: Check logs (`npm run build --verbose`); ensure dependencies match.

This setup keeps your source code private on the server while serving only built files publicly. For automation, consider Git deployment or CI/CD tools like GitHub Actions. Let me know if your project uses a different build process!
