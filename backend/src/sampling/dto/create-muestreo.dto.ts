import { IsNumber, IsArray, ValidateNested, IsNotEmpty, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class MedidaDto {
  @ApiProperty({ description: 'ID del parámetro medido (ej. 1 para pH, 2 para Turbiedad)', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_parametro: number;

  @ApiProperty({ description: 'Valor registrado por el sensor', example: 7.2 })
  @IsNumber()
  @IsNotEmpty()
  valor: number;
}

export class CreateMuestreoDto {
  @ApiProperty({ description: 'ID de la estación donde se tomó la muestra', example: 101 })
  @IsNumber()
  @IsNotEmpty()
  id_estacion: number;

  @ApiProperty({ description: 'Fecha y hora exacta de la toma de muestra', example: '2026-04-28T14:30:00.000Z' })
  @IsDate()
  @IsNotEmpty()
  fecha_muestreo: Date;

  @ApiProperty({ description: 'Lista de mediciones capturadas en este muestreo', type: [MedidaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedidaDto)
  medidas: MedidaDto[];
}