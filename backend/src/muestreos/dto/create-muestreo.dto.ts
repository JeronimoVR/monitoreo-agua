import { IsNumber, IsArray, ValidateNested, IsNotEmpty, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

class MedidaDto {
  @IsNumber()
  @IsNotEmpty()
  id_parametro: number;

  @IsNumber()
  @IsNotEmpty()
  valor: number;
}

export class CreateMuestreoDto {
  @IsNumber()
  @IsNotEmpty()
  id_estacion: number;

  @IsDate()
  @IsNotEmpty()
  fecha_muestreo: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedidaDto)
  medidas: MedidaDto[];
}