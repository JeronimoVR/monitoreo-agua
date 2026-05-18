import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Nombre completo del usuario' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'newpassword123', description: 'Nueva contraseña del usuario (mínimo 6 caracteres)' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}