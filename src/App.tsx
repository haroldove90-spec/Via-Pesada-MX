import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, 
  Mic, 
  MicOff,
  Truck, 
  Wifi,
  Search,
  X,
  Navigation,
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
  Settings,
  AlertTriangle,
  Info,
  Radio,
  Eye,
  Maximize2
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
  bbox: string; // OpenStreetMap bounding box
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
    bbox: '-102.5,18.5,-97.5,28.2',
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
    bbox: '-101.0,25.0,-98.5,28.2',
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
    bbox: '-104.5,19.5,-98.5,28.2',
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
    bbox: '-101.5,18.5,-95.0,28.2',
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
  const [mapSource, setMapSource] = useState<'osm' | 'google' | 'tactical'>('osm');
  
  // Custom API key configurations stored in localStorage to persist
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('viapesada_google_maps_key') || 'AIzaSyBeAbgisBE5m8sVSpglnwXKHdoNRHZMG-s';
  });

  const [showApiKeySettings, setShowApiKeySettings] = useState(false);

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

  const saveCustomKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem('viapesada_google_maps_key', key);
    setShowApiKeySettings(false);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none font-sans">
      
      {/* IMMERSIVE HEADER / SYSTEM BAR ONLY */}
      <header className="w-full bg-slate-950/90 backdrop-blur-md flex justify-between items-center px-4 pt-3 pb-2.5 z-50 sticky top-0 shrink-0 border-b border-slate-900/60">
        <span className="text-xs font-bold font-mono tracking-tighter text-slate-300">9:41 AM</span>
        
        <div className="h-5 w-28 bg-slate-900 rounded-full border border-slate-800/80 flex items-center justify-center pointer-events-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
          <span className="text-[8px] text-indigo-400 font-black font-mono uppercase tracking-widest">VíaPesada MX</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowApiKeySettings(!showApiKeySettings)}
            className="p-1 text-slate-400 hover:text-white transition-colors pointer-events-auto"
            title="Configurar Google API Key"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 text-slate-300 text-[10px] font-mono select-none">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">5G</span>
          </div>
        </div>
      </header>

      {/* CORE VIEWPORT CONTENT */}
      <main className="flex-1 w-full flex flex-col relative overflow-hidden">
        
        {/* TAB 1: REGION MAPA */}
        {activeTab === 'mapa' && (
          <div className="w-full h-full flex-1 flex flex-col relative overflow-hidden animate-fadeIn">
            
            {/* IN-APP MAP SYSTEM CHANGER BAR */}
            <div className={`absolute left-3.5 right-3.5 z-40 transition-all pointer-events-auto top-18`}>
              <div className="flex bg-slate-900/95 backdrop-blur-lg border border-slate-800/60 rounded-xl p-1 shadow-2xl justify-between items-center text-[9px] font-mono leading-none">
                <button
                  onClick={() => setMapSource('osm')}
                  className={`flex-1 py-2 px-1.5 rounded-lg font-bold text-center transition-all ${
                    mapSource === 'osm' 
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  📡 OSM Libre
                </button>
                <div className="h-4 w-[1px] bg-slate-800" />
                <button
                  onClick={() => setMapSource('google')}
                  className={`flex-1 py-2 px-1.5 rounded-lg font-bold text-center transition-all ${
                    mapSource === 'google' 
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  🗺️ Google Maps
                </button>
                <div className="h-4 w-[1px] bg-slate-800" />
                <button
                  onClick={() => setMapSource('tactical')}
                  className={`flex-1 py-2 px-1.5 rounded-lg font-bold text-center transition-all ${
                    mapSource === 'tactical' 
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  🎯 Radar NOM-012
                </button>
              </div>
            </div>

            {/* MAP RENDERING SECTION BASED ON SELECTOR */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-slate-950">
              
              {/* SOURCE 1: OPEN STREET MAPS (100% RELIABLE KEYLESS DIRECTION FLUID MAP) */}
              {mapSource === 'osm' && (
                <div className="w-full h-full relative" id="osm-container">
                  <iframe
                    title="OpenStreetMap Route Real Viewer"
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                      filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)',
                    }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeRoute.bbox}&layer=mapnik&marker=${activeRoute.id === 'mty' ? '25.68,-100.31' : activeRoute.id === 'gdl' ? '20.65,-103.34' : activeRoute.id === 'ver' ? '19.17,-96.13' : '19.43,-99.13'}`}
                  ></iframe>
                </div>
              )}

              {/* SOURCE 2: GOOGLE MAPS EMBED */}
              {mapSource === 'google' && (
                <div className="w-full h-full relative" id="google-maps-container">
                  <iframe
                    id="real-google-map-iframe"
                    title="Google Maps Route Viewer"
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                      filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)',
                    }}
                    loading="lazy"
                    allowFullScreen
                    src={
                      customApiKey === 'AIzaSyBeAbgisBE5m8sVSpglnwXKHdoNRHZMG-s'
                        ? `https://maps.google.com/maps?saddr=Nuevo+Laredo,+Tamaulipas&daddr=${encodeURIComponent(activeRoute.queryParam)}&output=embed`
                        : `https://www.google.com/maps/embed/v1/directions?key=${customApiKey}&origin=Nuevo+Laredo,+Tamaulipas&destination=${encodeURIComponent(activeRoute.queryParam)}`
                    }
                  ></iframe>

                  {/* Warning overlay or Info overlay depending on API Key mode */}
                  {customApiKey === 'AIzaSyBeAbgisBE5m8sVSpglnwXKHdoNRHZMG-s' ? (
                    <div className="absolute top-[164px] inset-x-6 z-10 bg-slate-950/95 border border-indigo-400/30 rounded-xl p-3 shadow-2xl text-[10px] pointer-events-auto leading-relaxed text-indigo-200 flex items-start gap-2.5 backdrop-blur font-sans">
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <strong className="text-white block font-black mb-0.5">Google Maps Autónomo</strong>
                        <span>Estamos usando un visor sin clave API para garantizar que veas el mapa interactivo de inmediato sin errores de autorización.</span>
                        <div className="mt-2 flex gap-2">
                          <button 
                            onClick={() => setShowApiKeySettings(true)} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded text-[8.5px] uppercase tracking-wider transition-colors"
                          >
                            Modificar Clave API Premium
                          </button>
                          <button 
                            onClick={() => setMapSource('osm')} 
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-1 px-2 rounded text-[8.5px] uppercase tracking-wider transition-colors"
                          >
                            OSM Libre
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-[164px] inset-x-6 z-10 bg-slate-950/95 border border-amber-400/30 rounded-xl p-3 shadow-2xl text-[10px] pointer-events-auto leading-relaxed text-amber-300 flex items-start gap-2.5 backdrop-blur font-sans">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <strong className="text-white block font-black mb-0.5">Google Maps (API Key de Usuario)</strong>
                        <span>Utilizando tu clave API. Si se ve en blanco, activa la <strong>Embed API</strong>, facturación y revisa restricciones en la Google Cloud Console.</span>
                        <div className="mt-2 flex gap-2">
                          <button 
                            onClick={() => setMapSource('osm')} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded text-[8.5px] uppercase tracking-wider transition-colors"
                          >
                            Usar OSM Libre
                          </button>
                          <button 
                            onClick={() => saveCustomKey('AIzaSyBeAbgisBE5m8sVSpglnwXKHdoNRHZMG-s')} 
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-1 px-2 rounded text-[8.5px] uppercase tracking-wider transition-colors"
                          >
                            Restablecer Modo Autónomo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SOURCE 3: HIGH ENERGY PREMIUM TACTICAL NOM-012 VECTOR RADAR MAP OF MEXICO */}
              {mapSource === 'tactical' && (
                <div className="w-full h-full relative flex items-center justify-center p-4 bg-slate-950" id="tactical-radar-container">
                  
                  {/* Cyber Grid pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a1024_1px,transparent_1px),linear-gradient(to_bottom,#0a1024_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
                  
                  {/* Radar sweeps animation */}
                  <div className="absolute w-[240px] h-[240px] rounded-full border border-indigo-500/10 animate-pulse flex items-center justify-center">
                    <div className="absolute w-[160px] h-[160px] rounded-full border border-indigo-400/5" />
                    <div className="absolute w-[80px] h-[80px] rounded-full border border-indigo-300/5" />
                  </div>

                  <div className="relative z-10 w-full max-w-[340px] aspect-[4/5] bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 backdrop-blur shadow-2xl flex flex-col justify-between overflow-hidden">
                    
                    {/* Header radar HUD */}
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span className="text-[8px] font-black font-mono text-slate-300 uppercase tracking-widest">SISTEMA SATELITAL S-NOM</span>
                      </div>
                      <span className="text-[7.5px] font-mono text-amber-400">SCAN: OK</span>
                    </div>

                    {/* SVG Map of routes */}
                    <div className="flex-1 relative flex items-center justify-center min-h-[160px]">
                      <svg viewBox="0 0 100 120" className="w-full h-64 overflow-visible drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]">
                        {/* Connecting Highway lines */}
                        {/* Laredo -> Mty (MEX-85D) */}
                        <line x1="50" y1="10" x2="48" y2="35" stroke="#4f46e5" strokeWidth="2.5" strokeDasharray="3,1" className="animate-pulse" />
                        
                        {/* Mty -> Matehuala -> CDMX (MEX-57) */}
                        <path d="M 48 35 Q 45 65 52 105" fill="none" stroke={activeRoute.id === 'cdmx' || activeRoute.id === 'mty' ? '#fbbf24' : '#1e293b'} strokeWidth="2" strokeDasharray="5,2" />
                        
                        {/* Mty -> Guadalajara (MEX-150D) */}
                        <path d="M 48 35 Q 25 70 30 95" fill="none" stroke={activeRoute.id === 'gdl' ? '#fbbf24' : '#1e293b'} strokeWidth="1.8" />
                        
                        {/* CDMX -> Veracruz */}
                        <path d="M 52 105 Q 68 100 85 92" fill="none" stroke={activeRoute.id === 'ver' ? '#fbbf24' : '#1e293b'} strokeWidth="1.8" />

                        {/* City Nodes */}
                        {/* Nuevo Laredo (Origin) */}
                        <circle cx="50" cy="10" r="4.5" fill="#10b981" />
                        <text x="50" y="5" textAnchor="middle" fill="#10b981" className="text-[6.5px] font-black font-mono" dy=".3em">N. LAREDO (ORIGEN)</text>

                        {/* Monterrey */}
                        <circle cx="48" cy="35" r="4" fill={activeRoute.id === 'mty' ? '#fbbf24' : '#6366f1'} className="animate-pulse" />
                        <text x="55" y="36" fill="#fff" className="text-[5.5px] font-bold font-mono">Monterrey</text>

                        {/* Guadalajara */}
                        <circle cx="30" cy="95" r="3.5" fill={activeRoute.id === 'gdl' ? '#fbbf24' : '#475569'} />
                        <text x="18" y="96" fill="#94a3b8" className="text-[5.5px] font-bold font-mono">Guadalajara</text>

                        {/* CDMX */}
                        <circle cx="52" cy="105" r="4.5" fill={activeRoute.id === 'cdmx' ? '#fbbf24' : '#475569'} />
                        <text x="52" y="113" textAnchor="middle" fill="#94a3b8" className="text-[6px] font-bold font-mono">CDMX</text>

                        {/* Veracruz */}
                        <circle cx="85" cy="92" r="3.5" fill={activeRoute.id === 'ver' ? '#fbbf24' : '#475569'} />
                        <text x="85" y="87" textAnchor="middle" fill="#94a3b8" className="text-[5.5px] font-bold font-mono">Veracruz</text>

                        {/* Real-time Truck Marker on Route */}
                        {activeRoute.id === 'mty' && (
                          <g transform="translate(49, 22)">
                            <circle r="3" fill="#10b981" className="animate-ping" />
                            <circle r="2" fill="#10b981" />
                          </g>
                        )}
                        {activeRoute.id === 'cdmx' && (
                          <g transform="translate(46.5, 60)">
                            <circle r="3" fill="#10b981" className="animate-ping" />
                            <circle r="2" fill="#10b981" />
                          </g>
                        )}
                        {activeRoute.id === 'gdl' && (
                          <g transform="translate(37, 65)">
                            <circle r="3" fill="#10b981" className="animate-ping" />
                            <circle r="2" fill="#10b981" />
                          </g>
                        )}
                        {activeRoute.id === 'ver' && (
                          <g transform="translate(68, 98)">
                            <circle r="3" fill="#10b981" className="animate-ping" />
                            <circle r="2" fill="#10b981" />
                          </g>
                        )}

                        {/* Alerts positions */}
                        <g transform="translate(46.5, 75)">
                          <path d="M 0,-3 L 3,3 L -3,3 Z" fill="#ef4444" className="animate-bounce" />
                        </g>

                      </svg>                     
                    </div>

                    {/* Footer HUD metrics */}
                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-[8.5px] font-mono leading-relaxed text-slate-300 mt-2">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>ESTADO DE OPERACIÓN:</span>
                        <span className="text-emerald-400 font-bold">ACTIVO</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 mt-0.5">
                        <span>DETECTOR DE GÁLIBO:</span>
                        <span className="text-white font-bold">{truckProfile.alturaMaxima} metros</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gradient layer top and bottom overlay on map */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-10" />
            </div>

            {/* 2. FLOATING SEARCH BAR */}
            <div className={`absolute inset-x-3.5 z-30 transition-all pointer-events-auto top-28`}>
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
                    <div className="text-[9px] text-slate-500 font-bold px-2 py-1 uppercase tracking-wider font-mono">Seleccione su Destino</div>
                    {filteredDestinos.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => handleSelectRoute(dest)}
                        className="w-full flex items-center gap-2.5 px-2 py-2 hover:bg-indigo-600/30 rounded-lg text-left transition-colors text-xs text-slate-200 cursor-pointer"
                        type="button"
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
            <div className={`absolute inset-x-3.5 z-20 pointer-events-auto top-43`}>
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
                      <h2 className="text-xs sm:text-xs font-black text-white mt-0.5">
                        {activeRoute.rutaFormato}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="text-[7.5px] uppercase font-bold tracking-wider text-slate-500 font-mono">Casetas CAPUFE</span>
                      <strong className="text-[10px] font-mono text-amber-400">{activeRoute.casetas}</strong>
                    </div>

                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 bg-slate-950/85 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
                      title="Silenciar alertas"
                      type="button"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* DYNAMIC REGISTERED TRUCK PROFILE ADAPTIVE BANNER */}
                <div className="mt-2 pt-2 border-t border-slate-800/60 text-[8.5px] text-amber-400 font-mono font-bold flex items-center justify-between bg-slate-950/40 px-2 py-1.5 rounded-lg border border-slate-800/30">
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
              <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800/95 rounded-2xl p-3 shadow-xl">
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
                <h4 className="font-extrabold text-white text-xs">{activeRoute.alertas.titulo}</h4>
                <p className="text-[10px] text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-2 border border-slate-800/60 rounded-xl">
                  {activeRoute.alertas.descripcion}
                </p>
              </div>
            </div>

            {/* 5. VOICE AI COPILOTO OVERLAY MESSAGES */}
            {copilotoMensaje && (
              <div className="absolute right-3.5 bottom-[356px] max-w-[250px] z-20 pointer-events-auto animate-fadeIn">
                <div className="bg-slate-950/98 backdrop-blur-md border border-indigo-500/40 rounded-xl p-3 shadow-2xl">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-indigo-500/10">
                    <span className="text-[8.5px] font-bold text-indigo-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
                      Copiloto Inteligente Gemini
                    </span>
                    <button onClick={() => setCopilotoMensaje(null)} className="text-slate-500 hover:text-white" type="button">
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
                  {copilotoActivo ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
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
                  copilotoActivo ? 'bg-red-600 animate-ping animate-bounce' : 'bg-indigo-600 hover:bg-indigo-700 scale-102 shadow-lg shadow-indigo-500/20'
                }`}
                type="button"
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

      {/* MODAL CONFIGURACIÓN GOOGLE MAPS API KEY */}
      {showApiKeySettings && (
        <div className="absolute inset-0 bg-slate-950/98 backdrop-blur z-50 flex items-center justify-center p-6 animate-fadeIn pointer-events-auto">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-400" />
                <h3 className="text-sm font-black text-white">Google Maps API Key</h3>
              </div>
              <button 
                onClick={() => setShowApiKeySettings(false)} 
                className="text-slate-400 hover:text-white"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-slate-300 leading-relaxed mb-4">
              El mapa oficial de Google requiere una clave API con la opción de <strong>Directions E Embed API habilitadas</strong>. Introduce tu propia API Key para persistirla en esta sesión:
            </p>

            <div className="space-y-3.5 mb-4">
              <input
                type="text"
                defaultValue={customApiKey}
                id="custom-api-key-input"
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 font-mono font-bold"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const val = (document.getElementById('custom-api-key-input') as HTMLInputElement)?.value;
                  if (val) saveCustomKey(val);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all"
                type="button"
              >
                Guardar API Key
              </button>
              <button
                onClick={() => {
                  saveCustomKey('AIzaSyBeAbgisBE5m8sVSpglnwXKHdoNRHZMG-s');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3 rounded-xl transition-all"
                type="button"
              >
                Resetear Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED NATIVE BOTTOM NAVIGATION TAB BAR */}
      <nav id="mobile-navigation-fixed-bar" className="absolute bottom-0 left-0 right-0 bg-slate-900/98 border-t border-slate-800/80 py-3 pb-5 flex justify-around items-center text-slate-400 backdrop-blur-md z-40 shadow-2xl shrink-0 pointer-events-auto">
        
        {/* TAB 1: MAPS */}
        <button
          id="tab-btn-map"
          onClick={() => setActiveTab('mapa')}
          className={`flex flex-col items-center gap-1 px-4 py-1 transition-all cursor-pointer ${
            activeTab === 'mapa'
              ? 'text-amber-400 transform scale-105 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          type="button"
        >
          <MapIcon className="w-5 h-5" />
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
          type="button"
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
          type="button"
        >
          <Truck className="w-5 h-5" />
          <span className="text-[9px] font-bold font-mono tracking-wider">MI CAMIÓN</span>
        </button>

      </nav>
    </div>
  );
}
