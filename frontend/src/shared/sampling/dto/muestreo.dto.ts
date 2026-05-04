import { Parametro } from './parametro.dto';

export interface Medida {
  id: number;
  parametroId: number;
  muestreoId: number;
  valor: number;
  parametro?: Parametro; // Objeto completo del parámetro
}

export interface Muestreo {
  id: number;
  estacionId: number;
  fechaMuestreo: string;
  irca_calculado: number;
  clasificacionIrca?: {
    clasificacion: string;
    descripcion: string;
    valor_min: number;
    valor_max: number;
  };
  medidas?: Medida[];
}


export interface MuestreosFilters {
  estacionId?: string;
  parametro?: string;
  fechaInicio?: string;
  fechaFin?: string;
}
