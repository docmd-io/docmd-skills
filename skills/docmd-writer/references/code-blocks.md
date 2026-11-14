---
title: Code Blocks
audience: writer
load_command: docmd-skills writer
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Code Blocks

`docmd` renders fenced code blocks with a language identifier and an optional **file title**. Both matter. The file title is the single most-missed rule in `docmd` prose, including translations.

## Anatomy of a code block

A `docmd` code block looks like this:

````md
```javascript "docmd.config.js"
import { defineConfig } from '@docmd/core';

export default defineConfig({
  siteTitle: 'My Documentation',
});
```
````

- **Language identifier** (`javascript` / `js` / `json`) — drives build-time syntax highlighting via `@docmd/lite-hl`. Always required.
- **File title** (`"docmd.config.js"`) — the quoted string after the language identifier. Renders as a header bar above the code across official templates, complete with a copy button.

## The file-title rule

> Any code block whose example is clearly for a specific file MUST include the file name as a quoted title after the language identifier.

Apply the rule to **every** code block that shows the contents of a real file. Do not apply it to generic shell commands or language-agnostic snippets.

| Code block content | Add file title |
| --- | --- |
| `docmd.config.js` / `docmd.config.ts` / `docmd.config.json` | `"docmd.config.js"` (or matching extension) |
| `docmd.workspace.js` | `"docmd.workspace.js"` |
| `package.json` | `"package.json"` |
| `navigation.json` | `"navigation.json"` |
| `assets/i18n/<locale>.json` | the actual filename, e.g. `"assets/i18n/fr.json"` |
| `public/robots.txt`, `public/CNAME` | `"public/robots.txt"`, `"public/CNAME"` |
| `.github/workflows/*.yml` | the workflow filename, e.g. `".github/workflows/deploy.yml"` |
| `Dockerfile` | `"Dockerfile"` |
| `nginx.conf` | `"nginx.conf"` |
| `Caddyfile` | `"Caddyfile"` |
| Generic shell commands | none |
| Generic code samples (no file context) | none |
| YAML frontmatter (page metadata is generic) | none |

When the EN source omits a file title, the translation must still add it. Translations inherit structure, not omissions.

## When to use which language identifier

The identifier drives highlighting and `docmd` compiler integrations (`mermaid`, `openapi`, `playground`). Use the most specific identifier that matches the block.

| Content | Identifier |
| --- | --- |
| `docmd.config.js`, JavaScript / TypeScript modules | `js` / `javascript` / `ts` / `typescript` — match the file extension |
| `docmd.config.json`, `navigation.json`, `package.json` | `json` |
| YAML workflow files, OKF manifests (`okf.yaml`), K8s manifests | `yaml` |
| OpenAPI 3.0 / 3.1 interactive specification blocks | `openapi` (renders interactive UI via `@docmd/plugin-openapi`; use `yaml` or `json` only when showing raw unrendered source) |
| MDX examples containing JSX components (`<Callout>`, `<Tabs>`) | `mdx` |
| Markdown shown as an example | `md` or `markdown` |
| Dockerfile | `dockerfile` |
| Shell commands | `bash` or `sh` — pick one and stay consistent |
| CSS | `css` |
| HTML | `html` |
| Mermaid diagrams | `mermaid` (or `::: mermaid` container when adding `title`, `zoom`, or `align`) |
| Plain output / logs / directory trees | `text` or `plain` |
| Diff snippets | `diff` |

When in doubt, prefer the identifier that gives the best highlighting. `js` or `json` is right for config; `bash` for shell; `text` for output you want the reader to read, not run.

## Runnable, illustrative, or interactive playground

Code blocks in `docmd 0.10.0` fall into three categories. Make it clear to the reader which one they are looking at:

1. **Runnable file block** — the reader can paste this into a file and it will work. Use complete files. No `...`, no `// rest of file`. Always apply the file-title rule.
2. **Illustrative snippet** — the block highlights a single key or pattern. Use comments (`// ...existing config...`) to mark omitted lines explicitly.
3. **Interactive Playground (`::: playground` or ```` ```js playground ````)** — the reader can execute and edit the JavaScript or HTML/CSS/JS live in the browser via `@docmd/plugin-playground`. Use interactive playgrounds when demonstrating pure client-side logic, data transformations, or UI components where immediate visual/console feedback helps the reader learn faster. Prefer `::: playground src="./examples/demo.js" title:"..." /:::` when keeping runnable example files tested on disk.

For runnable blocks, prefer showing a **complete file** rather than a fragment. Showing the full file avoids three classes of bug:

- The reader's mental model of "what else goes in this file" is wrong.
- The translation loses context that the EN source compressed.
- The reader has to guess at imports (`import { defineConfig } from '@docmd/core'`), indentation, and closing braces.

If the file is genuinely too long, link to a real example in the repository rather than truncating it.

## Variables inside code blocks (`{{ ... }}` vs `\{{ ... }}`)

`docmd 0.10.0` interpolates `{{ variable }}` tokens inside fenced code blocks and inline code spans, and its Copy button copies live hydrated `{{ user.* }}` values:

- **Personalised reader examples**: Use reactive user variables with sensible fallbacks so readers see their own credentials or endpoints automatically:
  ````md
  ```bash
  curl -H "Authorization: Bearer {{ user.apiKey || 'YOUR_API_KEY' }}" https://api.example.com/v1/projects
  ```
  ````
- **Literal template syntax (Mustache, Handlebars, Vue, GitHub Actions `${{ }}`, or teaching `docmd` variables)**: Escape the opening braces with a leading backslash (`\{{ var }}`) whenever you want the reader to see literal `{{ var }}` without `docmd` evaluating it at build time. (Standard GitHub Actions `${{ secrets.TOKEN }}` is preserved automatically if `secrets.TOKEN` is not a defined `docmd` variable, or escape as `$\{{ secrets.TOKEN }}` if a collision exists.)

## Captions and surrounding prose

A code block needs one sentence before it that says what the reader is looking at. The sentence should make sense on its own — it is the alt text of the block.

**Good:**

> The minimal `docmd.config.js` for a single-language site looks like this:

**Bad:**

> Here is the config:

The block also usually needs one sentence after it that says what happens next — run it, replace a placeholder, or save the file. Do not leave the block hanging.

## Inline code

Use inline code (single backticks) for:

- File and directory names: `docmd.config.js`, `package.json`, `public/robots.txt`, `site/okf/okf.yaml`.
- CLI commands: `npx @docmd/core dev`, `docmd serve`, `docmd doctor`, `docmd mcp`.
- Config keys: `theme.appearance`, `plugins.okf`, `serve.actions.enabled`, `variables.dynamic`.
- Function and class names: `defineConfig`, `createActionDispatcher`, `resolveEngine`.
- Environment variables: `DOCMD_VAR_API_URL`, `DOCMD_NO_OPEN`, `DOCMD_STRICT`.
- Placeholders the reader will replace: `<your-repo>`, `<locale>`.

Do not use inline code for prose emphasis. If the word is not a literal the reader will type, inspect, or paste, it does not need backticks.

## Highlighting and call-outs inside code

Use `// ...existing code...` (or the language's comment syntax) to mark omitted lines inside an illustrative block:

````md
```js "scripts/release.js"
// ...existing code...
const version = await bumpVersion('patch');
await publish(version);
// ...existing code...
```
````

Do not use `...` alone — it reads as spread syntax in JavaScript and confuses the syntax highlighter. Use comments to mark omissions explicitly.

## Quick checklist

Before committing a page, run this list for every code block on the page:

- [ ] Language identifier is present and specific (`js`, `ts`, `json`, `yaml`, `bash`, `mdx`, `openapi`, `mermaid`, `text`).
- [ ] If the block shows a specific file, the file title is present in quotes.
- [ ] If the block is runnable, the file shown is complete (including `defineConfig` import where applicable).
- [ ] Literal `{{ ... }}` syntax meant to be shown verbatim is escaped as `\{{ ... }}`.
- [ ] One sentence before the block names what it is.
- [ ] One sentence after the block tells the reader what to do next.
- [ ] Inline code is used only for literals (file names, CLI commands, config keys, env vars).
- [ ] No `...` alone inside an illustrative block — use a comment.