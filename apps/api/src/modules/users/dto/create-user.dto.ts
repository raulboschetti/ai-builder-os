import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'Clínica Dental García',
    description:
      'Nombre de la organización que se crea junto con el usuario. Si no se indica, se usa el nombre o el email.',
    required: false,
  })
  @IsOptional()
  @IsString()
  organizationName?: string;
}