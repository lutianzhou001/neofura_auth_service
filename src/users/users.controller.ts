import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Post,
  Controller,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Param,
  UnauthorizedException,
  Response,
  HttpException,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { AuthGuard } from '../../node_modules/@nestjs/passport';
import { ProfileDto } from './dto/profile.dto';
import { SettingsDto } from './dto/settings.dto';
import { ApplyKycDto } from './dto/apply-kyc.dto';
import { QueryKycDto } from './dto/query-kyc.dto';
import { toKeyAlias } from '@babel/types';
import { OssService } from 'common/service/ali/oss/oss.service';
import { ApplyUploadDto } from './dto/apply-upload.dto';
import { ApiOperation, ApiBody, ApiParam, ApiProduces, ApiResponse } from '@nestjs/swagger';
import { UsersAssetListDto } from './dto/usersasset-list.dto';
import { FreezeAccountDto } from './dto/freeze-account.dto';
import { UnfreezeAccountDto } from './dto/unfreeze-account.dto';
import { ProfileListDto } from './dto/profile-list.dto';
import { async } from 'rxjs/internal/scheduler/async';
import { VerifyKycDto } from './dto/verify-kyc.dto';
import { observable, Observable } from 'rxjs';
import { User } from '../users/interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryAddressDto } from './dto/query.address.dto';
import { PasswordExistDto } from './dto/password-exist.dto';
import { FrozeGuard } from 'common/guards/froze.guard';
import { AdminGuard } from 'common/guards/admin.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor)
export class UsersController {
  // tslint:disable-next-line:max-line-length
  constructor(private readonly usersService: UsersService, private readonly ossService: OssService, @InjectModel('User') private readonly userModel: Model<User>) { }

  @Get('user/:email')
  @UseGuards(RolesGuard)
  @Roles('User')
  @ApiParam({ name: 'email', required: true, example: '947801604@qq.com' })
  @ApiProduces('application/json; charset=utf-8')
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        success: true,
        message: 'COMMON.SUCCESS',
        data: {
          name: 'updateprofile',
          surname: 'surname',
          nickname: 'nickname',
          email: '947801604@qq.com',
          phone: '18015565550',
          birthdaydate: '2011-10-05T14:48:00.000Z',
          settings: {},
          wallet: {
            assets: {},
            user: 10000037,
            eth: '0x0000000000000000000000000000000000000000',
          },
        },
      },
    },
  })
  async findById(@Param() params): Promise<IResponse> {
    try {
      const user = await this.usersService.findByEmail(params.email);
      return new ResponseSuccess('COMMON.SUCCESS', new UserDto(user));
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Get('count')
  @UseGuards(AdminGuard)
  @ApiOperation({ description: '查询用户数量' })
  async usersCount(): Promise<IResponse> {
    try {
      const usersCount = await this.usersService.usersCount();
      return new ResponseSuccess('COUNT.SUCCESS', usersCount);
    } catch (error) {
      return new ResponseError('COUNT.ERROR', error);
    }
  }

  @UseGuards(AdminGuard)
  @Post('profile/list')
  @ApiOperation({ description: '查找所有用户信息' })
  @ApiBody({
    schema: {
      example: {
        fromDate: 1000000003,
        toDate: 1989889898,
        accountStatus: 'NORMAL',
        kycStatus: 'FINISHED',
        offset: 0,
        limit: 1,
      },
    },
  })
  /*@ApiProduces('application/json; charset=utf-8')
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        success: true,
        message: 'PROFILE.LIST_SUCCESS',
        data: [],
      },
    },
  })*/
  async listProfile(@Body() profileListDto: ProfileListDto): Promise<IResponse> {
    // Here we will return the data from MongoDB.
    try {
      const listProfile = await this.usersService.profiles(profileListDto);
      return new ResponseSuccess('PROFILE.LIST_SUCCESS', listProfile);
    } catch (error) {
      return new ResponseError('PROFILE.LIST_ERROR', error);
    }
  }

  @UseGuards(AdminGuard)
  @Post('freeze')
  @ApiOperation({ description: '冻结账户' })
  @ApiBody({
    schema: {
      example: {
        email: '947801604@qq.com',
      },
    },
  })
  async freezeAccount(@Body() freezeAccountDto: FreezeAccountDto): Promise<IResponse> {
    try {
      const isSuccess = await this.usersService.freezeAccount(freezeAccountDto.email);
      return new ResponseSuccess('ACCOUNT.FREEZE_SUCCESS', isSuccess);
    } catch (error) {
      return new ResponseError('ACCOUNT.FREEZE_ERROR', error);
    }
  }

  @UseGuards(AdminGuard)
  @Post('unfreeze')
  @ApiOperation({ description: '解冻账户' })
  @ApiBody({
    schema: {
      example: {
        email: '947801604@qq.com',
      },
    },
  })
  async unfreezeAccount(@Body() unfreezeAccountDto: UnfreezeAccountDto): Promise<IResponse> {
    try {
      const isSuccess = await this.usersService.unfreezeAccount(unfreezeAccountDto.email);
      return new ResponseSuccess('ACCOUNT.UNFREEZE_SUCCESS', isSuccess);
    } catch (error) {
      return new ResponseError('ACCOUNT.UNFREEZE_ERROR', error);
    }
  }

  @Patch('profile/update')
  @UseGuards(FrozeGuard)
  @UseGuards(RolesGuard)
  @ApiOperation({ description: '修改我的个人资料' })
  @Roles('User')
  @ApiBody({
    schema: {
      example: {
        email: '947801604@qq.com',
        name: 'updateprofile',
        surname: 'surname',
        nickname: 'nickname',
        birthdaydate: '2011-10-05T14:48:00.000Z',
        phone: '18015565550',
      },
    },
  })
  async updateProfile(@Body() profileDto: ProfileDto): Promise<IResponse> {
    try {
      const user = await this.usersService.updateProfile(profileDto);
      return new ResponseSuccess('PROFILE.UPDATE_SUCCESS', new UserDto(user));
    } catch (error) {
      return new ResponseError('PROFILE.UPDATE_ERROR', error);
    }
  }

  @Patch('address/query')
  @UseGuards(RolesGuard)
  @Roles('User')
  @ApiBody({
    schema: {
      example: {
        email: '947801604@qq.com',
        asset: 'BTC',
      },
    },
  })
  async queryAddress(@Body() queryAddressDto: QueryAddressDto): Promise<IResponse> {
    try {
      const user = await this.usersService.findByEmail(queryAddressDto.email);
      if (user) {
        if (queryAddressDto.asset === 'BTC') {
          return new ResponseSuccess('QUERY.ADDRESS_SUCCESS', user.wallet.assets.btc);
        } else if (queryAddressDto.asset === 'EOS') {
          return new ResponseSuccess('QUERY.ADDRESS_SUCCESS', user.wallet.assets.eos);
        } else {
          return new ResponseSuccess('QUERY.ADDRESS_SUCCESS', user.wallet.assets.eth);
        }
      }
    } catch (error) {
      return new ResponseError('PROFILE.UPDATE_ERROR', error);
    }
  }

  @Patch('settings/update')
  @UseGuards(FrozeGuard)
  @UseGuards(RolesGuard)
  @Roles('User')
  @ApiBody({
    schema: {
      example: {
        email: '947801604@qq.com',
        trading: { password: 'testTEST' },
        emailToken: '280093',
      },
    },
  })
  @ApiProduces('application/json; charset=utf-8')
  @ApiResponse({
    status: 200,
  })
  async updateSettings(@Body() settingsDto: SettingsDto): Promise<IResponse> {
    try {
      const user = await this.usersService.updateSettings(settingsDto);
      if (user.success) {
        return new ResponseSuccess('SETTINGS.UPDATE_SUCCESS', new UserDto(user.data));
      } else {
        return new ResponseError('SETTINGS.UPDATE_ERROR', user.message);
      }
    } catch (error) {
      return new ResponseError('SETTINGS.UPDATE_ERROR', error);
    }
  }

  @Patch('password/exist')
  @UseGuards(RolesGuard)
  @Roles('User')
  @ApiBody({
    schema: {
      example: {
        email: '947801604@qq.com',
      },
    },
  })
  @ApiProduces('application/json; charset=utf-8')
  @ApiResponse({
    status: 200,
    schema: {
      example:
      {
        success: true,
        message: 'PASSWORD.EXIST_SUCCESS',
        data: false,
      },
    },
  })
  async passwordExist(@Body() passwordExistDto: PasswordExistDto): Promise<IResponse> {
    try {
      const passwordExist = await this.usersService.passwordExist(passwordExistDto.email);
      return new ResponseSuccess('PASSWORD.EXIST_SUCCESS', passwordExist);
    } catch (error) {
      return new ResponseError('PASSWORD.EXIST_ERROR', error);
    }
  }

  @Patch('kyc/applyUpload')
  @UseGuards(RolesGuard)
  @Roles('User')
  @ApiBody({
    schema: {
      example: {
        email: '947801604@qq.com',
      },
    },
  })
  async applyUpload(@Body() applyUploadDto: ApplyUploadDto): Promise<IResponse> {
    try {
      const tokenCredentials = await this.ossService.applyKYCToken();
      tokenCredentials.kyc = {
        frontIDCard: 'kyc/' + applyUploadDto.email + '-frontIDCard.jpg',
        handHeldIDCard: 'kyc/' + applyUploadDto.email + '-handHeldIDCard.jpg',
      };
      return new ResponseSuccess('KYC.APPLYUPLOAD_SUCCESS', tokenCredentials);
    } catch (error) {
      return new ResponseError('KYC.APPLYUPLOAD_ERROR', error);
    }
  }

  @Patch('kyc/apply')
  @UseGuards(RolesGuard)
  @Roles('User')
  @ApiBody({
    schema: {
      example: {
        email: '947801604@qq.com',
        frontIDCard: 'kyc/947801604@qq.com-frontIDCard.jpg',
        handHeldIDCard: 'kyc/947801604@qq.com-handHeldIDCard.jpg',
        realname: 'realname',
        IDNumber: '333',
        nation: 'CHINA',
        IDType: 'IDCARD',
      },
    },
  })
  async applyKYC(@Body() applyKycDto: ApplyKycDto): Promise<IResponse> {
    try {
      // tslint:disable-next-line: max-line-length
      const isSuccess = await this.usersService.applyKyc(applyKycDto.email, applyKycDto.frontIDCard, applyKycDto.handHeldIDCard, applyKycDto.realname, applyKycDto.IDNumber, applyKycDto.IDType, applyKycDto.nation);
      return new ResponseSuccess('KYC.APPLY_SUCCESS', isSuccess);
    }
    catch (error) {
      return new ResponseError('KYC.APPLY_ERROR', error);
    }
  }

  @Patch('kyc/query')
  @UseGuards(RolesGuard)
  @Roles('User')
  @ApiBody({
    schema: {
      example: {
        email: '947801604@qq.com',
      },
    },
  })
  @ApiProduces('application/json; charset=utf-8')
  @ApiResponse({
    status: 200,
    schema: {
      example:
      {
        success: true,
        message: 'KYC.QUERY_SUCCESS',
        data: {
          status: 'PENDING',
          reason: '',
        },
      },
    },
  })
  async queryKyc(@Body() queryKycDto: QueryKycDto): Promise<IResponse> {
    try {
      const status = await this.usersService.queryKyc(queryKycDto.email);
      if (status === undefined) {
        // tslint:disable-next-line: no-shadowed-variable
        const status = 'UNAUTHORIZED';
        return new ResponseSuccess('KYC.QUERY_SUCCESS', status);
      } else {
        return new ResponseSuccess('KYC.QUERY_SUCCESS', status);
      }
    } catch (error) {
      return new ResponseError('KYC.QUERY_ERROR', error);
    }
  }

  @Patch('kyc/verify')
  @UseGuards(AdminGuard)
  async verifyKyc(@Body() verifyKycDto: VerifyKycDto): Promise<IResponse> {
    try {
      // tslint:disable-next-line: prefer-for-of
      let successTimes: number = 0;
      // tslint:disable-next-line: prefer-for-of
      for (let i: number = 0; i < verifyKycDto.email.length; i++) {
        const isSuccess = await this.usersService.verifyKyc(verifyKycDto.email[i], verifyKycDto.operation, verifyKycDto.reason);
        if (isSuccess) {
          successTimes = successTimes + 1;
        }
      }
      return new ResponseSuccess('KYC.APPLY_SUCCESS', successTimes);
    }
    catch (error) {
      return new ResponseError('KYC.APPLY_ERROR', error);
    }
  }
}
