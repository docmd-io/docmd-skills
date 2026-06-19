# docmd-skills

Skills that teach AI agents how to work with [docmd](https://github.com/docmd-io/docmd) — the zero-config AI-first documentation engine.

## Skills

| Skills     | Use Case |
| ---------- | -------- |
| **docmd-skills** | A docmd site operator. Knows the `npx @docmd/core` CLI, `docmd.config.json`, plugins, themes, deployment, and the `docmd mcp` server. Loads whenever the user is building, configuring, validating, or deploying a docmd site. |
| **docmd-dev** | A docmd framework contributor. Knows the monorepo layout, how to author plugins and templates, the JS / Rust engine loaders, and the public Node API (`EngineLoader`, `createActionDispatcher`, `TemplateSlot`). Loads when working in the cloned `docmd/` monorepo or building a plugin or template against the framework. |
| **docmd-writer** | A multi-language documentation writer. Drafts and reviews prose in any language the underlying model supports, with SEO awareness and an eye for voice, structure, and the right doc type for the audience. Aware of docmd's markdown conventions — containers, frontmatter, and the file-title rule for code blocks. Loads when writing, reviewing, or translating the prose inside a docmd site. |

## Install

```bash
npx docmd-skills [dir]
```

Replace `[dir]` with the directory location where you keep agent skills — common choices are `~/.claude/skills/`, `~/.cursor/skills/`, or a project-level folder like `./.skills/`.

## CLI

```bash
docmd-skills [dir]                  # Install (adds docmd-skills, docmd-dev and docmd-writer)
docmd-skills dev [dir]              # Add docmd-dev
docmd-skills writer [dir]           # Add docmd-writer
docmd-skills remove [dir]           # Remove all docmd-skills

-h, --help                          # Show help
-v, --version                       # Show version
```

## Links

- GitHub — <https://github.com/docmd-io/docmd-skills>
- npm — <https://www.npmjs.com/package/docmd-skills>
- docmd — <https://github.com/docmd-io/docmd>
- docs — <https://docs.docmd.io>

## License

MIT — see [`LICENSE`](./LICENSE) for details.