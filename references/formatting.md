---
description: Reference for docmd markdown extensions, containers, and frontmatter. Use when writing docmd content or understanding formatting rules.
when_to_use: |
  Read this file when you are:
  - Authoring a doc page and need to know which container syntax exists
  - Setting frontmatter on a `.md` file (title, description, order, noindex, llms, layout, seo.*, components.*)
  - Choosing between `:::tip` and `::: callout tip` syntax
  - Embedding video, code, or Mermaid diagrams inside content
  - Migrating VitePress/Docusaurus-style containers into docmd
audience: user
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-19
---

# Formatting Reference

docmd is a superset of CommonMark. Standard Markdown renders unchanged; the containers and tabs in this file are the additions.

Full docs:
* Containers - https://docs.docmd.io/content/containers/
* Frontmatter - https://docs.docmd.io/content/frontmatter

## Frontmatter {#frontmatter}

YAML frontmatter at the top of `.md` files:

```yaml
---
title: "Page Title"          # Sets HTML <title> and page header. Strongly recommended.
description: "SEO summary"  # Meta description for search engines
keywords: ["docs", "api"]   # Meta keywords array
noindex: false               # Set true to exclude from search index and sitemap
llms: true                   # Set false to exclude from llms.txt AI context files
hideTitle: false             # Hides the sticky header title
bodyClass: "custom-class"    # Adds CSS class to <body> tag
layout: "full"               # "full" = max width, hides right-hand TOC
toc: true                    # Set false to disable Table of Contents
noStyle: false               # Strip all UI (sidebar, header, footer)
titleAppend: true            # Set false to stop appending site title to <title>
order: 1                     # Sidebar ordering (lower = higher). Numbers, not strings.
---
```

Note: `order` is a number, not a string. `order: "1"` sorts alphabetically rather than numerically.

### Component Opt-In (when `noStyle: true`) {#component-opt-in}

When you set `noStyle: true` (e.g. for a landing page), turn components back on individually:

```yaml
components:
  meta: true       # SEO metadata
  favicon: true    # Site favicon
  css: true        # docmd-main.css
  theme: true      # Theme styles
  highlight: true  # Syntax highlighting
  scripts: true    # SPA router logic
  sidebar: true    # Navigation sidebar
  footer: true     # Site footer
```

If you set `noStyle: true` and forget to re-enable `css: true` and `theme: true`, the page renders unstyled. Re-enable at least `css`, `theme`, and `highlight` for a normal-looking page.

### Per-Page Overrides {#per-page-overrides}

```yaml
# Plugin overrides
plugins:
  math: true
  threads: false

# SEO overrides
seo:
  image: "/assets/og.png"
  canonicalUrl: "https://example.com/page"
  aiBots: false
```

## Container Syntax {#container-syntax}

### Self-Closing Rules {#self-closing-rules}

| Container | Self-closing | Needs `:::` close |
|:--|:--|:--|
| callout, steps, card, grids/grid, tabs, changelog, collapsible, hero | No | Yes |
| button, tag, embed | Yes | Never |

A `:::` after a `button`, `tag`, or `embed` closes the parent container, not the element. If you need a button/tag/embed, write it as `::: button "..."` on a single line with no closing fence.

## Callouts {#callouts}

```markdown
::: callout warning "Breaking Change" icon:alert-triangle
Content with full markdown support.
:::
```

Types: `info`, `tip`, `warning`, `danger`, `success`.

Migration aliases (VitePress/Docusaurus compatible):
- `:::tip`
- `:::warning`
- `:::danger`
- `:::info`
- `:::note`
- `:::caution`

The bare `:::tip` form uses the next paragraph as the title; the `::: callout tip "..."` form takes an explicit title. Pick one per project.

## Steps {#steps}

```markdown
::: steps

1. **Step Title**
   Description. Supports nested code blocks and callouts.

2. **Next Step**
   More content here.

:::
```

Blank lines between items are required. Bold first line of each item = step title.

## Cards {#cards}

```markdown
::: card "Title" icon:zap
Card body — supports full markdown.
:::
```

## Grids {#grids}

```markdown
::: grids
    ::: grid
        ::: card "Column 1" icon:zap
        Content.
        :::
    :::
    ::: grid
        ::: card "Column 2" icon:layers
        Content.
        :::
    :::
:::
```

Columns auto-balance widths and stack vertically on mobile.

## Tabs {#tabs}

````markdown
::: tabs

== tab "pnpm" icon:boxes
```bash
pnpm add @docmd/core
```

== tab "npm" icon:box
```bash
npm install @docmd/core
```

:::
````

- `==` defines each panel
- Max 6 tabs
- No nesting tabs inside tabs (use a grid of cards instead)
- Active tab state persists across SPA navigation

## Changelogs {#changelogs}

```markdown
::: changelog

== v2.0.0 (2026-03-15)
### Major Overhaul
- New SPA router.
- Isomorphic plugin system.

== v1.0.0 (2024-05-01)
Initial release.

:::
```

Each `==` entry gets a timeline badge and supports full markdown inside.

## Collapsible {#collapsible}

```markdown
::: collapsible "FAQ Question"
Answer content (search-indexed and included in llms.txt).
:::

::: collapsible open "Expanded By Default"
Visible content — `open` flag starts it expanded.
:::
```

Alias: `:::details` (VitePress-compatible).

## Hero {#hero}

```markdown
::: hero layout:split glow:true
# Headline
Tagline text.
::: button "CTA" /getting-started
== side
    ::: embed "https://youtube.com/watch?v=..."
:::
```

Layouts:
- `layout:split` — Use `== side` divider
- `layout:slider` — Use `== slide` divider
- `glow:true` — Radial gradient background

## Button (Self-Closing) {#button}

```markdown
::: button "Label" /internal/path
::: button "External" external:https://github.com icon:github
::: button "Styled" /path color:crimson icon:alert-circle
```

Props:
- `external:URL` — Open in new tab
- `color:VALUE` — CSS color/hex
- `icon:NAME` — Lucide icon name

## Tag (Self-Closing) {#tag}

```markdown
::: tag "v0.8.6" color:blue
::: tag "Deprecated" color:#ef4444
::: tag "Verified" icon:check-circle color:#10b981
::: tag "Release Notes" icon:external-link link:./release-notes.md
```

Props:
- `color:VALUE` — CSS color/hex
- `icon:NAME` — Lucide icon name
- `link:URL` — Makes tag clickable

Inline usage:
```markdown
Added in ::: tag "v0.8" color:blue and works perfectly.
```

## Embed (Self-Closing) {#embed}

```markdown
::: embed "https://www.youtube.com/watch?v=0CSyIBHQy9g"
```

Supported platforms:
- YouTube, Vimeo, TikTok
- X/Twitter, Reddit, Instagram
- GitHub Gists, CodePen, Figma
- Spotify, SoundCloud
- Google Maps

Uses embed-lite (https://github.com/mgks/embed-lite); falls back to a hyperlink button for unsupported URLs. The URL must be quoted.

## Nesting Code Blocks {#nesting-code-blocks}

Use four-backtick fences when nesting code blocks inside containers:

`````markdown
::: callout info "Example"
    ````markdown
        ```javascript
        const x = 42;
        ```
    ````
:::
`````

The outermost fence is four backticks, the next is three, the inner is two. Off-by-one backticks is the most common container bug after the `:::` close issue.

## Common Patterns {#common-patterns}

### Landing Page {#landing-page}

```markdown
---
noStyle: true
---

::: hero layout:split glow:true
# Welcome to My Docs
Beautiful documentation for your project.
::: button "Get Started" /getting-started
== side
    ::: embed "https://youtube.com/watch?v=..."
:::

::: grids
    ::: grid
        ::: card "Quick Start" icon:zap
        Get up and running in minutes.
        :::
    :::
    ::: grid
        ::: card "API Reference" icon:book
        Complete API documentation.
        :::
    :::
:::
```

### API Documentation {#api-documentation}

```markdown
---
layout: full
---

# API Overview

::: tabs

== tab "JavaScript"
```javascript
import { build } from '@docmd/core';
await build('./config.json');
```

== tab "CLI"
```bash
docmd build
```

:::

::: callout warning "Breaking Change"
The v2.0 API has changed significantly.
:::
```

### Changelog {#changelog}

```markdown
---
title: Changelog
---

# Changelog

::: changelog

== v2.0.0 (2026-03-15)
### Major Changes
- Complete rewrite of build engine
- New plugin architecture

== v1.5.0 (2025-12-01)
### Features
- Added semantic search

:::
```

## See Also {#see-also}

- [SKILL.md §6](../SKILL.md#6-markdown-extensions) — top 5 copy-paste snippets
- [SKILL.md §7](../SKILL.md#7-compatibility-notes) — compatibility notes across the whole tool
- [config.md](./config.md) — site-level config that pairs with frontmatter
- [plugins.md](./plugins.md) — math (KaTeX) and Mermaid are plugins, not built-ins