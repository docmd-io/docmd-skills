# docmd Security and Regression Checklist

> docmd-specific security and quality gate. docmd is Node.js and TypeScript only, so the generic Node rules in the `ai-dev` skill (`references/nodejs-cautions.md` and `references/security-must-checks.md`) ALWAYS apply on top of this file. This reference is the docmd-only layer: invariants that came from real regressions in v0.8.x battle testing (`battle-test-reports/unified-issues.md`).

## When to load this reference

- You are changing framework code in `packages/core`, `packages/api`, `packages/parser`, `packages/ui`, `packages/plugins`, `packages/engines`, `packages/templates`, `packages/deployer`, or the Docker image.
- You are about to declare a framework change "done".
- You are reviewing a framework PR.

Load it BEFORE the change ships, not after.

## How to use it

- Run the generic Node triage first (`ai-dev` `nodejs-cautions.md` §1.1 grep checklist + `security-must-checks.md` Rules 1 to 7). Those cover CWE-22, 79, 78, 95, 138, 829, 918, 94, exit codes, async, resources, cross-platform.
- Then run each section below. Every MUST is a blocker. Every SHOULD needs justification in the PR if violated.
- Report IDs in parentheses trace each rule back to `unified-issues.md` so the origin is auditable.

---

# 1. Container parser invariants (`:::`)

The `:::` container engine is touched in `packages/parser`. These are the parser bugs that recurred.

- **MUST.** Depth tracking must be content-aware, not indentation-blind. A `::: tag` open and its close must pair by type and depth regardless of inner indentation. (T-F1)
- **MUST.** A self-closing `::: tag :::` followed by a stray `:::` must not corrupt the depth counter. Treat a self-closing tag as both open and close in one step; an extra `:::` must close the next outer level, not panic the counter. (T-F2)
- **MUST.** A close whose type does not match the current open type must error or warn, never silently re-root the parser to an arbitrary depth. (T-F3)
- **MUST.** A triple close must not erase content between the matched levels. Close exactly the levels it matches; leave inner content intact. (T-F4)
- **SHOULD.** Deep nesting (5+ levels of callouts) must not collapse to the outer container. Verify with a fixture that nests callouts, grids, and steps. (T-F5)
- **Regression test contract.** Add a parser fixture for every new container bug fixed: one input that breaks before the fix, passes after.

# 2. Plugin output-injection contract

Plugins return strings that core interpolates into HTML. Those returns are untrusted.

- **MUST.** Every value a plugin returns via `generateMetaTags`, `generateScripts`, `getAssets`, `template` slots, or `translations` is user input. Escape it (`escHtml`, `attrEsc`, `JSON.stringify`) before it lands in HTML. Never stringify with template concatenation that turns an object into `[object Object]` in `<head>`. (D-S4, T-S7)
- **MUST.** `head` and `body` script generation must be distinct, typed returns. A single function that returns one string for both slots is a contract bug: callers cannot place head scripts in head and body scripts in body. (D-H3, D-S5)
- **MUST.** No legacy escape hatch. A plugin registered without a descriptor must NOT get full access. Validate descriptors and declared capabilities at load time (see `ai-dev` `nodejs-cautions.md` §1.8). (D-S1)
- **MUST.** A plugin must not be able to override a built-in engine by registration order. Built-ins win unless the user explicitly opts in. (D-H5)
- **SHOULD.** Validate the shape of plugin `translations` and `actions`/`events` returns before merging. Wrong shapes must be rejected, not silently merged. (D-M1, D-M5)
- **SHOULD.** Document the context objects passed to `onBeforeRender`, `onPageReady`, `onPostBuild`. `onPageReady` receives a richer page object than `onBeforeRender`; this asymmetry must be documented or normalised. (D-M2, D-M3)

# 3. Public Node API honesty (`@docmd/api`, `@docmd/core`)

- **MUST.** Every function documented in the skill or in `docs/` must be exported from the package entry, with the documented signature. Add an `exports` test that imports each documented symbol and calls it with the documented args. (D-H2)
- **MUST.** Programmatic entry points must honour their arguments. `buildSite(configPath, opts)` must use `configPath`; ignoring it is a silent contract break. (D-H1)
- **MUST.** Re-exported helpers must keep the same type as the source. A URL utility re-exported from `@docmd/parser` into `@docmd/api` with a different type breaks consumers silently. (D-M6)
- **MUST.** Functions named `safe*`, `sanitize*`, `escape*`, `validate*`, `normalise*` must actually enforce the guarantee in their name. A `sanitizeUrl` that only collapses double slashes is a defect. (D-S3, D-S6, D-H6)

# 4. i18n and versioning (no silent fallback, no silent drop)

- **MUST.** A missing translation must NOT silently render the default locale's string with no signal. Either render a visible placeholder, or log a warning naming the key and locale. (T-Z4, M-8)
- **MUST.** The search index must include every built locale, not just the default. (M-4)
- **MUST.** Locale links must resolve the default-locale-at-root convention. A `fr/index.md` link to `/en/foo` must not 404 when `en` is the default locale living at `/`. (M-5)
- **MUST.** Combining i18n with an explicit `versions` config must build pages. Zero pages built with no error is a silent failure. (M-6)
- **SHOULD.** `stringMode` i18n must not emit duplicate-content HTML across locales (SEO). Emit a canonical or `hreflang` signal. (M-7)
- **MUST.** RTL locales (`ar`, `he`, `fa`) must set `dir="rtl"` on `<html>`, not just `lang`. (T-Z5)
- **MUST.** A missing version folder must produce a clear error naming the version, not a raw `ENOENT`. (T-Z6)
- **MUST.** Workspace mode must not require an undocumented `prefix: "/"` to build. If a prefix is required, document it and default it. (M-2, T-Z6)
- **SHOULD.** Ship a locale/version switcher component; do not rely on the user building one. (M-10, T-Z7)

# 5. Deploy templates and Docker image hardening

`packages/deployer` and `docker/`.

- **MUST.** Every generated server config (Caddy, Nginx, Netlify `_redirects`/`[[redirects]]`) must ship a security header baseline: `Content-Security-Policy`, `Strict-Transport-Security`, `Referrer-Policy`, `X-Content-Type-Options`. (N-6, T-Z8)
- **MUST.** Netlify `[[redirects]]` must not soft-404 every route. A `from = "/*" status = 200` catch-all that serves `404.html` with 200 breaks search and analytics. (T-Z9)
- **MUST.** Deploy Dockerfiles must install the package manager the image uses (pnpm) and pin a Node base image consistent with the official docmd image. Do not hardcode `node:20` while the official image is `node:24`. (N-5, N-9)
- **MUST.** The official Docker image must not run as root. If `corepack enable` needs root, enable it in a root build stage and drop to a non-root runtime user. (N-7, N-8)
- **MUST.** The image must validate that the mounted `WORKDIR` is writable, and fail loudly if not, rather than crashing on first write. (N-1, N-18)
- **SHOULD.** Healthcheck and `EXPOSE` must honour a configurable port; if the default port is taken, the healthcheck must hit the actual listening port. (N-19)

# 6. Migration correctness

`docmd migrate` and `docmd migrate --upgrade`.

- **MUST.** `migrate` must translate navigation structure, not just files. MkDocs `nav:` and Docusaurus sidebars must map to docmd nav. (N-9)
- **MUST.** `migrate` must translate frontmatter aliases (`id`, `sidebar_label`, `sidebar_position`) to docmd equivalents. (T-Z17)
- **MUST.** `migrate --upgrade` must upgrade ALL known legacy keys, not a subset. (N-4)
- **MUST.** `migrate --upgrade` must not rewrite `out` to a different value than the original without warning. (N-22)
- **SHOULD.** `migrate` must report the backup location in machine-parseable form (`--json`) for scripting. (N-21)
- **SHOULD.** `migrate` must handle monorepo / multi-config layouts, or refuse with a clear message. (N-20)
- **SHOULD.** Provide `migrate --dry-run` with a diff before writing anything. (N-3)

# 7. CLI command honesty

- **MUST.** Exit codes are a contract. Build failure, validation failure, and "command did nothing" must exit non-zero. Never exit 0 on an error path. (T-F6, M-12)
- **MUST.** No accepted-but-unused flags. `deploy --force`, `--dry-run`, `--json`, `--cwd` must change observable behaviour or be rejected as unknown. (N-3, M-2, N-14)
- **MUST.** No silent no-ops. `add <plugin>` must work for `.ts`, `.mjs`, and `.cjs` configs, or refuse with a message; `remove <plugin>` must also remove the config entry. (M-3, T-F7)
- **MUST.** Validation errors must produce a readable message, never a raw stack trace. (T-F8)
- **SHOULD.** `validate` must not false-positive valid links because of a trailing slash. (M-1)
- **SHOULD.** `stop` must shut the dev server down gracefully. (M-11)
- **SHOULD.** Unknown config keys must warn with the key name and a suggestion, not be silently dropped. (T-Z3)

# 8. Rendering and content

- **MUST.** Exactly one `<h1>` per page. Title frontmatter plus an in-body `# H1` produces two; strip one. (T-Z15)
- **MUST.** Machine-readable outputs (`llms.txt`, `llms-full.txt`, `search-index.json`) must escape or strip untrusted content. An XSS payload or internal path must not leak into `llms.txt`. (T-Z10)
- **MUST.** No CSV injection: frontmatter values exported to CSV must be prefixed-neutralised (strip leading `=`, `+`, `-`, `@`). (T-Z11)
- **MUST.** Unicode filenames and unknown locales must not be silently dropped; warn naming the file or locale. (T-Z12, T-Z16)
- **SHOULD.** Mermaid diagrams should validate at build time, not only render client-side. (T-Z13)
- **SHOULD.** The default `init` `index.md` must contain a working `::: button` example. (T-F9)

# 9. TUI and UX

- **SHOULD.** Respect `NO_COLOR` and provide `--no-banner`. (N-13, N-16)
- **SHOULD.** Show the docmd version in `--help`. (N-17)
- **SHOULD.** Surface errors at a glance in the TUI, and honour `--json` for machine-readable output on every command. (N-11, N-12, N-14)
- **SHOULD.** Keep the TUI informative during a long dev-server build. (N-15)

# 10. Performance and engines

- **MUST.** Engine fallback must be loud. If the Rust engine falls back to JS (glibc mismatch, missing binary), emit one warning line with the cause and a hint. Silent fallback hides the performance regression. (T-S9, M-9)
- **SHOULD.** Provide per-platform binaries and auto-resolve on Mac ARM; do not require manual download. (M-18)
- **SHOULD.** Keep build scaling honest: benchmark at 1000 pages and note the curve. Sub-linear is expected; a cliff needs investigation. (M-13)

---

# Before you ship (gate)

Run this before marking any framework change done.

1. Generic Node triage: `ai-dev` `nodejs-cautions.md` §1.1 grep checklist + Appendix 5-minute review.
2. `ai-dev` `security-must-checks.md` Rules 1 to 7, with docmd's common-miss spots in mind.
3. Sections 1 to 10 above that touch the area you changed.
4. `pnpm prep` (the 7-pillar E2E pipeline) for anything non-trivial.
5. One regression test per bug class fixed, named after the report ID where possible.

If any MUST is unresolved, the change is not done.
