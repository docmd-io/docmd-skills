# docmd-skills

AI agent skills for [docmd](https://github.com/docmd-io/docmd) — the zero-config AI-first documentation engine.

This package bundles a structured skill (`SKILL.md` + 11 reference files) that teaches AI coding agents, chat LLMs, and MCP-aware hosts how to scaffold, configure, build, validate, and deploy docmd documentation sites.

## Install Skills

### With just one command

```bash
npx docmd-skills install [target-dir]  # add your target skill directory ex - ./cursor/skills
```

### Global installation (recommended)

```bash
# Install the package globally so the CLI is on your PATH
npm install -g docmd-skills

# Drop the skill files into a target directory
docmd-skills install                         # default: ./docmd-skills/
docmd-skills install ~/.claude/skills/docmd  # or wherever your host looks
```

Once installed, point your agent at the resulting `SKILL.md` (full path is printed by the install command).

### From source (GitHub)

```bash
git clone https://github.com/docmd-io/docmd-skills.git
cd docmd-skills
node bin/docmd-skills.js install [target-dir]
```

## Usage

After running `docmd-skills install`, you'll have a directory containing `SKILL.md` and `references/`. How you point your agent at it depends on the host:

| Host | Setup |
| --- | --- |
| Claude Desktop / Claude Code | Reference `SKILL.md` from the project, or place under your host's skills directory |
| Cursor | Add the path to your project's `.cursorrules` or paste `SKILL.md` into the agent context |
| Windsurf | Same as Cursor — paste into `.windsurfrules` or the agent context |
| Cline / Continue / Roo | Reference `SKILL.md` in your rules file or paste into the agent context |
| Any MCP-aware host | Use the [`docmd mcp`](../SKILL.md#4-mcp-server) server instead — see SKILL.md §4 |
| Other chat LLMs (ChatGPT, raw Claude) | Paste the contents of `SKILL.md` into the system prompt or first user message |

For the full agent workflow, see [SKILL.md §9](./SKILL.md#9-recommended-workflow).

## Update

When a new version of the skill ships:

```bash
# 1. Get the latest package
npm update -g docmd-skills
# (or: npm install -g docmd-skills@latest)

# 2. Refresh the installed files
docmd-skills update                        # uses the same path as last install
docmd-skills update ~/.claude/skills/docmd # or specify explicitly
```

The `update` subcommand preserves your target path (stored in a `.docmd-skills-version` file) and overwrites the skill files in place.

### Knowing when to update

Watch this repo for releases:

- GitHub Releases: <https://github.com/docmd-io/docmd-skills/releases>
- `npm view docmd-skills version` — latest published version
- `docmd-skills info` — shows installed vs latest

A new version is published when the underlying [docmd](https://github.com/docmd-io/docmd) ships a breaking change, or when the skill accumulates a meaningful number of improvements. See [SKILL.md §7](./SKILL.md#7-compatibility-notes) for what to look out for when upgrading.

## CLI Reference

```
docmd-skills install [target]      Copy skill files to target (default: ./docmd-skills)
docmd-skills update [target]       Refresh an existing install
docmd-skills info                  Show installed version, paths, latest npm version
docmd-skills uninstall [target]    Remove an install

-h, --help                         Show this help
-v, --version                      Show package version
```

You can also use `npx docmd-skills <command>` for one-off invocations.

## Where this skill is published

| Surface | URL |
| --- | --- |
| npm | <https://www.npmjs.com/package/docmd-skills> |
| GitHub (source) | <https://github.com/docmd-io/docmd-skills> |
| MCP server registry | <https://github.com/modelcontextprotocol/servers> (the `docmd mcp` server itself) |
| docmd docs (LLM-friendly) | <https://docs.docmd.io/llms-full.txt> |

## Reference files

The skill ships 11 reference files. Each opens with a `when_to_use` block telling you which scenarios it's for, and which scenarios it isn't.

| File | Description |
|:--|:--|
| [references/cli.md](./references/cli.md) | All CLI commands, flags, and options |
| [references/config.md](./references/config.md) | Complete `docmd.config.json` schema |
| [references/formatting.md](./references/formatting.md) | Markdown extensions, containers, frontmatter |
| [references/plugins.md](./references/plugins.md) | Built-in plugins and their options |
| [references/plugin-development.md](./references/plugin-development.md) | Building custom plugins |
| [references/api.md](./references/api.md) | Node.js API, browser API, MCP server |
| [references/engines.md](./references/engines.md) | Build engine architecture (JS vs Rust) |
| [references/validation.md](./references/validation.md) | Link checking and CI/CD patterns |
| [references/deployment.md](./references/deployment.md) | GitHub Actions, Docker, Vercel, Netlify |
| [references/workspaces.md](./references/workspaces.md) | Multi-project monorepo setup |
| [references/migration.md](./references/migration.md) | Migrate from Docusaurus / MkDocs / VitePress / Starlight |

## Versioning

This package is versioned and verified against a specific docmd release:

```yaml
version: 1.2.0
verified_against:
  docmd: "0.8.7"
  node: ">=20"
```

The version is bumped when:

- **Major** (1.x → 2.x): underlying docmd makes a breaking change that requires skill updates
- **Minor** (1.2 → 1.3): new reference files added, or significant content added to existing ones
- **Patch** (1.2.0 → 1.2.1): clarifications, papercut fixes, doc corrections

The `verified_against.docmd` field in the frontmatter is updated each release.

## Contributing

Contributions are welcome — please open an issue or PR on the [GitHub repo](https://github.com/docmd-io/docmd-skills).

The most useful contributions are:

1. **Compatibility notes** — short, real-world notes on docmd behaviors that differ from the documentation
2. **Verified examples** — code snippets that have been run on a specific docmd version, with the version updated in the frontmatter
3. **Updated `verified_against` values** when you confirm the skill still works on a new docmd release

To make a contribution:

1. Fork the repo
2. Edit the relevant `.md` file in `references/` (or `SKILL.md`)
3. If the change is non-trivial, update `verified_against.tested_on` in the frontmatter
4. Open a PR with a clear description of what changed and why

## Maintainer notes

For maintainers publishing a new release:

```bash
# 1. Make your changes, commit them
git add -A
git commit -m "release: v1.x.y"

# 2. Bump version (use one of:)
npm version patch    # 1.2.0 → 1.2.1
npm version minor    # 1.2.0 → 1.3.0
npm version major    # 1.2.0 → 2.0.0

# 3. Publish
npm publish

# 4. Push tags
git push --follow-tags
```

The package's `files` field controls what gets published — see `package.json` for the exact list.

## License

MIT
