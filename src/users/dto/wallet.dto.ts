import { Min, Length, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class WalletDto {
  constructor(object: any) {
    this.user = object.user;
    this.btc = object.btc;
    this.eth = object.eth;
    this.bch = object.bch;
  };

  @Min(1)
  @ApiProperty()
  readonly user: number;


  @Length(40)
  @IsOptional()
  @ApiPropertyOptional()
  btc: string;

  @Length(40)
  @IsOptional()
  @ApiPropertyOptional()
  eth: string;

  @Length(40)
  @IsOptional()
  @ApiPropertyOptional()
  bch: string;
}
