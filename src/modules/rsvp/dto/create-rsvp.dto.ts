import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateRsvpDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  attending: boolean;

  @IsString()
  @IsOptional()
  message?: string;
}
