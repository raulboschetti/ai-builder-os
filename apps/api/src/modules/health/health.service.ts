import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getStatus() {
    return {
      status: 'ok',
      service: 'AI Builder OS API',
      timestamp: new Date().toISOString(),
    };
  }
}