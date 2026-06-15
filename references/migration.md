---
description: Migration guides for transitioning to docmd from other documentation frameworks. Use when migrating existing docs or upgrading legacy configurations.
when_to_use: |
  Read this file when you are:
  - Moving an existing Docusaurus / MkDocs / VitePress / Starlight site to docmd
  - Upgrading an old docmd config (V1 → V2 schema)
  - Recovering from a half-finished migration
  - Auditing which manual steps the migrator does not handle automatically
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-15
---

# Migration

The migrator is a best-effort scaffold: it moves content, generates a config skeleton, and stops. Non-trivial work (navigation, i18n, custom components, hand-tuned CSS) is always a manual follow-up.

## Supported Sources {#supported-sources}

| Source | Command | What Migrates |
|:--|:--|:--|
| Docusaurus | `docmd migrate --docusaurus` | Config, docs/, i18n structure |
| MkDocs | `docmd migrate --mkdocs` | Config, docs/ |
| VitePress | `docmd migrate --vitepress` | Config, docs/ |
| Starlight | `docmd migrate --starlight` | Config, docs/ |
| Legacy docmd | `docmd migrate --upgrade` | V1 config → V2 schema |

Only content and a skeleton config are migrated. Custom theme overrides, plugin code, hand-built components, and any framework-specific runtime are not translated — reimplement those as docmd plugins or styling.

## Migration Process {#migration-process}

All migrations follow the same pattern:

1. Backup — original files moved to `<source>-backup/`
2. Content migration — docs restored to root `docs/`
3. Config generation — `docmd.config.json` created

The backup is created in the current working directory (`<source>-backup/`), not in a temp dir. A stray `docs-backup/` from a previous attempt will cause the migrator to refuse to overwrite it.

## Usage {#usage}

### From Docusaurus {#from-docusaurus}

```bash
cd my-docusaurus-site
npx @docmd/core migrate --docusaurus
npx @docmd/core dev  # Preview
```

Manual steps:
- Rebuild navigation in `docmd.config.json`
- Move i18n files from `i18n/<locale>/...` to `docs/<locale>/`
- Replace React components with markdown containers

Docusaurus MDX components (`<Tabs>`, `<TabsItem>`, custom React components) do not migrate. They render as raw JSX in markdown and will be parsed as garbage. Convert each to the equivalent docmd container.

### From MkDocs {#from-mkdocs}

```bash
cd my-mkdocs-site
npx @docmd/core migrate --mkdocs
npx @docmd/core dev
```

Manual steps:
- Rebuild navigation (MkDocs `nav` → docmd `navigation`)
- Update custom CSS/styling

MkDocs Material extensions (admonitions, content tabs, snippets) are not translated to docmd containers. Search for `!!!` and `===` (admonitions) and rewrite them as `::: callout` blocks manually.

### From VitePress {#from-vitepress}

```bash
cd my-vitepress-site
npx @docmd/core migrate --vitepress
npx @docmd/core dev
```

Manual steps:
- Replace VitePress containers (`:::tip`) with docmd syntax
- Update frontmatter fields
- Rebuild navigation

VitePress containers (`:::tip`, `:::warning`, etc.) have aliases in docmd, so most admonitions will render. VitePress's `<<<` snippet syntax and `v-pre` raw blocks do not have equivalents.

### From Starlight (Astro) {#from-starlight}

```bash
cd my-starlight-site
npx @docmd/core migrate --starlight
npx @docmd/core dev
```

Starlight uses `.mdx` files. The migrator may leave `.mdx` extensions intact — docmd expects `.md` by default. Rename them after migration.

## Legacy Config Upgrade {#legacy-config-upgrade}

Upgrade docmd V1 configs to V2 schema:

```bash
npx @docmd/core migrate --upgrade
```

Key mappings:

| Legacy Key | Modern Key |
|:--|:--|
| `siteTitle` | `title` |
| `siteUrl` / `baseUrl` | `url` |
| `srcDir` / `source` | `src` |
| `outputDir` | `out` |
| `defaultLocale` | `i18n.default` |
| `projects` (top-level) | `workspace.projects` |

`migrate --upgrade` is idempotent — running it on an already-upgraded config is a no-op. Some old keys have no direct equivalent (e.g. `theme.algolia`, `sidebar.alwaysOpen`); the migrator drops them and prints a warning to stderr.

## After Migration {#after-migration}

1. Test: `docmd dev` — verify all pages render
2. Navigation: define sidebar structure in config
3. Plugins: add required plugins (search, git, seo)
4. Deploy: update CI/CD pipelines

Run `docmd dev` (not `build`) to test — dev surfaces markdown/container parse errors inline, while `build` may fail with a generic error.

## Common Issues {#common-issues}

Empty navigation — Migration does not copy nav structures. Update `docmd.config.json` manually.

Missing i18n — Docusaurus i18n requires manual relocation.

Broken links — Run `docmd validate` to check internal links. Path-style differences are the most common cause: Docusaurus uses `/docs/path/`, MkDocs uses `path.md`, VitePress uses `/path/`. The migrator picks one convention. After migration, run `docmd validate --json` to see exactly which links are wrong.

Component errors — Replace framework-specific components with docmd containers.

## See Also {#see-also}

- [SKILL.md §1](../SKILL.md#1-when-docmd-fits) — when migrating is even the right call
- [SKILL.md §7](../SKILL.md#7-compatibility-notes) — compatibility notes across the whole tool
- [config.md](./config.md) — full config schema, the migration target
- [formatting.md](./formatting.md) — container syntax for replacing framework-specific components
- [cli.md](./cli.md) — the `migrate` subcommand flags
- [validation.md](./validation.md) — finding broken links post-migration
