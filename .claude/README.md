# Claude Code Configuration

This directory contains Claude Code specific configuration for this project.

## Available Slash Commands

### `/new-project`

**Use this when:** You've just forked this template and want to set up your new project.

Interactive setup assistant that guides you through:
- Updating project name and configuration
- Setting up Cloudflare credentials
- Configuring custom domains (Cloudflare DNS or external providers)
- Configuring GitHub Actions secrets
- Testing local development
- Creating your first PRP

**Usage:**
```
/new-project
```

### `/setup-cloudflare`

**Use this when:** You need help setting up Cloudflare credentials and GitHub secrets for deployment.

Step-by-step guide for:
- Finding your Cloudflare Account ID
- Creating an API token with correct permissions
- Adding secrets to GitHub Actions
- Local Wrangler authentication
- Verifying your setup works

**Usage:**
```
/setup-cloudflare
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
│   ├── new-project.md
│   ├── setup-cloudflare.md
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

1. **Cloudflare Setup:** Run `/setup-cloudflare` to configure credentials and secrets
2. **Project Setup:** Run `/new-project` to configure project name and metadata
3. **Add Features:** Use `/add-ai-feature`, `/setup-database`, or `/setup-sandbox`
4. **Plan Complex Features:** Use `/generate-prp` to create implementation plans
5. **Build Features:** Use `/execute-prp` to implement the plans
6. **Add Bindings:** Use `/add-binding` for additional Cloudflare services

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
