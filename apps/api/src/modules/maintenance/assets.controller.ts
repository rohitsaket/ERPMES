import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import type { CreateAssetDto, UpdateAssetDto, AssetQueryDto } from './dto/maintenance.dto';

@ApiTags('Assets')
@Controller('maintenance/assets')
export class AssetsController {
  constructor(private readonly service: MaintenanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a maintenance asset' })
  async create(@Body() dto: CreateAssetDto) {
    return this.service.createAsset(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List maintenance assets' })
  async findAll(@Query() query: AssetQueryDto) {
    return this.service.findAllAssets(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneAsset(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update asset' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.service.updateAsset(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete asset' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  async remove(@Param('id') id: string) {
    return this.service.removeAsset(id);
  }
}
