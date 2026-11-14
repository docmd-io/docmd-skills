---
title: Voice and Style
audience: writer
load_command: docmd-skills writer
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Voice and Style

`docmd` documentation uses **British English**, active voice, second person, and present tense. The voice is direct, economical, and assumes an intelligent reader who would rather be working than reading.

## Spelling

Use British spelling throughout prose. The table below shows the common cases; when in doubt, prefer the British form.

| American | British |
| --- | --- |
| color | colour |
| behavior | behaviour |
| organize | organise |
| realize | realise |
| normalize | normalise |
| initialize | initialise |
| localization | localisation |
| customization | customisation |
| center | centre |
| customize | customise |
| favor | favour |
| license (noun) | licence (noun); license (verb) |
| program (general) | programme (general); program (computing) |

**Computing & Identifier Exception**: Keep exact US spelling inside code blocks, config keys, CSS properties, and CLI flags (`color:#2563eb`, `initializeEngine`, `align:center`, `organization` in `plugins.seo`). Use British spelling in prose only.

## Voice and tense

- **Active voice.** "Run `npx @docmd/core build`." — not "The build can be run with…".
- **Second person.** Address the reader as `you`. Avoid `we` except in tutorials where a narrator is genuinely walking alongside the reader.
- **Present tense.** "The build outputs `site/`." — not "The build will output…".
- **Imperative for steps.** "Add the plugin to `plugins` in `docmd.config.js`." — not "You can add the plugin to…".

## Sentence-level rules

- One idea per sentence.
- Keep sentences short. Aim for under 25 words. If a sentence is over 30, split it.
- Lead with the subject. Avoid "There is / There are" openings.
- No hedging. Cut "might", "perhaps", "in some cases", "depending on the situation" unless the uncertainty is real and matters.
- No filler. Cut "It's worth noting that", "As mentioned earlier", "In this section we will", "Simply put".

## Paragraph-level rules

- Two to four sentences per paragraph.
- Open with the most important sentence. The first sentence should make sense on its own — readers skim.
- One idea per paragraph. If you need "however", "additionally", "moreover" to connect sentences, split the paragraph.
- A page can have one-line paragraphs. Especially under headings, a single tight sentence is often right.

## Canonical `docmd 0.10.0` Terminology

Use the canonical terms from the project:

- `docmd.config.js` (or `docmd.config.ts` / `docmd.config.json`) — the configuration file.
- `docmd.workspace.js` — the multi-project workspace configuration file.
- `docs/` — the default source directory (`src`).
- `public/` — the root static files directory copied verbatim to `site/`.
- `assets/` — the project assets directory copied to `site/assets/`.
- `site/` — the default build output directory (`out`).
- `npx @docmd/core <command>` or `docmd <command>` — the CLI invocation form (`init`, `dev`, `build`, `serve`, `doctor`, `validate`, `migrate`, `live`, `mcp`, `add`, `remove`).
- `@docmd/core`, `@docmd/api`, `@docmd/live`, `@docmd/mcp`, `@docmd/ui`, `@docmd/parser` — core framework packages.
- `@docmd/plugin-okf`, `@docmd/plugin-playground`, `@docmd/plugin-mdx`, `@docmd/plugin-ai`, `@docmd/plugin-search`, `@docmd/plugin-threads`, `@docmd/plugin-iconify` — official plugin package names.
- `OKF` (Open Knowledge Framework), `MCP` (Model Context Protocol), `RAG`, `SPA`, `MDX`, `BYOK` — keep the all-caps acronym; expand at most once on first use when helpful (or via an inline `::: tip` tooltip).
- `monorepo`, `workspace`, `plugin`, `template`, `theme`, `container`, `playground`, `variables` — keep the project vocabulary consistent.

When a project term has a synonym that some readers will search for, mention the synonym once in parentheses near the first use, then drop it.

## Inclusive language

- Use **they** as the singular pronoun. Do not use "he or she" constructions.
- Avoid gendered nouns: `developer`, `user`, `reader`, `contributor`, `operator` — not `manpower`, `chairman`, `guys`.
- Avoid disability metaphors: `cripple`, `blind to`, `deaf to` — not "blind to the problem".
- Avoid violent metaphors: `kill`, `shoot down`, `nuke` — prefer `stop`, `terminate`, `reject`, `remove`.
- Avoid jargon that excludes non-native English readers when a plain word will do.

## Links and references

- Link descriptive phrases, not "click here" or "this page".
- A link should make sense out of context. The reader may arrive at the target from a search result or a hover preview.
- Internal doc references go to the canonical path. Avoid duplicating URLs in prose when a navigation link will reach the same page.

## What to avoid

- **Marketing voice.** "Supercharge your docs!" — no. The product does not need to sell itself in its own docs.
- **Apologies.** "Sorry, but…", "Unfortunately…", "It is not possible to…" — state the constraint and the supported path directly.
- **Self-reference.** "This guide", "this page", "the following example" — use them sparingly and only when the reader genuinely needs the pointer.
- **Emojis.** Not in headings, not in body prose. Code blocks may contain emoji only when they are part of literal terminal output.
- **Exclamation marks.** One per page, in a release note, max.

## Quick checklist

Before committing prose, run this list:

- [ ] British spelling throughout prose (with exact US identifiers preserved inside code/config).
- [ ] Active voice, present tense, second person (`you`).
- [ ] No sentences over 30 words.
- [ ] No "There is / There are" openings.
- [ ] No filler phrases ("It's worth noting", "Simply put").
- [ ] One idea per paragraph, one paragraph per heading step.
- [ ] First sentence of each paragraph stands alone.
- [ ] Project terms match the canonical `docmd 0.10.0` vocabulary.
- [ ] Inclusive, neutral language.
- [ ] No emojis in prose. No exclamation marks except in changelog entries.