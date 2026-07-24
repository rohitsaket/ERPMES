import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import type { CreatePaymentDto, PaymentQueryDto } from './dto/finance.dto';

@ApiTags('Payments')
@Controller('finance/payments')
export class PaymentsController {
  constructor(private readonly service: FinanceService) {}

  @Post()
  @ApiOperation({ summary: 'Record a payment' })
  async create(@Body() dto: CreatePaymentDto) {
    return this.service.createPayment(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List payments' })
  async findAll(@Query() query: PaymentQueryDto) {
    return this.service.findAllPayments(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOnePayment(id);
  }
}
