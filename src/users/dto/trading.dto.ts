import { MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TradingDto {
  constructor(object: any) {
    this.password = object.password;
  };

  @MinLength(8)
  @MaxLength(20)
  @IsOptional()
  @ApiPropertyOptional()
  password: string;
}
