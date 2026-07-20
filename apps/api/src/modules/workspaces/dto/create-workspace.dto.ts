import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({
    example: 'Marketing',
    description: 'Nombre visible del workspace dentro de la organización',
  })
  @IsString()
  @MinLength(2)
  name: string;
}
