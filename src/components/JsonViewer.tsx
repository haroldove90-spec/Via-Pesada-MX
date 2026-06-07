import React, { useState } from 'react';
import { ReporteCarretera } from '../types';
import { Copy, Check, Code, HelpCircle } from 'lucide-react';

interface JsonViewerProps {
  currentReport: ReporteCarretera | null;
  allReports: ReporteCarretera[];
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ currentReport, allReports }) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSelected, setCopiedSelected] = useState(false);
  const [viewMode, setViewMode] = useState<'selected' | 'all'>('all');

  // Strip raw debug fields for clean JSON delivery matching user request
  const cleanReportForJson = (rep: ReporteCarretera) => {
    return {
      id: rep.id,
      tipo_alerta: rep.tipo_alerta,
      carretera: rep.carretera,
      kilometro: rep.kilometro,
      sentido: rep.sentido,
      descripcion_corta: rep.descripcion_corta,
      nivel_riesgo: rep.nivel_riesgo
    };
  };

  const selectedJsonStr = currentReport 
    ? JSON.stringify(cleanReportForJson(currentReport), null, 2) 
    : '{\n  // Selecciona una alerta para ver su JSON individual\n}';

  const allJsonStr = JSON.stringify(allReports.map(cleanReportForJson), null, 2);

  const handleCopy = async (text: string, type: 'all' | 'selected') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'all') {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      } else {
        setCopiedSelected(true);
        setTimeout(() => setCopiedSelected(false), 2000);
      }
    } catch (err) {
      console.error('Error al copiar al portapapeles', err);
    }
  };

  return (
    <div id="json-viewer-container" className="bg-[#1e1e24] rounded-2xl border border-slate-800 text-slate-300 overflow-hidden shadow-xl">
      {/* Header bar */}
      <div className="bg-[#141419] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-red-400/40"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400/40"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400/40"></span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 ml-2 tracking-wider flex items-center gap-1.5 uppercase">
            <Code className="w-4 h-4 text-emerald-400" /> Output_JSON
          </span>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1 text-xs rounded font-medium transition-all ${
              viewMode === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ver Array Completo ({allReports.length})
          </button>
          <button
            onClick={() => setViewMode('selected')}
            className={`px-3 py-1 text-xs rounded font-medium transition-all ${
              viewMode === 'selected'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Alerta Seleccionada
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="relative group">
        <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono max-h-[380px] min-h-[180px] scrollbar-thin scrollbar-thumb-slate-800">
          <code className="text-emerald-300">
            {viewMode === 'all' ? allJsonStr : selectedJsonStr}
          </code>
        </pre>

        {/* Floating Copy Button */}
        <div className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity">
          {viewMode === 'all' ? (
            <button
              onClick={() => handleCopy(allJsonStr, 'all')}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 flex items-center gap-1.5 text-xs font-medium transition-all"
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Array</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => currentReport && handleCopy(selectedJsonStr, 'selected')}
              disabled={!currentReport}
              className={`p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 flex items-center gap-1.5 text-xs font-medium transition-all ${
                !currentReport ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {copiedSelected ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Alerta</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer Meta info */}
      <div className="bg-[#141419] px-4 py-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Encoding: UTF-8</span>
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          JSON estructurado según esquema oficial de la SCT / Logística
        </span>
      </div>
    </div>
  );
};
