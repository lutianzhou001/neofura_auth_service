import { IsString, IsUrl, IsEmail, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryAddressDto {

    @IsEmail()
    @ApiProperty()
    readonly email: string;

    @IsString()
    @ApiProperty()
    @IsIn(['BTC', 'ETH', 'EOS', 'BCH', 'USDT', 'KRWT', 'FSC', 'SDC', 'CNT', 'HT'])
    readonly asset: string;

}