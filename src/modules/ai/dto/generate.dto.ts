import { IsString, IsOptional } from 'class-validator';

export class GenerateDto {
  @IsString()
  templateId: string;

  @IsString()
  bride: string;

  @IsString()
  groom: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  loveStory?: string;

  @IsString()
  @IsOptional()
  tone?: 'romantic' | 'formal' | 'fun';
}
