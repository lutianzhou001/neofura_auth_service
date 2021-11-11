import { MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordExistDto {
    @IsEmail()
    @ApiProperty()
    readonly email: string;

}
