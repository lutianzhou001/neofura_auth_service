import {Body, Controller, HttpException, HttpStatus, Param, Patch, UseGuards, UseInterceptors} from '@nestjs/common';
import {FrozeGuard} from '../common/guards/froze.guard';
import {RolesGuard} from '../common/guards/roles.guard';
import {ApiBody, ApiOperation} from '@nestjs/swagger';
import {Roles} from '../common/decorators/roles.decorator';
import {IResponse} from '../common/interfaces/response.interface';
import {CreateProjectDto} from './dto/create-project.dto';
import {ResponseError, ResponseSuccess} from '../common/dto/response.dto';
import {AuthGuard} from '@nestjs/passport';
import {LoggingInterceptor} from '../common/interceptors/logging.interceptor';
import {User} from '../users/interfaces/user.interface';
import {ProjectService} from './project.service';
import {ProjectDto} from './dto/project.dto';
import {UpdateProjectDto} from './dto/update-project.dto';

@Controller('project')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor)
export class ProjectController {

    constructor(private readonly projectService: ProjectService) {}

    @Patch('create')
    @UseGuards(FrozeGuard)
    @UseGuards(RolesGuard)
    @ApiOperation({description: '创建一个项目'})
    @Roles('User')
    @ApiBody({
        schema: {
            example: {
                name: 'projects J',
                introduction: 'a defi application',
            },
        },
    })
    async createProject(@Body() createProjectDto: CreateProjectDto): Promise<IResponse> {
        try {
            const newProject = new ProjectDto(await this.projectService.createProject(createProjectDto));
            if (newProject) {
                return new ResponseSuccess('CREATE.PROJECT.SUCCESS');
            } else {
                return new ResponseError('CREATE.PROJECT.ERROR');
            }
        } catch (error) {
            return new ResponseError('REGISTRATION.ERROR.GENERIC_ERROR', error);
        }
    }

    @Patch('list')
    @UseGuards(FrozeGuard)
    @UseGuards(RolesGuard)
    @ApiOperation({description: '列出所有项目'})
    @Roles('User')
    @ApiBody({
        schema: {
            example: {},
        },
    })
    async listProjects(@Param() params): Promise<IResponse> {
        try {
            const projects = await this.projectService.listProjects(params.email);
            return new ResponseSuccess('PROFILE.LIST_SUCCESS', projects);
        } catch (error) {
            return new ResponseError('PROFILE.LIST_ERROR', error);
        }
    }

    @Patch('update')
    @UseGuards(FrozeGuard)
    @UseGuards(RolesGuard)
    @ApiOperation({description: '更新一个项目'})
    @Roles('User')
    @ApiBody({
        schema: {
            example: {
                name: 'projects X',
                introduction: 'a defi application',
            },
        },
    })
    async updateProject(@Body() updateProjectDto: UpdateProjectDto): Promise<IResponse> {
        try {
            const updated = await this.projectService.updateProject(updateProjectDto);
            return new ResponseSuccess('UPDATE.PROJECT.SUCCESS', updated);
        } catch (error) {
            return new ResponseError('UPDATE.PROJECT.ERROR', error);
        }
    }
}
