/**
 * KV Session API Endpoints
 *
 * This file contains API endpoint handlers for session management.
 * Integrate these into your worker/index.ts file.
 *
 * Prerequisites:
 * 1. KV namespace configured in wrangler.jsonc as:
 *    [[kv_namespaces]]
 *    binding = "SESSIONS"
 *    id = "your-namespace-id"
 *
 * NOTE: This is a simplified example. In production:
 * - Use proper password hashing (bcrypt, scrypt)
 * - Store users in a database (D1)
 * - Implement proper authentication logic
 * - Add rate limiting
 * - Add CSRF protection
 */

import type {
  LoginRequest,
  SessionResponse,
  LogoutResponse,
  ErrorResponse,
  Session,
} from './types';
import { validateLoginRequest } from './types';
import { SessionManager } from './worker-middleware';

// Mock user database (replace with D1 in production)
const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'password123', // In production: use hashed passwords!
    name: 'Demo User',
  },
];

/**
 * POST /api/auth/login - Create a session
 */
export async function login(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    if (!validateLoginRequest(body)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid email or password format',
      };
      return Response.json(errorResponse, { status: 400 });
    }

    const { email, password } = body;

    // Find user (in production: query D1 database)
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      };
      return Response.json(errorResponse, { status: 401 });
    }

    // Create session
    const sessionManager = new SessionManager(env.SESSIONS);
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 60 * 60 * 24 * 7); // 7 days

    const session: Session = await sessionManager.createSession({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date(),
      },
      expiresAt,
    });

    // Create response with session cookie
    const response: SessionResponse = {
      success: true,
      data: session,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': sessionManager.createSessionCookie(session.sessionId),
      },
    });
  } catch (error) {
    console.error('Error during login:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred during login',
    };

    return Response.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/auth/logout - Destroy session
 */
export async function logout(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const sessionManager = new SessionManager(env.SESSIONS);
    const sessionId = sessionManager.getSessionIdFromRequest(request);

    if (sessionId) {
      await sessionManager.deleteSession(sessionId);
    }

    const response: LogoutResponse = {
      success: true,
      message: 'Logged out successfully',
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': sessionManager.createDeleteCookie(),
      },
    });
  } catch (error) {
    console.error('Error during logout:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred during logout',
    };

    return Response.json(errorResponse, { status: 500 });
  }
}

/**
 * GET /api/auth/session - Get current session
 */
export async function getSession(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const sessionManager = new SessionManager(env.SESSIONS);
    const session = await sessionManager.getSessionFromRequest(request);

    if (!session) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'NO_SESSION',
        message: 'No active session',
      };
      return Response.json(errorResponse, { status: 401 });
    }

    const response: SessionResponse = {
      success: true,
      data: session,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error getting session:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while fetching session',
    };

    return Response.json(errorResponse, { status: 500 });
  }
}

/**
 * Router function to handle all auth-related requests
 * Add this to your worker/index.ts fetch handler:
 *
 * Example integration:
 *
 * import { handleAuthRequest } from './examples/database/kv-sessions/worker-endpoints';
 *
 * export default {
 *   async fetch(request, env) {
 *     const url = new URL(request.url);
 *
 *     // Handle auth API routes
 *     if (url.pathname.startsWith('/api/auth')) {
 *       return handleAuthRequest(request, env);
 *     }
 *
 *     // ... other routes
 *   }
 * }
 */
export async function handleAuthRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // POST /api/auth/login - Login
  if (path === '/api/auth/login' && method === 'POST') {
    return login(request, env);
  }

  // POST /api/auth/logout - Logout
  if (path === '/api/auth/logout' && method === 'POST') {
    return logout(request, env);
  }

  // GET /api/auth/session - Get session
  if (path === '/api/auth/session' && method === 'GET') {
    return getSession(request, env);
  }

  // Method not allowed
  const errorResponse: ErrorResponse = {
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed for this endpoint',
  };

  return Response.json(errorResponse, { status: 405 });
}

/**
 * Example protected endpoint
 * Demonstrates how to use session authentication
 */
export async function protectedEndpoint(
  request: Request,
  env: Env
): Promise<Response> {
  const sessionManager = new SessionManager(env.SESSIONS);
  const session = await sessionManager.getSessionFromRequest(request);

  if (!session) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required',
    };
    return Response.json(errorResponse, { status: 401 });
  }

  // User is authenticated, return protected data
  return Response.json({
    success: true,
    message: `Hello, ${session.user.name}!`,
    user: session.user,
  });
}
