import { MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Login {
  @IsEmail()
  @ApiProperty()
  readonly email: string;

  @MinLength(8)
  @MaxLength(20)
  @ApiProperty()
  readonly password: string;
}
