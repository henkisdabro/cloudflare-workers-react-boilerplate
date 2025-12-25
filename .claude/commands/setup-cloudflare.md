# Cloudflare Account Setup

This command helps you configure your Cloudflare account credentials and GitHub secrets for deployment. Run this before your first deployment.

## Prerequisites Check

Before we begin, let me verify your environment is ready:

1. **Check Node.js version** - Run `node --version` (should be v22+)
2. **Check npm is available** - Run `npm --version`
3. **Verify dependencies** - Run `npm install` if `node_modules` doesn't exist
4. **Test the build** - Run `npm run build` to ensure compilation works

## Step 1: Get Your Cloudflare Account ID

Your Account ID uniquely identifies your Cloudflare account.

**How to find it:**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. In the left sidebar, click **Workers & Pages**
3. Look at the **right sidebar** - you'll see "Account details"
4. Copy the **Account ID** (a 32-character hexadecimal string)

**Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**Store it safely** - you'll need this for GitHub Secrets.

## Step 2: Create a Cloudflare API Token

The API token allows GitHub Actions (or Wrangler) to deploy to your account.

**How to create it:**

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Find **"Edit Cloudflare Workers"** template
4. Click **Use Template**

**Token permissions (pre-filled by template):**

| Permission | Access |
|------------|--------|
| Account - Workers Scripts | Edit |
| Account - Workers KV Storage | Edit |
| Account - Workers R2 Storage | Edit |
| Account - Workers Tail | Read |
| Account - D1 | Edit |
| Zone - Workers Routes | Edit |

5. Under **Account Resources**, select your account (or "All accounts" if you have multiple)
6. Under **Zone Resources**, select "All zones" (or specific zones if preferred)
7. Click **Continue to summary**
8. Click **Create Token**
9. **IMPORTANT:** Copy the token immediately - it's only shown once!

**Example token format:** `abcDEF123ghiJKL456mno...` (long string)

## Step 3: Add Secrets to GitHub

GitHub Secrets store your credentials securely and make them available to GitHub Actions.

**How to add them:**

1. Go to your GitHub repository
2. Click **Settings** (tab at the top)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

**Add these two secrets:**

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_ACCOUNT_ID` | Your 32-character Account ID |
| `CLOUDFLARE_API_TOKEN` | Your API token from Step 2 |

**Verification:**
- After adding, you should see both secrets listed (values are hidden)
- The names must match exactly (case-sensitive)

## Step 4: Local Development Setup (Optional)

For local Wrangler commands (like `wrangler secret put`), authenticate:

```bash
# Interactive browser login
npx wrangler login

# Verify authentication
npx wrangler whoami
```

This creates a local auth token so you can run Wrangler commands directly.

## Step 5: Verify Setup

Let's test everything works:

1. **Local development:**
   ```bash
   npm run dev
   # Should start at http://localhost:5173
   ```

2. **Manual deployment test:**
   ```bash
   npm run deploy
   # Should deploy to *.workers.dev
   ```

3. **GitHub Actions test:**
   - Make a small change (e.g., add a comment to a file)
   - Commit and push to `main` branch
   - Go to your repo → Actions tab
   - Watch the deployment workflow run
   - Check for green checkmark (success)

## Troubleshooting

### "Authentication error" in GitHub Actions

- Verify `CLOUDFLARE_API_TOKEN` is correct (re-create if unsure)
- Ensure the token hasn't expired
- Check token has "Edit Cloudflare Workers" permissions

### "Account not found" error

- Verify `CLOUDFLARE_ACCOUNT_ID` is correct
- Ensure your token has access to that account

### "Worker not found" when using custom domain

- The Worker must be deployed before adding a custom domain
- Ensure the name in `wrangler.jsonc` matches your Worker name

### Local `wrangler` commands fail

- Run `npx wrangler login` to re-authenticate
- Ensure you're in the project directory
- Check `wrangler.jsonc` exists and is valid JSON

## Quick Reference

| Item | Location |
|------|----------|
| Account ID | Dashboard → Workers & Pages → Right sidebar |
| API Tokens | Dashboard → Profile → API Tokens |
| GitHub Secrets | Repo → Settings → Secrets → Actions |
| Wrangler Login | `npx wrangler login` |
| Deploy Command | `npm run deploy` |

## Next Steps

Once setup is complete:

1. Run `/new-project` to configure your project name and metadata
2. Start building your application!
3. Use `/add-ai-feature`, `/setup-database`, or other commands as needed

## Links

- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
