# Examples & Reference Implementations

Welcome to the examples directory! This collection contains production-ready reference implementations demonstrating common patterns and integrations for Cloudflare Workers + React applications.

## What This Directory Contains

Each example in this directory is a self-contained implementation showcasing a specific feature or pattern. These are not just code snippets - they're complete, working implementations that you can copy, adapt, and integrate into your project.

## How to Use These Examples

### Examples are Reference Implementations

Think of these examples as a cookbook for your Cloudflare Workers + React application. Each example demonstrates:

- **Best practices** for implementing a specific feature
- **Complete code** from frontend to backend
- **Configuration** needed (bindings, secrets, etc.)
- **Database schemas** and migrations (where applicable)
- **Security considerations** and error handling

### Copy and Adapt to Your Project

Examples are designed to be integrated into your main project:

1. **Review the example** - Read the README to understand what it does
2. **Copy relevant files** - Move frontend and worker code to your project
3. **Update configuration** - Add necessary bindings to your `wrangler.jsonc`
4. **Generate types** - Run `npm run cf-typegen` after adding bindings
5. **Test locally** - Verify everything works with `npm run dev`
6. **Customize** - Adapt the code to your specific needs

### Each Example is Self-Contained

Every example includes:

- **README.md** - Detailed explanation, prerequisites, and setup steps
- **Source code** - Frontend components and Worker API handlers
- **Configuration examples** - Sample `wrangler.jsonc` snippets
- **Database files** - Migrations and schemas (for D1 examples)
- **PRP.md** - Product Requirement Plan for implementation guidance
- **Comments** - Inline documentation explaining key concepts

## Available Examples

### AI Integration (`ai/`)

Explore various approaches to integrating AI capabilities into your application. See **[AI Examples Overview](./ai/README.md)** for complete details.

#### 1. Simple Claude Chat
**Directory:** `ai/simple-claude-chat/`

A straightforward chat interface using Anthropic's Claude API. Perfect for getting started with AI.

**What you'll learn:**
- Setting up Claude API with Workers
- Handling chat messages and context
- Managing API keys securely
- Error handling and rate limiting

**Use this when:** You need a basic conversational AI interface

#### 2. Streaming Chat
**Directory:** `ai/streaming-chat/`

Real-time streaming responses using Server-Sent Events (SSE) for a better user experience.

**What you'll learn:**
- Implementing streaming responses
- Server-Sent Events (SSE) patterns
- Handling stream interruptions
- Progressive UI updates

**Use this when:** You want real-time, token-by-token responses

#### 3. Workers AI Chat
**Directory:** `ai/workers-ai-chat/`

Edge AI integration using Cloudflare's Workers AI for low-latency, cost-effective inference.

**What you'll learn:**
- Using Cloudflare Workers AI binding
- Edge AI deployment
- Model selection and configuration
- Cost optimization strategies

**Use this when:** You need low-latency AI at the edge

#### 4. Using Cloudflare AI Gateway
**Directory:** `ai/with-ai-gateway/`

Production-ready setup showing how to integrate Cloudflare's AI Gateway product for caching, analytics, and cost control.

**What you'll learn:**
- Configuring AI Gateway
- Caching strategies for AI responses
- Rate limiting and cost controls
- Analytics and monitoring

**Use this when:** You're deploying AI features to production

### Database & Storage (`database/`)

Master data persistence patterns with Cloudflare's serverless storage solutions:

#### D1 Contact Form
**Directory:** `database/d1-contact-form/`

Complete contact form implementation with D1 database storage, including schema design and migrations.

**What you'll learn:**
- D1 database setup and configuration
- Creating and running migrations
- CRUD operations with prepared statements
- Form handling and validation
- SQL best practices for edge databases

**Use this when:** You need relational data storage with SQL

#### KV Sessions
**Directory:** `database/kv-sessions/`

User session management using Cloudflare KV with automatic expiration.

**What you'll learn:**
- KV namespace setup
- Session creation and validation
- TTL (Time To Live) configuration
- Secure session handling
- Cookie management

**Use this when:** You need session storage or simple key-value caching

## Prerequisites

Before using these examples, ensure you have:

### Required

- Node.js 18+ installed
- npm or another package manager
- A Cloudflare account (free tier works)
- This boilerplate template set up and running
- Basic understanding of TypeScript, React, and Cloudflare Workers

### For Specific Examples

**AI Examples:**
- Anthropic API key (for Claude API examples) - [Get one here](https://console.anthropic.com/)
- Workers AI enabled on your Cloudflare account (for Workers AI examples)

**Database Examples:**
- Wrangler CLI installed (`npm install -g wrangler`)
- Understanding of SQL (for D1 examples)

## Integration Guide

Follow these steps to integrate any example into your project:

### Step 1: Review the Example

```bash
# Navigate to the example you're interested in
cd examples/ai/simple-claude-chat/

# Read the README
cat README.md
```

Understand what the example does, what it requires, and how it works.

### Step 2: Copy Files to Your Project

Each example is organized by file type:

**Frontend Code** (React components and hooks)
```bash
# Example structure:
examples/ai/simple-claude-chat/src/
  components/
    ChatInterface.tsx
  hooks/
    useChat.ts
```

Copy these to your project's `src/` directory:
```bash
cp -r examples/ai/simple-claude-chat/src/* src/
```

**Worker Code** (API endpoints)
```bash
# Example structure:
examples/ai/simple-claude-chat/worker/
  routes/
    chat.ts
```

Copy these to your project's `worker/` directory:
```bash
cp -r examples/ai/simple-claude-chat/worker/* worker/
```

**Database Files** (for D1 examples)
```bash
# Example structure:
examples/database/d1-contact-form/migrations/
  0001_create_contacts_table.sql
```

Copy migrations to your project root:
```bash
cp -r examples/database/d1-contact-form/migrations ./
```

### Step 3: Update Configuration

Each example's README includes a section on required bindings. Add these to your `wrangler.jsonc`:

**Example: D1 Database Binding**
```jsonc
{
  "name": "my-project",
  // ... other config
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-database",
      "database_id": "your-database-id-here"
    }
  ]
}
```

**Example: Environment Variables (Secrets)**
```bash
# Set secrets for production
npx wrangler secret put ANTHROPIC_API_KEY

# For local development, create .dev.vars
echo 'ANTHROPIC_API_KEY=sk-ant-...' > .dev.vars
```

### Step 4: Generate TypeScript Types

After adding bindings, generate types so TypeScript knows about them:

```bash
npm run cf-typegen
```

This updates `worker-configuration.d.ts` with type definitions for your bindings.

### Step 5: Install Dependencies (if needed)

Some examples may require additional packages:

```bash
# Check the example's README for any additional dependencies
npm install package-name
```

### Step 6: Test Locally

Start the development server and test your integration:

```bash
npm run dev
```

Visit `http://localhost:5173` and test the feature.

### Step 7: Customize and Adapt

Now that the example is integrated, customize it for your needs:

- Adjust styling to match your design
- Modify business logic
- Add additional validation
- Integrate with your existing features
- Add error handling specific to your use case

## File Structure Conventions

All examples follow these conventions:

```
examples/
├── ai/
│   ├── README.md                        # AI examples overview
│   └── simple-claude-chat/
│       ├── README.md                    # Documentation
│       ├── PRP.md                       # Product Requirement Plan
│       ├── src/                         # Frontend code
│       │   ├── components/
│       │   │   └── ChatInterface.tsx
│       │   └── hooks/
│       │       └── useChat.ts
│       ├── worker/                      # Worker code
│       │   └── routes/
│       │       └── chat.ts
│       └── wrangler.example.jsonc       # Example configuration
├── database/
│   └── d1-contact-form/
│       ├── README.md
│       ├── PRP.md
│       ├── src/                         # Frontend code
│       │   └── components/
│       │       └── ContactForm.tsx
│       ├── worker/                      # Worker code
│       │   └── routes/
│       │       └── contacts.ts
│       ├── migrations/                  # Database migrations
│       │   └── 0001_create_contacts.sql
│       └── wrangler.example.jsonc
└── README.md                            # This file
```

## Best Practices

When integrating examples:

### Do:

- **Read the entire README** before copying code
- **Review the PRP.md** to understand the implementation plan
- **Test locally first** before deploying
- **Customize for your needs** - examples are starting points
- **Follow security best practices** mentioned in each example
- **Keep dependencies minimal** following YAGNI principles
- **Use TypeScript** for type safety

### Don't:

- **Copy blindly** without understanding the code
- **Skip configuration steps** - bindings are essential
- **Ignore security warnings** in the documentation
- **Deploy to production** without thorough testing
- **Commit secrets** - always use environment variables

## Troubleshooting

### Common Issues

**"Binding not found" error:**
- Ensure you've added the binding to `wrangler.jsonc`
- Run `npm run cf-typegen` to generate types
- Restart your dev server

**TypeScript errors after copying code:**
- Run `npm run cf-typegen` to update binding types
- Check that you've copied all necessary files
- Verify imports match your project structure

**Database migration fails:**
- Check database name matches `wrangler.jsonc`
- Ensure you created the database with `wrangler d1 create`
- For local testing, use `--local` flag

**API calls fail in production but work locally:**
- Check secrets are set with `wrangler secret put`
- Verify bindings are correctly configured
- Check CORS settings if making cross-origin requests

## Getting Help

If you run into issues:

1. **Check the example's README** - Most common issues are covered
2. **Review the PRP.md** for detailed implementation guidance
3. **Review the main documentation**:
   - [CLAUDE.md](../CLAUDE.md) - Project guidelines and patterns
   - [AI_INTEGRATION.md](../AI_INTEGRATION.md) - AI integration details (coming soon)
   - [CLOUDFLARE_WORKERS.md](../CLOUDFLARE_WORKERS.md) - Workers documentation (coming soon)
4. **Cloudflare Documentation**:
   - [Workers Documentation](https://developers.cloudflare.com/workers/)
   - [D1 Documentation](https://developers.cloudflare.com/d1/)
   - [KV Documentation](https://developers.cloudflare.com/kv/)
   - [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
5. **Community Support**:
   - Cloudflare Discord
   - GitHub Issues on this repository

## Contributing Examples

Have a useful pattern to share? Consider contributing an example:

1. Follow the file structure conventions above
2. Include a comprehensive README
3. Add a PRP.md following the template in `.claude/templates/prp_base.md`
4. Add inline comments explaining key concepts
5. Test thoroughly before submitting
6. Open a pull request

## Next Steps

- Browse the available examples above
- Read the README for an example that interests you
- Follow the integration guide to add it to your project
- Customize and build something amazing

Happy coding!
