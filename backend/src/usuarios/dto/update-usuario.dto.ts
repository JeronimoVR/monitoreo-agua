import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}