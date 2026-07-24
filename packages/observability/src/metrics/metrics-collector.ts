import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsCollector implements OnModuleInit {
  private registry: Registry;
  
  // HTTP metrics
  public httpRequestsTotal!: Counter;
  public httpRequestDuration!: Histogram;
  
  // Database metrics
  public dbQueryDuration!: Histogram;
  public dbConnectionsActive!: Gauge;
  
  // Event metrics
  public eventsPublishedTotal!: Counter;
  public eventsProcessedTotal!: Counter;
  public eventsFailedTotal!: Counter;
  
  // Queue metrics
  public queueJobsTotal!: Counter;
  public queueJobDuration!: Histogram;
  public queueJobsWaiting!: Gauge;
  public queueJobsActive!: Gauge;
  
  // Business metrics
  public activeUsers!: Gauge;
  public wipCount!: Gauge;
  public oeeOverall!: Gauge;
  public yieldRate!: Gauge;
  public onTimeDelivery!: Gauge;
  public inventoryTurns!: Gauge;
  public productionOrdersCompleted!: Counter;
  public salesOrdersCreated!: Counter;
  public purchaseOrdersCreated!: Counter;
  public shipmentsDispatched!: Counter;
  public invoicesGenerated!: Counter;
  public paymentsReceived!: Counter;
  public ncrsCreated!: Counter;
  public certificatesValidated!: Counter;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry, prefix: 'diamondflow_' });
    this.initializeMetrics();
  }

  onModuleInit(): void {
    this.dbConnectionsActive.set(0);
  }

  private initializeMetrics(): void {
    // HTTP
    this.httpRequestsTotal = new Counter({
      name: 'diamondflow_http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'diamondflow_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    // Database
    this.dbQueryDuration = new Histogram({
      name: 'diamondflow_db_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['query_type', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
      registers: [this.registry],
    });

    this.dbConnectionsActive = new Gauge({
      name: 'diamondflow_db_connections_active',
      help: 'Active database connections',
      registers: [this.registry],
    });

    // Events
    this.eventsPublishedTotal = new Counter({
      name: 'diamondflow_events_published_total',
      help: 'Total events published to outbox',
      labelNames: ['event_type', 'status'],
      registers: [this.registry],
    });

    this.eventsProcessedTotal = new Counter({
      name: 'diamondflow_events_processed_total',
      help: 'Total events processed by consumers',
      labelNames: ['consumer', 'event_type', 'status'],
      registers: [this.registry],
    });

    this.eventsFailedTotal = new Counter({
      name: 'diamondflow_events_failed_total',
      help: 'Total events failed after retries',
      labelNames: ['consumer', 'event_type'],
      registers: [this.registry],
    });

    // Queue
    this.queueJobsTotal = new Counter({
      name: 'diamondflow_queue_jobs_total',
      help: 'Total queue jobs',
      labelNames: ['queue', 'status'],
      registers: [this.registry],
    });

    this.queueJobDuration = new Histogram({
      name: 'diamondflow_queue_job_duration_seconds',
      help: 'Queue job processing duration',
      labelNames: ['queue', 'job_type'],
      buckets: [1, 5, 10, 30, 60, 300, 600, 1800, 3600],
      registers: [this.registry],
    });

    this.queueJobsWaiting = new Gauge({
      name: 'diamondflow_queue_jobs_waiting',
      help: 'Jobs waiting in queue',
      labelNames: ['queue'],
      registers: [this.registry],
    });

    this.queueJobsActive = new Gauge({
      name: 'diamondflow_queue_jobs_active',
      help: 'Jobs currently being processed',
      labelNames: ['queue'],
      registers: [this.registry],
    });

    // Business
    this.activeUsers = new Gauge({
      name: 'diamondflow_active_users',
      help: 'Active users',
      labelNames: ['company_id'],
      registers: [this.registry],
    });

    this.wipCount = new Gauge({
      name: 'diamondflow_wip_count',
      help: 'Work in progress count',
      labelNames: ['factory_id', 'department_id'],
      registers: [this.registry],
    });

    this.oeeOverall = new Gauge({
      name: 'diamondflow_oee_overall',
      help: 'Overall Equipment Effectiveness',
      labelNames: ['work_center_id'],
      registers: [this.registry],
    });

    this.yieldRate = new Gauge({
      name: 'diamondflow_yield_rate',
      help: 'Manufacturing yield rate',
      labelNames: ['operation_id'],
      registers: [this.registry],
    });

    this.onTimeDelivery = new Gauge({
      name: 'diamondflow_on_time_delivery',
      help: 'On-time delivery rate',
      labelNames: ['company_id'],
      registers: [this.registry],
    });

    this.inventoryTurns = new Gauge({
      name: 'diamondflow_inventory_turns',
      help: 'Inventory turnover ratio',
      labelNames: ['warehouse_id'],
      registers: [this.registry],
    });

    this.productionOrdersCompleted = new Counter({
      name: 'diamondflow_production_orders_completed_total',
      help: 'Total completed production orders',
      labelNames: ['factory_id', 'product_id'],
      registers: [this.registry],
    });

    this.salesOrdersCreated = new Counter({
      name: 'diamondflow_sales_orders_created_total',
      help: 'Total sales orders created',
      labelNames: ['company_id', 'customer_id'],
      registers: [this.registry],
    });

    this.purchaseOrdersCreated = new Counter({
      name: 'diamondflow_purchase_orders_created_total',
      help: 'Total purchase orders created',
      labelNames: ['company_id', 'vendor_id'],
      registers: [this.registry],
    });

    this.shipmentsDispatched = new Counter({
      name: 'diamondflow_shipments_dispatched_total',
      help: 'Total shipments dispatched',
      labelNames: ['company_id', 'carrier_id'],
      registers: [this.registry],
    });

    this.invoicesGenerated = new Counter({
      name: 'diamondflow_invoices_generated_total',
      help: 'Total invoices generated',
      labelNames: ['company_id'],
      registers: [this.registry],
    });

    this.paymentsReceived = new Counter({
      name: 'diamondflow_payments_received_total',
      help: 'Total payments received',
      labelNames: ['company_id', 'currency'],
      registers: [this.registry],
    });

    this.ncrsCreated = new Counter({
      name: 'diamondflow_ncrs_created_total',
      help: 'Total NCRs created',
      labelNames: ['factory_id', 'disposition'],
      registers: [this.registry],
    });

    this.certificatesValidated = new Counter({
      name: 'diamondflow_certificates_validated_total',
      help: 'Total certificates validated',
      labelNames: ['lab_id', 'status'],
      registers: [this.registry],
    });
  }

  getRegistry(): Registry {
    return this.registry;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  async getContentType(): Promise<string> {
    return this.registry.contentType;
  }
}
