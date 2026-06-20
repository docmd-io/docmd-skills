---
name: docmd-skills
description: Use this skill when working with a docmd site — scaffolding, configuring, building, validating, deploying, or operating one. Covers the CLI, config, themes, plugins, MCP, migration, and deployment.
audience: user
load_command: docmd-skills (default install)
version: 1.1.0
verified_against:
  docmd: "0.8.7"
  node: "^20"
  tested_on: 2026-06-19
repository: https://github.com/docmd-io/docmd-skills
docs: https://docs.docmd.io
llms_context: https://docs.docmd.io/llms-full.txt
siblings:
  - name: docmd-dev
    when: working on the docmd framework itself (cloned monorepo)
  - name: docmd-writer
    when: writing or reviewing the prose inside a docmd site
---

# docmd — Agent Skill (User)

Use this skill when the user wants to **build, configure, or operate a docmd documentation site**. It is the default install and is loaded by `npx docmd-skills <dir>`.

## When to use this skill

Use it when the user wants to:

- Scaffold a new docmd site (`npx @docmd/core init`)
- Run the dev server, build, validate, deploy, or live-reload
- Edit `docmd.config.json` (themes, navigation, layout, plugins, i18n, versions)
- Use the `docmd mcp` server (`search_docs`, `read_doc`, `validate_docs`, `get_llms_context`)
- Migrate from Docusaurus / MkDocs / VitePress to docmd
- Pick between the JS and Rust build engines
- Add a community plugin (search, Mermaid, analytics, sitemap, etc.)

Do not use it for: writing or reviewing the prose inside pages (use **docmd-writer**), or hacking on the docmd framework itself (use **docmd-dev**).

## Loading rules

- Load `SKILL.md` (this file) by default whenever the user touches a docmd project.
- Load any reference file from the index below on first mention, or when the user asks for that specific surface.
- If the user is writing or editing page copy (markdown body, headings, intro paragraphs, callouts for tone), switch to **docmd-writer** instead.
- If the user is editing files inside the cloned `docmd/` monorepo (`packages/core/src/`, `packages/api/src/`, etc.), switch to **docmd-dev** instead.

## Reference index

Each row is a reference file. Load it when you need it; the CLI column shows which `docmd-skills` subcommand also installs that exact file.

| Reference | CLI install subcommand | Use it for |
| --- | --- | --- |
| `references/cli.md` | `docmd-skills` (default) | All `npx @docmd/core` subcommands: `init`, `dev`, `build`, `validate`, `live`, `deploy`, `mcp` |
| `references/config.md` | `docmd-skills` (default) | `docmd.config.json` schema, themes, navigation, layout, i18n, versions, plugins |
| `references/formatting.md` | `docmd-skills` (default) | docmd-flavoured markdown: containers, tabs, cards, grids, steps, frontmatter, Mermaid |
| `references/plugins.md` | `docmd-skills` (default) | Built-in and community plugins, `plugins:` config, plugin resolution order |
| `references/migration.md` | `docmd-skills` (default) | Migrating from Docusaurus, MkDocs, VitePress to docmd |
| `references/deployment.md` | `docmd-skills` (default) | Static hosting, SPA routing rewrites, `docmd deploy`, Docker, CI recipes |
| `references/validation.md` | `docmd-skills` (default) | `docmd validate`, frontmatter rules, link checking, MCP `validate_docs` |
| `references/workspaces.md` | `docmd-skills` (default) | Monorepo / multi-package doc workspaces, shared assets, cross-site nav |
| `references/api-user.md` | `docmd-skills` (default) | Node API surface used by *consumers* of `@docmd/core`, `@docmd/live`, `@docmd/ui` |

## Workflows

### 1. New project

1. Run `npx @docmd/core init` (or use `pnpm create @docmd/core`).
2. Open `docmd.config.json`; cross-check against `references/config.md`.
3. Add pages under `docs/`; follow `references/formatting.md` and (for prose quality) **docmd-writer**.
4. `npx @docmd/core dev` for live preview, then `validate` and `build`.

### 2. Existing project, new feature

1. Skim `references/config.md` for the relevant section.
2. Check `references/plugins.md` first — the feature may be a one-line plugin.
3. If the change touches page prose, hand off to **docmd-writer** for the body and back to this skill for config.

### 3. CI / deploy

1. `references/validation.md` for the gate command.
2. `references/deployment.md` for the target host (Netlify / Vercel / Nginx / Caddy / Cloudflare Pages / GitHub Pages / Docker).

## Cross-skill navigation

- **docmd-dev** — only when the user is editing the `docmd/` framework monorepo.
- **docmd-writer** — whenever the task is about writing or improving the prose in pages.
