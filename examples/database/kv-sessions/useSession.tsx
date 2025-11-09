/**
 * useSession Hook
 *
 * Custom React hook to access session context.
 * Provides authentication state and methods.
 *
 * Usage:
 * import { useSession } from './examples/database/kv-sessions/useSession';
 *
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useSession();
 *
 *   if (!isAuthenticated) {
 *     return <LoginForm onLogin={login} />;
 *   }
 *
 *   return <div>Hello, {user.name}!</div>;
 * }
 */

/* eslint-disable react-refresh/only-export-components */
import { useContext } from 'react';
import { SessionContext } from './SessionProvider';

export function useSession() {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }

  return context;
}

/**
 * Example: Login Form Component
 * Demonstrates how to use the useSession hook
 */
import { useState, FormEvent } from 'react';

export function LoginForm() {
  const { login, isLoading, error } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await login(email, password);
      // Login successful - SessionProvider will update state
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            disabled={isLoading}
          />
        </div>

        {(error || localError) && (
          <div
            style={{
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
            }}
          >
            {error || localError}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <strong>Demo Credentials:</strong>
        <br />
        Email: demo@example.com
        <br />
        Password: password123
      </div>
    </div>
  );
}

/**
 * Example: Protected Component
 * Demonstrates how to protect a component with authentication
 */
export function ProtectedComponent() {
  const { user, logout, isLoading } = useSession();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Protected Content</h2>
      <div style={{ marginBottom: '20px' }}>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>User ID:</strong> {user.id}
        </p>
        <p>
          <strong>Member Since:</strong> {user.createdAt.toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={logout}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}

/**
 * Example: Conditional Rendering Based on Auth
 */
export function AuthExample() {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return isAuthenticated ? <ProtectedComponent /> : <LoginForm />;
}
