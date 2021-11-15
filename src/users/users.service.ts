import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { ProfileListDto } from './dto/profile-list.dto';
import { AuthService } from 'auth/auth.service';

const saltRounds = 10;

@Injectable()
export class UsersService {
  constructor(private readonly authService: AuthService, @InjectModel('User') private readonly userModel: Model<User>) { }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
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
        createdUser.role = 'User';
        createdUser.status = 'NORMAL';
        createdUser.level = 1;
        createdUser.auth = false;
        return await createdUser.save();
      } else if (!userRegistered.auth) {
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

  async freezeAccount(email: string | string[]): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb) {
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    } else {
      userFromDb.status = 'FROZEN';
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
      userFromDb.status = 'NORMAL';
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
