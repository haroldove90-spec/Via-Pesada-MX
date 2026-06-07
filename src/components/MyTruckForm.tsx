import React, { useState } from 'react';
import { 
  Truck, 
  Ruler, 
  Scale, 
  ShieldAlert, 
  Check, 
  HelpCircle, 
  Layers,
  ChevronDown,
  FileCheck
} from 'lucide-react';

export interface TruckProfile {
  configuracionSict: string;
  alturaMaxima: string;
  pesoBruto: string;
  tipoCarga: 'General' | 'Refrigerada' | 'Hazmat';
}

interface MyTruckFormProps {
  initialProfile: TruckProfile;
  onSave: (profile: TruckProfile) => void;
  onNavigateToMap: () => void;
}

export default function MyTruckForm({ initialProfile, onSave, onNavigateToMap }: MyTruckFormProps) {
  const [profile, setProfile] = useState<TruckProfile>({ ...initialProfile });
  const [isSaved, setIsSaved] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const sictOptions = [
    "T3-S2 (Sencillo)",
    "T3-S2-R4 (Full / Doble Remolque)",
    "C3 (Tándem)",
    "T3-S3 (Sencillo Reforzado)",
    "T3-S2-S2 (Doble Semirremolque R. Sencillo)"
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onNavigateToMap();
    }, 1800);
  };

  return (
    <div className="flex-1 w-full flex flex-col h-full bg-slate-950 text-slate-100 p-4 pb-24 overflow-y-auto font-sans">
      
      {/* HEADER SECTION */}
      <div className="mb-4 shrink-0 px-1 border-b border-slate-800/80 pb-3">
        <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest font-mono">BÁSIC•MEX-CONFIG</span>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
          <Truck className="w-5 h-5 text-amber-400" /> Mi Configuración
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure las especificaciones de su tractocamión para el cálculo inteligente de gálibos y pesos NOM-012.</p>
      </div>

      {isSaved && (
        <div className="mb-4 bg-emerald-950/90 border border-emerald-500/50 rounded-xl p-3 text-emerald-300 flex items-center justify-between text-xs animate-fadeIn shadow-lg shadow-emerald-950/40">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <span className="font-extrabold text-white block">Perfil Guardado</span>
              <span className="text-[10px] text-emerald-400 font-mono">NOM-012 calculada éxitosamente</span>
            </div>
          </div>
          <span className="text-[9px] bg-emerald-900 px-2 py-0.5 rounded font-mono font-bold">VÍA SEGURA</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSave} className="space-y-4 flex-1">
        
        {/* Dropdown de Configuración SICT */}
        <div className="relative">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1">
            Configuración Autorizada SICT (NOM-012)
          </label>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-left text-white focus:outline-none focus:ring-1 focus:ring-amber-400/50 hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{profile.configuracionSict}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute top-16 left-0 right-0 bg-slate-900/98 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl z-30 overflow-hidden py-1 animate-slideUp">
              {sictOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setProfile({ ...profile, configuracionSict: opt });
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-white transition-colors ${
                    profile.configuracionSict === opt ? 'bg-indigo-500/10 text-white font-extrabold border-l-2 border-amber-400' : ''
                  }`}
                >
                  <span>{opt}</span>
                  {profile.configuracionSict === opt && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Inputs de Altura Máxima y Peso Bruto */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Altura */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1">
              Altura Máxima (m)
            </label>
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
              <Ruler className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
              <input
                type="number"
                step="0.05"
                min="2.00"
                max="5.50"
                value={profile.alturaMaxima}
                onChange={(e) => setProfile({ ...profile, alturaMaxima: e.target.value })}
                className="w-full bg-transparent text-white text-sm outline-none font-bold"
                placeholder="4.25"
                required
              />
              <span className="text-[10px] text-slate-500 font-mono font-bold self-center">m</span>
            </div>
          </div>

          {/* Peso Bruto */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1">
              Peso Bruto (Ton)
            </label>
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
              <Scale className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
              <input
                type="number"
                step="0.1"
                min="5.0"
                max="120.0"
                value={profile.pesoBruto}
                onChange={(e) => setProfile({ ...profile, pesoBruto: e.target.value })}
                className="w-full bg-transparent text-white text-sm outline-none font-bold"
                placeholder="75.5"
                required
              />
              <span className="text-[10px] text-slate-500 font-mono font-bold self-center">T</span>
            </div>
          </div>

        </div>

        {/* Tipo de Carga Selector (Botones Tactiles) */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
            Tipo de Carga Transportada
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['General', 'Refrigerada', 'Hazmat'] as const).map((tipo) => {
              const active = profile.tipoCarga === tipo;
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setProfile({ ...profile, tipoCarga: tipo })}
                  className={`py-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-400/10 scale-102'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <span className="text-xs tracking-wide uppercase font-extrabold font-mono">{tipo}</span>
                  {active && <span className="text-[8px] bg-slate-950 text-amber-400 font-bold px-1.5 py-0.2 rounded leading-tight">ACTIVO</span>}
                </button>
              );
            })}
          </div>
          {profile.tipoCarga === 'Hazmat' && (
            <div className="mt-2 bg-red-950/80 border border-red-500/40 rounded-xl p-3 text-red-200 text-[10px] leading-relaxed flex items-start gap-2 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Protocolo HAZMAT Activo</strong>
                <span>Se filtrarán las autopistas restringidas para transporte de materiales peligrosos y se sugerirán rutas de libramiento federal reglamentarias.</span>
              </div>
            </div>
          )}
        </div>

        {/* RESTRICCIONES DE INFRAESTRUCTURA DETECTADAS */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-slate-300 font-bold mb-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] uppercase tracking-wider font-mono font-bold">Diagnóstico VíaPesada NOM-012</span>
          </div>
          <div className="space-y-1.5 font-sans text-slate-400 text-[11px]">
            <div className="flex items-center justify-between">
              <span>Gálibo Mínimo Requerido:</span>
              <span className="font-mono text-white font-bold">{(parseFloat(profile.alturaMaxima) + 0.15).toFixed(2)}m (margen de seg.)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Límite Peso Bruto Federal:</span>
              <span className="font-mono text-white font-black">{profile.configuracionSict.includes('Full') ? '75.5' : '43.5'} Toneladas</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Restricción de Puentes:</span>
              <span className="font-mono text-amber-400 font-bold">Evitar Puentes &lt; {profile.alturaMaxima}m</span>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-xs uppercase tracking-wide border border-indigo-400/20"
        >
          <Truck className="w-4 h-4 text-amber-400" />
          Guardar Perfil de Camión
        </button>

      </form>
    </div>
  );
}
