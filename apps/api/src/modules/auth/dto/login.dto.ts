import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'raul@aibuilder.local',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin1234!',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @MinLength(6)
  password: string;
}