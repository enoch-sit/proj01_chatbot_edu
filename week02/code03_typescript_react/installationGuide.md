# Installation Guide for NVM on Mac and Windows

This guide assumes you have absolutely no prerequisites installed and no prior experience with computers beyond basic usage like clicking icons or typing. I'll explain every baby step, including how to open necessary apps, what each term means, and why we're doing each step. Terms like "Terminal" (on Mac) or "Command Prompt" (on Windows) are command-line interfaces—think of them as text-based ways to give instructions to your computer, like typing commands instead of clicking buttons.

NVM (Node Version Manager) lets you install and switch between different versions of Node.js (a tool for running JavaScript code outside a browser). Node.js comes with npm (Node Package Manager), which helps install additional software packages for your projects. We'll also cover PNPM (an alternative to npm) and why it's useful in 2025.

If something goes wrong (e.g., an error message), search the exact error on Google or ask for help on forums like Stack Overflow. Always download from official sources to avoid malware.

## Installing NVM on macOS

macOS is the operating system on Apple computers like MacBooks.

### Step 0: Basic Setup - Opening Terminal

Terminal is a built-in app on macOS for typing commands.

1. Click the magnifying glass icon in the top-right corner of your screen (this is Spotlight Search).
2. In the search bar that appears, type "Terminal" (without quotes).
3. Click on the Terminal app when it shows up (it looks like a black box with white text).
4. A window will open with a prompt like "yourusername@yourcomputer ~ %". This is where you'll type commands. Press Enter after each command to run it.

### Step 1: Installing Xcode Command Line Tools

These are free tools from Apple that include essentials like compilers (for building software) and curl/wget (for downloading files via commands). NVM's installation script uses these. Without them, commands might fail.

1. Open Terminal (as above).
2. Type the following exactly (copy-paste if possible): `xcode-select --install`
3. Press Enter.
4. A popup window will appear saying "The xcode-select command requires the command line developer tools. Would you like to install the tools now?"
5. Click "Install".
6. Another popup may ask you to agree to the license—click "Agree".
7. The download and installation will start (it might take 5-30 minutes depending on your internet). You'll see progress in the popup.
8. When done, the popup will close. Close and reopen Terminal to refresh.

**Verification**:

1. In Terminal, type `xcode-select -p` and press Enter.
2. It should output something like `/Library/Developer/CommandLineTools`. If it says "command not found", repeat the installation.
3. Optionally, type `gcc --version` (gcc is a compiler included)—it should show a version number.

If you get an error like "Can't install the software because it is not currently available from the Software Update server", go to Apple's developer site (developer.apple.com/download/all), sign in with your Apple ID (create one if needed), search for "Command Line Tools", download the latest .dmg file for your macOS version, double-click it, and follow the installer prompts.

### Step 2: Installing Git on macOS (Optional but Recommended)

Git is a tool for version control (tracking changes in code). It's not strictly required for the default NVM installation (which uses curl), but it's a prerequisite if you choose manual Git-based install for NVM, or for many developer tasks. It's also good for beginners to have.

There are multiple ways; we'll use the official installer for simplicity (no additional tools needed).

1. Open your web browser (like Safari or Chrome). If you don't have one, Safari is built-in—click its icon in the Dock (bottom bar).
2. Go to <https://git-scm.com/downloads> by typing the URL in the address bar and pressing Enter.
3. Under "macOS", click the link to download the latest installer (e.g., a .pkg file like git-2.42.0.pkg—version may vary in 2025).
4. The file will download to your Downloads folder (usually takes a minute).
5. Open Finder (blue face icon in Dock).
6. Click "Downloads" on the left sidebar.
7. Double-click the downloaded .pkg file.
8. A installer window opens—click "Continue".
9. Read and click "Continue" through the steps (agree to license if asked).
10. Click "Install" (enter your Mac password if prompted—it's the one you use to log in).
11. Wait for installation (1-5 minutes).
12. Click "Close" when done.

**Alternative Method Using Homebrew** (if you want a package manager—see PNPM section later for why Homebrew is useful):
First, install Homebrew (see PNPM section below for its guide). Then, in Terminal: `brew install git`

**Verification**:

1. Open Terminal.
2. Type `git --version` and press Enter.
3. It should output something like "git version 2.42.0". If "command not found", reinstall.

### Step 3: Installing NVM on macOS

Now we're ready for NVM.

1. Open Terminal.
2. Type one of these commands (curl is preferred if available):
   - `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash`
   - Or if curl not working: `wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash`
3. Press Enter. This downloads and runs a script that installs NVM to your home folder (~/.nvm).
4. The script may add lines to your profile file (like ~/.zshrc or ~/.bash_profile)—it will tell you.
5. Close Terminal completely (click red button or Command+Q).
6. Reopen Terminal.
7. Type `command -v nvm` and press Enter. It should output "nvm". If not, type `source ~/.zshrc` (or whatever profile it mentioned) and try again.

**Updating NVM**: Rerun the install command above.

If you prefer manual install without script:

1. In Terminal: `git clone https://github.com/nvm-sh/nvm.git ~/.nvm`
2. Then add source lines to your profile file manually (see NVM GitHub README for details).

## Installing NVM on Windows

Windows is the OS on most PCs.

### Step 0: Basic Setup - Opening Command Prompt or PowerShell as Administrator

Command Prompt/PowerShell are text-based command tools.

1. Click the Start button (Windows icon in bottom-left).
2. Type "PowerShell" (recommended over Command Prompt).
3. Right-click "Windows PowerShell" in the results.
4. Click "Run as administrator".
5. Click "Yes" on the popup asking for permission.
6. A blue window opens with a prompt like "PS C:\Windows\system32>". Type commands here and press Enter.

### Step 1: Uninstall Any Existing Node.js (to Avoid Conflicts)

If you've never installed Node.js, skip this. But check:

1. In PowerShell (admin), type `node -v` and Enter. If it shows a version, uninstall.
2. Open Start menu, type "Control Panel", open it.
3. Click "Programs" > "Programs and Features".
4. Search for "Node.js" in the list.
5. Right-click it, click "Uninstall", follow prompts.
6. Also delete folders: Type `%ProgramFiles%\nodejs` in File Explorer address bar, delete if exists. Same for `%AppData%\npm`.
7. Restart your computer (click Start > Power > Restart).

### Step 2: Installing Git on Windows (Optional)

Git isn't required for NVM on Windows (it uses an .exe installer), but it's useful for developers. If you need it:

1. Open your web browser (like Edge).
2. Go to <https://git-scm.com/downloads>.
3. Under "Windows", click the link for the latest setup.exe (e.g., Git-2.46.0-64-bit.exe).
4. Download to Downloads folder.
5. Open File Explorer (folder icon in taskbar).
6. Go to Downloads, double-click the .exe.
7. Click "Next" through the wizard (accept defaults unless you know better—e.g., choose editor like Notepad++ if asked).
8. Enter admin password if prompted.
9. Click "Finish".

**Verification**: In PowerShell, type `git --version`. Should show version.

### Step 3: Installing NVM on Windows

Uses a different tool called NVM for Windows.

1. Open browser.
2. Go to <https://github.com/coreybutler/nvm-windows/releases>
3. Find the latest release (e.g., 1.2.2 as of 2025).
4. Click "nvm-setup.exe" to download (or .zip if exe not there, then extract and run setup.exe).
5. Go to Downloads in File Explorer, double-click nvm-setup.exe.
6. Click "Yes" on permission popup.
7. Click "Next" through installer (accept defaults).
8. Click "Finish".
9. Restart PowerShell (close and reopen as admin).

**Verification**: Type `nvm` and Enter. It should show help text.

## Installing Node.js and npm (for Beginners on Both Mac and Windows)

npm comes with Node.js.

### On macOS

1. Open Terminal.
2. Type `nvm install node` (installs latest) or `nvm install lts` (stable Long-Term Support).
3. Type `nvm use node` to switch.
4. Verify: `node -v` and `npm -v`.

### On Windows

1. Open PowerShell as admin.
2. Type `nvm install latest` or `nvm install lts`.
3. Type `nvm use latest` (replace with version).
4. Verify: `node -v` and `npm -v`.

To switch versions: `nvm list`, then `nvm use <version>`.

## Installation Guide for PNPM

PNPM is an alternative package manager. Install after Node.js unless using standalone.

### Installing Prerequisites for Advanced Methods

#### Homebrew on macOS (for PNPM via brew)

1. Open Terminal.
2. Type `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
3. Press Enter. Script explains and pauses—press Enter to continue.
4. Enter Mac password when prompted.
5. Wait 5-15 minutes.
**Verification**: `brew --version`.

#### Winget on Windows (often pre-installed on Windows 10/11+)

If not:

1. Open Microsoft Store (Start > type "Store").
2. Search "App Installer" (from Microsoft).
3. Click "Get" or "Install".
**Verification**: In PowerShell, `winget --version`.

#### Scoop on Windows

1. Open PowerShell as admin.
2. Type `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` (allows scripts).
3. Type `irm get.scoop.sh | iex`
4. Press Enter, follow prompts.
**Verification**: `scoop --version`.

#### Chocolatey on Windows

1. Open PowerShell as admin.
2. Type `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))`
3. Press Enter, wait.
**Verification**: `choco --version`.

### PNPM Installation Methods

Use after Node.js, or standalone.

#### Using npm (Easy for Beginners)

1. Open Terminal/PowerShell.
2. Type `npm install -g pnpm@latest-10`

#### Standalone Script

- Mac: `curl -fsSL https://get.pnpm.io/install.sh | sh -`
- Windows: `Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression`

#### Corepack (Node.js 16.13+)

1. `corepack enable pnpm`
2. `corepack use pnpm@latest-10`

#### Homebrew (Mac): `brew install pnpm`

#### Winget (Win): `winget install -e --id pnpm.pnpm`

#### Scoop (Win): `scoop install nodejs-lts pnpm`

#### Chocolatey (Win): `choco install pnpm`

#### Volta (if installed): `volta install pnpm`

**Verification**: `pnpm -v`

## Why Use PNPM in 2025?

PNPM is efficient for disk space (shares dependencies via links), faster installs, and safer (prevents unintended dependency access). In 2025, with larger projects and tools like monorepos, it's popular for performance in CI/CD and ecosystems like React/Vue. It's npm-compatible.
