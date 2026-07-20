import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@ApiTags('Workspaces')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar los workspaces de mi organización' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.workspacesService.findAllInOrganization(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un workspace de mi organización' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.workspacesService.findOneInOrganization(
      user.organizationId,
      id,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Crear un workspace en mi organización' })
  @ApiBody({ type: CreateWorkspaceDto })
  create(
    @Body() body: CreateWorkspaceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workspacesService.create(
      user.organizationId,
      user.id,
      body.name,
    );
  }
}
