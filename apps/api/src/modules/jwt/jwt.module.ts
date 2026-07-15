import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'AI_BUILDER_OS_SECRET_KEY',
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class JwtConfigModule {}