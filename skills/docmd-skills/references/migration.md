---
title: Migration Guide
description: Migrating legacy docmd configs and external documentation platforms (Docusaurus, VitePress, MkDocs, Mintlify, GitBook, Nextra) to docmd 0.10.0.
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Migration Guide

## 1. Upgrading Legacy `docmd` Configurations (`docmd migrate`)

`docmd migrate` upgrades legacy `config.js` / `docmd.config.js` files from earlier versions (`0.5.x`–`0.9.x`) to the modern `v0.10.0` `defineConfig` schema:

```bash
# Preview proposed config changes without modifying disk
docmd migrate --dry-run

# Apply migration in place (creates a backup before writing)
docmd migrate
```

### Legacy → `v0.10.0` Config Key Mapping

| Legacy Key | Modern `v0.10.0` Equivalent |
|------------|-----------------------------|
| `title` | `siteTitle` |
| `url` | `siteUrl` |
| `srcDir` | `src` |
| `outDir` | `out` |
| `copyCode` | `content.copyCode` |
| `codeHighlight` | `content.codeHighlight` |
| `lineNumbers` | `content.lineNumbers` |
| `autoTitleFromH1` | `content.autoTitle` |
| `pageNavigation` | `navigation.prevNext` |
| `theme.defaultMode` | `theme.appearance` |
| `theme.enableModeToggle` | `layout.header.themeToggle` |
| `sponsor` | `layout.sponsor` |
| `footer` (string) | `layout.footer` (`{ style, content, branding }`) |
| `search: false` | `layout.header.search: false` or `plugins.search: false` |

---

## 2. Migrating from External Platforms

### Native MDX Compatibility in `v0.10.0`

Because `docmd 0.10.0` includes `@docmd/plugin-mdx` (`@docmd/lite-mdx`) out of the box, `.mdx` files and common JSX documentation components (`<Callout>`, `<Tabs>`, `<Tab>`, `<Steps>`, `<Cards>`, `<Card>`) from Mintlify, Nextra, and Docusaurus work natively without rewriting `.mdx` extensions to `.md`.

### Platform-by-Platform Conversion Matrix

| Source Platform | Config File | Admonitions / Containers | Tabs / Steps | Static Root Files |
|-----------------|-------------|--------------------------|--------------|-------------------|
| **Docusaurus** | `docusaurus.config.js` + `sidebars.js` → `docmd.config.js` | `:::note Title` → `::: callout note "Title"` (or `<Callout>`) | `<Tabs>` / `<TabItem>` → `<Tabs>` / `<Tab>` or `::: tabs` | `static/` → `public/` |
| **VitePress** | `.vitepress/config.ts` → `docmd.config.js` | `::: tip Title` → `::: callout tip "Title"` | `::: code-group` → `::: tabs` | `public/` → `public/` (identical) |
| **MkDocs (Material)** | `mkdocs.yml` → `docmd.config.js` | `!!! note "Title"` → `::: callout note "Title"` | `=== "Tab"` → `::: tabs` + `::: tab "Tab"` | `docs/CNAME` → `public/CNAME` |
| **Mintlify** | `mint.json` → `docmd.config.js` | `<Note>`, `<Warning>`, `<Tip>` → `<Callout type="...">` | `<Tabs>`, `<Tab>`, `<Steps>`, `<Card>` work natively in `.mdx` | Root static files → `public/` |
| **GitBook** | `SUMMARY.md` → `navigation` array in `docmd.config.js` | `{% hint style="info" %}` → `::: callout info` | `{% tabs %}` / `{% tab title="..." %}` → `::: tabs` / `::: tab` | `.gitbook/assets/` → `assets/` |

---

## 3. Post-Migration Verification Checklist

Run the following sequence after migrating any project to `docmd 0.10.0`:

```bash
# 1. Check config schema and plugin health
npx docmd doctor

# 2. Validate internal links, assets, and container syntax
npx docmd validate --strict

# 3. Run a full production build
npx docmd build --strict
```