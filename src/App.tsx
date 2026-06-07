import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Mic, 
  MicOff,
  Truck, 
  Wifi,
  Search,
  X,
  Navigation,
  Coins,
  Volume2,
  VolumeX,
  Clock,
  Compass,
  Sparkles,
  ShieldAlert,
  Ruler,
  Scale,
  Check,
  Layers,
  ChevronDown,
  FileCheck,
  MapPin,
  Info
} from 'lucide-react';

// Type definitions
export interface TruckProfile {
  configuracionSict: string;
  alturaMaxima: string;
  pesoBruto: string;
  tipoCarga: 'General' | 'Refrigerada' | 'Hazmat';
}

interface RutaDestino {
  id: string;
  nombre: string;
  queryParam: string;
  rutaFormato: string;
  casetas: string;
  eta: string;
  kmRestantes: string;
  soundMensaje: string;
  alertas: {
    titulo: string;
    tipo: 'seguridad' | 'reten' | 'accidente';
    descripcion: string;
    tramo: string;
    riesgo: 'Alto' | 'Medio' | 'Bajo';
  };
}

const DESTINOS: RutaDestino[] = [
  {
    id: 'cdmx',
    nombre: 'CDMX',
    queryParam: 'Ciudad de Mexico',
    rutaFormato: 'N. Laredo ➔ CDMX',
    casetas: '$4,860 MXN',
    eta: '10h 45m',
    kmRestantes: '840 km',
    soundMensaje: "Atención operador: Tramo Matehuala reporta asaltos nocturnos hace 11 min. Sugiero mantener convoy con otros dos transportistas.",
    alertas: {
      titulo: "Alerta Matehuala • KM 142",
      tipo: "seguridad",
      descripcion: "Reportes de asaltos activos de madrugada. Guardia Nacional con presencia intermitente. Se aconseja viajar en convoy pesado.",
      tramo: "San Luis Potosí a Matehuala DF-57",
      riesgo: "Alto"
    }
  },
  {
    id: 'mty',
    nombre: 'Monterrey, NL',
    queryParam: 'Monterrey, Nuevo Leon',
    rutaFormato: 'N. Laredo ➔ Monterrey',
    casetas: '$1,250 MXN',
    eta: '3h 15m',
    kmRestantes: '220 km',
    soundMensaje: "Operador, entramos a la ruta Monterrey-Saltillo. Alerta de Cuesta de Mamulique: neblina intensa en la zona de curvas.",
    alertas: {
      titulo: "Neblina en Saltillo - Monterrey",
      tipo: "accidente",
      descripcion: "Pavimento mojado por llovizna y visibilidad reducida a menos de 10 metros en zonas altas de la Cuesta de Mamulique.",
      tramo: "Autopista Mty-Laredo KM 65",
      riesgo: "Medio"
    }
  },
  {
    id: 'gdl',
    nombre: 'Guadalajara, Jal',
    queryParam: 'Guadalajara, Jalisco',
    rutaFormato: 'N. Laredo ➔ Guadalajara',
    casetas: '$3,920 MXN',
    eta: '8h 30m',
    kmRestantes: '710 km',
    soundMensaje: "Iniciando ruta a Guadalajara. Guardia Nacional reporta operativo de báscula de pesaje y control NOM-012 en Macrolibramiento.",
    alertas: {
      titulo: "Operativo Báscula SCT",
      tipo: "reten",
      descripcion: "Revisión rigurosa de peso bruto autorizado y NOM-012 en el ingreso al Macrolibramiento de Guadalajara.",
      tramo: "KM 45 del Macrolibramiento GDL",
      riesgo: "Medio"
    }
  },
  {
    id: 'ver',
    nombre: 'Veracruz, Ver',
    queryParam: 'Veracruz, Veracruz',
    rutaFormato: 'N. Laredo ➔ Veracruz',
    casetas: '$5,640 MXN',
    eta: '12h 15m',
    kmRestantes: '1,140 km',
    soundMensaje: "Estableciendo ruta hacia Veracruz. Cumbres de Maltrata reporta densa neblina y llovizna. Active el freno de motor.",
    alertas: {
      titulo: "Cumbres de Maltrata Cerrada",
      tipo: "accidente",
      descripcion: "Niebla extremadamente cerrada en el descenso de las cumbres. Operadores activando freno de motor de forma preventiva.",
      tramo: "Autopista Orizaba-Puebla KM 230",
      riesgo: "Alto"
    }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'mapa' | 'copiloto' | 'camion'>('mapa');
  
  // Setup default state matching instructions
  const [truckProfile, setTruckProfile] = useState<TruckProfile>({
    configuracionSict: 'T3-S2-R4 (Full / Doble Remolque)',
    alturaMaxima: '4.25',
    pesoBruto: '75.5',
    tipoCarga: 'General'
  });

  const [activeRoute, setActiveRoute] = useState<RutaDestino>(DESTINOS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copilotoActivo, setCopilotoActivo] = useState(false);
  const [copilotoMensaje, setCopilotoMensaje] = useState<string | null>(DESTINOS[0].soundMensaje);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSictDropdown, setShowSictDropdown] = useState(false);

  // Suggested Sict Options
  const sictOptions = [
    "T3-S2 (Sencillo)",
    "T3-S2-R4 (Full / Doble Remolque)",
    "C3 (Tándem)",
    "T3-S3 (Sencillo Reforzado)",
    "T3-S2-S2 (Doble Semirremolque R. Sencillo)"
  ];

  // Helper to abbreviate profile SICT
  const getSictAbbreviation = (sict: string) => {
    if (sict.includes('Full') || sict.includes('R4')) return 'Full';
    if (sict.includes('Sencillo')) return 'Sencillo';
    if (sict.includes('Tándem') || sict.includes('C3')) return 'Tándem';
    return 'Sencillo';
  };

  const pDisplay = `${getSictAbbreviation(truckProfile.configuracionSict)} ${truckProfile.pesoBruto}T`;

  // Filter destinations based on user input
  const filteredDestinos = DESTINOS.filter(d => 
    d.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectRoute = (route: RutaDestino) => {
    setActiveRoute(route);
    setCopilotoMensaje(route.soundMensaje);
    setSearchQuery(route.nombre);
    setIsDropdownOpen(false);
  };

  const handleMicToggle = () => {
    setCopilotoActivo(!copilotoActivo);
    if (!copilotoActivo) {
      setCopilotoMensaje(`Copiloto escuchando... "¿Cómo viene la autopista hacia ${activeRoute.nombre}?"`);
      setTimeout(() => {
        if (activeRoute.id === 'mty') {
          setCopilotoMensaje("Operador, la Cuesta de Mamulique presenta visibilidad reducida por llovizna. Mantenga distancia.");
        } else if (activeRoute.id === 'gdl') {
          setCopilotoMensaje("Guadalajara reporta báscula federal operando en el Macrolibramiento. Su peso de " + truckProfile.pesoBruto + " toneladas está dentro del rango seguro.");
        } else if (activeRoute.id === 'ver') {
          setCopilotoMensaje("Atención en Cumbres de Maltrata: active el freno de motor auxiliar. La carretera tiene pavimento con alta humedad.");
        } else {
          setCopilotoMensaje("Ruta a CDMX con asaltos nocturnos activos de madrugada en tramo Matehuala. Sugiero circular acoplado en convoy.");
        }
      }, 2400);
    } else {
      setCopilotoMensaje(null);
    }
  };

  const handleSaveTruck = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('mapa');
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none font-sans">
      
      {/* IMMERSIVE HEADER / SYSTEM BAR ONLY */}
      <header className="w-full bg-slate-950/90 backdrop-blur-md flex justify-between items-center px-5 pt-3 pb-2 z-50 pointer-events-none sticky top-0 shrink-0 border-b border-slate-900/60">
        <span className="text-xs font-bold font-mono tracking-tighter text-slate-300">9:41 AM</span>
        <div className="h-4.5 w-24 bg-slate-900 rounded-full border border-slate-800/80 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
          <span className="text-[7.5px] text-indigo-400 font-bold font-mono uppercase tracking-widest">VíaPesada MX</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 text-[10px] font-mono">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold">5G</span>
        </div>
      </header>

      {/* CORE VIEWPORT CONTENT */}
      <main className="flex-1 w-full flex flex-col relative overflow-hidden">
        
        {/* TAB 1: MAPA REAL EMBEBIDO */}
        {activeTab === 'mapa' && (
          <div className="w-full h-full flex flex-col relative overflow-hidden animate-fadeIn">
            
            {/* 1. GOOGLE MAPS IFRAME WITH DARK FILTER */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-slate-950">
              <iframe
                id="real-google-map-iframe"
                title="Google Maps Directions"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)',
                }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyBeAbgisBE5m8sVSpglnwXKHdoNRHZMG-s&origin=Nuevo+Laredo,+Tamaulipas&destination=${encodeURIComponent(activeRoute.queryParam)}`}
              ></iframe>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-10" />
            </div>

            {/* 2. FLOATING SEARCH BAR */}
            <div className="absolute top-4 inset-x-3.5 z-30 pointer-events-auto">
              <div className="relative">
                <div className="flex items-center bg-slate-900/95 backdrop-blur-md border border-slate-800/90 rounded-xl px-3 py-2.5 shadow-2xl ring-1 ring-slate-800/50">
                  <Search className="w-4.5 h-4.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Buscar destino..."
                    className="w-full bg-transparent text-white text-xs placeholder-slate-500 font-sans outline-none font-semibold"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setActiveRoute(DESTINOS[0]);
                        setCopilotoMensaje(DESTINOS[0].soundMensaje);
                      }} 
                      className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown suggestions */}
                {isDropdownOpen && (
                  <div className="absolute top-12 inset-x-0 bg-slate-900/98 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-1.5 z-40 max-h-48 overflow-y-auto animate-fadeIn">
                    <div className="text-[9px] text-slate-500 font-bold px-2 py-1 uppercase tracking-wider font-mono">Destinos Camioneros Clave</div>
                    {filteredDestinos.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => handleSelectRoute(dest)}
                        className="w-full flex items-center gap-2.5 px-2 py-2 hover:bg-indigo-600/30 rounded-lg text-left transition-colors text-xs text-slate-200 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <div>
                          <span className="font-extrabold text-white block">{dest.nombre}</span>
                          <span className="text-[9px] text-slate-400 font-mono">Ruta Autorizada SICT • {dest.kmRestantes}</span>
                        </div>
                      </button>
                    ))}
                    {filteredDestinos.length === 0 && (
                      <div className="text-slate-500 text-[10px] py-3 text-center">Sin resultados</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. TRIP INFORMATION DRAWER (OVERLAY ON MAP) */}
            <div className="absolute top-[68px] inset-x-3.5 z-20 pointer-events-auto">
              <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                      <Navigation className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 font-mono">Origen: N. Laredo</span>
                        <span className="text-[8px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-1.5 py-0.2 rounded">ACTIVO</span>
                      </div>
                      <h2 className="text-sm font-black text-white mt-0.5">
                        {activeRoute.rutaFormato}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="flex flex-col items-end bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="text-[7.5px] uppercase font-bold tracking-wider text-slate-500 font-mono">Casetas CAPUFE</span>
                      <strong className="text-[10px] font-mono text-amber-400">{activeRoute.casetas}</strong>
                    </div>

                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 bg-slate-950/85 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
                      title="Silenciar alertas"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* DYNAMIC REGISTERED TRUCK PROFILE ADAPTIVE BANNER */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[8.5px] text-amber-400 font-mono font-bold flex items-center justify-between bg-slate-950/40 px-2 py-1.5 rounded-lg border border-slate-800/30">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3 h-3 text-amber-400" />
                    <span>Perfil Activo: {pDisplay}</span>
                  </div>
                  <span>Evitando puentes menores a {truckProfile.alturaMaxima}m</span>
                </div>
              </div>
            </div>

            {/* 4. DYNAMIC HIGHWAY ALERT BANNER */}
            <div className="absolute bottom-[164px] inset-x-3.5 z-20 pointer-events-auto animate-slideUp">
              <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800/95 rounded-2xl p-3.5 shadow-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    activeRoute.alertas.tipo === 'seguridad' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    activeRoute.alertas.tipo === 'reten' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {activeRoute.alertas.tipo === 'seguridad' ? '🚨 Seguridad' : activeRoute.alertas.tipo === 'reten' ? '👮 Báscula' : '⚠️ Alerta Vial'} • Riesgo {activeRoute.alertas.riesgo}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono truncate max-w-[170px]">{activeRoute.alertas.tramo}</span>
                </div>
                <h4 className="font-extrabold text-white text-xs sm:text-sm">{activeRoute.alertas.titulo}</h4>
                <p className="text-[10px] text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-2.5 border border-slate-800/60 rounded-xl">
                  {activeRoute.alertas.descripcion}
                </p>
              </div>
            </div>

            {/* 5. VOICE AI COPILOTO OVERLAY MESSAGES */}
            {copilotoMensaje && (
              <div className="absolute right-3.5 bottom-[356px] max-w-[250px] z-20 pointer-events-auto animate-fadeIn">
                <div className="bg-slate-950/98 backdrop-blur-md border border-indigo-500/40 rounded-xl p-3.5 shadow-2xl">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-indigo-500/10">
                    <span className="text-[8.5px] font-bold text-indigo-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
                      Copiloto Inteligente Gemini
                    </span>
                    <button onClick={() => setCopilotoMensaje(null)} className="text-slate-500 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[9.5px] text-indigo-50 leading-relaxed italic">
                    &ldquo;{copilotoMensaje}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* FLOATING MIC BUTTON FOR INSTANT COPILOTO ACCESSIBILITY */}
            <div className="absolute right-3.5 bottom-[296px] z-20 pointer-events-auto">
              <button 
                id="copiloto-ai-floating-btn"
                onClick={handleMicToggle}
                className={`p-3.5 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 group ${
                  copilotoActivo 
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-red-500/40' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/40 ring-4 ring-indigo-500/10 animate-bounce'
                }`}
                title="Copiloto de Voz"
              >
                <div className="flex items-center gap-1.5">
                  {copilotoActivo ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="text-[9px] font-bold font-mono tracking-wider max-w-0 overflow-hidden group-hover:max-w-24 transition-all duration-300 whitespace-nowrap">
                    {copilotoActivo ? "MUTE" : "HABLAR"}
                  </span>
                </div>
              </button>
            </div>

            {/* 6. BOTTOM HUD STATS BAR */}
            <div className="absolute bottom-[72px] inset-x-0 bg-slate-900 border-t border-slate-800 p-3 z-10 pointer-events-auto shadow-2xl">
              <div className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 uppercase font-bold font-mono">Tiempo ETA</span>
                    <strong className="text-[11px] font-mono text-white">{activeRoute.eta}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 uppercase font-bold font-mono">Km Restantes</span>
                    <strong className="text-[11px] font-mono text-white">{activeRoute.kmRestantes}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-900/60 px-2.5 py-1.5 rounded-lg text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span>NOM-012 OK</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: COPILOTO VOICE AI TRANSCRIPT VIEW */}
        {activeTab === 'copiloto' && (
          <div className="flex-1 w-full bg-slate-950 p-4 pb-24 overflow-y-auto flex flex-col justify-between animate-fadeIn">
            <div>
              <div className="mb-4 text-center">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Copiloto Activo • Manos Libres</span>
                <h2 className="text-lg font-black text-white tracking-tight mt-1">Interacción Digital de Voz</h2>
              </div>

              {/* SoundWave visualizer representation */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center py-6 mb-4">
                <div className="flex items-center justify-center gap-1.5 h-10 mb-2">
                  <span className={`w-1 bg-indigo-500 rounded-full transition-all duration-300 ${copilotoActivo ? 'h-8 animate-pulse' : 'h-3'}`}></span>
                  <span className={`w-1 bg-indigo-400 rounded-full transition-all duration-200 ${copilotoActivo ? 'h-10 animate-ping' : 'h-5'}`}></span>
                  <span className={`w-1 bg-purple-500 rounded-full transition-all duration-300 ${copilotoActivo ? 'h-6 animate-pulse' : 'h-4'}`}></span>
                  <span className={`w-1 bg-purple-400 rounded-full transition-all duration-150 ${copilotoActivo ? 'h-9 animate-bounce' : 'h-3'}`}></span>
                  <span className={`w-1 bg-pink-500 rounded-full transition-all duration-300 ${copilotoActivo ? 'h-4 animate-pulse' : 'h-2'}`}></span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Detección de voz automatizada</span>
              </div>

              <div className="space-y-3.5">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[9px] font-bold text-slate-500 font-mono mb-1">PREGUNTA DEL OPERADOR:</div>
                  <p className="text-xs text-white italic font-medium">"¿Cómo está la seguridad de la carretera en {activeRoute.nombre}?"</p>
                </div>

                <div className="bg-indigo-950/45 border border-indigo-900/60 p-3.5 rounded-xl">
                  <div className="text-[9px] font-bold text-indigo-400 font-mono mb-1">CONTESTACIÓN SINTETIZADA:</div>
                  <p className="text-xs text-indigo-100 leading-relaxed font-sans">{activeRoute.soundMensaje}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3">
              <button
                onClick={handleMicToggle}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  copilotoActivo ? 'bg-red-600 animate-ping' : 'bg-indigo-600 hover:bg-indigo-700 scale-102 shadow-lg shadow-indigo-500/20'
                }`}
              >
                {copilotoActivo ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
              </button>
              <span className="text-[10px] text-slate-400 font-bold font-mono">
                {copilotoActivo ? "PULSA PARA APAGAR COPILOTO" : "PULSA PARA HABLAR AL COPILOTO"}
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: MI CAMIÓN (TACTOR / TRAILER CONFIG FORM) */}
        {activeTab === 'camion' && (
          <div className="flex-1 w-full bg-slate-950 p-4 pb-24 overflow-y-auto flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="mb-4 pb-3 border-b border-slate-800/80">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest font-mono">BÁSIC•MEX-CONFIG</span>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                <Truck className="w-5 h-5 text-amber-400" /> Mi Configuración
              </h2>
              <p className="text-xs text-slate-400 mt-1">Configure las especificaciones de su tractocamión para el cálculo inteligente de gálibos y pesos NOM-012.</p>
            </div>

            {saveSuccess && (
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

            <form onSubmit={handleSaveTruck} className="space-y-4">
              {/* SICT Dropdown */}
              <div className="relative">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1">
                  Configuración Autorizada SICT (NOM-012)
                </label>
                <button
                  type="button"
                  onClick={() => setShowSictDropdown(!showSictDropdown)}
                  className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3.5 text-sm text-left text-white focus:outline-none focus:ring-1 focus:ring-amber-400/50 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold">{truckProfile.configuracionSict}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showSictDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSictDropdown && (
                  <div className="absolute top-16 left-0 right-0 bg-slate-900/98 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl z-30 overflow-hidden py-1 animate-slideUp">
                    {sictOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setTruckProfile({ ...truckProfile, configuracionSict: opt });
                          setShowSictDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-white transition-colors ${
                          truckProfile.configuracionSict === opt ? 'bg-indigo-500/10 text-white font-extrabold border-l-2 border-amber-400' : ''
                        }`}
                      >
                        <span>{opt}</span>
                        {truckProfile.configuracionSict === opt && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Altura and Peso Bruto Controls */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1">
                    Altura Máxima (m)
                  </label>
                  <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3">
                    <Ruler className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                    <input
                      type="number"
                      step="0.05"
                      min="2.00"
                      max="5.50"
                      value={truckProfile.alturaMaxima}
                      onChange={(e) => setTruckProfile({ ...truckProfile, alturaMaxima: e.target.value })}
                      className="w-full bg-transparent text-white text-sm outline-none font-extrabold"
                      placeholder="4.25"
                      required
                    />
                    <span className="text-[10px] text-slate-500 font-mono font-bold self-center">m</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1">
                    Peso Bruto (Ton)
                  </label>
                  <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3">
                    <Scale className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                    <input
                      type="number"
                      step="0.1"
                      min="5.0"
                      max="120.0"
                      value={truckProfile.pesoBruto}
                      onChange={(e) => setTruckProfile({ ...truckProfile, pesoBruto: e.target.value })}
                      className="w-full bg-transparent text-white text-sm outline-none font-extrabold"
                      placeholder="75.5"
                      required
                    />
                    <span className="text-[10px] text-slate-500 font-mono font-bold self-center">T</span>
                  </div>
                </div>
              </div>

              {/* Cargo selectors */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
                  Tipo de Carga Transportada
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['General', 'Refrigerada', 'Hazmat'] as const).map((tipo) => {
                    const active = truckProfile.tipoCarga === tipo;
                    return (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setTruckProfile({ ...truckProfile, tipoCarga: tipo })}
                        className={`py-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          active
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-400/10 scale-102'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] tracking-wide uppercase font-extrabold font-mono">{tipo}</span>
                        {active && <span className="text-[8px] bg-slate-950 text-amber-400 font-bold px-1 py-0.1 rounded leading-none">ACTIVO</span>}
                      </button>
                    );
                  })}
                </div>

                {truckProfile.tipoCarga === 'Hazmat' && (
                  <div className="mt-2.5 bg-red-950/80 border border-red-500/40 rounded-xl p-3 text-red-200 text-[10px] leading-relaxed flex items-start gap-2 animate-fadeIn">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold">Protocolo HAZMAT Activo</strong>
                      <span>Se sugerirán libramientos especiales obligatorios evadiendo túneles pavimentados y pasos regulados para carga tóxica e inflamable.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* NOM-012 Diagnostic panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-slate-300 font-bold mb-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold">Diagnóstico VíaPesada NOM-012</span>
                </div>
                <div className="space-y-1.5 text-slate-400 text-[10.5px]">
                  <div className="flex items-center justify-between">
                    <span>Gálibo Mínimo Requerido:</span>
                    <span className="font-mono text-white font-bold">{(parseFloat(truckProfile.alturaMaxima) + 0.15).toFixed(2)}m (margen de seg.)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Límite Peso Bruto Federal:</span>
                    <span className="font-mono text-white font-black">{truckProfile.configuracionSict.includes('Full') ? '75.5' : '43.5'} Toneladas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Restricción de Puentes:</span>
                    <span className="font-mono text-amber-400 font-bold">Evitar Puentes &lt; {truckProfile.alturaMaxima}m</span>
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 text-xs uppercase tracking-wide border border-indigo-400/20"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                Guardar Configuración
              </button>
            </form>
          </div>
        )}

      </main>

      {/* FIXED NATIVE BOTTOM NAVIGATION TAB BAR */}
      <nav id="mobile-navigation-fixed-bar" className="absolute bottom-0 left-0 right-0 bg-slate-900/98 border-t border-slate-800/80 py-3 pb-5 flex justify-around items-center text-slate-400 backdrop-blur-md z-40 shadow-2xl shrink-0">
        
        {/* TAB 1: MAPS */}
        <button
          id="tab-btn-map"
          onClick={() => setActiveTab('mapa')}
          className={`flex flex-col items-center gap-1 px-4 py-1 transition-all cursor-pointer ${
            activeTab === 'mapa'
              ? 'text-amber-400 transform scale-105 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[9px] font-bold font-mono tracking-wider">MAPA</span>
        </button>

        {/* TAB 2: COPILOTO IA */}
        <button
          id="tab-btn-voice"
          onClick={() => setActiveTab('copiloto')}
          className={`flex flex-col items-center gap-1 px-4 py-1 transition-all cursor-pointer ${
            activeTab === 'copiloto'
              ? 'text-amber-400 transform scale-105 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[9px] font-bold font-mono tracking-wider">COPILOTO IA</span>
        </button>

        {/* TAB 3: MI CAMIÓN */}
        <button
          id="tab-btn-truck"
          onClick={() => setActiveTab('camion')}
          className={`flex flex-col items-center gap-1 px-4 py-1 transition-all cursor-pointer ${
            activeTab === 'camion'
              ? 'text-amber-400 transform scale-105 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[9px] font-bold font-mono tracking-wider">MI CAMIÓN</span>
        </button>

      </nav>
    </div>
  );
}
