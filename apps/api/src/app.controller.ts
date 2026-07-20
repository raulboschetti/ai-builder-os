import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      name: 'Kroquix',
      version: '1.0.0',
      status: 'running',
      environment: 'development',
    };
  }
}