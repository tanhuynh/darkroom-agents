# darkroom-agents — entry point for agents

This repo is shared by several AI agents. Before doing anything:

1. Read `WORKFLOW.md` (shared, model-neutral rules and session workflow).
2. Read your adapter in `agents/` — `agents/claude/`, `agents/gemini/`, or `agents/local/` (template for new/local models).
3. Per image, load the knowledge as `recipes/README.md` describes (engine + matching playbook + materials + closest cases).

Claude Code reads `CLAUDE.md` and Gemini CLI reads `GEMINI.md`; both import the files above. Other tools that read
`AGENTS.md` (Codex, Cursor, …) should follow the three steps manually. Adding a new agent: `docs/adding-an-agent.md`.
