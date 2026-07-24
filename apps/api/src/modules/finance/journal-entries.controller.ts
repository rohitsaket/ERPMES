import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import type { CreateJournalEntryDto, JournalEntryQueryDto } from './dto/finance.dto';

@ApiTags('Journal Entries')
@Controller('finance/journal-entries')
export class JournalEntriesController {
  constructor(private readonly service: FinanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a journal entry with lines' })
  async create(@Body() dto: CreateJournalEntryDto) {
    return this.service.createJournalEntry(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List journal entries' })
  async findAll(@Query() query: JournalEntryQueryDto) {
    return this.service.findAllJournalEntries(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  @ApiParam({ name: 'id', description: 'Journal Entry ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneJournalEntry(id);
  }
}
