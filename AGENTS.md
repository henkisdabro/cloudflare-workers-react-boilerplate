# cloudflare-workers-react-boilerplate

A GitHub template repository: Vite + React 19 + TypeScript served by a Cloudflare Worker that also
handles `/api/*`. Working here means working on the template, not on an application.

**If you are reading this in a project generated from the template, you are in the wrong file.**
Replace it with `docs/PROJECT-AGENTS-TEMPLATE.md`, which is written for a real project, and run
`/start` if that has not happened yet.

## The template contract

Every file in this repo is copied verbatim into every project spawned from it, so a wrong or generic
line is paid for again in each one, in codebases where it may not even be true. That has already
happened: this file's predecessor was byte-identical in a downstream project that shares none of its
assumptions. Before adding anything here, ask whether it will still be true in a project you have
never seen. If it is advice for the generated project rather than for the template, it belongs in
`docs/PROJECT-AGENTS-TEMPLATE.md` or in the `/start` flow, not here.

`AGENTS.md` is the real file and `CLAUDE.md` is a symlink to it - `.gemini/settings.json` sets
`contextFileName: AGENTS.md`, so that is the one every tool sees.

## Working on the template

pnpm 11, pinned in `packageManager`; Node 24. Verify with `pnpm lint && pnpm test && pnpm build`.
`pnpm lint` already fails at HEAD with two `react-hooks` errors in
`examples/database/` (fetch-on-mount in `ContactForm.tsx` and `SessionProvider.tsx`, flagged by
eslint-plugin-react-hooks 7). It is pre-existing, not yours, and CI runs lint - so a genuine fix
needs those two examples rewritten, not just your own change to be clean.

Dependencies are pinned exact and `.npmrc` sets `minimum-release-age=4320`, so a just-published
version refuses to install - that is the gate, not a registry outage.

Run `pnpm cf-typegen` after adding or changing any Cloudflare binding. It regenerates
`worker-configuration.d.ts` (400 KB, committed); skip it and the failure appears as a type error in
unrelated code with nothing pointing back at the binding.

`.mcp.json` connects the Cloudflare **API** MCP server (`https://mcp.cloudflare.com/mcp`, server key
`cloudflare-api`). It manages Cloudflare resources; it is not a documentation search.

Read `CLOUDFLARE_WORKERS.md` before changing what bindings or Worker patterns the boilerplate ships
with, and `.claude/README.md` before changing the slash commands, which are what a generated project
actually runs.
