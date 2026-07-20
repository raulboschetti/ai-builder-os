import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token obtenido en el login',
  })
  @IsString()
  refreshToken: string;
}
