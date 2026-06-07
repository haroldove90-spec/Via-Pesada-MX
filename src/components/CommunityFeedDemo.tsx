import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Bell, 
  Filter, 
  CheckCircle, 
  ArrowRight,
  Info,
  Map,
  Mic,
  Wifi
} from 'lucide-react';

interface FeedAlerta {
  id: string;
  categoria: 'seguridad' | 'reten' | 'seguro';
  titulo: string;
  lugar: string;
  tiempo: string;
  notaIa: string;
  severidad: 'alta' | 'media' | 'baja';
}

interface CommunityFeedDemoProps {
  onNavigate?: (tab: 'mapa' | 'copiloto' | 'detector') => void;
}

export default function CommunityFeedDemo({ onNavigate }: CommunityFeedDemoProps) {
  const [filtro, setFiltro] = useState<'todos' | 'seguridad' | 'reten' | 'seguro'>('todos');
  const [alertaAccion, setAlertaAccion] = useState<string | null>(null);

  const alertas: FeedAlerta[] = [
    {
      id: 'alerta-1',
      categoria: 'seguridad',
      titulo: "Reporte de Asalto Nocturno",
      lugar: "Tramo Matehuala - ALERTA ALTA",
      tiempo: "hace 2 min",
      notaIa: "Patrones de riesgo detectados en las últimas 2 horas. Guardia Nacional notificada. Se sugiere marchar en convoy.",
      severidad: 'alta'
    },
    {
      id: 'alerta-2',
      categoria: 'reten',
      titulo: "Retén de Báscula SCT",
      lugar: "Caseta Palmillas KM 136",
      tiempo: "hace 10 min",
      notaIa: "Verificación de peso activa para configuraciones Doble Remolque (Full) bajo la norma federal NOM-012.",
      severidad: 'media'
    },
    {
      id: 'alerta-3',
      categoria: 'seguro',
      titulo: "Parador Seguro Recomendado",
      lugar: "KM 57 (El Potosino)",
      tiempo: "hace 25 min",
      notaIa: "Espacio libre evaluado para fulles. Cámaras conectadas a C5, iluminación activa y presencia policial constante.",
      severidad: 'baja'
    }
  ];

  const alertasFiltradas = filtro === 'todos' 
    ? alertas 
    : alertas.filter(a => a.categoria === filtro);

  const handleReportAction = () => {
    setAlertaAccion("Transmisor activado: Grabando audio para IA de VíaPesada... Di el incidente.");
    setTimeout(() => {
      setAlertaAccion("Reporte procesado por IA v3.5: 'Bloqueo ejidatario en Km 40 de Autopista libre'. ¡Comunidad notificada correctamente!");
    }, 2800);
  };

  return (
    <div id="viapesada-community-feed-mobile" className="relative max-w-[390px] h-[780px] bg-slate-950 rounded-[46px] border-[10px] border-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden mx-auto font-sans text-white ring-4 ring-indigo-500/10">
      
      {/* PHONE TOP HEADER & NOTCH BAR */}
      <div className="absolute top-0 inset-x-0 h-9 bg-slate-950 flex justify-between items-center px-8 z-30 pointer-events-none">
        <span className="text-[11px] font-semibold font-mono tracking-tighter text-slate-400">9:41 AM</span>
        {/* Dynamic Island */}
        <div className="h-5 w-24 bg-slate-900 rounded-full border border-slate-800/50 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#101014] mr-2"></div>
          <div className="w-3.5 h-1 rounded-full bg-indigo-500/40"></div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-mono">5G</span>
        </div>
      </div>

      {/* COMPONENT MAIN SCROLL BODY */}
      <div className="flex-1 flex flex-col pt-10 pb-20 px-4 overflow-y-auto scrollbar-none">
        
        {/* TITLE & LIVE FEED INDICATOR */}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Radar Comunitario</span>
            <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">Alertas en Ruta</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 border border-slate-800 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Hace 1 min</span>
          </div>
        </div>

        {/* FEED FILTER SELECTOR PILLS */}
        <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap mt-4 pb-2.5 scrollbar-none">
          <button 
            onClick={() => setFiltro('todos')}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all border ${
              filtro === 'todos' 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
            }`}
          >
            Todas ({alertas.length})
          </button>
          <button 
            onClick={() => setFiltro('seguridad')}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all border flex items-center gap-1 ${
              filtro === 'seguridad' 
                ? 'bg-red-600 border-red-500 text-white shadow-md' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Seguridad</span>
          </button>
          <button 
            onClick={() => setFiltro('reten')}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all border flex items-center gap-1 ${
              filtro === 'reten' 
                ? 'bg-amber-600 border-amber-500 text-white shadow-md' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>SCT</span>
          </button>
          <button 
            onClick={() => setFiltro('seguro')}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all border flex items-center gap-1 ${
              filtro === 'seguro' 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Seguros</span>
          </button>
        </div>

        {/* ALERTS CARDS CONTAINER */}
        <div className="space-y-3 mt-3">
          {alertasFiltradas.map((item) => (
            <div 
              key={item.id}
              className={`p-4 rounded-3xl border transition-all ${
                item.severidad === 'alta' ? 'bg-red-950/20 border-red-900/40 text-red-50 hover:bg-red-950/30' :
                item.severidad === 'media' ? 'bg-amber-950/15 border-amber-900/30 text-amber-50 hover:bg-amber-950/25' :
                'bg-emerald-950/20 border-emerald-900/30 text-emerald-50 hover:bg-emerald-950/35'
              }`}
            >
              {/* Card Meta row */}
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/5">
                <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  item.severidad === 'alta' ? 'bg-red-500/25 text-red-300' :
                  item.severidad === 'media' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {item.categoria === 'seguridad' ? '🚨 Seguridad' : 
                   item.categoria === 'reten' ? '👮 Báscula SCT' : '🛡️ Parador Seguro'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">{item.tiempo}</span>
              </div>

              {/* Title & subtitle */}
              <h3 className="font-bold text-sm sm:text-base text-white">{item.titulo}</h3>
              <div className="text-[11px] text-slate-400 font-semibold font-mono mt-0.5 flex items-center gap-1">
                <span>📍</span>
                <span>{item.lugar}</span>
              </div>

              {/* AI Insight Box inside the card */}
              <div className="mt-3 p-3 bg-slate-950 rounded-2xl border border-slate-900 flex gap-2">
                <Sparkles className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[8px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Nota Inteligencia Artificial</span>
                  <p className="text-[10px] text-slate-300 leading-normal mt-0.5">
                    {item.notaIa}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* FEED REPORT INCIDENT CALL-TO-ACTION */}
        <div className="mt-5">
          <button 
            id="reportar-incidente-cta"
            onClick={handleReportAction}
            className="w-full bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white rounded-2xl py-3.5 px-4 font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 tracking-wide transform active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span>REPORTAR UN INCIDENTE AHORA</span>
          </button>
        </div>

        {/* Simulated recording/status dynamic island warning */}
        {alertaAccion && (
          <div className="mt-4 p-3 bg-indigo-950/60 border border-indigo-500/20 rounded-2xl text-[11px] leading-relaxed text-indigo-200 animate-fadeIn font-mono">
            {alertaAccion}
          </div>
        )}

        {/* Safety Tip */}
        <div className="mt-4 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] text-slate-400 flex gap-1.5">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>Cumplimiento con NOM-012 Regulación Federal. Los reportes comunitarios se verifican mediante red satelital.</span>
        </div>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR BAR */}
      <div className="absolute bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800/80 px-6 py-2 pb-5 z-20 flex items-center justify-between shadow-2xl">
        <button 
          onClick={() => onNavigate && onNavigate('mapa')}
          className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Map className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold font-mono">MAPA</span>
        </button>

        <button 
          onClick={() => onNavigate && onNavigate('copiloto')}
          className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Mic className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold font-mono">COPILOTO IA</span>
        </button>

        <button 
          className="flex flex-col items-center gap-1 p-2 text-indigo-400 transition-colors"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold font-mono">ALERTAS</span>
        </button>

        <button 
          onClick={() => onNavigate && onNavigate('detector')}
          className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Filter className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold font-mono font-bold text-emerald-400">WHATSAPP</span>
        </button>
      </div>

    </div>
  );
}
