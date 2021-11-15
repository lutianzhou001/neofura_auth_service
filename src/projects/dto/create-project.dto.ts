import { IsString, MaxLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
    @IsEmail()
    @ApiProperty()
    readonly email: string;

    @IsString()
    @ApiProperty()
    @MaxLength(100)
    readonly name: string;

    @IsString()
    @ApiProperty()
    @MaxLength(1000)
    readonly introduction: string;
}
