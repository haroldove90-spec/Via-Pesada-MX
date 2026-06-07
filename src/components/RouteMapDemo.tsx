import React, { useState } from 'react';
import { 
  Navigation, 
  ShieldAlert, 
  Scale, 
  Car, 
  MapPin, 
  Mic, 
  MicOff,
  Coins, 
  Truck, 
  Compass, 
  Clock, 
  Sparkles, 
  X,
  Volume2,
  VolumeX,
  Search
} from 'lucide-react';
import { TruckProfile } from './MyTruckForm';

interface AlertaPin {
  id: string;
  titulo: string;
  tipo: 'seguridad' | 'reten' | 'accidente';
  descripcion: string;
  tramo: string;
  top: string; 
  left: string;
  riesgo: 'Alto' | 'Medio' | 'Bajo';
}

interface RutaDestino {
  id: string;
  nombre: string;
  rutaFormato: string;
  casetas: string;
  eta: string;
  kmRestantes: string;
  posicionCamioTop: string;
  posicionCamioLeft: string;
  svgPath: string;
  alertas: AlertaPin[];
  soundMensaje: string;
}

const DESTINOS: RutaDestino[] = [
  {
    id: 'cdmx',
    nombre: 'CDMX',
    rutaFormato: 'N. Laredo ➔ CDMX',
    casetas: '$4,860 MXN',
    eta: '10h 45m',
    kmRestantes: '840 km',
    posicionCamioTop: '52%',
    posicionCamioLeft: '41%',
    svgPath: "M 120 80 L 190 200 L 260 250 L 320 380 L 450 490 L 520 540",
    soundMensaje: "Atención operador: Tramo Matehuala reporta asaltos nocturnos hace 11 min. Sugiero mantener convoy con otros dos transportistas.",
    alertas: [
      {
        id: 'pin-1',
        titulo: "Tramo Matehuala",
        tipo: "seguridad",
        descripcion: "Reporte de asaltos nocturnos procesado por Inteligencia Artificial.",
        tramo: "San Luis Potosí a Matehuala KM 142",
        top: "35%",
        left: "48%",
        riesgo: "Alto"
      },
      {
        id: 'pin-2',
        titulo: "Caseta Palmillas",
        tipo: "reten",
        descripcion: "Operativo activo de revisión de peso SCT (Secretaría de Comunicaciones y Transportes).",
        tramo: "México - Querétaro KM 136",
        top: "60%",
        left: "55%",
        riesgo: "Medio"
      },
      {
        id: 'pin-3',
        titulo: "Km 72 México-Puebla",
        tipo: "accidente",
        descripcion: "Volcadura de tractocamión doble remolque (full), tráfico parado en la zona.",
        tramo: "Paso por Río Frío dirección Puebla",
        top: "78%",
        left: "62%",
        riesgo: "Alto"
      }
    ]
  },
  {
    id: 'mty',
    nombre: 'Monterrey, NL',
    rutaFormato: 'N. Laredo ➔ Monterrey',
    casetas: '$1,250 MXN',
    eta: '3h 15m',
    kmRestantes: '220 km',
    posicionCamioTop: '35%',
    posicionCamioLeft: '28%',
    svgPath: "M 120 80 L 160 140 L 190 220 L 220 290",
    soundMensaje: "Operador, entramos a la ruta Monterrey-Saltillo. Alerta de Cuesta de Mamulique: neblina intensa en zona de curvas.",
    alertas: [
      {
        id: 'pin-mty-1',
        titulo: "La Gloria",
        tipo: "reten",
        descripcion: "Punto de revisión militar activo y aduana. Tránsito fluido.",
        tramo: "Autopista Mty-Laredo KM 26",
        top: "28%",
        left: "34%",
        riesgo: "Bajo"
      },
      {
        id: 'pin-mty-2',
        titulo: "Cuesta Mamulique",
        tipo: "accidente",
        descripcion: "Pavimento resbaladizo y neblina densa reportada en la parte alta de la cuesta.",
        tramo: "Autopista Mty-Laredo KM 65",
        top: "45%",
        left: "42%",
        riesgo: "Medio"
      },
      {
        id: 'pin-mty-3',
        titulo: "Entronque Salinas",
        tipo: "seguridad",
        descripcion: "Alerta por robos de mercancía en paraderos informales. Quédese en zona autorizada.",
        tramo: "Libramiento de Monterrey KM 12",
        top: "68%",
        left: "52%",
        riesgo: "Alto"
      }
    ]
  },
  {
    id: 'gdl',
    nombre: 'Guadalajara, Jal',
    rutaFormato: 'N. Laredo ➔ Guadalajara',
    casetas: '$3,920 MXN',
    eta: '8h 30m',
    kmRestantes: '710 km',
    posicionCamioTop: '57%',
    posicionCamioLeft: '21%',
    svgPath: "M 120 80 L 195 180 L 210 270 L 180 340 L 140 420 L 110 460",
    soundMensaje: "Iniciando ruta a Guadalajara. Guardia Nacional reporta operativo de báscula de pesaje y control NOM-012 en Macrolibramiento.",
    alertas: [
      {
        id: 'pin-gdl-1',
        titulo: "Macro GDL",
        tipo: "reten",
        descripcion: "Inspección de NOM-012 y control de bitácora de servicio por Guardia Nacional.",
        tramo: "KM 45 del Macrolibramiento GDL",
        top: "72%",
        left: "28%",
        riesgo: "Medio"
      },
      {
        id: 'pin-gdl-2',
        titulo: "Lagos de Moreno",
        tipo: "seguridad",
        descripcion: "Zona de atención prioritaria. Reportes de despojo de cargamentos con mercancía electrónica.",
        tramo: "Lagos de Moreno a Guadalajara KM 90",
        top: "50%",
        left: "30%",
        riesgo: "Alto"
      }
    ]
  },
  {
    id: 'ver',
    nombre: 'Veracruz, Ver',
    rutaFormato: 'N. Laredo ➔ Veracruz',
    casetas: '$5,640 MXN',
    eta: '12h 15m',
    kmRestantes: '1,140 km',
    posicionCamioTop: '64%',
    posicionCamioLeft: '68%',
    svgPath: "M 120 80 L 195 200 L 270 290 L 350 370 L 460 440 L 530 490 L 610 550",
    soundMensaje: "Estableciendo ruta hacia Veracruz. Cumbres de Maltrata reporta densa neblina y llovizna. Active el freno de motor.",
    alertas: [
      {
        id: 'pin-ver-1',
        titulo: "Cumbr. Maltrata",
        tipo: "accidente",
        descripcion: "Camión varado en la rampa de emergencia. Neblina sumamente cerrada.",
        tramo: "Autopista Orizaba-Puebla KM 230",
        top: "75%",
        left: "72%",
        riesgo: "Alto"
      },
      {
        id: 'pin-ver-2',
        titulo: "Caseta Paso Toro",
        tipo: "reten",
        descripcion: "Inspección rutinaria fitosanitaria de carga refrigerada. Flujo regular.",
        tramo: "Entronque Veracruz-Coatzacoalcos",
        top: "82%",
        left: "85%",
        riesgo: "Bajo"
      }
    ]
  }
];

interface RouteMapDemoProps {
  truckProfile?: TruckProfile;
}

export default function RouteMapDemo({ truckProfile }: RouteMapDemoProps) {
  const defaultProfile: TruckProfile = {
    configuracionSict: 'T3-S2-R4 (Full / Doble Remolque)',
    alturaMaxima: '4.25',
    pesoBruto: '75.5',
    tipoCarga: 'General'
  };

  const profileToUse = truckProfile || defaultProfile;

  const getSictAbbreviation = (sict: string) => {
    if (sict.includes('Full') || sict.includes('R4')) return 'Full';
    if (sict.includes('Sencillo')) return 'Sencillo';
    if (sict.includes('Tándem') || sict.includes('C3')) return 'Tándem';
    return 'Sencillo';
  };

  const pDisplay = `${getSictAbbreviation(profileToUse.configuracionSict)} ${profileToUse.pesoBruto}T`;

  const [activeRoute, setActiveRoute] = useState<RutaDestino>(DESTINOS[0]);
  const [selectedPin, setSelectedPin] = useState<AlertaPin | null>(DESTINOS[0].alertas[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [copilotoActivo, setCopilotoActivo] = useState(false);
  const [copilotoMensaje, setCopilotoMensaje] = useState<string | null>(DESTINOS[0].soundMensaje);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter destinations based on user input
  const filteredDestinos = DESTINOS.filter(d => 
    d.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectRoute = (route: RutaDestino) => {
    setActiveRoute(route);
    setSelectedPin(route.alertas[0] || null);
    setCopilotoMensaje(route.soundMensaje);
    setSearchQuery(route.nombre);
    setIsDropdownOpen(false);
  };

  const handleMicToggle = () => {
    setCopilotoActivo(!copilotoActivo);
    if (!copilotoActivo) {
      setCopilotoMensaje("Copiloto escuchando... '¿Cómo va el tráfico en " + activeRoute.nombre + "?'");
      setTimeout(() => {
        if (activeRoute.id === 'mty') {
          setCopilotoMensaje("Operador, Guardia Nacional reporta Mamulique con llovizna. Reduzca velocidad al bajar las curvas.");
        } else if (activeRoute.id === 'gdl') {
          setCopilotoMensaje("Báscula SCT operando en Macrolibramiento GDL. Peso máximo legal es de 75.5 toneladas.");
        } else if (activeRoute.id === 'ver') {
          setCopilotoMensaje("Cumbres de Maltrata con visibilidad restringida por neblina intermitente. Mantenga convoy con escoltas.");
        } else {
          setCopilotoMensaje("SCT operando báscula en Palmillas. Peso bruto máximo permitido: 75.5t para configuración de full T3-S2-R4.");
        }
      }, 2500);
    } else {
      setCopilotoMensaje(null);
    }
  };

  return (
    <div id="viapesada-route-map" className="relative flex-1 h-full min-h-[420px] w-full bg-slate-950 text-slate-100 rounded-2xl md:rounded-3xl overflow-hidden border border-slate-800/60 shadow-2xl flex flex-col font-sans">
      
      {/* 1. MAP BACKGROUND SIMULATION */}
      <div className="absolute inset-0 z-0 bg-[#0b0f19] overflow-hidden">
        {/* Dynamic Vector/Grid Map Lines */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, transparent 60%, rgba(2, 6, 23, 0.9) 100%),
            linear-gradient(rgba(51, 65, 85, 0.15) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(51, 65, 85, 0.15) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '100% 100%, 45px 45px, 45px 45px'
        }}></div>

        {/* Diagonal Highway/Route Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          {/* Main Truck Route line */}
          <path 
            d={activeRoute.svgPath} 
            fill="none" 
            stroke="#4f46e5" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Pulse Track Line */}
          <path 
            d={activeRoute.svgPath} 
            fill="none" 
            stroke="#6366f1" 
            strokeWidth="3" 
            strokeDasharray="12, 12" 
            strokeLinecap="round"
            className="animate-[dash_20s_linear_infinite]"
          />
          
          {/* Secondary Roads */}
          <path d="M 80 180 L 190 200 L 220 280" fill="none" stroke="#1e293b" strokeWidth="2" />
          <path d="M 320 380 L 280 430 L 210 450" fill="none" stroke="#1e293b" strokeWidth="2" />
          <path d="M 450 490 L 490 420" fill="none" stroke="#1e293b" strokeWidth="2" />
        </svg>

        {/* Current Truck Location Pin on Route */}
        <div className="absolute transition-all duration-1000" style={{ top: activeRoute.posicionCamioTop, left: activeRoute.posicionCamioLeft }}>
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-12 w-12 rounded-full bg-indigo-500 opacity-20 animate-ping"></span>
            <div className="h-8 w-8 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center shadow-lg shadow-indigo-500/50">
              <Truck className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Interactive Highway Alert Pins */}
        {activeRoute.alertas.map((alerta) => (
          <button
            key={alerta.id}
            onClick={() => setSelectedPin(alerta)}
            className="absolute transition-all hover:scale-115 active:scale-95 z-10"
            style={{ top: alerta.top, left: alerta.left }}
          >
            <div className="relative group flex flex-col items-center">
              {/* Outer Pulsing Aura based on Risk */}
              <span className={`absolute -inset-2 rounded-full opacity-40 animate-ping ${
                alerta.tipo === 'seguridad' ? 'bg-red-500' :
                alerta.tipo === 'reten' ? 'bg-blue-500' : 'bg-amber-500'
              }`}></span>
              
              {/* Pin design */}
              <div id={`map-pin-${alerta.id}`} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center shadow-xl ${
                selectedPin?.id === alerta.id ? 'scale-110 border-white ring-4 ring-indigo-500/30' : 'border-transparent'
              } ${
                alerta.tipo === 'seguridad' ? 'bg-red-600 text-white' :
                alerta.tipo === 'reten' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                {alerta.tipo === 'seguridad' && <ShieldAlert className="w-4.5 h-4.5" />}
                {alerta.tipo === 'reten' && <Scale className="w-4.5 h-4.5" />}
                {alerta.tipo === 'accidente' && <Car className="w-4.5 h-4.5" />}
              </div>

              {/* Highway ID floating badge */}
              <div className="mt-1 bg-slate-900/90 text-white border border-slate-700/50 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md backdrop-blur-xs font-mono">
                {alerta.titulo}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 1.5. FLOATING SEARCH BAR CONTAINER (GOOGLE MAPS FEEL) */}
      <div className="absolute top-3 inset-x-3 z-30">
        <div className="relative">
          <div className="flex items-center bg-slate-900/95 backdrop-blur-md border border-slate-800/80 rounded-xl px-3 py-2 shadow-lg ring-1 ring-slate-800/30">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Buscar destino..."
              className="w-full bg-transparent text-white text-xs placeholder-slate-500 font-sans outline-none font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setActiveRoute(DESTINOS[0]);
                  setSelectedPin(DESTINOS[0].alertas[0]);
                  setCopilotoMensaje(DESTINOS[0].soundMensaje);
                }} 
                className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autoe-Suggestions Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-11 inset-x-0 bg-slate-900/98 backdrop-blur-md border border-slate-800/90 rounded-xl shadow-2xl p-1.5 z-40 max-h-48 overflow-y-auto animate-fadeIn">
              <div className="text-[9px] text-slate-500 font-extrabold px-2 py-1 uppercase tracking-wider font-mono">Destinos Camioneros Clave</div>
              {filteredDestinos.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => handleSelectRoute(dest)}
                  className="w-full flex items-center gap-2.5 px-2 py-2 hover:bg-indigo-600/30 rounded-lg text-left transition-colors text-xs text-slate-200 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="font-extrabold text-white block">{dest.nombre}</span>
                    <span className="text-[9px] text-slate-400 font-mono">Ruta Segura • {dest.kmRestantes}</span>
                  </div>
                </button>
              ))}
              {filteredDestinos.length === 0 && (
                <div className="text-slate-500 text-[10px] py-3 text-center">No se encontraron rutas seguras</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. TOP FLOATING TRIP HEADER */}
      <div className="absolute top-[58px] inset-x-3 z-10">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-xl flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 font-mono">SEGURIDAD NOM-012</span>
                <span className="text-[8px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-1.5 py-0.2 rounded">T. ET</span>
              </div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5 animate-fadeIn">
                {activeRoute.rutaFormato}
              </h2>
              {/* Dynamic Active Trailer Profile Banner */}
              <div className="text-[8px] text-amber-400 font-mono font-bold mt-1 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800/60 leading-normal animate-slideDown">
                Perfil Activo: {pDisplay} - Evitando puentes &lt; {profileToUse.alturaMaxima}m
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Toll cost CAPUFE */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <strong className="text-[10px] font-mono text-white">{activeRoute.casetas}</strong>
              </div>
            </div>

            {/* Quick sound toggle */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
              title={isMuted ? 'Desactivar silencio' : 'Silenciar alertas'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. ALERTS DRAWER & SELECTED PIN PREVIEW */}
      {selectedPin && (
        <div className="absolute left-3 right-3 bottom-20 z-10 animate-slideUp">
          <div className="bg-slate-900/98 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-xl text-slate-300 relative">
            <button 
              onClick={() => setSelectedPin(null)}
              className="absolute top-3 right-3 text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                selectedPin.tipo === 'seguridad' ? 'bg-red-500/25 text-red-300 border border-red-500/30' :
                selectedPin.tipo === 'reten' ? 'bg-blue-500/25 text-blue-300 border border-blue-500/30' : 
                'bg-amber-500/25 text-amber-300 border border-amber-500/30'
              }`}>
                {selectedPin.tipo === 'seguridad' ? '🚨 Seguridad' : selectedPin.tipo === 'reten' ? '👮 Báscula' : '⚠️ Incidente'} • {selectedPin.riesgo}
              </span>
              <span className="text-[9px] text-slate-400 font-mono font-semibold truncate max-w-[140px]">{selectedPin.tramo}</span>
            </div>

            <h4 className="font-extrabold text-white text-sm sm:text-base">{selectedPin.titulo}</h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-2.5 border border-slate-800/60 rounded-xl">
              {selectedPin.descripcion}
            </p>

            <div className="mt-2.5 flex items-center justify-between text-[9px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Validado por Monitor VíaPesada
              </span>
              <span className="text-emerald-400 font-bold shrink-0">En Tiempo Real</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. COPILOTO VOICE AI HUD MESSAGE (FLOATING UPPER RIGHT) */}
      {copilotoMensaje && (
        <div className="absolute right-3 top-[118px] max-w-[240px] xs:max-w-[280px] z-10 animate-fadeIn">
          <div className="bg-gradient-to-tr from-slate-950 to-indigo-950/98 backdrop-blur-md border border-indigo-500/40 rounded-xl p-3 shadow-xl">
            <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-indigo-500/10">
              <span className="text-[9px] font-bold text-indigo-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
                Copiloto de Voz Gemini
              </span>
              <button onClick={() => setCopilotoMensaje(null)} className="text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-indigo-50 leading-relaxed font-sans italic">
              &ldquo;{copilotoMensaje}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* COPILOTO AI FLOATING MIC BUTTON (HIGH RIGHT SIDE TO AVOID OVERLAPS) */}
      <button 
        id="copiloto-ai-floating-btn"
        onClick={handleMicToggle}
        className={`absolute right-3 ${copilotoMensaje ? 'top-[222px]' : 'top-[118px]'} z-20 p-3 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 group ${
          copilotoActivo 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse text-white shadow-red-500/30' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 ring-4 ring-indigo-500/10'
        }`}
        title="Interactuar con el copiloto"
      >
        <div className="flex items-center gap-1.5">
          {copilotoActivo ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 animate-pulse" />}
          <span className="text-[9px] font-bold font-mono tracking-wider max-w-0 overflow-hidden group-hover:max-w-24 transition-all duration-300 whitespace-nowrap">
            {copilotoActivo ? "MUTE" : "HABLAR"}
          </span>
        </div>
      </button>

      {/* 5. BOTTOM TRIP SUMMARY FOOTER */}
      <div className="mt-auto bg-slate-900 border-t border-slate-800 p-3 sm:p-4 z-10 pointer-events-auto">
        <div className="flex flex-row items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[8px] text-slate-500 uppercase font-bold font-mono">ETA</span>
              <strong className="text-[11px] font-mono text-white">{activeRoute.eta}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[8px] text-slate-500 uppercase font-bold font-mono">KM REST.</span>
              <strong className="text-[11px] font-mono text-white">{activeRoute.kmRestantes}</strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-900/60 px-2.5 py-1.5 rounded-lg text-[9px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span>NOM-012</span>
          </div>

        </div>
      </div>

    </div>
  );
}
