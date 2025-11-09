# Database Examples

This directory contains production-ready examples of using Cloudflare's native storage solutions with your Workers + React application. Each example includes complete implementation code, documentation, and a detailed Product Requirement Plan (PRP).

## Available Examples

### 📝 [D1 Contact Form](./d1-contact-form/)

A complete CRUD application using Cloudflare D1 (SQLite database).

- **Use Case**: Contact form with persistent storage
- **Features**: Create, read, list, and delete contacts
- **Includes**: SQL schema, migrations, API endpoints, React component
- **Best For**: Relational data, complex queries, transactions

### 🔐 [KV Sessions](./kv-sessions/)

Session management and authentication using Cloudflare KV.

- **Use Case**: User authentication and session management
- **Features**: Login, logout, session validation, secure cookies
- **Includes**: Session middleware, auth endpoints, React Context provider
- **Best For**: Key-value storage, caching, session data

## D1 vs KV Comparison

Choose the right storage solution for your use case:

| Feature | D1 (SQLite) | KV (Key-Value) |
|---------|-------------|----------------|
| **Data Model** | Relational tables with schemas | Simple key-value pairs |
| **Query Capabilities** | Full SQL (SELECT, JOIN, etc.) | Get/Put by key only |
| **Consistency** | Strong consistency | Eventually consistent |
| **Best For** | Complex data relationships | Simple lookups, caching |
| **Transactions** | Yes (ACID) | No |
| **Indexing** | Yes (custom indexes) | No (key-based only) |
| **Max Value Size** | ~1MB per row | 25MB per value |
| **TTL (Auto-expire)** | No (manual cleanup) | Yes (automatic) |
| **Read Performance** | Fast | Ultra-fast (edge-cached) |
| **Write Performance** | Fast | Fast |
| **Ideal Use Cases** | User data, orders, products | Sessions, config, cache |

### When to Use D1

Use **D1** when you need:

- ✅ Relational data with multiple tables
- ✅ Complex queries (JOINs, aggregations)
- ✅ ACID transactions
- ✅ Data validation via constraints
- ✅ Full-text search
- ✅ Strong consistency guarantees

**Examples:**
- User profiles and account data
- E-commerce products and orders
- Blog posts and comments
- Analytics and reporting data
- Any data requiring relationships

### When to Use KV

Use **KV** when you need:

- ✅ Simple key-value lookups
- ✅ High read performance (edge-cached)
- ✅ Automatic expiration (TTL)
- ✅ Global distribution
- ✅ Caching layer
- ✅ Eventually consistent data

**Examples:**
- User sessions and authentication tokens
- Application configuration
- API response caching
- Feature flags
- Rate limiting counters
- Temporary data storage

### Can I Use Both?

**Yes!** Many applications use both D1 and KV together:

**Example: User Authentication System**
- **D1**: Store user accounts, profiles, and password hashes
- **KV**: Store active sessions with automatic expiration

**Example: E-commerce Application**
- **D1**: Store products, orders, and customer data
- **KV**: Cache product listings, store shopping cart sessions

**Example: Blog Platform**
- **D1**: Store posts, comments, and authors
- **KV**: Cache rendered pages, store view counts

## Setup Prerequisites

### For D1 Examples

1. **Wrangler CLI** installed:
   ```bash
   npm install -g wrangler
   ```

2. **Create D1 database**:
   ```bash
   npx wrangler d1 create your-database-name
   ```

3. **Configure in wrangler.jsonc**:
   ```jsonc
   {
     "d1_databases": [
       {
         "binding": "DB",
         "database_name": "your-database-name",
         "database_id": "xxxx-xxxx-xxxx-xxxx"
       }
     ]
   }
   ```

4. **Run migrations**:
   ```bash
   npx wrangler d1 migrations apply your-database-name --local
   npx wrangler d1 migrations apply your-database-name
   ```

### For KV Examples

1. **Create KV namespace**:
   ```bash
   npx wrangler kv namespace create YOUR_NAMESPACE
   npx wrangler kv namespace create YOUR_NAMESPACE --preview
   ```

2. **Configure in wrangler.jsonc**:
   ```jsonc
   {
     "kv_namespaces": [
       {
         "binding": "YOUR_NAMESPACE",
         "id": "xxxxxxxxxxxxxxxxxxxx",
         "preview_id": "yyyyyyyyyyyyyyyyyyyy"
       }
     ]
   }
   ```

### Generate TypeScript Types

After configuring any bindings, always run:

```bash
npm run cf-typegen
```

This generates TypeScript types for your bindings in `worker-configuration.d.ts`.

## Integration Patterns

### Pattern 1: Single Example

Use one example as-is for a specific feature:

```typescript
// worker/index.ts
import { handleContactRequest } from '../examples/database/d1-contact-form/worker-endpoint';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/contacts')) {
      return handleContactRequest(request, env);
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

### Pattern 2: Multiple Examples

Combine multiple examples in one application:

```typescript
// worker/index.ts
import { handleContactRequest } from '../examples/database/d1-contact-form/worker-endpoint';
import { handleAuthRequest } from '../examples/database/kv-sessions/worker-endpoints';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Auth routes (KV)
    if (url.pathname.startsWith('/api/auth')) {
      return handleAuthRequest(request, env);
    }

    // Contact routes (D1)
    if (url.pathname.startsWith('/api/contacts')) {
      return handleContactRequest(request, env);
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

### Pattern 3: Protected Endpoints

Combine auth with data access:

```typescript
// worker/index.ts
import { SessionManager } from '../examples/database/kv-sessions/worker-middleware';
import { handleContactRequest } from '../examples/database/d1-contact-form/worker-endpoint';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Public auth routes
    if (url.pathname.startsWith('/api/auth')) {
      return handleAuthRequest(request, env);
    }

    // Protected contact routes - require authentication
    if (url.pathname.startsWith('/api/contacts')) {
      const sessionManager = new SessionManager(env.SESSIONS);
      const session = await sessionManager.getSessionFromRequest(request);

      if (!session) {
        return Response.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      return handleContactRequest(request, env);
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

## Development Workflow

### Local Development

```bash
# Start development server
npm run dev

# Test API endpoints
curl http://localhost:5173/api/your-endpoint

# View local D1 data
npx wrangler d1 execute your-database-name --local --command "SELECT * FROM your_table"

# View local KV data
npx wrangler kv key get "your-key" --binding YOUR_NAMESPACE --local
```

### Production Deployment

```bash
# Build and deploy
npm run deploy

# View production D1 data
npx wrangler d1 execute your-database-name --command "SELECT * FROM your_table"

# View production KV data
npx wrangler kv key get "your-key" --binding YOUR_NAMESPACE
```

## Best Practices

### Security

1. **Input Validation**: Always validate and sanitize user input
2. **SQL Injection**: Use parameterized queries (`.bind()`) for D1
3. **Authentication**: Protect sensitive endpoints with session middleware
4. **HTTPS**: Always use secure connections in production
5. **HttpOnly Cookies**: Use for session tokens to prevent XSS

### Performance

1. **Caching**: Use KV for frequently accessed data
2. **Indexes**: Add database indexes for commonly queried fields (D1)
3. **Pagination**: Implement pagination for large datasets
4. **Connection Pooling**: D1 handles this automatically
5. **Edge Caching**: KV data is automatically cached at the edge

### Data Management

1. **Migrations**: Always use migrations for D1 schema changes
2. **TTL**: Use KV TTL for automatic cleanup of temporary data
3. **Backups**: Implement backup strategy for critical D1 data
4. **Monitoring**: Monitor KV and D1 usage in Cloudflare dashboard
5. **Limits**: Be aware of plan limits (storage, operations)

## Testing

### Unit Testing

Test business logic separately from database:

```typescript
// Mock D1 database
const mockDB = {
  prepare: (sql: string) => ({
    bind: (...params: any[]) => ({
      all: async () => ({ results: mockData }),
      first: async () => mockData[0],
      run: async () => ({ success: true }),
    }),
  }),
};
```

### Integration Testing

Test with local databases:

```bash
# Set up test database
npx wrangler d1 create test-database
npx wrangler d1 migrations apply test-database --local

# Run tests against local environment
npm run dev
npm run test
```

### E2E Testing

Test complete flows:

```bash
# Start local server
npm run dev

# Run E2E tests
npm run test:e2e
```

## Troubleshooting

### Common Issues

**D1: "Database not found"**
```bash
# Make sure migrations are run
npx wrangler d1 migrations apply your-database-name --local
```

**KV: "Binding not found"**
```bash
# Generate types
npm run cf-typegen

# Check wrangler.jsonc configuration
```

**TypeScript: "Property 'DB' does not exist on 'Env'"**
```bash
# Regenerate types
npm run cf-typegen
```

**Local changes not reflecting**
```bash
# Restart dev server
npm run dev
```

## Cost Considerations

### D1 Pricing (as of 2025)

- **Free Tier**: 5GB storage, 5M rows read/day, 100K rows written/day
- **Paid**: $5/month per 1GB storage, additional operations charged
- **Best For**: Applications with moderate to high data requirements

### KV Pricing (as of 2025)

- **Free Tier**: 100K read operations/day, 1K write operations/day, 1GB storage
- **Paid**: $0.50 per million reads, $5 per million writes
- **Best For**: Read-heavy workloads with moderate storage

**Tip**: Both D1 and KV have generous free tiers. Most small to medium applications stay within free limits.

## Additional Resources

### Cloudflare Documentation

- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [KV Documentation](https://developers.cloudflare.com/kv/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Example PRPs

Each example includes a complete Product Requirement Plan (PRP):

- [D1 Contact Form PRP](./d1-contact-form/PRP.md)
- [KV Sessions PRP](./kv-sessions/PRP.md)

These PRPs provide detailed implementation blueprints for building similar features.

### Community

- [Cloudflare Workers Discord](https://discord.gg/cloudflaredev)
- [Cloudflare Community Forum](https://community.cloudflare.com/)
- [GitHub Discussions](https://github.com/cloudflare/workers-sdk/discussions)

## Need Help?

1. **Check example READMEs**: Each example has detailed setup instructions
2. **Review PRPs**: Complete implementation plans with troubleshooting
3. **Cloudflare Docs**: Official documentation is comprehensive
4. **Community**: Ask questions in Discord or forums
5. **GitHub Issues**: Report bugs or request features

## Contributing

Found a bug or have an improvement? Consider:

1. Opening an issue
2. Submitting a pull request
3. Sharing your use case
4. Improving documentation

---

**Happy building!** These examples are designed to be copy-paste ready for your projects. Modify them to fit your specific needs and scale as your application grows.
