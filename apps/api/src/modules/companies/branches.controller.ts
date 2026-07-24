import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';

@ApiTags('companies/branches')
@Controller('companies/:companyId/branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  async findAll(@Query() query: any, @Param('companyId') companyId: string) {
    return this.branchesService.findAll({ ...query, companyId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Post()
  async create(@Body() createBranchDto: any) {
    return this.branchesService.create(createBranchDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBranchDto: any) {
    return this.branchesService.update(id, updateBranchDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}