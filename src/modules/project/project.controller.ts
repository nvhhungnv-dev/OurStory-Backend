import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard)
  @Post('projects')
  create(@Request() req, @Body() dto: CreateProjectDto) {
    return this.projectService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('projects')
  findAll(@Request() req) {
    return this.projectService.findAll(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('projects/:id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.projectService.findOne(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('projects/:id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('projects/:id')
  remove(@Request() req, @Param('id') id: string) {
    return this.projectService.remove(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('projects/:id/publish')
  publish(@Request() req, @Param('id') id: string) {
    return this.projectService.publish(req.user.id, id);
  }

  @Get('p/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.projectService.findBySlug(slug);
  }
}
