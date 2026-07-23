import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { BlockClientRoleGuard } from '../../common/guards/block-client-role.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { SetBusinessHoursDto } from './dto/set-business-hours.dto';

@ApiTags('Bookings')
@Controller('workspaces/:workspaceId/projects/:id')
@UseGuards(JwtAuthGuard, BlockClientRoleGuard)
@ApiBearerAuth('access-token')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('services')
  @ApiOperation({ summary: 'Listar servicios del proyecto' })
  listServices(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.listServices(user.organizationId, workspaceId, id);
  }

  @Post('services')
  @ApiOperation({ summary: 'Crear un servicio (activa las citas para este proyecto)' })
  @ApiBody({ type: CreateServiceDto })
  createService(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() body: CreateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.createService(
      user.organizationId,
      workspaceId,
      id,
      body,
    );
  }

  @Delete('services/:serviceId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un servicio' })
  deleteService(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.deleteService(
      user.organizationId,
      workspaceId,
      id,
      serviceId,
    );
  }

  @Get('business-hours')
  @ApiOperation({ summary: 'Obtener el horario semanal' })
  getBusinessHours(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.getBusinessHours(
      user.organizationId,
      workspaceId,
      id,
    );
  }

  @Put('business-hours')
  @ApiOperation({ summary: 'Definir el horario semanal completo' })
  @ApiBody({ type: SetBusinessHoursDto })
  setBusinessHours(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() body: SetBusinessHoursDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.setBusinessHours(
      user.organizationId,
      workspaceId,
      id,
      body.days,
    );
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Listar citas confirmadas del proyecto' })
  listAppointments(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.listAppointments(
      user.organizationId,
      workspaceId,
      id,
    );
  }

  @Delete('appointments/:appointmentId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cancelar una cita' })
  cancelAppointment(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.cancelAppointment(
      user.organizationId,
      workspaceId,
      id,
      appointmentId,
    );
  }
}
