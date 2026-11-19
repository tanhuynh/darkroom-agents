# Running an editing session

First time? Install Node, `uv`, UXP Developer Tools and the agent first: `docs/installing-prerequisites.md`.

## 0. One-time setup: UXP Developer Tools + the plugin *(adb-mcp connector setup — replaced if the Photoshop connector changes)*
1. **Photoshop 26.0 (2025) or newer.** In Photoshop: **Settings › Plugins › check "Enable Developer Mode"**, then restart Photoshop.
2. Install **UXP Developer Tools** from the Creative Cloud desktop app (All apps › search "UXP Developer Tool" › Install). Launch it and accept the prompt to enable developer mode.
3. In UXP Developer Tools: **File › Add Plugin…** → select `~/dev/adb-mcp/uxp/ps/manifest.json` (the fork's Photoshop plugin; not `pr`/`id`).
4. Click **Load** on the "Photoshop MCP Agent" row (Photoshop must be running). In Photoshop open **Plugins › Photoshop MCP Agent** and click **Connect**.
- The plugin stays listed in UXP Developer Tools, so steps 1–3 are done once. Photoshop does not remember the loaded plugin: **after every Photoshop restart, click Reload (or Load) again, then Connect** (see §1).
- Also needed once: Node.js (for the proxy) and `uv` (for the MCP servers, §2a).

## 1. Prepare Photoshop (every session, any agent) *(proxy + plugin steps are adb-mcp-specific)*
```bash
cd ~/dev/adb-mcp/adb-proxy-socket && node proxy.js
```
- Open Photoshop → UXP Developer Tools → Load/**Reload** "Photoshop MCP Agent" (first-time setup: §0) → **Plugins › Photoshop MCP Agent › Connect**.
- Open the image as a **raw Smart Object** (e.g. Lightroom Classic: Edit In › Open as Smart Object), make a **duplicate**, quit LrC.
- No Photoshop / Camera Raw dialogs open.

## 2a. Claude Code (terminal) — recommended for editing
One-time: create `.mcp.json` in the repo root (contents in `agents/claude/ADAPTER.md` §B / below) and `uv venv && uv pip install -r requirements.txt`.
```json
{ "mcpServers": {
    "photoshop":            { "command": "uv", "args": ["run", "--directory", "/Users/tanhuynh/dev/adb-mcp/mcp", "mcp", "run", "ps-mcp.py"] },
    "photoshop-batch-play": { "command": "uv", "args": ["run", "--directory", "/Users/tanhuynh/dev/adb-mcp/mcp", "mcp", "run", "ps-batch-play.py"] } } }
```
Each session (second Terminal tab):
```bash
cd ~/dev/darkroom-agents && claude
```
- First run: approve the project's MCP servers. Check with `/mcp` → `photoshop` and `photoshop-batch-play` connected.
- `CLAUDE.md` loads `WORKFLOW.md` + the Claude adapter automatically.
- Resume an interrupted session: `claude --continue`.

## 2b. Claude desktop chat (Photography project)
- Project instructions make Claude request access to `~/dev/darkroom-agents` and read `AGENTS.md`/`WORKFLOW.md` + the handoff — approve the folder prompt.
- Slower for editing (renders are copied to Claude's cloud workspace for measurement; you push git yourself), but images show inline and it has memory and web search. Better for planning and critiques.

## 2c. Gemini CLI
```bash
cd ~/dev/darkroom-agents && gemini
```
- `/memory show` must list `WORKFLOW.md` and `agents/gemini/ADAPTER.md` (`/memory refresh` after edits).

## 3. What to say
The workflow is already loaded, so short prompts work:
> New image is open in Photoshop. Run the workflow: classify it, white balance check, then crop recommendation. Stop before applying anything.

> Edit the active document. It's a wildlife shot (Amboseli elephant) — use the wildlife playbook. WB check and crop first.

The agent then follows `WORKFLOW.md`: classify → load playbook/materials/similar cases → WB → crop → critique (what works + FIX/TASTE) →
numerical plan → **waits for your approval** → applies in one batch → measures → shows overlays (`open measure/…` in the terminal).

Steer it with replies like *"approved, apply all"*, *"drop T2"*, *"stronger on the sky"*, *"stop here"*.

## 4. Your clicks
- **White balance / Calibration** in the raw Smart Object (double-click the layer) when the agent finds a global cast.
- **Select Subject / Sky / Object** masks and **Remove** — always inside the Camera Raw **Filter**, never in the raw SO dialog. The agent asks, waits, then continues.
- Standalone brush strokes — last (scripted writes wipe them).

## 5. Finish
- Save the TIFF next to the source (`…/<date>/<name>-Edit.tif`), then say **"saved, archive it"**: the agent writes `recipes/cases/<id>.md` +
  `crf-<id>-final.json` + the `index.csv` row, puts new lessons in `recipes/inbox/`, clears `measure/` and commits.
- Push (`git push`) — automatic in Claude Code/Gemini if you ask; manual from the desktop chat.
- Now and then: "review the inbox and merge what qualifies" (`docs/updating-recipes.md`).

## Troubleshooting
| Symptom | Fix |
|---|---|
| `host is in a modal state` | A Photoshop / Camera Raw dialog is open — close it, say "retry" |
| `No clients registered for application: photoshop` | Proxy runs but the plugin isn't connected — Reload plugin → Connect |
| `/mcp` shows servers failed | Proxy not running, or `uv` / the adb-mcp `.venv` missing (`cd ~/dev/adb-mcp/mcp && uv sync`) |
| Call timed out on a big edit | It may have succeeded — ask the agent to re-read the filter / render before retrying |
| Document ID changed / layer renamed | Normal after reopen or crash recovery — the agent re-reads `get_documents` |
