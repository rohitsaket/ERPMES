import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseUUIDPipe, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto, VendorQueryDto, BulkDeleteVendorDto } from './dto/vendor.dto';

@ApiTags('Vendors')
@Controller('vendors')
// @UseGuards(JwtAuthGuard) // Assuming standard enterprise setup, will leave commented if auth is global or setup differently in this codebase
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get vendor dashboard KPIs' })
  @ApiQuery({ name: 'companyId', required: true, type: String })
  async getDashboard(@Query('companyId') companyId: string) {
    return this.vendorsService.getDashboard(companyId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get vendor statistics' })
  @ApiQuery({ name: 'companyId', required: true, type: String })
  async getStatistics(@Query('companyId') companyId: string) {
    return this.vendorsService.getStatistics(companyId);
  }

  @Get('categories/top')
  @ApiOperation({ summary: 'Get top vendor categories' })
  @ApiQuery({ name: 'companyId', required: true, type: String })
  async getTopCategories(@Query('companyId') companyId: string) {
    return this.vendorsService.getTopCategories(companyId);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top vendors by purchase volume' })
  @ApiQuery({ name: 'companyId', required: true, type: String })
  async getTopVendors(@Query('companyId') companyId: string) {
    return this.vendorsService.getTopVendors(companyId);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import vendors from payload' })
  async importVendors(@Body() data: any[]) {
    return this.vendorsService.importVendors(data);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export vendors to CSV/Excel' })
  async exportVendors(@Query() query: VendorQueryDto, @Res() res: any) {
    const data = await this.vendorsService.exportVendors(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=vendors.csv');
    return res.send(data);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk delete vendors' })
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteVendorDto) {
    return this.vendorsService.bulkDelete(bulkDeleteDto.ids);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  async create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all vendors with filtering and pagination' })
  async findAll(@Query() query: VendorQueryDto) {
    return this.vendorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vendor by ID' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vendorsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorsService.update(id, updateVendorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vendorsService.remove(id);
  }
}
