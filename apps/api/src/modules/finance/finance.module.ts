import { Module } from '@nestjs/common';
import { ChartOfAccountsController } from './chart-of-accounts.controller';
import { InvoicesController } from './invoices.controller';
import { PaymentsController } from './payments.controller';
import { JournalEntriesController } from './journal-entries.controller';
import { FinanceService } from './finance.service';

@Module({
  controllers: [ChartOfAccountsController, InvoicesController, PaymentsController, JournalEntriesController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
