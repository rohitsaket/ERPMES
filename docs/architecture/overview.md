# Architecture Overview

## Architectural Style

DiamondFlow uses an **Enterprise Modular Monolith** with the following characteristics:

- **Domain-Driven Design (DDD)** - Bounded contexts, aggregates, domain events
- **Clean Architecture** - Four layers: Presentation, Application, Domain, Infrastructure
- **Event-Driven Integration** - Transactional outbox pattern, eventual consistency
- **CQRS-Ready** - Command/Query separation at application layer
- **API-First** - Versioned REST APIs under `/api/v1`
- **Microservice-Ready** - Module boundaries support future extraction
- **Multi-Organization Isolation** - Row-level security, org-scoped queries
- **Security by Design** - Authentication, authorization, audit on every operation
- **Observability by Design** - Structured logs, metrics, distributed tracing
- **Testability by Design** - Pure domain, dependency injection, test doubles

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTS                                     │
│  Web App │ Customer Portal │ Supplier Portal │ AI Copilot      │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION LAYER                          │
│                    (Clerk + Custom RBAC)                        │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ORGANIZATION & PERMISSION LAYER                    │
│              (CASL + Org-Scoped Queries)                        │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API PLATFORM                               │
│              (NestJS / REST + WebSocket)                        │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MODULAR BUSINESS PLATFORM                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │   CRM    │ │  Sales   │ │ Orders   │ │ Planning │ │Purchase│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Inventory │ │ Diamond  │ │ Jewelry  │ │ Manuf.   │ │  WIP   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Quality  │ │  Cert.   │ │ Dispatch │ │ Finance  │ │   HR   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Reports  │ │    AI    │ │ Workflow │ │  Notif.  │ │ Docs   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              CROSS-CUTTING CONCERNS                             │
│  Events • Workflow • Approval • Notifications • Documents       │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA & INFRASTRUCTURE                        │
│  PostgreSQL • Redis • BullMQ • S3/MinIO • Socket.IO            │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                         │
│  Legacy ERP • Labs • Couriers • Payment • Email • SMS • CAD    │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY                                │
│  Logs • Metrics • Traces • Alerts • Audit                       │
└─────────────────────────────────────────────────────────────────┘
```

## Clean Architecture Layers

### Presentation Layer (`apps/web`, `apps/api`)
- Routes, Pages, Layouts, Forms, Tables, Dashboards
- API Controllers, Request Validation, WebSocket Gateway
- Real-time Clients, Command Palette

### Application Layer (`packages/domain` → Use Cases)
- Commands, Queries, Use Cases, Application Services
- Transactions, Workflow Orchestration, Permission Enforcement
- Event Coordination, Outbox Publishing

### Domain Layer (`packages/domain`)
- Entities, Aggregates, Value Objects, Domain Services
- Domain Events, Business Invariants, Repository Contracts
- **Zero dependencies on infrastructure**

### Infrastructure Layer (`packages/database`, `packages/events`, `packages/queue`, `packages/realtime`)
- Prisma Repositories, Redis Adapters, Queue Workers
- WebSocket Gateway, Storage Adapters, Notification Providers
- External ERP Connectors, Lab/Courier Connectors
- Logging, Telemetry, Metrics

### Data & External Systems
- PostgreSQL (Master, Transactional, Audit, Events)
- Redis (Cache, Sessions, Locks, Real-time)
- S3/MinIO (Documents, Certificates, CAD, Videos)
- Legacy ERP, Labs, Couriers, Payment Gateways

## Module Boundaries

Each business module is a **NestJS feature module** with:

```
src/modules/{module}/
├── commands/           # Write operations
├── queries/            # Read operations
├── services/           # Domain services
├── events/             # Domain event handlers
├── repositories/       # Repository implementations
├── dto/                # Data transfer objects
├── guards/             # Permission guards
└── {module}.module.ts  # Module definition
```

**Module Communication Rules:**
1. Modules communicate via **domain events** (async) or **application services** (sync)
2. No direct database access across modules
3. No shared entities - only shared kernel (value objects, interfaces)
4. API contracts defined in `packages/contracts`

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | 20 LTS |
| API Framework | NestJS | 10.x |
| Frontend | React + Next.js | 18 / 14 (App Router) |
| Language | TypeScript | 5.x (strict mode) |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 5.x |
| Cache/Queue | Redis + BullMQ | 7 / 5.x |
| Real-time | Socket.IO | 4.x |
| Auth | Clerk | Latest |
| Authorization | CASL | 6.x |
| UI Library | shadcn/ui + Tailwind | Latest |
| State | TanStack Query + Zustand | Latest |
| Testing | Vitest + Playwright | Latest |
| CI/CD | GitHub Actions | - |
| Container | Docker | 24.x |
| Orchestration | Kubernetes | 1.28+ |
| Observability | OpenTelemetry + Prometheus + Grafana | Latest |

## Monorepo Structure

```
diamondflow/
├── apps/
│   ├── api/                 # NestJS API
│   ├── web/                 # Next.js Main App
│   ├── portal-customer/     # Customer Portal
│   ├── portal-supplier/     # Supplier Portal
│   └── worker/              # BullMQ Workers
├── packages/
│   ├── contracts/           # Shared types, Zod schemas, events
│   ├── domain/              # Pure domain logic (DDD)
│   ├── database/            # Prisma, repositories, migrations
│   ├── auth/                # Authentication integration
│   ├── authorization/       # CASL, org-scoped queries
│   ├── events/              # Event bus, outbox, inbox
│   ├── queue/               # BullMQ jobs, processors
│   ├── realtime/            # Socket.IO gateway
│   ├── ui/                  # Design system
│   ├── config/              # Env validation, feature flags
│   ├── observability/       # Logs, metrics, traces
│   └── testing/             # Test utilities, factories
├── infrastructure/
│   ├── docker/
│   ├── deployment/
│   └── monitoring/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── docs/
```

## Multi-Organization Architecture

Every business record carries organizational scope:

```
Company
  └── Branch
        └── Factory
              ├── Warehouse
              ├── Department
              │     └── Team
              │           └── User
              └── WorkCenter
```

**Authorization Scopes:**
- Global (super admin)
- Company-scoped
- Branch-scoped
- Factory-scoped
- Warehouse-scoped
- Department-scoped
- Record-scoped
- Field-scoped

**Enforcement Points:**
- Database queries (Prisma middleware)
- Cache keys (Redis)
- Events (payload includes org IDs)
- Jobs (BullMQ job data)
- WebSocket rooms (hierarchical)
- Search results
- Exports/Reports
- AI tool context

## Deployment Architecture

```
Users
  ▼
CDN / Reverse Proxy / Load Balancer (NGINX/Traefik)
  ▼
Web Application (Next.js) ──► Static Assets (CDN)
  ▼
API Instances (NestJS, 3+ replicas)
  ├── Realtime Gateway (Socket.IO, sticky sessions)
  ├── Background Workers (BullMQ, separate deployments)
  │   ├── Integration Workers (ERP sync, EDI)
  │   ├── Scheduled Workers (MRP, reports)
  │   └── Notification Workers (email, SMS)
  ▼
PostgreSQL (Primary + Read Replicas)
  ▼
Redis Cluster (Cache, Sessions, Queue, Pub/Sub)
  ▼
Object Storage (S3/MinIO)
  ▼
External Systems (Legacy ERP, Labs, Couriers, Banks)
  ▼
Monitoring (Prometheus, Grafana, Loki, Tempo, Alertmanager)
```

## Architectural Decision Records (ADRs)

| ADR | Title | Status |
|-----|-------|--------|
| ADR-001 | Modular Monolith over Microservices | Accepted |
| ADR-002 | Clerk for Authentication | Accepted |
| ADR-003 | CASL for Authorization | Accepted |
| ADR-004 | Transactional Outbox Pattern | Accepted |
| ADR-005 | Prisma ORM with Row-Level Security | Accepted |
| ADR-006 | Socket.IO for Real-time | Accepted |
| ADR-007 | shadcn/ui + Tailwind for Design System | Accepted |
| ADR-008 | Nx for Monorepo Management | Accepted |
| ADR-009 | PostgreSQL Partitioning for Audit/Events | Accepted |
| ADR-010 | BullMQ for Background Jobs | Accepted |

See [Architecture Decisions](architecture/decisions/) for details.