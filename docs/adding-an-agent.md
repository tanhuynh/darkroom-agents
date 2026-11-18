# Adding an agent (new cloud model or a local LLM)

## 1. Connect it to Photoshop
- The agent needs an **MCP client** that can launch the adb-mcp servers over stdio:
  - via the FastMCP CLI: `uv run --directory ~/dev/adb-mcp/mcp mcp run ps-mcp.py` (and `ps-batch-play.py`) — never `--with mcp`;
  - or directly: `~/dev/adb-mcp/mcp/.venv/bin/python ~/dev/adb-mcp/mcp/ps-mcp.py` (uses the `__main__` entry point).
- Put the client's MCP config in this repo (like `.mcp.json`, `.gemini/settings.json`, `.agents/mcp_config.json`).
- Proxy + plugin as usual (`node proxy.js`, UXP plugin Connect).
- Smoke test: ask the agent for `get_documents` and a `get smartObject` on the active layer.

## 2. Write its adapter
- Copy `agents/local/ADAPTER.md` to `agents/<name>/ADAPTER.md` and fill in: runtime, how it loads context files,
  how it runs `tools/measure_all.py` (`.venv/bin/python …`), how it shows overlays, git ability, observed limits.
- Keep only plumbing and agent-specific tendencies there. Anything about *editing* belongs in the playbooks.

## 3. Make it load the rules
- If its tool auto-reads a context file (like `CLAUDE.md` / `GEMINI.md`), add a two-line root file:
  ```
  @./WORKFLOW.md
  @./agents/<name>/ADAPTER.md
  ```
  (use the import syntax that tool supports; otherwise list the files to read).
- If it reads `AGENTS.md`, that file already points it to `WORKFLOW.md` + `agents/`.
- Otherwise start each session with: *"Read WORKFLOW.md and agents/<name>/ADAPTER.md first."*
- **Verify** it actually loaded them (Gemini CLI: `/memory show`; others: ask it to quote the write policy in WORKFLOW §5).

## 4. Benchmark before trusting it
- Pick an image with a finished case (e.g. 0265). Give the new agent the original and the same instructions.
- Compare with `tools/measure_all.py diff original.png <agent>.png` and against the case's result; write it up in
  `comparisons/<id>-<agent>-vs-<other>.md` (see `comparisons/0265-claude-vs-gemini.md`).
- Note strengths/weaknesses in its adapter ("Conformance rules"); route good ideas through `recipes/inbox/`.

## 5. Write policy (same for every agent)
- Cases (`recipes/cases/…`) directly; rule/material/engine changes only as `recipes/inbox/` proposals.
- Never edit `WORKFLOW.md` or another agent's adapter.
- Provenance tag in cases/proposals: `<name>` or `local:<model>`.

## Local-model notes
- Needs vision to read renders, reliable tool calling, and enough context for WORKFLOW + adapter + one playbook + one case (~15–20k tokens); load `engine.md` sections on demand.
- XMP generation is the hard part: give it the schema (`engine.md` §6) and a case JSON as a structural example; validate the XML before sending (`xml.dom.minidom.parseString`).
- Start with read-only tasks (WB check, critique, plan) before letting it write filters.

## Gemini (already set up)
- `GEMINI.md` → `WORKFLOW.md` + `agents/gemini/ADAPTER.md`. In Gemini CLI from the repo root: `/memory refresh`, then `/memory show` — both files must be listed.
- Its old habit of editing the shared rules directly is replaced by inbox proposals (adapter "Conformance rules").
