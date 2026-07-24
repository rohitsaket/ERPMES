import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { QualityService } from './quality.service';
import type { CreateInspectionPlanDto, UpdateInspectionPlanDto, InspectionPlanQueryDto, CreateInspectionStepDto } from './dto/quality.dto';

@ApiTags('Inspection Plans')
@Controller('quality/inspection-plans')
export class InspectionPlansController {
  constructor(private readonly service: QualityService) {}

  @Post()
  @ApiOperation({ summary: 'Create an inspection plan with steps' })
  async create(@Body() dto: CreateInspectionPlanDto) {
    return this.service.createPlan(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List inspection plans' })
  async findAll(@Query() query: InspectionPlanQueryDto) {
    return this.service.findAllPlans(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inspection plan by ID' })
  @ApiParam({ name: 'id', description: 'Inspection Plan ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOnePlan(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inspection plan' })
  @ApiParam({ name: 'id', description: 'Inspection Plan ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateInspectionPlanDto) {
    return this.service.updatePlan(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inspection plan' })
  @ApiParam({ name: 'id', description: 'Inspection Plan ID' })
  async remove(@Param('id') id: string) {
    return this.service.removePlan(id);
  }

  @Post(':planId/steps')
  @ApiOperation({ summary: 'Add step to inspection plan' })
  async addStep(@Param('planId') planId: string, @Body() dto: CreateInspectionStepDto) {
    return this.service.addPlanStep(planId, dto);
  }

  @Delete(':planId/steps/:stepId')
  @ApiOperation({ summary: 'Remove step from inspection plan' })
  async removeStep(@Param('planId') planId: string, @Param('stepId') stepId: string) {
    return this.service.removePlanStep(planId, stepId);
  }
}
