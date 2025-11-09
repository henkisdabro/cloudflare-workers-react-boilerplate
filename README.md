# Project Template: Vite, React, TypeScript & Cloudflare Workers

This boilerplate provides a production-ready starting point for building high-performance, full-stack web applications and deploying them globally on the Cloudflare network.

---

## 🚀 How to Use This Template

Follow these steps to spin up a new project.

### ✅ Step 1: Create Your New Repository

1. On the GitHub page for this boilerplate, click the green "**Use this template**" button.
2. Choose a name for your new repository and click "**Create repository from template**".
3. Clone your newly created repository to your local machine:

    ```bash
    git clone https://github.com/your-username/your-new-repo-name.git
    ```

4. Navigate into the project directory and install the dependencies:

    ```bash
    cd your-new-repo-name && npm install
    ```

### ✅ Step 2: Configure Cloudflare Deployment Secrets

The deployment is fully automated via GitHub Actions, but it needs your Cloudflare credentials to work. You only need to do this once for each new project.

**Note:** You do **not** need to manually create a Cloudflare Workers project. The first deployment will automatically create the Worker based on the `name` field in `wrangler.jsonc`.

1. **Get your Cloudflare Account ID:**
    * Log in to the [Cloudflare dashboard](https://dash.cloudflare.com).
    * On the homepage (Workers & Pages overview), your **Account ID** is listed in the right-hand sidebar under "Account details".
    * Alternatively, find it at: [https://dash.cloudflare.com/?to=/:account/workers](https://dash.cloudflare.com) (look in the right sidebar).
    * Copy the Account ID.

2. **Create a Cloudflare API Token:**
    * From your Cloudflare dashboard, go to **My Profile** > **API Tokens** or visit [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens).
    * Click "**Create Token**" and use the "**Edit Cloudflare Workers**" template.
    * Under "**Account Resources**", ensure your account is selected.
    * Under "**Zone Resources**", you can select "All zones" for simplicity.
    * Continue to the summary and create the token. **Copy the generated token immediately**, as you will not see it again.

3. **Add Secrets to Your GitHub Repository:**
    * In your new repository on GitHub, go to **Settings > Secrets and variables > Actions**.
    * Click "**New repository secret**".
    * Create a secret named `CLOUDFLARE_ACCOUNT_ID` and paste your Account ID.
    * Create another secret named `CLOUDFLARE_API_TOKEN` and paste your API Token.

### ✅ Step 3: Develop Locally and Deploy Globally

* **To run the local development server:**

    ```bash
    npm run dev
    ```

* **To deploy your application:** Simply commit your code and push it to the `main` branch. GitHub Actions will automatically build and deploy it for you.

    ```bash
    git add .
    git commit -m "My awesome new feature"
    git push origin main
    ```

---

## 🤖 Claude Code Integration

This template includes built-in Claude Code slash commands to streamline your development workflow.

### Quick Start with Claude Code

If you're using [Claude Code](https://claude.com/claude-code), run this command after cloning:

```
/new-project
```

This interactive assistant will:
- Help you configure your project name
- Guide you through Cloudflare setup
- Configure GitHub Actions secrets
- Test your local environment
- Create your first feature PRP

### Available Commands

**Project Setup & Planning:**
- **`/new-project`** - Interactive setup wizard for new projects
- **`/generate-prp <feature>`** - Create a Product Requirement Plan with comprehensive research
- **`/execute-prp <file>`** - Implement a feature from a PRP

**AI & Database Features:**
- **`/add-ai-feature`** - Add AI capabilities to your app (Claude API, Workers AI, or AI Gateway)
- **`/setup-database`** - Set up D1 SQL database or KV storage with guided configuration
- **`/add-binding`** - Add any Cloudflare binding (R2, Queues, Durable Objects, etc.) (coming soon)

### Example Workflow

```bash
# 1. Set up your new project
/new-project

# 2. Generate a plan for your first feature
/generate-prp "Add contact form with Cloudflare D1 storage"

# 3. Implement the feature
/execute-prp PRPs/contact-form.md
```

See [`.claude/README.md`](.claude/README.md) for detailed documentation.

---

## 🤖 AI-Powered Applications

This template now includes comprehensive support for building AI-powered applications using industry-leading AI platforms. Whether you need conversational interfaces, content generation, or intelligent data processing, you have multiple integration options.

### AI Integration Options

- **Claude API** - Direct integration with Anthropic's Claude for advanced reasoning and long-context conversations
- **Workers AI** - Cloudflare's edge AI inference for low-latency, cost-effective AI operations
- **AI Gateway** - Cloudflare's intelligent caching and rate-limiting layer for production AI deployments

### Quick Start: Add AI to Your App

```bash
# Interactive AI feature setup
/add-ai-feature
```

This command will guide you through:
- Choosing the right AI platform (Claude API, Workers AI, or AI Gateway)
- Setting up API keys and bindings
- Implementing common patterns (chat, streaming, content generation)
- Configuring security and rate limiting

### Working Examples

Explore complete AI integration examples in **[examples/ai/](examples/ai/)**:
- **Simple Claude Chat** - Basic chat interface
- **Streaming Chat** - Real-time streaming responses
- **Workers AI Chat** - Edge AI integration
- **AI Gateway** - Production-ready caching and optimization

### Learn More

For detailed guides, best practices, and integration patterns, see **[AI_INTEGRATION.md](AI_INTEGRATION.md)**.

---

## 💾 Database & Storage

Built-in support for Cloudflare's serverless storage solutions means zero-latency data access at the edge with no infrastructure to manage.

### Storage Options

- **D1 (SQL Database)** - Serverless SQLite for relational data, complex queries, and transactions
- **KV (Key-Value)** - Ultra-fast key-value storage for caching, sessions, and configuration

### Quick Start: Add Database

```bash
# Interactive database setup
/setup-database
```

This command will help you:
- Choose between D1 (SQL) or KV (key-value) based on your needs
- Create the database/namespace
- Configure bindings in wrangler.jsonc
- Generate TypeScript types
- Set up migrations (for D1)

### Working Examples

Explore database patterns in **[examples/database/](examples/database/)**:
- **D1 Contact Form** - Complete form with database storage and migrations
- **KV Sessions** - Session management with Cloudflare KV

### Learn More

For detailed documentation on Cloudflare Workers bindings and storage, see **[CLOUDFLARE_WORKERS.md](CLOUDFLARE_WORKERS.md)**.

---

## 📚 Examples & Patterns

The **`examples/`** directory contains production-ready reference implementations you can copy and adapt to your project. Each example is self-contained with its own documentation and demonstrates a specific pattern or integration.

### Available Examples

**AI Integration** - `examples/ai/`
- Simple Claude Chat - Basic chat interface with Claude API
- Streaming Chat - Real-time streaming responses with SSE
- Workers AI Chat - Edge AI with Cloudflare Workers AI
- AI Gateway - Production caching and optimization

**Database & Storage** - `examples/database/`
- D1 Contact Form - Complete CRUD example with migrations
- KV Sessions - Session management patterns

### How to Use Examples

Each example includes:
- **README.md** - Setup instructions and explanation
- **Source Code** - Frontend (React) and Worker (API) code
- **Configuration** - Example wrangler.jsonc bindings
- **Migrations** - Database schemas (for D1 examples)

To integrate an example:

1. Browse the examples directory
2. Read the example's README for prerequisites
3. Copy relevant code to your project
4. Update your wrangler.jsonc with required bindings
5. Run `npm run cf-typegen` to generate types
6. Test with `npm run dev`

See **[examples/README.md](examples/README.md)** for detailed integration guides.

---
