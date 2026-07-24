# Project Glossary

## Business Terms

| Term | Definition | Context |
|------|------------|---------|
| **Carat** | Unit of weight for diamonds (1 carat = 0.2 grams) | Diamond specifications, yield calculations |
| **Certificate** | Grading report from gemological lab (GIA, IGI, HRD) | Quality assurance, customer confidence |
| **Clarity** | Diamond purity grade (FL, IF, VVS1/2, VS1/2, SI1/2, I1/2/3) | 4Cs grading |
| **Color** | Diamond color grade (D-Z, D=colorless) | 4Cs grading |
| **Cut** | Diamond cut quality (Excellent, Very Good, Good, Fair, Poor) | 4Cs grading |
| **Fancy** | Non-round diamond shapes (Princess, Emerald, Oval, etc.) | Shape classification |
| **Genealogy** | Complete digital history of a diamond from rough to finished | Traceability, compliance |
| **Packet** | Physical container holding multiple diamonds during manufacturing | WIP tracking, department transfers |
| **Bag** | Sealed, tamper-evident container for finished diamonds | Dispatch, shipping |
| **Lot** | Inventory grouping with unique identifier, quantity, location | Inventory management |
| **Yield** | Output weight / Input weight × 100% | Manufacturing efficiency |
| **Loss** | Weight reduction during manufacturing (dust, breakage) | Cost accounting, yield |
| **Recovery** | (Output carats / Input carats) × 100% | Rough planning |
| **MRP** | Material Requirements Planning - calculates net requirements | Production planning |
| **MPS** | Master Production Schedule - what to make, when, how much | Production planning |
| **BOM** | Bill of Materials - hierarchical product structure | Product definition |
| **Routing** | Sequence of operations to manufacture a product | Process definition |
| **Work Center** | Machine, labor, or department where operations occur | Capacity planning |
| **Job Card** | Shop floor document for single operation execution | Manufacturing execution |
| **WIP** | Work in Progress - partially completed products | Shop floor visibility |
| **NCR** | Nonconformance Report - quality deviation record | Quality management |
| **CAPA** | Corrective and Preventive Action - root cause resolution | Quality management |
| **FAI** | First Article Inspection - initial production validation | Quality management |
| **SPC** | Statistical Process Control - chart-based monitoring | Quality management |
| **OEE** | Overall Equipment Effectiveness = Availability × Performance × Quality | Manufacturing KPI |
| **OTD** | On-Time Delivery - orders shipped by promised date | Customer service KPI |
| **ERP** | Enterprise Resource Planning - business management software | Legacy integration |
| **MES** | Manufacturing Execution System - shop floor control | Core DiamondFlow |
| **PLM** | Product Lifecycle Management - CAD, BOM, ECN management | Engineering integration |

## Technical Terms

| Term | Definition | Context |
|------|------------|---------|
| **Aggregate** | DDD pattern: cluster of entities/values with consistency boundary | Domain modeling |
| **Value Object** | Immutable object defined by its attributes (no identity) | Domain modeling |
| **Domain Event** | Something that happened in the domain (past tense) | Event-driven architecture |
| **Outbox Pattern** | Transactional event publishing via database table | Reliability |
| **Inbox Pattern** | Idempotent event consumption via tracking table | Reliability |
| **CQRS** | Command Query Responsibility Segregation | Read/write separation |
| **Saga** | Distributed transaction via choreography/orchestration | Cross-service consistency |
| **RLS** | Row-Level Security - database-enforced multi-tenancy | Security |
| **Idempotency** | Operation produces same result regardless of repetitions | Reliability |
| **Correlation ID** | Tracks a business transaction across services | Observability |
| **Causation ID** | Links cause → effect between events | Observability |
| **Feature Flag** | Runtime toggle for feature rollout | Deployment |
| **Blue-Green** | Deployment strategy with two identical environments | Deployment |
| **Canary** | Gradual rollout to subset of users | Deployment |
| **Circuit Breaker** | Pattern to prevent cascade failures | Resilience |
| **Bulkhead** | Resource isolation to limit blast radius | Resilience |
| **Backpressure** | Flow control when downstream is slow | Resilience |
| **Dead Letter Queue** | Storage for failed messages after retries | Reliability |
| **Schema Registry** | Centralized event schema management | Contracts |
| **OpenTelemetry** | Vendor-neutral observability framework | Observability |
| **WAL** | Write-Ahead Log - PostgreSQL durability mechanism | Database |
| **VACUUM** | PostgreSQL maintenance to reclaim space | Database |
| **AOF** | Append-Only File - Redis persistence mode | Cache |
| **RDB** | Redis Database - point-in-time snapshot | Cache |

## Acronyms

| Acronym | Full Form |
|---------|-----------|
| API | Application Programming Interface |
| JWT | JSON Web Token |
| MFA | Multi-Factor Authentication |
| RBAC | Role-Based Access Control |
| ABAC | Attribute-Based Access Control |
| CASL | Cancelable Access Control List (library) |
| DDD | Domain-Driven Design |
| ORM | Object-Relational Mapping |
| CI/CD | Continuous Integration / Continuous Deployment |
| K8s | Kubernetes |
| Helm | Kubernetes package manager |
| ArgoCD | GitOps continuous delivery |
| S3 | Simple Storage Service |
| CDN | Content Delivery Network |
| WAF | Web Application Firewall |
| DDoS | Distributed Denial of Service |
| SOC | Security Operations Center |
| SIEM | Security Information and Event Management |
| GDPR | General Data Protection Regulation |
| ITAR | International Traffic in Arms Regulations |
| CMMC | Cybersecurity Maturity Model Certification |
| ISO | International Organization for Standardization |
| AS9100 | Aerospace quality management |
| IATF 16949 | Automotive quality management |
| FDA | Food and Drug Administration |
| CFR | Code of Federal Regulations |
| ANSI | American National Standards Institute |
| AQL | Acceptable Quality Level |
| EDI | Electronic Data Interchange |
| X12 | ANSI ASC X12 EDI standard |
| EDIFACT | EDI for Administration, Commerce and Transport |
| AS2 | Applicability Statement 2 (EDI over HTTP) |
| MTConnect | Manufacturing data standard |
| OPC-UA | Open Platform Communications Unified Architecture |
| MQTT | Message Queuing Telemetry Transport |
| PLC | Programmable Logic Controller |
| SCADA | Supervisory Control and Data Acquisition |
| HMI | Human-Machine Interface |
| CNC | Computer Numerical Control |
| CAD | Computer-Aided Design |
| CAM | Computer-Aided Manufacturing |
| CAE | Computer-Aided Engineering |
| ECO | Engineering Change Order |
| ECN | Engineering Change Notice |
| PDM | Product Data Management |

## Roles & Personas

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Super Admin** | Platform-wide administration | All permissions, all companies |
| **Company Admin** | Manages single company | Company-scoped admin |
| **Factory Manager** | Oversees factory operations | Factory-scoped |
| **Production Planner** | Creates production plans, MRP | Planning module |
| **Shop Floor Operator** | Executes operations on work center | Operation start/complete |
| **Quality Inspector** | Performs inspections, creates NCRs | Quality module |
| **Warehouse Operator** | Receives, issues, transfers inventory | Inventory module |
| **Procurement Officer** | Manages POs, vendors, RFQs | Procurement module |
| **Sales Representative** | Creates quotations, manages orders | Sales module |
| **Finance Controller** | Invoicing, payments, GL | Finance module |
| **Maintenance Technician** | Executes work orders, PMs | Maintenance module |
| **Logistics Coordinator** | Manages shipments, carriers | Dispatch module |
| **Customer** | Portal access to orders, tracking | Customer portal |
| **Supplier** | Portal access to POs, RFQs | Supplier portal |
| **Auditor** | Read-only access to audit trails | Audit log viewer |

## Document References

- [Architecture Overview](architecture/overview.md)
- [Domain Model](domain/domain-model.md)
- [API Reference](api/reference.md)
- [Deployment Guide](operations/deployment.md)