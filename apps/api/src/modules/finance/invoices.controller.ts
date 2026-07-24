import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import type { CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto } from './dto/finance.dto';

@ApiTags('Invoices')
@Controller('finance/invoices')
export class InvoicesController {
  constructor(private readonly service: FinanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create an invoice with lines' })
  async create(@Body() dto: CreateInvoiceDto) {
    return this.service.createInvoice(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices' })
  async findAll(@Query() query: InvoiceQueryDto) {
    return this.service.findAllInvoices(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneInvoice(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.service.updateInvoice(id, dto);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Mark invoice as sent' })
  async send(@Param('id') id: string) {
    return this.service.updateInvoice(id, { status: 'SENT' });
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  async pay(@Param('id') id: string) {
    return this.service.updateInvoice(id, { status: 'PAID' });
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel invoice' })
  async cancel(@Param('id') id: string) {
    return this.service.updateInvoice(id, { status: 'CANCELLED' });
  }
}
