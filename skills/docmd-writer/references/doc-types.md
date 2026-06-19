---
title: Doc Types (Diátaxis)
audience: writer
load_command: docmd-skills writer
---

# Doc Types

docmd follows the **Diátaxis** framework for documentation structure. Every page belongs to exactly one of four types, and each type has a job to do for the reader. Confusing the types is the single biggest source of bad documentation.

## The four types

| Type | Question it answers | Reader state |
| --- | --- | --- |
| **Tutorial** | *Can I do it?* — a guided, hands-on lesson | Learning, needs encouragement, follow-along |
| **How-to guide** | *How do I do X?* — a recipe for a specific goal | Has context, just needs the steps |
| **Reference** | *What is X?* — a precise description of the machinery | Looking something up, wants facts |
| **Explanation** | *Why is it this way?* — discussion of design and trade-offs | Thinking, comparing, deciding |

## How to choose

- If the page **makes the reader do something** step-by-step and the steps build on each other → **Tutorial**.
- If the page **solves a concrete problem** the reader already has → **How-to**.
- If the page is the place a reader comes to **look something up** (an API, a config key, a CLI flag) → **Reference**.
- If the page **explains a decision** the team made or the alternatives they considered → **Explanation**.

When in doubt, ask: *if I deleted the headings and just left the paragraphs, would the reader know whether they should follow along, look something up, or read to understand?* If the answer is no, the type is wrong.

## What each type owes the reader

### Tutorial

- Walks through a real, achievable task end-to-end.
- Promises a working result at the start; delivers it at the end.
- Uses the second person ("you"), present tense, active voice.
- No detours into alternatives or design rationale — those are for Explanation pages.
- Each step is small, concrete, and verifiable.
- Ends with the reader in a new state, not a summary of what was just covered.

### How-to guide

- States the goal in the first sentence.
- Assumes the reader already understands the surrounding system.
- Uses numbered steps. Each step is one action.
- If the goal has multiple valid paths, pick the canonical one and link to alternatives.
- No background, no theory — link to Explanation pages instead.

### Reference

- Mirrors the actual API surface. Function names, parameter names, return types match the code exactly.
- One canonical description per item; no duplicated prose.
- Tables and code blocks are first-class; prose is connective tissue.
- No "this is great" voice. The reader wants facts, not affirmation.
- A reader should be able to use a reference page without reading any other page first.

### Explanation

- Discusses design choices, trade-offs, and historical context.
- Does not give steps. Does not pretend to be a tutorial.
- May compare alternatives that are no longer recommended, as long as it explains why.
- The reader can stop at any heading without losing the thread — each section is self-contained.

## Mixing types — when and how

Most pages should be one type. There are two legitimate exceptions:

1. **Tutorial + How-to hybrid**: a tutorial can end with a "go further" section that links out to how-to guides. The tutorial itself stays linear; the links go elsewhere.
2. **Reference with brief context**: a reference page may open with one short paragraph that orients the reader, then go straight into the spec. More than a paragraph and the type has drifted toward Explanation.

If you find yourself writing a page that wants to be three of the four at once, split it.

## Doc-type mistakes to watch for

- **A "tutorial" that explains** — pages that walk through a setup but spend most of the word count on why each piece exists. Move the explanation to an Explanation page; keep the tutorial on the rails.
- **A "how-to" that lectures** — pages that give a recipe but interleave it with rationale. Move rationale to Explanation; keep the how-to lean.
- **A "reference" that reassures** — pages that open with "Welcome to the X API! You'll love it." Cut it. Reference pages start with the spec.
- **An "explanation" with steps** — pages that read like essays but then ask the reader to run commands in order. Convert the steps to a how-to; keep the rationale in the explanation.

## Mapping to docmd structure

docmd's navigation (`navigation.json`) does not enforce doc type, but the convention is:

| Doc type | Sidebar weight | Frontmatter hint |
| --- | --- | --- |
| Tutorial | Top-level page | `template: doc`, prominent in nav |
| How-to | Grouped under a "Guides" or "Recipes" section | `template: doc` |
| Reference | Grouped under a "Reference" section | `template: doc` |
| Explanation | Grouped under "Concepts" or "Background" | `template: doc` |

The frontmatter hint is convention, not config. What matters is that within each section, the pages hold to one type each.
