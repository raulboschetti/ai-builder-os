import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { CryptoModule } from '../crypto/crypto.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    PrismaModule,
    CryptoModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}