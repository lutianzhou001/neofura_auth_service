import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Post,
  Controller,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiBody, ApiParam, ApiProduces, ApiResponse } from '@nestjs/swagger';
import { FreezeAccountDto } from './dto/freeze-account.dto';
import { UnfreezeAccountDto } from './dto/unfreeze-account.dto';
import { ProfileListDto } from './dto/profile-list.dto';
import { User } from './interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminGuard } from 'common/guards/admin.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor)
export class UsersController {
  // tslint:disable-next-line:max-line-length
  constructor(private readonly usersService: UsersService, @InjectModel('User') private readonly userModel: Model<User>) {
  }

  @Get('user/:email')
  @UseGuards(RolesGuard)
  @Roles('User')
  @ApiParam({name: 'email', required: true, example: '947801604@qq.com'})
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

  @UseGuards(AdminGuard)
  @Post('profile/list')
  @ApiOperation({description: '查找所有用户信息'})
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
  @ApiOperation({description: '冻结账户'})
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
  @ApiOperation({description: '解冻账户'})
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
}
