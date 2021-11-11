import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { ProfileDto } from 'users/dto/profile.dto';
import { SettingsDto } from 'users/dto/settings.dto';
import * as _ from 'lodash';
import { ProfileListDto } from './dto/profile-list.dto';
import { ProfileListResDto } from './dto/profile-list-res.dto';
import { Wallet } from './decorators/wallet.decorator';
import { AuthService } from 'auth/auth.service';
import { IResponse } from 'common/interfaces/response.interface';
import { ResponseError, ResponseSuccess } from 'common/dto/response.dto';

const saltRounds = 10;

@Injectable()
export class UsersService {
  constructor(private readonly authService: AuthService, @InjectModel('User') private readonly userModel: Model<User>) { }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async usersCount(): Promise<number> {
    const usersFromDb = await this.userModel.find().exec();
    let count: number = 0;
    // tslint:disable-next-line: prefer-for-of
    for (let i: number = 0; i < usersFromDb.length; i++) {
      if (usersFromDb[i].wallet.user > count) {
        count = usersFromDb[i].wallet.user - 10000000;
      }
    }
    return count;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }

  async createNewUser(newUser: CreateUserDto): Promise<User> {
    if (this.isValidEmail(newUser.email) && newUser.password) {
      const userRegistered = await this.findByEmail(newUser.email);
      if (!userRegistered) {
        newUser.password = await bcrypt.hash(newUser.password, saltRounds);
        const createdUser = new this.userModel(newUser);
        createdUser.roles = ['User'];
        // here I will add user in queue
        const usersFromDb = await this.userModel.find().exec();
        let max: number = 0;
        // tslint:disable-next-line: prefer-for-of
        for (let i: number = 0; i < usersFromDb.length; i++) {
          const user: number = usersFromDb[i].wallet.user;
          if (user > max) {
            max = user;
          }
        }
        createdUser.wallet.user = max + 1;
        createdUser.wallet.assets.eth = '0x0000000000000000000000000000000000000000';
        createdUser.wallet.assets.btc = '0x0000000000000000000000000000000000000000';
        createdUser.wallet.assets.eos = '0x0000000000000000000000000000000000000000';
        createdUser.wallet.assets.bch = '0x0000000000000000000000000000000000000000';
        createdUser.accountstatus = 'NORMAL';

        createdUser.auth.email.valid = false;
        createdUser.auth.phone.valid = false;
        createdUser.auth.totp.valid = false;

        createdUser.kyc.IDNumber = 'N/A';
        createdUser.kyc.IDType = 'N/A';
        createdUser.kyc.frontIDCard = 'N/A';
        createdUser.kyc.handHeldIDCard = 'N/A';
        createdUser.kyc.nation = 'N/A';
        createdUser.kyc.realname = 'N/A';
        createdUser.kyc.status = 'UNAUTHORIZED';
        if (!createdUser.nickname) {
          createdUser.nickname = createdUser.email;
        }
        return await createdUser.save();
      } else if (!userRegistered.auth.email.valid) {
        return userRegistered;
      } else {
        throw new HttpException(
          'REGISTRATION.USER_ALREADY_REGISTERED',
          HttpStatus.FORBIDDEN,
        );
      }
    } else {
      throw new HttpException(
        'REGISTRATION.MISSING_MANDATORY_PARAMETERS',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async appendAddress(user: number, type: string, address: string) {
    const userFromDb = await this.userModel.findOne({
      'wallet.user': user,
    });
    if (!userFromDb)
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (type === 'eth') {
      userFromDb.wallet.assets.eth = address;
    }
    await userFromDb.save();
    return userFromDb;
  }

  async passwordExist(email: string) {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb)
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (userFromDb.settings) {
      if (userFromDb.settings.trading) {
        if (userFromDb.settings.trading.password) {
          return true;
        }
      }
    }
    return false;
  }

  isValidEmail(email: string) {
    if (email) {
      // tslint:disable-next-line: max-line-length
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    } else return false;
  }

  async setPassword(email: string, newPassword: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb)
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    userFromDb.password = await bcrypt.hash(newPassword, saltRounds);

    await userFromDb.save();
    return true;
  }

  async updateProfile(profileDto: ProfileDto): Promise<User> {
    const userFromDb = await this.userModel.findOne({
      email: profileDto.email,
    });
    if (!userFromDb)
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    if (profileDto.name) userFromDb.name = profileDto.name;
    if (profileDto.surname) userFromDb.surname = profileDto.surname;
    if (profileDto.nickname) userFromDb.nickname = profileDto.nickname;
    if (profileDto.phone) userFromDb.phone = profileDto.phone;
    if (profileDto.birthdaydate)
      userFromDb.birthdaydate = profileDto.birthdaydate;

    await userFromDb.save();
    return userFromDb;
  }

  async updateSettings(settingsDto: SettingsDto): Promise<IResponse> {
    const isValid = await this.authService.verifyEmail(settingsDto.emailToken);
    if (!isValid) return new ResponseError('ONCHAIN.WITHDRAW_ERROR', 'ERROR IN EMAILTOKEN');
    const userFromDb = await this.userModel.findOne({
      email: settingsDto.email,
    });
    if (!userFromDb)
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    userFromDb.settings.trading = userFromDb.settings.trading || {
      password: null,
    };
    for (const key in settingsDto) {
      if (settingsDto.hasOwnProperty(key) && key !== 'email') {
        userFromDb.settings[key] = settingsDto[key];
      }
    }
    await userFromDb.save();
    return new ResponseSuccess('UPDATE.SETTINGS_SUCCESS', userFromDb);
  }

  // tslint:disable-next-line: ban-types
  // tslint:disable-next-line: max-line-length
  async applyKyc(email: string, frontIDCard: string, handHeldIDCard: string, realname: string, IDNumber: string, IDType: string, nation: string): Promise<Boolean> {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb)
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    if ((userFromDb.kyc.status !== undefined) && (userFromDb.kyc.status === 'FINISHED' || userFromDb.kyc.status === 'PENDING')) {
      return false;
    } else {
      if (frontIDCard && handHeldIDCard) {
        userFromDb.kyc.realname = realname;
        userFromDb.kyc.IDNumber = IDNumber;
        userFromDb.kyc.IDType = IDType;
        userFromDb.kyc.nation = nation;
        userFromDb.kyc.frontIDCard = frontIDCard;
        userFromDb.kyc.handHeldIDCard = handHeldIDCard;
        userFromDb.kyc.status = 'PENDING';
        await userFromDb.save();
        return true;
      } else {
        return false;
      }
    }
  }

  async queryKyc(email: string): Promise<any> {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb) {
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    else {
      return { status: userFromDb.kyc.status, reason: userFromDb.kyc.reason };
    }
  }

  async verifyKyc(email: string, operation: string, reason: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb) {
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    } else {
      userFromDb.kyc.status = operation;
      userFromDb.kyc.reason = reason;
      await userFromDb.save();
      return true;
    }
  }

  async freezeAccount(email: string | string[]): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb) {
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    } else {
      userFromDb.accountstatus = 'FROZEN';
      await userFromDb.save();
      return true;
    }
  }

  async unfreezeAccount(email: string | string[]): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb) {
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    else {
      userFromDb.accountstatus = 'NORMAL';
      await userFromDb.save();
      return true;
    }
  }

  async profiles(profileListDto: ProfileListDto) {
    const query: any = {
      // tslint:disable-next-line: object-literal-key-quotes
      'date': {
        $gte: (profileListDto.startTime) ? (profileListDto.startTime) : 0,
        $lte: (profileListDto.endTime) ? (profileListDto.endTime) : 1000000000000000,
      },
    };
    if (profileListDto.email) { query.email = profileListDto.email; }
    if (profileListDto.accountStatus) { query.accountStatus = profileListDto.accountStatus; }
    if (profileListDto.nickname) { query.nickname = profileListDto.nickname; }
    if (profileListDto.phoneNumber) { query.phone = profileListDto.phoneNumber; }
    if (profileListDto.kycStatus) { query['kyc.status'] = profileListDto.kycStatus; }
    if (profileListDto.id) { query['wallet.user'] = profileListDto.id; }

    const result = await this.userModel.find(query).skip(profileListDto.offset).limit(profileListDto.limit).sort('-date').exec();
    const total = await this.userModel.find(query).count().exec();
    return { result, total };
  }
}
