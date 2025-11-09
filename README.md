# Cloudflare Workers + React Boilerplate Template

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Claude Code](https://img.shields.io/badge/Optimized_for-Claude_Code-5436DA?style=flat)](https://claude.com/claude-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Production-ready boilerplate for building full-stack web applications with React and Cloudflare Workers, optimized for AI-assisted development with Claude Code.**

Build globally-distributed, edge-native web applications with integrated AI capabilities, serverless databases, and automated CI/CD — all in one template.

---

## 🎯 What Is This?

This is a **comprehensive website development template** designed for building modern web applications that deploy to **Cloudflare's global edge network**. It combines:

- **Frontend**: React 19 + TypeScript + Vite (ultra-fast development)
- **Backend**: Cloudflare Workers (serverless edge functions)
- **AI Integration**: Built-in support for Claude API, Workers AI, and AI Gateway
- **Database**: Native Cloudflare D1 (SQL) and KV (key-value) storage
- **CI/CD**: Automated GitHub Actions deployment pipeline
- **Developer Experience**: Claude Code slash commands for rapid development

### Perfect For:

✅ Full-stack web applications
✅ AI-powered SaaS products
✅ Real-time APIs and microservices
✅ Global-scale websites with edge performance
✅ Developers using Claude Code or AI pair programming

### Not Suitable For:

❌ Static sites only (use Cloudflare Pages instead)
❌ Traditional server-based Node.js apps
❌ Projects requiring server-side rendering (SSR)

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE GLOBAL EDGE                    │
│                                                              │
│  ┌────────────────────┐         ┌──────────────────────┐   │
│  │   Static Assets    │         │  Cloudflare Worker   │   │
│  │   (React SPA)      │         │  (API Endpoints)     │   │
│  │                    │         │                      │   │
│  │  • React 19        │         │  • TypeScript        │   │
│  │  • Vite Build      │         │  • Edge Functions    │   │
│  │  • SPA Routing     │         │  • 0ms cold start    │   │
│  └────────────────────┘         └──────────────────────┘   │
│           │                              │                  │
│           └──────────────┬───────────────┘                  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │          CLOUDFLARE BINDINGS & SERVICES              │  │
│  │                                                       │  │
│  │  • D1 (SQLite Database)    • KV (Key-Value Store)   │  │
│  │  • R2 (Object Storage)     • Queues (Message Bus)   │  │
│  │  • Workers AI (Edge AI)    • AI Gateway (Caching)   │  │
│  │  • Analytics Engine        • Durable Objects        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19.2 | UI framework |
| **Build Tool** | Vite | 7.2 | Lightning-fast dev server & bundler |
| **Language** | TypeScript | 5.9 | Type-safe development |
| **Runtime** | Cloudflare Workers | Latest | Serverless edge compute |
| **Package Manager** | npm | Any | Dependency management |
| **CI/CD** | GitHub Actions | N/A | Automated deployment |

### Cloudflare Products Integrated

- **Workers** - Serverless edge compute (your API backend)
- **D1** - Serverless SQLite database at the edge
- **KV** - Ultra-fast key-value storage
- **R2** - S3-compatible object storage *(setup helper included)*
- **Workers AI** - Edge-native AI inference *(examples included)*
- **AI Gateway** - Caching & analytics for AI APIs *(examples included)*
- **Queues** - Message queue system *(setup helper included)*
- **Analytics Engine** - Custom analytics *(setup helper included)*

---

## 🚀 Deployment Pipeline

### Fully Automated CI/CD

Every push to `main` triggers automatic deployment:

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT PIPELINE                         │
└─────────────────────────────────────────────────────────────────┘

  Developer                GitHub                 Cloudflare
      │                      │                         │
      │  git push main       │                         │
      ├─────────────────────>│                         │
      │                      │                         │
      │                      │  Trigger Action         │
      │                      ├────────┐                │
      │                      │        │                │
      │                      │   ┌────▼─────┐          │
      │                      │   │  Build   │          │
      │                      │   │          │          │
      │                      │   │ 1. npm install      │
      │                      │   │ 2. tsc -b (compile) │
      │                      │   │ 3. vite build       │
      │                      │   └────┬─────┘          │
      │                      │        │                │
      │                      │   ┌────▼─────┐          │
      │                      │   │  Deploy  │          │
      │                      │   │          │          │
      │                      │   │ wrangler deploy     │
      │                      │   └────┬─────┘          │
      │                      │        │                │
      │                      │        │  Deploy via API │
      │                      │        └────────────────>│
      │                      │                         │
      │                      │                    ┌────▼─────┐
      │                      │                    │  Global  │
      │                      │                    │   Edge   │
      │                      │                    │  Deploy  │
      │                      │                    └──────────┘
      │                      │                         │
      │  ✅ Deployment URL   │                         │
      │<─────────────────────┼─────────────────────────┤
      │                      │                         │
```

### Pipeline Configuration

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

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Cloudflare Account** ([sign up free](https://dash.cloudflare.com/sign-up))
- **GitHub Account** (for automated deployment)
- **Claude Code** *(optional, but recommended)* - [Get it here](https://claude.com/claude-code)

### 1️⃣ Create Your Project

Click **"Use this template"** on GitHub, then:

```bash
# Clone your new repository
git clone https://github.com/your-username/your-new-repo.git
cd your-new-repo

# Install dependencies
npm install
```

### 2️⃣ Configure Deployment (One-Time Setup)

You need two values from your Cloudflare dashboard:

**Get your Cloudflare Account ID:**
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to Workers & Pages
3. Copy your **Account ID** from the right sidebar

**Create an API Token:**
1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Use the **"Edit Cloudflare Workers"** template
4. Copy the generated token immediately

**Add secrets to GitHub:**
1. In your GitHub repo: **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add `CLOUDFLARE_ACCOUNT_ID` with your account ID
4. Add `CLOUDFLARE_API_TOKEN` with your API token

### 3️⃣ Start Developing

```bash
# Start local development server
npm run dev
```

Visit **http://localhost:5173** - your app is running!

### 4️⃣ Deploy to Production

```bash
# Commit your changes
git add .
git commit -m "Initial setup"

# Push to main branch (auto-deploys via GitHub Actions)
git push origin main
```

✅ **Your app is now live globally!** Check the Actions tab for your deployment URL.

---

## 🤖 Claude Code Integration

This template is **optimized for AI-assisted development** with Claude Code, featuring interactive slash commands that accelerate your workflow.

### Quick Start with Claude Code

After cloning this template, open it in Claude Code and run:

```
/new-project
```

This interactive wizard will:
- Configure your project name
- Guide you through Cloudflare setup
- Configure GitHub Actions secrets
- Test your local environment
- Help you create your first feature

### Available Slash Commands

| Command | Description |
|---------|-------------|
| `/new-project` | Complete project setup wizard |
| `/generate-prp <feature>` | Create a comprehensive Product Requirement Plan |
| `/execute-prp <file>` | Implement a feature from a PRP |
| `/add-ai-feature` | Add AI capabilities (Claude API, Workers AI, AI Gateway) |
| `/setup-database` | Set up D1 (SQL) or KV (key-value) storage |
| `/add-binding` | Add Cloudflare bindings (R2, Queues, etc.) |

### Example Workflow

```bash
# 1. Set up your project
/new-project

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

---

## 🤖 AI Integration Features

Build AI-powered applications with **zero infrastructure setup**. This template includes ready-to-use patterns for integrating AI into your web app.

### AI Options

| Option | Best For | Setup Time | Cost |
|--------|----------|------------|------|
| **Claude API** | Advanced reasoning, long conversations | 2 min | Pay per token |
| **Workers AI** | Edge inference, cost-effective | 1 min | Included in Workers |
| **AI Gateway** | Production apps with caching | 5 min | Reduces AI costs 30-80% |

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
│       └── deploy.yml           # GitHub Actions CI/CD pipeline
├── .claude/
│   ├── commands/                # Claude Code slash commands
│   │   ├── new-project.md
│   │   ├── add-ai-feature.md
│   │   ├── setup-database.md
│   │   └── ...
│   └── templates/               # Code generation templates
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
│   ├── main.tsx                 # React entry point
│   └── ...                      # Your frontend code
├── worker/
│   └── index.ts                 # Cloudflare Worker (API endpoints)
├── public/                      # Static assets
├── wrangler.jsonc               # Cloudflare Workers configuration
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config (root)
├── tsconfig.app.json            # TypeScript config (React app)
├── tsconfig.worker.json         # TypeScript config (Worker)
├── package.json                 # Dependencies and scripts
├── AI_INTEGRATION.md            # AI integration guide
├── CLOUDFLARE_WORKERS.md        # Cloudflare Workers guide
├── CLAUDE.md                    # Claude Code instructions
└── README.md                    # This file
```

---

## 🔐 Security Best Practices

This template follows security best practices:

✅ **No secrets in code** - All API keys stored in environment variables
✅ **SQL injection prevention** - Parameterized queries in all examples
✅ **Input validation** - All API endpoints validate inputs
✅ **CORS configured** - Proper cross-origin resource sharing
✅ **Secrets management** - Cloudflare secrets for sensitive data
✅ **Type safety** - TypeScript throughout for compile-time safety

### Managing Secrets

**Never commit secrets to Git!**

**Local development** (`.dev.vars` file - gitignored):
```bash
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
| **[AI_INTEGRATION.md](AI_INTEGRATION.md)** | Complete AI integration guide |
| **[CLOUDFLARE_WORKERS.md](CLOUDFLARE_WORKERS.md)** | Cloudflare Workers operations guide |
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
