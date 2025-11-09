/**
 * Types for KV Session Management Example
 */

// User data stored in session
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Session data stored in KV
export interface SessionData {
  userId: string;
  email: string;
  name: string;
  createdAt: string; // ISO string for JSON serialization
  expiresAt: string;
}

// Session object returned to client
export interface Session {
  sessionId: string;
  user: User;
  expiresAt: Date;
}

// Request body for login
export interface LoginRequest {
  email: string;
  password: string;
}

// API Response types
export interface SessionResponse {
  success: true;
  data: Session;
}

export interface LogoutResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

export type ApiResponse = SessionResponse | LogoutResponse | ErrorResponse;

// Session configuration
export interface SessionConfig {
  cookieName: string;
  sessionTTL: number; // Time to live in seconds
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
  };
}

// Default session configuration
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  cookieName: 'session_id',
  sessionTTL: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  },
};

// Helper functions
export function serializeSessionData(session: Session): SessionData {
  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    createdAt: session.user.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
  };
}

export function deserializeSessionData(
  sessionId: string,
  data: SessionData
): Session {
  return {
    sessionId,
    user: {
      id: data.userId,
      email: data.email,
      name: data.name,
      createdAt: new Date(data.createdAt),
    },
    expiresAt: new Date(data.expiresAt),
  };
}

// Cookie helpers
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
    return cookies;
  }, {} as Record<string, string>);
}

export function serializeCookie(
  name: string,
  value: string,
  options: SessionConfig['cookieOptions'] & { maxAge?: number }
): string {
  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options.maxAge) {
    cookie += `; Max-Age=${options.maxAge}`;
  }

  if (options.path) {
    cookie += `; Path=${options.path}`;
  }

  if (options.httpOnly) {
    cookie += '; HttpOnly';
  }

  if (options.secure) {
    cookie += '; Secure';
  }

  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1)}`;
  }

  return cookie;
}

// Generate secure session ID
export function generateSessionId(): string {
  // In a real application, use crypto.randomUUID() or similar
  // This is a simple example
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Validation
export function validateLoginRequest(data: unknown): data is LoginRequest {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.email === 'string' &&
    obj.email.includes('@') &&
    obj.email.length <= 255 &&
    typeof obj.password === 'string' &&
    obj.password.length >= 6 &&
    obj.password.length <= 100
  );
}
