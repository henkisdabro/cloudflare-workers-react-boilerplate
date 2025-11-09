/**
 * Session Provider Component
 *
 * Provides session context to the entire React application.
 * Manages authentication state and provides login/logout functions.
 *
 * Usage:
 * import { SessionProvider } from './examples/database/kv-sessions/SessionProvider';
 *
 * function App() {
 *   return (
 *     <SessionProvider>
 *       <YourApp />
 *     </SessionProvider>
 *   );
 * }
 */

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { Session, User, SessionResponse, ErrorResponse } from './types';

interface SessionContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  error: string | null;
}

export const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current session on mount
  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include', // Important: include cookies
      });

      if (response.status === 401) {
        // No active session
        setSession(null);
        return;
      }

      const data: SessionResponse | ErrorResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Convert date strings to Date objects
      const sessionWithDates: Session = {
        ...data.data,
        user: {
          ...data.data.user,
          createdAt: new Date(data.data.user.createdAt),
        },
        expiresAt: new Date(data.data.expiresAt),
      };

      setSession(sessionWithDates);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch session');
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ email, password }),
      });

      const data: SessionResponse | ErrorResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Convert date strings to Date objects
      const sessionWithDates: Session = {
        ...data.data,
        user: {
          ...data.data.user,
          createdAt: new Date(data.data.user.createdAt),
        },
        expiresAt: new Date(data.data.expiresAt),
      };

      setSession(sessionWithDates);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important: include cookies
      });

      setSession(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
      // Clear session anyway on logout error
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    await fetchSession();
  };

  const value: SessionContextValue = {
    session,
    user: session?.user || null,
    isLoading,
    isAuthenticated: !!session,
    login,
    logout,
    refreshSession,
    error,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
