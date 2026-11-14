---
name: docmd-writer
description: Use this skill when writing or reviewing prose inside a docmd site. Owns Diátaxis doc types, voice, page structure, and code-block conventions; defers to docmd-skills for all docmd-specific syntax (containers, explicit closers, playgrounds, tooltips, MDX components, variables, OpenAPI blocks, Mermaid, and frontmatter). Multi-lingual, OKF-aware, and SEO-aware.
audience: writer
load_command: docmd-skills writer <dir>
version: 1.3.0
verified_against:
  docmd: "0.10.0"
  node: ">=20"
  dev_node: ">=24"
  tested_on: 2026-11-14
repository: https://github.com/docmd-io/docmd-skills
docs: https://docs.docmd.io
llms_context: https://docs.docmd.io/llms-full.txt
siblings:
  - name: docmd-skills
    when: configuring, building, or deploying the docmd site itself, or looking up exact container/MDX/variable syntax
  - name: docmd-dev
    when: working on the docmd framework in the cloned `docmd/` monorepo or building custom plugins/templates
---

# docmd — Agent Skill (Writer)

Use this skill when the user wants to **write or improve the prose** inside a `docmd` site — introductions, tutorials, how-to guides, reference descriptions, headings, callouts, code-block captions, and structural edits. It is loaded by `npx docmd-skills writer <dir>` and can be called standalone or alongside its sibling skills (`docmd-skills` and `docmd-dev`).

## When to use this skill

Use it when the user wants to:

- Draft a new `.md` or `.mdx` page or section of an existing `docmd` site
- Restructure pages into clearer tutorial / how-to / reference / explanation shapes (Diátaxis) and map them to OKF `type` metadata
- Tighten the voice, shorten paragraphs, or fix heading hierarchy
- Apply the **file-title rule** to code blocks in a translated or new page
- Choose between static illustrative blocks, runnable file blocks, or interactive `::: playground` blocks
- Review existing prose and propose edits

Do not use it for: site configuration (`docmd.config.js`), CLI commands (`docmd build`, `docmd serve`, `docmd doctor`), deployment pipelines, or plugin/template authoring. Those belong to **docmd-skills** and **docmd-dev**.

## Loading & Sibling Skill Rules

All 3 skills in this repository (`docmd-skills`, `docmd-dev`, `docmd-writer`) are sibling skills that can be called individually on demand or cross-called when a task spans boundaries:

- Load **docmd-writer** whenever the user pastes, edits, or asks to draft or improve prose in `.md` or `.mdx` files inside a `docmd` documentation tree.
- The `docmd` docs site itself uses `docmd`, so writing for `docs.docmd.io` (`v10/`) also counts as a `docmd-writer` task.

### Docmd 0.10.0 Awareness

When the target site uses `docmd 0.10.0`, pages can carry `docmd`-specific syntax elements whose mechanics are documented in **docmd-skills**:

- **`:::` containers & explicit `::: /type` closers** — callouts, cards, grids, tabs (`::: tab`), steps (`::: step`), collapsibles (`::: details open`), heroes, buttons, changelogs (`::: log`), interactive playgrounds (`::: playground` / ```` ```js playground ````), Mermaid containers (`::: mermaid`), and inline/block hover tooltips (`::: tip` / `::: tooltip`)
- **Native MDX components (`.mdx` & `.md`)** — `<Callout>`, `<Cards>`, `<Card>`, `<Tabs>`, `<Tab>`, `<Steps>`
- **Variables & Personalisation (`{{ var }}`)** — static build variables (`{{ site.title }}`, `{{ docmd.version }}`), reactive user tokens (`{{ user.apiKey || "YOUR_API_KEY" }}`), and escaped literal tokens (`\{{ var }}`)
- **OpenAPI blocks** — ```` ```openapi ```` inline YAML/JSON specs or external spec paths
- **Frontmatter & OKF metadata** — `title`, `description`, `type` (`concept` | `guide` | `reference` | `api` | `runbook`), `tags`, `keywords`, `okf`, `llms`, `ldJson`, `template`, `layout`

All syntax details live in **docmd-skills** ([references/formatting.md](../docmd-skills/references/formatting.md) and [references/variables.md](../docmd-skills/references/variables.md)). Load **docmd-skills** alongside this skill whenever the page uses any of those features; defer to it for exact container attributes, frontmatter keys, and variable interpolation rules. This skill owns the **prose inside and around** those elements — voice, structure, doc type, and code-block conventions.

## Voice baseline

All pages in scope use **British English** by default. Use:

- `colour`, `behaviour`, `organise`, `centre`, `customise`, `favour`, `normalise`, `localisation` (not `color`, `behavior`, `organize`, `center`, `customize`, `favor`, `normalize`, `localization` — except inside literal code/config identifiers).
- Active voice, second person (`you`), present tense.
- One idea per sentence. Short paragraphs (2–4 sentences).
- Address the reader directly; avoid "we" except in tutorials with a clear narrator.
- Do not pad. Do not apologise. Do not use filler openings ("It's worth noting that…", "In this section we will…").

## Reference index

Each row is a reference file included with `docmd-skills writer`.

| Reference | CLI install subcommand | Use it for |
| --- | --- | --- |
| [references/doc-types.md](./references/doc-types.md) | `docmd-skills writer` | Choosing between tutorial / how-to / reference / explanation (Diátaxis), what each owes the reader, and mapping to OKF `type` frontmatter |
| [references/voice-and-style.md](./references/voice-and-style.md) | `docmd-skills writer` | Voice, tense, canonical `docmd 0.10.0` terminology, inclusive language, British-English rules |
| [references/headings-and-structure.md](./references/headings-and-structure.md) | `docmd-skills writer` | Universal page skeleton (Title → Orientation → Prerequisites → Body → Next steps), heading hierarchy, callout & tooltip restraint |
| [references/code-blocks.md](./references/code-blocks.md) | `docmd-skills writer` | Language identifiers (`js`, `ts`, `mdx`, `openapi`, `mermaid`), the file-title rule, runnable vs illustrative vs interactive `playground`, and variable escaping |

## Workflows

### 1. Drafting a new page

1. Decide the Diátaxis doc type from [references/doc-types.md](./references/doc-types.md) and set the corresponding frontmatter (`title`, `description`, `type`, `tags`).
2. Follow the universal skeleton from [references/headings-and-structure.md](./references/headings-and-structure.md).
3. Apply voice rules from [references/voice-and-style.md](./references/voice-and-style.md).
4. For every code block whose example is about a specific file, follow [references/code-blocks.md](./references/code-blocks.md) and add the file title.
5. For container syntax (explicit `::: /type` closers, `playground`, `mermaid`, `tip`, MDX components, and `{{ variable }}` tokens), defer to **docmd-skills** ([references/formatting.md](../docmd-skills/references/formatting.md) and [references/variables.md](../docmd-skills/references/variables.md)).

### 2. Reviewing existing prose

1. Read the page in full once for intent.
2. Identify doc-type mismatch (a "tutorial" that explains instead of walking through, a "how-to" that lectures).
3. Run the headings-and-structure checklist ([references/headings-and-structure.md](./references/headings-and-structure.md)).
4. Run the code-blocks checklist ([references/code-blocks.md](./references/code-blocks.md)) and load **docmd-skills** alongside whenever verifying container closers (`::: /type`), frontmatter shape, or variable interpolation.
5. Apply voice edits in a single pass — do not micro-edit line by line.

### 3. Translating or re-translating

Translation work uses this skill for voice and structure, and **docmd-skills** for container syntax and i18n routing. The code-block file-title rule still applies to every translation — never inherit an omission from the source. Preserve variable tokens (`{{ ... }}`) and explicit container closers (`::: /callout`, `::: /tabs`) untouched while translating human-facing titles (`title:"..."`).

## Cross-skill navigation

- **[docmd-skills](../docmd-skills/SKILL.md)** — load for container syntax, MDX components, Variables & Personalisation, frontmatter keys, navigation rules, and CLI/build/serve context.
- **[docmd-dev](../docmd-dev/SKILL.md)** — load only when the prose lives inside the cloned `docmd/` monorepo (template demos, plugin READMEs, architecture notes) or when documenting internal framework APIs.