# Claude Code Configuration

This directory contains Claude Code specific configuration for this project.

## Getting Started

Run this single command after forking:

```
/start
```

This interactive wizard guides you through complete project setup with decision points tailored to your needs.

## Available Slash Commands

### `/start`

**Use this when:** You've just forked this template and want to set up your new project.

Interactive setup wizard that:

1. **Asks your deployment preference:**
   - Local deployment (solo devs, quick prototyping)
   - GitHub Actions CI/CD (teams, automated deploys)
   - Both (recommended for maximum flexibility)

2. **Configures based on your choice:**
   - Local: Creates `.env` with Cloudflare credentials, optionally `.dev.vars` for app secrets
   - GitHub: Guides you through repository secrets setup
   - Both: Full configuration for local and CI/CD deployment

3. **Guides you through:**
   - Project naming and configuration
   - Cloudflare account setup (Account ID, API token)
   - Local development verification
   - Custom domain setup (optional)
   - First deployment
   - Next steps with `/generate-prp`

**Usage:**
```
/start
```

### `/generate-prp <feature-description>`

**Use this when:** You want to create a comprehensive Product Requirement Plan for a new feature.

Generates a detailed PRP including:
- Codebase analysis and similar patterns
- External research and documentation
- Implementation blueprint with pseudocode
- Validation gates and testing approach
- Step-by-step implementation guide

**Usage:**
```
/generate-prp "Add user authentication with Cloudflare D1"
```

The PRP will be saved in `PRPs/<feature-name>.md`

### `/execute-prp <prp-file>`

**Use this when:** You have a PRP and want to implement it.

Executes a PRP by:
- Loading and understanding the PRP requirements
- Creating implementation todos
- Writing all necessary code
- Running validation gates
- Verifying implementation completeness

**Usage:**
```
/execute-prp PRPs/user-authentication.md
```

### `/add-ai-feature`

**Use this when:** You want to add AI capabilities to your project.

Interactive guide for:
- Claude API integration
- Workers AI setup
- AI Gateway configuration
- Streaming chat implementation

**Usage:**
```
/add-ai-feature
```

### `/setup-database`

**Use this when:** You need to add database storage to your project.

Interactive setup for:
- D1 (SQL database) configuration
- KV (key-value storage) setup
- Migration file generation
- TypeScript type generation

**Usage:**
```
/setup-database
```

### `/setup-sandbox`

**Use this when:** You need secure code execution for AI agents or REPLs.

Interactive setup for Cloudflare Sandbox SDK:
- AI code execution environments
- Code interpreter/REPL setup
- Data analysis pipelines
- Custom sandbox applications

**Usage:**
```
/setup-sandbox
```

### `/add-binding`

**Use this when:** You want to add other Cloudflare bindings.

Configure additional bindings:
- R2 (object storage)
- Queues (message queues)
- Analytics Engine
- Durable Objects
- And more

**Usage:**
```
/add-binding
```

## Directory Structure

```
.claude/
├── commands/           # Slash command definitions
│   ├── start.md
│   ├── generate-prp.md
│   ├── execute-prp.md
│   ├── add-ai-feature.md
│   ├── setup-database.md
│   ├── setup-sandbox.md
│   └── add-binding.md
├── templates/          # Templates for code generation
│   ├── domain-setup-reminder.md
│   ├── prp_base.md
│   ├── prp_ai_feature.md
│   ├── prp_api_feature.md
│   ├── prp_auth_feature.md
│   └── prp_database_feature.md
└── settings.json       # Pre-approved tool permissions

PRPs/                   # Product Requirement Plans
└── .gitkeep
```

## Workflow

1. **Complete Setup:** Run `/start` to configure everything in one go
2. **Plan Features:** Use `/generate-prp` to create implementation plans
3. **Build Features:** Use `/execute-prp` to implement the plans
4. **Add Capabilities:** Use `/add-ai-feature`, `/setup-database`, or `/setup-sandbox`
5. **Add Bindings:** Use `/add-binding` for additional Cloudflare services

## Templates

### PRP Template (`templates/prp_base.md`)

Comprehensive template for Product Requirement Plans including:
- Metadata and executive summary
- Research findings (codebase + external)
- Technical specification
- Implementation blueprint
- Testing approach and validation gates
- Success criteria

### Feature-Specific Templates

- `prp_ai_feature.md` - AI integration features
- `prp_api_feature.md` - API endpoint development
- `prp_auth_feature.md` - Authentication features
- `prp_database_feature.md` - Database/storage features

## Tool Permissions

The `settings.json` file contains pre-approved tool permissions for common development operations:

- Git operations (add, commit, push, pull, status, diff, log)
- File operations (Edit, MultiEdit, Write, Read)
- Shell utilities (cat, ls, mkdir, mv, touch, tree, grep)
- Python/testing tools (pytest, ruff)
- Web operations (WebFetch for documentation lookups)

Modify `permissions.allow` array to customise for your project needs.

## Project-Specific Context

This template is built for:
- **Framework:** Vite + React 19
- **Language:** TypeScript
- **Platform:** Cloudflare Workers
- **Database:** D1 (SQL) and KV (key-value)
- **AI:** Claude API, Workers AI, AI Gateway, Sandbox SDK
- **Deployment:** GitHub Actions

PRPs and commands are optimised for this stack and include Cloudflare-specific considerations.
