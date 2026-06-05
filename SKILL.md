---
name: docmd-skills
description: Agent instruction set for docmd — the zero-config AI-first documentation engine.
repository: https://github.com/docmd-io/docmd
docs: https://docs.docmd.io
llms-context: https://docs.docmd.io/llms-full.txt
---

# docmd Agent Skills Index

## Modules
- [CLI & Setup](./cli.md) — Installation, all commands with flags and options
- [Configuration](./config.md) — `docmd.config.json` full schema with defaults
- [Plugins](./plugins.md) — Every built-in plugin with all config keys, defaults, and behaviour
- [Plugin Development](./plugin-development.md) — Hooks, lifecycle, ActionContext, custom plugin creation
- [Formatting](./formatting.md) — Containers, frontmatter, self-closing rules
- [API](./api.md) — Node.js build API, browser API, URL utilities, client-side events
- [Validation](./validation.md) — Link checking, CI/CD linting

## Discoverability
- **Full docs context**: `{site_url}/llms-full.txt` (generated at build time by the `llms` plugin)
- **Short context**: `{site_url}/llms.txt`
- **MCP server**: Run `docmd mcp` in any docmd project for stdio tool access
- **Skills**: This repo, or auto-generated `SKILL.md` via `docmd init`

## How Agents Should Use This
1. Start with this index to understand what docmd can do
2. Read the specific module for your task (e.g. `config.md` to set up a project)
3. For full documentation content, fetch `llms-full.txt` from the deployed site
4. For live interaction, connect via `docmd mcp` (stdio transport, JSON-RPC 2.0)