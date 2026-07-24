import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@diamondflow/auth';
import { AuthorizationModule } from '@diamondflow/authorization';
import { DatabaseModule } from '@diamondflow/database';
import { EventsModule } from '@diamondflow/events';
import { QueueModule } from '@diamondflow/queue';
import { RealtimeModule } from '@diamondflow/realtime';
import { ObservabilityModule } from '@diamondflow/observability';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './modules/companies/companies.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { SalesModule } from './modules/sales/sales.module';
import { PlanningModule } from './modules/planning/planning.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ManufacturingModule } from './modules/manufacturing/manufacturing.module';
import { QualityModule } from './modules/quality/quality.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    AuthModule,
    AuthorizationModule,
    DatabaseModule,
    EventsModule,
    ...(process.env.QUEUE_ENABLED === 'true' ? [QueueModule] : []),
    RealtimeModule,
    ObservabilityModule,

    // Business Modules
    CompaniesModule,
    MasterDataModule,
    SalesModule,
    PlanningModule,
    ProcurementModule,
    InventoryModule,
    ManufacturingModule,
    QualityModule,
    MaintenanceModule,
    DispatchModule,
    FinanceModule,
    ReturnsModule,
    AnalyticsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
