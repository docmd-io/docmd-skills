---
title: Code Blocks
audience: writer
load_command: docmd-skills writer
---

# Code Blocks

docmd renders fenced code blocks with a language identifier and an optional **file title**. Both matter. The file title is the single most-missed rule in docmd prose, including translations.

## Anatomy of a code block

A docmd code block looks like this:

````md
```json "docmd.config.json"
{
  "title": "My Documentation"
}
```
````

- **Language identifier** (`json`) — drives syntax highlighting. Always required.
- **File title** (`"docmd.config.json"`) — the quoted string after the language identifier. Renders as a header bar above the code on the default and summer templates, with a copy button.

## The file-title rule

> Any code block whose example is clearly for a specific file MUST include the file name as a quoted title after the language identifier.

Apply the rule to **every** code block that shows the contents of a real file. Do not apply it to generic shell commands or language-agnostic examples.

| Code block content | Add file title |
| --- | --- |
| `docmd.config.json` | `"docmd.config.json"` |
| `package.json` | `"package.json"` |
| `navigation.json` | `"navigation.json"` |
| `assets/i18n/<locale>.json` | the actual filename, e.g. `"assets/i18n/fr.json"` |
| `.github/workflows/*.yml` | the workflow filename |
| `Dockerfile` | `"Dockerfile"` |
| `nginx.conf` | `"nginx.conf"` |
| `Caddyfile` | `"Caddyfile"` |
| Generic shell commands | none |
| Generic code samples (no file context) | none |
| YAML frontmatter (page metadata is generic) | none |

When the EN source omits a file title, the translation must still add it. Translations inherit structure, not omissions.

## When to use which language identifier

The identifier drives highlighting and (where supported) tooling integrations. Use the most specific identifier that matches the block.

| Content | Identifier |
| --- | --- |
| `docmd.config.json`, `navigation.json`, package manifests | `json` |
| YAML workflow files, Caddy / Nginx / K8s manifests | `yaml` (or `nginx` / `caddyfile` where docmd supports it) |
| Dockerfile | `dockerfile` |
| Shell commands | `bash` or `sh` — pick one and stay consistent |
| JavaScript / TypeScript | `js` / `ts` — match the file the reader would save the code into |
| CSS | `css` |
| HTML | `html` |
| Mermaid diagrams | `mermaid` |
| Markdown shown as an example | `md` |
| Plain output / logs | `text` or `plain` |
| Diff snippets | `diff` |

When in doubt, prefer the identifier that gives the best highlighting. `json` is almost always right for config; `bash` for shell; `text` for output you want the reader to read, not run.

## Runnable vs illustrative

Code blocks fall into two camps. Tell the reader which one they are looking at.

- **Runnable** — the reader can paste this into a file and it will work. Use complete files. No `...`, no `# rest of file`. Use the file-title rule.
- **Illustrative** — the block shows a pattern. Use ellipses or comments to indicate the omitted parts. Mark the block as illustrative if the omission is non-obvious.

For runnable blocks, prefer to show a **complete file** rather than a fragment. Showing the full file avoids three classes of bug:

- The reader's mental model of "what else goes in this file" is wrong.
- The translation loses context that the EN source compressed.
- The reader has to guess at indentation, trailing commas, and the closing brace.

If the file is genuinely too long, link to a real example in the repository rather than truncating it.

## Captions and surrounding prose

A code block needs one sentence before it that says what the reader is looking at. The sentence should make sense on its own — it is the alt text of the block.

**Good:**

> The minimal `docmd.config.json` for a single-language site looks like this:

**Bad:**

> Here is the config:

The block also usually needs one sentence after it that says what happens next — run it, replace a placeholder, save the file. Do not leave the block hanging.

## Inline code

Use inline code (single backticks) for:

- File names: `docmd.config.json`, `package.json`, `navigation.json`.
- CLI commands: `npx @docmd/core dev`, `docmd mcp`.
- Config keys: `theme.appearance`, `plugins`, `i18n.default`.
- Function and class names: `createActionDispatcher`, `EngineLoader`.
- Environment variables: `DOCMD_SKILLS_DIR`.
- Placeholders the reader will replace: `<your-repo>`, `<locale>`.

Do not use inline code for prose emphasis. If the word is not a literal the reader will type or paste, it does not need backticks.

## Highlighting and call-outs inside code

Use `// ...` (or the language's comment syntax) to mark omitted lines inside an illustrative block:

````md
```js "scripts/release.js"
// ...existing code...
const version = await bumpVersion('patch');
await publish(version);
// ...existing code...
```
````

Do not use `...` alone — it reads as spread syntax in JavaScript and confuses the highlight. Use comments to mark omissions explicitly.

## Quick checklist

Before committing a page, run this list for every code block on the page:

- [ ] Language identifier is present and specific.
- [ ] If the block shows a specific file, the file title is present in quotes.
- [ ] If the block is runnable, the file shown is complete.
- [ ] One sentence before the block names what it is.
- [ ] One sentence after the block tells the reader what to do next.
- [ ] Inline code is used only for literals (file names, CLI commands, config keys).
- [ ] No `...` alone inside an illustrative block — use a comment.
