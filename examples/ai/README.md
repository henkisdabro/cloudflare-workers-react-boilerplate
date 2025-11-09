# AI Integration Examples

This directory contains production-ready examples for integrating AI capabilities into your Cloudflare Workers + React application.

## Available Examples

### 1. Simple Claude Chat
**Location**: [simple-claude-chat/](./simple-claude-chat/)

Basic integration with Anthropic's Claude API using non-streaming responses.

- Simple request/response pattern
- Complete message handling
- Error handling and validation
- TypeScript types included

**Best for**: Chat interfaces where response time is acceptable, simple Q&A systems

### 2. Streaming Chat
**Location**: [streaming-chat/](./streaming-chat/)

Advanced Claude API integration with real-time streaming using Server-Sent Events.

- Character-by-character streaming
- SSE (Server-Sent Events) implementation
- Better UX for long responses
- Proper cleanup and error handling

**Best for**: Conversational interfaces, long-form content generation, improved user experience

### 3. Workers AI Chat
**Location**: [workers-ai-chat/](./workers-ai-chat/)

Native Cloudflare Workers AI integration using built-in models.

- No external API needed
- Uses Cloudflare's AI binding
- Multiple model options (Llama, etc.)
- Cost-effective for high volume

**Best for**: Cost-sensitive applications, edge-native AI, privacy-focused deployments

### 4. Using Cloudflare AI Gateway
**Location**: [with-ai-gateway/](./with-ai-gateway/)

Integration with Cloudflare's AI Gateway product for enhanced AI operations.

- Multi-provider routing (OpenAI, Anthropic, etc.)
- Built-in caching
- Analytics and monitoring
- Cost optimization

**Best for**: Production applications, multi-model strategies, cost tracking

## Comparison Matrix

| Feature | Simple Claude | Streaming Chat | Workers AI | AI Gateway |
|---------|--------------|----------------|------------|------------|
| **Streaming** | No | Yes | Partial | Yes |
| **Setup Complexity** | Low | Medium | Low | Medium |
| **API Key Required** | Yes | Yes | No | Yes |
| **Response Speed** | Medium | Fast (perceived) | Very Fast | Medium |
| **Cost** | Pay per token | Pay per token | Included | Pay per token + caching |
| **Model Quality** | Best (Claude) | Best (Claude) | Good (Llama) | Varies by provider |
| **Privacy** | External API | External API | Edge-native | External API |
| **Caching** | Manual | Manual | No | Built-in |
| **Analytics** | Manual | Manual | No | Built-in |

## When to Use Each Approach

### Use Simple Claude Chat when:
- Building your first AI integration
- Response streaming is not required
- You want the simplest implementation
- Learning the basics

### Use Streaming Chat when:
- Building production chat interfaces
- Long responses need better UX
- Users expect real-time feedback
- Response times matter

### Use Workers AI when:
- Minimizing external dependencies
- Cost is a major concern
- You need edge-native processing
- Privacy/data locality is important
- High request volume expected

### Use AI Gateway when:
- Building production applications
- Using multiple AI providers
- Need analytics and monitoring
- Want automatic caching
- Cost optimization is important

## Cost Comparison

### Anthropic Claude API (Simple & Streaming)
- **Claude 3.5 Sonnet**: ~$3/million input tokens, ~$15/million output tokens
- **Claude 3 Haiku**: ~$0.25/million input tokens, ~$1.25/million output tokens
- Direct billing from Anthropic
- Pay only for what you use

### Cloudflare Workers AI
- **Included in Workers Paid Plan**: $5/month for 10M neurons
- **Additional usage**: $0.011 per 1,000 neurons
- No per-request API costs
- Predictable billing

### AI Gateway
- **Free to use** (no additional cost beyond underlying API)
- Reduces costs through caching
- Analytics included
- Supports multiple providers

**Example Cost Scenarios** (1M requests, 1000 tokens avg per request):

| Scenario | Simple Claude (Sonnet) | Workers AI | With AI Gateway (50% cache) |
|----------|------------------------|------------|------------------------------|
| Input tokens | $3,000 | ~$11 | $1,500 |
| Output tokens | $15,000 | included | $7,500 |
| **Total** | **$18,000** | **~$11** | **~$9,000** |

*Note: Actual costs vary based on usage patterns, model choice, and caching effectiveness*

## Setup Requirements

### All Examples
- Node.js 18+
- Cloudflare account (free tier available)
- This boilerplate project setup

### Example-Specific Requirements

#### Simple Claude & Streaming Chat
- Anthropic API key
- Set as `ANTHROPIC_API_KEY` in Cloudflare Workers secrets

```bash
# Add API key as secret
npx wrangler secret put ANTHROPIC_API_KEY
```

#### Workers AI
- Cloudflare Workers Paid plan ($5/month)
- AI binding in `wrangler.jsonc`

```jsonc
{
  "ai": {
    "binding": "AI"
  }
}
```

#### AI Gateway
- AI Gateway setup in Cloudflare dashboard
- Gateway endpoint URL
- Provider API keys (for providers you want to use)

## Quick Start

### 1. Choose Your Example

Based on your requirements, navigate to the appropriate example directory.

### 2. Review the README

Each example has a detailed README with:
- Setup instructions
- Configuration steps
- Integration guide
- Testing instructions

### 3. Follow the PRP

Each example includes a `PRP.md` (Product Requirement Plan) with:
- Complete implementation steps
- Code examples
- Validation steps
- Best practices

### 4. Integrate into Your App

Follow the example's integration guide to add the code to your project.

## Common Integration Pattern

All examples follow a similar pattern:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │─────▶│   Worker     │─────▶│  AI API/    │
│  Component  │◀─────│  /api/chat   │◀─────│  Service    │
└─────────────┘      └──────────────┘      └─────────────┘
     (UI)              (Middleware)          (AI Provider)
```

1. **React Component**: Handles UI and user interaction
2. **Worker Endpoint**: Processes requests, calls AI API, handles errors
3. **AI Service**: External API or Workers AI binding

## Security Best Practices

### Never Commit API Keys
```bash
# Use Cloudflare secrets for production
npx wrangler secret put ANTHROPIC_API_KEY

# Use .env.local for local development (gitignored)
echo "ANTHROPIC_API_KEY=sk-ant-..." > .dev.vars
```

### Rate Limiting
```typescript
// Implement rate limiting in your worker
if (requestCount > RATE_LIMIT) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

### Input Validation
```typescript
// Always validate user input
if (!message || message.length > MAX_LENGTH) {
  return Response.json({ error: 'Invalid input' }, { status: 400 });
}
```

### Error Handling
```typescript
// Never expose internal errors to users
try {
  const result = await ai.generate(prompt);
  return Response.json(result);
} catch (error) {
  console.error('AI error:', error);
  return Response.json(
    { error: 'An error occurred processing your request' },
    { status: 500 }
  );
}
```

## Performance Optimization

### Caching Strategies
- Use AI Gateway for automatic caching
- Implement custom caching for repeated queries
- Cache static prompts and templates

### Edge Computing
- Workers AI runs at the edge (lowest latency)
- Cache frequently requested responses in KV
- Use Durable Objects for stateful conversations

### Request Optimization
- Batch requests when possible
- Use appropriate model sizes (Haiku vs Sonnet)
- Implement request deduplication

## Development Workflow

1. **Local Development**
   ```bash
   npm run dev
   ```

2. **Test with Local Wrangler**
   ```bash
   npx wrangler dev
   ```

3. **Deploy to Production**
   ```bash
   npm run deploy
   ```

## Troubleshooting

### Common Issues

#### API Key Not Found
```bash
# Check if secret is set
npx wrangler secret list

# Add if missing
npx wrangler secret put ANTHROPIC_API_KEY
```

#### CORS Errors
```typescript
// Add CORS headers in worker
return Response.json(data, {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
});
```

#### Type Errors with Bindings
```bash
# Regenerate types after adding bindings
npm run cf-typegen
```

#### Streaming Not Working
- Check that your fetch call supports streaming
- Verify content-type is `text/event-stream`
- Ensure proper EventSource setup

## Next Steps

1. Choose an example that fits your needs
2. Read the example's README thoroughly
3. Follow the PRP for implementation
4. Test locally before deploying
5. Deploy to production

## Additional Resources

### Cloudflare Documentation
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [AI Gateway](https://developers.cloudflare.com/ai-gateway/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)

### AI Provider Documentation
- [Anthropic Claude API](https://docs.anthropic.com/)
- [OpenAI API](https://platform.openai.com/docs/)

### Related Examples
- Database integration examples (coming soon)
- Authentication examples (coming soon)

## Support

For issues specific to:
- **These examples**: Open an issue in the repository
- **Cloudflare Workers**: Check [Cloudflare Community](https://community.cloudflare.com/)
- **AI APIs**: Consult provider documentation

## License

These examples are part of the Cloudflare Workers + React boilerplate and follow the same license.
