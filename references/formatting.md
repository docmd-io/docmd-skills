---
description: Reference for docmd markdown extensions, containers, and frontmatter. Use when writing docmd content or understanding formatting rules.
---

# Formatting Reference

Full docs:
* Containers - https://docs.docmd.io/content/containers/
* Frontmatter - https://docs.docmd.io/content/frontmatter/

## Frontmatter

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
---
```

### Component Opt-In (when `noStyle: true`)

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

### Per-Page Overrides

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

## Container Syntax

### Self-Closing Rules

| Container | Self-closing | Needs `:::` close |
|:--|:--|:--|
| callout, steps, card, grids/grid, tabs, changelog, collapsible, hero | No | Yes |
| **button, tag, embed** | **Yes** | **Never** |

**Important:** A `:::` after button, tag, or embed closes the *parent* container, not the element.

## Callouts

```markdown
::: callout warning "Breaking Change" icon:alert-triangle
Content with full markdown support.
:::
```

**Types:** `info` · `tip` · `warning` · `danger` · `success`

**Migration aliases** (VitePress/Docusaurus compatible):
- `:::tip`
- `:::warning`
- `:::danger`
- `:::info`
- `:::note`
- `:::caution`

## Steps

```markdown
::: steps

1. **Step Title**
   Description. Supports nested code blocks and callouts.

2. **Next Step**
   More content here.

:::
```

**Rules:**
- Blank lines between items required
- Bold first line of each item = step title

## Cards

```markdown
::: card "Title" icon:zap
Card body — supports full markdown.
:::
```

## Grids

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

**Features:**
- Columns auto-balance widths
- Stack vertically on mobile

## Tabs

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

**Rules:**
- `==` defines each panel
- Max 6 tabs
- No nesting tabs inside tabs
- Active tab state persists across SPA navigation

## Changelogs

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

**Features:**
- Each `==` entry gets a timeline badge
- Supports full markdown inside (callouts, code blocks, etc.)

## Collapsible

```markdown
::: collapsible "FAQ Question"
Answer content (search-indexed and included in llms.txt).
:::

::: collapsible open "Expanded By Default"
Visible content — `open` flag starts it expanded.
:::
```

**Alias:** `:::details` (VitePress-compatible)

## Hero

```markdown
::: hero layout:split glow:true
# Headline
Tagline text.
::: button "CTA" /getting-started
== side
    ::: embed "https://youtube.com/watch?v=..."
:::
```

**Layouts:**
- `layout:split` — Use `== side` divider
- `layout:slider` — Use `== slide` divider
- `glow:true` — Radial gradient background

## Button (Self-Closing)

```markdown
::: button "Label" /internal/path
::: button "External" external:https://github.com icon:github
::: button "Styled" /path color:crimson icon:alert-circle
```

**Props:**
- `external:URL` — Open in new tab
- `color:VALUE` — CSS color/hex
- `icon:NAME` — Lucide icon name

## Tag (Self-Closing)

```markdown
::: tag "v0.8.6" color:blue
::: tag "Deprecated" color:#ef4444
::: tag "Verified" icon:check-circle color:#10b981
::: tag "Release Notes" icon:external-link link:./release-notes.md
```

**Props:**
- `color:VALUE` — CSS color/hex
- `icon:NAME` — Lucide icon name
- `link:URL` — Makes tag clickable

**Inline usage:**
```markdown
Added in ::: tag "v0.8" color:blue and works perfectly.
```

## Embed (Self-Closing)

```markdown
::: embed "https://www.youtube.com/watch?v=0CSyIBHQy9g"
```

**Supported platforms:**
- YouTube, Vimeo, TikTok
- X/Twitter, Reddit, Instagram
- GitHub Gists, CodePen, Figma
- Spotify, SoundCloud
- Google Maps

**Features:**
- Uses embed-lite - https://github.com/mgks/embed-lite
- Falls back to hyperlink button for unsupported URLs
- URL must be quoted

## Nesting Code Blocks

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

## Common Patterns

### Landing Page

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

### API Documentation

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

### Changelog

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