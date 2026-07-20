import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationMapper } from './mappers/organization.mapper';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar las organizaciones del usuario autenticado' })
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.findMineForUser(user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear una organización adicional (el usuario queda como OWNER)',
  })
  @ApiBody({ type: CreateOrganizationDto })
  async create(
    @Body() body: CreateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const organization = await this.organizationsService.createWithOwner(
      body.name,
      user.id,
    );
    return OrganizationMapper.toResponse(organization);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Renombrar mi organización (solo OWNER)' })
  @ApiBody({ type: UpdateOrganizationDto })
  updateMine(
    @Body() body: UpdateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationsService.updateName(
      user.organizationId,
      user.id,
      body.name,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una organización (solo si el usuario es miembro)' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.findByIdForUser(id, user.id);
  }
}
