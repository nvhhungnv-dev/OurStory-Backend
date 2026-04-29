import { IsString, IsOptional } from 'class-validator';

export class StoryGenerateDto {
  @IsString()
  name1: string;

  @IsString()
  name2: string;

  @IsString()
  @IsOptional()
  howMet?: string;
}
