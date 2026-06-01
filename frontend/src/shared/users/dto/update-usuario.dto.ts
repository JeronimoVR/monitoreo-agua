import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' }) // Sincronizado
  password?: string;
}