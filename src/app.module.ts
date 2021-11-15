import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { default as config } from './config';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { ProjectModule } from './projects/project.module';

const userString = config.db.user && config.db.pass ? (config.db.user + ':' + config.db.pass + '@') : '';
const authSource = config.db.authSource ? ('?authSource=' + config.db.authSource + '&w=1') : '';

@Module({
  // tslint:disable-next-line: max-line-length
  imports: [ScheduleModule.forRoot(), MongooseModule.forRoot('mongodb://' + userString + config.db.host + ':' + (config.db.port || 'pm2 ast27017') + '/' + config.db.database + authSource, {useNewUrlParser: true}), UsersModule, AuthModule, TasksModule, ProjectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
