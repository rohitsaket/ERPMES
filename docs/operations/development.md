# Development Setup

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20 LTS | `nvm install 20` |
| pnpm | 9.x | `corepack enable pnpm` |
| Docker | 24.x | Docker Desktop / `apt install docker.io` |
| Docker Compose | 2.x | Included with Docker |
| PostgreSQL | 16 | Via Docker |
| Redis | 7 | Via Docker |
| Git | 2.40+ | `apt install git` |
| VS Code | Latest | `code --version` |
| Clerk Account | - | `clerk.com` |

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/diamondflow/diamondflow.git
cd diamondflow

# 2. Install dependencies
pnpm install

# 3. Start infrastructure
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d

# 4. Setup database
pnpm --filter=@diamondflow/database prisma migrate dev
pnpm --filter=@diamondflow/database prisma db seed

# 5. Configure environment
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local files with your Clerk keys

# 6. Start development servers
pnpm dev
```

## Environment Variables

### API (`apps/api/.env.local`)

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/diamondflow?schema=public
DATABASE_POOL_SIZE=10

# Redis
REDIS_URL=redis://localhost:6379
REDIS_SESSION_TTL=86400

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
CLERK_API_URL=https://api.clerk.com

# JWT (for service-to-service)
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=diamondflow-dev
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true

# Socket.IO
SOCKET_IO_PORT=3001
SOCKET_IO_CORS_ORIGIN=http://localhost:3001

# Feature Flags
FF_MRP_ENABLED=true
FF_FINITE_SCHEDULING_ENABLED=false
FF_AI_COPILOT_ENABLED=true

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=diamondflow-api
LOG_LEVEL=debug

# Email (Mailhog)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@diamondflow.dev
```

### Web (`apps/web/.env.local`)

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register

# Feature Flags
NEXT_PUBLIC_FF_AI_COPILOT=true
NEXT_PUBLIC_FF_DARK_MODE=true

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Project Structure

```
diamondflow/
├── apps/
│   ├── api/                 # NestJS API (port 3000)
│   ├── web/                 # Next.js Web (port 3001)
│   ├── portal-customer/     # Customer Portal (port 3002)
│   ├── portal-supplier/     # Supplier Portal (port 3003)
│   └── worker/              # BullMQ Workers
├── packages/
│   ├── contracts/           # Shared types, Zod schemas
│   ├── domain/              # Pure domain logic
│   ├── database/            # Prisma, repositories
│   ├── auth/                # Clerk integration
│   ├── authorization/       # CASL, permissions
│   ├── events/              # Event bus, outbox/inbox
│   ├── queue/               # BullMQ jobs
│   ├── realtime/            # Socket.IO
│   ├── ui/                  # Design system
│   ├── config/              # Env validation
│   ├── observability/       # Logs, metrics, traces
│   └── testing/             # Test utilities
├── infrastructure/
│   ├── docker/
│   ├── deployment/
│   └── monitoring/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
├── .github/workflows/
├── nx.json
├── tsconfig.base.json
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Common Commands

### Development

```bash
# Start all dev servers
pnpm dev

# Start specific app
pnpm --filter=@diamondflow/api dev
pnpm --filter=@diamondflow/web dev

# Type check all
pnpm typecheck

# Lint all
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test
pnpm test:watch
pnpm test:coverage

# E2E tests
pnpm test:e2e
```

### Database

```bash
# Generate Prisma client
pnpm --filter=@diamondflow/database prisma generate

# Create migration
pnpm --filter=@diamondflow/database prisma migrate dev --name migration_name

# Apply migrations
pnpm --filter=@diamondflow/database prisma migrate deploy

# Reset database (dev only)
pnpm --filter=@diamondflow/database prisma migrate reset

# Seed database
pnpm --filter=@diamondflow/database prisma db seed

# Open Prisma Studio
pnpm --filter=@diamondflow/database prisma studio
```

### Docker

```bash
# Start all services
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d

# View logs
docker-compose -f infrastructure/docker/docker-compose.dev.yml logs -f api

# Stop all
docker-compose -f infrastructure/docker/docker-compose.dev.yml down

# Clean volumes (nuclear)
docker-compose -f infrastructure/docker/docker-compose.dev.yml down -v
```

### Code Generation

```bash
# Generate React components from contracts
pnpm generate:components

# Generate API client from OpenAPI
pnpm generate:api-client

# Generate Zod schemas from Prisma
pnpm generate:schemas
```

## VS Code Setup

### Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",
    "ms-playwright.playwright",
    "vitest.explorer"
  ]
}
```

### Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.validate": [
    "typescript",
    "typescriptreact"
  ],
  "prettier.configPath": ".prettierrc",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/.turbo": true
  }
}
```

## Debugging

### API (NestJS)

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["--filter=@diamondflow/api", "dev:debug"],
      "console": "integratedTerminal",
      "restart": true,
      "autoAttachChildProcesses": true
    }
  ]
}
```

### Web (Next.js)

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Web",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["--filter=@diamondflow/web", "dev"],
  "console": "integratedTerminal"
}
```

### Database

```bash
# Connect to PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/diamondflow

# Connect to Redis
redis-cli

# View Prisma query logs (in API .env)
# LOG_LEVEL=debug + Prisma LOG_LEVEL=query
```

## Testing Strategy

### Unit Tests (Domain Layer)

```bash
# Location: packages/domain/src/**/*.spec.ts
# Run: pnpm --filter=@diamondflow/domain test
```

```typescript
// Example: Diamond aggregate test
describe('Diamond', () => {
  it('should allocate to sales order', () => {
    const diamond = Diamond.create({ carat: 1.0, ... });
    const order = SalesOrder.create({ ... });
    
    diamond.allocateTo(order.id);
    
    expect(diamond.status).toBe('ALLOCATED');
    expect(diamond.domainEvents).toContainEqual(
      expect.objectContaining({ eventType: 'DiamondAllocated' })
    );
  });
});
```

### Integration Tests (Application Layer)

```bash
# Location: apps/api/src/**/*.spec.ts
# Run: pnpm --filter=@diamondflow/api test
```

```typescript
// Example: Sales order use case test
describe('CreateSalesOrderUseCase', () => {
  it('should create order and reserve inventory', async () => {
    const result = await useCase.execute({
      customerId: 'cust_1',
      lines: [{ productId: 'prod_1', qty: 10 }]
    });
    
    expect(result.orderId).toBeDefined();
    expect(inventoryLot.reservedQty).toBe(10);
  });
});
```

### E2E Tests (Playwright)

```bash
# Location: apps/web/e2e/**/*.spec.ts
# Run: pnpm test:e2e
```

```typescript
// Example: Shop floor operation flow
test('operator completes operation', async ({ page }) => {
  await page.goto('/manufacturing/shop-floor/wc_001');
  await page.click('[data-testid="operation-op_001"]');
  await page.click('[data-testid="btn-start"]');
  await page.fill('[data-testid="input-yield"]', '0.95');
  await page.click('[data-testid="btn-complete"]');
  await expect(page.locator('[data-testid="status"]')).toHaveText('COMPLETED');
});
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `pnpm install` fails | `pnpm store prune && pnpm install` |
| Prisma client out of sync | `pnpm --filter=@diamondflow/database prisma generate` |
| Migration fails | Check `prisma/migrations/` for conflicts, reset if needed |
| Port already in use | `lsof -i :3000` then `kill -9 <PID>` |
| Clerk webhook not received | Use `ngrok` for local: `ngrok http 3000` |
| Socket.IO connection fails | Check `SOCKET_IO_CORS_ORIGIN` matches web URL |
| Redis connection refused | `docker-compose restart redis` |
| MinIO access denied | Check `S3_ACCESS_KEY`/`S3_SECRET_KEY` match docker-compose |

### Logs

```bash
# API logs
docker-compose logs -f api

# Web logs
docker-compose logs -f web

# Database logs
docker-compose logs -f postgres

# All logs
docker-compose logs -f --tail=100
```

## Git Workflow

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/DF-123-short-description` | `feature/DF-123-add-mrp-engine` |
| Bugfix | `fix/DF-456-short-description` | `fix/DF-456-fix-yield-calculation` |
| Hotfix | `hotfix/DF-789-critical-fix` | `hotfix/DF-789-security-patch` |
| Chore | `chore/description` | `chore/update-dependencies` |
| Docs | `docs/description` | `docs/update-api-reference` |

### Commit Messages

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`

```
feat(sales): add quotation approval workflow

- Add QuotationApproval aggregate
- Implement approval flow with CASL permissions
- Add email notifications on approval/rejection

Closes DF-123
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type
- [ ] Feature
- [ ] Bugfix
- [ ] Refactor
- [ ] Docs
- [ ] Chore

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing done

## Checklist
- [ ] Lint passes
- [ ] TypeCheck passes
- [ ] No console.log/debugger
- [ ] Documentation updated
- [ ] Migration included (if DB changes)
- [ ] Feature flag added (if new feature)

## Screenshots (if UI)
...

## Related Issues
Closes DF-XXX
```

## Performance Profiling

### API Profiling

```bash
# Add to API .env
NODE_OPTIONS="--inspect=0.0.0.0:9229"

# Connect Chrome DevTools: chrome://inspect
```

### Database Profiling

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
SELECT pg_reload_conf();

-- View slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 20;
```

### Frontend Profiling

```bash
# Next.js bundle analyzer
ANALYZE=true pnpm --filter=@diamondflow/web build

# React DevTools Profiler
# Install browser extension
```

## Useful Scripts

```bash
# Clean all node_modules and reinstall
pnpm clean:all && pnpm install

# Reset database and reseed
pnpm db:reset

# Generate all types
pnpm generate:all

# Check for circular dependencies
pnpm check:circular

# Audit dependencies
pnpm audit --prod

# Update dependencies
pnpm up -i --latest
```