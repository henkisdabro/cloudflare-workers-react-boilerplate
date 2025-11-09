# Domain Setup Reminder

## Your Domain Information

- **Domain**: `{DOMAIN_NAME}`
- **DNS Provider**: `{DNS_PROVIDER}`
- **Worker Name**: `{WORKER_NAME}`
- **Worker URL**: `https://{WORKER_NAME}.{ACCOUNT_SUBDOMAIN}.workers.dev`

---

## Setup Instructions

### Option 1: Use Cloudflare DNS (Recommended)

If you're willing to transfer your DNS to Cloudflare (free and provides additional benefits):

1. **Add Domain to Cloudflare**:
   - Go to https://dash.cloudflare.com
   - Click "Add a Site"
   - Enter your domain: `{DOMAIN_NAME}`
   - Select the Free plan
   - Cloudflare will scan your existing DNS records

2. **Update Nameservers**:
   - Cloudflare will provide you with nameservers (e.g., `dana.ns.cloudflare.com`)
   - Log in to `{DNS_PROVIDER}` where you registered the domain
   - Update your domain's nameservers to the ones provided by Cloudflare
   - Wait for nameserver propagation (can take 24-48 hours)

3. **Connect Domain to Worker**:
   Once DNS is active on Cloudflare, run this command in your project:
   ```bash
   npx wrangler domains add {DOMAIN_NAME}
   ```
   Or for a subdomain (e.g., www):
   ```bash
   npx wrangler domains add www.{DOMAIN_NAME}
   ```

4. **Verification**:
   - Wait a few minutes for DNS propagation
   - Visit your domain in a browser
   - Verify HTTPS is working (Cloudflare provides free SSL)

**Benefits of Cloudflare DNS**:
- Automatic HTTPS/SSL certificates
- Faster DNS propagation
- Better DDoS protection
- Free CDN benefits
- Easier domain management

---

### Option 2: Keep Current DNS Provider

If you prefer to keep DNS with `{DNS_PROVIDER}`:

{DNS_PROVIDER_INSTRUCTIONS}

---

## Verification Steps

After updating DNS records:

1. **Check DNS Propagation** (wait 5-60 minutes):
   ```bash
   dig {DOMAIN_NAME}
   nslookup {DOMAIN_NAME}
   ```

   Or use online tools:
   - https://dnschecker.org
   - https://www.whatsmydns.net

2. **Test Your Domain**:
   - Open `https://{DOMAIN_NAME}` in a browser
   - Verify your React app loads
   - Check that API routes work (if applicable)

3. **Verify HTTPS**:
   - Ensure the padlock icon appears in the browser
   - Check certificate validity

---

## Troubleshooting

### Common Issues

**DNS Not Propagating**:
- Wait longer - DNS can take up to 48 hours
- Clear your browser cache
- Try accessing from a different device/network
- Use `dig` or online tools to check propagation status

**SSL/HTTPS Errors**:
- If using external DNS, you may need to configure SSL
- Consider using Cloudflare DNS for automatic SSL
- Check that you're using HTTPS, not HTTP

**404 Errors**:
- Verify the Worker is deployed: `npx wrangler deploy`
- Check `wrangler.jsonc` configuration
- Ensure routes are configured correctly

**Worker Not Responding**:
- Check Worker logs: `npx wrangler tail`
- Verify deployment was successful
- Test the `.workers.dev` URL first

---

## Need Help?

If you encounter issues:

1. **Check Cloudflare Dashboard**: https://dash.cloudflare.com
   - View DNS records
   - Check Worker deployments
   - Review analytics and logs

2. **Test Worker Deployment**:
   ```bash
   # Deploy your worker
   npm run deploy

   # View live logs
   npx wrangler tail
   ```

3. **Verify DNS Configuration**:
   ```bash
   # Check current DNS records
   dig {DOMAIN_NAME}
   dig www.{DOMAIN_NAME}

   # Check CNAME specifically
   dig CNAME www.{DOMAIN_NAME}
   ```

4. **Contact Support**:
   - Cloudflare Community: https://community.cloudflare.com
   - Cloudflare Docs: https://developers.cloudflare.com/workers/
   - Your DNS provider's support

---

## Quick Reference

**Your Worker URL** (always works):
```
https://{WORKER_NAME}.{ACCOUNT_SUBDOMAIN}.workers.dev
```

**Target Domain** (after DNS setup):
```
https://{DOMAIN_NAME}
```

**Wrangler Commands**:
```bash
# Add domain (Cloudflare DNS only)
npx wrangler domains add {DOMAIN_NAME}

# List configured domains
npx wrangler domains list

# Deploy Worker
npm run deploy

# View logs
npx wrangler tail
```

---

**Delete this file once you've successfully connected your domain!**
