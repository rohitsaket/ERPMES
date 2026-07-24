import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QuotationsService } from './quotations.service';

@ApiTags('Quotations')
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quotation' })
  @ApiResponse({ status: 201, description: 'Quotation created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createQuotationDto: any) {
    return this.quotationsService.create(createQuotationDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all quotations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of quotations' })
  async findAll(@Query() query: any) {
    return this.quotationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quotation by ID' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({ status: 200, description: 'Quotation details' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({ status: 200, description: 'Quotation updated successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuotationDto: any,
  ) {
    return this.quotationsService.update(id, updateQuotationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({ status: 200, description: 'Quotation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.remove(id);
  }
}
