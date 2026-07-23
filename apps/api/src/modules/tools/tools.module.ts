import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { AiModule } from '../ai/ai.module';

import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';

@Module({
  imports: [AiModule, PrismaModule],
  controllers: [ToolsController],
  providers: [ToolsService],
})
export class ToolsModule {}
