import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Limpieza dental' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes: number;
}
