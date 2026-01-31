# Cloudflare Skills Plugin

This template includes the **jezweb-skills** Cloudflare plugin - a collection of 15 production-tested skills that enhance your Claude Code experience for Cloudflare development.

## What Are Skills?

Skills are Claude Code plugins that provide specialised knowledge, templates, and best practices for specific technologies. When you fork this template, all Cloudflare skills are automatically enabled - no additional setup required.

## Available Skills

### Core Services

| Skill | Command | Description |
|-------|---------|-------------|
| D1 Database | `/cloudflare:cloudflare-d1` | SQL database setup, migrations, query patterns |
| KV Storage | `/cloudflare:cloudflare-kv` | Key-value storage, caching, session management |
| R2 Storage | `/cloudflare:cloudflare-r2` | Object storage, file uploads, S3-compatible API |

### Advanced Features

| Skill | Command | Description |
|-------|---------|-------------|
| Workers AI | `/cloudflare:cloudflare-workers-ai` | Edge AI models, inference, embeddings |
| Queues | `/cloudflare:cloudflare-queues` | Message queues, background processing |
| Durable Objects | `/cloudflare:cloudflare-durable-objects` | Stateful coordination, WebSockets, real-time |
| Workflows | `/cloudflare:cloudflare-workflows` | Long-running tasks, orchestration |

### Specialised Tools

| Skill | Command | Description |
|-------|---------|-------------|
| Agents | `/cloudflare:cloudflare-agents` | AI agent framework, tool use, state management |
| MCP Servers | `/cloudflare:cloudflare-mcp-server` | Model Context Protocol servers on Workers |
| Vectorize | `/cloudflare:cloudflare-vectorize` | Vector search, RAG, semantic search |
| Hyperdrive | `/cloudflare:cloudflare-hyperdrive` | Database connection pooling, external DB proxy |

### Media & Security

| Skill | Command | Description |
|-------|---------|-------------|
| Images | `/cloudflare:cloudflare-images` | Image optimisation, transformations, CDN |
| Browser Rendering | `/cloudflare:cloudflare-browser-rendering` | Headless browsers, screenshots, PDFs |
| Turnstile | `/cloudflare:cloudflare-turnstile` | CAPTCHA alternative, bot protection |
| Python Workers | `/cloudflare:cloudflare-python-workers` | Python support for Cloudflare Workers |

## How to Use Skills

Simply type the skill command in Claude Code:

```
/cloudflare:cloudflare-d1
```

Claude Code will load the skill's knowledge base and can then help you with:

- Setting up the service
- Best practices and patterns
- Common issues and solutions
- Production-ready code templates

## Why Pre-installed Skills?

When you fork this template, the skills are automatically configured in `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "jezweb-skills": {
      "source": {
        "source": "github",
        "repo": "jezweb/claude-skills"
      }
    }
  },
  "enabledPlugins": {
    "cloudflare@jezweb-skills": true
  }
}
```

This means:

1. **Zero setup** - Skills work immediately after forking
2. **Always updated** - Skills fetch from the latest version
3. **Consistent experience** - All users get the same tooling

## Acknowledgements

The Cloudflare Skills Plugin is created and maintained by **[Jeremy Dawes (jezweb)](https://github.com/jezweb)**.

His [claude-skills](https://github.com/jezweb/claude-skills) repository provides production-tested skills for:

- Cloudflare platform (Workers, D1, R2, KV, and more)
- AI integrations (Claude API, OpenAI, Gemini)
- Frontend frameworks (React, TanStack, Tailwind)
- Databases (Drizzle ORM, Neon, Vercel)
- And much more

Thank you, Jeremy, for building this excellent resource for the Claude Code community!

## Learn More

- [jezweb/claude-skills on GitHub](https://github.com/jezweb/claude-skills)
- [Claude Code Plugin Documentation](https://docs.anthropic.com/en/docs/claude-code/plugins)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
