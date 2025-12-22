/**
 * Cloudflare Worker Entry Point
 *
 * This worker handles API routes and applies security headers.
 * Static assets are served by the Cloudflare Vite plugin with SPA mode.
 */

/**
 * Security headers applied to all API responses.
 * Adjust these based on your application's requirements.
 */
const securityHeaders: Record<string, string> = {
  // Content Security Policy - adjust as needed for your app
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Enable XSS filter in older browsers
  'X-XSS-Protection': '1; mode=block',
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Restrict browser features
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

/**
 * Apply security headers to a response
 */
function withSecurityHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers)
  for (const [key, value] of Object.entries(securityHeaders)) {
    newHeaders.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}

/**
 * Health check response type
 */
interface HealthCheckResponse {
  status: 'healthy'
  timestamp: string
  version: string
}

/**
 * Handle health check requests
 */
function handleHealthCheck(): Response {
  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }
  return Response.json(response)
}

/**
 * Main fetch handler
 */
export default {
  fetch(request: Request): Response {
    const url = new URL(request.url)

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return withSecurityHeaders(handleHealthCheck())
    }

    // Example API endpoint
    if (url.pathname.startsWith('/api/')) {
      const response = Response.json({
        name: 'Cloudflare',
      })
      return withSecurityHeaders(response)
    }

    // Return 404 for unmatched routes
    // Static assets are handled by the Cloudflare Vite plugin
    return new Response(null, { status: 404 })
  },
} satisfies ExportedHandler<Env>
