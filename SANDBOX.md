# Cloudflare Sandbox SDK Guide

Execute untrusted code safely in isolated containers on Cloudflare's edge network. The Sandbox SDK enables secure, edge-native code execution for AI agents, interactive development environments, data analysis platforms, and CI/CD systems.

> **Status:** Beta (June 2025) - Actively developed with full production support coming soon.

## Overview

The Sandbox SDK provides isolated container environments that run on Cloudflare's global network, perfect for:

- **AI Agents** - Execute LLM-generated code safely
- **Code Interpreters** - Python/JavaScript REPLs with rich output
- **Data Analysis** - Run computational workloads securely
- **CI/CD Systems** - Isolated build and test environments
- **Interactive IDEs** - Cloud-based development environments

### Key Features

| Feature | Description |
|---------|-------------|
| **Secure Isolation** | Each sandbox runs in its own container with strong security boundaries |
| **Code Execution** | Run Python, Node.js, and shell commands |
| **File System Access** | Read, write, and manage files within the sandbox |
| **Streaming Output** | Live streaming of command output |
| **Preview URLs** | Expose running services publicly |
| **Git Integration** | Clone repositories directly into sandboxes |
| **Process Control** | Full background process management |

## Quick Start

### Prerequisites

- Node.js 16.17.0 or later
- Docker running locally (for development)
- Cloudflare account with Workers enabled

### 1. Create Project with Sandbox

```bash
npm create cloudflare@latest -- my-sandbox-app --template=cloudflare/sandbox-sdk/examples/minimal
cd my-sandbox-app
npm install
```

### 2. Configure wrangler.jsonc

Add the Sandbox binding to your configuration:

```jsonc
{
  "name": "my-sandbox-app",
  "main": "worker/index.ts",
  "compatibility_date": "2025-11-09",

  // Add Sandbox binding
  "unsafe": {
    "bindings": [
      {
        "name": "Sandbox",
        "type": "sandbox"
      }
    ]
  }
}
```

### 3. Generate Types

```bash
npm run cf-typegen
```

### 4. Basic Usage

```typescript
import { getSandbox, type Sandbox } from '@cloudflare/sandbox';

interface Env {
  Sandbox: Sandbox;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const sandbox = getSandbox(env.Sandbox, 'my-sandbox');

    // Execute a command
    const result = await sandbox.exec('python3 -c "print(2 + 2)"');

    return Response.json({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    });
  },
} satisfies ExportedHandler<Env>;
```

## Core API Reference

### Getting a Sandbox Instance

```typescript
import { getSandbox, type Sandbox } from '@cloudflare/sandbox';

// Create or connect to a named sandbox
const sandbox = getSandbox(env.Sandbox, 'sandbox-name');

// With options
const sandbox = getSandbox(env.Sandbox, 'sandbox-name', {
  timeout: 30000, // 30 seconds timeout
});
```

### Executing Commands

```typescript
// Simple command execution
const result = await sandbox.exec('echo "Hello, World!"');
console.log(result.stdout); // "Hello, World!\n"

// Execute with working directory
const result = await sandbox.exec('ls -la', { cwd: '/workspace' });

// Execute with environment variables
const result = await sandbox.exec('node script.js', {
  env: { NODE_ENV: 'production' },
});

// Streaming output
const stream = sandbox.execStream('npm install');
for await (const chunk of stream) {
  console.log(chunk.type, chunk.data); // 'stdout' or 'stderr'
}
```

### File Operations

```typescript
// Write a file
await sandbox.writeFile('/workspace/hello.txt', 'Hello, World!');

// Read a file
const content = await sandbox.readFile('/workspace/hello.txt');

// Read file as buffer
const buffer = await sandbox.readFile('/workspace/image.png', 'buffer');

// Check if file exists
const exists = await sandbox.exists('/workspace/hello.txt');

// List directory contents
const files = await sandbox.readdir('/workspace');

// Delete a file
await sandbox.unlink('/workspace/hello.txt');

// Create directory
await sandbox.mkdir('/workspace/new-folder');
```

### Code Interpreters

The SDK includes built-in code interpreters for Python and JavaScript with rich output support:

```typescript
// Python interpreter
const python = await sandbox.createInterpreter('python');
const result = await python.run(`
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)
plt.plot(x, y)
plt.savefig('/tmp/plot.png')
print("Plot saved!")
`);

// JavaScript interpreter
const js = await sandbox.createInterpreter('javascript');
const result = await js.run(`
const data = { message: "Hello from sandbox!" };
console.log(JSON.stringify(data, null, 2));
`);
```

### Git Operations

```typescript
// Clone a repository
await sandbox.git.clone('https://github.com/user/repo.git', '/workspace/repo');

// Clone with authentication
await sandbox.git.clone('https://github.com/user/private-repo.git', '/workspace/repo', {
  auth: { token: env.GITHUB_TOKEN },
});

// Execute git commands
const result = await sandbox.exec('git status', { cwd: '/workspace/repo' });
```

### Process Management

```typescript
// Start a background process
const process = await sandbox.spawn('npm run dev', {
  cwd: '/workspace/my-app',
});

// Get process status
const status = await process.status();

// Stream process output
for await (const chunk of process.output()) {
  console.log(chunk);
}

// Kill the process
await process.kill();
```

### Preview URLs

Expose services running in the sandbox publicly:

```typescript
// Start a web server in the sandbox
await sandbox.spawn('python3 -m http.server 8080', {
  cwd: '/workspace/public',
});

// Get a public URL for the service
const url = await sandbox.getPreviewUrl(8080);
console.log(`Preview available at: ${url}`);
// Returns: https://xxx.sandbox.workers.dev
```

## Integration Patterns

### AI Code Execution Agent

```typescript
import { getSandbox } from '@cloudflare/sandbox';
import Anthropic from '@anthropic-ai/sdk';

interface Env {
  Sandbox: Sandbox;
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { prompt } = await request.json();

    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });

    // Get AI to generate code
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Write Python code to: ${prompt}. Return ONLY the code, no explanation.`,
      }],
    });

    const code = response.content[0].text;

    // Execute in sandbox
    const sandbox = getSandbox(env.Sandbox, 'ai-executor');
    await sandbox.writeFile('/workspace/script.py', code);
    const result = await sandbox.exec('python3 /workspace/script.py');

    return Response.json({
      code,
      output: result.stdout,
      error: result.stderr,
      exitCode: result.exitCode,
    });
  },
} satisfies ExportedHandler<Env>;
```

### Data Analysis Pipeline

```typescript
async function analyseData(env: Env, csvData: string) {
  const sandbox = getSandbox(env.Sandbox, 'data-analysis');

  // Write data to sandbox
  await sandbox.writeFile('/workspace/data.csv', csvData);

  // Write analysis script
  await sandbox.writeFile('/workspace/analyse.py', `
import pandas as pd
import json

df = pd.read_csv('/workspace/data.csv')

analysis = {
    'rows': len(df),
    'columns': list(df.columns),
    'summary': df.describe().to_dict(),
    'missing': df.isnull().sum().to_dict(),
}

print(json.dumps(analysis, indent=2, default=str))
  `);

  // Execute analysis
  const result = await sandbox.exec('python3 /workspace/analyse.py');

  return JSON.parse(result.stdout);
}
```

### Interactive REPL

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { code, language } = await request.json();

    const sandbox = getSandbox(env.Sandbox, 'repl');
    const interpreter = await sandbox.createInterpreter(language);

    const result = await interpreter.run(code);

    return Response.json({
      output: result.output,
      visualisations: result.visualisations, // Charts, tables, HTML
      error: result.error,
    });
  },
} satisfies ExportedHandler<Env>;
```

## Security Best Practices

### Resource Limits

```typescript
const sandbox = getSandbox(env.Sandbox, 'limited', {
  // Limit execution time
  timeout: 30000, // 30 seconds

  // Memory limits are handled by container isolation
});
```

### Input Validation

```typescript
// Validate user input before execution
function validateCode(code: string): boolean {
  // Block dangerous patterns
  const blocklist = [
    /import\s+os/,
    /import\s+subprocess/,
    /eval\s*\(/,
    /exec\s*\(/,
    /__import__/,
  ];

  return !blocklist.some(pattern => pattern.test(code));
}

// Usage
if (!validateCode(userCode)) {
  return Response.json({ error: 'Unsafe code detected' }, { status: 400 });
}
```

### Secrets Handling

```typescript
// Never pass secrets to sandbox directly
// Instead, use environment-specific configurations

// BAD - Don't do this
await sandbox.exec(`curl -H "Authorization: ${env.API_KEY}" ...`);

// GOOD - Proxy through your Worker
const data = await fetchWithAuth(env.API_KEY, url);
await sandbox.writeFile('/workspace/data.json', JSON.stringify(data));
await sandbox.exec('python3 process_data.py');
```

## Local Development

### Prerequisites

Ensure Docker is running locally for sandbox emulation:

```bash
# Start Docker daemon
docker info

# Start development server
npm run dev
```

### Testing Sandbox Code

```typescript
// In development, sandboxes run in local Docker containers
// No additional configuration needed

const sandbox = getSandbox(env.Sandbox, 'dev-sandbox');
const result = await sandbox.exec('python3 --version');
console.log(result.stdout); // "Python 3.11.x"
```

## Troubleshooting

### Sandbox Not Starting

```typescript
try {
  const sandbox = getSandbox(env.Sandbox, 'my-sandbox');
  await sandbox.exec('echo test');
} catch (error) {
  console.error('Sandbox error:', error);
  // Check: Docker running? Binding configured? Types generated?
}
```

### Command Timeout

```typescript
const result = await sandbox.exec('long-running-command', {
  timeout: 60000, // Increase timeout for long operations
});
```

### File Not Found

```typescript
// Always use absolute paths
await sandbox.writeFile('/workspace/file.txt', 'content');
const content = await sandbox.readFile('/workspace/file.txt');

// Check file exists before reading
if (await sandbox.exists('/workspace/file.txt')) {
  const content = await sandbox.readFile('/workspace/file.txt');
}
```

## Pricing and Limits

Sandbox SDK is currently in Beta with the following considerations:

- **Beta Access:** Available to all Cloudflare Workers users
- **Container Limits:** Resources are allocated per sandbox instance
- **Execution Time:** Default 30-second timeout, configurable up to 15 minutes
- **Concurrent Sandboxes:** Limits based on account tier

Check the [Cloudflare Sandbox pricing page](https://developers.cloudflare.com/sandbox/pricing/) for current limits and pricing.

## Additional Resources

- **Official Documentation:** [developers.cloudflare.com/sandbox](https://developers.cloudflare.com/sandbox/)
- **GitHub Repository:** [github.com/cloudflare/sandbox-sdk](https://github.com/cloudflare/sandbox-sdk)
- **Examples:** [github.com/cloudflare/sandbox-sdk/tree/main/examples](https://github.com/cloudflare/sandbox-sdk/tree/main/examples)
- **Changelog:** [developers.cloudflare.com/changelog](https://developers.cloudflare.com/changelog/)

---

For quick setup, use the `/setup-sandbox` slash command for interactive configuration.
