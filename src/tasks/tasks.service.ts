import { Injectable, HttpService } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TasksService {
    constructor() { }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async loadDepositTasks() {}
}
