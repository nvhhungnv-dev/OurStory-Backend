import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  message: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
