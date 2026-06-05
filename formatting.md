# docmd Formatting & Frontmatter
> Full docs: [Containers](https://docs.docmd.io/content/containers/) · [Frontmatter](https://docs.docmd.io/content/frontmatter/)

## Frontmatter (YAML at top of `.md`)
```yaml
---
title: "Page Title"          # Sets HTML <title> and page header. Strongly recommended.
description: "SEO summary"  # Meta description for search engines and search results
keywords: ["docs", "api"]   # Meta keywords array
noindex: false               # Set true to exclude this page from search index and sitemap
llms: true                   # Set false to exclude from llms.txt AI context files
hideTitle: false             # Hides the sticky header title (useful with custom H1s)
bodyClass: "custom-class"    # Adds CSS class to <body> tag
layout: "full"               # "full" = max width, hides right-hand TOC sidebar
toc: true                    # Set false to disable Table of Contents entirely
noStyle: false               # Strip all UI (sidebar, header, footer) — for custom landing pages
titleAppend: true            # Set false to stop appending site title to <title> tag
---
```
When `noStyle: true`, opt-in to specific components:
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
Per-page plugin overrides in frontmatter: `plugins: { math: true, threads: false }`
Per-page SEO overrides: `seo: { image: "...", canonicalUrl: "...", aiBots: false }`

## Self-Closing Rules

| Container | Self-closing | Needs `:::` close |
|:--|:--|:--|
| callout, steps, card, grids/grid, tabs, changelog, collapsible, hero | No | Yes |
| **button, tag, embed** | **Yes** | **Never — a `:::` after these closes the parent container** |

## Callouts
```markdown
::: callout warning "Breaking Change" icon:alert-triangle
Content with full markdown support.
:::
```
Types: `info` · `tip` · `warning` · `danger` · `success`
Migration aliases (VitePress/Docusaurus compatible): `:::tip` `:::warning` `:::danger` `:::info` `:::note` `:::caution`

## Steps
```markdown
::: steps

1. **Step Title**
   Description. Supports nested code blocks and callouts.

2. **Next Step**
   More content here.

:::
```
Blank lines between items required. Bold first line of each item = step title.

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
Columns auto-balance widths. Stack vertically on mobile.

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
`==` defines each panel. Max 6 tabs. No nesting tabs inside tabs. Active tab state persists across SPA navigation.

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
Each `==` entry gets a timeline badge. Supports full markdown inside (callouts, code blocks, etc.)

## Collapsible
```markdown
::: collapsible "FAQ Question"
Answer content (search-indexed and included in llms.txt).
:::

::: collapsible open "Expanded By Default"
Visible content — `open` flag starts it expanded.
:::
```
Alias: `:::details` (VitePress-compatible).

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
`layout:split` (`== side` divider) · `layout:slider` (`== slide` divider) · `glow:true` (radial gradient bg)

## Button *(self-closing — never add `:::` after)*
```markdown
::: button "Label" /internal/path
::: button "External" external:https://github.com icon:github
::: button "Styled" /path color:crimson icon:alert-circle
```
Props: `external:URL` (new tab) · `color:VALUE` (CSS color/hex) · `icon:NAME` (Lucide icon)

## Tag *(self-closing — never add `:::` after)*
```markdown
::: tag "v0.8.6" color:blue
::: tag "Deprecated" color:#ef4444
::: tag "Verified" icon:check-circle color:#10b981
::: tag "Release Notes" icon:external-link link:./release-notes.md
```
Props: `color:VALUE` · `icon:NAME` · `link:URL` (makes tag clickable)
Inline usage: `Added in ::: tag "v0.8" color:blue and works perfectly.`

## Embed *(self-closing — never add `:::` after)*
```markdown
::: embed "https://www.youtube.com/watch?v=0CSyIBHQy9g"
```
Supported: YouTube, Vimeo, TikTok, X/Twitter, Reddit, Instagram, GitHub Gists, CodePen, Figma, Spotify, SoundCloud, Google Maps.
Uses [embed-lite](https://github.com/mgks/embed-lite). Falls back to hyperlink button for unsupported URLs. URL must be quoted.

## Nesting
Use four-backtick fences when nesting code blocks inside containers to avoid parser conflicts.