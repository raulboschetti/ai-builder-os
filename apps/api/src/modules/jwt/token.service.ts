import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: object): string {
    return this.jwtService.sign(payload, {
      expiresIn: '1h',
    });
  }

  generateRefreshToken(payload: object): string {
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verify(token);
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token);
  }
}