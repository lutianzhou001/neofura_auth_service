import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { default as config } from '../config';
import { Injectable, HttpException, HttpStatus, HttpService } from '@nestjs/common';
import { JWTService } from './jwt.service';
import { Model } from 'mongoose';
import { User } from '../users/interfaces/user.interface';
import { UserDto } from '../users/dto/user.dto';
import { EmailVerification } from './interfaces/emailverification.interface';
import { ForgottenPassword } from './interfaces/forgottenpassword.interface';
import { ConsentRegistry } from './interfaces/consentregistry.interface';
import { InjectModel } from '@nestjs/mongoose';

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
      if (!userFromDb.auth.email.valid) throw new HttpException('LOGIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
      const accessToken = await this.jwtService.createToken(email, userFromDb.roles);
      return { token: accessToken, user: new UserDto(userFromDb) };
    } else {
      throw new HttpException('LOGIN.PASSWORD_NOT_VALID', HttpStatus.UNAUTHORIZED);
    }
  }

  async validateAdminLogin(email, password) {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb || userFromDb.roles.indexOf('Admin') === -1) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const isValidPass = await bcrypt.compare(password, userFromDb.password);
    if (isValidPass) {
      if (!userFromDb.auth.email.valid) throw new HttpException('LOGIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
      const accessToken = await this.jwtService.createToken(email, userFromDb.roles);
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
          emailToken: Math.floor(Math.random() * (900000)) + 100000, //Generate 6 digits number
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
          newPasswordToken: Math.floor(Math.random() * (900000)) + 100000, //Generate 6 digits number,
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
        userFromDb.auth.email.valid = true;
        const savedUser = await userFromDb.save();
        await emailVerif.remove();
        return !!savedUser;
      }
    } else {
      throw new HttpException('LOGIN.EMAIL_CODE_NOT_VALID', HttpStatus.FORBIDDEN);
    }
  }

  async getForgottenPasswordModel(newPasswordToken: string): Promise<ForgottenPassword> {
    return await this.forgottenPasswordModel.findOne({ newPasswordToken });
  }

  async sendEmailVerification(email: string, func: string): Promise<boolean> {
    const model = await this.emailVerificationModel.findOne({ email });

    if (model && model.emailToken) {
      const transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        secure: config.mail.secure, // true for 465, false for other ports
        auth: {
          user: config.mail.user,
          pass: config.mail.pass,
        },
      });

      if (func === 'register') {
        var mailOptions = {
          from: '"Company" <' + config.mail.user + '>',
          to: email, // list of receivers (separated by ,)
          subject: 'Verify Email',
          text: 'Verify Email',
          html: '您好！<br><br>感谢您的注册<br><br>' +
            '<p>【HUDEX】验证码为：' + model.emailToken + '，2分钟内有效。请勿向任何人包括客服提供验证码！</p>',  // html body
        };
      } else if (func === 'withdraw') {
        var mailOptions = {
          from: '"Company" <' + config.mail.user + '>',
          to: email, // list of receivers (separated by ,)
          subject: 'Verify Email',
          text: 'Verify Email',
          html: '您好！<br><br>您正在申请提现<br><br>' +
            '<p>【HUDEX】验证码为：' + model.emailToken + '，2分钟内有效。请勿向任何人包括客服提供验证码！</p>',  // html body
        };
      }

      const sent = await new Promise<boolean>(async function (resolve, reject) {
        return await transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            // tslint:disable-next-line: no-console
            console.log('Message sent: %s', error);
            return reject(false);
          }
          // tslint:disable-next-line: no-console
          console.log('Message sent: %s', info.messageId);
          resolve(true);
        });
      });

      return sent;
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
      const transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        secure: config.mail.secure, // true for 465, false for other ports
        auth: {
          user: config.mail.user,
          pass: config.mail.pass,
        },
      });

      const mailOptions = {
        from: '"Company" <' + config.mail.user + '>',
        to: email, // list of receivers (separated by ,)
        subject: 'Frogotten Password',
        text: 'Forgot Password',
        html: 'Hi! <br><br> If you requested to reset your password<br><br>' +
          '<a href=' + config.host.url + ':' + config.host.port + '/auth/email/reset-password/' + tokenModel.newPasswordToken + '>Click here</a>',  // html body
      };

      const sended = await new Promise<boolean>(async function (resolve, reject) {
        return await transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Message sent: %s', error);
            return reject(false);
          }
          console.log('Message sent: %s', info.messageId);
          resolve(true);
        });
      });

      return sended;
    } else {
      throw new HttpException('REGISTER.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
    }
  }

}
