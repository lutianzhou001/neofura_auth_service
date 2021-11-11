import { IsString, MinLength, MaxLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsEmail()
  @ApiProperty()
  readonly email: string;

  @MinLength(8)
  @MaxLength(20)
  @ApiProperty()
  readonly newPassword: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly newPasswordToken: string;

  @MinLength(8)
  @MaxLength(20)
  @IsOptional()
  @ApiPropertyOptional()
  readonly currentPassword: string;
}
