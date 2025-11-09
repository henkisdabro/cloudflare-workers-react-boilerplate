# Claude Code Configuration

This directory contains Claude Code specific configuration for this project.

## Available Slash Commands

### `/new-project`

**Use this when:** You've just forked this template and want to set up your new project.

Interactive setup assistant that guides you through:
- Updating project name and configuration
- Setting up Cloudflare credentials
- Configuring GitHub Actions secrets
- Testing local development
- Creating your first PRP

**Usage:**
```
/new-project
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

## Directory Structure

```
.claude/
├── commands/           # Slash command definitions
│   ├── new-project.md
│   ├── generate-prp.md
│   └── execute-prp.md
└── templates/          # Templates for code generation
    └── prp_base.md     # PRP template

PRPs/                   # Product Requirement Plans
└── .gitkeep
```

## Workflow

1. **Initial Setup:** Run `/new-project` after forking this template
2. **Plan Features:** Use `/generate-prp` to create implementation plans
3. **Build Features:** Use `/execute-prp` to implement the plans
4. **Iterate:** Create new PRPs for additional features

## Templates

### PRP Template (`templates/prp_base.md`)

Comprehensive template for Product Requirement Plans including:
- Metadata and executive summary
- Research findings (codebase + external)
- Technical specification
- Implementation blueprint
- Testing approach and validation gates
- Success criteria

## Project-Specific Context

This template is built for:
- **Framework:** Vite + React 19
- **Language:** TypeScript
- **Platform:** Cloudflare Workers
- **Deployment:** GitHub Actions

PRPs generated here are optimized for this stack and include Cloudflare-specific considerations.
