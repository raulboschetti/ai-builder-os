import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Web reservas Clínica García',
    description: 'Nombre visible del proyecto dentro del workspace',
  })
  @IsString()
  @MinLength(2)
  name: string;
}
