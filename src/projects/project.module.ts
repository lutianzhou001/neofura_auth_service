import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Module, NestModule, MiddlewareConsumer, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';
import { EmailVerificationSchema } from 'auth/schemas/emailverification.schema';
import { ForgottenPasswordSchema } from 'auth/schemas/forgottenpassword.schema';
import { ConsentRegistrySchema } from 'auth/schemas/consentregistry.schema';
import {UserSchema} from '../users/schemas/user.schema';
import {ProjectSchema} from './schemas/project.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'User', schema: UserSchema },
    { name: 'EmailVerification', schema: EmailVerificationSchema },
    { name: 'ForgottenPassword', schema: ForgottenPasswordSchema },
    { name: 'ConsentRegistry', schema: ConsentRegistrySchema },
    { name: 'Project', schema: ProjectSchema },
  ]), HttpModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(LoggerMiddleware)
        // .exclude(
        //   { path: 'example', method: RequestMethod.GET },
        // )
        .forRoutes(ProjectController);
  }
}
