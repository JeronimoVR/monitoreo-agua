import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'juan.perez@example.com', description: 'Correo electrónico del usuario' })
  @IsEmail()
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  correo: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña del usuario (mínimo 8 caracteres)' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({ example: 'password123', description: 'Confirmación de la contraseña' })
  @IsString()
  @IsNotEmpty({ message: 'La confirmación de la contraseña no puede estar vacía' })
  passwordConfirm: string;
}