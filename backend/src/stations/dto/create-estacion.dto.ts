import { IsString, MinLength, IsLongitude, IsLatitude } from 'class-validator';

export class CreateEstacionDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsLatitude()
  latitud: number;

  @IsLongitude()
  longitud: number;
}