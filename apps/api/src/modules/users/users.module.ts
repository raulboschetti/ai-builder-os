import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { CryptoModule } from '../crypto/crypto.module';
import { OrganizationsModule } from '../organizations/organizations.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    PrismaModule,
    CryptoModule,
    OrganizationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}