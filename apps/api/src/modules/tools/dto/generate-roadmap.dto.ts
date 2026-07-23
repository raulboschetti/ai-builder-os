import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateRoadmapDto {
  @ApiProperty({ required: false, example: 'dentista' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessVertical?: string;

  @ApiProperty({ example: 'Quiero una app para gestionar citas de mi clínica' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description: string;
}
