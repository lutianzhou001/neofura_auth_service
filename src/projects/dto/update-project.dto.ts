import { IsString, MaxLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectDto {
    @IsEmail()
    @ApiProperty()
    readonly email: string;

    @IsString()
    @ApiProperty()
    readonly apikey: string;

    @IsString()
    @ApiProperty()
    @IsOptional()
    @MaxLength(100)
    readonly name: string;

    @IsString()
    @ApiProperty()
    @IsOptional()
    @MaxLength(1000)
    readonly introduction: string;
}
