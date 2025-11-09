# Project Overview for AI Agents

## Core Technology Stack

* **Framework:** Vite + React
* **Language:** TypeScript
* **Platform:** Cloudflare Workers (handles both static asset serving for the React SPA and any server-side API logic)
* **Version Control:** Git, hosted on GitHub
* **CI/CD:** GitHub Actions for automated deployments

## Project Architecture & Key Files

* `src/`: Contains the React/TypeScript frontend application source code. The main entry point is typically `src/index.tsx`.
* `public/`: Holds static assets like `favicon.ico` that are copied to the build output.
* `wrangler.toml`: This is the primary configuration file for the Cloudflare Worker. It defines the project name, compatibility settings, and bindings to other Cloudflare services (like KV, D1, or R2).
* `.github/workflows/deploy.yml`: Defines the automated CI/CD pipeline.
* `package.json`: Manages project dependencies and defines key scripts. The `npm run dev` command starts the local development server, and `npm run deploy` is used by the CI/CD pipeline to deploy.

## Deployment Flow

The deployment process is fully automated and triggered by code pushes.

1. A developer pushes commits to the `main` branch of the GitHub repository.
2. The push event triggers the GitHub Action workflow defined in `.github/workflows/deploy.yml`.
3. The workflow checks out the code and executes the official `cloudflare/wrangler-action`.
4. This action uses the Wrangler CLI to build the Vite application and the Worker code.
5. Wrangler then deploys the final output to the Cloudflare Workers environment associated with the account configured in the secrets.

## Secrets Management

All sensitive credentials, specifically the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, are managed as **GitHub Actions secrets**. They are **not** stored in the repository's code. The `deploy.yml` workflow securely accesses these secrets during runtime using the `${{ secrets.VARIABLE_NAME }}` syntax. Do not write secrets into any files.
