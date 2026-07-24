import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import type { AnalyticsQueryDto, CustomReportDto, CustomReportQueryDto } from './dto/analytics.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('oee')
  @ApiOperation({ summary: 'Get OEE (Overall Equipment Effectiveness) metrics' })
  async getOee(@Query() query: AnalyticsQueryDto) {
    return this.service.getOee(query);
  }

  @Get('yield')
  @ApiOperation({ summary: 'Get yield analysis' })
  async getYield(@Query() query: AnalyticsQueryDto) {
    return this.service.getYield(query);
  }

  @Get('otd')
  @ApiOperation({ summary: 'Get On-Time Delivery metrics' })
  async getOtd(@Query() query: AnalyticsQueryDto) {
    return this.service.getOtd(query);
  }

  @Get('wip-aging')
  @ApiOperation({ summary: 'Get WIP aging analysis' })
  async getWipAging(@Query() query: AnalyticsQueryDto) {
    return this.service.getWipAging(query);
  }

  @Get('capacity')
  @ApiOperation({ summary: 'Get capacity utilization' })
  async getCapacity(@Query() query: AnalyticsQueryDto) {
    return this.service.getCapacity(query);
  }

  @Post('custom-reports')
  @ApiOperation({ summary: 'Create a custom report' })
  async createCustomReport(@Body() dto: CustomReportDto) {
    return this.service.createCustomReport(dto);
  }

  @Get('custom-reports')
  @ApiOperation({ summary: 'List custom reports' })
  async listCustomReports(@Query() query: CustomReportQueryDto) {
    return this.service.listCustomReports(query);
  }

  @Get('custom-reports/:id')
  @ApiOperation({ summary: 'Get custom report by ID' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  async getCustomReport(@Param('id') id: string) {
    return this.service.getCustomReport(id);
  }

  @Get('custom-reports/:id/run')
  @ApiOperation({ summary: 'Execute custom report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  async runCustomReport(@Param('id') id: string, @Query() query: AnalyticsQueryDto) {
    return this.service.runCustomReport(id, query);
  }
}