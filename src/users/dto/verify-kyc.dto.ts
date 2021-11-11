import { IsString, IsUrl, IsEmail, IsIn, IsArray, IsHexColor } from 'class-validator';
import { ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyKycDto {

    @IsArray()
    @ApiProperty({ example: 'youtao.xing@icloud.com' })
    readonly email: string[];

    @IsString()
    @ApiProperty({ example: 'FAILED' })
    @IsIn(['FINISHED', 'FAILED'])
    readonly operation: string;

    @IsString()
    @ApiPropertyOptional({ example: 'no photos' })
    readonly reason: string;

}
