import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { AdminGuard } from './guards/admin.guard';
import { MemberGuard } from './guards/member.guard';
import { EventsService } from './events.service';

type AuthenticatedRequest = Request & {
  user: { userId: number };
};

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')
  list(@Query('upcoming') upcoming?: string) {
    return this.eventsService.list(upcoming === 'true');
  }

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard, MemberGuard)
  register(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.eventsService.register(id, request.user.userId);
  }
}
