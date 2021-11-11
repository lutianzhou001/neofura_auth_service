import { IsString, IsUrl, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryKycDto {

  @IsEmail()
  @ApiProperty()
  readonly email: string;

}