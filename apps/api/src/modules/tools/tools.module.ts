import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';

import { ToolsController } from './tools.controller';

@Module({
  imports: [AiModule],
  controllers: [ToolsController],
})
export class ToolsModule {}
