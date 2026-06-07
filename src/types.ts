export type AlertaTipo = 'seguridad' | 'accidente' | 'reten' | 'bloqueo';
export type RiesgoNivel = 'alto' | 'medio' | 'bajo';

export interface ReporteCarretera {
  id: number;
  tipo_alerta: AlertaTipo;
  carretera: string;
  kilometro: string | number | null;
  sentido: string;
  descripcion_corta: string;
  nivel_riesgo: RiesgoNivel;
  raw_message?: string; // Storing the original WhatsApp text
  fecha_reporte?: string; // Captured date/time
}
