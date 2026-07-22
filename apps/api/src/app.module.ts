import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientModule } from './modules/client/client.module';
import { HealthModule } from './modules/health/health.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { JwtConfigModule } from './modules/jwt/jwt.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    JwtConfigModule,
    HealthModule,
    AuthModule,
    UsersModule,
    InvitationsModule,
    OrganizationsModule,
    WorkspacesModule,
    ProjectsModule,
    NotificationsModule,
    ClientModule,
  ],
  controllers: [AppController],
})
export class AppModule {}