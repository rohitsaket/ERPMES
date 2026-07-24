import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import type { CreateWorkOrderDto, UpdateWorkOrderDto, WorkOrderQueryDto } from './dto/maintenance.dto';

@ApiTags('Work Orders')
@Controller('maintenance/work-orders')
export class WorkOrdersController {
  constructor(private readonly service: MaintenanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a work order' })
  async create(@Body() dto: CreateWorkOrderDto) {
    return this.service.createWorkOrder(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List work orders' })
  async findAll(@Query() query: WorkOrderQueryDto) {
    return this.service.findAllWorkOrders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work order by ID' })
  @ApiParam({ name: 'id', description: 'Work Order ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneWorkOrder(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update work order' })
  @ApiParam({ name: 'id', description: 'Work Order ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.service.updateWorkOrder(id, dto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start work order' })
  async start(@Param('id') id: string) {
    return this.service.updateWorkOrder(id, { status: 'IN_PROGRESS' });
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete work order' })
  async complete(@Param('id') id: string) {
    return this.service.updateWorkOrder(id, { status: 'COMPLETED', completedAt: new Date().toISOString() });
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel work order' })
  async cancel(@Param('id') id: string) {
    return this.service.updateWorkOrder(id, { status: 'CANCELLED' });
  }

  @Post(':workOrderId/tasks')
  @ApiOperation({ summary: 'Complete a task on work order' })
  async completeTask(
    @Param('workOrderId') workOrderId: string,
    @Body() dto: { seq: number; actualHours: number; completedBy: string },
  ) {
    return this.service.completeTask(workOrderId, dto);
  }
}
