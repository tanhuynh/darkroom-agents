# Installing the prerequisites (one time)

Everything you need before the first session in `running-a-session.md`. About 30 minutes. Steps marked **[Mac]** or **[Windows]** differ; unmarked steps are the same on both.

> **Windows status:** the Windows steps are written from documentation and are **not yet verified** on a real machine. Please report anything that differs.

| You need | For |
|---|---|
| Adobe Photoshop 26.0+ (Creative Cloud) | the app being edited |
| Adobe **UXP Developer Tools** | loads the plugin that lets an AI agent talk to Photoshop |
| Git, Node.js | gets the code, runs the proxy between the agent and Photoshop |
| `uv` (Python tool) | runs the MCP servers and the measurement scripts |
| Claude Code (or Gemini CLI) | the agent |

## 1. Adobe account — no developer sign-up needed
You do **not** need to register at Adobe Developer Console / "Developer Studio". UXP Developer Tools installs from the Creative Cloud desktop app with your normal Adobe ID, and Developer Mode is a local switch. A Photoshop subscription (Creative Cloud) is enough. (Team/Enterprise accounts: UXP Developer Tools is not available as an Admin Console package, so a company-managed machine may block it — use a personal install.)

## 2. Photoshop 26.0 or newer
Creative Cloud app → Apps → Photoshop → Install / Update. Check **About Photoshop** (**[Mac]** Photoshop menu · **[Windows]** Help menu).

## 3. Enable Developer Mode in Photoshop
- **[Mac]** **Photoshop › Settings › Plugins**
- **[Windows]** **Edit › Preferences › Plugins**

Tick **Enable Developer Mode**, then restart Photoshop.

## 4. UXP Developer Tools *(adb-mcp connector — not needed if Photoshop gets a built-in MCP)*
1. Creative Cloud app → **All apps** → search **UXP Developer Tool** → **Install**.
2. Launch it. Accept the prompt to enable Developer Mode (it may ask for your Mac password / Windows administrator approval).
3. Leave it installed; adding the plugin is in `running-a-session.md` §0.

If the in-app toggle fails, see Adobe's [Set up developer tools](https://developer.adobe.com/uxp/guides/how-to/developer-tools/) guide for the manual method.

## 5. Command-line tools

### [Mac]
Open **Terminal** (Spotlight → "Terminal").
```bash
# Homebrew (skip if `brew --version` works) — follow the installer's final "Next steps" output
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install git node uv
```
Check:
```bash
git --version && node -v && uv --version
```

### [Windows] *(unverified)*
Open **PowerShell** (Start → "PowerShell"). Windows 10 (1809+) / 11 include `winget`.
```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id astral-sh.uv -e
```
**Close and reopen PowerShell**, then check:
```powershell
git --version; node -v; uv --version
```
If `winget` is missing, install "App Installer" from the Microsoft Store, or install Git, Node.js (LTS) and uv from their websites ([git-scm.com](https://git-scm.com), [nodejs.org](https://nodejs.org), [docs.astral.sh/uv](https://docs.astral.sh/uv/getting-started/installation/)).

Any recent Node LTS is fine.

## 6. Get the code
Both repos live side by side in a `dev` folder in your home directory.

### [Mac]
```bash
mkdir -p ~/dev && cd ~/dev
git clone https://github.com/tanhuynh/adb-mcp.git          # Photoshop bridge (fork of mikechambers/adb-mcp)
git clone https://github.com/tanhuynh/darkroom-agents.git   # this repo

cd ~/dev/adb-mcp/adb-proxy-socket && npm install     # the proxy
cd ~/dev/adb-mcp/mcp && uv sync                      # the MCP servers
cd ~/dev/darkroom-agents && uv venv && uv pip install -r requirements.txt   # measurement tools
```

### [Windows] *(unverified)*
```powershell
mkdir $HOME\dev -Force; cd $HOME\dev
git clone https://github.com/tanhuynh/adb-mcp.git
git clone https://github.com/tanhuynh/darkroom-agents.git

cd $HOME\dev\adb-mcp\adb-proxy-socket; npm install
cd $HOME\dev\adb-mcp\mcp; uv sync
cd $HOME\dev\darkroom-agents; uv venv; uv pip install -r requirements.txt
```
The repos' URLs are the author's; if a clone is refused, ask for access or use your own fork.

## 7. The agent
- **Claude Code**
  - **[Mac]** `brew install --cask claude-code` (or see the [Claude Code docs](https://docs.claude.com/en/docs/claude-code))
  - **[Windows]** `winget install Anthropic.ClaudeCode` *(unverified)* — or follow the Windows install in the Claude Code docs

  Then run `claude` once to sign in.
- **Gemini CLI** — **[Mac]** `brew install gemini-cli` · **[Windows]** `npm install -g @google/gemini-cli` *(unverified)*; then run `gemini` once to sign in.

Then create `.mcp.json` and continue with `running-a-session.md` §0 (add the plugin) and §1.

## Windows differences when running a session
`running-a-session.md` is written with Mac paths. On Windows:
- `~/dev/...` → `$HOME\dev\...` (e.g. `C:\Users\<you>\dev\adb-mcp`).
- Measurement tools: `.venv\Scripts\python tools\measure_all.py …` instead of `.venv/bin/python`.
- `open measure/<file>.png` → `start measure\<file>.png`.
- In `.mcp.json` use the full Windows path for `--directory`, with doubled backslashes or forward slashes (`C:/Users/<you>/dev/adb-mcp/mcp`).
- Photoshop saves under a drive letter instead of `/Volumes/…`; tell the agent the real path when it asks.

## Troubleshooting
| Symptom | Fix |
|---|---|
| UXP Developer Tool not in the Creative Cloud list | Sign in with a personal Adobe ID, update the Creative Cloud app; managed (Enterprise) machines may hide it |
| UXP Developer Tools can't see Photoshop / "Load" greyed out | Developer Mode off in Photoshop (§3) — enable it and restart Photoshop |
| **[Mac]** `command not found: brew` after install | Run the two lines the Homebrew installer printed under "Next steps", then reopen Terminal |
| `command not found: node` / `uv` (or "not recognized" on Windows) | Reopen the terminal; if still missing, reinstall (`brew install node uv` / the `winget` lines) |
| **[Windows]** `npm`/`uv` scripts blocked ("running scripts is disabled") | PowerShell: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, reopen PowerShell |
