import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { BlockClientRoleGuard } from '../../common/guards/block-client-role.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, BlockClientRoleGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener los usuarios de mi organización' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findAllInOrganization(user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Editar mi perfil (nombre)' })
  @ApiBody({ type: UpdateProfileDto })
  updateProfile(
    @Body() body: UpdateProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cambiar mi contraseña' })
  @ApiBody({ type: ChangePasswordDto })
  changePassword(
    @Body() body: ChangePasswordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.changePassword(user.id, body);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir foto de perfil' })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new Error('El archivo debe ser una imagen'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.updateAvatar(
      user.id,
      `/uploads/avatars/${file.filename}`,
    );
  }
}
