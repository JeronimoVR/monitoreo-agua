import { IsNumber, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedidaDto)
  medidas: MedidaDto[];
}