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

### Step 4: Domain Configuration (Optional)

I'll ask you about domain setup for your project:

1. **Domain Ownership**
   - Do you own a domain name for this project?
   - If yes, what is it? (e.g., example.com)

2. **DNS Provider**
   - Is your domain's DNS hosted through Cloudflare?
   - If not, which provider hosts your DNS? (e.g., GoDaddy, Namecheap, Google Domains, AWS Route 53)

3. **Domain Connection Timing**
   - Do you want to connect your domain now or later?
   - If now, I'll help you configure it
   - If later, I'll create a reminder file with clear instructions

#### Cloudflare-Hosted DNS

If your DNS is on Cloudflare, I can help you:
- Add a custom domain to your Worker via `wrangler`
- Configure DNS records automatically
- Set up routing rules if needed

#### External DNS Providers

If your DNS is hosted elsewhere, I'll provide specific instructions for:
- **GoDaddy**: DNS management portal access and A/CNAME record setup
- **Namecheap**: Advanced DNS configuration steps
- **Google Domains**: Resource records configuration
- **AWS Route 53**: Hosted zone record creation
- **Other providers**: General DNS record setup guidance

For external providers, you'll need to:
1. Point your domain to Cloudflare Workers (I'll provide the specific DNS records)
2. Wait for DNS propagation (typically 5-60 minutes)
3. Verify the connection

#### Deferred Setup

If you choose to set up your domain later, I'll create a reminder file at:
- `.domain-setup-reminder.md` - Contains step-by-step instructions for connecting your domain

**Instructions for creating the reminder file**:
1. Read the template: `.claude/templates/domain-setup-reminder.md`
2. Replace these placeholders with actual values:
   - `{DOMAIN_NAME}` - The user's domain (e.g., example.com)
   - `{DNS_PROVIDER}` - The DNS provider name (e.g., GoDaddy, Namecheap)
   - `{WORKER_NAME}` - The Worker name from `wrangler.jsonc`
   - `{ACCOUNT_SUBDOMAIN}` - Usually "workers" (or get from user's Cloudflare account)
   - `{DNS_PROVIDER_INSTRUCTIONS}` - Insert the relevant provider-specific instructions from the "For External DNS Providers" section above
3. Save the file to the project root as `.domain-setup-reminder.md`
4. Inform the user that the file has been created and they can reference it when ready to connect their domain

### Step 5: First Deployment

Once secrets are configured:
- Make your first commit
- Push to `main` branch
- GitHub Actions will automatically deploy to Cloudflare
- I'll help verify the deployment succeeded

### Step 6: Create Your First PRP

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
- Domain configuration preferences:
  - Do you own a domain for this project?
  - If yes, which DNS provider hosts it?
  - Do you want to connect it now or later?
- What feature you want to build first

Then I'll help you:
1. Update all configuration files
2. Guide you through adding GitHub secrets (with exact steps)
3. Test the local development environment
4. Configure domain setup (if requested now) or create reminder file (if deferred)
5. Make your first commit
6. Create a PRP for your first feature

## Domain Setup Workflows

### For Cloudflare-Hosted DNS

When the user confirms their DNS is hosted on Cloudflare, I'll execute:

```bash
# Add custom domain to Worker
npx wrangler domains add <domain-or-subdomain>
```

This command will:
- Automatically create DNS records in Cloudflare
- Configure routing to the Worker
- Enable HTTPS automatically

**Verification**: I'll provide the user with the Worker URL and ask them to test it.

### For External DNS Providers

When DNS is hosted externally, I'll provide provider-specific instructions:

#### GoDaddy

1. Log in to GoDaddy Domain Manager: https://dcc.godaddy.com/manage/dns
2. Select your domain
3. Add these DNS records:
   - **Type**: CNAME
   - **Name**: www (or @ for root domain)
   - **Value**: `<worker-name>.<account-subdomain>.workers.dev`
   - **TTL**: 600 seconds (10 minutes)
4. Save changes
5. Note: DNS propagation takes 10-60 minutes

**Alternative for root domain**:
- Consider using Cloudflare's free DNS (transfer nameservers to Cloudflare)
- Benefits: Faster propagation, better control, free SSL

#### Namecheap

1. Log in to Namecheap Dashboard
2. Go to Domain List > Manage > Advanced DNS
3. Add new record:
   - **Type**: CNAME Record
   - **Host**: www (or use URL Redirect for root)
   - **Value**: `<worker-name>.<account-subdomain>.workers.dev`
   - **TTL**: Automatic
4. Save all changes
5. DNS propagation: 30 minutes to 48 hours (typically faster)

**For root domain**: Use Namecheap's URL Redirect or transfer DNS to Cloudflare

#### Google Domains / Google Cloud DNS

1. Open Google Domains: https://domains.google.com
2. Select your domain > DNS
3. Scroll to Custom resource records
4. Add:
   - **Name**: www (or subdomain)
   - **Type**: CNAME
   - **TTL**: 1H
   - **Data**: `<worker-name>.<account-subdomain>.workers.dev`
5. Add record
6. Propagation time: 5-60 minutes

**Note**: Google Domains was sold to Squarespace - if migrated, use Squarespace instructions

#### AWS Route 53

1. Open Route 53 Console: https://console.aws.amazon.com/route53/
2. Navigate to Hosted Zones
3. Select your domain
4. Create record:
   - **Record name**: www (or subdomain)
   - **Record type**: CNAME
   - **Value**: `<worker-name>.<account-subdomain>.workers.dev`
   - **TTL**: 300 seconds
   - **Routing policy**: Simple routing
5. Create records
6. Propagation: Typically 60 seconds to 5 minutes

#### Squarespace Domains

1. Log in to Squarespace
2. Go to Settings > Domains > DNS Settings
3. Add CNAME record:
   - **Host**: www
   - **Data**: `<worker-name>.<account-subdomain>.workers.dev`
4. Save
5. Propagation: 1-24 hours

#### Cloudflare Registrar (Domain registered but using external DNS)

**Recommendation**: Move DNS to Cloudflare for easier management:
1. In Cloudflare Dashboard, go to DNS
2. Update nameservers at current provider
3. Use `wrangler domains add` once DNS is active on Cloudflare

#### Other Providers (Generic Instructions)

For any other DNS provider:
1. Access your domain's DNS management panel
2. Add a CNAME record:
   - **Name/Host**: www (or your subdomain)
   - **Type**: CNAME
   - **Value/Target**: `<worker-name>.<account-subdomain>.workers.dev`
   - **TTL**: 300-600 seconds (5-10 minutes)
3. Save changes
4. Wait for DNS propagation (5 minutes to 48 hours)

**Testing DNS Changes**:
```bash
# Check if DNS has propagated
dig www.yourdomain.com
nslookup www.yourdomain.com
```

### Custom Domain Setup Verification

After domain setup (immediate or deferred), I'll guide the user to:
1. Wait for DNS propagation
2. Test the domain in a browser
3. Verify HTTPS is working
4. Check that routing to the Worker is correct

## Ready to Begin?

I'll start by examining the current project configuration and then guide you through the personalisation process. After we complete the setup, I'll automatically help you create your first PRP.

Let's get started!
