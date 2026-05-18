import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8, { message: 'La nueva contraseña debe ser de al menos 8 caracteres' })
  nuevaPassword: string;
}