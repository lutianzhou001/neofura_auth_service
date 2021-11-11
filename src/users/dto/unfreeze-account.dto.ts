'use strict';
import { ApiProperty } from '@nestjs/swagger';
import { Min, Max, IsEmail, IsString } from 'class-validator';

export class UnfreezeAccountDto {
    @ApiProperty()
    @IsEmail()
    @IsString()
    readonly email: string | string[];

    constructor(email: string | string[]) {
        this.email = email;
    }
}