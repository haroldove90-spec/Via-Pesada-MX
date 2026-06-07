import { ReporteCarretera } from './types';

export const REPORTES_INICIALES: ReporteCarretera[] = [
  {
    id: 1,
    tipo_alerta: 'seguridad',
    carretera: 'Autopista México-Querétaro (57D)',
    kilometro: 'Caseta Palmillas',
    sentido: 'a Querétaro',
    descripcion_corta: 'Paro de camiones por civiles armados en camionetas sospechosas saliendo de la caseta de Palmillas.',
    nivel_riesgo: 'alto',
    raw_message: 'Al tiro compañeros, están parando camiones saliendo de la caseta de Palmillas dirección Querétaro, se ven camionetas raras con gente armada, reportado hace 10 min.',
    fecha_reporte: 'Hace 10 min'
  },
  {
    id: 2,
    tipo_alerta: 'accidente',
    carretera: 'Autopista México-Puebla (150D)',
    kilometro: 72,
    sentido: 'a Puebla',
    descripcion_corta: 'Volcadura de tractocamión doble remolque (full de tolvas). Tránsito totalmente detenido en la zona.',
    nivel_riesgo: 'alto',
    raw_message: 'Tráfico parado total en la México-Puebla por el km 72 pasando Río Frío hacia Puebla, se volteó un full de tolvas, ya está ahí la Guardia Nacional.',
    fecha_reporte: 'Reciente'
  },
  {
    id: 3,
    tipo_alerta: 'reten',
    carretera: 'Carretera Libre Saltillo-Monterrey (40)',
    kilometro: 'Entrada desde Saltillo',
    sentido: 'a Monterrey',
    descripcion_corta: 'Báscula móvil e inspección de dimensiones y pesos por elementos de la SCT.',
    nivel_riesgo: 'medio',
    raw_message: 'Reportan operativo de la SCT pesando en la libre a Monterrey entrando por Saltillo, pendientes con las dimensiones.',
    fecha_reporte: 'Activo'
  }
];
