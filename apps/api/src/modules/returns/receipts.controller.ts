import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import type { ReturnAuthQueryDto } from './dto/returns.dto';

@ApiTags('Receipts')
@Controller('returns/receipts')
export class ReceiptsController {
  constructor(private readonly service: ReturnsService) {}

  @Get()
  @ApiOperation({ summary: 'List received return authorizations (receipts)' })
  async findAll(@Query() query: ReturnAuthQueryDto) {
    return this.service.findAllReturnAuths({ ...query, status: 'RECEIVED' });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get receipt by RA ID' })
  @ApiParam({ name: 'id', description: 'Return Authorization ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneReturnAuth(id);
  }
}
