# /start - Project Setup Wizard

You are guiding a user through setting up their new Cloudflare Workers + React project. This is an interactive wizard - use AskUserQuestion at decision points and TodoWrite to track progress.

## Instructions

1. Read through all phases before starting
2. Use TodoWrite to create a task list based on the user's chosen path
3. Execute each phase sequentially, pausing at decision points
4. Mark tasks complete as you finish them
5. If any step fails, stop and help resolve before continuing
6. **Extract GitHub info early**: Parse git remote origin to get username/repo for direct links

---

## Phase 1: Welcome & Repository Detection

### 1.1 Display Welcome Banner

Start with a warm, visually engaging welcome:

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🚀 CLOUDFLARE WORKERS + REACT PROJECT SETUP WIZARD 🚀         ║
║                                                                  ║
║   Let's get your project deployed to the edge in minutes!       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

### 1.2 Detect Repository Information

Run this command to extract GitHub info:

```bash
git remote get-url origin 2>/dev/null | sed -E 's/.*github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/\1 \2/' | head -1
```

Parse the output to get:
- `GITHUB_USERNAME`: The repository owner
- `GITHUB_REPO`: The repository name

Store these for generating direct links later. If parsing fails, ask the user for their GitHub username and repository name.

### 1.3 Development Approach

Use AskUserQuestion with these options:

**Question:** "How would you like to deploy your project?"

| Option | Description |
|--------|-------------|
| **Both (Recommended)** | Full setup with local tooling AND automated CI/CD. Maximum flexibility. |
| **GitHub Actions CI/CD** | Automated deployment when you push to main. Best for teams. |
| **Local deployment only** | Deploy directly from your machine. Best for quick prototyping. |

Store their choice - it determines which setup steps to include.

---

## Phase 2: Prerequisites Check

Display a progress indicator:

```
📋 Phase 2/8: Prerequisites Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Run these commands and verify the output:

```bash
node --version    # Require v22+
npm --version     # Any recent version
```

Check if `node_modules` exists. If not, run:

```bash
npm install
```

Verify the build works:

```bash
npm run build
```

**If any check fails:** Stop and help the user resolve the issue before continuing.

Display success:

```
✅ Node.js v22+ detected
✅ Dependencies installed
✅ Build successful
```

---

## Phase 3: Project Configuration

Display a progress indicator:

```
📋 Phase 3/8: Project Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3.1 Get Project Details

Use AskUserQuestion to gather:

**Question:** "What should your project be called?"

- Suggest using kebab-case (e.g., `my-awesome-app`)
- Default suggestion: use the repo name detected in Phase 1
- This becomes the Worker name and appears in the deployment URL

### 3.2 Update Configuration Files

Update these files with the new project name:

1. **wrangler.jsonc** - Change the `name` field
2. **package.json** - Update `name` and `description` fields

### 3.3 Verify Changes

Run `npm run build` to ensure configuration is valid.

Display success:

```
✅ Project configured as: {project-name}
✅ wrangler.jsonc updated
✅ package.json updated
```

---

## Phase 4: Cloudflare Account Setup

Display a progress indicator:

```
📋 Phase 4/8: Cloudflare Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The user needs their Cloudflare Account ID and an API Token.

### 4.1 Get Account ID

Display instructions in a clear box:

```
┌─────────────────────────────────────────────────────────────────┐
│  📍 GET YOUR CLOUDFLARE ACCOUNT ID                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Open: https://dash.cloudflare.com                           │
│  2. Click "Workers & Pages" in the left sidebar                 │
│  3. Look at the right sidebar under "Account details"           │
│  4. Copy the Account ID (32-character hex string)               │
│                                                                 │
│  Example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Create API Token

Display instructions:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔑 CREATE A CLOUDFLARE API TOKEN                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Open: https://dash.cloudflare.com/profile/api-tokens        │
│  2. Click "Create Token"                                        │
│  3. Find "Edit Cloudflare Workers" template → Use Template      │
│  4. Under Account Resources → Select your account               │
│  5. Under Zone Resources → Select "All zones"                   │
│  6. Click "Continue to summary" → "Create Token"                │
│  7. ⚠️  Copy the token immediately - shown only once!           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 5: Claude GitHub Actions Decision (Early)

**Only offer this phase if the user chose "GitHub Actions CI/CD" or "Both" in Phase 1.**

Display a progress indicator:

```
📋 Phase 5/8: Claude GitHub Actions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Use AskUserQuestion:

**Question:** "Would you like to enable Claude Code GitHub Actions?"

| Option | Description |
|--------|-------------|
| **Yes, set it up** | Allow `@claude` mentions in PRs/issues for AI-powered code review, questions, and changes |
| **No, skip for now** | You can set this up later via `docs/GITHUB_ACTIONS_CLAUDE.md` |

Store their choice - this determines whether we need the ANTHROPIC_API_KEY secret.

### If Yes: Get Anthropic API Key

Display instructions:

```
┌─────────────────────────────────────────────────────────────────┐
│  🤖 GET YOUR ANTHROPIC API KEY                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Open: https://console.anthropic.com/settings/keys           │
│  2. Click "Create Key"                                          │
│  3. Copy the key (starts with sk-ant-)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 6: Environment Configuration

Display a progress indicator:

```
📋 Phase 6/8: Environment Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

This phase configures all secrets in one go, based on earlier choices.

### If "Local deployment" or "Both":

#### 6.1 Create Local Environment File

```bash
cp .env.example .env
```

Edit `.env` and add the credentials:

```
CLOUDFLARE_API_TOKEN=<token from step 4.2>
CLOUDFLARE_ACCOUNT_ID=<account ID from step 4.1>
```

Tell the user: "This file enables wrangler CLI commands without browser login. It's gitignored and safe to store locally."

### If "GitHub Actions CI/CD" or "Both":

#### 6.2 Add GitHub Repository Secrets (All at Once)

**CRITICAL: Use direct links with the detected GITHUB_USERNAME and GITHUB_REPO from Phase 1.**

Display the secrets to add with direct links:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔐 ADD GITHUB SECRETS                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Add the following secrets to your repository:                  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ CLOUDFLARE_ACCOUNT_ID                                     │  │
│  │ 👉 https://github.com/{GITHUB_USERNAME}/{GITHUB_REPO}/settings/secrets/actions/new │
│  │ Value: Your Cloudflare Account ID from step 4.1           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ CLOUDFLARE_API_TOKEN                                      │  │
│  │ 👉 https://github.com/{GITHUB_USERNAME}/{GITHUB_REPO}/settings/secrets/actions/new │
│  │ Value: Your Cloudflare API Token from step 4.2            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**If user chose Claude GitHub Actions in Phase 5:**

Also add:

```
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ANTHROPIC_API_KEY                                         │  │
│  │ 👉 https://github.com/{GITHUB_USERNAME}/{GITHUB_REPO}/settings/secrets/actions/new │
│  │ Value: Your Anthropic API key from step 5                 │  │
│  └───────────────────────────────────────────────────────────┘  │
```

**IMPORTANT:** Replace `{GITHUB_USERNAME}` and `{GITHUB_REPO}` with actual values detected in Phase 1!

Example output should look like:
```
👉 https://github.com/henkisdabro/my-project/settings/secrets/actions/new
```

After the user confirms they've added the secrets, display:

```
✅ CLOUDFLARE_ACCOUNT_ID secret added
✅ CLOUDFLARE_API_TOKEN secret added
✅ ANTHROPIC_API_KEY secret added (if applicable)
```

### 6.3 Application Secrets (Optional)

Use AskUserQuestion:

**Question:** "Will your app need API keys or secrets for local development? (e.g., Claude API, database passwords)"

| Option | Description |
|--------|-------------|
| **Yes, set up now** | Create `.dev.vars` for local development secrets |
| **No, skip for now** | You can add secrets later with `/add-ai-feature` or `/setup-database` |

**If yes:**

```bash
cp .dev.vars.example .dev.vars
```

Tell the user: "Add secrets to `.dev.vars` for local development. For production, use `npx wrangler secret put SECRET_NAME`."

---

## Phase 7: Claude GitHub Actions Setup (If Selected)

**Only execute if user chose "Yes" in Phase 5.**

Display a progress indicator:

```
📋 Phase 7/8: Claude GitHub Actions Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 7.1 Install Claude GitHub App

Display instructions:

```
┌─────────────────────────────────────────────────────────────────┐
│  📱 INSTALL CLAUDE GITHUB APP                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Open: https://github.com/apps/claude                        │
│  2. Click "Install"                                             │
│  3. Select your repository: {GITHUB_USERNAME}/{GITHUB_REPO}     │
│  4. Grant the required permissions:                             │
│     • Contents: Read & Write (to modify files)                  │
│     • Issues: Read & Write (to respond to issues)               │
│     • Pull Requests: Read & Write (to create PRs)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Create the Workflow File

```bash
cp .claude/templates/claude-code-action.yml .github/workflows/claude.yml
```

Tell the user:

```
✅ Claude workflow created: .github/workflows/claude.yml

This enables Claude to respond when you mention @claude in any PR
comment or issue. Claude can:
  • Answer questions about your code
  • Review PRs for issues and improvements
  • Implement code changes and commit them

📖 See docs/GITHUB_ACTIONS_CLAUDE.md for advanced configuration.
```

---

## Phase 8: Domain Configuration (Optional)

Display a progress indicator:

```
📋 Phase 8/8: Domain & Deployment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Use AskUserQuestion:

**Question:** "Do you have a custom domain for this project?"

| Option | Description |
|--------|-------------|
| **No, use workers.dev** | Use the free `*.workers.dev` subdomain for now |
| **Yes, Cloudflare DNS** | Domain's DNS is managed by Cloudflare |
| **Yes, external DNS** | Domain's DNS is with another provider (GoDaddy, etc.) |

### If Cloudflare DNS:

```bash
npx wrangler domains add yourdomain.com
```

This automatically creates DNS records and enables HTTPS.

### If External DNS:

Provide CNAME setup instructions:

```
┌─────────────────────────────────────────────────────────────────┐
│  🌐 EXTERNAL DNS CONFIGURATION                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Add a CNAME record at your DNS provider:                       │
│                                                                 │
│  Type:   CNAME                                                  │
│  Name:   www (or @ for root, if supported)                      │
│  Target: {project-name}.{subdomain}.workers.dev                 │
│  TTL:    300-600 seconds                                        │
│                                                                 │
│  Note: DNS propagation takes 5-60 minutes.                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### If No Domain:

Tell the user: "Your app will be available at `https://{project-name}.{subdomain}.workers.dev`. You can add a custom domain anytime."

---

## Phase 9: Local Verification & First Deployment

### 9.1 Verify Local Development

```bash
npm run dev
```

Guide the user to:
- Open http://localhost:5173 in their browser
- Check the app renders correctly
- Test the API health endpoint: http://localhost:5173/api/health

Display success:

```
✅ Local development server running
✅ React app rendering correctly
✅ API health endpoint responding
```

### 9.2 First Deployment

**Now commit everything at once (including claude.yml if configured):**

Display what will be committed:

```
📦 Ready to commit and deploy:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • wrangler.jsonc (updated project name)
  • package.json (updated project name)
  • .github/workflows/claude.yml (if Claude Actions enabled)
```

#### If "Local deployment":

```bash
npm run deploy
```

The command outputs the deployment URL.

#### If "GitHub Actions CI/CD" or "Both":

```bash
git add .
git commit -m "feat: initial project setup"
git push origin main
```

Guide the user to:
1. Go to their GitHub repository: `https://github.com/{GITHUB_USERNAME}/{GITHUB_REPO}/actions`
2. Watch the deployment workflow
3. Wait for the green checkmark

Display the direct link:

```
👉 Watch deployment: https://github.com/{GITHUB_USERNAME}/{GITHUB_REPO}/actions
```

---

## Phase 10: Setup Complete

Display a celebratory completion message:

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🎉 CONGRATULATIONS! YOUR PROJECT IS LIVE! 🎉                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

Display a summary table based on what was configured:

```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ SETUP SUMMARY                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Project Name:     {project-name}                               │
│  Live URL:         https://{project-name}.workers.dev           │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Local Development:                                             │
│    ✅ .env configured with Cloudflare credentials               │
│    ✅ npm run deploy ready to use                               │
│                                                                 │
│  GitHub Actions:                                                │
│    ✅ CLOUDFLARE_ACCOUNT_ID secret                              │
│    ✅ CLOUDFLARE_API_TOKEN secret                               │
│    ✅ Auto-deploy on push to main                               │
│                                                                 │
│  Claude GitHub Actions: (if configured)                         │
│    ✅ Claude GitHub App installed                               │
│    ✅ ANTHROPIC_API_KEY secret                                  │
│    ✅ @claude mentions enabled                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 11: What's Next?

Use AskUserQuestion:

**Question:** "What would you like to do next?"

| Option | Description |
|--------|-------------|
| **Plan a feature** | Use `/generate-prp` to create a detailed implementation plan |
| **Add AI capabilities** | Use `/add-ai-feature` for Claude API or Workers AI |
| **Add database storage** | Use `/setup-database` for D1 (SQL) or KV storage |
| **Explore on my own** | End the wizard and explore the codebase |

Based on their choice, either:
- Prompt them to describe their feature for `/generate-prp`
- Run the appropriate setup command
- Display available commands and end

---

## Available Commands Reference

Display this table before ending:

```
┌─────────────────────────────────────────────────────────────────┐
│  📚 AVAILABLE COMMANDS                                          │
├─────────────────┬───────────────────────────────────────────────┤
│ Command         │ Purpose                                       │
├─────────────────┼───────────────────────────────────────────────┤
│ /generate-prp   │ Create a Product Requirement Plan for a      │
│                 │ feature                                       │
├─────────────────┼───────────────────────────────────────────────┤
│ /execute-prp    │ Implement a feature from its PRP              │
├─────────────────┼───────────────────────────────────────────────┤
│ /add-ai-feature │ Add Claude API, Workers AI, or AI Gateway     │
├─────────────────┼───────────────────────────────────────────────┤
│ /setup-database │ Configure D1 or KV storage                    │
├─────────────────┼───────────────────────────────────────────────┤
│ /setup-sandbox  │ Set up Sandbox SDK for code execution         │
├─────────────────┼───────────────────────────────────────────────┤
│ /add-binding    │ Add other Cloudflare bindings (R2, Queues)    │
└─────────────────┴───────────────────────────────────────────────┘
```

---

## Troubleshooting Reference

### Authentication Errors

**"Authentication error" in GitHub Actions:**
- Verify `CLOUDFLARE_API_TOKEN` is correct and hasn't expired
- Ensure token has "Edit Cloudflare Workers" permissions

**"Account not found" error:**
- Verify `CLOUDFLARE_ACCOUNT_ID` matches your account
- Ensure your token has access to that account

**Local wrangler commands fail:**
- Check `.env` has correct credentials, OR
- Run `npx wrangler login` to re-authenticate

### Build Errors

**TypeScript errors:**
- Run `npm run lint` to see detailed errors
- Check `tsconfig.json` references are correct

**Missing dependencies:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` fresh

### Deployment Errors

**Worker size too large:**
- Check for accidentally bundled large dependencies
- Use dynamic imports for large modules

**Binding errors:**
- Run `npm run cf-typegen` after adding bindings
- Verify binding IDs in `wrangler.jsonc` match created resources

---

## Quick Reference

| Item | Location / Command |
|------|-------------------|
| Account ID | Dashboard → Workers & Pages → Right sidebar |
| API Tokens | Dashboard → Profile → API Tokens |
| Local credentials | `.env` file |
| Local secrets | `.dev.vars` file |
| GitHub Secrets | `https://github.com/{USER}/{REPO}/settings/secrets/actions` |
| Local deploy | `npm run deploy` |
| Dev server | `npm run dev` |
| Generate types | `npm run cf-typegen` |
