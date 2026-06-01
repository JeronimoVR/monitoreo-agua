import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  correo!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' }) // Sincronizado con Login
  password!: string;
}
