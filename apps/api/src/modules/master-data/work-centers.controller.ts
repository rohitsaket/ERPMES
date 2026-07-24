import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WorkCentersService } from './work-centers.service';
import { CreateWorkCenterDto, UpdateWorkCenterDto, WorkCenterQueryDto } from './dto/work-center.dto';

@ApiTags('Work Centers')
@Controller('work-centers')
export class WorkCentersController {
  constructor(private readonly workCentersService: WorkCentersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new work center' })
  @ApiResponse({ status: 201, description: 'Work center created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Work center name already exists in this department' })
  async create(@Body() createWorkCenterDto: any) {
    return this.workCentersService.create(createWorkCenterDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all work centers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of work centers' })
  async findAll(@Query() query: any) {
    return this.workCentersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a work center by ID' })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiResponse({ status: 200, description: 'Work center details' })
  @ApiResponse({ status: 404, description: 'Work center not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workCentersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a work center' })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiResponse({ status: 200, description: 'Work center updated successfully' })
  @ApiResponse({ status: 404, description: 'Work center not found' })
  @ApiResponse({ status: 409, description: 'Work center name already exists in this department' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWorkCenterDto: any,
  ) {
    return this.workCentersService.update(id, updateWorkCenterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a work center' })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiResponse({ status: 200, description: 'Work center deleted successfully' })
  @ApiResponse({ status: 404, description: 'Work center not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workCentersService.remove(id);
  }
}
