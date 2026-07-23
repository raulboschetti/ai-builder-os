import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { BlockClientRoleGuard } from '../../common/guards/block-client-role.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('workspaces/:workspaceId/projects')
@UseGuards(JwtAuthGuard, BlockClientRoleGuard)
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

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un proyecto' })
  @ApiBody({ type: UpdateProjectDto })
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.update(user.organizationId, workspaceId, id, {
      name: body.name,
      businessVertical: body.businessVertical,
      description: body.description,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un proyecto (borrado lógico)' })
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.remove(user.organizationId, workspaceId, id);
  }

  @Post(':id/analysis')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Generar un análisis de viabilidad con IA' })
  generateAnalysis(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.generateAnalysis(
      user.organizationId,
      workspaceId,
      id,
    );
  }

  @Get(':id/analysis')
  @ApiOperation({ summary: 'Obtener el análisis de viabilidad más reciente' })
  getLatestAnalysis(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.getLatestAnalysis(
      user.organizationId,
      workspaceId,
      id,
    );
  }

  @Get(':id/clients')
  @ApiOperation({ summary: 'Listar clientes con acceso ya aceptado a este proyecto' })
  listClients(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.listClients(user.organizationId, workspaceId, id);
  }

  @Delete(':id/clients/:membershipId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Quitar el acceso de un cliente a este proyecto' })
  revokeClientAccess(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Param('membershipId') membershipId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.revokeClientAccess(
      user.organizationId,
      workspaceId,
      id,
      membershipId,
    );
  }
}
