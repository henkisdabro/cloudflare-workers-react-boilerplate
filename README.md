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

- **`/new-project`** - Interactive setup wizard for new projects
- **`/generate-prp <feature>`** - Create a Product Requirement Plan with comprehensive research
- **`/execute-prp <file>`** - Implement a feature from a PRP

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
