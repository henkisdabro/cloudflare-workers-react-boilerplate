# /start - Project Setup Wizard

You are guiding a user through setting up their new Cloudflare Workers + React project. This is an interactive wizard - use AskUserQuestion at decision points and TodoWrite to track progress.

## Instructions

1. Read through all phases before starting
2. Use TodoWrite to create a task list based on the user's chosen path
3. Execute each phase sequentially, pausing at decision points
4. Mark tasks complete as you finish them
5. If any step fails, stop and help resolve before continuing

---

## Phase 1: Welcome & Development Approach

First, welcome the user and determine their preferred development approach.

Use AskUserQuestion with these options:

**Question:** "How do you want to deploy your project?"

| Option | Description |
|--------|-------------|
| **Local deployment** | Deploy directly from your machine using `npm run deploy`. Best for solo developers and quick prototyping. |
| **GitHub Actions CI/CD** | Automated deployment when you push to main. Best for teams and production projects. |
| **Both (Recommended)** | Full setup with local tooling AND automated CI/CD. Maximum flexibility. |

Store their choice - it determines which setup steps to include.

---

## Phase 2: Prerequisites Check

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

**If any check fails:** Stop and help the user resolve the issue before continuing. Common fixes:
- Node.js version too old → Recommend installing via nvm
- npm install fails → Check for network issues or corrupted cache (`npm cache clean --force`)
- Build fails → Check for TypeScript errors with `npm run lint`

---

## Phase 3: Project Configuration

### 3.1 Get Project Details

Use AskUserQuestion to gather:

**Question:** "What should your project be called?"

- Suggest using kebab-case (e.g., `my-awesome-app`)
- This becomes the Worker name and appears in the deployment URL

### 3.2 Update Configuration Files

Update these files with the new project name:

1. **wrangler.jsonc** - Change the `name` field
2. **package.json** - Update `name` and `description` fields

### 3.3 Verify Changes

Run `npm run build` to ensure configuration is valid.

---

## Phase 4: Cloudflare Account Setup

The user needs their Cloudflare Account ID and an API Token. Guide them through obtaining these.

### 4.1 Get Account ID

Provide these instructions:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Workers & Pages** in the left sidebar
3. Look at the **right sidebar** under "Account details"
4. Copy the **Account ID** (32-character hex string)

Example format: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 4.2 Create API Token

Provide these instructions:

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Find **"Edit Cloudflare Workers"** template → Click **Use Template**
4. Under **Account Resources**, select your account
5. Under **Zone Resources**, select "All zones" (or specific zones)
6. Click **Continue to summary** → **Create Token**
7. **Copy the token immediately** - it's only shown once!

**Token permissions (pre-filled by template):**
- Account - Workers Scripts: Edit
- Account - Workers KV Storage: Edit
- Account - Workers R2 Storage: Edit
- Account - D1: Edit
- Zone - Workers Routes: Edit

---

## Phase 5: Environment Configuration

This phase differs based on the user's chosen development approach from Phase 1.

### If "Local deployment" or "Both":

#### 5.1 Create Local Environment File

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env` and add the credentials:

```
CLOUDFLARE_API_TOKEN=<token from step 4.2>
CLOUDFLARE_ACCOUNT_ID=<account ID from step 4.1>
```

Explain to the user: "This file enables wrangler CLI commands without browser login. It's gitignored and safe to store locally."

#### 5.2 Application Secrets (Optional)

Use AskUserQuestion:

**Question:** "Will your app need API keys or secrets? (e.g., Claude API, database passwords)"

| Option | Description |
|--------|-------------|
| **Yes, set up now** | Create `.dev.vars` for local development secrets |
| **No, skip for now** | You can add secrets later with `/add-ai-feature` or `/setup-database` |

**If yes:**

Copy the example file:

```bash
cp .dev.vars.example .dev.vars
```

Explain: "Add secrets to `.dev.vars` for local development. For production, use `npx wrangler secret put SECRET_NAME`."

Common secrets to mention:
- `ANTHROPIC_API_KEY` - For Claude API integration
- `OPENAI_API_KEY` - For OpenAI integration
- Database passwords, JWT secrets, etc.

#### 5.3 Alternative: Browser-Based Auth

Mention that users can alternatively use browser-based authentication:

```bash
npx wrangler login
npx wrangler whoami
```

This is simpler but requires re-authentication periodically.

### If "GitHub Actions CI/CD" or "Both":

#### 5.4 Add GitHub Repository Secrets

Provide these instructions:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_ACCOUNT_ID` | Account ID from step 4.1 |
| `CLOUDFLARE_API_TOKEN` | API token from step 4.2 |

Verify both secrets appear in the list (values are hidden).

---

## Phase 6: Local Development Verification

### 6.1 Start Development Server

```bash
npm run dev
```

### 6.2 Verify Application

Guide the user to:
- Open http://localhost:5173 in their browser
- Check the app renders correctly
- Test the API health endpoint: http://localhost:5173/api/health

### 6.3 Initial Customisation (Optional)

Use AskUserQuestion:

**Question:** "Would you like to customise the app now or after deployment?"

| Option | Description |
|--------|-------------|
| **Customise now** | Update title, content, and styling before first deploy |
| **Deploy first** | Get it live, then customise |

**If customise now:**
- Update app title in `index.html`
- Update content in `src/App.tsx`
- Update styling in `src/App.css`

---

## Phase 7: Domain Configuration (Optional)

Use AskUserQuestion:

**Question:** "Do you have a custom domain for this project?"

| Option | Description |
|--------|-------------|
| **Yes, Cloudflare DNS** | Domain's DNS is managed by Cloudflare |
| **Yes, external DNS** | Domain's DNS is with another provider (GoDaddy, Namecheap, etc.) |
| **No, use workers.dev** | Use the free `*.workers.dev` subdomain for now |

### If Cloudflare DNS:

```bash
npx wrangler domains add yourdomain.com
```

This automatically creates DNS records and enables HTTPS.

### If External DNS:

Provide CNAME setup instructions:

| Field | Value |
|-------|-------|
| Type | CNAME |
| Name | www (or @ for root, if supported) |
| Target | `<project-name>.<subdomain>.workers.dev` |
| TTL | 300-600 seconds |

**Provider-specific guidance:**
- **GoDaddy:** DNS Management → Add Record
- **Namecheap:** Advanced DNS → Add New Record
- **Google Domains:** DNS → Custom resource records
- **AWS Route 53:** Hosted Zones → Create Record

Note: DNS propagation takes 5-60 minutes.

### If No Domain:

Reassure the user: "Your app will be available at `https://<project-name>.<subdomain>.workers.dev`. You can add a custom domain anytime."

---

## Phase 8: First Deployment

This phase differs based on the user's chosen development approach.

### If "Local deployment":

#### 8.1 Deploy Directly

```bash
npm run deploy
```

#### 8.2 Verify Deployment

The command outputs the deployment URL. Guide the user to:
- Open the URL in their browser
- Verify the app works in production

### If "GitHub Actions CI/CD" or "Both":

#### 8.1 Commit Changes

```bash
git add .
git commit -m "feat: initial project setup"
```

#### 8.2 Push to Main

```bash
git push origin main
```

#### 8.3 Monitor Deployment

Guide the user to:
1. Go to their GitHub repository
2. Click the **Actions** tab
3. Watch the deployment workflow
4. Wait for the green checkmark

#### 8.4 Verify Deployment

The workflow logs show the deployment URL. Guide the user to verify the live app.

---

## Phase 9: Claude GitHub Actions (Optional)

**Only offer this phase if the user chose "GitHub Actions CI/CD" or "Both" in Phase 1.**

Use AskUserQuestion:

**Question:** "Would you like to enable Claude Code GitHub Actions?"

| Option | Description |
|--------|-------------|
| **Yes, set it up** | Allow `@claude` mentions in PRs/issues to trigger Claude for code review, questions, and changes |
| **No, skip for now** | You can set this up later using the documentation in `docs/GITHUB_ACTIONS_CLAUDE.md` |

### If Yes:

#### 9.1 Install Claude GitHub App

Provide these instructions:

1. Visit [github.com/apps/claude](https://github.com/apps/claude)
2. Click **Install**
3. Select your repository
4. Grant the required permissions:
   - **Contents**: Read & Write (to modify files)
   - **Issues**: Read & Write (to respond to issues)
   - **Pull Requests**: Read & Write (to create PRs and push changes)

#### 9.2 Add Anthropic API Key Secret

Provide these instructions:

1. Get your API key from [console.anthropic.com](https://console.anthropic.com)
2. Go to your GitHub repository
3. Navigate to **Settings** > **Secrets and variables** > **Actions**
4. Click **New repository secret**
5. Add:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your Anthropic API key

#### 9.3 Create the Workflow File

Copy the template to the workflows directory:

```bash
cp .claude/templates/claude-code-action.yml .github/workflows/claude.yml
```

Explain to the user:

"This workflow enables Claude to respond when you mention `@claude` in any PR comment or issue. Claude can:
- Answer questions about your code
- Review PRs for issues and improvements
- Implement code changes and commit them to your branch

For more details and advanced configuration, see `docs/GITHUB_ACTIONS_CLAUDE.md`."

#### 9.4 Commit the Workflow

If changes were made:

```bash
git add .github/workflows/claude.yml
git commit -m "feat: add Claude Code GitHub Actions workflow"
git push origin main
```

### If No:

Tell the user: "No problem! You can set this up anytime by following the guide in `docs/GITHUB_ACTIONS_CLAUDE.md` or by running `/install-github-app` in Claude Code."

---

## Phase 10: Setup Complete

Congratulate the user and summarise what was configured:

**Local deployment setup:**
- [ ] `.env` with Cloudflare credentials
- [ ] `.dev.vars` for application secrets (if applicable)
- [ ] `npm run deploy` ready to use

**GitHub Actions setup:**
- [ ] `CLOUDFLARE_ACCOUNT_ID` secret configured
- [ ] `CLOUDFLARE_API_TOKEN` secret configured
- [ ] Automated deployment on push to main

**Claude GitHub Actions (if configured):**
- [ ] Claude GitHub App installed
- [ ] `ANTHROPIC_API_KEY` secret configured
- [ ] `.github/workflows/claude.yml` workflow created
- [ ] `@claude` mentions enabled in PRs and issues

**Optional configurations:**
- [ ] Custom domain (if configured)

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
- Provide a summary of available commands and end

---

## Available Commands Reference

| Command | Purpose |
|---------|---------|
| `/generate-prp` | Create a Product Requirement Plan for a feature |
| `/execute-prp` | Implement a feature from its PRP |
| `/add-ai-feature` | Add Claude API, Workers AI, or AI Gateway |
| `/setup-database` | Configure D1 or KV storage |
| `/setup-sandbox` | Set up Sandbox SDK for code execution |
| `/add-binding` | Add other Cloudflare bindings (R2, Queues, etc.) |

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
| GitHub Secrets | Repo → Settings → Secrets → Actions |
| Local deploy | `npm run deploy` |
| Dev server | `npm run dev` |
| Generate types | `npm run cf-typegen` |
