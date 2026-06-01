import type { Parametro } from "./parametro.dto";

export interface Medida {
  id: number;
  valor: number;
  parametro: Parametro;
}

export interface Muestreo {
  id: number;
  estacionId: number;
  fechaMuestreo: string;
  irca_calculado: number; // Generalmente viene así del cálculo de base de datos
  medidas: Medida[];
  clasificacionIrca?: {
    clasificacion?: string;
    descripcion?: string;
  };
}

export interface MuestreosFilters {
  estacionId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  ircaMin?: number;
  ircaMax?: number;
}