import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { AiModule } from '../ai/ai.module';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
