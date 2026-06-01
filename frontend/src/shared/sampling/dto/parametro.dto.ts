export interface Parametro {
  id: number;
  nombre: string;
  unidadMedida: string;   // Unificado a camelCase
  valorMinimo: number;    // Unificado a camelCase
  valorMaximo: number;    // Unificado a camelCase
  puntajeRiesgo: number;  // Unificado (reemplaza nivel_riesgo)
  descripcion: string;
}
