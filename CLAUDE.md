# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Technology Stack

- **Framework:** Vite + React 19
- **Language:** TypeScript
- **Platform:** Cloudflare Workers (handles both static asset serving for the React SPA and server-side API logic)
- **Version Control:** Git, hosted on GitHub
- **CI/CD:** GitHub Actions for automated deployments

## Common Commands

- `npm run dev` - Start local development server
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Build and preview production build locally
- `npm run deploy` - Build and deploy to Cloudflare Workers
- `npm run cf-typegen` - Generate TypeScript types for Cloudflare bindings

## Project Architecture

### Dual-Build TypeScript Setup

This project uses TypeScript project references to separate concerns:

- `tsconfig.app.json` - Frontend React application configuration
- `tsconfig.worker.json` - Cloudflare Worker configuration
- `tsconfig.node.json` - Vite config and build tooling
- `tsconfig.json` - Root config that references all three

### Worker Request Handling

The Cloudflare Worker (`worker/index.ts`) uses a routing pattern:

- Routes matching `/api/*` are handled by the Worker's fetch handler and return JSON responses
- All other routes fall through (return 404) and are handled by the static asset serving
- Static assets use SPA mode (`not_found_handling: "single-page-application"` in `wrangler.jsonc`), which serves `index.html` for non-existent routes

### Key Files

- `src/main.tsx` - React application entry point
- `worker/index.ts` - Cloudflare Worker fetch handler for API routes
- `wrangler.jsonc` - Cloudflare Worker configuration (name, compatibility date, assets, bindings)
- `vite.config.ts` - Vite configuration with Cloudflare plugin (`@cloudflare/vite-plugin`)
- `.github/workflows/deploy.yml` - CI/CD pipeline using `cloudflare/wrangler-action@v3`

## Deployment Flow

Deployment is fully automated on push to `main`:

1. Developer pushes commits to `main` branch
2. GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers
3. Workflow uses `cloudflare/wrangler-action` to build and deploy
4. Wrangler builds both the Vite app and Worker, then deploys to Cloudflare

## Secrets Management

Cloudflare credentials are stored as GitHub Actions secrets (not in code):

- `CLOUDFLARE_API_TOKEN` - API token with Workers edit permissions
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account identifier

Access these in workflows via `${{ secrets.VARIABLE_NAME }}` syntax.
