import { Module, HttpModule } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'users/schemas/user.schema';
import { ForgottenPasswordSchema } from 'auth/schemas/forgottenpassword.schema';
import { ConsentRegistrySchema } from 'auth/schemas/consentregistry.schema';
import { EmailVerificationSchema } from 'auth/schemas/emailverification.schema';
import { AuthService } from 'auth/auth.service';
import { JWTService } from 'auth/jwt.service';
import { JwtStrategy } from 'auth/passport/jwt.strategy';
import { UsersService } from 'users/users.service';


@Module({
  imports: [MongooseModule.forFeature([
    { name: 'User', schema: UserSchema },
    { name: 'ForgottenPassword', schema: ForgottenPasswordSchema },
    { name: 'ConsentRegistry', schema: ConsentRegistrySchema },
    { name: 'EmailVerification', schema: EmailVerificationSchema },
  ]), HttpModule],
  providers: [TasksService, AuthService, JWTService, JwtStrategy, UsersService],
})
export class TasksModule { }
