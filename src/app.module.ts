import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/project/project.module';
import { AiModule } from './modules/ai/ai.module';
import { AssetModule } from './modules/asset/asset.module';
import { RsvpModule } from './modules/rsvp/rsvp.module';
import { FeedbackModule } from './modules/feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    PrismaModule,
    AuthModule,
    ProjectModule,
    AiModule,
    AssetModule,
    RsvpModule,
    FeedbackModule,
  ],
})
export class AppModule {}
