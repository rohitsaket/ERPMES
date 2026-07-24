# DiamondFlow ERP+MES

Unified enterprise operating platform for diamond and jewelry businesses combining ERP, MES, Supply Chain, Quality, Finance, HR, and AI-assisted operations.

## Project Overview

**Product Identity:** DiamondFlow
**Roadmap Version:** 4.0
**Architecture:** Enterprise Modular Monolith (DDD, Clean Architecture, Event-Driven)
**Deployment:** Kubernetes (Cloud/Air-gapped), Docker Compose (Dev)
**Tech Stack:** Node.js/NestJS, React/Next.js, PostgreSQL, Redis, BullMQ, Socket.IO

## Documentation Structure

```
docs/
├── architecture/     # System architecture, ADRs, tech decisions
├── domain/           # Domain models, bounded contexts, ubiquitous language
├── api/              # API contracts, OpenAPI specs, event schemas
├── operations/       # Deployment, monitoring, runbooks, disaster recovery
└── project/          # Project management, roadmap, team, glossary
```

## Quick Links

- [Architecture Overview](architecture/overview.md)
- [Domain Model](domain/model.md)
- [API Reference](api/reference.md)
- [Deployment Guide](operations/deployment.md)
- [Glossary](project/glossary.md)

## Getting Started

See [Development Setup](operations/development.md) for local environment setup.

## License

Proprietary - DiamondFlow ERP+MES Platform