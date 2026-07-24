import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import type { CreateReturnAuthDto, UpdateReturnAuthDto, ReturnAuthQueryDto } from './dto/returns.dto';

@ApiTags('Return Authorizations')
@Controller('returns/authorizations')
export class AuthorizationsController {
  constructor(private readonly service: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a return authorization' })
  async create(@Body() dto: CreateReturnAuthDto) {
    return this.service.createReturnAuth(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List return authorizations' })
  async findAll(@Query() query: ReturnAuthQueryDto) {
    return this.service.findAllReturnAuths(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get return authorization by ID' })
  @ApiParam({ name: 'id', description: 'Return Authorization ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneReturnAuth(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update return authorization (approve/reject/disposition)' })
  @ApiParam({ name: 'id', description: 'Return Authorization ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateReturnAuthDto) {
    return this.service.updateReturnAuth(id, dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve return authorization' })
  async approve(@Param('id') id: string) {
    return this.service.updateReturnAuth(id, { status: 'APPROVED' });
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Mark items as received (receipt)' })
  async receive(@Param('id') id: string) {
    return this.service.updateReturnAuth(id, { status: 'RECEIVED' });
  }
}
