import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { OperationsService } from './operations.service';
import type { CreateOperationDto, UpdateOperationDto, QueryOperationDto, CompleteOperationDto } from './dto/manufacturing.dto';

@Controller('manufacturing/operations')
export class OperationsController {
  constructor(private readonly service: OperationsService) {}

  @Post() create(@Body() dto: CreateOperationDto) { return this.service.create(dto); }
  @Get() findAll(@Query() query: QueryOperationDto) { return this.service.findAll(query); }
  @Get('shop-floor') shopFloor(@Query('factoryId') factoryId: string) { return this.service.getShopFloor(factoryId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateOperationDto) { return this.service.update(id, dto); }
  @Post(':id/start') start(@Param('id') id: string) { return this.service.start(id); }
  @Post(':id/pause') pause(@Param('id') id: string) { return this.service.pause(id); }
  @Post(':id/resume') resume(@Param('id') id: string) { return this.service.resume(id); }
  @Post(':id/hold') hold(@Param('id') id: string) { return this.service.hold(id); }
  @Post(':id/complete') complete(@Param('id') id: string, @Body() dto: CompleteOperationDto) { return this.service.complete(id, dto); }
}
