# Product Requirement Plan: [Database Feature Name]

> **Template Type**: Database Feature PRP
>
> This template extends `prp_base.md` with database-specific sections.
> Use this for features involving D1, KV, or other data storage.

## Metadata

- **Feature**: [Feature name]
- **Storage Type**: [D1 / KV / D1 + KV / Other]
- **Target Completion**: [Timeline estimate]
- **Confidence Score**: [1-10] - Likelihood of one-pass implementation success
- **Created**: [Date]

## Executive Summary

[2-3 sentences describing what this feature does and why it's valuable]

## Database Schema Design

### Storage Decision

**Chosen Storage**: [D1 / KV / Both]

**Rationale**:
- [Why this storage type was chosen]
- [What alternatives were considered]
- [Key factors in the decision]

### Data Models

#### D1 Schema (if applicable)

```sql
-- Table definitions
CREATE TABLE [table_name] (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- columns...
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_[table]_[column] ON [table]([column]);

-- Triggers (if needed)
CREATE TRIGGER update_[table]_timestamp
AFTER UPDATE ON [table]
FOR EACH ROW
BEGIN
  UPDATE [table] SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
```

**Schema Decisions**:
- **Field**: [column_name]
  - **Type**: [data type]
  - **Constraints**: [NOT NULL, UNIQUE, etc.]
  - **Rationale**: [Why this design choice]

#### KV Schema (if applicable)

**Key Patterns**:
```
[namespace]:[entity_type]:[id]
```

**Example Keys**:
- `session:user:abc123` - User session data
- `cache:product:456` - Product cache
- `config:feature:dark_mode` - Feature flag

**Value Structure**:
```typescript
interface [StoredData] {
  // value structure
}
```

**TTL Strategy**:
- [Entity type]: [TTL duration] - [Rationale]

### Entity Relationships

[Describe relationships between entities]

```
[Entity A] ──< has many >── [Entity B]
[Entity C] ──< belongs to >── [Entity A]
```

## Migration Strategy

### Migration Plan

**Migration Files**:
1. `YYYYMMDD_HH_create_[table].sql` - [Description]
2. `YYYYMMDD_HH_add_[feature].sql` - [Description]

### Migration Content

```sql
-- Migration: [Migration name]
-- Created: [Date]
-- Description: [What this migration does]

-- Up Migration
[SQL statements]

-- Down Migration (commented)
-- [Rollback SQL statements]
```

### Migration Execution

```bash
# Local development
npx wrangler d1 migrations apply [database-name] --local

# Production
npx wrangler d1 migrations apply [database-name]
```

### Data Migration (if applicable)

If migrating existing data:

1. **Backup existing data**
2. **Create migration script**
3. **Test on local database**
4. **Validate data integrity**
5. **Run on production with monitoring**

## Index Planning

### Required Indexes

- **Index**: `idx_[table]_[column]`
  - **Columns**: [column list]
  - **Type**: [BTREE / UNIQUE / etc.]
  - **Rationale**: [Why needed - query pattern]
  - **Expected Impact**: [Performance improvement]

### Index Considerations

- **Composite Indexes**: [List any multi-column indexes and their order]
- **Query Patterns**: [Common queries this index optimizes]
- **Write Impact**: [How indexes affect write performance]

## Query Optimization

### Common Queries

#### Query 1: [Query name]

**Purpose**: [What this query does]

**SQL**:
```sql
SELECT [columns]
FROM [table]
WHERE [conditions]
ORDER BY [columns]
LIMIT [n] OFFSET [m];
```

**Parameters**: [List bound parameters]

**Expected Performance**: [Row count, execution time estimate]

**Optimization Strategy**:
- [Index used]
- [Query plan notes]
- [Any special considerations]

### Query Performance Targets

- **Simple Lookups**: < 5ms
- **Complex Queries**: < 50ms
- **Aggregations**: < 100ms
- **Full Table Scans**: Avoid if possible

### N+1 Query Prevention

[Strategies to prevent N+1 queries]

- Use JOINs instead of multiple queries
- Batch operations where possible
- Consider denormalization if needed

## Data Validation

### Input Validation

**Field-Level Validation**:
- **Field**: [field_name]
  - **Type**: [expected type]
  - **Constraints**: [length, format, range]
  - **Validation Logic**: [describe validation]

### Database Constraints

```sql
-- Constraints defined in schema
ALTER TABLE [table] ADD CONSTRAINT [constraint_name]
  CHECK ([condition]);
```

### Business Logic Validation

[Validation that can't be enforced at DB level]

- **Rule**: [Business rule]
  - **Check**: [How to validate]
  - **Error**: [Error message if violated]

### SQL Injection Prevention

**Required Practices**:
- ✅ Always use parameterized queries (`.bind()`)
- ✅ Never concatenate user input into SQL
- ✅ Validate input types before queries
- ✅ Use TypeScript for type safety

**Example**:
```typescript
// ✅ Correct - parameterized
await env.DB.prepare('SELECT * FROM users WHERE email = ?')
  .bind(email)
  .first();

// ❌ Wrong - concatenation
await env.DB.prepare(`SELECT * FROM users WHERE email = '${email}'`).first();
```

## Research Findings

### Codebase Analysis

#### Similar Patterns Found

- **Pattern**: [Pattern name]
  - **Location**: `path/to/file.ts:line`
  - **Description**: [What this pattern does]
  - **Relevance**: [Why this is useful for the current feature]

#### Existing Database Patterns

- **Pattern**: [Existing database usage pattern]
  - **Example**: [Code snippet or file reference]
  - **Application**: [How to apply this to the new feature]

#### Test Patterns

- **Test Framework**: [Framework name and version]
- **Pattern**: [Test pattern to follow]
- **Location**: `path/to/test.spec.ts`

### External Research

#### Documentation References

- **Resource**: [D1 / KV Documentation]
  - **URL**: [Specific URL to docs]
  - **Key Sections**: [Relevant sections to read]
  - **Version**: [Specific version]
  - **Gotchas**: [Known issues or quirks]

#### Implementation Examples

- **Example**: [Title/Description]
  - **Source**: [GitHub/StackOverflow/Blog URL]
  - **Relevance**: [What to learn from this]
  - **Cautions**: [What to avoid]

#### Best Practices

- **Practice**: [Best practice name]
  - **Why**: [Rationale]
  - **How**: [Implementation approach]
  - **Warning**: [What to avoid]

## Technical Specification

### Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │         │    Worker    │         │   Storage   │
│  Component  │ ───────>│  API Handler │ ───────>│  (D1/KV)    │
│             │  HTTP   │              │  Query  │             │
│             │<─────── │              │<─────── │             │
│             │  JSON   │              │  Data   │             │
└─────────────┘         └──────────────┘         └─────────────┘
```

### Component Breakdown

#### Component 1: Database Layer

- **Purpose**: [What this component does]
- **Location**: `path/to/component`
- **Dependencies**: [D1/KV binding, types]
- **Interface**: [Exported functions/classes]

#### Component 2: API Endpoints

- **Purpose**: [Handle HTTP requests and database operations]
- **Location**: `path/to/endpoints`
- **Dependencies**: [Database layer, validation]
- **Interface**: [Request handlers]

#### Component 3: [Additional Components]

[Repeat for each major component]

### Data Models

```typescript
// Database row type (matches schema)
interface [Entity]Row {
  // fields from database (snake_case)
}

// Application type (for API responses)
interface [Entity] {
  // fields for application (camelCase)
}

// Request types
interface Create[Entity]Request {
  // input fields
}

interface Update[Entity]Request {
  // input fields
}

// Response types
interface [Entity]Response {
  success: true;
  data: [Entity];
}

interface [Entity]ListResponse {
  success: true;
  data: [Entity][];
  count: number;
}

interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}
```

### API Endpoints

- **Endpoint**: `POST /api/[resource]`
  - **Purpose**: [Create a new resource]
  - **Request**: [Request schema]
  - **Response**: [Response schema]
  - **Validation**: [Input validation rules]
  - **Database Operations**: [SQL/KV operations performed]

- **Endpoint**: `GET /api/[resource]`
  - **Purpose**: [List resources]
  - **Query Parameters**: `limit`, `offset`, [others]
  - **Response**: [Response schema]
  - **Database Operations**: [SQL/KV operations performed]

- **Endpoint**: `GET /api/[resource]/:id`
  - **Purpose**: [Get single resource]
  - **Response**: [Response schema]
  - **Database Operations**: [SQL/KV operations performed]

- **Endpoint**: `PUT /api/[resource]/:id`
  - **Purpose**: [Update resource]
  - **Request**: [Request schema]
  - **Response**: [Response schema]
  - **Database Operations**: [SQL/KV operations performed]

- **Endpoint**: `DELETE /api/[resource]/:id`
  - **Purpose**: [Delete resource]
  - **Response**: [Response schema]
  - **Database Operations**: [SQL/KV operations performed]

## Implementation Blueprint

### Prerequisites

1. [Cloudflare D1/KV namespace created]
2. [Wrangler configuration updated]
3. [TypeScript types generated]
4. [Dependencies installed]

### Implementation Steps (in order)

#### Step 1: Create Database/Namespace

**Goal**: [Provision storage resources]

**Commands**:
```bash
# For D1
npx wrangler d1 create [database-name]

# For KV
npx wrangler kv namespace create [NAMESPACE]
```

**Files to Create/Modify**:
- `wrangler.jsonc` - Add binding configuration

**Validation**: [How to verify this step works]

#### Step 2: Design Schema

**Goal**: [Define data structure]

**Files to Create/Modify**:
- `[path]/schema.sql` - Full schema (for D1)
- `[path]/types.ts` - TypeScript interfaces

**Validation**: [SQL syntax check, type checking]

#### Step 3: Create Migration

**Goal**: [Version schema changes]

**Files to Create/Modify**:
- `migrations/YYYYMMDD_HH_[name].sql` - Migration file

**Validation**: [Migration runs without errors]

#### Step 4: Implement Data Layer

**Goal**: [Create database access functions]

**Files to Create/Modify**:
- `[path]/database.ts` - Database operations

**Pseudocode Approach**:
```typescript
async function create[Entity](data, env) {
  // 1. Validate input
  // 2. Execute INSERT with parameterized query
  // 3. Fetch created record
  // 4. Transform to application type
  // 5. Return result
}
```

**Reference Pattern**: See `examples/database/d1-contact-form/worker-endpoint.ts`

**Validation**: [Unit tests for data layer]

#### Step 5: Implement API Endpoints

**Goal**: [Create HTTP handlers]

**Files to Create/Modify**:
- `[path]/endpoints.ts` - Request handlers

**Pseudocode Approach**:
```typescript
async function handleRequest(request, env) {
  // 1. Parse request
  // 2. Validate input
  // 3. Call data layer
  // 4. Handle errors
  // 5. Return JSON response
}
```

**Validation**: [Test with curl/fetch]

#### Step 6: [Additional Steps]

[Repeat for each implementation step]

### Error Handling Strategy

- **Database errors**: Log full error, return generic message to client
- **Validation errors**: Return 400 with specific field errors
- **Not found errors**: Return 404 with resource type
- **Constraint violations**: Return 409 Conflict with explanation
- **Connection errors**: Return 503 Service Unavailable

### Edge Cases

1. **Edge Case**: [Scenario]
   - **Solution**: [How to handle]
   - **Database Impact**: [How this affects queries/storage]

## Testing Strategy

### Database Fixtures

**Test Data Setup**:
```sql
-- Insert test data
INSERT INTO [table] ([columns]) VALUES ([test_values]);
```

**Cleanup**:
```sql
-- Clean up test data
DELETE FROM [table] WHERE [condition];
```

### Unit Tests

- **Coverage Target**: [Percentage or scope]
- **Key Test Cases**:
  - Validation functions
  - Data transformation functions
  - Query builders
  - Error handling
- **Mock Strategy**: Mock D1/KV bindings

### Integration Tests

- **Test Scenarios**:
  - CRUD operations (Create → Read → Update → Delete)
  - Pagination
  - Error conditions (duplicates, not found, etc.)
  - Concurrent operations
- **Setup Required**: Local database with test data

### Manual Testing Checklist

- [ ] Create operation succeeds with valid data
- [ ] Create operation fails with invalid data
- [ ] Read operation returns correct data
- [ ] Update operation modifies data correctly
- [ ] Delete operation removes data
- [ ] Pagination works correctly
- [ ] Indexes are used (check query plans)
- [ ] SQL injection attempts are prevented
- [ ] Concurrent operations don't cause issues
- [ ] Database constraints are enforced

## Validation Gates

### Pre-Implementation Validation

```bash
# Ensure storage is configured
wrangler d1 list  # or wrangler kv namespace list

# Verify schema is valid
sqlite3 < schema.sql  # For D1

# Check TypeScript types
npm run build
```

### During Implementation Validation

```bash
# Type checking
npm run build

# Linting
npm run lint

# Run migrations
npx wrangler d1 migrations apply [database-name] --local

# Generate types
npm run cf-typegen
```

### Post-Implementation Validation

```bash
# Full test suite
npm run test

# Build verification
npm run build

# Deploy and test
npm run deploy
curl [production-endpoint]
```

### Manual Validation Steps

1. Create a record via API
2. Verify it appears in database
3. Update the record
4. Verify changes in database
5. Delete the record
6. Verify it's removed from database
7. Test edge cases and error conditions

## Backup/Recovery Considerations

### Backup Strategy

**For D1**:
- [Backup frequency]
- [Backup method: export to SQL, snapshot, etc.]
- [Backup retention period]

**For KV**:
- [Backup approach for critical KV data]
- [Export strategy]

### Recovery Procedures

1. **Data Corruption**:
   - [How to detect]
   - [How to recover]

2. **Accidental Deletion**:
   - [Soft delete vs hard delete strategy]
   - [Recovery process]

3. **Migration Failure**:
   - [Rollback procedure]
   - [Down migration execution]

## Dependencies

### New Dependencies (if any)

```json
{
  "dependencies": {
    "package-name": "^version"
  },
  "devDependencies": {
    "test-package": "^version"
  }
}
```

**Justification**: [Why each dependency is needed]

### Version Compatibility

- **Node**: [Version requirement]
- **Wrangler**: [Version requirement]
- **D1 Client API**: [Version requirement]

## Migration & Rollout

### Database Migrations

**Order of Execution**:
1. [First migration]
2. [Second migration]
3. [Additional migrations]

**Rollback Plan**:
[How to rollback if needed]

### Feature Flags (if applicable)

[Document feature flag strategy for gradual rollout]

### Rollout Plan

1. Run migrations on staging environment
2. Test thoroughly on staging
3. Run migrations on production
4. Deploy code
5. Monitor for errors
6. Verify data integrity

## Success Criteria

- [ ] All validation gates pass
- [ ] Database schema created successfully
- [ ] Migrations run without errors
- [ ] All CRUD operations work correctly
- [ ] Indexes are created and used
- [ ] SQL injection prevented (parameterized queries)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Tests pass (unit, integration, manual)
- [ ] Data validation works
- [ ] Error handling implemented
- [ ] Code follows existing conventions
- [ ] Documentation updated
- [ ] Backup strategy defined

## Known Limitations

[Document any known limitations or future enhancements]

## References

### Internal Documentation

- `examples/database/README.md` - Database example overview
- `CLAUDE.md` - Project guidelines

### External Resources

- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [KV Documentation](https://developers.cloudflare.com/kv/)
- [SQLite Documentation](https://www.sqlite.org/docs.html) (for D1)

## Appendix

### SQL Query Examples

```sql
-- Common queries for this feature
[Example queries]
```

### Database Schema Diagram

```
[ASCII diagram or description of schema]
```

### Additional Notes

[Any additional context that doesn't fit elsewhere]
