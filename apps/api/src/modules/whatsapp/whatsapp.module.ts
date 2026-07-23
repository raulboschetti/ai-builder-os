import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { AiModule } from '../ai/ai.module';

import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
})
export class WhatsAppModule {}
