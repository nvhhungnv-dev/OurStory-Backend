import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: { userId, templateId: dto.templateId, jsonData: dto.jsonData },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, templateId: true, shareSlug: true, createdAt: true, updatedAt: true },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project không tồn tại');
    if (project.userId !== userId) throw new ForbiddenException();
    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.findOne(userId, id);
    return this.prisma.project.update({ where: { id }, data: { jsonData: dto.jsonData } });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.project.delete({ where: { id } });
    return { success: true };
  }

  async publish(userId: string, id: string) {
    const project = await this.findOne(userId, id);
    if (project.shareSlug) return { slug: project.shareSlug };
    const slug = nanoid();
    await this.prisma.project.update({ where: { id }, data: { shareSlug: slug } });
    return { slug };
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({ where: { shareSlug: slug } });
    if (!project) throw new NotFoundException('Trang không tồn tại');
    this.prisma.project.update({
      where: { shareSlug: slug },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});
    return project;
  }
}
