import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La nueva contraseña debe ser de al menos 8 caracteres' })
  nuevaPassword!: string; // Ojo: mapear 'password' del form a 'nuevaPassword' en el submit
}