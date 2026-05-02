export interface Medida {
  id: number;
  parametro: string;
  valor: number;
  unidad: string;
}

export interface Muestreo {
  id: number;
  estacionId: number;
  fechaMuestreo: string;
  irca_calculado: number;
  medidas?: Medida[];
}

export interface MuestreosFilters {
  estacionId?: string;
  parametro?: string;
  fechaInicio?: string;
  fechaFin?: string;
}
