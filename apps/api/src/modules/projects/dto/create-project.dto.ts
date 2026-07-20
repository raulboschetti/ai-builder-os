import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Web reservas Clínica García',
    description: 'Nombre visible del proyecto dentro del workspace',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'dentista',
    description:
      'Vertical de negocio en texto libre (dentista, fontanero, seguros...). No es una lista cerrada.',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessVertical?: string;

  @ApiProperty({
    example: 'Clínica dental con 2 sedes, quiere reservas online y recordatorios por WhatsApp',
    description: 'Descripción libre del negocio, punto de partida para la IA',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
