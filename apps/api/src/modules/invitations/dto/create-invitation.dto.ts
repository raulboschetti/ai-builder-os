import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 'nueva@persona.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    required: false,
    enum: ['MEMBER', 'CLIENT'],
    description:
      'MEMBER (por defecto) invita a todo el equipo. CLIENT necesita projectId y limita el acceso a ese proyecto.',
  })
  @IsOptional()
  @IsIn(['MEMBER', 'CLIENT'])
  role?: 'MEMBER' | 'CLIENT';

  @ApiProperty({
    required: false,
    description: 'Obligatorio si role es CLIENT — a qué proyecto se le da acceso.',
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}
