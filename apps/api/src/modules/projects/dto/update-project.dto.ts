import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessVertical?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    description:
      'Formato Twilio, ej: "whatsapp:+14155238886". Solo un proyecto puede tener cada número asignado.',
  })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;
}
