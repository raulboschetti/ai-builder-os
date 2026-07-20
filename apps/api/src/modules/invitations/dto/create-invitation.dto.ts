import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 'nueva@persona.com' })
  @IsEmail()
  email: string;
}
