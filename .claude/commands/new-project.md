# New Project Setup Assistant

Welcome! You've just forked this Cloudflare Workers + React boilerplate template. I'll guide you through the complete setup process and help you start building your new project.

## Setup Process

### Step 1: Project Configuration

1. **Update Project Name**
   - First, let me check the current project name in `wrangler.jsonc`
   - I'll help you rename it to match your new repository name
   - The project name should be in kebab-case (e.g., "my-awesome-app")

2. **Update package.json**
   - Update the `name` field to match your project name
   - Update the `description` field to describe your project
   - Optionally update `author` and other metadata fields

3. **Verify Installation**
   - Ensure all dependencies are installed: `npm install`
   - Verify the project builds: `npm run build`

### Step 2: Cloudflare Deployment Configuration

I'll guide you through setting up Cloudflare deployment:

1. **Cloudflare Account ID**
   - You need to get your Account ID from: https://dash.cloudflare.com
   - It's in the right sidebar under "Account details"
   - We'll add it to GitHub Secrets as `CLOUDFLARE_ACCOUNT_ID`

2. **Cloudflare API Token**
   - Create a token at: https://dash.cloudflare.com/profile/api-tokens
   - Use the "Edit Cloudflare Workers" template
   - Select your account and "All zones" for simplicity
   - Copy the generated token immediately
   - We'll add it to GitHub Secrets as `CLOUDFLARE_API_TOKEN`

3. **GitHub Secrets Setup**
   - Go to your repo: Settings > Secrets and variables > Actions
   - Add both secrets (I'll remind you of the exact names)

### Step 3: Local Development Verification

1. **Test Local Development**
   - Run `npm run dev` to start the local server
   - Verify the app loads at http://localhost:5173
   - Check that the API endpoint works (if applicable)

2. **Initial Customization**
   - Update the app title and meta tags in `index.html`
   - Customize the React app in `src/`
   - Update or remove the default content

### Step 4: First Deployment

Once secrets are configured:
- Make your first commit
- Push to `main` branch
- GitHub Actions will automatically deploy to Cloudflare
- I'll help verify the deployment succeeded

### Step 5: Create Your First PRP

After setup is complete, I'll automatically help you create a Product Requirement Plan (PRP) for your first feature:

- I'll invoke the `/generate-prp` command
- You can describe what feature you want to build
- I'll research the codebase and create a comprehensive implementation plan
- Then you can use `/execute-prp` to implement it

## Interactive Setup

I'll now walk you through each step interactively. Let's start:

### Current Project Status

Let me first check:
1. What's the current project name in `wrangler.jsonc`?
2. What's in `package.json`?
3. Are dependencies installed?
4. Does the project build?

Once I assess the current state, I'll ask you for:
- Your desired project name
- Brief project description
- Whether you have Cloudflare credentials ready
- What feature you want to build first

Then I'll help you:
1. Update all configuration files
2. Guide you through adding GitHub secrets (with exact steps)
3. Test the local development environment
4. Make your first commit
5. Create a PRP for your first feature

## Ready to Begin?

I'll start by examining the current project configuration and then guide you through the personalization process. After we complete the setup, I'll automatically help you create your first PRP.

Let's get started!
