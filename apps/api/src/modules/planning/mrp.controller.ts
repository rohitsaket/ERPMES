import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MrpService } from './mrp.service';

@ApiTags('Planning - MRP')
@Controller('planning/mrp')
export class MrpController {
  constructor(private readonly service: MrpService) {}

  @Get('runs')
  @ApiOperation({ summary: 'List MRP runs' })
  @ApiQuery({ name: 'companyId', required: false })
  findRuns(@Query('companyId') companyId?: string) {
    return this.service.findRuns(companyId);
  }

  @Get('exceptions')
  @ApiOperation({ summary: 'List exceptions for an MRP run' })
  findExceptions(
    @Query('runId') runId: string,
    @Query('type') type?: string,
    @Query('severity') severity?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findExceptions(runId, { type, severity, search });
  }
}
