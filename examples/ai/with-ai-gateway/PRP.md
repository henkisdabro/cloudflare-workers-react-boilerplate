# Product Requirement Plan: AI Gateway Integration

## Metadata

- **Feature**: Cloudflare AI Gateway for Production AI Deployments
- **Target Completion**: 1-2 hours for setup and integration
- **Confidence Score**: 10/10 - Minimal code changes, well-documented
- **Created**: 2025-11-09

## Executive Summary

This feature adds Cloudflare AI Gateway to existing AI integrations for production-grade reliability, cost optimization, and monitoring. Unlike other examples that implement new functionality, this example enhances existing implementations with automatic caching, analytics, and cost tracking by simply changing the API endpoint URL. Zero code refactoring required.

## Research Findings

### Codebase Analysis

#### Similar Patterns Found

- **Pattern**: All AI Chat Examples
  - **Location**: `examples/ai/simple-claude-chat/`, `examples/ai/streaming-chat/`
  - **Description**: Existing Anthropic SDK integrations
  - **Relevance**: Can be enhanced with one-line change (baseURL)

- **Pattern**: Environment Variables
  - **Location**: `wrangler.jsonc`, `.dev.vars`
  - **Description**: API key management
  - **Relevance**: Add gateway URL to environment variables

#### Existing Conventions

- **Convention**: Minimal code changes
  - **Example**: KISS principle throughout project
  - **Application**: Gateway integration requires only baseURL change

- **Convention**: Environment-based configuration
  - **Example**: API keys in secrets
  - **Application**: Gateway URL in vars, account ID in config

### External Research

#### Documentation References

- **Resource**: Cloudflare AI Gateway
  - **URL**: https://developers.cloudflare.com/ai-gateway/
  - **Key Sections**: Getting started, Configuration, Analytics
  - **Version**: Latest
  - **Gotchas**: Free tier available, no additional cost beyond API calls

- **Resource**: AI Gateway Analytics
  - **URL**: https://developers.cloudflare.com/ai-gateway/observability/analytics/
  - **Key Sections**: Metrics, Caching, Cost tracking
  - **Version**: Latest
  - **Gotchas**: Analytics delayed by 1-2 minutes

- **Resource**: AI Gateway Caching
  - **URL**: https://developers.cloudflare.com/ai-gateway/configuration/caching/
  - **Key Sections**: Cache TTL, Cache keys, Performance
  - **Version**: Latest
  - **Gotchas**: Cache keys auto-generated from request body

#### Best Practices

- **Practice**: Enable Caching
  - **Why**: Reduce costs by 30-80%
  - **How**: Enable in dashboard, set appropriate TTL
  - **Warning**: Don't cache personalized content

- **Practice**: Monitor Analytics
  - **Why**: Understand usage and costs
  - **How**: Check dashboard weekly, set up alerts
  - **Warning**: Data delayed by ~2 minutes

- **Practice**: Use Custom Metadata
  - **Why**: Track requests by feature/user
  - **How**: Add cf-aig-metadata header
  - **Warning**: Metadata increases request size slightly

## Technical Specification

### Architecture Overview

```
┌─────────────────┐
│  React App      │
│  (No changes)   │
└────────┬────────┘
         │ POST /api/chat
         ▼
┌─────────────────┐
│ Worker          │
│ (One line       │
│  change only)   │
│                 │
│ anthropic =     │
│   new Anthropic │
│   baseURL: GW   │ ← ONLY CHANGE
└────────┬────────┘
         │ HTTPS to gateway
         ▼
┌─────────────────┐
│ AI Gateway      │
│ (Cloudflare)    │
│                 │
│ - Check cache   │
│ - Log request   │
│ - Track cost    │
└────────┬────────┘
         │ If cache miss
         ▼
┌─────────────────┐
│ Anthropic API   │
│ (or other       │
│  provider)      │
└────────┬────────┘
         │ Response
         ▼
┌─────────────────┐
│ AI Gateway      │
│                 │
│ - Cache         │
│ - Log           │
│ - Return        │
└────────┬────────┘
         │ Response
         ▼
┌─────────────────┐
│ Worker          │
│ (No changes)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React App      │
│  (No changes)   │
└─────────────────┘
```

### Component Breakdown

#### Component 1: Cloudflare Dashboard Configuration

- **Purpose**: Create and configure AI Gateway
- **Location**: Cloudflare Dashboard
- **Dependencies**: Cloudflare account
- **Interface**: Web UI configuration

#### Component 2: Environment Variables

- **Purpose**: Store gateway URL and account ID
- **Location**: `wrangler.jsonc`, `.dev.vars`
- **Dependencies**: None
- **Interface**: Configuration files

#### Component 3: Worker Code Update

- **Purpose**: Change baseURL to gateway endpoint
- **Location**: Existing chat endpoints
- **Dependencies**: Environment variables
- **Interface**: One-line change per endpoint

### Data Models

No new data models - uses existing structures from chat examples.

### API Endpoints

No new endpoints - enhances existing endpoints transparently.

## Implementation Blueprint

### Prerequisites

1. **Cloudflare Account**: Free tier works
2. **Existing AI Implementation**: Any chat example working
3. **API Keys**: Already configured

### Implementation Steps (in order)

#### Step 1: Create AI Gateway in Dashboard

**Goal**: Set up gateway infrastructure

**Actions**:
1. Login to Cloudflare Dashboard
2. Navigate to AI → AI Gateway
3. Click "Create Gateway"
4. Name: `production-ai-gateway` (or your choice)
5. Click "Create"
6. Note gateway URL and account ID

**Validation**: Gateway appears in dashboard list

**Time**: 5 minutes

#### Step 2: Add Environment Variables

**Goal**: Configure gateway URL in application

**Files to Modify**:
- `wrangler.jsonc`
- `.dev.vars`

**wrangler.jsonc:**
```jsonc
{
  "vars": {
    "CLOUDFLARE_ACCOUNT_ID": "your-account-id",
    "GATEWAY_NAME": "production-ai-gateway"
  }
}
```

**.dev.vars:**
```
CLOUDFLARE_ACCOUNT_ID=your-account-id
GATEWAY_NAME=production-ai-gateway
```

**Validation**: Variables load without errors

**Time**: 2 minutes

#### Step 3: Update Worker Code

**Goal**: Change Anthropic SDK to use gateway

**Files to Modify**:
- `worker/index.ts` (or wherever chat handler is)

**Before:**
```typescript
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});
```

**After:**
```typescript
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/anthropic`,
});
```

**Validation**: Code compiles without errors

**Time**: 2 minutes

#### Step 4: Test Locally

**Goal**: Verify gateway integration works

**Commands**:
```bash
npm run dev
# Or
npx wrangler dev
```

**Test**:
1. Send test message
2. Verify response
3. Check Cloudflare dashboard for request

**Validation**:
- Message sends/receives successfully
- Request appears in gateway analytics (wait 1-2 minutes)

**Time**: 5 minutes

#### Step 5: Deploy to Production

**Goal**: Deploy with gateway integration

**Commands**:
```bash
npm run build
npm run deploy
```

**Validation**: Production deployment succeeds

**Time**: 2 minutes

#### Step 6: Configure Caching

**Goal**: Enable caching for cost savings

**Dashboard Steps**:
1. Go to your gateway in dashboard
2. Settings → Cache Responses: Enable
3. Set TTL (start with 1 hour)
4. Save

**Validation**: Cache enabled indicator shows

**Time**: 2 minutes

#### Step 7: Set Up Monitoring

**Goal**: Configure alerts and tracking

**Dashboard Steps**:
1. Settings → Cost Alerts: Enable
2. Set daily limit (e.g., $50)
3. Set email for alerts
4. Save

**Validation**: Alert configuration saved

**Time**: 3 minutes

### Error Handling Strategy

Gateway integration is transparent - existing error handling works:

- **API Errors**: Same as before, gateway passes through
- **Network Errors**: Same handling, gateway adds retry
- **Rate Limits**: Gateway can add rate limiting (optional)

### Edge Cases

1. **Edge Case**: Gateway is down
   - **Solution**: Cloudflare 99.99% uptime, auto-failover
   - **Fallback**: Can fall back to direct API if needed

2. **Edge Case**: Cache returns stale data
   - **Solution**: Set appropriate TTL, use cache-control headers
   - **Bypass**: Add 'Cache-Control: no-cache' header

3. **Edge Case**: Analytics not showing
   - **Solution**: Wait 2 minutes for data to appear
   - **Check**: Verify baseURL is correct

4. **Edge Case**: Costs higher than expected
   - **Solution**: Check cache hit rate, adjust TTL
   - **Monitor**: Set up cost alerts

## Testing Strategy

### Manual Testing Checklist

- [ ] Gateway created in dashboard
- [ ] Environment variables set correctly
- [ ] Code updated with gateway URL
- [ ] Local dev works (wrangler dev)
- [ ] Production deployment succeeds
- [ ] Request appears in analytics
- [ ] Caching is enabled
- [ ] Cache hit occurs (send same request twice)
- [ ] Cost tracking shows data
- [ ] Error handling still works
- [ ] Streaming still works (if applicable)
- [ ] Performance is acceptable

### Analytics Verification

After 24 hours:
- [ ] Check total request count
- [ ] Verify cache hit rate (target: >30%)
- [ ] Review total costs
- [ ] Check error rate (<5%)
- [ ] Review latency (should be similar or better)

## Validation Gates

### Pre-Implementation

```bash
# Verify existing implementation works
npm run dev
# Test chat, ensure it works before changing
```

### During Implementation

```bash
# After code change
npm run dev
# Test to ensure still works

# Check TypeScript
npx tsc --noEmit -p tsconfig.worker.json
```

### Post-Implementation

```bash
# Deploy
npm run deploy

# Test production
curl -X POST https://your-worker.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# Check analytics in dashboard
# Wait 2 minutes, then check:
# https://dash.cloudflare.com/ai/ai-gateway
```

## Dependencies

### No New Dependencies!

AI Gateway works with existing dependencies:
- `@anthropic-ai/sdk` (already installed)
- Or `openai` (if using OpenAI)
- Or direct HTTP (no dependencies)

## Success Criteria

- [ ] Gateway created successfully
- [ ] Code updated (one line per endpoint)
- [ ] Local testing succeeds
- [ ] Production deployment succeeds
- [ ] Requests appear in analytics
- [ ] Caching is functional
- [ ] Cache hit rate >30% after 1 week
- [ ] Cost tracking shows data
- [ ] Error rate unchanged
- [ ] Performance acceptable
- [ ] Alerts configured

## Known Limitations

1. **Analytics Delay**: 1-2 minute delay for data
   - Not real-time
   - Can't use for immediate debugging

2. **Cache Key Limitation**: Exact request match required
   - Small param change = cache miss
   - Can't customize cache keys

3. **No Local Gateway**: Local dev uses remote gateway
   - Requires internet connection
   - Counts toward usage

4. **Free Tier Limits**: Generous but exists
   - Check current limits in docs
   - Upgrade if needed

## Cost Impact

### Additional Costs
- **Gateway**: FREE (no additional cost)
- **Analytics**: FREE (included)
- **Caching**: FREE (included)

### Cost Savings
- **Caching**: 30-80% reduction in API costs
- **Example**: $1000/month → $300-700/month
- **ROI**: Immediate (no cost to implement)

## Migration Plan

### Phase 1: Test Environment (Day 1)
1. Create test gateway
2. Update dev environment
3. Test thoroughly
4. Verify analytics

### Phase 2: Staging (Day 2-3)
1. Create staging gateway
2. Update staging environment
3. Monitor for issues
4. Check performance

### Phase 3: Production (Day 4-7)
1. Create production gateway
2. Enable caching
3. Set up alerts
4. Deploy
5. Monitor closely

### Phase 4: Optimization (Week 2+)
1. Review cache hit rate
2. Adjust TTL
3. Set up custom metadata
4. Optimize based on analytics

## References

### External Resources

- AI Gateway Docs: https://developers.cloudflare.com/ai-gateway/
- Analytics: https://developers.cloudflare.com/ai-gateway/observability/analytics/
- Caching: https://developers.cloudflare.com/ai-gateway/configuration/caching/
- Dashboard: https://dash.cloudflare.com/ai/ai-gateway

## Appendix

### Quick Reference: baseURL Changes

**Anthropic:**
```typescript
baseURL: `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/anthropic`
```

**OpenAI:**
```typescript
baseURL: `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/openai`
```

**Azure OpenAI:**
```typescript
baseURL: `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/azure-openai`
```

### Rollback Plan

If issues occur, rollback is trivial:

```typescript
// Remove gateway URL
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  // Remove this line:
  // baseURL: `https://gateway...`,
});

// Redeploy
npm run deploy
```

### Monitoring Checklist (Weekly)

- [ ] Check cache hit rate
- [ ] Review total costs
- [ ] Check error rate
- [ ] Review latency metrics
- [ ] Export analytics data
- [ ] Adjust cache TTL if needed
- [ ] Review top requests
- [ ] Check for anomalies
