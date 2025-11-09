/**
 * KV Session Middleware
 *
 * Provides session management functionality using Cloudflare KV.
 * Handles session creation, validation, retrieval, and destruction.
 *
 * Prerequisites:
 * 1. KV namespace configured in wrangler.jsonc as:
 *    [[kv_namespaces]]
 *    binding = "SESSIONS"
 *    id = "your-namespace-id"
 */

import type {
  Session,
  SessionData,
  SessionConfig,
} from './types';
import {
  DEFAULT_SESSION_CONFIG,
  parseCookies,
  serializeCookie,
  generateSessionId,
  serializeSessionData,
  deserializeSessionData,
} from './types';

export class SessionManager {
  private kv: KVNamespace;
  private config: SessionConfig;

  constructor(kv: KVNamespace, config: Partial<SessionConfig> = {}) {
    this.kv = kv;
    this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
  }

  /**
   * Get session ID from request cookies
   */
  getSessionIdFromRequest(request: Request): string | null {
    const cookieHeader = request.headers.get('Cookie');
    const cookies = parseCookies(cookieHeader);
    return cookies[this.config.cookieName] || null;
  }

  /**
   * Get session from KV by session ID
   */
  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const data = await this.kv.get<SessionData>(
        `session:${sessionId}`,
        'json'
      );

      if (!data) {
        return null;
      }

      // Check if session is expired
      const expiresAt = new Date(data.expiresAt);
      if (expiresAt < new Date()) {
        // Session expired, delete it
        await this.deleteSession(sessionId);
        return null;
      }

      return deserializeSessionData(sessionId, data);
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Get session from request
   */
  async getSessionFromRequest(request: Request): Promise<Session | null> {
    const sessionId = this.getSessionIdFromRequest(request);
    if (!sessionId) {
      return null;
    }

    return this.getSession(sessionId);
  }

  /**
   * Create a new session
   */
  async createSession(session: Omit<Session, 'sessionId'>): Promise<Session> {
    const sessionId = generateSessionId();
    const newSession: Session = {
      sessionId,
      ...session,
    };

    const sessionData = serializeSessionData(newSession);

    // Store in KV with TTL
    await this.kv.put(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      {
        expirationTtl: this.config.sessionTTL,
      }
    );

    return newSession;
  }

  /**
   * Update an existing session
   */
  async updateSession(sessionId: string, session: Session): Promise<void> {
    const sessionData = serializeSessionData(session);

    await this.kv.put(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      {
        expirationTtl: this.config.sessionTTL,
      }
    );
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.kv.delete(`session:${sessionId}`);
  }

  /**
   * Create session cookie header
   */
  createSessionCookie(sessionId: string): string {
    return serializeCookie(this.config.cookieName, sessionId, {
      ...this.config.cookieOptions,
      maxAge: this.config.sessionTTL,
    });
  }

  /**
   * Create delete cookie header (for logout)
   */
  createDeleteCookie(): string {
    return serializeCookie(this.config.cookieName, '', {
      ...this.config.cookieOptions,
      maxAge: 0,
    });
  }

  /**
   * Middleware function to attach session to request
   * Use this pattern in your worker:
   *
   * const sessionManager = new SessionManager(env.SESSIONS);
   * const session = await sessionManager.getSessionFromRequest(request);
   * if (!session) {
   *   return Response.json({ error: 'Unauthorized' }, { status: 401 });
   * }
   */
}

/**
 * Helper function to require authentication
 * Returns session if valid, otherwise returns an error response
 */
export async function requireAuth(
  request: Request,
  sessionManager: SessionManager
): Promise<{ session: Session } | { error: Response }> {
  const session = await sessionManager.getSessionFromRequest(request);

  if (!session) {
    return {
      error: Response.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        { status: 401 }
      ),
    };
  }

  return { session };
}

/**
 * Helper function to get optional session
 * Returns session if valid, null otherwise (no error)
 */
export async function getOptionalSession(
  request: Request,
  sessionManager: SessionManager
): Promise<Session | null> {
  return sessionManager.getSessionFromRequest(request);
}
