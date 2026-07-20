import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiProperty({ example: 'Clínica Dental García' })
  @IsString()
  @MinLength(2)
  name: string;
}
