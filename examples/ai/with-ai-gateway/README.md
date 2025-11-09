# Using Cloudflare AI Gateway

**🏗️ Architecture:** `Client (React)` → `Worker (middleware)` → `Cloudflare AI Gateway` → `Claude API`

This example demonstrates how to integrate **Cloudflare's AI Gateway product** with your Worker middleware.

**Important:** Your Worker still acts as the secure middleware layer (protecting API keys and handling business logic). AI Gateway is an **optional Cloudflare product** that adds caching, analytics, and cost optimization between your Worker and AI providers.

Production-ready setup showing how to route AI requests through Cloudflare AI Gateway for improved performance, monitoring, and cost management.

## What This Example Demonstrates

- Cloudflare AI Gateway setup and configuration
- Multi-provider routing (OpenAI, Anthropic, etc.)
- Automatic response caching
- Request analytics and monitoring
- Cost tracking and optimization
- Rate limiting and access control
- Fallback strategies

## Features

- **Universal Gateway**: Single endpoint for multiple AI providers
- **Automatic Caching**: Reduce costs with built-in caching
- **Analytics Dashboard**: Track usage, costs, and performance
- **Rate Limiting**: Control API usage and costs
- **Logging**: Request and response logging
- **Fallback Support**: Automatic failover between providers
- **No Code Changes**: Works with existing Anthropic/OpenAI SDKs

## Why AI Gateway?

### Benefits Over Direct API Calls

| Feature | Direct API | With AI Gateway |
|---------|-----------|-----------------|
| **Caching** | Manual | Automatic |
| **Analytics** | Custom logging | Built-in dashboard |
| **Cost Tracking** | Manual | Automatic |
| **Rate Limiting** | Custom implementation | Built-in |
| **Multi-Provider** | Separate integrations | Unified endpoint |
| **Fallback** | Manual | Configurable |

### Use Cases
- **Production Applications**: Enterprise-grade reliability
- **Cost Optimization**: Reduce API costs through caching
- **Multi-Model Strategies**: A/B test different models
- **Usage Monitoring**: Track and analyze AI usage
- **Compliance**: Logging for audit trails

## Prerequisites

1. **Cloudflare Account**
   - Free tier available
   - AI Gateway enabled

2. **AI Provider API Keys**
   - Anthropic API key (for Claude)
   - Or OpenAI API key
   - Or other supported providers

3. **This Boilerplate Project**
   - Existing chat implementation (any example)

## Setup Instructions

### 1. Create AI Gateway in Cloudflare Dashboard

1. **Navigate to AI Gateway**
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to AI → AI Gateway
   - Click "Create Gateway"

2. **Configure Gateway**
   - Name: `my-ai-gateway` (or your choice)
   - Provider: Select provider(s) you want to use
   - Click "Create"

3. **Note Your Gateway URL**
   - Format: `https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_name}/{provider}`
   - Example: `https://gateway.ai.cloudflare.com/v1/abc123/my-ai-gateway/anthropic`

### 2. Update Your Code

**Option A: Using with Anthropic SDK**

```typescript
// In your worker endpoint
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/anthropic`,
});

// Use normally - all requests now go through gateway
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

**Option B: Using with OpenAI SDK**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/openai`,
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

**Option C: Direct HTTP Requests**

```typescript
const response = await fetch(
  `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/anthropic/v1/messages`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello' }],
    }),
  }
);
```

### 3. Configure Environment Variables

Update your `wrangler.jsonc`:

```jsonc
{
  "name": "your-worker",
  // ... existing config ...
  "vars": {
    "CLOUDFLARE_ACCOUNT_ID": "your-account-id",
    "GATEWAY_NAME": "my-ai-gateway"
  }
}
```

Add secrets:

```bash
# Add API keys as secrets
npx wrangler secret put ANTHROPIC_API_KEY
# or
npx wrangler secret put OPENAI_API_KEY
```

For local development (`.dev.vars`):

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
GATEWAY_NAME=my-ai-gateway
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Enable Caching (Optional but Recommended)

In AI Gateway dashboard:
1. Go to your gateway settings
2. Enable "Cache Responses"
3. Configure TTL (Time To Live)
   - Short TTL (5-60 seconds): Real-time data
   - Medium TTL (1-24 hours): General queries
   - Long TTL (24+ hours): Static content

### 5. Set Up Rate Limiting (Optional)

In AI Gateway dashboard:
1. Go to your gateway settings
2. Enable "Rate Limiting"
3. Configure limits:
   - Per user
   - Per endpoint
   - Per time period

## Configuration Examples

See `configuration.md` for detailed configuration options and examples.

## Integration with Existing Examples

### Update Simple Claude Chat

```typescript
// worker-endpoint.ts
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  // Add this line:
  baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/anthropic`,
});

// Everything else stays the same!
```

### Update Streaming Chat

```typescript
// Same change as above
// Streaming works through gateway!
const stream = await anthropic.messages.create({
  stream: true,
  // ... rest of config
});
```

### Update Workers AI Chat

Workers AI doesn't need AI Gateway (already on Cloudflare network), but you can use gateway for external provider fallback:

```typescript
// Try Workers AI first
try {
  const response = await env.AI.run(model, { messages });
  return Response.json({ message: response.response });
} catch (error) {
  // Fallback to Claude via Gateway
  const anthropic = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/anthropic`,
  });
  const message = await anthropic.messages.create({/* ... */});
  return Response.json({ message: message.content[0].text });
}
```

## Cost Savings Through Caching

### Example Scenario

Without Gateway:
- 10,000 identical requests per day
- Average response: 500 tokens ($0.0075 per request with Claude Sonnet)
- Daily cost: $75
- Monthly cost: $2,250

With Gateway (50% cache hit rate):
- 5,000 cache hits (free)
- 5,000 API calls ($37.50)
- Daily cost: $37.50
- Monthly cost: $1,125
- **Savings: 50% ($1,125/month)**

### Caching Strategies

**High Cache Scenarios:**
- FAQ responses
- Documentation queries
- Common troubleshooting
- Static content generation

**Low Cache Scenarios:**
- Real-time data
- Personalized responses
- Time-sensitive queries
- User-specific content

## Analytics Dashboard

Access analytics at: `https://dash.cloudflare.com/ai/ai-gateway`

### Available Metrics
- **Request Volume**: Total requests per day/week/month
- **Cache Hit Rate**: Percentage of cached responses
- **Cost Tracking**: Total API costs
- **Response Times**: Average latency
- **Error Rates**: Failed requests
- **Provider Distribution**: Usage by provider
- **Model Distribution**: Usage by model

### Using Analytics

1. **Identify High-Cost Queries**
   - Sort by cost per request
   - Optimize expensive queries
   - Consider caching

2. **Monitor Cache Performance**
   - Check cache hit rate
   - Adjust TTL based on hit rate
   - Identify cacheable patterns

3. **Track Usage Trends**
   - Spot usage spikes
   - Plan capacity
   - Predict costs

## Advanced Features

### Multi-Provider Fallback

```typescript
async function callAIWithFallback(prompt: string, env: Env) {
  // Try Claude first
  try {
    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/anthropic`,
    });
    const response = await anthropic.messages.create({/* ... */});
    return response.content[0].text;
  } catch (error) {
    console.log('Claude failed, trying OpenAI...');

    // Fallback to OpenAI
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/openai`,
    });
    const response = await openai.chat.completions.create({/* ... */});
    return response.choices[0].message.content;
  }
}
```

### A/B Testing Different Models

```typescript
// Route 50% to Claude, 50% to GPT-4
const useModel = Math.random() < 0.5 ? 'claude' : 'gpt4';

if (useModel === 'claude') {
  // Call through gateway/anthropic
} else {
  // Call through gateway/openai
}

// Track performance in Analytics dashboard
```

### Custom Metadata

```typescript
// Add metadata to track requests
const response = await fetch(gatewayURL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'cf-aig-metadata': JSON.stringify({
      user_id: '12345',
      feature: 'chat',
      version: 'v2',
    }),
  },
  body: JSON.stringify({/* ... */}),
});

// View metadata in Analytics dashboard
```

## Troubleshooting

### Issue: "Gateway not found"
**Solution**:
1. Verify gateway name matches exactly
2. Check account ID is correct
3. Ensure gateway is created in dashboard

### Issue: Requests not appearing in analytics
**Solution**:
- Wait 1-2 minutes for data to appear
- Verify baseURL is set correctly
- Check dashboard filters

### Issue: Cache not working
**Solution**:
1. Enable caching in gateway settings
2. Ensure requests are identical (same prompt, params)
3. Check cache TTL settings
4. Some endpoints may not be cacheable

### Issue: Higher costs than expected
**Solution**:
1. Check cache hit rate (should be >30%)
2. Review request patterns in analytics
3. Enable rate limiting
4. Consider using cheaper models

## Security Considerations

### DO
- Store API keys in Cloudflare secrets
- Use rate limiting
- Monitor usage in analytics
- Set up alerts for unusual activity
- Use different gateways for dev/staging/prod

### DON'T
- Expose gateway URLs to clients
- Commit API keys to git
- Share gateways across teams
- Skip rate limiting
- Ignore analytics warnings

## Monitoring and Alerts

### Set Up Alerts

1. **Cost Alerts**
   - Set threshold (e.g., $100/day)
   - Get notified when exceeded
   - Prevent unexpected bills

2. **Error Rate Alerts**
   - Set threshold (e.g., >5% errors)
   - Get notified of issues
   - Detect API problems early

3. **Usage Spike Alerts**
   - Set threshold (e.g., 2x normal)
   - Detect abuse or bugs
   - Respond quickly

## File Structure

```
with-ai-gateway/
├── README.md              # This file
├── worker-endpoint.ts     # Example implementations
├── configuration.md       # Detailed config guide
└── PRP.md                # Implementation plan
```

## Comparison with Other Examples

| Example | Best For | Use Gateway? |
|---------|----------|--------------|
| Simple Claude Chat | Learning, simple apps | Optional |
| Streaming Chat | Production chat apps | **Recommended** |
| Workers AI Chat | Cost-sensitive, edge | No (already optimized) |
| AI Gateway | **Production deployments** | This is it! |

## Next Steps

1. Create AI Gateway in dashboard
2. Update existing example to use gateway
3. Enable caching
4. Monitor analytics for 1 week
5. Optimize based on metrics
6. Set up alerts

## Support

- [AI Gateway Documentation](https://developers.cloudflare.com/ai-gateway/)
- [Analytics Guide](https://developers.cloudflare.com/ai-gateway/observability/analytics/)
- [Caching Guide](https://developers.cloudflare.com/ai-gateway/configuration/caching/)
- [Cloudflare Community](https://community.cloudflare.com/)

## License

Part of the Cloudflare Workers + React boilerplate.
