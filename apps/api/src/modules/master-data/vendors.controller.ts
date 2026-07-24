import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto, VendorQueryDto } from './dto/vendor.dto';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Vendor code already exists' })
  async create(@Body() createVendorDto: any) {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all vendors' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of vendors' })
  async findAll(@Query() query: any) {
    return this.vendorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vendor by ID' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor details' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vendorsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @ApiResponse({ status: 409, description: 'Vendor code already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVendorDto: any,
  ) {
    return this.vendorsService.update(id, updateVendorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vendorsService.remove(id);
  }
}
