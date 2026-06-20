---
name: docmd-writer
description: Use this skill when writing or reviewing prose inside a docmd site. Owns Diátaxis doc types, voice, page structure, and code-block conventions; defers to docmd-skills for all docmd-specific syntax (containers, tabs, cards, grids, steps, collapsibles, buttons, tags, embeds, changelogs, Mermaid, frontmatter). Multi-lingual and SEO-aware.
audience: writer
load_command: docmd-skills writer <dir>
version: 1.1.0
verified_against:
  docmd: "0.8.7"
  node: ">=20"
  dev_node: ">=24"
  tested_on: 2026-06-19
repository: https://github.com/docmd-io/docmd-skills
docs: https://docs.docmd.io
llms_context: https://docs.docmd.io/llms-full.txt
siblings:
  - name: docmd-skills
    when: configuring, building, or deploying the docmd site itself
  - name: docmd-dev
    when: working on the docmd framework in the cloned `docmd/` monorepo
---

# docmd — Agent Skill (Writer)

Use this skill when the user wants to **write or improve the prose** inside a docmd site — introductions, tutorials, how-to guides, reference descriptions, headings, callouts, code-block captions, and structural edits. It is loaded by `npx docmd-skills writer <dir>` and **adds** `docmd-writer/` alongside an existing `docmd-skills/` install.

## When to use this skill

Use it when the user wants to:

- Draft a new page or section of an existing docmd site
- Restructure pages into clearer tutorial / how-to / reference / explanation shapes
- Tighten the voice, shorten paragraphs, or fix heading hierarchy
- Apply the **file-title rule** to code blocks in a translated or new page
- Review existing prose and propose edits

Do not use it for: site configuration (`docmd.config.json`), CLI commands, build/deploy, plugin or template authoring. Those belong to **docmd-skills** and **docmd-dev**.

## Loading rules

- Load this skill whenever the user pastes, edits, or asks to "improve" prose in `.md` files inside a docmd `docs/` tree.
- The docmd docs site itself uses docmd, so writing for that site also counts as a docmd task.

### Docmd awareness

When the target site uses docmd, pages can carry docmd-specific elements that this skill does **not** author:

- `:::` containers — callouts, cards, grids, tabs, steps, collapsibles, buttons, tags, embeds, changelogs
- `mermaid` code blocks (diagrams)
- frontmatter shape (`title`, `description`, `template`, etc.)

All of those live in **docmd-skills** `references/formatting.md`. Load docmd-skills alongside this skill whenever the page will use any of them; defer to it for the exact container markers, frontmatter keys, and theme/asset behaviour. This skill owns the **prose between** those elements — voice, structure, doc type, and code-block conventions.

## Voice baseline

All pages in scope use **British English** by default. Use:

- `colour`, `behaviour`, `organise`, `centre`, `customise`, `favour` (not `color`, `behavior`, `organize`, `center`, `customize`, `favor`).
- Active voice, second person (`you`), present tense.
- One idea per sentence. Short paragraphs (2–4 sentences).
- Address the reader directly; avoid "we" except in tutorials with a clear narrator.
- Do not pad. Do not apologise. Do not use filler openings ("It's worth noting that…", "In this section we will…").

## Reference index

Each row is a reference file. The CLI column shows which install subcommand adds this file.

| Reference | CLI install subcommand | Use it for |
| --- | --- | --- |
| `references/doc-types.md` | `docmd-skills writer` | Choosing between tutorial / how-to / reference / explanation (Diátaxis) and what each one owes the reader |
| `references/voice-and-style.md` | `docmd-skills writer` | Voice, tense, terminology, inclusive language, British-English rules |
| `references/headings-and-structure.md` | `docmd-skills writer` | Universal page skeleton (Title → Orientation → Prerequisites → Body → Next steps), heading hierarchy, navigation patterns |
| `references/code-blocks.md` | `docmd-skills writer` | Language identifiers, the file-title rule for file-specific examples, captions, runnable vs illustrative |

## Workflows

### 1. Drafting a new page

1. Decide the doc type from `references/doc-types.md`.
2. Follow the universal skeleton from `references/headings-and-structure.md`.
3. Apply voice rules from `references/voice-and-style.md`.
4. For every code block whose example is about a specific file, follow `references/code-blocks.md` and add the file title.
5. For container syntax (callouts, tabs, cards, grids, steps, collapsibles, buttons, tags, embeds, changelogs, mermaid), defer to **docmd-skills** `references/formatting.md`.

### 2. Reviewing existing prose

1. Read the page in full once for intent.
2. Identify doc-type mismatch (a "tutorial" that explains instead of walking through, a "how-to" that lectures).
3. Run the headings-and-structure checklist.
4. Run the code-blocks checklist alongside whenever writing for a docmd site. It owns all container syntax (callouts, tabs, cards, grids, steps, collapsibles, buttons, tags, embeds, changelogs, Mermaid), frontmatter shape, and navigation rules. This skill owns the prose inside and around those elements
5. Apply voice edits in a single pass — do not micro-edit line by line.

### 3. Translating or re-translating

Translation work uses this skill for voice and structure, and **docmd-skills** for container syntax. The code-block file-title rule still applies to every translation — never inherit an omission from the source.

## Cross-skill navigation

- **docmd-skills** — load for container syntax, frontmatter keys, navigation rules, and CLI/build context.
- **docmd-dev** — load only when the prose lives inside the cloned `docmd/` monorepo (template demos, plugin READMEs, example content).
