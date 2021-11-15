import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {User} from '../users/interfaces/user.interface';
import {Project} from './interfaces/project.interface';
import {CreateProjectDto} from './dto/create-project.dto';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {UpdateProjectDto} from './dto/update-project.dto';
import * as http from 'http';
// tslint:disable-next-line:no-var-requires
const stringRandom = require('string-random');

@Injectable()
export class ProjectService {

    // tslint:disable-next-line:max-line-length
    constructor(@InjectModel('User') private readonly userModel: Model<User>, @InjectModel('Project') private readonly projectModel: Model<Project>) { }

    async findByEmail(email: string): Promise<User> {
        return await this.userModel.findOne({ email }).exec();
    }

    async createProject(newProject: CreateProjectDto): Promise<Project> {
        const isExisted = await this.findByEmail(newProject.email);
        if (isExisted) {
            const createdProject = new this.projectModel(newProject);
            createdProject.email = newProject.email;
            createdProject.name = newProject.name;
            createdProject.introduction = newProject.introduction;
            // generate apikey and api secret
            createdProject.apikey = stringRandom(16, {numbers: false});
            createdProject.apisecret = stringRandom(16, {numbers: false});
            return await createdProject.save();
        } else {
            throw new HttpException('USER_NOT_FOUND', HttpStatus.FORBIDDEN);
        }
    }

    async updateProject(updateProject: UpdateProjectDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: updateProject.apikey});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (updateProject.name) projectFromDb.name = updateProject.name;
        if (updateProject.introduction) projectFromDb.introduction = updateProject.introduction;
        return await projectFromDb.save();
    }

    async listProjects(email: string): Promise <Project[]> {
        const projects = await this.projectModel.find(email);
        if (!projects) {throw new HttpException('COMMON.PROJECT_NOT_FIND', HttpStatus.NOT_FOUND); }
        return projects;
    }
}
