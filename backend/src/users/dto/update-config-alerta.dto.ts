import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateConfigAlertaDto {
  @ApiProperty({ example: true, description: 'Indica si el usuario desea recibir alertas por correo' })
  @IsBoolean()
  @IsNotEmpty()
  recibeAlerta: boolean;
}