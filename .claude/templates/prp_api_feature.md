# Product Requirement Plan: [API Feature Name]

> **Template Type**: API Feature PRP
>
> This template extends `prp_base.md` with API-specific sections.
> Use this for features involving REST APIs, GraphQL, or other API endpoints.

## Metadata

- **Feature**: [Feature name]
- **API Type**: [REST / GraphQL / Other]
- **Target Completion**: [Timeline estimate]
- **Confidence Score**: [1-10] - Likelihood of one-pass implementation success
- **Created**: [Date]

## Executive Summary

[2-3 sentences describing what this API feature does and why it's valuable]

## API Design

### API Style

**Chosen Style**: [REST / GraphQL / RPC / Other]

**Rationale**:
- [Why this style was chosen]
- [What alternatives were considered]
- [Key factors in the decision]

### API Principles

**Design Principles**:
- ✅ **RESTful** (if REST): Follow REST constraints
- ✅ **Consistent**: Uniform naming and response structure
- ✅ **Versioned**: Support for API versioning
- ✅ **Documented**: Clear documentation and examples
- ✅ **Discoverable**: Self-documenting where possible
- ✅ **Secure**: Authentication and authorization
- ✅ **Performant**: Fast response times, caching

### Base URL

**Development**: `http://localhost:5173/api`

**Production**: `https://your-worker.workers.dev/api`

**Version Prefix** (if versioned): `/api/v1`, `/api/v2`, etc.

## Endpoint Specification

### Endpoint 1: [Endpoint Name]

**HTTP Method**: [GET / POST / PUT / PATCH / DELETE]

**Path**: `/api/[resource]` or `/api/[resource]/:id`

**Purpose**: [What this endpoint does]

**Authentication**: [Required / Optional / None]

**Rate Limit**: [Requests per time window]

**Request**:

*Path Parameters*:
- `id` (string, required): [Description]

*Query Parameters*:
- `limit` (number, optional): [Description, default value]
- `offset` (number, optional): [Description, default value]
- `filter` (string, optional): [Description]
- `sort` (string, optional): [Description]

*Headers*:
- `Authorization: Bearer <token>` (if authenticated)
- `Content-Type: application/json`

*Body* (for POST/PUT/PATCH):
```json
{
  "field1": "value1",
  "field2": 123,
  "nested": {
    "field3": true
  }
}
```

**Response**:

*Success (200/201)*:
```json
{
  "success": true,
  "data": {
    "id": "123",
    "field1": "value1",
    "createdAt": "2025-11-09T12:00:00.000Z"
  }
}
```

*Error (400/401/404/500)*:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  }
}
```

**Status Codes**:
- `200 OK`: Success (GET/PUT/PATCH/DELETE)
- `201 Created`: Success (POST)
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (duplicate, etc.)
- `422 Unprocessable Entity`: Validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Examples**:

*Create Request*:
```bash
curl -X POST https://api.example.com/api/resource \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"field1": "value1"}'
```

*Success Response*:
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "field1": "value1"
  }
}
```

### Endpoint 2: [Endpoint Name]

[Repeat endpoint specification for each endpoint]

## Request/Response Schemas

### Request Schemas

#### Create[Resource]Request

```typescript
interface Create[Resource]Request {
  field1: string;           // Required, 1-100 characters
  field2: number;           // Required, positive integer
  field3?: boolean;         // Optional, defaults to false
  nested?: {
    field4: string;         // Required if nested provided
  };
}
```

**Validation Rules**:
- `field1`: Required, 1-100 characters, alphanumeric
- `field2`: Required, positive integer, max 1000
- `field3`: Optional boolean
- `nested.field4`: Required if parent provided, email format

#### Update[Resource]Request

```typescript
interface Update[Resource]Request {
  field1?: string;          // Optional, 1-100 characters
  field2?: number;          // Optional, positive integer
}
```

**Validation Rules**:
- At least one field must be provided
- Same validation as create for provided fields

### Response Schemas

#### [Resource]Response

```typescript
interface [Resource]Response {
  success: true;
  data: [Resource];
}

interface [Resource] {
  id: string;
  field1: string;
  field2: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### [Resource]ListResponse

```typescript
interface [Resource]ListResponse {
  success: true;
  data: [Resource][];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

### Error Response Format

**Standard Error Structure**:
```typescript
interface ErrorResponse {
  success: false;
  error: ErrorCode;         // Machine-readable error code
  message: string;          // Human-readable message
  details?: Record<string, unknown>;  // Additional context
  timestamp?: string;       // ISO timestamp
  requestId?: string;       // For debugging
}
```

**Error Codes**:
```typescript
type ErrorCode =
  | 'VALIDATION_ERROR'      // 400 - Invalid input
  | 'UNAUTHORIZED'          // 401 - Auth required
  | 'FORBIDDEN'             // 403 - Insufficient permissions
  | 'NOT_FOUND'             // 404 - Resource not found
  | 'CONFLICT'              // 409 - Resource conflict
  | 'RATE_LIMIT_EXCEEDED'   // 429 - Too many requests
  | 'SERVER_ERROR';         // 500 - Internal error
```

**Error Examples**:

*Validation Error (400)*:
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": {
    "field1": "Required field missing",
    "field2": "Must be a positive integer"
  }
}
```

*Not Found (404)*:
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

*Rate Limit (429)*:
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "details": {
    "retryAfter": 60
  }
}
```

## Rate Limiting

### Rate Limit Strategy

**Global Rate Limits**:
- All endpoints: 1000 requests per 15 minutes per IP
- Authenticated: 5000 requests per 15 minutes per user

**Per-Endpoint Limits**:

| Endpoint | Authenticated | Unauthenticated | Window |
|----------|---------------|-----------------|--------|
| GET /api/resource | 100/min | 20/min | 1 minute |
| POST /api/resource | 50/min | 10/min | 1 minute |
| DELETE /api/resource/:id | 20/min | N/A | 1 minute |

### Rate Limit Headers

**Response Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800
```

**On Rate Limit Exceeded**:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699564800
```

### Implementation

```typescript
async function checkRateLimit(
  env: Env,
  identifier: string,  // IP or user ID
  endpoint: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${identifier}:${endpoint}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const resetAt = windowStart + windowSeconds;

  const current = await env.KV.get(key);
  const count = current ? parseInt(current) : 0;

  if (count >= limit) {
    return { allowed: false, remaining: 0, resetAt };
  }

  await env.KV.put(key, String(count + 1), {
    expirationTtl: windowSeconds,
  });

  return { allowed: true, remaining: limit - count - 1, resetAt };
}
```

## Caching Strategy

### Cache Layers

**Edge Caching** (Cloudflare):
- Static responses (rarely changing data)
- Cache-Control headers
- Purge on updates

**KV Caching**:
- Computed results
- Database query results
- TTL-based expiration

**Client Caching**:
- Browser cache via headers
- ETags for conditional requests

### Caching Rules

| Endpoint | Cacheable | TTL | Invalidation |
|----------|-----------|-----|--------------|
| GET /api/resource | Yes | 5 min | On POST/PUT/DELETE |
| GET /api/resource/:id | Yes | 15 min | On PUT/DELETE of resource |
| POST /api/resource | No | N/A | N/A |

### Cache Headers

**For Cacheable Responses**:
```
Cache-Control: public, max-age=300, s-maxage=300
ETag: "abc123"
Last-Modified: Wed, 09 Nov 2025 12:00:00 GMT
```

**For Non-Cacheable Responses**:
```
Cache-Control: no-store, no-cache, must-revalidate
```

### Cache Invalidation

**Strategies**:
1. **Time-based**: Automatic expiration via TTL
2. **Event-based**: Purge on data mutations
3. **Manual**: Explicit cache clear endpoint

**Implementation**:
```typescript
async function invalidateCache(env: Env, resourceId: string) {
  // Clear KV cache
  await env.KV.delete(`cache:resource:${resourceId}`);
  await env.KV.delete(`cache:resource:list`);

  // Optionally: Purge Cloudflare cache
  // await purgeCloudflareCache(['/api/resource', `/api/resource/${resourceId}`]);
}
```

## API Versioning

### Versioning Strategy

**Chosen Strategy**: [URL Path / Header / Query Parameter / Content Negotiation]

**Example**: URL Path - `/api/v1/resource`, `/api/v2/resource`

**Rationale**:
- [Why this strategy was chosen]
- [How breaking changes are handled]
- [Deprecation policy]

### Version Lifecycle

**Current Version**: v1

**Supported Versions**: v1

**Deprecated Versions**: None

**Deprecation Policy**:
1. Announce deprecation 6 months in advance
2. Mark as deprecated in documentation
3. Add deprecation headers
4. Sunset version after 12 months

**Deprecation Headers**:
```
Sunset: Wed, 09 May 2026 12:00:00 GMT
Deprecation: true
Link: <https://docs.example.com/api/v2>; rel="successor-version"
```

### Breaking Changes

**What Constitutes a Breaking Change**:
- Removing an endpoint
- Removing a required field
- Changing field types
- Changing response structure
- Changing authentication requirements

**What is NOT Breaking**:
- Adding a new endpoint
- Adding optional fields
- Adding new error codes
- Deprecating (but not removing) a field

### Version Migration

**Migration Guide**: Provide docs showing:
- What changed between versions
- Code examples for migration
- Timeline for deprecation

## OpenAPI/Swagger Documentation

### OpenAPI Specification

**Format**: OpenAPI 3.0.x

**Location**: `openapi.yaml` or `openapi.json`

**Structure**:
```yaml
openapi: 3.0.0
info:
  title: [API Name]
  version: 1.0.0
  description: [API Description]

servers:
  - url: https://api.example.com/api/v1
    description: Production
  - url: http://localhost:5173/api/v1
    description: Development

paths:
  /resource:
    get:
      summary: List resources
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResourceListResponse'

components:
  schemas:
    Resource:
      type: object
      properties:
        id:
          type: string
        field1:
          type: string
```

### Documentation Tools

**Tools to Generate Docs**:
- Swagger UI (interactive documentation)
- Redoc (clean, readable docs)
- Postman collection export

**Auto-Generated**:
- TypeScript types → OpenAPI schema
- JSDoc comments → API descriptions

## Pagination

### Pagination Strategy

**Type**: [Offset-based / Cursor-based / Page-based]

**Chosen**: Offset-based (for simplicity)

### Offset-Based Pagination

**Query Parameters**:
- `limit`: Number of items per page (default: 50, max: 100)
- `offset`: Number of items to skip (default: 0)

**Request**:
```
GET /api/resource?limit=20&offset=40
```

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "hasMore": true
  }
}
```

**Links** (optional - HATEOAS):
```json
{
  "links": {
    "first": "/api/resource?limit=20&offset=0",
    "prev": "/api/resource?limit=20&offset=20",
    "next": "/api/resource?limit=20&offset=60",
    "last": "/api/resource?limit=20&offset=140"
  }
}
```

### Cursor-Based Pagination (for large datasets)

**Better for**: Large datasets, realtime data, performance

**Query Parameters**:
- `limit`: Number of items per page
- `cursor`: Opaque cursor string

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "nextCursor": "abc123...",
    "hasMore": true
  }
}
```

## Filtering and Sorting

### Filtering

**Query Parameter Format**:
```
?filter[field]=value
?filter[field][operator]=value
```

**Examples**:
```
GET /api/resource?filter[status]=active
GET /api/resource?filter[createdAt][gte]=2025-01-01
GET /api/resource?filter[name][contains]=john
```

**Supported Operators**:
- `eq`: Equals (default if no operator)
- `ne`: Not equals
- `gt`: Greater than
- `gte`: Greater than or equal
- `lt`: Less than
- `lte`: Less than or equal
- `contains`: String contains (case-insensitive)
- `in`: In array

### Sorting

**Query Parameter Format**:
```
?sort=field
?sort=-field (descending)
?sort=field1,-field2 (multiple fields)
```

**Examples**:
```
GET /api/resource?sort=createdAt       # Ascending
GET /api/resource?sort=-createdAt      # Descending
GET /api/resource?sort=status,-createdAt
```

**Default Sort**: Usually by `createdAt` descending

## Research Findings

### Codebase Analysis

#### Similar Patterns Found

- **Pattern**: [Pattern name]
  - **Location**: `path/to/file.ts:line`
  - **Description**: [What this pattern does]
  - **Relevance**: [Why this is useful for the current feature]

#### Existing API Patterns

- **Pattern**: [Existing API pattern]
  - **Example**: [Code snippet or file reference]
  - **Application**: [How to apply this to the new feature]

### External Research

#### Documentation References

- **Resource**: [REST API Best Practices]
  - **URL**: [Specific URL]
  - **Key Sections**: [Relevant sections]
  - **Gotchas**: [Known issues]

#### Best Practices

- **Practice**: Consistent Response Structure
  - **Why**: Easier for clients to parse
  - **How**: Always use `{ success, data/error, message }` format
  - **Warning**: Don't change response structure between versions

- **Practice**: Proper HTTP Status Codes
  - **Why**: Clients can handle errors appropriately
  - **How**: Use semantic status codes (200, 201, 400, 404, etc.)
  - **Warning**: Don't use 200 for errors

- **Practice**: Input Validation
  - **Why**: Prevent invalid data and attacks
  - **How**: Validate on server-side, return detailed errors
  - **Warning**: Don't trust client-side validation alone

## Technical Specification

### Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │  HTTP   │    Worker    │  Query  │   Storage   │
│  (React/    │ ───────>│  API Handler │ ───────>│  (D1/KV)    │
│   Mobile)   │  JSON   │              │  Data   │             │
│             │<─────── │              │<─────── │             │
└─────────────┘         └──────────────┘         └─────────────┘
                                │
                                │ Cache Check
                                ▼
                        ┌──────────────┐
                        │   KV Cache   │
                        └──────────────┘
```

### Component Breakdown

#### Component 1: Request Validator

- **Purpose**: Validate and sanitize incoming requests
- **Location**: `path/to/validator.ts`
- **Dependencies**: TypeScript types, validation library
- **Interface**: `validate<T>(data, schema): T | ValidationError`

#### Component 2: API Router

- **Purpose**: Route requests to appropriate handlers
- **Location**: `path/to/router.ts`
- **Dependencies**: Worker fetch handler
- **Interface**: `route(request, env): Promise<Response>`

#### Component 3: Response Builder

- **Purpose**: Build consistent API responses
- **Location**: `path/to/response.ts`
- **Dependencies**: TypeScript types
- **Interface**: `success(data)`, `error(code, message)`

### Data Models

[See Request/Response Schemas section above]

## Implementation Blueprint

### Prerequisites

1. [API design approved]
2. [TypeScript types defined]
3. [Database schema created (if needed)]
4. [Authentication implemented (if needed)]

### Implementation Steps

#### Step 1: Define API Specification

**Goal**: Document all endpoints and schemas

**Files to Create/Modify**:
- `openapi.yaml` - OpenAPI specification
- `types/api.ts` - TypeScript types

**Validation**: Specification is complete and consistent

#### Step 2: Implement Request Validation

**Goal**: Validate all incoming requests

**Files to Create/Modify**:
- `lib/validation.ts` - Validation utilities

**Pseudocode Approach**:
```typescript
function validateRequest<T>(data: unknown, schema: Schema): T {
  // 1. Check types
  // 2. Validate constraints
  // 3. Sanitize input
  // 4. Return typed data or throw ValidationError
}
```

**Validation**: Validation catches invalid inputs

#### Step 3: Implement Response Builders

**Goal**: Standardize API responses

**Files to Create/Modify**:
- `lib/response.ts` - Response utilities

**Pseudocode Approach**:
```typescript
function successResponse<T>(data: T): Response {
  return Response.json({ success: true, data });
}

function errorResponse(code: ErrorCode, message: string): Response {
  return Response.json({ success: false, error: code, message }, { status });
}
```

**Validation**: Responses have consistent structure

#### Step 4: Implement API Endpoints

**Goal**: Create all endpoint handlers

**Files to Create/Modify**:
- `api/[resource].ts` - Endpoint handlers

**Reference Pattern**: See `examples/database/d1-contact-form/worker-endpoint.ts`

**Validation**: All endpoints work correctly

#### Step 5: Implement Rate Limiting

**Goal**: Protect API from abuse

**Files to Create/Modify**:
- `middleware/rate-limit.ts` - Rate limiting logic

**Validation**: Excessive requests are blocked

#### Step 6: Implement Caching

**Goal**: Improve performance

**Files to Create/Modify**:
- `middleware/cache.ts` - Caching logic

**Validation**: Cached responses are served correctly

#### Step 7: Create API Documentation

**Goal**: Document API for consumers

**Files to Create/Modify**:
- `docs/api.md` - API documentation
- `openapi.yaml` - OpenAPI spec

**Validation**: Documentation is complete and accurate

### Error Handling Strategy

- **Validation Errors**: Return 400 with field-specific errors
- **Authentication Errors**: Return 401 with generic message
- **Authorization Errors**: Return 403 with permission issue
- **Not Found Errors**: Return 404 with resource type
- **Rate Limit Errors**: Return 429 with retry-after
- **Server Errors**: Log details, return 500 with generic message

## Testing Strategy

### Unit Tests

- **Coverage Target**: 80%+ for API handlers
- **Key Test Cases**:
  - Request validation (valid and invalid)
  - Response formatting
  - Error handling
  - Business logic

### Integration Tests

- **Test Scenarios**:
  - Complete API flows
  - Error conditions
  - Rate limiting
  - Caching behavior
  - Authentication/authorization

### API Testing Checklist

- [ ] All endpoints return correct status codes
- [ ] Response schemas match specification
- [ ] Validation rejects invalid inputs
- [ ] Rate limiting works correctly
- [ ] Caching improves performance
- [ ] Error messages are helpful but not revealing
- [ ] Authentication is enforced where required
- [ ] CORS headers are correct (if applicable)

## Validation Gates

### Pre-Implementation

```bash
# Validate OpenAPI spec
npx swagger-cli validate openapi.yaml
```

### Post-Implementation

```bash
# Test all endpoints
npm run test:api

# Generate API docs
npx swagger-ui-watcher openapi.yaml

# Test rate limiting
for i in {1..100}; do curl /api/endpoint; done
```

## Dependencies

[List any API-related dependencies: validation libraries, OpenAPI tools, etc.]

## Success Criteria

- [ ] All endpoints implemented and working
- [ ] Request/response schemas validated
- [ ] Rate limiting functional
- [ ] Caching improves performance
- [ ] Error handling comprehensive
- [ ] API documentation complete
- [ ] OpenAPI specification accurate
- [ ] Tests pass (unit, integration, manual)

## References

- [REST API Best Practices](https://restfulapi.net/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [API Design Patterns](https://cloud.google.com/apis/design/patterns)
