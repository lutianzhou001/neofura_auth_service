import { IsString, IsUrl, IsEmail, IsIn } from 'class-validator';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { isString } from 'util';

export class ApplyKycDto {

  @IsString()
  @ApiProperty()
  readonly realname: string;

  @IsString()
  @ApiProperty()
  readonly IDNumber: string;

  @IsString()
  @ApiProperty()
  @IsIn(['PASSPORT', 'IDCARD'])
  readonly IDType: string;

  @IsString()
  @ApiProperty()
  @IsIn(['CHINA', 'KOREA'])
  readonly nation: string;

  @IsEmail()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @ApiProperty()
  readonly frontIDCard: string;

  @IsString()
  @ApiProperty()
  readonly handHeldIDCard: string;

}
