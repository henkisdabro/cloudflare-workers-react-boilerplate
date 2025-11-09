# Add Cloudflare Binding Wizard

Welcome! I'll help you add a Cloudflare binding to your Worker. Bindings allow your Worker to interact with various Cloudflare services and external resources.

## What Are Bindings?

Bindings are connections between your Worker and resources on the Cloudflare platform. They're accessed through the `env` parameter in your Worker's fetch handler and are fully type-safe when you run `npm run cf-typegen`.

```typescript
export default {
  async fetch(request, env, ctx) {
    // Access bindings via env
    const data = await env.MY_KV.get("key");
    const result = await env.DB.prepare("SELECT * FROM users").all();
    // etc.
  },
} satisfies ExportedHandler<Env>;
```

## Available Binding Types

Choose the binding type you want to add:

### 1. D1 Database

**SQLite database for structured, relational data**

**When to use:**
- User accounts and authentication
- Content management (posts, comments)
- E-commerce (products, orders)
- Any structured data with relationships
- Need for SQL queries and transactions

**Pricing:** Free tier includes 5 GB storage, 5 million reads, 100k writes per day

**Documentation:** https://developers.cloudflare.com/d1/

---

### 2. KV Namespace

**Global key-value store for high-read workloads**

**When to use:**
- Caching API responses
- Session storage
- Configuration and feature flags
- Rate limiting counters
- Simple key-value data

**Pricing:** Free tier includes 100k reads, 1k writes, 1k deletes, 1 GB storage per day

**Documentation:** https://developers.cloudflare.com/kv/

---

### 3. R2 Bucket

**S3-compatible object storage for large files**

**When to use:**
- File uploads (images, videos, documents)
- Media hosting and serving
- Backup storage
- Static asset storage
- Data lakes and archives

**Pricing:** Free tier includes 10 GB storage per month, no egress fees

**Documentation:** https://developers.cloudflare.com/r2/

---

### 4. Queue

**Message queue for asynchronous processing**

**When to use:**
- Background job processing
- Email sending
- Image/video processing
- Webhook delivery with retries
- Event-driven architectures
- Decoupled microservices

**Pricing:** Free tier includes 1 million operations per month

**Documentation:** https://developers.cloudflare.com/queues/

---

### 5. Durable Object

**Stateful compute with strong consistency**

**When to use:**
- Real-time collaboration (multiplayer games, collaborative editors)
- WebSocket connections
- Coordination and locking
- Strong consistency requirements
- Stateful workflows

**Pricing:** Pay-per-use based on requests and duration

**Documentation:** https://developers.cloudflare.com/durable-objects/

---

### 6. Service Binding

**Connect to another Worker**

**When to use:**
- Microservices architecture
- Shared functionality across workers
- Internal APIs
- Service-oriented architecture

**Pricing:** No additional cost (uses existing Worker billing)

**Documentation:** https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/

---

### 7. Workers AI

**Run AI models at the edge**

**When to use:**
- Text generation (LLMs)
- Embeddings and semantic search
- Image classification
- Text-to-image generation
- Translation
- Sentiment analysis

**Pricing:** Free tier includes 10,000 Neurons per day

**Documentation:** https://developers.cloudflare.com/workers-ai/

---

### 8. Analytics Engine

**Write analytics data for querying**

**When to use:**
- Custom analytics
- Application metrics
- User behavior tracking
- Performance monitoring
- Business intelligence

**Pricing:** Pay-per-use based on writes and reads

**Documentation:** https://developers.cloudflare.com/analytics/analytics-engine/

---

### 9. Environment Variable

**Simple string configuration**

**When to use:**
- API endpoints
- Configuration values
- Non-sensitive settings
- Feature flags (simple boolean/string)

**Note:** For sensitive data (API keys, passwords), use Secrets instead (`wrangler secret put`)

**Pricing:** Free (part of Worker configuration)

**Documentation:** https://developers.cloudflare.com/workers/configuration/environment-variables/

---

## Interactive Setup

I'll now guide you through adding your chosen binding. Please select one of the options above (1-9).

---

## Setup Flows by Binding Type

### 1. D1 Database Setup

**Step 1: Database Name**

I'll ask for your database name (lowercase-with-hyphens, e.g., "my-app-db").

**Step 2: Create Database**

```bash
npx wrangler d1 create <database-name>
```

**Step 3: Update wrangler.jsonc**

I'll add:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "<database-name>",
      "database_id": "<generated-id>"
    }
  ]
}
```

**Step 4: Generate Types**

```bash
npm run cf-typegen
```

**Step 5: Example Usage**

```typescript
// worker/index.ts
export default {
  async fetch(request, env): Promise<Response> {
    // Query database
    const { results } = await env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind("user@example.com").all();

    return Response.json({ users: results });
  },
} satisfies ExportedHandler<Env>;
```

**Next Steps:**
- Create migrations directory: `mkdir -p migrations`
- Create migration: `npx wrangler d1 migrations create <database-name> initial_schema`
- Apply migration: `npx wrangler d1 migrations apply <database-name> --local`
- See `/setup-database` command for detailed D1 setup

---

### 2. KV Namespace Setup

**Step 1: Namespace Name**

I'll ask for your namespace name (UPPERCASE_WITH_UNDERSCORES, e.g., "MY_CACHE", "USER_SESSIONS").

**Step 2: Create Namespace**

```bash
npx wrangler kv namespace create <NAMESPACE_NAME>
```

**Step 3: Update wrangler.jsonc**

I'll add:

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "<NAMESPACE_NAME>",
      "id": "<generated-id>"
    }
  ]
}
```

**Step 4: Generate Types**

```bash
npm run cf-typegen
```

**Step 5: Example Usage**

```typescript
// worker/index.ts
export default {
  async fetch(request, env): Promise<Response> {
    // Write
    await env.MY_CACHE.put("key", "value", {
      expirationTtl: 3600, // Expire in 1 hour
    });

    // Read
    const value = await env.MY_CACHE.get("key");

    // Read as JSON
    const data = await env.MY_CACHE.get("key", "json");

    // Delete
    await env.MY_CACHE.delete("key");

    // List keys
    const { keys } = await env.MY_CACHE.list({ prefix: "user:" });

    return Response.json({ value, keys });
  },
} satisfies ExportedHandler<Env>;
```

**Next Steps:**
- Add test data: `npx wrangler kv key put --binding <NAMESPACE_NAME> "test" "value"`
- List keys: `npx wrangler kv key list --binding <NAMESPACE_NAME>`
- See `/setup-database` command for detailed KV setup with examples

---

### 3. R2 Bucket Setup

**Step 1: Bucket Name**

I'll ask for your bucket name (lowercase-with-hyphens, e.g., "my-files", "user-uploads").

**Step 2: Create Bucket**

```bash
npx wrangler r2 bucket create <bucket-name>
```

**Step 3: Update wrangler.jsonc**

I'll add:

```jsonc
{
  "r2_buckets": [
    {
      "binding": "MY_BUCKET",
      "bucket_name": "<bucket-name>"
    }
  ]
}
```

**Step 4: Generate Types**

```bash
npm run cf-typegen
```

**Step 5: Example Usage**

```typescript
// worker/index.ts
export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    // Upload file
    if (request.method === "POST" && url.pathname === "/upload") {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      await env.MY_BUCKET.put(file.name, file.stream(), {
        httpMetadata: {
          contentType: file.type,
        },
      });

      return Response.json({ success: true });
    }

    // Download file
    if (request.method === "GET" && url.pathname.startsWith("/files/")) {
      const key = url.pathname.replace("/files/", "");
      const object = await env.MY_BUCKET.get(key);

      if (!object) {
        return new Response("Not found", { status: 404 });
      }

      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
          "ETag": object.etag,
        },
      });
    }

    // List files
    if (url.pathname === "/files") {
      const { objects } = await env.MY_BUCKET.list({ prefix: "uploads/" });
      const files = objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
      }));

      return Response.json({ files });
    }

    // Delete file
    if (request.method === "DELETE" && url.pathname.startsWith("/files/")) {
      const key = url.pathname.replace("/files/", "");
      await env.MY_BUCKET.delete(key);

      return Response.json({ success: true });
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

**Next Steps:**
- Test upload with curl or Postman
- Set up CORS if needed
- Consider using presigned URLs for direct uploads
- Implement file size limits

**Learn more:** https://developers.cloudflare.com/r2/

---

### 4. Queue Setup

**Step 1: Queue Name**

I'll ask for your queue name (lowercase-with-hyphens, e.g., "email-queue", "image-processor").

**Step 2: Create Queue**

```bash
npx wrangler queues create <queue-name>
```

**Step 3: Update wrangler.jsonc (Producer)**

I'll add the producer binding:

```jsonc
{
  "queues": {
    "producers": [
      {
        "binding": "MY_QUEUE",
        "queue": "<queue-name>"
      }
    ]
  }
}
```

**Step 4: Add Consumer Configuration**

To process messages, add consumer configuration:

```jsonc
{
  "queues": {
    "producers": [
      {
        "binding": "MY_QUEUE",
        "queue": "<queue-name>"
      }
    ],
    "consumers": [
      {
        "queue": "<queue-name>",
        "max_batch_size": 10,
        "max_batch_timeout": 30
      }
    ]
  }
}
```

**Step 5: Generate Types**

```bash
npm run cf-typegen
```

**Step 6: Example Usage**

```typescript
// worker/index.ts - Producer
export default {
  async fetch(request, env): Promise<Response> {
    // Send message to queue
    await env.MY_QUEUE.send({
      type: "email",
      to: "user@example.com",
      subject: "Welcome!",
      body: "Thanks for signing up",
    });

    // Send multiple messages
    await env.MY_QUEUE.sendBatch([
      { type: "email", to: "user1@example.com" },
      { type: "email", to: "user2@example.com" },
    ]);

    return Response.json({ queued: true });
  },

  // Consumer - Process messages
  async queue(batch, env): Promise<void> {
    for (const message of batch.messages) {
      try {
        const { type, to, subject, body } = message.body;

        // Process the message
        await sendEmail(to, subject, body);

        // Acknowledge successful processing
        message.ack();
      } catch (error) {
        console.error("Error processing message:", error);
        // Message will be retried
        message.retry();
      }
    }
  },
} satisfies ExportedHandler<Env>;
```

**Next Steps:**
- Implement message processing logic
- Handle errors and retries appropriately
- Monitor queue depth in dashboard
- Set up dead letter queues if needed

**Learn more:** https://developers.cloudflare.com/queues/

---

### 5. Durable Object Setup

**Step 1: Object Class Name**

I'll ask for your Durable Object class name (PascalCase, e.g., "ChatRoom", "GameSession").

**Step 2: Create Durable Object Class**

I'll create a new file:

```typescript
// worker/durable-objects/ChatRoom.ts
export class ChatRoom {
  state: DurableObjectState;
  env: Env;
  sessions: Set<WebSocket>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = new Set();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.sessions.add(server);

      server.accept();
      server.addEventListener("message", (event) => {
        // Broadcast to all sessions
        this.broadcast(event.data);
      });

      server.addEventListener("close", () => {
        this.sessions.delete(server);
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // Regular HTTP endpoints
    if (url.pathname === "/state") {
      const count = await this.state.storage.get("count") || 0;
      return Response.json({ count });
    }

    return new Response("Not found", { status: 404 });
  }

  broadcast(message: string) {
    for (const session of this.sessions) {
      session.send(message);
    }
  }
}
```

**Step 3: Update wrangler.jsonc**

I'll add:

```jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "name": "CHAT_ROOM",
        "class_name": "ChatRoom",
        "script_name": "my-worker"
      }
    ]
  },

  // Register migrations
  "migrations": [
    {
      "tag": "v1",
      "new_classes": ["ChatRoom"]
    }
  ]
}
```

**Step 4: Export in Worker**

Update `worker/index.ts`:

```typescript
export { ChatRoom } from './durable-objects/ChatRoom';

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    // Route to Durable Object
    if (url.pathname.startsWith("/room/")) {
      const roomId = url.pathname.replace("/room/", "");

      // Get Durable Object instance
      const id = env.CHAT_ROOM.idFromName(roomId);
      const stub = env.CHAT_ROOM.get(id);

      // Forward request to DO
      return stub.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

**Step 5: Generate Types**

```bash
npm run cf-typegen
```

**Next Steps:**
- Implement your Durable Object logic
- Test WebSocket connections
- Deploy and run migrations
- Monitor DO usage in dashboard

**Learn more:** https://developers.cloudflare.com/durable-objects/

---

### 6. Service Binding Setup

**Step 1: Service Details**

I'll ask for:
- Binding name (e.g., "AUTH_SERVICE")
- Service name (the name of the Worker you want to bind to)

**Step 2: Update wrangler.jsonc**

I'll add:

```jsonc
{
  "services": [
    {
      "binding": "AUTH_SERVICE",
      "service": "auth-worker"
    }
  ]
}
```

**Step 3: Generate Types**

```bash
npm run cf-typegen
```

**Step 4: Example Usage**

```typescript
// worker/index.ts - Main worker
export default {
  async fetch(request, env): Promise<Response> {
    // Call another worker via service binding
    const authResponse = await env.AUTH_SERVICE.fetch(
      new Request("https://internal/verify", {
        method: "POST",
        headers: {
          "Authorization": request.headers.get("Authorization") || "",
        },
      })
    );

    if (!authResponse.ok) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await authResponse.json();

    // Continue with authenticated request
    return Response.json({ user });
  },
} satisfies ExportedHandler<Env>;
```

**Next Steps:**
- Ensure the target Worker is deployed
- Define internal API contract
- Handle errors appropriately
- Consider using for shared utilities

**Learn more:** https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/

---

### 7. Workers AI Setup

**Step 1: Confirm AI Binding**

Workers AI uses a single binding named "AI" by convention.

**Step 2: Update wrangler.jsonc**

I'll add:

```jsonc
{
  "ai": {
    "binding": "AI"
  }
}
```

**Step 3: Generate Types**

```bash
npm run cf-typegen
```

**Step 4: Example Usage**

```typescript
// worker/index.ts
export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    // Text generation
    if (url.pathname === "/api/chat") {
      const { message } = await request.json() as { message: string };

      const response = await env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
        messages: [
          { role: "system", content: "You are a helpful assistant" },
          { role: "user", content: message }
        ],
      });

      return Response.json(response);
    }

    // Text embeddings
    if (url.pathname === "/api/embed") {
      const { text } = await request.json() as { text: string };

      const response = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
        text,
      });

      return Response.json({ embeddings: response.data });
    }

    // Image classification
    if (url.pathname === "/api/classify-image") {
      const formData = await request.formData();
      const image = formData.get("image") as File;

      const response = await env.AI.run("@cf/microsoft/resnet-50", {
        image: await image.arrayBuffer(),
      });

      return Response.json(response);
    }

    // Translation
    if (url.pathname === "/api/translate") {
      const { text, targetLang } = await request.json() as { text: string; targetLang: string };

      const response = await env.AI.run("@cf/meta/m2m100-1.2b", {
        text,
        target_lang: targetLang,
        source_lang: "en",
      });

      return Response.json(response);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

**Available Models:**
- **Text Generation:** Llama 2, Mistral, CodeLlama
- **Embeddings:** BGE, UAE
- **Image Classification:** ResNet
- **Image-to-Text:** ViT-GPT2
- **Translation:** M2M100
- **Speech Recognition:** Whisper

**Next Steps:**
- Browse available models: https://developers.cloudflare.com/workers-ai/models/
- Implement error handling
- Consider rate limiting
- Monitor usage in dashboard

**Learn more:** https://developers.cloudflare.com/workers-ai/

---

### 8. Analytics Engine Setup

**Step 1: Dataset Name**

I'll ask for your dataset name (UPPERCASE_WITH_UNDERSCORES, e.g., "APP_ANALYTICS").

**Step 2: Update wrangler.jsonc**

I'll add:

```jsonc
{
  "analytics_engine_datasets": [
    {
      "binding": "APP_ANALYTICS"
    }
  ]
}
```

**Step 3: Generate Types**

```bash
npm run cf-typegen
```

**Step 4: Example Usage**

```typescript
// worker/index.ts
export default {
  async fetch(request, env, ctx): Promise<Response> {
    const start = Date.now();
    const url = new URL(request.url);

    // Your application logic
    const response = await handleRequest(request, env);

    const duration = Date.now() - start;

    // Write analytics data
    ctx.waitUntil(
      env.APP_ANALYTICS.writeDataPoint({
        blobs: [
          url.pathname,
          request.method,
          request.headers.get("User-Agent") || "unknown",
        ],
        doubles: [duration, response.status],
        indexes: [url.pathname],
      })
    );

    return response;
  },
} satisfies ExportedHandler<Env>;
```

**Step 5: Query Data**

Query your analytics data using GraphQL API or SQL API:

```bash
# Using SQL API
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{account_id}/analytics_engine/sql" \
  -H "Authorization: Bearer {api_token}" \
  -d "SELECT blob1 AS path, COUNT(*) AS count FROM APP_ANALYTICS WHERE timestamp > NOW() - INTERVAL '1' DAY GROUP BY path ORDER BY count DESC"
```

**Next Steps:**
- Define your analytics schema
- Set up queries in dashboard
- Create visualizations
- Set up alerts

**Learn more:** https://developers.cloudflare.com/analytics/analytics-engine/

---

### 9. Environment Variable Setup

**Step 1: Variable Details**

I'll ask for:
- Variable name (UPPERCASE_WITH_UNDERSCORES, e.g., "API_URL", "MAX_UPLOAD_SIZE")
- Variable value

**Step 2: Update wrangler.jsonc**

I'll add:

```jsonc
{
  "vars": {
    "API_URL": "https://api.example.com",
    "MAX_UPLOAD_SIZE": "10485760",
    "FEATURE_BETA": "true"
  }
}
```

**Step 3: Environment-Specific Values**

For different environments:

```jsonc
{
  "vars": {
    "API_URL": "https://api.example.com",
    "ENVIRONMENT": "production"
  },

  "env": {
    "staging": {
      "vars": {
        "API_URL": "https://staging-api.example.com",
        "ENVIRONMENT": "staging"
      }
    },
    "dev": {
      "vars": {
        "API_URL": "http://localhost:3000",
        "ENVIRONMENT": "development"
      }
    }
  }
}
```

**Step 4: Example Usage**

```typescript
// worker/index.ts
export default {
  async fetch(request, env): Promise<Response> {
    // Access environment variables
    const apiUrl = env.API_URL;
    const maxSize = parseInt(env.MAX_UPLOAD_SIZE);
    const betaEnabled = env.FEATURE_BETA === "true";

    // Use in logic
    if (betaEnabled) {
      // Beta feature code
    }

    const response = await fetch(`${apiUrl}/data`);
    const data = await response.json();

    return Response.json(data);
  },
} satisfies ExportedHandler<Env>;
```

**Important Notes:**

⚠️ **Environment variables are NOT secret!** They are visible in:
- Wrangler configuration
- Worker code
- Cloudflare dashboard

🔒 **For sensitive data (API keys, passwords, tokens), use Secrets instead:**

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put DATABASE_PASSWORD
```

Secrets are encrypted and never visible after creation.

**Next Steps:**
- Use `.dev.vars` for local development
- Consider environment-specific configurations
- Document required variables in README
- Use Secrets for sensitive data

**Learn more:** https://developers.cloudflare.com/workers/configuration/environment-variables/

---

## Post-Setup Steps

After adding any binding, I will:

1. **Update wrangler.jsonc** with the binding configuration
2. **Run `npm run cf-typegen`** to generate TypeScript types
3. **Provide example usage code** specific to your use case
4. **Create starter files** if applicable (Durable Object classes, etc.)
5. **Explain next steps** for testing and deployment

## Error Handling

Throughout the process, I will:
- Validate all inputs
- Check for naming conflicts
- Handle Wrangler CLI errors gracefully
- Verify file modifications
- Provide troubleshooting guidance

## Ready to Start

I'm ready to help you add a binding! Please choose one of the options above (1-9) and I'll guide you through the setup process.

What type of binding would you like to add?
