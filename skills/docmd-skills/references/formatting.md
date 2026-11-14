---
title: Formatting & Containers
description: Full syntax reference for frontmatter, custom containers, explicit closers, playgrounds, Mermaid, tooltips, Iconify icons, and MDX components in docmd 0.10.0.
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Formatting & Containers

## 1. Frontmatter

Every `.md` or `.mdx` file should start with YAML frontmatter enclosed in `---`. If frontmatter is omitted, `docmd` logs a warning, uses the first `# H1` as the page title, and processes the page normally.

```yaml
---
title: Page Title                   # Required (falls back to first H1 if omitted)
description: Meta description       # Recommended — SEO, link cards, OKF concepts, & search snippets
permalink: /custom-url/             # Override file-based URL routing
layout: full                        # 'default' (with sidebar) | 'full' (no sidebar / landing page)
template: custom-landing            # Render this page using a specific page template from the active theme
toc: false                          # Disable the right-hand "On This Page" table of contents
noindex: true                       # Exclude from search index, sitemap.xml, and llms.txt
llms: false                         # Exclude from llms.txt & llms-full.txt only (keeps page in search/sitemap)
okf: false                          # Exclude from Open Knowledge Framework (OKF) generation (or pass { type: 'guide' })
type: guide                         # Semantic document classification ('concept' | 'guide' | 'reference' | 'api' | 'runbook')
tags:                               # Merged with 'keywords' for SEO, search filtering, and OKF indexing
  - configuration
  - containers
keywords:
  - markdown
  - mdx
author: Jane Doe                    # Attribution metadata
date: 2026-11-14                    # Publication date
version: "0.10.0"                   # Content version tag
titleAppend: false                  # Suppress automatic "| Site Title" suffix on the <title> tag
editUrl: false                      # Disable the "Edit this page" footer link on this page
banner: null                        # Suppress global announcement banners on this page
ldJson:                             # Inject custom Schema.org JSON-LD structured data for this page
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Formatting & Containers"
seo:                                # Nested SEO overrides (canonicalUrl, ogImage, twitterCard, aiBots)
  canonicalUrl: https://docs.example.com/content/formatting
components:                         # Per-page UI chrome overrides
  sidebar: false
  footer: false
---
```

> **Note:** Frontmatter strings (`title`, `description`, etc.) are automatically exposed to the [Variables & Personalisation Engine](./variables.md) as `{{ page.title }}`, `{{ page.description }}`, `{{ page.slug }}`, and `{{ page.path }}`.

---

## 2. Container Syntax Rules (v0.10.0)

`docmd` custom containers use `:::` fences and support three authoring improvements introduced in v0.9.x–v0.10.0:

1. **Explicit Closing Tags (`::: /type`)**: Every container can be closed either with a generic `:::` fence or an explicit `::: /<type>` closer (`::: /callout`, `::: /tabs`, `::: /card`, `::: /grids`, `::: /steps`, `::: /collapsible`, `::: /hero`, `::: /changelog`, `::: /mermaid`, `::: /playground`, `::: /tip`). Explicit closers prevent nesting ambiguity when containers are nested multiple levels deep.
2. **Universal Key-Value Attributes**: Container headers accept `key:value` or `key:"quoted value"` arguments in addition to positional titles:
   ```markdown
   ::: callout warning title:"Database Migration Required" icon:alert-triangle
   Run the migration script before restarting the worker pool.
   ::: /callout
   ```
3. **Trailing Comments (`# comment`)**: Any container opening or closing fence can end with `# comment` (requires a space before `#`), which is stripped at compile time:
   ```markdown
   ::: grids 3 # Feature comparison grid
   ...
   ::: /grids # End feature grid
   ```

---

## 3. Core Content Containers

### Callouts (`::: callout`)

Types: `info`, `note`, `tip`, `warning`, `danger`, `success`.

```markdown
::: callout tip "Pro Tip"
Use `docmd dev` for live reload while editing documentation.
::: /callout

::: callout danger title:"Breaking Change" icon:shield-alert
Tokens issued before v0.10.0 must be rotated.
::: /callout
```

### Cards & Grids (`::: card`, `::: grids`)

Single or adjacent `::: card` blocks automatically wrap in a responsive card grid. Supports `title`, `url`, `icon`, and trailing comments:

```markdown
::: card "Quick Start" icon:zap url:"/getting-started/"
Get up and running in under 2 minutes.
::: /card

::: card title:"API Reference" icon:code url:"/api/"
Complete programmatic and REST API documentation.
::: /card
```

For multi-column layout of arbitrary Markdown content, use `::: grids [cols]`:

```markdown
::: grids 2
::: column
Left column content with lists, code blocks, or callouts.
::: /column
::: column
Right column content.
::: /column
::: /grids
```

### Tabs (`::: tabs`)

Tabs can be declared using either the shorthand `== Tab Name [icon]` marker or explicit `::: tab "Tab Name" icon:...` sub-containers:

```markdown
::: tabs
== npm icon:package
```bash
npm install -g @docmd/core
```

== pnpm icon:zap
```bash
pnpm add -g @docmd/core
```

== yarn
```bash
yarn global add @docmd/core
```
::: /tabs
```

Explicit sub-container form (recommended when nesting blocks inside tabs):

```markdown
::: tabs
::: tab "JavaScript" icon:file-code
```js
import { build } from '@docmd/core';
```
::: /tab

::: tab "Python" icon:terminal
```python
print("Hello from docmd")
```
::: /tab
::: /tabs
```

### Steps (`::: steps`)

Renders a numbered vertical stepper. Supports standard numbered lists (`1.`) or explicit `::: step` sub-containers:

```markdown
::: steps
::: step "Install the CLI"
```bash
npm install -g @docmd/core
```
::: /step

::: step "Initialise your project"
```bash
docmd init
```
::: /step

::: step "Start the dev server"
```bash
docmd dev
```
::: /step
::: /steps
```

### Collapsible / Details (`::: collapsible`, `::: details`)

Aliases: `collapsible`, `details`, `accordion`. Add `open` to expand by default:

```markdown
::: collapsible open "Click to view advanced options"
Hidden content revealed by default because `open` is set.
::: /collapsible

::: details title:"Raw JSON Payload"
```json
{ "status": "ok" }
```
::: /details
```

### Hero Section (`::: hero`)

Used on landing pages (`layout: full`). Pair with `::: button`:

```markdown
::: hero
# Next-Gen Documentation
Fast, offline-first, AI-ready documentation engine.
::: button "Get Started" /getting-started/ color:#2563eb
::: button "GitHub" https://github.com/docmd-io/docmd
::: /hero
```

### Button (`::: button`)

Single-line directive (does not require a closing `:::`):

```markdown
::: button "Read the Guide" /guide/
::: button "External Link" external:https://example.com color:#10b981
```

### Changelog (`::: changelog`)

Timeline layout for release notes. Entries use either `== v1.0.0 - 2026-11-14` shorthand or explicit `::: log` sub-containers:

```markdown
::: changelog
::: log version:"v0.10.0" date:"2026-11-14"
Added `::: playground`, native MDX, `docmd serve`, `docmd doctor`, and `public/` static copying.
::: /log

::: log version:"v0.9.9" date:"2026-09-20"
Introduced the Variables & Personalisation Engine (`{{ var }}`).
::: /log
::: /changelog
```

---

## 4. Interactive Playgrounds (`::: playground`)

Powered by the built-in `@docmd/plugin-playground` plugin (`v0.10.0`). Executes JavaScript in an isolated Web Worker or renders full HTML/CSS/JS inside a sandboxed iframe. Pages without playgrounds incur **0 KB** of extra client-side JavaScript.

### 1. Code Fence Shorthand

Add `playground` (and optional attributes) to any `js`, `javascript`, or `html` code fence:

````markdown
```js playground title="Array Pipeline"
const scores = [82, 95, 68, 91, 100];
const top = scores.filter(s => s >= 90);
console.log('Top scores:', top);
```
````

### 2. Multi-Block HTML + CSS + JS Container

Wrap multiple code fences inside `::: playground` to combine HTML, CSS, and JavaScript in a live preview:

````markdown
::: playground title:"Interactive Counter" layout:"split" view:"live" tab:"preview"
```html
<button id="btn">Clicked 0 times</button>
```
```css
button { padding: 8px 16px; border-radius: 6px; cursor: pointer; }
```
```js
let count = 0;
const btn = document.getElementById('btn');
btn.addEventListener('click', () => {
  count++;
  btn.textContent = `Clicked ${count} times`;
  console.log('Count is now', count);
});
```
::: /playground
````

### 3. External File Reference (`src` / `file`)

Load code directly from a file relative to the current Markdown document or the project root using a self-closing `/:::` tag:

```markdown
::: playground src="./examples/fetch-users.js" title:"Fetch Users Example" /:::
```

### Playground Attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `title` | `"..."` | Language badge | Header bar title |
| `src` / `file` | `"./path.js"` | — | Load code from disk at build time |
| `icon` | `<lucide-name>` | — | Header icon |
| `lang` | `js` \| `html` \| `css` | Auto-detected | Override syntax language |
| `live` | flag / `true` | `false` (JS), `true` (HTML) | Auto-run on page load |
| `view` | `"code"` \| `"live"` | `"code"` (JS), `"live"` (HTML) | Initial active mode |
| `tab` | `"preview"` \| `"console"` | `"preview"` (HTML), `"console"` (JS) | Initial output tab |
| `layout` | `"stacked"` \| `"split"` | `"stacked"` | Editor/output arrangement |
| `nocode` | flag / `true` | `false` | Hide code editor and show output only |
| `readonly` | flag / `true` | `false` | Disable live editing in the browser |

---

## 5. Mermaid Diagrams (`::: mermaid` & ```` ```mermaid ````)

In addition to standard ```` ```mermaid ```` code fences, `docmd 0.10.0` provides a `::: mermaid` container for per-diagram titles, icons, alignment, zoom controls, and theme overrides:

```markdown
::: mermaid title:"Request Lifecycle" icon:git-branch align:center zoom:true theme:neutral
graph LR
  Client -->|HTTPS| Serve[docmd serve]
  Serve -->|Static HTML| Cache[Gzip Cache]
  Serve -->|POST /mcp| MCP[MCP Handler]
::: /mermaid
```

| Attribute | Values | Description |
|-----------|--------|-------------|
| `title` | `"..."` | Optional figure header / caption |
| `icon` | `<lucide-name>` | Icon next to the diagram title |
| `align` | `left` \| `center` \| `right` | Horizontal alignment (`center` default) |
| `zoom` | `true` \| `false` | Enable interactive pan/zoom modal on click |
| `theme` | `default` \| `dark` \| `forest` \| `neutral` \| `base` | Per-diagram Mermaid theme override |

---

## 6. Hover Tooltips (`::: tip` / `::: tooltip`)

Render accessible inline or block hover tooltips with optional links:

```markdown
<!-- Inline tooltip -->
The build emits an ::: tip "Open Knowledge Framework — structured machine-readable knowledge bundle" term:"OKF" url:"/plugins/okf/" ::: /tip directory alongside your static HTML.

<!-- Block tooltip wrapper -->
::: tooltip "Requires Node.js >= 20 and @docmd/core 0.10.0" title:"Compatibility Note"
Hover over this block to see version constraints.
::: /tooltip
```

---

## 7. Icons (Lucide & Iconify)

- **Built-in Lucide Icons**: Available everywhere via `icon:<name>` (e.g. `icon:rocket`, `icon:book-open`, `icon:check-circle`).
- **Iconify Icons (`@docmd/plugin-iconify`)**: When the optional Iconify plugin is enabled (`npx @docmd/core add iconify`), reference over 200,000 icons from Material Design, Phosphor, Simple Icons, Tabler, Carbon, and more using `icon:iconify:<set>:<name>` or `icon:iconify-<set>:<name>`:
  ```markdown
  ::: card "GitHub Actions" icon:iconify:simple-icons:githubactions url:"/deployment/"
  Automated CI/CD workflows.
  ::: /card
  ```
  All Iconify icons are resolved at build time and inlined as pure `<svg>` nodes (zero runtime CDN requests).

---

## 8. MDX Components (`.mdx` & `.md`)

Powered by `@docmd/plugin-mdx` (`@docmd/lite-mdx`), JSX components work out-of-the-box in both `.mdx` and `.md` files with zero React runtime payload shipped to the browser:

```mdx
<Callout type="tip" title="Zero-Config MDX">
  Use JSX components directly alongside standard Markdown and `{{ site.title }}` variables.
</Callout>

<Cards cols={2}>
  <Card title="CLI Reference" icon="terminal" href="/cli/">
    Explore all `docmd` commands and flags.
  </Card>
  <Card title="Variables" icon="sliders" href="/variables/">
    Static and reactive personalisation tokens.
  </Card>
</Cards>

<Tabs>
  <Tab label="npm">
    ```bash
    npm install @docmd/core
    ```
  </Tab>
  <Tab label="pnpm">
    ```bash
    pnpm add @docmd/core
    ```
  </Tab>
</Tabs>

<Steps>
  1. Write `.mdx` or `.md` content.
  2. Run `docmd build`.
</Steps>
```

| Built-in MDX Component | Props | Equivalent Container |
|------------------------|-------|----------------------|
| `<Callout>` | `type="info\|tip\|warning\|danger\|note\|success"`, `title` | `::: callout` |
| `<Cards>` | `cols={2\|3\|4}` | `::: grids` |
| `<Card>` | `title`, `icon`, `href` / `url` | `::: card` |
| `<Tabs>` | — | `::: tabs` |
| `<Tab>` / `<Tabs.Tab>` | `label` / `title`, `icon` | `::: tab` / `==` |
| `<Steps>` | — | `::: steps` |

---

## 9. Images, Code Highlighting & Tables

### Image Attributes

```markdown
![Architecture Diagram](./assets/arch.png){.border .shadow width="600px" align="center" caption="System Architecture"}
```

| Class / Attribute | Effect |
|-------------------|--------|
| `.border` | Adds subtle border |
| `.shadow` | Adds drop shadow |
| `.rounded` | Rounds corners |
| `align="center"` / `.center` | Centres the image |
| `width="400px"` | Constrains display width |
| `caption="..."` | Renders a `<figcaption>` below the image |

### Code Blocks & Line Numbers

Standard fenced code blocks include a copy button automatically and are highlighted at build time via `@docmd/lite-hl`. Enable global line numbers in `docmd.config.js`:

```javascript
export default defineConfig({
  content: { codeHighlight: true, lineNumbers: true },
});
```

### Smart Copy-Code Variable Hydration

When a code block contains reactive `{{ user.* }}` variables (see [Variables & Personalisation](./variables.md)), clicking the **Copy** button copies the **live hydrated value** currently displayed in the reader's browser rather than the raw template token.