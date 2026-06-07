import React from 'react';
import { ReporteCarretera } from '../types';
import { 
  ShieldAlert, 
  Car, 
  Scale, 
  AlertTriangle, 
  Ban, 
  ArrowRight,
  MapPin,
  Clock
} from 'lucide-react';

interface AlertCardProps {
  reporte: ReporteCarretera;
  isSelected: boolean;
  onSelect: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ reporte, isSelected, onSelect }) => {
  // Get Alert Icon
  const getIcon = () => {
    switch (reporte.tipo_alerta) {
      case 'seguridad':
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'accidente':
        return <Car className="w-5 h-5 text-amber-500" />;
      case 'reten':
        return <Scale className="w-5 h-5 text-blue-500" />;
      case 'bloqueo':
        return <Ban className="w-5 h-5 text-rose-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-500" />;
    }
  };

  // Get risk level details
  const getRiskStyles = () => {
    switch (reporte.nivel_riesgo) {
      case 'alto':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          indicator: 'bg-red-500',
          text: 'Riesgo Alto'
        };
      case 'medio':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          indicator: 'bg-amber-500',
          text: 'Riesgo Medio'
        };
      case 'bajo':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          indicator: 'bg-emerald-500',
          text: 'Riesgo Bajo'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          indicator: 'bg-slate-400',
          text: 'Riesgo Normal'
        };
    }
  };

  const riskStyles = getRiskStyles();

  return (
    <div
      id={`alert-card-${reporte.id}`}
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected 
          ? 'bg-slate-800 border-slate-700 text-white shadow-lg shadow-slate-900/10' 
          : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-700' : 'bg-slate-100'}`}>
            {getIcon()}
          </div>
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isSelected ? 'text-slate-300' : 'text-slate-500'
            }`}>
              {reporte.tipo_alerta}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{reporte.fecha_reporte || 'Hace unos momentos'}</span>
            </div>
          </div>
        </div>
        
        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${riskStyles.bg}`}>
          {riskStyles.text}
        </span>
      </div>

      <h3 className="font-bold text-sm sm:text-base mt-3 leading-snug">
        {reporte.carretera}
      </h3>

      <div className="mt-2.5 space-y-1.5 text-xs sm:text-sm">
        {reporte.kilometro && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className={isSelected ? 'text-slate-300' : 'text-slate-600'}>
              Kilómetro / Ref: <strong className={isSelected ? 'text-white' : 'text-slate-800'}>{reporte.kilometro}</strong>
            </span>
          </div>
        )}
        
        {reporte.sentido && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <ArrowRight className="w-3.5 h-3.5 shrink-0 rotate-45" />
            <span className={isSelected ? 'text-slate-300' : 'text-slate-600'}>
              Sentido: <strong className={isSelected ? 'text-white' : 'text-slate-800'}>{reporte.sentido}</strong>
            </span>
          </div>
        )}
      </div>

      <p className={`mt-3 text-xs line-clamp-2 ${
        isSelected ? 'text-slate-300' : 'text-slate-600'
      }`}>
        {reporte.descripcion_corta}
      </p>

      {reporte.raw_message && (
        <div className={`mt-3 pt-2 border-t text-[11px] italic font-mono truncate ${
          isSelected ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-400'
        }`}>
          &ldquo;{reporte.raw_message}&rdquo;
        </div>
      )}
    </div>
  );
};
