import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { RfqsService } from './rfqs.service';
import { CreateRfqDto, UpdateRfqDto, QueryRfqDto } from './dto/rfq.dto';

@Controller('rfqs')
export class RfqsController {
  constructor(private readonly service: RfqsService) {}

  @Post() create(@Body() dto: CreateRfqDto) { return this.service.create(dto); }
  @Get() findAll(@Query() query: QueryRfqDto) { return this.service.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateRfqDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
  @Post(':id/send') send(@Param('id') id: string) { return this.service.send(id); }
}
