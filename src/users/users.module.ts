import { Module, NestModule, MiddlewareConsumer, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema } from './schemas/user.schema';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';
import { OssService } from 'common/service/ali/oss/oss.service';
import { AuthService } from 'auth/auth.service';
import { EmailVerificationSchema } from 'auth/schemas/emailverification.schema';
import { ForgottenPasswordSchema } from 'auth/schemas/forgottenpassword.schema';
import { ConsentRegistrySchema } from 'auth/schemas/consentregistry.schema';
import { JWTService } from 'auth/jwt.service';
import { JwtStrategy } from 'auth/passport/jwt.strategy';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'User', schema: UserSchema },
    { name: 'EmailVerification', schema: EmailVerificationSchema },
    { name: 'ForgottenPassword', schema: ForgottenPasswordSchema },
    { name: 'ConsentRegistry', schema: ConsentRegistrySchema }]), HttpModule],
  controllers: [UsersController],
  providers: [UsersService, OssService, AuthService, JWTService, JwtStrategy],
})
export class UsersModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      // .exclude(
      //   { path: 'example', method: RequestMethod.GET },
      // )
      .forRoutes(UsersController);
  }
}
