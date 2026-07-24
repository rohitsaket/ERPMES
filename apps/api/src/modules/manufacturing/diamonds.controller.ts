import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { DiamondsService } from './diamonds.service';
import type { CreateDiamondDto, UpdateDiamondDto, QueryDiamondDto, CreatePacketDto, UpdatePacketDto } from './dto/manufacturing.dto';

@Controller('manufacturing')
export class DiamondsController {
  constructor(private readonly service: DiamondsService) {}

  @Post('diamonds') createDiamond(@Body() dto: CreateDiamondDto) { return this.service.create(dto); }
  @Get('diamonds') findAllDiamonds(@Query() query: QueryDiamondDto) { return this.service.findAll(query); }
  @Get('diamonds/:id') findOneDiamond(@Param('id') id: string) { return this.service.findOne(id); }
  @Put('diamonds/:id') updateDiamond(@Param('id') id: string, @Body() dto: UpdateDiamondDto) { return this.service.update(id, dto); }
  @Delete('diamonds/:id') removeDiamond(@Param('id') id: string) { return this.service.remove(id); }

  @Post('packets') createPacket(@Body() dto: CreatePacketDto) { return this.service.createPacket(dto); }
  @Get('packets') findAllPackets(@Query() query: any) { return this.service.findAllPackets(query); }
  @Get('packets/:id') findOnePacket(@Param('id') id: string) { return this.service.findOnePacket(id); }
  @Put('packets/:id') updatePacket(@Param('id') id: string, @Body() dto: UpdatePacketDto) { return this.service.updatePacket(id, dto); }
}
