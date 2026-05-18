import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SolicitarRecuperacionDto {
  @ApiProperty()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty()
  correo: string;
}