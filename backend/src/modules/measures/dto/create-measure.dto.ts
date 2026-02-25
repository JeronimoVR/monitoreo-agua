import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateMeasureDto {
  @IsNumber()
  @IsNotEmpty()
  estacionId: number;

  @IsNumber()
  @IsNotEmpty()
  pH: number;

  @IsNumber()
  @IsNotEmpty()
  conductividad: number;

  @IsNumber()
  @IsNotEmpty()
  turbidez: number;

  @IsNumber()
  @IsNotEmpty()
  temperatura: number;

  @IsNumber()
  @IsNotEmpty()
  oxigeno: number;
}
