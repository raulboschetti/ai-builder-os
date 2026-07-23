import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Max, Min, ValidateNested } from 'class-validator';

class BusinessDayDto {
  @ApiProperty({ example: 1, description: '0=domingo ... 6=sábado' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  endTime: string;
}

export class SetBusinessHoursDto {
  @ApiProperty({ type: [BusinessDayDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessDayDto)
  days: BusinessDayDto[];
}
