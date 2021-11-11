import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'

export class ApplyUploadDto {

  @IsEmail()
  @ApiProperty()
  readonly email: string;

}