<div align="center">

  <h3>
    <a href="https://docmd.io">
      <img src="https://github.com/docmd-io/docmd/blob/main/packages/ui/assets/images/docmd-logo-dark.png?raw=true" alt="docmd logo" width="150" />
    </a>
  </h3>

  <p>
    <b>Agent Skills for docmd</b>
    <br/>
    AI agent instructions for <a href="https://github.com/docmd-io/docmd">docmd</a> — the zero-config AI-first documentation engine.
  </p>

</div>

## What is this?

This repository contains structured skill files for AI agents working with docmd. It teaches AI coding assistants, chat LLMs, and IDE agents how to create, configure, build, and deploy documentation using docmd.

**Structure:**
- `SKILL.md` — Main entry point with quick reference
- `references/` — Detailed documentation for each topic

## Quick Start

### For AI Coding Agents (Cursor, Windsurf, Cline, etc.)

Point your agent to the main skill file:

```
https://raw.githubusercontent.com/docmd-io/docmd-skills/main/SKILL.md
```

Or clone into your project:

```bash
git clone https://github.com/docmd-io/docmd-skills.git .docmd-skills
```

Then instruct your agent: *"Read `.docmd-skills/SKILL.md` for docmd instructions."*

### For Claude / ChatGPT / Other Chat LLMs

Paste the contents of [SKILL.md](./SKILL.md) into your system prompt, or reference specific reference files as needed.

### For MCP-Enabled Agents

Connect directly to a docmd workspace:

```json
{
  "mcpServers": {
    "docmd": {
      "command": "npx",
      "args": ["@docmd/core", "mcp"],
      "cwd": "/path/to/your/docs/project"
    }
  }
}
```

This gives the agent live access to search, read, and validate docs.

### For Full Documentation Context

Every docmd site generates `llms.txt` and `llms-full.txt` at build time:

```
https://docs.docmd.io/llms-full.txt
```

## Reference Files

| File | Description |
|:--|:--|
| [cli.md](./references/cli.md) | All CLI commands, flags, and options |
| [config.md](./references/config.md) | Complete configuration schema |
| [workspaces.md](./references/workspaces.md) | Multi-project workspace setup |
| [plugins.md](./references/plugins.md) | Built-in plugins and configuration |
| [plugin-development.md](./references/plugin-development.md) | Custom plugin development |
| [formatting.md](./references/formatting.md) | Markdown extensions and containers |
| [api.md](./references/api.md) | Node.js API, browser API, MCP server |
| [engines.md](./references/engines.md) | Build engine architecture (JS/Rust) |
| [migration.md](./references/migration.md) | Migrate from other frameworks |
| [validation.md](./references/validation.md) | Link checking and CI/CD |
| [deployment.md](./references/deployment.md) | GitHub template, Actions, Docker |

## GitHub Template

[![Use this template](https://img.shields.io/badge/template-launch_repo_with_docmd-blue?style=flat-square&logo=github)](https://github.com/docmd-io/docmd-template/generate)

The fastest way to start:

1. Click **[Use this template](https://github.com/docmd-io/docmd-template/generate)**
2. Update `docmd.config.json` with your site title and URL
3. Push to `main` — your site deploys automatically

## GitHub Actions

[![Marketplace](https://img.shields.io/badge/actions-build_&_deploy_with_docmd-blue?style=flat-square&logo=github)](https://github.com/marketplace/actions/build-and-deploy-documentation-with-docmd)

Add to any workflow:

```yaml
- uses: docmd-io/deploy@v1.1
```

Or use the reusable workflow:

```yaml
jobs:
  docs:
    uses: docmd-io/deploy/.github/workflows/deploy.yml@v1.1
```

## How Agents Should Use This

1. **Start with `SKILL.md`** — Quick reference and overview
2. **Read specific references** — As needed for your task
3. **Use MCP for live access** — Connect directly to docmd workspace
4. **Fetch `llms-full.txt`** — For comprehensive documentation context
cd .docmd-skills && git pull
```

## Contributing

Found something missing or incorrect? Contributions are welcome, please open an issue or PR on this repository.

## License

MIT