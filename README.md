# docmd-skills

Three modular AI agent skills for [docmd](https://github.com/docmd-io/docmd) — the zero-config AI-first documentation engine.

| Skill | What it teaches your agent |
| --- | --- |
| **docmd-skills** *(default)* | Build, configure, validate, and deploy a docmd site |
| **docmd-dev** *(opt-in)* | Contribute to the docmd framework in its monorepo |
| **docmd-writer** *(opt-in)* | Write and review the prose inside a docmd site |

Each skill ships as a `SKILL.md` router plus reference files. The agent loads the router on first mention and pulls in only the references it needs.

## Install

```bash
npx docmd-skills [target-dir]   # adds docmd-skills + docmd-dev + docmd-writer
```

Default target: `./docmd-skills`. The command prints the exact path to point your agent at when it finishes.

To install only the user skill (no dev, no writer), point the agent at the bundled `skills/docmd-skills/SKILL.md` directly and copy the contents of `skills/docmd-skills/` into your target directory.

### Add the opt-in skills later

```bash
npx docmd-skills dev <dir>      # add docmd-dev alongside an existing install
npx docmd-skills writer <dir>   # add docmd-writer alongside an existing install
```

If the user skill is not present at `<dir>` yet, `dev` and `writer` fall back to installing all three skills first.

### Remove

```bash
npx docmd-skills uninstall [target-dir]
```

Removes all three skill folders and the version tag from the target.

### Flags

```bash
npx docmd-skills -v             # show package version
npx docmd-skills -h             # show help
```

## Global install

If you prefer a stable CLI on your `PATH`:

```bash
npm install -g docmd-skills
docmd-skills                     # install to ./docmd-skills
docmd-skills ~/.claude/skills/docmd
docmd-skills dev ~/.claude/skills/docmd
docmd-skills uninstall ~/.claude/skills/docmd
```

## From source

```bash
git clone https://github.com/docmd-io/docmd-skills.git
cd docmd-skills
node bin/docmd-skills.js [target-dir]
```

## Pointing your agent at the skill

How you wire the installed skill into your agent depends on the host:

| Host | Setup |
| --- | --- |
| Claude Desktop / Claude Code | Place the install under your host's skills directory, or paste `SKILL.md` into the project context |
| Cursor | Add the install path to `.cursorrules`, or paste `SKILL.md` into the agent context |
| Windsurf | Same as Cursor — paste into `.windsurfrules` or the agent context |
| Cline / Continue / Roo | Reference `SKILL.md` from your rules file or paste into the agent context |
| Any MCP-aware host | Use the [`docmd mcp`](https://docs.docmd.io/configuration/cli#mcp) server instead — it exposes `search_docs`, `read_doc`, `validate_docs`, `get_llms_context` |
| Other chat LLMs (ChatGPT, raw Claude) | Paste the contents of `SKILL.md` into the system prompt or first user message |

For the recommended agent workflow, open `skills/docmd-skills/SKILL.md` after install.

## Update

When a new version of the package ships:

```bash
npm update -g docmd-skills          # or: npm install -g docmd-skills@latest
docmd-skills <dir>                  # refreshes the three skill folders in place
```

The `<dir>` is yours to choose — pick the same path you used on first install. The command preserves everything outside the three `docmd-*` folders.

### Knowing when to update

- GitHub Releases: <https://github.com/docmd-io/docmd-skills/releases>
- `npm view docmd-skills version` — latest published version
- `cat <dir>/.docmd-skills-version` — version that wrote the current install

A new version is published when the underlying [docmd](https://github.com/docmd-io/docmd) ships a breaking change, when the agent workflow meaningfully shifts, or when a new opt-in skill is added.

## CLI reference

```
docmd-skills [dir]                  Install all three skills (default)
docmd-skills dev [dir]              Add docmd-dev
docmd-skills writer [dir]           Add docmd-writer
docmd-skills uninstall [dir]        Remove all installed skills

-h, --help                         Show help
-v, --version                      Show package version
```

Default `<dir>`: `./docmd-skills`.

## Layout after install

```
<dir>/
├── docmd-skills/           # user skill (always installed)
│   ├── SKILL.md
│   └── references/
│       ├── api-user.md
│       ├── cli.md
│       ├── config.md
│       ├── deployment.md
│       ├── formatting.md
│       ├── migration.md
│       ├── plugins.md
│       ├── validation.md
│       └── workspaces.md
├── docmd-dev/              # opt-in
│   ├── SKILL.md
│   └── references/
│       ├── api-dev.md
│       ├── engines.md
│       ├── plugin-development.md
│       └── template-development.md
├── docmd-writer/           # opt-in
│   ├── SKILL.md
│   └── references/
│       ├── code-blocks.md
│       ├── doc-types.md
│       ├── headings-and-structure.md
│       └── voice-and-style.md
└── .docmd-skills-version   # version tag (refreshed on every install)
```

## Related services

| Surface | URL |
| --- | --- |
| npm | <https://www.npmjs.com/package/docmd-skills> |
| GitHub (source) | <https://github.com/docmd-io/docmd-skills> |
| docmd framework | <https://github.com/docmd-io/docmd> |
| docmd docs (LLM-friendly) | <https://docs.docmd.io/llms-full.txt> |
| docmd MCP server registry | <https://github.com/modelcontextprotocol/servers> |

## Maintainer

```bash
pnpm test               # runs node bin/docmd-skills.js --self-test
pnpm release            # bump patch, commit, tag, publish
```

Author: [Ghazi](https://mgks.dev) · Licence: [MIT](./LICENSE)
