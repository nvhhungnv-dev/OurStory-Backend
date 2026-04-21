import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { GenerateDto } from './dto/generate.dto';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('generate')
  generate(@Body() dto: GenerateDto) {
    return this.aiService.generate(dto);
  }
}
