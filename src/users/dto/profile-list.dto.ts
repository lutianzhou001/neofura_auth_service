'use strict';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, Min, Max, IsOptional, IsEmail, IsString, IsNumber } from 'class-validator';
import { read } from 'fs';

export class ProfileListDto {
    @ApiPropertyOptional()
    @IsOptional()
    readonly startTime: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    readonly id: number;

    @ApiPropertyOptional()
    @IsOptional()
    readonly endTime: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    readonly email: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly phoneNumber: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly nickname: string;

    @ApiPropertyOptional({ enum: ['FROZEN', 'NORMAL'] })
    @IsOptional()
    readonly accountStatus: string;

    @ApiPropertyOptional({ enum: ['PENDING', 'UNAUTHORIZED', 'FINISHED', 'FAILED'] })
    @IsOptional()
    @IsIn(['PENDING', 'UNAUTHORIZED', 'FINISHED', 'FAILED'])
    readonly kycStatus: string;

    @ApiProperty()
    @Min(1)
    @Max(100)
    readonly limit: number;

    @ApiProperty()
    @Min(0)
    readonly offset: number;

    constructor(startTime: Date, endTime: Date, accountStatus: string, kycStatus: string, offset: number, limit: number, id: number) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.accountStatus = accountStatus;
        this.kycStatus = kycStatus;
        this.offset = offset;
        this.limit = limit;
        this.id = id;
    }
}