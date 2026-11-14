---
title: Doc Types (Diátaxis & OKF)
audience: writer
load_command: docmd-skills writer
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Doc Types (Diátaxis & OKF)

`docmd` follows the **Diátaxis** framework for human documentation structure and maps each page to the **Open Knowledge Framework (OKF)** (`@docmd/plugin-okf`) for machine consumption. Every page belongs to one primary type, and each type has a distinct job to do for the reader. Confusing the types is the single biggest source of weak documentation.

## The four Diátaxis types

| Type | Question it answers | Reader state | OKF frontmatter `type` |
| --- | --- | --- | --- |
| **Tutorial** | *Can I do it?* — a guided, hands-on lesson | Learning, needs encouragement, follow-along | `guide` |
| **How-to guide** | *How do I do X?* — a recipe for a specific goal | Has context, just needs the steps | `guide` or `runbook` |
| **Reference** | *What is X?* — a precise description of the machinery | Looking something up, wants facts | `reference` or `api` |
| **Explanation** | *Why is it this way?* — discussion of design and trade-offs | Thinking, comparing, deciding | `concept` |

## How to choose

- If the page **makes the reader do something** step-by-step and the steps build on each other → **Tutorial**.
- If the page **solves a concrete problem** the reader already has → **How-to**.
- If the page is the place a reader comes to **look something up** (an API, a config key, a CLI flag, an OpenAPI endpoint) → **Reference**.
- If the page **explains a decision** the team made, how an architecture works, or the alternatives considered → **Explanation**.

When in doubt, ask: *if I deleted the headings and just left the paragraphs, would the reader know whether they should follow along, look something up, or read to understand?* If the answer is no, the type is blurred.

## What each type owes the reader

### Tutorial

- Walks through a real, achievable task end-to-end.
- Promises a working result at the start; delivers it at the end.
- Uses the second person (`you`), present tense, active voice.
- No detours into alternatives or design rationale — those belong on Explanation pages.
- Each step is small, concrete, and verifiable (use `::: steps` + `::: step` or `<Steps>` when helpful).
- Ends with the reader in a new working state, not a summary of what was just covered.

### How-to guide

- States the goal in the first sentence.
- Assumes the reader already understands the surrounding system.
- Uses numbered steps or `::: steps`. Each step is one action.
- If the goal has multiple valid paths (e.g. `npm` vs `pnpm`, Docker vs nginx), use `::: tabs` or pick the canonical path and link to alternatives.
- No background, no theory — link to Explanation pages instead.

### Reference

- Mirrors the actual API or configuration surface. Function names, parameter names, CLI flags, and return types match the code exactly.
- One canonical description per item; no duplicated prose.
- Tables, `openapi` blocks, and code blocks are first-class; prose is connective tissue.
- No "this is great" voice. The reader wants facts, defaults, and constraints, not affirmation.
- A reader should be able to use a reference page without reading any other page first.

### Explanation

- Discusses design choices, trade-offs, architecture, and historical context.
- Does not give step-by-step setup instructions. Does not pretend to be a tutorial.
- May compare alternatives that are no longer recommended, as long as it explains why.
- The reader can stop at any heading without losing the thread — each section is self-contained.

## Mixing types — when and how

Most pages should be one type. There are two legitimate exceptions:

1. **Tutorial + How-to hybrid**: a tutorial can end with a "Next steps" section that links out to how-to guides. The tutorial itself stays linear; the links go elsewhere.
2. **Reference with brief context**: a reference page may open with one short orientation paragraph (2–3 sentences), then go straight into the specification tables. More than a paragraph and the type has drifted toward Explanation.

If you find yourself writing a page that wants to be three of the four at once, split it.

## Doc-type mistakes to watch for

- **A "tutorial" that explains** — pages that walk through a setup but spend most of the word count on why each piece exists. Move the explanation to an Explanation page; keep the tutorial on the rails.
- **A "how-to" that lectures** — pages that give a recipe but interleave it with rationale. Move rationale to Explanation; keep the how-to lean.
- **A "reference" that reassures** — pages that open with "Welcome to the X API! You'll love it." Cut it. Reference pages start with the spec.
- **An "explanation" with steps** — pages that read like essays but then ask the reader to run commands in order. Convert the steps to a how-to; keep the rationale in the explanation.

## Mapping to `docmd 0.10.0` Frontmatter & OKF

Because `@docmd/plugin-okf` and `@docmd/plugin-llms` are enabled by default in `docmd 0.10.0`, your frontmatter directly shapes both human navigation and the machine-readable knowledge bundle (`site/okf/okf.yaml` and `site/llms.txt`):

```yaml
---
title: Deploy with Docker
description: Run docmd serve inside a production Alpine Docker container with health checks.
type: guide                  # 'concept' | 'guide' | 'reference' | 'api' | 'runbook'
tags:
  - deployment
  - docker
  - serve
---
```

| Diátaxis Type | Typical Sidebar Section | Recommended Frontmatter `type` |
| --- | --- | --- |
| **Tutorial** | Getting Started / Quickstart | `guide` |
| **How-to guide** | Guides / Recipes / Operations | `guide` (or `runbook` for operational/incident procedures) |
| **Reference** | Reference / CLI / Config / API | `reference` (or `api` for REST / OpenAPI / SDK specifications) |
| **Explanation** | Concepts / Architecture | `concept` |

Always include a concise 1-sentence `description` and 2–5 `tags` (or `keywords`) in frontmatter so `@docmd/plugin-okf`, `@docmd/plugin-search`, and `@docmd/plugin-seo` index the page accurately.