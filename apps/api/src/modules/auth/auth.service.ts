import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(email: string, password: string) {
    return {
      success: true,
      message: 'Login endpoint funcionando',
      user: {
        email,
      },
      token: 'JWT_PENDING',
      refreshToken: 'REFRESH_PENDING',
    };
  }
}