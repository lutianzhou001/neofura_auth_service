'use strict';
import { ApiProperty } from '@nestjs/swagger';
import { Min, Max, IsString, IsEmail } from 'class-validator';

export class FreezeAccountDto {
    @IsString()
    @IsEmail()
    @ApiProperty()
    readonly email: string | string[];

    constructor(email: string | string[]) {
        this.email = email;
    }
}