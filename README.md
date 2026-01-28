# Cloudflare Workers + React Boilerplate Template

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Claude Code](https://img.shields.io/badge/Optimized_for-Claude_Code-5436DA?style=flat)](https://claude.com/claude-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Deploy React apps to 300+ global locations for free.** A complete starter kit with databases, AI integration, and CI/CD - all on Cloudflare's generous free tier.

From portfolio sites to AI-powered SaaS - start simple and scale when you need to. Push to GitHub, deploy in seconds.

> 💡 **First time building a website?** Don't worry about the tech jargon. Run `/start` in Claude Code and answer a few questions - you'll be live in minutes. Claude handles the hard parts while you learn.

---

## 🎯 What Is This?

A **free, production-ready starter kit** for React apps that deploy to Cloudflare's global edge network. Everything you need to ship:

- **React 19 + TypeScript + Vite** - Fast development, type safety, instant hot reload
- **API backend at the edge** - Serverless functions that run near your users
- **Optional databases** - D1 (SQL) or KV (key-value) when you need them
- **Optional AI integration** - Claude API or Workers AI patterns included
- **Automatic deploys** - Push to GitHub → live in seconds
- **Claude Code commands** - `/start`, `/add-ai-feature`, `/setup-database`

**Start with what you need. Add more when you're ready.**

### Perfect For

| Use Case | Why This Template |
|----------|-------------------|
| **Portfolio & personal sites** | Free global hosting, looks professional, room to add features later |
| **Side projects & MVPs** | Ship in hours, not days. Database and auth patterns included |
| **Learning Cloudflare Workers** | Well-documented, beginner-friendly, with working examples |
| **Keeping costs at zero** | Generous free tiers: 100K requests/day, 5GB database, unlimited deploys |
| **AI-powered apps** | Claude API and Workers AI examples ready to copy |

### When to Use Something Else

| Requirement | Better Choice | Why |
|-------------|---------------|-----|
| **Server-side rendering (SSR)** | [TanStack Start](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/) or [React Router v7](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/) | This template is a client-side SPA |
| **Persistent Node.js server** | Railway, Render, or VPS | Workers are stateless edge functions |
| **WordPress/CMS content** | Cloudflare Pages + headless CMS | Different architecture needed |

> 💡 **Simple static sites work great here!** You get free global CDN, instant deploys, and room to add APIs/databases when you need them.

### 💰 Free Tier Highlights

Everything in this template runs on Cloudflare's free tier:

| Resource | Free Allowance | That's Enough For |
|----------|---------------|-------------------|
| **Requests** | 100,000/day | ~3 million/month |
| **D1 Database** | 5GB storage, 5M reads/day | Most small-to-medium apps |
| **KV Storage** | 1GB storage, 100K reads/day | Sessions, caching, config |
| **R2 Storage** | 10GB/month, zero egress fees | User uploads, file storage |
| **Deploys** | Unlimited | Push as often as you want |
| **Custom domains** | Unlimited | Your brand, free SSL |

GitHub Actions is also free for public repos (unlimited) or private repos (2,000 min/month).

**No credit card required to start.**

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 22+ and npm (matches [Cloudflare Workers Builds default](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/))
- **Cloudflare Account** ([sign up free](https://dash.cloudflare.com/sign-up))
- **GitHub Account** (for automated deployment)

### 🤖 Claude Code Setup (Recommended)

If you're using [Claude Code](https://claude.com/claude-code), this is the fastest way to get started:

```bash
# 1. Clone your new repository (after clicking "Use this template")
git clone https://github.com/your-username/your-new-repo.git
cd your-new-repo

# 2. Install dependencies
npm install

# 3. Open in Claude Code and run:
/start
```

The `/start` wizard handles everything:
- ✅ Configure project name and metadata
- ✅ Set up Cloudflare credentials (Account ID, API token)
- ✅ Configure GitHub secrets for CI/CD deployment
- ✅ Optionally enable Claude GitHub Actions (`@claude` in PRs)
- ✅ Set up custom domain (optional)
- ✅ First deployment to production
- ✅ Guide you to your next feature

**That's it!** Claude Code walks you through each step interactively.

---

### 🛠️ Manual Setup (Alternative)

<details>
<summary><strong>Click to expand manual setup instructions</strong></summary>

If you prefer to set up manually without Claude Code:

#### 1️⃣ Create Your Project

Click **"Use this template"** on GitHub, then:

```bash
git clone https://github.com/your-username/your-new-repo.git
cd your-new-repo
npm install
```

#### 2️⃣ Get Cloudflare Credentials

**Account ID:**
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to Workers & Pages
3. Copy your **Account ID** from the right sidebar

**API Token:**
1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"** → Use **"Edit Cloudflare Workers"** template
3. Copy the generated token immediately

#### 3️⃣ Add GitHub Secrets

1. In your GitHub repo: **Settings** → **Secrets and variables** → **Actions**
2. Add `CLOUDFLARE_ACCOUNT_ID` with your account ID
3. Add `CLOUDFLARE_API_TOKEN` with your API token

#### 4️⃣ Deploy

```bash
# Start local development
npm run dev

# Or push to main for automatic deployment
git add . && git commit -m "Initial setup" && git push origin main
```

Your app is now live! Check the Actions tab for your deployment URL.

</details>

---

## 🏗️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE GLOBAL EDGE                  │
│                                                            │
│  ┌────────────────────┐         ┌──────────────────────┐   │
│  │   Static Assets    │         │  Cloudflare Worker   │   │
│  │   (React SPA)      │         │  (API Endpoints)     │   │
│  │                    │         │                      │   │
│  │  • React 19        │         │  • TypeScript        │   │
│  │  • Vite Build      │         │  • Edge Functions    │   │
│  │  • SPA Routing     │         │  • 0ms cold start    │   │
│  └────────────────────┘         └──────────────────────┘   │
│           │                              │                 │
│           └──────────────┬───────────────┘                 │
│                          │                                 │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │          CLOUDFLARE BINDINGS & SERVICES              │  │
│  │                                                      │  │
│  │  • D1 (SQLite Database)    • KV (Key-Value Store)    │  │
│  │  • R2 (Object Storage)     • Queues (Message Bus)    │  │
│  │  • Workers AI (Edge AI)    • AI Gateway (Caching)    │  │
│  │  • Analytics Engine        • Durable Objects         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19.2 | UI framework |
| **Build Tool** | Vite | 7.3 | Lightning-fast dev server & bundler |
| **Language** | TypeScript | 5.9 | Type-safe development |
| **Testing** | Vitest | 4.0 | Unit and component testing |
| **Runtime** | Cloudflare Workers | Latest | Serverless edge compute |
| **Node.js** | Node.js | 22+ | Development runtime (pinned in `.nvmrc`) |
| **Package Manager** | npm | Any | Dependency management |
| **CI/CD** | GitHub Actions | N/A | Automated deployment |

### Cloudflare Products Integrated

- **Workers** - Serverless edge compute (your API backend)
- **D1** - Serverless SQLite database at the edge
- **KV** - Ultra-fast key-value storage
- **R2** - S3-compatible object storage *(setup helper included)*
- **Workers AI** - Edge-native AI inference *(examples included)*
- **AI Gateway** - Caching & analytics for AI APIs *(examples included)*
- **Sandbox SDK** - Secure isolated code execution *(Beta - documentation included)*
- **Queues** - Message queue system *(setup helper included)*
- **Analytics Engine** - Custom analytics *(setup helper included)*

---

## 🚀 Deployment Options

This template supports **three deployment methods** to fit different workflows and budgets. Choose based on your repository visibility and usage patterns.

### Deployment Methods Comparison

| Method | Best For | Setup | Automation | Limits |
|--------|----------|-------|------------|--------|
| **GitHub Actions** | Public repos, teams | 5 min | On push to `main` | Unlimited (public) / 2,000 min/month (private) |
| **Cloudflare Workers Builds** | Private repos, simplicity | 3 min | On push to branch | 3,000 build min/month (free) |
| **Local Wrangler** | Manual control, testing | 2 min | Manual | Unlimited |

### Free Tier Limits

Both Cloudflare and GitHub offer generous free tiers:

**GitHub Actions** ([source](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)):
| Repository Type | Minutes/Month | Storage |
|----------------|---------------|---------|
| **Public repos** | ∞ Unlimited | Unlimited |
| **Private repos** | 2,000 minutes | 500 MB |

> **Note:** Windows runners use 2× minutes, macOS uses 10× minutes. Linux runners (used in this template) have no multiplier.

**Cloudflare Workers** ([source](https://developers.cloudflare.com/workers/platform/pricing/)):
| Resource | Free Tier |
|----------|-----------|
| Requests | 100,000/day |
| Build minutes | 3,000/month |
| Concurrent builds | 1 |
| Worker size | 3 MB |
| KV reads | 100,000/day |

---

### Option 1: GitHub Actions (Default)

**Best for:** Public repositories, teams, complex build pipelines

This template comes pre-configured with GitHub Actions. Every push to `main` triggers automatic deployment.

```
Developer → git push main → GitHub Actions builds → Cloudflare deploys globally
```

**Setup:**
1. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to GitHub Secrets
2. Push to `main` - deployment is automatic

**Pros:**
- ✅ Unlimited minutes for public repos
- ✅ Full control over build pipeline
- ✅ Easy to add tests, linting, preview deploys
- ✅ Familiar GitHub workflow

**Cons:**
- ⚠️ 2,000 min/month limit for private repos (≈100-200 deploys)
- ⚠️ Requires GitHub Secrets setup

---

### Option 2: Cloudflare Workers Builds (Native Git Integration)

**Best for:** Private repositories, avoiding GitHub Actions limits

Cloudflare can build and deploy directly from your GitHub/GitLab repo - no GitHub Actions needed.

```
Developer → git push → Cloudflare detects change → Builds & deploys
```

**Setup:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages
2. Click "Create" → "Import a repository"
3. Connect your GitHub account and select your repo
4. Configure build settings (Cloudflare auto-detects Vite projects)
5. Deploy!

**Pros:**
- ✅ 3,000 build minutes/month on free tier (separate from GitHub)
- ✅ No GitHub Actions minutes consumed
- ✅ Preview URLs for pull requests
- ✅ Simpler setup - no secrets to configure

**Cons:**
- ⚠️ 1 concurrent build on free tier
- ⚠️ Less customisable than GitHub Actions
- ⚠️ Can't run custom tests/linting in build pipeline

**To switch to Cloudflare Builds:**
1. Delete or disable `.github/workflows/deploy.yml`
2. Set up Workers Builds in Cloudflare Dashboard
3. Push to trigger first build

---

### Option 3: Local Wrangler Deployment

**Best for:** Manual deployments, testing, CI/CD on other platforms

Deploy directly from your terminal using Wrangler CLI.

```
Developer → npm run deploy → Wrangler builds & deploys → Live globally
```

**Setup:**
```bash
# First time: Authenticate with Cloudflare
npx wrangler login

# Deploy anytime
npm run deploy
```

**Pros:**
- ✅ No CI/CD limits - deploy as often as you want
- ✅ Instant deployment feedback
- ✅ Works with any CI/CD platform (GitLab CI, CircleCI, Jenkins)
- ✅ Good for testing before committing

**Cons:**
- ⚠️ Manual process - not automated
- ⚠️ Requires Wrangler installed and authenticated
- ⚠️ No audit trail in GitHub

---

### Recommendation by Scenario

| Scenario | Recommended Method |
|----------|-------------------|
| **Public repo, open source project** | GitHub Actions (unlimited) |
| **Private repo, frequent deploys (>100/month)** | Cloudflare Workers Builds |
| **Private repo, occasional deploys** | GitHub Actions (fits in 2,000 min) |
| **CI/CD on GitLab, Bitbucket, etc.** | Local Wrangler in CI pipeline |
| **Solo developer, manual control** | Local Wrangler |
| **Testing before push** | Local Wrangler + GitHub Actions |

### Monitoring Your Usage

**GitHub Actions:**
- Go to your repo → Settings → Billing → Actions
- Or: Your profile → Settings → Billing → Actions

**Cloudflare:**
- Dashboard → Workers & Pages → Your Worker → Analytics

---

### Pipeline Configuration (GitHub Actions - Default)

**Defined in**: `.github/workflows/deploy.yml`

**Secrets Required** (one-time setup):
- `CLOUDFLARE_API_TOKEN` - Workers deployment permission
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

**Build Steps**:
1. Install dependencies (`npm install`)
2. Compile TypeScript (`tsc -b`)
3. Build production bundle (`vite build`)
4. Deploy to Cloudflare Workers (`wrangler deploy`)

**Result**: Your app is live globally on Cloudflare's edge network (300+ cities)

---

## 🤖 Claude Code Integration

This template is **optimised for AI-assisted development** with Claude Code, featuring interactive slash commands that accelerate your workflow.

### Available Slash Commands

| Command | Description |
|---------|-------------|
| `/start` | Complete project setup (run first!) - config, credentials, domain, deployment |
| `/generate-prp <feature>` | Create a comprehensive Product Requirement Plan |
| `/execute-prp <file>` | Implement a feature from a PRP |
| `/add-ai-feature` | Add AI capabilities (Claude API, Workers AI, AI Gateway) |
| `/setup-database` | Set up D1 (SQL) or KV (key-value) storage |
| `/setup-sandbox` | Configure Cloudflare Sandbox SDK for code execution |
| `/add-binding` | Add Cloudflare bindings (R2, Queues, etc.) |

### Claude GitHub Actions

Enable `@claude` mentions in pull requests and issues to get AI-powered assistance directly in GitHub:

- **Ask questions** - `@claude explain how authentication works`
- **Request reviews** - `@claude review this PR for security issues`
- **Implement changes** - `@claude add input validation to the form`

Claude reads your code, follows your `CLAUDE.md` guidelines, and commits changes directly to your branch.

**Quick setup:** Run `/start` and select "Yes" when asked about Claude GitHub Actions.

📖 See **[docs/GITHUB_ACTIONS_CLAUDE.md](docs/GITHUB_ACTIONS_CLAUDE.md)** for complete setup instructions.

### Example Workflow

```bash
# 1. Complete setup in one command
/start
# Handles: project config, credentials, domain, first deployment

# 2. Add AI chat feature
/add-ai-feature
# Choose: Claude API → Streaming Chat
# Result: Complete chat UI + API endpoint generated

# 3. Add database for chat history
/setup-database
# Choose: D1 (SQL)
# Result: Database created, migrations generated, types updated

# 4. Generate implementation plan
/generate-prp "Save chat history to D1 database"

# 5. Execute the plan
/execute-prp PRPs/chat-history.md
```

See **[.claude/README.md](.claude/README.md)** for complete documentation.

### Cloudflare Documentation MCP Server

This template includes the official **Cloudflare Documentation MCP Server** pre-configured (`.mcp.json`). Claude Code can search official Cloudflare docs to answer questions about Workers, D1, KV, R2, Durable Objects, and any other Cloudflare product.

Just ask Claude Code questions like:
- "How do I set up a D1 database?"
- "What are Workers KV limits?"
- "Show me R2 bucket examples"

---

## 🎨 Opinionated VS Code Defaults

This template includes **sensible VS Code configuration** out-of-the-box, optimised for Claude Code development.

### Recommended Extensions (`.vscode/extensions.json`)

When you open the project, VS Code will prompt you to install:

| Extension | Purpose |
|-----------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Vitest** | Test explorer integration |
| **Error Lens** | Inline error display |
| **Auto Rename Tag** | JSX tag renaming |
| **Path Intellisense** | Import path autocomplete |
| **npm Intellisense** | npm module autocomplete |
| **DotENV** | `.dev.vars` syntax highlighting |

### Workspace Settings (`.vscode/settings.json`)

Pre-configured for a clean coding experience:

- **Format on save** with Prettier
- **Terminal panel on the right** - more vertical space for code
- **Activity bar at top** - compact, modern layout
- **Minimap disabled** - cleaner editor
- **Search excludes** node_modules, dist, .wrangler
- **JSONC support** for `wrangler.json` (allows comments)
- **Syntax highlighting** for `.dev.vars` secrets file

These defaults work great with Claude Code's terminal-focused workflow. Override any setting in your user preferences if needed.

---

## 🤖 AI Integration Features

Build AI-powered applications with **zero infrastructure setup**. This template includes ready-to-use patterns for integrating AI into your web app.

### AI Options

| Option | Best For | Setup Time | Cost |
|--------|----------|------------|------|
| **Claude API** | Advanced reasoning, long conversations | 2 min | Pay per token |
| **Workers AI** | Edge inference, cost-effective | 1 min | Included in Workers |
| **AI Gateway** | Production apps with caching | 5 min | Reduces AI costs 30-80% |
| **Sandbox SDK** | Safe AI code execution, REPLs | 5 min | Beta (free during beta) |

### Quick Start: Add AI

```bash
# Interactive AI setup wizard
/add-ai-feature
```

Choose your AI provider and feature type:
- ✅ Simple chat interface
- ✅ Streaming responses (real-time)
- ✅ Text completion/generation
- ✅ Embeddings for semantic search
- ✅ Image generation (Workers AI)

### Working Examples Included

Explore **[examples/ai/](examples/ai/)** for complete implementations:

1. **Simple Claude Chat** - Basic chat with Claude API
2. **Streaming Chat** - Real-time streaming with Server-Sent Events
3. **Workers AI Chat** - Edge AI with Llama/Mistral models
4. **AI Gateway Integration** - Production caching & cost optimization

Each example includes:
- ✅ Complete React component (UI)
- ✅ Worker endpoint (API)
- ✅ TypeScript types
- ✅ Security best practices
- ✅ Setup documentation

### Learn More

📖 **[AI_INTEGRATION.md](AI_INTEGRATION.md)** - Comprehensive AI integration guide

---

## 💾 Database & Storage

Serverless, edge-native data storage with **zero configuration** and **global replication**.

### Storage Options

| Storage | Type | Best For | Latency |
|---------|------|----------|---------|
| **D1** | SQL (SQLite) | Relational data, complex queries | <5ms |
| **KV** | Key-Value | Sessions, cache, config | <1ms |
| **R2** | Object Storage | Files, images, videos | N/A |

### Quick Start: Add Database

```bash
# Interactive database setup
/setup-database
```

This wizard will:
- Help you choose D1 (SQL) or KV (key-value)
- Create the database/namespace
- Update `wrangler.jsonc` configuration
- Generate TypeScript types
- Create migration files (D1)
- Provide example CRUD code

### Working Examples Included

Explore **[examples/database/](examples/database/)** for patterns:

1. **D1 Contact Form** - Complete CRUD with SQLite
   - Schema design
   - Migration files
   - SQL injection prevention
   - React form + Worker API

2. **KV Sessions** - Session management
   - Secure cookie handling
   - Session middleware
   - React auth provider
   - Login/logout flow

### Learn More

📖 **[CLOUDFLARE_WORKERS.md](CLOUDFLARE_WORKERS.md)** - Complete Cloudflare Workers guide

---

## 📚 Examples & Reference Implementations

The **`examples/`** directory contains **production-ready code** you can copy directly into your project.

### Available Examples

**AI Integration** → `examples/ai/`
- Simple Claude Chat
- Streaming Chat (SSE)
- Workers AI Chat
- AI Gateway Integration

**Database** → `examples/database/`
- D1 Contact Form (SQL CRUD)
- KV Sessions (Auth)

### How to Use Examples

Each example is **self-contained** and includes:

```
example-name/
├── README.md              # Setup guide
├── worker-endpoint.ts     # API code
├── Component.tsx          # React UI
├── types.ts              # TypeScript types
├── schema.sql            # Database schema (if applicable)
└── PRP.md                # Implementation plan
```

**Integration steps:**

1. Browse `examples/` directory
2. Read the example's README
3. Copy code to your project (`src/` for React, `worker/` for API)
4. Update `wrangler.jsonc` with required bindings
5. Run `npm run cf-typegen` to generate types
6. Test with `npm run dev`

📖 **[examples/README.md](examples/README.md)** - Complete integration guide

---

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start local dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint

# Testing
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Deployment
npm run deploy       # Build and deploy to Cloudflare Workers
git push origin main # Auto-deploy via GitHub Actions

# Cloudflare
npm run cf-typegen   # Generate TypeScript types for bindings

# Wrangler CLI (Cloudflare Workers)
npx wrangler d1 create <db-name>           # Create D1 database
npx wrangler d1 migrations apply <db-name> # Run migrations
npx wrangler kv namespace create <name>    # Create KV namespace
npx wrangler secret put <SECRET_NAME>      # Add secret
npx wrangler tail                          # Stream logs
```

---

## 🗂️ Project Structure

```
cloudflare-workers-react-boilerplate/
├── .github/
│   └── workflows/
│       ├── deploy.yml           # GitHub Actions CI/CD pipeline
│       └── claude.yml           # Claude GitHub Actions (after /start setup)
├── .claude/
│   ├── commands/                # Claude Code slash commands
│   │   ├── start.md
│   │   ├── generate-prp.md
│   │   ├── execute-prp.md
│   │   ├── add-ai-feature.md
│   │   ├── setup-database.md
│   │   ├── setup-sandbox.md
│   │   └── add-binding.md
│   ├── templates/               # Code generation templates
│   │   ├── claude-code-action.yml  # GitHub Actions workflow template
│   │   ├── domain-setup-reminder.md
│   │   └── ...
│   └── settings.json            # Claude Code tool permissions
├── examples/
│   ├── ai/                      # AI integration examples
│   │   ├── simple-claude-chat/
│   │   ├── streaming-chat/
│   │   ├── workers-ai-chat/
│   │   └── with-ai-gateway/
│   └── database/                # Database examples
│       ├── d1-contact-form/
│       └── kv-sessions/
├── src/
│   ├── App.tsx                  # Main React component
│   ├── App.test.tsx             # Example component tests
│   ├── main.tsx                 # React entry point
│   ├── test/
│   │   └── setup.ts             # Vitest test setup
│   └── ...                      # Your frontend code
├── worker/
│   └── index.ts                 # Cloudflare Worker (API endpoints + security headers)
├── public/                      # Static assets
├── .dev.vars.example            # Example local secrets template
├── .nvmrc                       # Node.js version (22)
├── vitest.config.ts             # Vitest testing configuration
├── wrangler.jsonc               # Cloudflare Workers configuration
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config (root)
├── tsconfig.app.json            # TypeScript config (React app)
├── tsconfig.worker.json         # TypeScript config (Worker)
├── package.json                 # Dependencies and scripts
├── AI_INTEGRATION.md            # AI integration guide
├── CLOUDFLARE_WORKERS.md        # Cloudflare Workers guide
├── SANDBOX.md                   # Sandbox SDK guide
├── CLAUDE.md                    # Claude Code instructions
├── AGENTS.md                    # AI instructions (for other LLMs)
└── README.md                    # This file
```

---

## 🔐 Security Best Practices

This template follows security best practices:

✅ **No secrets in code** - All API keys stored in environment variables
✅ **SQL injection prevention** - Parameterised queries in all examples
✅ **Input validation** - All API endpoints validate inputs
✅ **CORS configured** - Proper cross-origin resource sharing
✅ **Secrets management** - Cloudflare secrets for sensitive data
✅ **Type safety** - TypeScript throughout for compile-time safety
✅ **Security headers** - CSP, X-Frame-Options, X-Content-Type-Options included
✅ **Health check endpoint** - `/api/health` for monitoring and uptime checks

### Managing Secrets

**Never commit secrets to Git!**

**Local development** (copy `.dev.vars.example` to `.dev.vars` - gitignored):
```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your actual secret values
ANTHROPIC_API_KEY=sk-ant-your-key-here
DATABASE_URL=your-local-db
```

**Production** (Cloudflare secrets):
```bash
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put DATABASE_URL
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| **[README.md](README.md)** | This file - Overview and quick start |
| **[CLAUDE.md](CLAUDE.md)** | Developer guidelines and AI coding instructions |
| **[AGENTS.md](AGENTS.md)** | AI guidelines for other LLMs (duplicate of CLAUDE.md) |
| **[AI_INTEGRATION.md](AI_INTEGRATION.md)** | Complete AI integration guide |
| **[docs/GITHUB_ACTIONS_CLAUDE.md](docs/GITHUB_ACTIONS_CLAUDE.md)** | Claude GitHub Actions for PR automation |
| **[SANDBOX.md](SANDBOX.md)** | Cloudflare Sandbox SDK for code execution |
| **[CLOUDFLARE_WORKERS.md](CLOUDFLARE_WORKERS.md)** | Cloudflare Workers operations guide |
| **[docs/CONVENTIONS.md](docs/CONVENTIONS.md)** | British English and style conventions |
| **[.claude/README.md](.claude/README.md)** | Claude Code slash commands documentation |
| **[examples/README.md](examples/README.md)** | How to use and integrate examples |

---

## 🤝 Contributing

Contributions are welcome! This is a community-driven template.

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Use privately

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- **[React](https://react.dev)** - UI framework
- **[Vite](https://vitejs.dev)** - Build tool
- **[TypeScript](https://www.typescriptlang.org/)** - Language
- **[Cloudflare Workers](https://workers.cloudflare.com/)** - Edge compute platform
- **[Claude Code](https://claude.com/claude-code)** - AI pair programming

---

## 🚦 Status

![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/your-repo/deploy.yml?branch=main)
![Last Commit](https://img.shields.io/github/last-commit/your-username/your-repo)
![Issues](https://img.shields.io/github/issues/your-username/your-repo)

---

## 💬 Support

- 📖 **Documentation**: Check the `/docs` folder and linked guides
- 💡 **Examples**: Explore the `examples/` directory
- 🐛 **Issues**: [Open an issue](https://github.com/your-username/your-repo/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/your-repo/discussions)

---

<div align="center">

**⚡ Built with Cloudflare Workers • 🤖 Optimized for Claude Code • 🚀 Production Ready**

[Use This Template](https://github.com/your-username/your-repo/generate) • [View Examples](examples/) • [Read Docs](CLAUDE.md)

</div>
