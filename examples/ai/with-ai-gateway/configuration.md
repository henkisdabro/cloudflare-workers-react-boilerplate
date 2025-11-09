# AI Gateway Configuration Guide

Complete guide to configuring Cloudflare AI Gateway for optimal performance, cost savings, and monitoring.

## Table of Contents

1. [Dashboard Setup](#dashboard-setup)
2. [Provider Configuration](#provider-configuration)
3. [Caching Configuration](#caching-configuration)
4. [Rate Limiting](#rate-limiting)
5. [Analytics Setup](#analytics-setup)
6. [Advanced Options](#advanced-options)

## Dashboard Setup

### Creating Your First Gateway

1. **Access AI Gateway**
   ```
   https://dash.cloudflare.com/
   → AI → AI Gateway
   → Create Gateway
   ```

2. **Gateway Configuration**
   ```
   Name: production-ai-gateway
   Description: Production AI requests with caching
   ```

3. **Get Your Gateway URL**
   ```
   Base URL format:
   https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_name}/{provider}

   Example:
   https://gateway.ai.cloudflare.com/v1/abc123def456/production-ai-gateway/anthropic
   ```

4. **Find Your Account ID**
   - Dashboard → Account Home
   - Right sidebar → Account ID
   - Or check URL: `dash.cloudflare.com/{account_id}/...`

### Creating Multiple Gateways

Best practice: Create separate gateways for different environments

```bash
# Production
production-ai-gateway

# Staging
staging-ai-gateway

# Development
dev-ai-gateway
```

**Benefits:**
- Separate analytics
- Different caching rules
- Independent rate limits
- Cost tracking per environment

## Provider Configuration

### Supported Providers

Cloudflare AI Gateway supports multiple AI providers:

#### Anthropic (Claude)

```typescript
const baseURL = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/anthropic`;

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  baseURL,
});
```

**Endpoints:**
- Messages: `/v1/messages`
- Streaming: `/v1/messages` (with `stream: true`)

#### OpenAI

```typescript
const baseURL = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/openai`;

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  baseURL,
});
```

**Endpoints:**
- Chat: `/v1/chat/completions`
- Completions: `/v1/completions`
- Embeddings: `/v1/embeddings`

#### Azure OpenAI

```typescript
const baseURL = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/azure-openai`;

// Note: Azure requires additional configuration
const client = new AzureOpenAI({
  apiKey: env.AZURE_OPENAI_KEY,
  baseURL,
  deployment: 'your-deployment-name',
});
```

#### Workers AI

Workers AI doesn't need a gateway (already on Cloudflare), but you can use it as a fallback destination.

#### HuggingFace

```typescript
const baseURL = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/huggingface`;
```

### Provider-Specific Headers

Each provider requires specific headers:

**Anthropic:**
```typescript
headers: {
  'x-api-key': env.ANTHROPIC_API_KEY,
  'anthropic-version': '2023-06-01',
  'Content-Type': 'application/json',
}
```

**OpenAI:**
```typescript
headers: {
  'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
  'Content-Type': 'application/json',
}
```

## Caching Configuration

### Enabling Cache

1. **Dashboard Setup**
   ```
   AI Gateway → Your Gateway → Settings
   → Cache Responses: Enable
   ```

2. **Configure TTL (Time To Live)**
   ```
   Short: 60 seconds - Real-time data
   Medium: 1 hour - General queries
   Long: 24 hours - Static content
   Very Long: 7 days - Documentation
   ```

### Cache Strategies

#### Strategy 1: Aggressive Caching (Max Savings)

```
TTL: 24 hours
Use for:
- FAQ responses
- Documentation
- Static content
- Common questions

Expected Cache Hit Rate: 60-80%
Cost Savings: 60-80%
```

#### Strategy 2: Balanced Caching

```
TTL: 1 hour
Use for:
- General chat
- Product information
- Most applications

Expected Cache Hit Rate: 30-50%
Cost Savings: 30-50%
```

#### Strategy 3: Light Caching

```
TTL: 5 minutes
Use for:
- Real-time data
- Personalized content
- Time-sensitive queries

Expected Cache Hit Rate: 10-20%
Cost Savings: 10-20%
```

### Cache Key Customization

AI Gateway automatically creates cache keys based on:
- Request body (full JSON)
- Model parameters
- Provider

**Example:**
```
Request A: {prompt: "Hello", temp: 0.7}
Request B: {prompt: "Hello", temp: 0.7}
→ Same cache key, cache hit

Request C: {prompt: "Hello", temp: 0.8}
→ Different cache key, cache miss
```

### Cache Bypass

Force bypass cache for specific requests:

```typescript
// Option 1: Add no-cache header
const response = await fetch(gatewayURL, {
  headers: {
    'Cache-Control': 'no-cache',
    // ... other headers
  },
  // ... body
});

// Option 2: Add unique parameter
const requestBody = {
  messages,
  // Add timestamp to prevent caching
  metadata: { timestamp: Date.now() },
};
```

### Monitoring Cache Performance

Track in Analytics:
```
Cache Hit Rate = (Cache Hits / Total Requests) × 100%

Good: >40%
Average: 20-40%
Poor: <20%
```

**Improving Cache Hit Rate:**
1. Increase TTL (if appropriate)
2. Normalize user inputs
3. Identify common patterns
4. Use consistent parameters

## Rate Limiting

### Configuring Rate Limits

1. **Dashboard Setup**
   ```
   AI Gateway → Your Gateway → Settings
   → Rate Limiting: Enable
   ```

2. **Set Limits**
   ```
   Per User: 100 requests/minute
   Per IP: 500 requests/hour
   Global: 10,000 requests/hour
   ```

### Rate Limit Strategies

#### Conservative (High Security)

```
Per User: 10 req/min
Per IP: 100 req/hour
Global: 1,000 req/hour

Use for:
- Free tiers
- Public APIs
- Cost control
```

#### Moderate (Balanced)

```
Per User: 60 req/min
Per IP: 500 req/hour
Global: 10,000 req/hour

Use for:
- Paid tiers
- Most applications
- Reasonable limits
```

#### Generous (High Volume)

```
Per User: 300 req/min
Per IP: 2,000 req/hour
Global: 100,000 req/hour

Use for:
- Enterprise
- High-volume apps
- Trusted users
```

### Rate Limit Response

When rate limited:
```json
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error",
    "retry_after": 60
  }
}
```

Handle in code:
```typescript
try {
  const response = await fetch(gatewayURL, {/* ... */});

  if (response.status === 429) {
    const data = await response.json();
    const retryAfter = data.retry_after || 60;

    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return fetch(gatewayURL, {/* ... */});
  }
} catch (error) {
  // Handle error
}
```

## Analytics Setup

### Available Metrics

#### Request Metrics
- **Total Requests**: Count by time period
- **Request Rate**: Requests per second/minute/hour
- **Request Size**: Average payload size
- **Response Size**: Average response size

#### Performance Metrics
- **Latency**: P50, P95, P99 response times
- **Cache Hit Rate**: Percentage cached
- **Error Rate**: Failed requests percentage
- **Provider Latency**: Time spent in provider API

#### Cost Metrics
- **Total Cost**: Sum of all API costs
- **Cost per Request**: Average cost
- **Cost by Model**: Breakdown by model
- **Cost by Provider**: Breakdown by provider

#### Cache Metrics
- **Cache Hits**: Number of cached responses
- **Cache Misses**: Number of API calls
- **Cache Hit Rate**: Percentage
- **Cache Savings**: Estimated cost saved

### Analytics Dashboard

Access at: `https://dash.cloudflare.com/ai/ai-gateway/{gateway_id}/analytics`

**Key Views:**

1. **Overview**
   - Request volume (24h, 7d, 30d)
   - Cache hit rate
   - Total cost
   - Error rate

2. **Requests**
   - Timeline graph
   - Filter by status code
   - Filter by model
   - Export data

3. **Caching**
   - Hit rate over time
   - Top cached requests
   - Cache efficiency
   - TTL analysis

4. **Costs**
   - Cost breakdown
   - Cost trends
   - Cost by model
   - Budget tracking

5. **Logs**
   - Request logs
   - Error logs
   - Filter and search
   - Export logs

### Custom Metadata

Track custom dimensions:

```typescript
const response = await fetch(gatewayURL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    // Add custom metadata
    'cf-aig-metadata': JSON.stringify({
      user_id: '12345',
      feature: 'chat',
      version: 'v2',
      experiment: 'test-a',
    }),
  },
  body: JSON.stringify({/* ... */}),
});
```

**Filter analytics by metadata:**
- User ID: Track per-user usage
- Feature: Compare feature costs
- Version: A/B test performance
- Experiment: Track experiments

## Advanced Options

### Logging Configuration

#### Enable Request Logging

```
Dashboard → Gateway → Settings
→ Request Logging: Enable
→ Log Level: All / Errors Only / None
```

**Log Retention:**
- Logs kept for 30 days
- Export for longer retention
- Use Cloudflare Logs (paid feature) for permanent storage

#### What's Logged

```json
{
  "timestamp": "2025-11-09T12:00:00Z",
  "gateway": "production-ai-gateway",
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "status": 200,
  "cache_status": "HIT",
  "latency_ms": 245,
  "tokens_input": 150,
  "tokens_output": 300,
  "cost": 0.0045,
  "metadata": {
    "user_id": "12345",
    "feature": "chat"
  }
}
```

### Fallback Configuration

#### Auto-Failover

Configure fallback providers in code:

```typescript
async function callAIWithFallback(prompt: string, env: Env) {
  const providers = [
    { name: 'anthropic', client: anthropicClient },
    { name: 'openai', client: openaiClient },
    { name: 'workers-ai', client: null },
  ];

  for (const provider of providers) {
    try {
      const response = await callProvider(provider, prompt);
      return response;
    } catch (error) {
      console.log(`${provider.name} failed, trying next...`);
      continue;
    }
  }

  throw new Error('All providers failed');
}
```

### Budget Controls

#### Set Cost Alerts

```
Dashboard → Gateway → Settings
→ Cost Alerts: Enable
→ Daily Limit: $100
→ Monthly Limit: $2000
→ Alert Email: your@email.com
```

**Alert Triggers:**
- 50% of budget used
- 80% of budget used
- 100% of budget used

#### Auto-Disable on Budget

```
Dashboard → Gateway → Settings
→ Budget Controls: Enable
→ Action on Limit: Disable Gateway / Reduce Rate / Alert Only
→ Monthly Budget: $2000
```

### CORS Configuration

For browser requests:

```
Dashboard → Gateway → Settings
→ CORS: Enable
→ Allowed Origins: https://yourapp.com
→ Allowed Methods: POST, OPTIONS
→ Allowed Headers: Content-Type, Authorization
```

### Access Control

#### IP Allowlist

```
Dashboard → Gateway → Settings
→ IP Allowlist: Enable
→ Allowed IPs:
  - 1.2.3.4
  - 5.6.7.0/24
```

#### API Key Rotation

Recommended: Rotate API keys quarterly

```bash
# Generate new key in provider dashboard
# Update Cloudflare secret
npx wrangler secret put ANTHROPIC_API_KEY_NEW

# Update code to use new key
# Wait 24 hours
# Revoke old key
```

## Environment-Specific Configurations

### Development

```
Gateway: dev-ai-gateway
Cache TTL: 60 seconds
Rate Limit: 100 req/hour
Logging: All requests
Cost Alert: $10/day
```

### Staging

```
Gateway: staging-ai-gateway
Cache TTL: 5 minutes
Rate Limit: 500 req/hour
Logging: Errors only
Cost Alert: $50/day
```

### Production

```
Gateway: production-ai-gateway
Cache TTL: 1 hour
Rate Limit: 10,000 req/hour
Logging: Errors + sample
Cost Alert: $500/day
Fallback: Enabled
```

## Best Practices

### DO
- Use separate gateways per environment
- Enable caching (start with 1 hour TTL)
- Set cost alerts
- Monitor cache hit rate weekly
- Use custom metadata for tracking
- Export analytics monthly
- Review logs for errors
- Test rate limits before launch

### DON'T
- Share gateways across teams
- Disable logging completely
- Ignore cost alerts
- Set unlimited rate limits
- Cache personalized content
- Commit gateway URLs to git
- Skip fallback configuration
- Forget to rotate keys

## Troubleshooting

### Low Cache Hit Rate

**Problem:** Cache hit rate <20%

**Solutions:**
1. Check if requests are identical
2. Increase TTL
3. Normalize user inputs
4. Review request patterns
5. Consider query rewriting

### High Costs

**Problem:** Costs exceed budget

**Solutions:**
1. Enable caching (if not already)
2. Increase cache TTL
3. Enable rate limiting
4. Review top cost requests
5. Consider cheaper models
6. Implement request deduplication

### Gateway Errors

**Problem:** 502/503 errors from gateway

**Solutions:**
1. Check provider API status
2. Review rate limits
3. Check API key validity
4. Verify gateway configuration
5. Check Cloudflare status page

## Support Resources

- [AI Gateway Docs](https://developers.cloudflare.com/ai-gateway/)
- [Analytics Guide](https://developers.cloudflare.com/ai-gateway/observability/analytics/)
- [Caching Guide](https://developers.cloudflare.com/ai-gateway/configuration/caching/)
- [Community Forum](https://community.cloudflare.com/)
- [Status Page](https://www.cloudflarestatus.com/)
