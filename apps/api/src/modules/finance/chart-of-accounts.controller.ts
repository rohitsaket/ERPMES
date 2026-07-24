import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import type { CreateAccountDto, UpdateAccountDto, AccountQueryDto } from './dto/finance.dto';

@ApiTags('Chart of Accounts')
@Controller('finance/chart-of-accounts')
export class ChartOfAccountsController {
  constructor(private readonly service: FinanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a chart of account' })
  async create(@Body() dto: CreateAccountDto) {
    return this.service.createAccount(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List chart of accounts' })
  async findAll(@Query() query: AccountQueryDto) {
    return this.service.findAllAccounts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneAccount(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.service.updateAccount(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  async remove(@Param('id') id: string) {
    return this.service.removeAccount(id);
  }
}
