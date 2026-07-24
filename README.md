# DiamondFlow ERP+MES

Unified enterprise operating platform for diamond and jewelry businesses combining ERP, MES, Supply Chain, Quality, Finance, HR, and AI-assisted operations.

## Overview

DiamondFlow is a production-grade ERP+MES platform designed specifically for diamond and jewelry manufacturing. It provides complete traceability from rough diamond to finished jewelry, real-time shop floor visibility, configurable manufacturing routes, and integrated quality management.

## Features

- **Complete Diamond Traceability** - Digital genealogy from rough to customer
- **Manufacturing Execution** - Real-time shop floor operations with WIP tracking
- **Configurable Routing** - Dynamic department sequences by product/customer/shape
- **Quality Management** - Inspections, NCRs, CAPA, certifications (GIA/IGI/HRD)
- **Planning & Scheduling** - MRP, finite capacity, job cards
- **Inventory & Procurement** - Lots, reservations, POs, GRN, ERP sync
- **Dispatch & Finance** - Bagging, shipping, invoicing, payments, GL
- **AI Copilot** - Permission-aware natural language operations
- **Multi-org Architecture** - Company/Branch/Factory/Warehouse/Dept isolation

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 20 LTS |
| **API** | NestJS 10, TypeScript 5 (strict) |
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS |
| **Database** | PostgreSQL 16 + Prisma ORM |
| **Cache/Queue** | Redis 7 + BullMQ |
| **Realtime** | Socket.IO |
| **Auth** | Clerk + Custom RBAC (CASL) |
| **Monorepo** | Nx |
| **Container** | Docker + Kubernetes |
| **Observability** | OpenTelemetry, Prometheus, Grafana, Loki |

## Quick Start

### Prerequisites

- Node.js 20 LTS
- pnpm 9+
- Docker & Docker Compose
- Clerk account (for auth)

### Installation

```bash
# Clone repository
git clone https://github.com/diamondflow/diamondflow.git
cd diamondflow

# Install dependencies
pnpm install

# Start infrastructure
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Setup database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Configure environment
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local files with your Clerk keys

# Start development servers
pnpm dev
```

### Access Points

| Application | URL |
|-------------|-----|
| Web App | http://localhost:3001 |
| API | http://localhost:3000/api/v1 |
| API Docs | http://localhost:3000/api/docs |
| Prisma Studio | http://localhost:5555 |
| Mailhog | http://localhost:8025 |
| MinIO Console | http://localhost:9001 |
| pgAdmin | http://localhost:5050 |

## Project Structure

```
diamondflow/
├── apps/
│   ├── api/              # NestJS API
│   ├── web/              # Next.js Main App
│   ├── portal-customer/  # Customer Portal
│   ├── portal-supplier/  # Supplier Portal
│   └── worker/           # BullMQ Workers
├── packages/
│   ├── contracts/        # Shared Zod schemas, types, events
│   ├── domain/           # Pure domain logic (DDD)
│   ├── database/         # Prisma, repositories, migrations
│   ├── auth/             # Clerk integration
│   ├── authorization/    # CASL policies, org-scoped queries
│   ├── events/           # Event bus, outbox, inbox
│   ├── queue/            # BullMQ jobs, processors
│   ├── realtime/         # Socket.IO gateway, rooms
│   ├── ui/               # Design system (shadcn/ui)
│   ├── config/           # Env validation, feature flags
│   ├── observability/    # Logging, metrics, tracing, health
│   └── testing/          # Factories, fixtures, mocks
├── prisma/
│   ├── schema.prisma     # 75+ models
│   └── migrations/
├── infrastructure/
│   ├── docker/           # Dockerfiles, compose files
│   ├── deployment/       # K8s/Helm, Terraform
│   └── monitoring/       # Grafana, Prometheus, Loki configs
└── docs/
    ├── architecture/
    ├── domain/
    ├── api/
    └── operations/
```

## Core Workflows

1. **Lead → Quotation → Sales Order → Production Order → Job Cards → Manufacturing → QC → Certification → Bagging → Dispatch → Invoice → Payment**
2. **Legacy ERP Sync** - Scheduled, incremental, delta sync with reconciliation
3. **Planning** - MRP → Finite Scheduling → Production Orders → Job Cards
4. **Manufacturing** - Packet Issue → Department Transfer → Operation Start/Pause/Resume/Complete → Weight/Yield → Next Dept
5. **Quality** - Inspection Plan → Inspection → Pass/Fail → NCR → Disposition → Reinspection
6. **Certification** - QC Pass → Lab Selection → Submission → External Tracking → Receipt → Validation → Bagging Ready
7. **Returns/Repair** - Authorization → Receipt → Disposition → Repair Job Card → Manufacturing → QC → Re-certification → Redispatch

## Architecture Principles

- **Domain-Driven Design** - Aggregates, entities, value objects, domain events
- **Clean Architecture** - Presentation → Application → Domain → Infrastructure
- **Event-Driven** - Transactional outbox, inbox pattern, idempotent consumers
- **CQRS-Ready** - Commands/Queries separation at application layer
- **Multi-Tenant** - Row-level security, org-scoped queries, hierarchical org structure
- **Security by Design** - AuthZ on every operation, field-level permissions, audit logging
- **Observability by Design** - Structured logs, metrics, traces, correlation IDs

## Development

### Common Commands

```bash
# Development
pnpm dev                    # Start all dev servers
pnpm dev:api               # API only
pnpm dev:web               # Web only

# Database
pnpm db:generate           # Generate Prisma client
pnpm db:push               # Push schema (dev)
pnpm db:migrate            # Create migration
pnpm db:migrate:deploy     # Apply migrations (prod)
pnpm db:studio             # Open Prisma Studio
pnpm db:seed               # Seed master data
pnpm db:reset              # Reset database (dev)

# Code Quality
pnpm lint                  # ESLint + Prettier
pnpm typecheck             # TypeScript strict check
pnpm test                  # All tests
pnpm test:unit             # Unit tests
pnpm test:integration      # Integration tests
pnpm test:e2e              # Playwright E2E

# Build
pnpm build                 # Build all packages
pnpm build:api             # Build API
pnpm build:web             # Build Web

# Docker
pnpm docker:build          # Build all images
pnpm docker:up             # Start all containers
pnpm docker:down           # Stop containers
pnpm docker:logs           # View logs
```

### Creating a New Module

```bash
# Using Nx generators (after setup)
nx generate @nx/nest:library modules/new-module --directory=apps/api/src/modules
nx generate @nx/react:library components/new-component --directory=packages/ui/src/components
```

## Deployment

### Kubernetes (Production)

```bash
# Install infrastructure
helm install postgresql oci://registry-1.docker.io/bitnamicharts/postgresql -n diamondflow-system
helm install redis oci://registry-1.docker.io/bitnamicharts/redis -n diamondflow-system
helm install minio oci://registry-1.docker.io/bitnamicharts/minio -n diamondflow-system

# Deploy application
helm install diamondflow ./infrastructure/deployment/helm/diamondflow \
  -n diamondflow-prod \
  -f ./infrastructure/deployment/helm/diamondflow/values-prod.yaml \
  --set image.tag=v1.2.3 \
  --set secrets.clerkPublishableKey=pk_live_... \
  --set secrets.clerkSecretKey=sk_live_...
```

### Environment Variables

Key environment variables (see `.env.example` for full list):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `JWT_SECRET` | JWT signing secret (32+ chars) |
| `S3_ENDPOINT` | MinIO/S3 endpoint |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry collector |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- 80%+ test coverage for domain logic
- ADR for architectural decisions

## License

Proprietary - DiamondFlow ERP+MES Platform

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@diamondflow.com