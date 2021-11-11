import { IsEmail, IsOptional } from 'class-validator';
import { TradingDto } from './trading.dto';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class SettingsDto {
  constructor(object: any) {
    object = object || {};
    this.email = object.email;
    // tslint:disable-next-line: semicolon
  };

  @IsEmail()
  @ApiProperty()
  readonly email: string;

  @IsOptional()
  @ApiPropertyOptional()
  trading: TradingDto;

  @IsOptional()
  @ApiPropertyOptional()
  emailToken: string;

}
