import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Clínica Dental García',
    description: 'Nombre visible de la organización',
  })
  @IsString()
  @MinLength(2)
  name: string;
}
