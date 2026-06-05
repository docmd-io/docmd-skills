<div align="center">

  <h3>
    <a href="https://docmd.io">
      <img src="https://github.com/docmd-io/docmd/blob/main/packages/ui/assets/images/docmd-logo-dark.png?raw=true" alt="docmd logo" width="150" />
    </a>
  </h3>

  <p>
    <b>Agent Skills for docmd</b>
    <br/>
    A modular instruction set for AI agents to understand and work with <a href="https://github.com/docmd-io/docmd">docmd</a> documentation projects.
  </p>

</div>

## What is this?

This repository is the **single source of truth** for AI agents working with docmd. It contains concise, structured skill files that teach AI coding assistants, chat LLMs, and IDE agents how to create, configure, build, and deploy documentation using docmd.

## Quick Start

### For AI Coding Agents (Cursor, Windsurf, Cline, etc.)

Point your agent to this repo as a context source. Most agents support fetching remote instructions:

```
# In your agent's system prompt or context settings, add:
https://raw.githubusercontent.com/docmd-io/docmd-skills/main/SKILL.md
```

Or clone into your project:

```bash
git clone https://github.com/docmd-io/docmd-skills.git .docmd-skills
```

Then instruct your agent: *"Read `.docmd-skills/SKILL.md` for docmd instructions."*

### For Claude / ChatGPT / Other Chat LLMs

Paste the contents of [SKILL.md](./SKILL.md) into your system prompt, or reference specific modules as needed:

```
Read the docmd skill files at https://github.com/docmd-io/docmd-skills for instructions on how to work with docmd documentation projects.
```

### For MCP-Enabled Agents

If your agent supports MCP (Model Context Protocol), connect directly to a docmd workspace:

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

This gives the agent live access to search, read, and validate docs without needing these skill files.

### For Full Documentation Context

Every docmd site generates `llms.txt` and `llms-full.txt` at build time. Fetch the full context from any deployed docmd site:

```
https://docs.docmd.io/llms-full.txt
```

## Skill Modules

| Module | Description |
|:--|:--|
| [SKILL.md](./SKILL.md) | Index — start here, links to all modules |
| [cli.md](./cli.md) | Installation, all CLI commands, flags, and options |
| [config.md](./config.md) | `docmd.config.json` full schema with defaults |
| [plugins.md](./plugins.md) | Every built-in plugin with all config keys and defaults |
| [plugin-development.md](./plugin-development.md) | Hook signatures, lifecycle, custom plugin creation |
| [formatting.md](./formatting.md) | Containers, frontmatter, self-closing syntax rules |
| [api.md](./api.md) | Node.js build API, browser API, MCP server, URL utilities |
| [validation.md](./validation.md) | Link checking and CI/CD integration |

## How Agents Should Use This

1. **Start with `SKILL.md`** — understand what docmd is and what modules are available
2. **Read the relevant module** — e.g. `config.md` to set up a project, `formatting.md` to write content
3. **For live interaction** — connect via `docmd mcp` (stdio, JSON-RPC 2.0) instead of reading static files
4. **For full docs context** — fetch `llms-full.txt` from the deployed site

## Keeping Up to Date

These skills are maintained alongside the [docmd](https://github.com/docmd-io/docmd) repository. When docmd releases a new version, the skill files are updated to reflect new features, config changes, and API additions.

To update your local copy:

```bash
cd .docmd-skills && git pull
```

## Contributing

Found something missing or incorrect? Contributions are welcome, please open an issue or PR on this repository.

## License

MIT