import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getStatus() {
    return {
      status: 'ok',
      service: 'Kroquix API',
      timestamp: new Date().toISOString(),
    };
  }
}