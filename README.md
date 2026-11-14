# docmd-skills

Modular AI agent skills for [docmd](https://github.com/docmd-io/docmd) (`v0.10.0`) — the zero-config, AI-first documentation engine.

All three skills are **sibling skills** that can be installed together, loaded individually on demand, or cross-referenced by agents when tasks span site operations, framework development, and technical writing.

## Sibling Skills

| Skill | Audience | Use Case |
| ----- | -------- | -------- |
| **[`docmd-skills`](./skills/docmd-skills/SKILL.md)** | Site Operators & Users | Covers the `@docmd/core` CLI (`init`, `dev`, `build`, `serve`, `doctor`, `validate`, `migrate`, `live`, `mcp`, `add`, `remove`), `docmd.config.js`, Variables & Personalisation (`{{ var }}` & `window.docmd.var`), custom containers & explicit `::: /type` closers, interactive Playgrounds (`::: playground`), native MDX (`.mdx`), 12 core + 4 optional plugins (including OKF, AI, Search, OpenAPI, Threads, Iconify), `public/` static root copying, `docmd serve` production hosting, multi-project workspaces, and the 6-tool MCP server (`stdio` and `POST /mcp`). |
| **[`docmd-dev`](./skills/docmd-dev/SKILL.md)** | Framework Developers | Covers the `docmd` monorepo architecture (`packages/*` + `@docmd/lite-*`), `@docmd/api` contracts (`loadPlugins`, `resolveTemplate`, `createActionDispatcher`, `runPluginDoctorChecks`), the 14 plugin capabilities (`package.json#docmd`), the 12 `TemplateSlot` entries and asset priority chain (`0`–`25+`), JS / Rust N-API / Python 3.8+ engines, and the v0.10.0 security & regression checklist. |
| **[`docmd-writer`](./skills/docmd-writer/SKILL.md)** | Documentation Writers | Covers Diátaxis document types (Tutorial, How-To, Reference, Explanation) mapped to OKF `type` metadata, British English voice and style, universal page skeleton, code-block file-title rules, runnable vs illustrative vs interactive `playground` blocks, and variable escaping (`\{{ ... }}`). Defers syntax mechanics to `docmd-skills`. |

## Install

```bash
# Install all 3 sibling skills into your agent skills directory
npx docmd-skills ~/.claude/skills/docmd

# Or install/update any single sibling skill on demand
npx docmd-skills user ~/.claude/skills/docmd
npx docmd-skills dev ~/.claude/skills/docmd
npx docmd-skills writer ~/.claude/skills/docmd
```

Common target directories include `~/.claude/skills/`, `~/.cursor/skills/`, `~/.copilot/skills/`, or a project-local `.skills/` folder.

## CLI Reference

```bash
docmd-skills <dir>                  # Install all 3 sibling skills (docmd-skills, docmd-dev, docmd-writer)
docmd-skills user <dir>             # Install or update docmd-skills (site operator/user skill)
docmd-skills dev <dir>              # Install or update docmd-dev (framework developer skill)
docmd-skills writer <dir>           # Install or update docmd-writer (documentation writer skill)
docmd-skills remove <dir>           # Remove all installed docmd skills

-h, --help                          # Show help
-v, --version                       # Show version (1.3.0 — verified against docmd 0.10.0)
```

## Links

- GitHub — <https://github.com/docmd-io/docmd-skills>
- npm — <https://www.npmjs.com/package/docmd-skills>
- docmd — <https://github.com/docmd-io/docmd>
- Documentation — <https://docs.docmd.io>

## License

MIT — see [`LICENSE`](./LICENSE) for details.