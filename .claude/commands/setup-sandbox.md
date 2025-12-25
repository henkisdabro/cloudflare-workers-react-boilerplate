# Setup Cloudflare Sandbox

You are helping the user set up Cloudflare Sandbox SDK in their project for secure, isolated code execution.

## What is Sandbox SDK?

The Sandbox SDK enables running untrusted code safely in isolated containers on Cloudflare's edge network. It's ideal for:

- **AI Agents** - Execute LLM-generated code safely
- **Code Interpreters** - Python/JavaScript REPLs with rich output
- **Data Analysis** - Run computational workloads securely
- **CI/CD Systems** - Isolated build and test environments

## Interactive Setup

Ask the user what they want to build:

1. **AI Code Execution** - Execute AI-generated code (Python, JavaScript, shell)
2. **Code Interpreter/REPL** - Interactive coding environment with rich outputs
3. **Data Analysis Pipeline** - Process and analyse data files
4. **Custom Sandbox Application** - Generic isolated code execution

## Setup Steps

### Step 1: Install Dependencies

```bash
npm install @cloudflare/sandbox
```

### Step 2: Update wrangler.jsonc

Add the Sandbox binding to the configuration:

```jsonc
{
  // ... existing config

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

### Step 3: Generate Types

```bash
npm run cf-typegen
```

### Step 4: Create Sandbox Utility

Create `worker/sandbox.ts`:

```typescript
import { getSandbox, type Sandbox } from '@cloudflare/sandbox';

interface Env {
  Sandbox: Sandbox;
}

export function createSandbox(env: Env, name: string) {
  return getSandbox(env.Sandbox, name, {
    timeout: 30000, // 30 seconds default
  });
}

export async function executeCode(
  env: Env,
  code: string,
  language: 'python' | 'javascript' | 'shell' = 'python'
): Promise<{ output: string; error: string; exitCode: number }> {
  const sandbox = createSandbox(env, `exec-${Date.now()}`);

  let command: string;
  let filename: string;

  switch (language) {
    case 'python':
      filename = '/workspace/script.py';
      await sandbox.writeFile(filename, code);
      command = `python3 ${filename}`;
      break;
    case 'javascript':
      filename = '/workspace/script.js';
      await sandbox.writeFile(filename, code);
      command = `node ${filename}`;
      break;
    case 'shell':
      filename = '/workspace/script.sh';
      await sandbox.writeFile(filename, code);
      command = `bash ${filename}`;
      break;
  }

  const result = await sandbox.exec(command);

  return {
    output: result.stdout,
    error: result.stderr,
    exitCode: result.exitCode,
  };
}
```

### Step 5: Add API Endpoint

Update `worker/index.ts` to include a sandbox endpoint:

```typescript
import { executeCode } from './sandbox';

// In your fetch handler:
if (url.pathname === '/api/sandbox/execute' && request.method === 'POST') {
  try {
    const { code, language } = await request.json();

    if (!code || typeof code !== 'string') {
      return Response.json({ error: 'Code is required' }, { status: 400 });
    }

    const result = await executeCode(env, code, language || 'python');

    return Response.json(result, { headers: securityHeaders });
  } catch (error) {
    console.error('Sandbox execution error:', error);
    return Response.json(
      { error: 'Execution failed' },
      { status: 500, headers: securityHeaders }
    );
  }
}
```

## Template Selection

Based on the user's choice, provide appropriate code:

### For AI Code Execution

Create `worker/ai-sandbox.ts`:

```typescript
import { getSandbox } from '@cloudflare/sandbox';
import Anthropic from '@anthropic-ai/sdk';

interface Env {
  Sandbox: Sandbox;
  ANTHROPIC_API_KEY: string;
}

export async function executeAICode(
  env: Env,
  prompt: string
): Promise<{ code: string; output: string; error?: string }> {
  const anthropic = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });

  // Get AI to generate code
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Write Python code to accomplish this task: ${prompt}

Return ONLY the Python code, no explanations or markdown. The code should print its results.`,
    }],
  });

  const code = response.content[0].type === 'text' ? response.content[0].text : '';

  // Execute in sandbox
  const sandbox = getSandbox(env.Sandbox, `ai-${Date.now()}`);
  await sandbox.writeFile('/workspace/script.py', code);
  const result = await sandbox.exec('python3 /workspace/script.py');

  return {
    code,
    output: result.stdout,
    error: result.stderr || undefined,
  };
}
```

### For Code Interpreter/REPL

Create `worker/interpreter.ts`:

```typescript
import { getSandbox } from '@cloudflare/sandbox';

interface Env {
  Sandbox: Sandbox;
}

interface InterpreterResult {
  output: string;
  visualisations?: string[]; // Base64 encoded images
  error?: string;
}

export async function runInterpreter(
  env: Env,
  code: string,
  language: 'python' | 'javascript'
): Promise<InterpreterResult> {
  const sandbox = getSandbox(env.Sandbox, 'repl');
  const interpreter = await sandbox.createInterpreter(language);

  const result = await interpreter.run(code);

  return {
    output: result.output,
    visualisations: result.visualisations,
    error: result.error,
  };
}
```

### For Data Analysis

Create `worker/data-analysis.ts`:

```typescript
import { getSandbox } from '@cloudflare/sandbox';

interface Env {
  Sandbox: Sandbox;
}

interface AnalysisResult {
  summary: Record<string, unknown>;
  charts?: string[]; // Base64 encoded chart images
}

export async function analyseCSV(
  env: Env,
  csvData: string
): Promise<AnalysisResult> {
  const sandbox = getSandbox(env.Sandbox, 'analysis');

  // Write data
  await sandbox.writeFile('/workspace/data.csv', csvData);

  // Write analysis script
  await sandbox.writeFile('/workspace/analyse.py', `
import pandas as pd
import matplotlib.pyplot as plt
import json
import base64
from io import BytesIO

# Read data
df = pd.read_csv('/workspace/data.csv')

# Generate summary
summary = {
    'rows': len(df),
    'columns': list(df.columns),
    'dtypes': df.dtypes.astype(str).to_dict(),
    'statistics': df.describe().to_dict(),
    'missing_values': df.isnull().sum().to_dict(),
}

# Generate chart for numeric columns
charts = []
numeric_cols = df.select_dtypes(include=['number']).columns[:4]  # First 4 numeric
if len(numeric_cols) > 0:
    fig, axes = plt.subplots(1, len(numeric_cols), figsize=(4*len(numeric_cols), 4))
    if len(numeric_cols) == 1:
        axes = [axes]
    for ax, col in zip(axes, numeric_cols):
        df[col].hist(ax=ax)
        ax.set_title(col)
    plt.tight_layout()
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    charts.append(base64.b64encode(buf.read()).decode())
    plt.close()

print(json.dumps({'summary': summary, 'charts': charts}, default=str))
  `);

  const result = await sandbox.exec('python3 /workspace/analyse.py');
  const parsed = JSON.parse(result.stdout);

  return {
    summary: parsed.summary,
    charts: parsed.charts,
  };
}
```

## Testing

After setup, test the sandbox:

```bash
# Start development server
npm run dev

# Test execution (in another terminal)
curl -X POST http://localhost:5173/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(2 + 2)", "language": "python"}'
```

## Security Considerations

1. **Never pass secrets to sandbox** - Proxy authenticated requests through your Worker
2. **Validate user input** - Check for dangerous patterns before execution
3. **Set appropriate timeouts** - Prevent runaway processes
4. **Monitor usage** - Track sandbox usage for cost management

## Documentation

For comprehensive documentation, see:
- **[SANDBOX.md](../SANDBOX.md)** - Full Sandbox SDK guide
- **[Official Docs](https://developers.cloudflare.com/sandbox/)** - Cloudflare Sandbox documentation
- **[Examples](https://github.com/cloudflare/sandbox-sdk/tree/main/examples)** - Official examples

## Proceed with Setup

Now help the user by:

1. Asking which type of sandbox application they want to build
2. Walking through the installation steps
3. Generating the appropriate code for their use case
4. Testing the implementation
5. Providing guidance on security best practices
