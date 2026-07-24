import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import type { CreatePmScheduleDto, UpdatePmScheduleDto, PmScheduleQueryDto } from './dto/maintenance.dto';

@ApiTags('PM Schedules')
@Controller('maintenance/schedules')
export class SchedulesController {
  constructor(private readonly service: MaintenanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a PM schedule' })
  async create(@Body() dto: CreatePmScheduleDto) {
    return this.service.createPmSchedule(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List PM schedules' })
  async findAll(@Query() query: PmScheduleQueryDto) {
    return this.service.findAllPmSchedules(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PM schedule by ID' })
  @ApiParam({ name: 'id', description: 'PM Schedule ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOnePmSchedule(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update PM schedule' })
  @ApiParam({ name: 'id', description: 'PM Schedule ID' })
  async update(@Param('id') id: string, @Body() dto: UpdatePmScheduleDto) {
    return this.service.updatePmSchedule(id, dto);
  }

  @Post(':id/complete-run')
  @ApiOperation({ summary: 'Record a completed PM run and update next run' })
  async completeRun(@Param('id') id: string, @Body() dto: { nextRun: string }) {
    return this.service.completePmRun(id, dto.nextRun);
  }
}
