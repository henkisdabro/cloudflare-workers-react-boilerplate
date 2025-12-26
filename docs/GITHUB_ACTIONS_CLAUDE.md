# Claude Code GitHub Actions

This guide explains how to set up **Claude Code GitHub Actions** - enabling Claude to respond to `@claude` mentions in pull requests and issues, implement code changes, and commit directly to your branch.

## Overview

Claude Code GitHub Actions allows you to:

- **Ask questions** about code directly in PR comments
- **Request code reviews** by mentioning `@claude`
- **Implement changes** - Claude can write code and commit to your branch
- **Automate workflows** - trigger Claude on specific events

## Quick Start

The fastest way to set up Claude Code GitHub Actions is through the `/start` wizard, which includes an optional step for this configuration.

Alternatively, you can set it up manually following the steps below.

## Prerequisites

- A Cloudflare Workers project (this template)
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
- Repository admin access (to install the GitHub App and add secrets)

## Setup Options

### Option A: Automated Setup (Recommended)

Run this command in Claude Code:

```
/install-github-app
```

This guides you through:
1. Installing the Claude GitHub App
2. Adding `ANTHROPIC_API_KEY` to repository secrets
3. Creating the workflow file

### Option B: Manual Setup

#### Step 1: Install the Claude GitHub App

1. Visit [github.com/apps/claude](https://github.com/apps/claude)
2. Click **Install**
3. Select your repository
4. Grant the required permissions:
   - **Contents**: Read & Write (to modify files)
   - **Issues**: Read & Write (to respond to issues)
   - **Pull Requests**: Read & Write (to create PRs and push changes)

#### Step 2: Add API Key Secret

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your API key from [console.anthropic.com](https://console.anthropic.com)

#### Step 3: Create the Workflow File

Create `.github/workflows/claude.yml`:

```yaml
name: Claude Code

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  claude:
    # Only run when @claude is mentioned
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Usage

Once configured, mention `@claude` in any PR comment or issue to interact with Claude.

### Example Commands

**Ask about code:**
```
@claude explain how the authentication middleware works
```

**Request a code review:**
```
@claude review this PR for security issues
```

**Implement changes:**
```
@claude add input validation to the login form
```

**Fix bugs:**
```
@claude fix the TypeError in the user dashboard component
```

### How Claude Responds

1. Claude reads your comment and the PR context
2. Analyses the codebase using the repository's `CLAUDE.md` guidelines
3. Responds with an explanation, suggestion, or code changes
4. If implementing changes, commits directly to the PR branch

## Configuration Options

### Workflow Triggers

**Respond to PR and issue comments:**
```yaml
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
```

**Run on new PRs (automated review):**
```yaml
on:
  pull_request:
    types: [opened, synchronize]
```

**Scheduled tasks:**
```yaml
on:
  schedule:
    - cron: "0 9 * * 1"  # Every Monday at 9 AM
```

### Action Parameters

| Parameter | Description | Required |
|-----------|-------------|----------|
| `anthropic_api_key` | Your Anthropic API key | Yes |
| `prompt` | Instructions for Claude (for automated triggers) | No |
| `claude_args` | CLI arguments passed to Claude | No |
| `trigger_phrase` | Custom trigger (default: `@claude`) | No |
| `github_token` | GitHub token for API access | No |

### Advanced Configuration

**With custom prompt and CLI arguments:**
```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: "Review this PR for security vulnerabilities"
    claude_args: |
      --max-turns 5
      --model claude-sonnet-4-5-20250929
```

**Limit iterations to control costs:**
```yaml
claude_args: "--max-turns 5"
```

**Use a specific model:**
```yaml
claude_args: "--model claude-opus-4-5-20251101"
```

### Using CLAUDE.md for Guidelines

Claude automatically reads your repository's `CLAUDE.md` file to understand:

- Project architecture and conventions
- Code style guidelines
- Review criteria
- Language preferences (e.g., British English in this project)

This ensures Claude's responses and code changes follow your project's standards.

## Enterprise Authentication

### AWS Bedrock

For organisations using AWS Bedrock instead of the direct Anthropic API:

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    use_bedrock: true
    claude_args: '--model us.anthropic.claude-sonnet-4-5-20250929-v1:0'
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_REGION: us-east-1
```

**Recommended**: Use GitHub OIDC with IAM roles instead of static credentials.

### Google Vertex AI

For organisations using Google Vertex AI:

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    use_vertex: true
  env:
    GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.GOOGLE_CREDENTIALS }}
    GOOGLE_CLOUD_PROJECT: your-project-id
    GOOGLE_CLOUD_REGION: us-central1
```

**Recommended**: Use Workload Identity Federation instead of service account keys.

## Security Considerations

### Never Commit API Keys

Always use GitHub Secrets:
```yaml
# Correct
anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}

# Never do this
anthropic_api_key: sk-ant-xxxxxxxxxxxxxxx
```

### Principle of Least Privilege

Grant only necessary permissions:
```yaml
permissions:
  contents: write        # Required for committing changes
  pull-requests: write   # Required for PR comments
  issues: write          # Required for issue comments
```

### Conditional Execution

Prevent unnecessary runs:
```yaml
if: contains(github.event.comment.body, '@claude')
```

### Workflow Timeouts

Avoid runaway jobs:
```yaml
jobs:
  claude:
    timeout-minutes: 10
    runs-on: ubuntu-latest
```

### Review Before Merging

Always review Claude's changes before merging. Claude is a powerful assistant, but human oversight remains essential.

## Cost Considerations

### GitHub Actions Minutes

Claude runs on GitHub-hosted runners, consuming your Actions minutes. See [GitHub's billing](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions) for details.

### API Token Usage

Each interaction consumes tokens based on:
- Comment/prompt length
- Codebase size being analysed
- Response complexity

**Cost optimisation tips:**

1. **Use specific prompts:**
   ```yaml
   prompt: "/review"  # More focused than generic requests
   ```

2. **Limit iterations:**
   ```yaml
   claude_args: "--max-turns 5"
   ```

3. **Use concurrency controls:**
   ```yaml
   concurrency:
     group: claude-${{ github.ref }}
     cancel-in-progress: true
   ```

## Workflow Examples

### Basic PR Comment Response

```yaml
name: Claude Code

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

### Automated PR Review

```yaml
name: Claude PR Review

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Review this PR for:
            - Code quality and best practices
            - Potential bugs or issues
            - Security concerns
            - Adherence to project conventions in CLAUDE.md
          claude_args: "--max-turns 3"
```

### Security-Focused Review

For security-specific reviews, consider using the dedicated security action:

```yaml
- uses: anthropics/claude-code-security-review@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Troubleshooting

### Claude Doesn't Respond

1. **Check workflow triggers**: Ensure `issue_comment` or `pull_request_review_comment` events are configured
2. **Verify the `if` condition**: Confirm your comment contains `@claude`
3. **Check Actions tab**: Look for workflow runs and error messages
4. **Verify secrets**: Ensure `ANTHROPIC_API_KEY` is correctly set

### Authentication Errors

- Verify API key is valid and not expired
- Check the key has sufficient permissions
- Ensure the secret name matches exactly (`ANTHROPIC_API_KEY`)

### GitHub App Permissions

If Claude can't push changes:
1. Go to GitHub App settings
2. Verify **Contents: Read & Write** permission is granted
3. Re-install the app if permissions were recently changed

### Rate Limiting

If you encounter rate limits:
- Add delays between automated triggers
- Use concurrency controls
- Consider using Bedrock/Vertex AI for higher limits

## Resources

- **Official Repository**: [github.com/anthropics/claude-code-action](https://github.com/anthropics/claude-code-action)
- **Documentation**: [code.claude.com/docs/en/github-actions](https://code.claude.com/docs/en/github-actions)
- **GitHub Marketplace**: [github.com/marketplace/actions/claude-code-action-official](https://github.com/marketplace/actions/claude-code-action-official)
- **Security Review Action**: [github.com/anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review)
- **Example Workflows**: [github.com/anthropics/claude-code-action/tree/main/examples](https://github.com/anthropics/claude-code-action/tree/main/examples)
