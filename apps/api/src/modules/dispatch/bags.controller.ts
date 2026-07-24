import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { DispatchService } from './dispatch.service';
import type { CreateBagDto, UpdateBagDto, BagQueryDto } from './dto/dispatch.dto';

@ApiTags('Bags')
@Controller('dispatch/bags')
export class BagsController {
  constructor(private readonly service: DispatchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a bag' })
  async create(@Body() dto: CreateBagDto) {
    return this.service.createBag(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bags' })
  async findAll(@Query() query: BagQueryDto) {
    return this.service.findAllBags(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bag by ID' })
  @ApiParam({ name: 'id', description: 'Bag ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneBag(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bag' })
  @ApiParam({ name: 'id', description: 'Bag ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateBagDto) {
    return this.service.updateBag(id, dto);
  }
}
