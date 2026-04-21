import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Injectable()
export class RsvpService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateRsvpDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project không tồn tại');

    return this.prisma.rSVPResponse.create({
      data: { projectId, ...dto },
    });
  }

  async findAll(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project không tồn tại');
    if (project.userId !== userId) throw new ForbiddenException();

    return this.prisma.rSVPResponse.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
