---
description: Migration guides for transitioning to docmd from other documentation frameworks. Use when migrating existing docs or upgrading legacy configurations.
---

# Migration

## Supported Sources

| Source | Command | What Migrates |
|:--|:--|:--|
| Docusaurus | `docmd migrate --docusaurus` | Config, docs/, i18n structure |
| MkDocs | `docmd migrate --mkdocs` | Config, docs/ |
| VitePress | `docmd migrate --vitepress` | Config, docs/ |
| Starlight | `docmd migrate --starlight` | Config, docs/ |
| Legacy docmd | `docmd migrate --upgrade` | V1 config → V2 schema |

## Migration Process

All migrations follow the same pattern:

1. **Backup** — Original files moved to `<source>-backup/`
2. **Content migration** — Docs restored to root `docs/`
3. **Config generation** — `docmd.config.json` created

## Usage

### From Docusaurus

```bash
cd my-docusaurus-site
npx @docmd/core migrate --docusaurus
npx @docmd/core dev  # Preview
```

**Manual steps:**
- Rebuild navigation in `docmd.config.json`
- Move i18n files from `i18n/<locale>/...` to `docs/<locale>/`
- Replace React components with markdown containers

### From MkDocs

```bash
cd my-mkdocs-site
npx @docmd/core migrate --mkdocs
npx @docmd/core dev
```

**Manual steps:**
- Rebuild navigation (MkDocs `nav` → docmd `navigation`)
- Update custom CSS/styling

### From VitePress

```bash
cd my-vitepress-site
npx @docmd/core migrate --vitepress
npx @docmd/core dev
```

**Manual steps:**
- Replace VitePress containers (`:::tip`) with docmd syntax
- Update frontmatter fields
- Rebuild navigation

### From Starlight (Astro)

```bash
cd my-starlight-site
npx @docmd/core migrate --starlight
npx @docmd/core dev
```

## Legacy Config Upgrade

Upgrade docmd V1 configs to V2 schema:

```bash
npx @docmd/core migrate --upgrade
```

**Key mappings:**

| Legacy Key | Modern Key |
|:--|:--|
| `siteTitle` | `title` |
| `siteUrl` / `baseUrl` | `url` |
| `srcDir` / `source` | `src` |
| `outputDir` | `out` |
| `defaultLocale` | `i18n.default` |
| `projects` (top-level) | `workspace.projects` |

## After Migration

1. **Test**: `docmd dev` — verify all pages render
2. **Navigation**: Define sidebar structure in config
3. **Plugins**: Add required plugins (search, git, seo)
4. **Deploy**: Update CI/CD pipelines

## Common Issues

**Empty navigation** — Migration doesn't copy nav structures. Manually configure.

**Missing i18n** — Docusaurus i18n requires manual relocation.

**Broken links** — Run `docmd validate` to check internal links.

**Component errors** — Replace framework-specific components with docmd containers.

## See Also

- [Configuration](./config.md) — Config schema
- [CLI Reference](./cli.md) — All commands
- [Validation](./validation.md) — Link checking