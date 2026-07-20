import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { CryptoModule } from '../crypto/crypto.module';
import { JwtConfigModule } from '../jwt/jwt.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    CryptoModule,
    JwtConfigModule,
    UsersModule,
    OrganizationsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
  ],
})
export class AuthModule {}