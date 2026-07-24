import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SalesOrdersService } from './sales-orders.service';

@ApiTags('Sales Orders')
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sales order' })
  @ApiResponse({ status: 201, description: 'Sales order created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createSalesOrderDto: any) {
    return this.salesOrdersService.create(createSalesOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all sales orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of sales orders' })
  async findAll(@Query() query: any) {
    return this.salesOrdersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sales order by ID' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order details' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesOrdersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a sales order' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order updated successfully' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSalesOrderDto: any,
  ) {
    return this.salesOrdersService.update(id, updateSalesOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a sales order' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesOrdersService.remove(id);
  }
}
