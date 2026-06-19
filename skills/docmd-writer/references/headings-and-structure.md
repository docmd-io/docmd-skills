---
title: Headings and Structure
audience: writer
load_command: docmd-skills writer
---

# Headings and Structure

Every docmd page follows a **universal skeleton**. Pages that drift from it end up harder to navigate, harder to translate, and harder for the reader to skim.

## The universal skeleton

```
H1  Page title (from frontmatter title)
    Orientation       — what this page is, who it is for
    Prerequisites     — what the reader needs before starting
    Body              — the actual content, in self-contained H2 sections
    Next steps        — only when pointing to non-adjacent pages
```

### Orientation

The first section after the H1. Two to four sentences that answer:

- What does this page cover?
- Who is it for?
- Where does it sit in the larger doc?

If the page is a tutorial, the orientation also states the **outcome**. The reader should know what they will have at the end of the page before they reach the prerequisites.

### Prerequisites

A short list of what the reader needs before they start. For tutorials, this is concrete: `Node.js >= 18`, a working `docmd.config.json`, the project cloned. For how-to guides, this is one or two items the reader is assumed to already have. For reference pages, prerequisites are usually empty or skipped.

Use a bullet list, not prose. Each item is a verifiable state.

### Body

The actual content. The body is structured as **self-contained H2 sections** — each section must make sense if a reader jumps to it via a deep link or a translation tool. This is non-negotiable for translation, and it is also good writing.

Rules for the body:

- **One H2 per concept.** Do not split a concept across two H2s, and do not bundle two concepts under one H2.
- **H2 sections stand alone.** A reader who lands on a section via anchor link should not need to scroll up to understand what they are looking at.
- **H3 and below are in-section structure.** Use them to break a long H2 into named subsections, but never as standalone sections that a reader might land on without their parent H2.
- **No "Introduction" or "Overview" as an H2.** That is the orientation, which lives above the body and below the H1.

### Next steps

A small list of links to **non-adjacent** pages. Adjacent navigation (previous / next page) is provided by the docmd UI at the bottom of every page — duplicating that as a "Next steps" block defeats the purpose.

Add a "Next steps" section only when the next step is genuinely **non-adjacent**:

- A conceptual jump (you finished a tutorial, here is the relevant how-to).
- A reference jump (you finished a how-to, here is the API page for the function you used).
- A topic jump (you finished an explanation, here is a related feature page).

Do not add it when the next step is simply "the next page in the sidebar".

## Heading hierarchy

- **H1** — exactly one per page. Comes from frontmatter `title:`. Never write `# Heading` in the body.
- **H2** — the major sections of the page. Two to six per page is the sweet spot. More than eight and the page is doing too much.
- **H3** — subsections of an H2. Use them to give long sections a scannable shape.
- **H4 and below** — use sparingly. If you find yourself reaching for H4, the H2 is probably wrong.

Heading text follows the same rules as prose: active voice, no filler, no trailing punctuation.

| Good | Bad |
| --- | --- |
| `## Install the CLI` | `## Installation` |
| `## Configure navigation` | `## How to configure the navigation in docmd.config.json` |
| `## What goes wrong when X is missing` | `## Troubleshooting missing X issues` |

## Page length

A page is a unit of one idea. When the page wants to be two ideas, split it.

Practical limits:

- **Reference page** — as long as it needs to be. Tables and code blocks do not count toward reader fatigue the same way prose does.
- **How-to page** — short. Under 600 words of prose is typical. If it is longer, the goal is probably too broad.
- **Tutorial** — moderate. The walk-through is the page; pad is the enemy.
- **Explanation** — moderate to long. Discussion pages earn their length.

If a page grows past 1500 words of prose, split it. The split will either reveal the two ideas hiding inside, or it will force clearer structure.

## Lists, tables, and callouts

### Lists

- **Ordered lists** for sequences. If the order matters, the reader is following steps.
- **Unordered lists** for sets where order does not matter (prerequisites, options, attributes).
- **One item, one line.** If an item needs a paragraph to explain, use a sub-section under a heading instead.

### Tables

- Tables are first-class in docmd. Use them when there are 3+ parallel items with consistent attributes (config keys, CLI flags, plugin options, error codes).
- Table column order: identifier first, then description, then example last. Avoid putting the description first — readers scan the identifiers.
- Avoid tables for two-item comparisons. Two items are a paragraph; tables force structure that is not earned.

### Callouts

Use docmd callouts (`::: callout ... :::`) sparingly. A page drowning in `tip` and `warning` boxes is a page where the body is not doing its job. Reserve callouts for:

- **Destructive actions** that cannot easily be undone (`::: callout warning`).
- **Genuinely surprising facts** that the reader will not infer (`::: callout info`).
- **Tips that change behaviour** (`::: callout tip`).

If a callout would be true for any reader on any page, it does not belong on this page — move it to a canonical explanation.

## Anchors, deep links, and translation

Headings become anchor links automatically. Translation tools and search results both rely on stable, descriptive anchors. Heading text is the anchor — write it so a deep link to it makes sense out of context.

`## Configure navigation` → `/page#configure-navigation` — the link stands alone.

`## Configuration` → `/page#configuration` — fine, but only if "Configuration" is genuinely the topic, not a generic label for an unrelated paragraph.

## Cross-page structure

Pages that belong together should look like they belong together. That means:

- Same H2 structure for parallel pages (every tutorial has the same skeleton; every reference page opens the same way).
- Same callout placement (warnings always at the same point in the step where the danger arises).
- Same heading vocabulary (use `Install`, not `Installation` / `Setup` / `Getting started` interchangeably).

The docmd docs site itself uses this skill for its own pages, so the source of truth is the published output at <https://docs.docmd.io>.
