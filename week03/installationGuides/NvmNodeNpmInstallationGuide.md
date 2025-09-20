# Installing guide of nvm, Node.js, npm, and pnpm

**Key Updates (September 2025):**

- nvm: v0.40.3 (stable, no major changes).
- nvm-windows: v1.1.8.
- pnpm: Pin to `@latest-10` for Node v18+ compatibility.
- Node.js: Recommend v22.x LTS (active support until October 2025; maintenance until April 2027).

**General Tips:**

- Use a terminal: PowerShell/Command Prompt (Windows), Terminal (macOS), or GNOME Terminal (Ubuntu/Linux).
- Always verify commands with `--version` flags.
- If switching OSes often, consider a VM or cloud IDE like GitHub Codespaces.
- For all platforms: Avoid installing Node directly from nodejs.org—use nvm to prevent version conflicts.

## Prerequisites (Platform-Specific)

### Windows

- Windows 10/11 
- Uninstall any existing Node.js via Settings > Apps (search "Node.js" > Uninstall). Delete `%ProgramFiles%\nodejs`, `%AppData%\npm`, and `%AppData%\Roaming\npm` (back up `.npmrc` configs first).
- Optional: Install Windows Subsystem for Linux (WSL2) via Microsoft Store for a Unix-like experience—then follow Linux/Ubuntu steps inside WSL.
- Run terminals as Administrator if prompted (right-click > "Run as administrator").

### macOS

- macOS 11+ (Monterey or later; Sonoma/Ventura tested).
- Install Xcode Command Line Tools: Open Terminal and run `xcode-select --install` (essential for git detection; ~1-2 GB download).
- For Apple Silicon (M1/M2/M3+): Node v16+ has native arm64 support; older versions may need Rosetta 2 (`softwareupdate --install-rosetta --agree-to-license`).
- Disable SIP temporarily if issues arise (rare; boot into Recovery Mode > Terminal: `csrutil disable`—re-enable after).

### Linux (General)

- Any distro with bash/zsh (e.g., Fedora, Arch). Ensure `curl` or `wget` is installed.
- Install build essentials: Varies by distro (see Ubuntu below for Debian-based).

### Ubuntu (Specific)

- Ubuntu 20.04+ LTS (22.04/24.04 recommended).
- Update system: `sudo apt update && sudo apt upgrade -y`.
- Install core dependencies: `sudo apt install -y curl wget build-essential libssl-dev ca-certificates gnupg lsb-release`.
- For minimal installs (e.g., server): Add `software-properties-common`.

## Section 1: Installing nvm (Platform-Enriched)

### macOS

1. Open Terminal (Spotlight: Cmd+Space > "Terminal").
2. Run the install script:

   ```
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
   ```

   - If curl fails: `xcode-select --install` first.
   - Apple Silicon note: Script auto-detects; if errors, add `--shared-zlib` during Node install later.

3. Reload shell: Close/reopen Terminal, or `source ~/.zshrc` (default shell) / `source ~/.bash_profile`.
4. Verify: `command -v nvm` → outputs `nvm`.

**Visual Flow:**

```
Terminal → curl command → [Progress bar] → Reload shell → nvm check ✓
```

### Linux (General)

1. Open terminal (Ctrl+Alt+T on most distros).
2. Install script (same as macOS):

   ```
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
   ```

   - wget alternative: `wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash`.

3. Reload: `source ~/.bashrc` (bash) or `source ~/.zshrc` (zsh).
4. Verify: `command -v nvm`.

**Common Pitfall:** If "command not found," check shell init files (~/.profile) and restart terminal.

### Ubuntu (Specific)

Follow Linux steps, but add pre-install:

```
sudo apt install -y curl build-essential libssl-dev
```

- For Ubuntu 24.04+: If OpenSSL issues, run `sudo apt install -y pkg-config libssl-dev`.
- Post-install: Add `export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")` to `~/.bashrc` if sourcing fails.

### Windows (Native or WSL)

**Option 1: Native (nvm-windows)**

1. Download `nvm-setup.exe` (v1.1.8) from [releases](https://github.com/coreybutler/nvm-windows/releases/latest).
2. Run as Administrator: Double-click > Next > Install (default path: `C:\Users\<You>\AppData\Roaming\nvm`).
3. Restart terminal (PowerShell as Admin).
4. Verify: `nvm version` → `1.1.8`.

**Warnings:**

- Antivirus (e.g., McAfee/Windows Defender): May flag VBScript—add exception or use WSL.
- PATH conflicts: Ensure Node is uninstalled; edit `PATH` env var if needed (System Properties > Advanced > Environment Variables).

**Option 2: WSL (Recommended for Cross-Platform)**

1. Install WSL2: `wsl --install` in PowerShell (Admin), then restart.
2. Launch Ubuntu app from Start Menu.
3. Inside WSL: Follow Ubuntu steps above.

**Visual Flow:**

```
Download → Run as Admin → [Installer wizard] → Restart PowerShell → nvm version ✓
```

## Section 2: Installing Node.js and npm Using nvm

Unified across platforms (run in your terminal/WSL).

1. List LTS options: `nvm list-remote --lts` (shows v22.x as current).
2. Install latest LTS: `nvm install --lts` (downloads v22.x; ~50-100 MB).
   - Specific: `nvm install 22.9.0` (or latest patch).
   - Apple Silicon: Auto arm64; if fail, `nvm install 22 --reinstall-packages-from=node`.

3. Use it: `nvm use --lts`.
4. Set default: `nvm alias default --lts`.
5. Verify:

   ```
   node --version  # e.g., v22.9.0
   npm --version   # e.g., 10.8.3
   ```

**Platform Notes:**

- **macOS:** If Rosetta needed (rare): Prefix with `arch -x86_64 nvm use --lts`.
- **Ubuntu/Linux:** Slow download? Use proxy or VPN; ensure `libssl-dev` for builds.
- **Windows Native:** Run in Admin shell; if PATH issues, `nvm use` again.

**Pro Tip:** `nvm ls` lists installed; `nvm uninstall <version>` cleans up.

## Section 3: Optional - Installing pnpm

### npm Method (Recommended, All Platforms)

1. `npm install -g pnpm@latest-10`
   - Pins to v10+ for stability.

2. Verify: `pnpm --version` → e.g., 9.12.2 (wait, latest-10 targets pnpm 10.x? Tool says @latest-10 for pnpm package).

**Platform Notes:**

- **Windows:** If blocked, run PowerShell as Admin; disable Defender real-time scan temporarily.
- **macOS/Ubuntu:** No issues; add to PATH if needed (`echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> ~/.zshrc`).

### Standalone Script Alternative

- **macOS/Linux/Ubuntu:**

  ```
  curl -fsSL https://get.pnpm.io/install.sh | sh -
  ```

  - Ubuntu: Pre-install `sudo apt install -y curl`.
- **Windows (PowerShell):**

  ```
  iwr https://get.pnpm.io/install.ps1 -useb | iex
  ```

  - Avoid if antivirus flags; use npm instead.

3. Enable via Corepack (future-proof): `corepack enable pnpm`.
4. Verify as above.

**Usage:** `pnpm init` for new projects—saves disk space vs. npm.

## Advanced Tips by Platform

### Windows

- Integrate with VS Code: Install "Remote - WSL" extension for hybrid native/WSL dev.
- Chocolatey Alternative: `choco install nvm-windows` (if Chocolatey installed), but manual is safer.

### macOS

- Homebrew Fallback: `brew install nvm` (adds to `/opt/homebrew`), but nvm-sh is more flexible.
- iTerm2: Better than stock Terminal for tabbed sessions.

### Linux/Ubuntu

- Snap/Flatpak: Avoid for Node—nvm is better for versions.
- Server Setup: Use `nvm install --lts` in non-interactive mode: `nvm install --lts --no-progress`.

## Enriched Troubleshooting

| Issue | Platform | Cause | Solution |
|-------|----------|-------|----------|
| `nvm: command not found` | macOS/Linux/Ubuntu | Shell not sourced | `source ~/.zshrc` or restart. Ubuntu: Check `~/.profile`. |
| | Windows Native | Not in Admin shell | Run PowerShell as Admin. |
| Install script fails (git missing) | macOS | No Xcode tools | `xcode-select --install`. |
| Node install hangs/compiles slowly | Ubuntu/Linux | Missing deps | `sudo apt install build-essential python3`. Apple Silicon: Use `--shared-zlib`. |
| Permission denied on global npm | All | Prefix issues | `nvm use --delete-prefix`; or `npm config set prefix '~/.npm-global'`. |
| Antivirus blocks (e.g., Defender) | Windows | Script flags | Add folder to exclusions; prefer WSL. McAfee: Disable VBScript hooks. |
| PATH not updating after nvm use | Windows | Env var cache | Restart explorer.exe or log out/in. |
| pnpm not in PATH | Ubuntu | Local install | `export PATH="$HOME/.local/share/pnpm:$PATH"` in `~/.bashrc`. |
| Apple Silicon arch error | macOS | Rosetta missing | `softwareupdate --install-rosetta`. Use v22+. |
| WSL integration fails | Windows | Old WSL1 | `wsl --set-default-version 2`. |

**Still Stuck?**

- Logs: Check `~/.nvm/nvm.sh` or installer output.
- Communities: Stack Overflow (search "nvm [OS] [error]"), Reddit r/node, or official GitHub issues.
- Test Bed: Create a new user account to isolate.

You're now fully equipped! For a quick test: `nvm use --lts && npm create vite@latest my-app -- --template react`. Dive in, and ping me for project ideas. 🚀
