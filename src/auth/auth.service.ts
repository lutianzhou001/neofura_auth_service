import * as bcrypt from 'bcryptjs';
import { Injectable, HttpException, HttpStatus, HttpService } from '@nestjs/common';
import { JWTService } from './jwt.service';
import { Model } from 'mongoose';
import { User } from '../users/interfaces/user.interface';
import { UserDto } from '../users/dto/user.dto';
import { EmailVerification } from './interfaces/emailverification.interface';
import { ForgottenPassword } from './interfaces/forgottenpassword.interface';
import { ConsentRegistry } from './interfaces/consentregistry.interface';
import { InjectModel } from '@nestjs/mongoose';
// tslint:disable-next-line:no-var-requires
const request = require('request');

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>,
              @InjectModel('EmailVerification') private readonly emailVerificationModel: Model<EmailVerification>,
              @InjectModel('ForgottenPassword') private readonly forgottenPasswordModel: Model<ForgottenPassword>,
              @InjectModel('ConsentRegistry') private readonly consentRegistryModel: Model<ConsentRegistry>,
              private readonly jwtService: JWTService) { }

  async validateLogin(email, password) {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const isValidPass = await bcrypt.compare(password, userFromDb.password);
    if (isValidPass) {
      if (!userFromDb.auth) throw new HttpException('LOGIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
      const accessToken = await this.jwtService.createToken(email, userFromDb.role);
      return { token: accessToken, user: new UserDto(userFromDb) };
    } else {
      throw new HttpException('LOGIN.PASSWORD_NOT_VALID', HttpStatus.UNAUTHORIZED);
    }
  }

  async validateAdminLogin(email, password) {
    const userFromDb = await this.userModel.findOne({ email });
    if (userFromDb.role !== 'Admin') throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const isValidPass = await bcrypt.compare(password, userFromDb.password);
    if (isValidPass) {
      if (!userFromDb.auth) throw new HttpException('LOGIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
      const accessToken = await this.jwtService.createToken(email, userFromDb.role);
      return { token: accessToken, user: new UserDto(userFromDb) };
    } else {
      throw new HttpException('LOGIN.PASSWORD_NOT_VALID', HttpStatus.UNAUTHORIZED);
    }
  }

  async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.emailVerificationModel.findOne({ email });
    if (emailVerification && ((new Date().getTime() - emailVerification.timestamp.getTime()) / 60000 < 1)) {
      throw new HttpException('LOGIN.EMAIL_SENDED_RECENTLY', HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      const emailVerificationModel = await this.emailVerificationModel.findOneAndUpdate(
        { email },
        {
          email,
          emailToken: Math.floor(Math.random() * (900000)) + 100000,
          timestamp: new Date(),
        },
        { upsert: true },
      );
      return true;
    }
  }

  async saveUserConsent(email: string): Promise<ConsentRegistry> {
    try {
      const http = new HttpService();

      const newConsent = new this.consentRegistryModel();
      newConsent.email = email;
      newConsent.date = new Date();
      newConsent.registrationForm = ['name', 'surname', 'email', 'birthday date', 'password'];
      newConsent.checkboxText = 'I accept privacy policy';
      const privacyPolicyResponse: any = await http.get('https://www.XXXXXX.com/api/privacy-policy').toPromise();
      newConsent.privacyPolicy = privacyPolicyResponse.data.content;
      const cookiePolicyResponse: any = await http.get('https://www.XXXXXX.com/api/privacy-policy').toPromise();
      newConsent.cookiePolicy = cookiePolicyResponse.data.content;
      newConsent.acceptedPolicy = 'Y';
      return await newConsent.save();
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.error(error);
    }
  }

  async createForgottenPasswordToken(email: string): Promise<ForgottenPassword> {
    const forgottenPassword = await this.forgottenPasswordModel.findOne({ email });
    if (forgottenPassword && ((new Date().getTime() - forgottenPassword.timestamp.getTime()) / 60000 < 15)) {
      throw new HttpException('RESET_PASSWORD.EMAIL_SENDED_RECENTLY', HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      const forgottenPasswordModel = await this.forgottenPasswordModel.findOneAndUpdate(
        { email },
        {
          email,
          newPasswordToken: Math.floor(Math.random() * (900000)) + 100000,
          timestamp: new Date(),
        },
        { upsert: true, new: true },
      );
      if (forgottenPasswordModel) {
        return forgottenPasswordModel;
      } else {
        throw new HttpException('LOGIN.ERROR.GENERIC_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    const emailVerif = await this.emailVerificationModel.findOne({ emailToken: token });
    if (emailVerif && emailVerif.email) {
      const userFromDb = await this.userModel.findOne({ email: emailVerif.email });
      if (userFromDb) {
        userFromDb.auth = true;
        const savedUser = await userFromDb.save();
        await emailVerif.remove();
        return !!savedUser;
      }
    } else {
      throw new HttpException('LOGIN.EMAIL_CODE_NOT_VALID', HttpStatus.FORBIDDEN);
    }
  }

  async getForgottenPasswordModel(newPasswordToken: string): Promise<ForgottenPassword> {
    return this.forgottenPasswordModel.findOne({newPasswordToken});
  }

  async sendEmail(emailAddress: string, func: string, emailToken: string): Promise<boolean> {
    let emailValue;
    if (func === 'register') {
      emailValue = '[neofura]Thanks for register, your verification token is ' + emailToken + ', don\'t tell this token to anybody!';
    } else if (func === 'forgottenPassword') {
      emailValue = '[neofura]You are changing your password, your verification token is ' + emailToken + ', don\'t tell this token to anybody!';
    }
    const options = {
      method: 'POST',
      url: 'https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send',
      headers: {
        'content-type': 'application/json',
        'x-rapidapi-host': 'rapidprod-sendgrid-v1.p.rapidapi.com',
        'x-rapidapi-key': 'ae2ad23146msh06a431323e86027p11a924jsn731ce3762748',
        'useQueryString': true,
      },
      body: {
        personalizations: [{to: [{email: emailAddress}], subject: 'NeoFura Service Email Verification'}],
        from: {email: 'norelpy@neofura.com'},
        content: [{type: 'text/plain', value: emailValue}],
      },
      json: true,
    };

    return await request(options, (error, response, body) => {
      if (error) throw new Error(error);
    });
  }

  async sendEmailVerification(email: string, func: string): Promise<boolean> {
    const model = await this.emailVerificationModel.findOne({ email });
    if (model && model.emailToken) {
      return await this.sendEmail(email, 'register', model.emailToken);
    } else {
      throw new HttpException('REGISTER.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
    }
  }

  async checkPassword(email: string, password: string) {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    return await bcrypt.compare(password, userFromDb.password);
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const tokenModel = await this.createForgottenPasswordToken(email);

    if (tokenModel && tokenModel.newPasswordToken) {
      return await this.sendEmail(email, 'forgottenPassword', tokenModel.newPasswordToken);
    } else {
      throw new HttpException('REGISTER.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
    }
  }
}
