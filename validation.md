# docmd Link Validation
> Full docs: [CLI Commands](https://docs.docmd.io/api/cli-commands/)

## Commands
```bash
docmd validate          # Lint all internal markdown links — terminal-formatted output
docmd validate --json   # Machine-readable JSON array for CI/CD pipelines
```

## What It Checks
- Relative markdown links (`[text](./path.md)`) — resolves `.md`, `index.md`, and directory targets
- Local image/asset paths
- Skips: `http://`, `https://`, `mailto:`, `tel:`, anchor-only links (`#section`)

## MCP Tool
The MCP server exposes `validate_docs` as a tool — runs the same checks programmatically via JSON-RPC. See [cli.md](./cli.md) for `docmd mcp`.

## CI/CD Usage
```yaml
# GitHub Actions example
- run: npx @docmd/core validate --json > validation.json
- run: "[ $(jq length validation.json) -eq 0 ] || exit 1"
```