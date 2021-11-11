'use strict';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class UsersAssetListDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    readonly email: string | string[];

    @ApiPropertyOptional()
    @IsOptional()
    //TODO: ONLY IN TEST ENVIRONMENT
    //@IsPhoneNumber('KR')
    readonly phoneNumber: string | string[];

    @ApiProperty()
    @Min(0)
    @IsNumber()
    offset: number;

    constructor(email: string | string[], phoneNumbner: string | string[], offset: number) {
        this.email = email;
        this.phoneNumber = phoneNumbner;
        this.offset = offset;
    }
}