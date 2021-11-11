import { IsString, IsEmail, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileDto {
  //  constructor(object: any) {
  //    this.email = object.email;
  //    this.name = object.name;
  //    this.surname = object.surname;
  //    this.nickname = object.nickname;
  //    this.birthdaydate = object.birthdaydate;
  //    this.phone = object.phone;
  //  };

  @IsEmail()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly surname: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly nickname: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly birthdaydate: Date;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly phone: string;
}
