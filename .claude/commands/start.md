# /start - Project Setup Wizard

You are guiding a user through setting up their new Cloudflare Workers + React project. This wizard is designed for **all skill levels**, including users who may be new to web development.

## Key Principles

1. **Every AskUserQuestion must be self-contained** - Users focus on the question modal, not text that scrolled by. Include all necessary context IN the question and option descriptions.
2. **Plain English over jargon** - Replace technical terms with explanations. If you must use a term, define it inline.
3. **Outcome-based choices** - Ask "What are you building?" not "Which products do you need?"
4. **Always offer a beginner path** - Include "Let Claude decide" or "Recommended for beginners" options.
5. **Link to docs, don't print walls of text** - Educational content goes in browser-readable docs.

---

## Phase 1: Welcome & Setup Mode Selection

### 1.1 Display Welcome Banner

```
CLOUDFLARE WORKERS + REACT PROJECT SETUP

Let's get your website live on the internet!

You'll need:
- A Cloudflare account (free) - we'll help you create one if needed
- A GitHub account with this repository
- Node.js installed on your computer
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

### 1.3 Setup Mode Selection

Use AskUserQuestion:

**Question:** "How much do you want to customise your setup?"

| Option | Label | Description |
|--------|-------|-------------|
| 1 | **Quick Setup (Recommended)** | Get your website live in about 5 minutes. I'll use sensible defaults for everything. Perfect for portfolios, blogs, and simple websites. You can always change settings later. |
| 2 | **Guided Setup** | Choose every option yourself and learn what each setting does. Takes longer but gives you full control. Better if you have specific requirements. |

**If user chooses Quick Setup:**
- Auto-select: "Automatic updates" (GitHub Actions)
- Auto-select: "Workers only" (can add storage later)
- Skip: Claude GitHub Actions (can set up later)
- Skip: Custom domain (use workers.dev)
- Skip: Application secrets
- Jump to Phase 2 (Prerequisites), then Phase 4 (Project Name), then Phase 6 (Cloudflare Credentials), then Phase 8 (Environment), then Phase 11 (Deploy)
- Display step numbers as "Step 1 of 5", "Step 2 of 5", etc. (not the phase numbers)

**If user chooses Guided Setup:**
- Proceed through all phases sequentially

---

## Phase 2: Prerequisites Check

Display:

```
STEP 1: Checking your computer is ready
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

Update dependencies to latest safe versions:

```bash
npm update
```

Verify Wrangler is available:

```bash
npx wrangler --version    # Should output version 4.x+
```

Verify the build works:

```bash
npm run build
```

**If any check fails:** Stop and help the user resolve the issue before continuing.

Display success:

```
All checks passed - your computer is ready.
```

---

## Phase 3: Deployment Method (Guided Setup Only)

Display:

```
STEP 2: How should your website update?
```

Use AskUserQuestion:

**Question:** "How should your website update when you make changes?"

| Option | Label | Description |
|--------|-------|-------------|
| 1 | **Automatic updates (Recommended)** | Every time you save your work to GitHub, your website updates automatically. This is how most modern websites work. Once set up, you just push code and it goes live. |
| 2 | **Manual updates** | You run a command (`npm run deploy`) each time you want to publish changes. Good for learning how deployment works, or if you want to test everything locally first. |
| 3 | **Both methods** | Set up automatic updates AND keep the option to deploy manually. Maximum flexibility - automatic for normal work, manual when you need it. |
| 4 | **Explain these options** | I'll explain what each option means in more detail, then ask again. |

**If "Explain these options":**
Display:
```
DEPLOYMENT EXPLAINED

"Deployment" means copying your code to Cloudflare's servers so people
can visit your website.

AUTOMATIC (GitHub Actions):
  You → Save to GitHub → Website updates automatically
  - No extra steps after initial setup
  - Your live website always matches your latest code

MANUAL:
  You → Run a command → Website updates
  - You control exactly when changes go live
  - Good for testing before publishing

BOTH:
  - Automatic updates are enabled (pushing to GitHub deploys)
  - You can also run `npm run deploy` manually when needed

For detailed information, see:
docs/choosing-deployment.md

Most people choose Automatic - it's simpler once set up.
```
Then re-ask the question.

Store their choice for later phases.

---

## Phase 4: Project Configuration

Display:

```
STEP 3: Name your project
```

Use AskUserQuestion:

**Question:** "What should your website be called?"

**Context to include in the question:**
> This name becomes part of your website address. For example, if you choose "my-portfolio", your website will be at: `my-portfolio.workers.dev`
>
> Tips:
> - Use lowercase letters, numbers, and hyphens only
> - Example: `my-awesome-site` or `janes-portfolio`
> - You can add a custom domain (like mysite.com) later

Default suggestion: use the repo name detected in Phase 1.

### 4.2 Update Configuration Files

Update these files with the new project name:

1. **wrangler.jsonc** - Change the `name` field
2. **package.json** - Update `name` and `description` fields

### 4.3 Verify Changes

Run `npm run build` to ensure configuration is valid.

Display:

```
Project configured as: {project-name}
Your website will be at: https://{project-name}.workers.dev
```

---

## Phase 5: Feature Discovery (Guided Setup Only)

Display:

```
STEP 4: What are you building?
```

Use AskUserQuestion:

**Question:** "What kind of website are you building?"

| Option | Label | Description |
|--------|-------|-------------|
| 1 | **Portfolio or marketing site** | A website to showcase your work, a business landing page, or brochure site. Visitors view content only - no forms that save data. If you want a contact form that stores submissions, choose the next option. |
| 2 | **Website with forms that save data** | A site where visitors can submit information (contact forms, enquiries, feedback) and you can view those submissions later. Perfect for portfolios that need a working contact form. |
| 3 | **Web app where users create accounts** | Users can sign up, log in, and have their own profiles or saved data. Think: membership sites, dashboards, social features. |
| 4 | **Web app where users upload files** | Users upload images, documents, or other files. Think: profile pictures, document sharing, e-commerce product images. |
| 5 | **I'm not sure yet - start simple** | Begin with just the basics. You can easily add databases and storage later when you know what you need. This is often the best choice! |
| 6 | **Let me choose specific products** | Show me the technical options (KV, D1, R2) and let me select exactly what I want. |

**Map selections to products:**

| Choice | Products to configure |
|--------|----------------------|
| Portfolio or marketing site | Workers only |
| Website with forms | Workers + D1 |
| Web app with accounts | Workers + D1 + KV |
| Web app with file uploads | Workers + D1 + R2 |
| Not sure yet | Workers only |
| Choose specific products | → Go to Phase 5B |

**If "Choose specific products" (Phase 5B):**

Display:
```
For detailed explanations of each product, see:
docs/cloudflare-products-explained.md
```

Use AskUserQuestion with multiSelect enabled:

**Question:** "Which Cloudflare products do you need? (Select all that apply)"

| Option | Label | Description |
|--------|-------|-------------|
| 1 | **Workers only** | Just the ability to run code. No data storage. Good for simple sites, APIs, and starting simple. |
| 2 | **KV (Key-Value storage)** | Simple storage for things like user sessions (remembering who's logged in) and caching. Fast reads, slower writes. |
| 3 | **D1 (SQL Database)** | Full database for structured data - user accounts, blog posts, orders, anything you need to query and filter. |
| 4 | **R2 (File storage)** | Store files that users upload - profile pictures, documents, images. Not needed for your site's own images. |

### 5.2 Confirm Selection

Display based on their choice:

```
Your setup will include: {list}

You can add more products anytime using `/add-binding`.

Your API token (created in the next step) will have permissions for these products.
```

---

## Phase 6: Cloudflare Account Setup

Display:

```
STEP 5: Connect to Cloudflare
```

The user needs their Cloudflare Account ID and an API Token.

### 6.0 Check for Cloudflare Account

Use AskUserQuestion:

**Question:** "Do you have a Cloudflare account?"

| Option | Label | Description |
|--------|-------|-------------|
| 1 | **Yes, I have an account** | I'll log in and get my credentials. |
| 2 | **No, I need to create one** | Walk me through signing up. It's free and takes about 2 minutes. |

**If "No, I need to create one":**

Display:
```
CREATE A FREE CLOUDFLARE ACCOUNT

1. Open: https://dash.cloudflare.com/sign-up

2. Enter your email address

3. Create a password
   (Or click "Sign up with Google" or "Sign up with GitHub" for faster setup)

4. Check your email for a verification link and click it

5. When you see the Cloudflare dashboard, come back here

Cloudflare is free for developers. The free tier includes:
- 100,000 Worker requests per day
- Free SSL certificates
- Free DNS hosting

Let me know when you've created your account and can see the dashboard.
```

Wait for confirmation, then proceed to 6.1.

### 6.1 Get Account ID

Display:

```
GET YOUR CLOUDFLARE ACCOUNT ID

Now let's get your Account ID - a code that identifies your account.

1. Open: https://dash.cloudflare.com

2. Click "Workers & Pages" in the left menu

3. Look at the RIGHT side of the page, under "Account details"

4. Find "Account ID" - it's a long code like: a1b2c3d4e5f6...

5. Copy that code

Paste the Account ID here when you have it.
```

### 6.2 Create API Token

Display based on Phase 5 selections:

```
CREATE AN API TOKEN

This token gives your project permission to deploy to Cloudflare.

1. Open this link:
   https://dash.cloudflare.com/profile/api-tokens

2. Click "Create Token" (blue button)

3. Scroll down and click "Create Custom Token" (or "Get started" next to it)

4. Fill in:
   - Token name: {project-name}-deploy (or anything you'll remember)

5. Add these permissions (click "Add more" for each one):
```

**Show only the permissions they need based on Phase 5:**

| Permission | What it's for | When needed |
|------------|---------------|-------------|
| Account > Cloudflare Workers Scripts > Edit | Deploy your website code | Always |
| Zone > Zone > Read | Allow custom domains later | Always |
| Account > Workers KV Storage > Edit | Session storage | If KV selected |
| Account > D1 > Edit | Database access | If D1 selected |
| Account > Workers R2 Storage > Edit | File uploads | If R2 selected |

Continue:
```
6. Under "Account Resources":
   - Select: "Include" > "All accounts" (or choose your specific account)

7. Under "Zone Resources":
   - Select: "Include" > "All zones"

8. Click "Continue to summary"

9. Click "Create Token"

10. IMPORTANT: Copy the token NOW - it's only shown once!

The token looks like: Abc123xyz...

When you have it, paste it here or tell me you're ready.
```

**If user selected "Workers only" in Phase 5:**

Add:
```
TIP: Since you only need Workers, you can also use the pre-made
"Edit Cloudflare Workers" template instead of creating a custom token.
Look for it at the top of the token creation page.
```

---

## Phase 7: Claude GitHub Actions (Guided Setup Only)

**Only offer this phase if the user chose "Automatic updates" or "Both" in Phase 3.**

Display:

```
STEP 6: AI Code Review (Optional)
```

Use AskUserQuestion:

**Question:** "Would you like AI-powered code review on GitHub?"

| Option | Label | Description |
|--------|-------|-------------|
| 1 | **Yes, set it up** | When you (or teammates) create pull requests or issues on GitHub, you can type @claude to ask questions, request code review, or get help. Requires an Anthropic API key. |
| 2 | **No, skip this** | You can always set this up later. Instructions are in docs/GITHUB_ACTIONS_CLAUDE.md |
| 3 | **What's a pull request?** | I'll explain, then ask again. |

**If "What's a pull request?":**
Display:
```
PULL REQUESTS EXPLAINED

A "pull request" (or PR) is a way to propose changes to your code.

Instead of changing your live website directly, you:
1. Make changes in a separate "branch" (like a draft)
2. Create a "pull request" to review those changes
3. Once approved, the changes get merged into your live site

This is useful when:
- Working with a team (others can review your code)
- You want to be careful about what goes live
- You want AI (Claude) to review your code before it goes live

If you're working alone on a simple project, you might not
use pull requests - and that's fine! You can skip this feature.
```
Then re-ask the question.

**If Yes:**

Display:
```
GET YOUR ANTHROPIC API KEY

This key lets Claude respond to @claude mentions on GitHub.

1. Open: https://console.anthropic.com/settings/keys

2. Log in or create an account if needed

3. Click "Create Key"

4. Copy the key (it starts with sk-ant-)

Paste it here when ready.
```

Store their choice - determines whether we need ANTHROPIC_API_KEY secret.

---

## Phase 8: Environment Configuration

Display:

```
STEP 7: Save your credentials
```

This phase configures all secrets based on earlier choices.

### If "Manual deployment" or "Both":

#### 8.1 Create Local Environment File

```bash
cp .env.example .env
```

Tell the user:
```
I've created a .env file for your Cloudflare credentials.

This file stays on your computer (it's not uploaded to GitHub)
and lets you deploy from the command line.
```

Edit `.env` and add the credentials:

```
CLOUDFLARE_API_TOKEN=<their token>
CLOUDFLARE_ACCOUNT_ID=<their account ID>
```

### If "Automatic deployment" or "Both":

#### 8.2 Add GitHub Repository Secrets

Display with direct links (using GITHUB_USERNAME and GITHUB_REPO from Phase 1):

```
ADD SECRETS TO GITHUB

GitHub needs your Cloudflare credentials to deploy automatically.
These are stored securely - only GitHub Actions can read them.

ADD EACH SECRET:

1. CLOUDFLARE_ACCOUNT_ID
   Open: https://github.com/{GITHUB_USERNAME}/{GITHUB_REPO}/settings/secrets/actions/new
   - Name: CLOUDFLARE_ACCOUNT_ID
   - Value: (paste your Account ID)
   - Click "Add secret"

2. CLOUDFLARE_API_TOKEN
   Open: https://github.com/{GITHUB_USERNAME}/{GITHUB_REPO}/settings/secrets/actions/new
   - Name: CLOUDFLARE_API_TOKEN
   - Value: (paste your API Token)
   - Click "Add secret"

Can't access the settings page? If your repository is under a GitHub
organisation, you may need admin permissions. Ask an organisation admin
to add these secrets, or they can grant you the "Admin" role.
```

**If user chose Claude GitHub Actions in Phase 7, add:**

```
3. ANTHROPIC_API_KEY
   Open: https://github.com/{GITHUB_USERNAME}/{GITHUB_REPO}/settings/secrets/actions/new
   - Name: ANTHROPIC_API_KEY
   - Value: (paste your Anthropic API key)
   - Click "Add secret"
```

After the user confirms:

```
Credentials saved successfully.
```

### 8.3 Application Secrets (Guided Setup Only)

Use AskUserQuestion:

**Question:** "Will your website need any other API keys for development?"

| Option | Label | Description |
|--------|-------|-------------|
| 1 | **No, I'm good for now** | Skip this. You can add secrets later when you need them. |
| 2 | **Yes, set up secrets file** | Create a `.dev.vars` file for storing API keys (like Claude API, database passwords) during local development. |

**If yes:**

```bash
cp .dev.vars.example .dev.vars
```

Tell the user:
```
Created .dev.vars for local development secrets.

Add secrets like this:
  CLAUDE_API_KEY=sk-ant-your-key-here

For production secrets, use:
  npx wrangler secret put SECRET_NAME
```

---

## Phase 9: Claude GitHub Actions Setup (If Selected)

**Only execute if user chose "Yes" in Phase 7.**

Display:

```
STEP 8: Setting up AI code review
```

### 9.1 Install Claude GitHub App

Display:

```
INSTALL CLAUDE ON GITHUB

1. Open: https://github.com/apps/claude

2. Click the green "Install" button

3. Choose where to install:
   - Select "Only select repositories"
   - Choose: {GITHUB_USERNAME}/{GITHUB_REPO}

4. Click "Install"

5. Approve the permissions when asked

Done? Let me know and I'll create the workflow file.
```

### 9.2 Create the Workflow File

```bash
cp .claude/templates/claude-code-action.yml .github/workflows/claude.yml
```

Display:

```
AI code review is ready!

You can now:
- Type @claude in any pull request comment to ask questions
- Ask Claude to review code, explain changes, or suggest improvements
- Request code changes and Claude will commit them

See docs/GITHUB_ACTIONS_CLAUDE.md for tips and examples.
```

---

## Phase 10: Domain Configuration (Guided Setup Only)

Display:

```
STEP 9: Your website address (Optional)
```

Use AskUserQuestion:

**Question:** "Do you want a custom domain (like mysite.com)?"

| Option | Label | Description |
|--------|-------|-------------|
| 1 | **No, use the free address** | Your site will be at `{project-name}.workers.dev`. This is free and works great. You can add a custom domain anytime later. |
| 2 | **I want to buy a domain** | Purchase a domain through Cloudflare (no markup - they sell at cost). Then we'll connect it. |
| 3 | **I already have a domain** | Connect an existing domain you own (from Cloudflare, GoDaddy, Namecheap, etc.) |

### If No Domain:

Display:
```
Your website will be at:
https://{project-name}.workers.dev

You can add a custom domain anytime from your Cloudflare dashboard.
```

### If Buy a Domain:

Display with direct link:
```
BUY A DOMAIN

Cloudflare sells domains at cost (no markup or hidden fees).

1. Open: https://dash.cloudflare.com/{ACCOUNT_ID}/registrar/register

2. Search for the domain you want

3. Complete the purchase

4. Come back here once it's registered
```

Then proceed to custom domain setup below.

### If Custom Domain:

Use AskUserQuestion:

**Question:** "What is your domain?"

> Enter your full domain name, like: mysite.com or app.mysite.com

Store as `{CUSTOM_DOMAIN}`.

#### Update wrangler.jsonc

Add the custom domain route:

```jsonc
"routes": [
  {
    "pattern": "{CUSTOM_DOMAIN}",
    "custom_domain": true
  }
]
```

Display with direct link:
```
CONNECT YOUR DOMAIN

1. Open: https://dash.cloudflare.com/{ACCOUNT_ID}/workers/services/view/{PROJECT_NAME}/production/settings

2. Scroll to "Domains & Routes"

3. Click "Add" then "Custom domain"

4. Enter: {CUSTOM_DOMAIN}

5. Cloudflare will set up DNS and SSL automatically

If your domain is registered elsewhere (GoDaddy, Namecheap, etc.):
- You'll see a CNAME record to add at your domain provider
- DNS changes can take 5-60 minutes to work
```

---

## Phase 11: Local Verification & First Deployment

### 11.1 Verify Local Development

```bash
npm run dev
```

Display:
```
TESTING LOCALLY

Your development server is starting...

Open this link in your browser:
http://localhost:5173

You should see your website!

Also test the API:
http://localhost:5173/api/health
(Should show a success message)
```

Wait for confirmation, then:

```
Local development is working.
```

### 11.2 First Deployment

Display what will be committed:

```
READY TO GO LIVE

I'll now:
1. Save your configuration changes
2. Deploy your website to Cloudflare
```

#### If "Manual deployment":

```bash
npm run deploy
```

Display the deployment URL from the output.

#### If "Automatic deployment" or "Both":

```bash
git add .
git commit -m "feat: initial project setup"
git push origin main
```

Display:
```
Your code is uploading to GitHub...

Watch the deployment:
https://github.com/{GITHUB_USERNAME}/{GITHUB_REPO}/actions

When you see a green checkmark, your site is live!
```

---

## Phase 12: Setup Complete

Display:

```
YOUR WEBSITE IS LIVE!
```

Show a summary based on what was configured:

```
WHAT'S SET UP

Website address: https://{project-name}.workers.dev
{If custom domain: Also: https://{CUSTOM_DOMAIN}}

Local development:
  npm run dev      - Start local server
  npm run deploy   - Deploy manually

{If GitHub Actions:}
Automatic deployment:
  - Push to GitHub → Website updates automatically
  - Secrets configured in GitHub

{If Claude Actions:}
AI Code Review:
  - Type @claude in pull requests for help
```

---

## Phase 13: What's Next?

Use AskUserQuestion:

**Question:** "What would you like to do next?"

| Option | Label | Description |
|--------|-------|-------------|
| 1 | **Start building a feature** | Tell me what you want to build and I'll help you plan and implement it step by step. |
| 2 | **Add AI to my website** | Add chatbots, content generation, or other AI features powered by Claude or Workers AI. |
| 3 | **Add a database** | Set up data storage if you decided you need it after all. |
| 4 | **Explore on my own** | I'll show you the available commands and you can take it from here. |

Based on their choice, either:
- If "Start building a feature": Ask "What feature would you like to build?" then run `/generate-prp` with their description
- If "Add AI": Run `/add-ai-feature`
- If "Add a database": Run `/setup-database`
- If "Explore": Display available commands and end

### Available Commands

```
AVAILABLE COMMANDS

Building features:
  Just describe what you want to build - I'll help you plan and implement it.
  Example: "I want to add a contact form" or "Add user authentication"

Quick commands:
  /add-ai-feature   Add AI capabilities (chatbots, content generation)
  /setup-database   Add database storage
  /add-binding      Add Cloudflare services (file storage, queues, etc.)

For help anytime, just ask!
```

---

## Troubleshooting Reference

### "Authentication error" or "Forbidden"

- Check your API token is correct (no extra spaces)
- Verify token has required permissions
- Edit token at: https://dash.cloudflare.com/profile/api-tokens

### "Account not found"

- Verify Account ID is correct (32-character code)
- Make sure you're using the right Cloudflare account

### Build errors

- Run `npm run lint` to see detailed errors
- Try deleting `node_modules` and running `npm install`

### Deployment not updating

- If using GitHub Actions, check the Actions tab for errors
- Verify GitHub secrets are named exactly right (case-sensitive)

### For detailed help

See:
- docs/choosing-deployment.md - Deployment explained
- docs/cloudflare-products-explained.md - Product guide
- docs/glossary.md - Technical terms explained
- docs/GITHUB_ACTIONS_CLAUDE.md - AI code review setup
