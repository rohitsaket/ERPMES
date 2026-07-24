# Operations Guide

## Deployment

### Environments

| Environment | Purpose | URL | Infrastructure |
|-------------|---------|-----|----------------|
| Development | Local dev, feature testing | `localhost:3001` | Docker Compose |
| Integration | CI/CD testing, integration tests | `int.diamondflow.com` | K8s (dev cluster) |
| Staging | Pre-production validation | `staging.diamondflow.com` | K8s (staging cluster) |
| Production | Live customer traffic | `app.diamondflow.com` | K8s (prod cluster, multi-AZ) |

### Kubernetes Deployment

#### Cluster Requirements

| Component | Specification |
|-----------|---------------|
| Kubernetes | 1.28+ |
| Nodes | 3+ worker nodes (prod), 1+ (staging) |
| CPU | 16+ cores total (prod) |
| Memory | 64+ GB total (prod) |
| Storage | SSD persistent volumes |
| Network | CNI (Calico/Cilium), Ingress controller |
| Secrets | External secrets operator (Vault/SealedSecrets) |

#### Namespace Structure

```yaml
# Base namespaces
apiVersion: v1
kind: Namespace
metadata:
  name: diamondflow-system      # Operators, monitoring
---
apiVersion: v1
kind: Namespace
metadata:
  name: diamondflow-dev         # Development
---
apiVersion: v1
kind: Namespace
metadata:
  name: diamondflow-staging     # Staging
---
apiVersion: v1
kind: Namespace
metadata:
  name: diamondflow-prod        # Production
```

#### Helm Release Structure

```bash
# Infrastructure (once per cluster)
helm install postgresql oci://registry-1.docker.io/bitnamicharts/postgresql -n diamondflow-system
helm install redis oci://registry-1.docker.io/bitnamicharts/redis -n diamondflow-system
helm install minio oci://registry-1.docker.io/bitnamicharts/minio -n diamondflow-system
helm install nginx-ingress oci://registry-1.docker.io/bitnamicharts/nginx-ingress-controller -n diamondflow-system
helm install cert-manager jetstack/cert-manager -n diamondflow-system
helm install external-secrets external-secrets/external-secrets -n diamondflow-system

# Application (per environment)
helm install diamondflow ./infrastructure/deployment/helm/diamondflow \
  -n diamondflow-prod \
  -f ./infrastructure/deployment/helm/diamondflow/values-prod.yaml \
  --set image.tag=v1.2.3 \
  --set secrets.clerkPublishableKey=pk_live_... \
  --set secrets.clerkSecretKey=sk_live_... \
  --set secrets.databaseUrl=postgresql://... \
  --set secrets.redisUrl=redis://... \
  --set secrets.s3Endpoint=https://s3.amazonaws.com
```

#### Key Helm Values (Production)

```yaml
# values-prod.yaml
replicaCount:
  api: 5
  web: 3
  worker: 3
  realtime: 3

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilization: 70
  targetMemoryUtilization: 80

resources:
  api:
    requests:
      cpu: "500m"
      memory: "1Gi"
    limits:
      cpu: "2000m"
      memory: "4Gi"
  web:
    requests:
      cpu: "250m"
      memory: "512Mi"
    limits:
      cpu: "1000m"
      memory: "2Gi"
  worker:
    requests:
      cpu: "500m"
      memory: "1Gi"
    limits:
      cpu: "2000m"
      memory: "4Gi"

database:
  host: postgresql.diamondflow-system.svc.cluster.local
  port: 5432
  name: diamondflow
  sslMode: require
  poolSize: 20

redis:
  host: redis-master.diamondflow-system.svc.cluster.local
  port: 6379
  sentinel:
    enabled: true
    masterName: mymaster

s3:
  endpoint: https://s3.amazonaws.com
  bucket: diamondflow-prod
  region: us-east-1

monitoring:
  enabled: true
  prometheus:
    scrapeInterval: 15s
  grafana:
    enabled: true
  loki:
    enabled: true
  tempo:
    enabled: true

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "1000"
  hosts:
    - host: api.diamondflow.com
      paths:
        - path: /
          pathType: Prefix
    - host: app.diamondflow.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: diamondflow-tls
      hosts:
        - api.diamondflow.com
        - app.diamondflow.com

featureFlags:
  aiEnabled: true
  advancedScheduling: true
  multiCurrency: false
```

### Database Migrations

#### Development
```bash
# Apply migrations
npx prisma migrate dev --name <migration_name>

# Reset database (dev only)
npx prisma migrate reset --force
```

#### Production
```bash
# Generate SQL migration file
npx prisma migrate diff \
  --from-migrations ./prisma/migrations \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script > migrations/20240115000000_add_feature.sql

# Review SQL, then apply via CI/CD
# NEVER run prisma migrate deploy directly in prod
```

#### Migration Checklist
- [ ] Migration reviewed by 2 engineers
- [ ] Backward compatible (no breaking changes)
- [ ] Tested on staging with production data volume
- [ ] Rollback plan documented
- [ ] Maintenance window scheduled (if locking tables)
- [ ] Post-migration validation queries prepared

### Blue-Green Deployment

```bash
# 1. Deploy to green namespace
helm install diamondflow-green ./helm/diamondflow -n diamondflow-green -f values-prod.yaml

# 2. Run smoke tests against green
./scripts/smoke-test.sh https://green-api.diamondflow.com

# 3. Switch ingress traffic
kubectl patch ingress diamondflow -n diamondflow-prod -p '{"spec":{"rules":[{"host":"api.diamondflow.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"diamondflow-green-api","port":{"number":3000}}}]}}]}}'

# 4. Monitor for 30 minutes
# 5. Decommission blue
helm uninstall diamondflow-blue -n diamondflow-prod
```

### Rollback Procedure

```bash
# Option 1: Helm rollback (preferred)
helm rollback diamondflow <revision> -n diamondflow-prod

# Option 2: Re-deploy previous image
helm upgrade diamondflow ./helm/diamondflow -n diamondflow-prod \
  --set image.tag=v1.2.2 \
  --reuse-values

# Option 3: Blue-green switch back
kubectl patch ingress diamondflow -n diamondflow-prod -p '{"spec":{"rules":[{"host":"api.diamondflow.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"diamondflow-blue-api","port":{"number":3000}}}]}}]}}'
```

---

## Monitoring & Observability

### Dashboards (Grafana)

| Dashboard | UID | Key Metrics |
|-----------|-----|-------------|
| API Performance | `api-performance` | Latency (p50/p95/p99), error rate, throughput, saturation |
| Business Metrics | `business-metrics` | Orders, revenue, WIP, yield, OEE, OTD |
| Manufacturing OEE | `manufacturing-oee` | Availability, performance, quality per work center |
| Inventory Health | `inventory-health` | Stock levels, turns, aging, reservations |
| System Resources | `system-resources` | CPU, memory, disk, network, GC |
| Database | `database` | Connections, query latency, locks, replication lag |
| Queue Health | `queue-health` | Job throughput, latency, failures, retries |
| Real-time | `realtime` | WebSocket connections, messages/sec, rooms |

### Key Alerts (PrometheusRule)

```yaml
groups:
- name: diamondflow-critical
  rules:
  - alert: APIHighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "API error rate > 5%"
      
  - alert: DatabaseConnectionsHigh
    expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Database connections > 80%"
      
  - alert: QueueBacklogGrowing
    expr: increase(bullmq_jobs_waiting[10m]) > 1000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Queue backlog growing"
      
  - alert: ManufacturingOEELow
    expr: oee_overall < 0.65
    for: 30m
    labels:
      severity: warning
    annotations:
      summary: "OEE below 65% for {{ $labels.work_center }}"
      
  - alert: WIPAgingHigh
    expr: wip_aging_hours{bucket="24h+"} > 100
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "WIP aging > 24 hours"
      
  - alert: InventoryStockout
    expr: inventory_available_qty < inventory_reorder_point
    for: 0m
    labels:
      severity: critical
    annotations:
      summary: "Stockout risk for {{ $labels.item_id }}"
      
  - alert: ERPSyncFailed
    expr: increase(erp_sync_failed_total[1h]) > 0
    for: 0m
    labels:
      severity: critical
    annotations:
      summary: "ERP sync failed"
      
  - alert: CertificateExpiring
    expr: certificate_expiry_days < 30
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "Certificate expiring in {{ $value }} days"
```

### Log Aggregation (Loki)

#### Log Labels
```json
{
  "app": "diamondflow-api",
  "environment": "prod",
  "namespace": "diamondflow-prod",
  "pod": "diamondflow-api-7b9c8f5-xyz",
  "container": "api",
  "level": "info",
  "logger": "SalesOrderService",
  "trace_id": "abc123",
  "span_id": "def456",
  "company_id": "comp_123",
  "user_id": "user_456"
}
```

#### Log Queries
```logql
# Errors in last hour
{app="diamondflow-api", level="error"} | json | __error__="" | line_format "{{.message}}"

# Slow queries
{app="diamondflow-api", logger="PrismaClient"} | json | duration > 1000

# Business events
{app="diamondflow-api", logger="EventPublisher"} | json | event_type="SalesOrderCreated"

# User actions
{app="diamondflow-api"} | json | user_id="user_123"
```

### Distributed Tracing (Tempo)

#### Trace Sampling
- Development: 100%
- Staging: 50%
- Production: 10% (tail-based sampling for errors)

#### Key Spans
```
HTTP Request (api)
├── Auth Middleware
├── Permission Check
├── Domain Use Case
│   ├── Repository Query
│   ├── Domain Service
│   └── Event Publisher (Outbox)
├── Database Transaction
└── Response Serialization
```

---

## Runbooks

### Runbook: API High Latency

**Symptoms:** p99 latency > 2s, user complaints

**Diagnosis:**
1. Check Grafana `api-performance` dashboard
2. Identify slow endpoints: `Top 10 Slowest Endpoints` panel
3. Check database: `Database` dashboard → query latency
4. Check queue: `Queue Health` → worker utilization
5. Check external calls: `HTTP Client` spans in traces

**Resolution:**
- Slow query: Add index, optimize query, increase `statement_timeout`
- Queue backlog: Scale workers, check for stuck jobs
- External API: Enable circuit breaker, increase timeout
- Cold start: Increase min replicas, enable keep-alive

### Runbook: Database Connection Exhaustion

**Symptoms:** `DatabaseConnectionsHigh` alert, new connections fail

**Diagnosis:**
1. `SELECT * FROM pg_stat_activity WHERE state = 'idle';`
2. Check connection pool settings (Prisma: `connection_limit`)
3. Look for long-running transactions: `SELECT * FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '30 seconds';`

**Resolution:**
- Kill idle connections: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND now() - state_change > interval '10 minutes';`
- Increase pool size temporarily
- Fix connection leaks in code (missing `await` on transactions)

### Runbook: ERP Sync Failure

**Symptoms:** `ERPSyncFailed` alert, inventory discrepancies

**Diagnosis:**
1. Check sync history: `GET /api/v1/inventory/erp-sync/history`
2. Get failed sync details: `GET /api/v1/inventory/erp-sync/:id`
3. Review conflicts: `GET /api/v1/inventory/erp-sync/:id/conflicts`
4. Check connector logs: `kubectl logs -l app=diamondflow-worker,job=erp-sync`

**Resolution:**
- Data conflict: Resolve via `POST /api/v1/inventory/erp-sync/:id/resolve`
- Schema change: Update mapping version, re-run
- Connector auth: Refresh credentials in Vault
- Network: Check VPN/firewall to legacy ERP

### Runbook: Manufacturing OEE Drop

**Symptoms:** `ManufacturingOEELow` alert, production delays

**Diagnosis:**
1. Check OEE dashboard: Identify affected work centers
2. Drill into availability: Downtime reasons (planned/unplanned)
3. Drill into performance: Actual vs ideal cycle time
4. Drill into quality: Scrap/rework rate

**Resolution:**
- Availability: Schedule preventive maintenance, reduce changeover time
- Performance: Optimize tooling, reduce micro-stops, operator training
- Quality: Root cause analysis on scrap, adjust inspection sampling

### Runbook: Certificate Expiry

**Symptoms:** `CertificateExpiring` alert, bagging blocked

**Diagnosis:**
1. List expiring: `GET /api/v1/certificates?expiringIn=30`
2. Check lab status: `GET /api/v1/certificates/:id/lab-status`
3. Verify diamond eligibility: `GET /api/v1/diamonds/:id/certification-required`

**Resolution:**
- Submit for certification: `POST /api/v1/certificates/request`
- Expedite with lab: Contact lab account manager
- Temporary waiver: `POST /api/v1/certificates/:id/waiver` (requires approval)

---

## Disaster Recovery

### RPO/RTO Targets

| Component | RPO | RTO | Strategy |
|-----------|-----|-----|----------|
| PostgreSQL | 1 hour | 4 hours | Point-in-time recovery (WAL-G) |
| Redis | 1 hour | 2 hours | AOF + RDB snapshots |
| Object Storage | 0 | 1 hour | Cross-region replication (S3 CRR) |
| Application | 0 | 15 minutes | Blue-green, container images |
| Configuration | 0 | 5 minutes | GitOps (ArgoCD), sealed secrets |

### Backup Schedule

```yaml
# PostgreSQL (WAL-G)
wal-g:
  backupSchedule: "0 2 * * *"      # Daily at 2 AM
  walArchive: true
  retentionDays: 30
  s3Prefix: s3://diamondflow-backups/postgresql/

# Redis
redis:
  snapshotSchedule: "0 */6 * * *"  # Every 6 hours
  aofEnabled: true
  retentionDays: 7

# Application Config (GitOps)
argocd:
  syncWave: -1
  autoSync: true
  prune: true
```

### Recovery Procedures

#### PostgreSQL Point-in-Time Recovery
```bash
# 1. Stop application traffic
kubectl scale deployment diamondflow-api --replicas=0 -n diamondflow-prod

# 2. Restore from WAL-G
wal-g backup-fetch LATEST /var/lib/postgresql/data

# 3. Create recovery.signal with target time
echo "recovery_target_time = '2024-01-15 10:00:00'" > /var/lib/postgresql/data/recovery.signal

# 4. Start PostgreSQL
systemctl start postgresql

# 5. Verify data integrity
psql -c "SELECT count(*) FROM sales_orders WHERE created_at > '2024-01-15 10:00:00';"

# 6. Restart application
kubectl scale deployment diamondflow-api --replicas=5 -n diamondflow-prod
```

#### Full Cluster Recovery (Terraform)
```bash
# 1. Provision infrastructure
cd infrastructure/deployment/terraform/environments/prod
terraform apply -auto-approve

# 2. Install platform operators
kubectl apply -k infrastructure/deployment/kubernetes/base

# 3. Deploy application via ArgoCD
argocd app sync diamondflow-prod

# 4. Restore database (see above)

# 5. Verify all health checks
./scripts/health-check.sh all
```

---

## Security Operations

### Certificate Rotation

```bash
# TLS certificates (cert-manager handles automatically)
# Verify: kubectl get certificates -n diamondflow-prod

# Database certificates (rotate annually)
# 1. Generate new cert
# 2. Update Kubernetes secret
kubectl create secret generic postgresql-tls \
  --from-file=ca.crt=new-ca.crt \
  --from-file=client.crt=new-client.crt \
  --from-file=client.key=new-client.key \
  --dry-run=client -o yaml | kubectl apply -f -

# 3. Rollout restart
kubectl rollout restart statefulset/postgresql -n diamondflow-system
```

### Secret Rotation

```bash
# Clerk keys (rotate quarterly)
# 1. Generate new keys in Clerk dashboard
# 2. Update ExternalSecret
kubectl patch externalsecret clerk-keys -n diamondflow-prod -p '{"data":[{"key":"publishableKey","value":"pk_live_new"},{"key":"secretKey","value":"sk_live_new"}]}'

# 3. Restart API pods
kubectl rollout restart deployment/diamondflow-api -n diamondflow-prod

# Database password (rotate monthly via Vault)
# Handled by Vault dynamic secrets + External Secrets Operator
```

### Security Scanning

```bash
# Container images (Trivy in CI)
trivy image --severity HIGH,CRITICAL ghcr.io/diamondflow/api:v1.2.3

# Dependencies (npm audit in CI)
npm audit --audit-level=high

# SAST (SonarQube in CI)
sonar-scanner -Dsonar.projectKey=diamondflow

# DAST (OWASP ZAP in staging)
zap-api-scan.py -t https://staging-api.diamondflow.com/api/v1/openapi.json
```

---

## Capacity Planning

### Scaling Triggers

| Metric | Scale Up | Scale Down |
|--------|----------|------------|
| CPU > 70% (5m) | +1 replica | < 30% (15m) |
| Memory > 80% (5m) | +1 replica | < 50% (15m) |
| Queue depth > 1000 | +2 workers | < 100 (10m) |
| DB connections > 80% | +1 read replica | < 50% (30m) |
| WebSocket connections > 80% | +1 realtime pod | < 50% (10m) |

### Resource Estimates (Production)

| Service | Replicas | CPU/Replica | Memory/Replica | Monthly Cost (AWS) |
|---------|----------|-------------|----------------|-------------------|
| API | 5-20 | 2 vCPU | 4 GB | $2,400 |
| Web | 3-10 | 1 vCPU | 2 GB | $720 |
| Worker | 3-15 | 2 vCPU | 4 GB | $1,800 |
| Realtime | 3-8 | 1 vCPU | 2 GB | $500 |
| PostgreSQL | 1 primary + 2 replica | 8 vCPU | 32 GB | $3,200 |
| Redis | 3 nodes (cluster) | 4 vCPU | 16 GB | $1,200 |
| MinIO | 4 nodes | 4 vCPU | 16 GB | $1,500 |
| **Total** | | | | **~$11,320/month** |

---

## Maintenance Windows

| Activity | Frequency | Window | Duration | Impact |
|----------|-----------|--------|----------|--------|
| PostgreSQL vacuum | Daily | 03:00-04:00 UTC | 30 min | Minimal |
| Redis snapshot | 6 hours | Rolling | 5 min | None |
| Security patches | Weekly | Sunday 02:00-06:00 UTC | 2 hours | Rolling restart |
| Dependency updates | Monthly | Sunday 02:00-06:00 UTC | 4 hours | Rolling restart |
| Major version upgrade | Quarterly | Planned | 8 hours | Read-only mode |
| DR drill | Quarterly | Planned | 4 hours | None (parallel) |

---

## Support Contacts

| Role | Primary | Secondary | Escalation |
|------|---------|-----------|------------|
| Platform Engineer | Alice Chen | Bob Smith | VP Engineering |
| Database Admin | Carol Lee | David Kim | CTO |
| Security | Eve Wilson | Frank Brown | CISO |
| Application | Grace Liu | Henry Taylor | Engineering Manager |
| Manufacturing | Irene Park | Jack Miller | COO |

---

## Communication Channels

- **Incidents:** `#incidents` (Slack), PagerDuty
- **Deployments:** `#deployments` (Slack), GitHub Actions
- **Monitoring:** `#alerts` (Slack), Alertmanager
- **General:** `#diamondflow-ops` (Slack)