import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rsvp')
export class RsvpController {
  constructor(private rsvpService: RsvpService) {}

  @Post(':projectId')
  create(@Param('projectId') projectId: string, @Body() dto: CreateRsvpDto) {
    return this.rsvpService.create(projectId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':projectId')
  findAll(@Request() req, @Param('projectId') projectId: string) {
    return this.rsvpService.findAll(req.user.id, projectId);
  }
}
