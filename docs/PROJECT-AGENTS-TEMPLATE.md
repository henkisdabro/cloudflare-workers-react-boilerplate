# Starter AGENTS.md for a generated project

This file is **not** loaded as instructions. It is the starter agent file for a project created from
this template. Copy it to `AGENTS.md` at the project root, symlink `CLAUDE.md` to it
(`rm CLAUDE.md && ln -s AGENTS.md CLAUDE.md`), then edit it down until every line is true of that
project specifically.

Keep it short. Everything in an agent file loads on every request, so it earns its place only by
being something a capable agent would otherwise get wrong. Delete any section below that your project
does not actually use, and add nothing you could discover by reading the code.

---

```markdown
# <project-name>

<One sentence: what this application does and who uses it.>

Vite + React 19 + TypeScript, served by a Cloudflare Worker that also handles `/api/*`. Generated
from `henkisdabro/cloudflare-workers-react-boilerplate`.

## Commands

pnpm 11, pinned in `packageManager`. `pnpm dev`, `build`, `lint`, `test`, and `deploy` (builds, then
`wrangler deploy`). Verify a change with `pnpm lint && pnpm test && pnpm build`.

Dependencies are pinned exact and `.npmrc` sets `minimum-release-age=4320`, so a version published in
the last three days refuses to install. That is the gate, not a registry outage.

## Cloudflare

Run `pnpm cf-typegen` after adding or changing any binding. It regenerates
`worker-configuration.d.ts`; skip it and the failure shows up as a type error in unrelated code.

Secrets: `.dev.vars` locally (gitignored), `wrangler secret put NAME` in production, and repository
secrets in GitHub Actions. CI needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

Pushing to `main` deploys. `.mcp.json` connects the Cloudflare API MCP server for managing resources.

## <Your project's own section>

<This is the part that matters. Record only what is peculiar to this codebase: a constraint that is
expensive to get wrong, something deliberate that looks like a bug, domain vocabulary that is
ambiguous here. If you have nothing yet, leave this section out until you do.>
```

---

## Before you delete this file

Two things the generated project needs once, which do not belong in a permanently loaded agent file:

- **Run `/start`.** It is the setup flow: project naming, Cloudflare credentials, custom domain, and
  the GitHub secrets the deploy workflow needs. Most first-deploy failures are it not having been run.
- **Rename off the placeholder.** `package.json` `name` and `wrangler.jsonc` `name` both ship as the
  literal string `init`. Deploy without changing them and you publish a Worker called `init`.
  `/start` does this, but only if you run it.
