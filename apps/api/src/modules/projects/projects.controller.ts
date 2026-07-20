import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('workspaces/:workspaceId/projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar los proyectos de un workspace' })
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.findAllInWorkspace(
      user.organizationId,
      workspaceId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proyecto de un workspace' })
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.findOneInWorkspace(
      user.organizationId,
      workspaceId,
      id,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Crear un proyecto en un workspace' })
  @ApiBody({ type: CreateProjectDto })
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() body: CreateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.create(user.organizationId, workspaceId, user.id, {
      name: body.name,
      businessVertical: body.businessVertical,
      description: body.description,
    });
  }
}
