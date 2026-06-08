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
  Maximize2,
  Minimize2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

// Type definitions
export interface TruckProfile {
  configuracionSict: string;
  alturaMaxima: string;
  pesoBruto: string;
  tipoCarga: 'General' | 'Refrigerada' | 'Hazmat';
}

interface CheckpointRuta {
  km: number;
  instruccion: string;
  alertaNom: string | null;
  tipo: 'normal' | 'alerta' | 'peaje' | 'bascula';
}

interface RutaDestino {
  id: string;
  nombre: string;
  queryParam: string;
  rutaFormato: string;
  casetas: string;
  eta: string;
  kmRestantes: number; // raw value for math simulation
  soundMensaje: string;
  alertas: {
    titulo: string;
    tipo: 'seguridad' | 'reten' | 'accidente';
    descripcion: string;
    tramo: string;
    riesgo: 'Alto' | 'Medio' | 'Bajo';
  };
  checkpoints: CheckpointRuta[];
}

const DESTINOS: RutaDestino[] = [
  {
    id: 'cdmx',
    nombre: 'CDMX (Tlalnepantla ➔ Ciudad de México)',
    queryParam: 'Ciudad de Mexico',
    rutaFormato: 'N. Laredo ➔ CDMX',
    casetas: '$4,860 MXN',
    eta: '10h 45m',
    kmRestantes: 840,
    soundMensaje: "Operador, la ruta seleccionada hacia la capital del país cuenta con restricciones de peso bajo la NOM-012 en el tramo de entrada. Sugiero transitar acoplado en convoy por la autopista Querétaro.",
    alertas: {
      titulo: "Alerta Matehuala • KM 142",
      tipo: "seguridad",
      descripcion: "Reportes de asaltos activos de madrugada. Guardia Nacional con presencia intermitente. Se aconseja viajar en convoy pesado.",
      tramo: "San Luis Potosí a Matehuala DF-57",
      riesgo: "Alto"
    },
    checkpoints: [
      { km: 0, instruccion: "Salida del CEDIS de origen. Dimensiones y peso validados de acuerdo con NOM-012.", alertaNom: null, tipo: 'normal' },
      { km: 120, instruccion: "Paso de Libramiento de Monterrey. Tránsito fluido, monitorear gálibo del puente intermedio de 4.50m.", alertaNom: "Gálibo seguro para 4.25m", tipo: 'normal' },
      { km: 340, instruccion: "Aproximándose a Matehuala KM 142. Alerta de asalto activa. Redoble comunicación con torre.", alertaNom: "Peligro de Seguridad", tipo: 'alerta' },
      { km: 590, instruccion: "Aproximándose a San Luis Potosí. Casetas federales operando sin novedades.", alertaNom: null, tipo: 'peaje' },
      { km: 840, instruccion: "Arribo a caseta de entrada a CDMX. Restricción de doble remolque nocturno activa.", alertaNom: "NOM-012: Restricción CDMX", tipo: 'bascula' }
    ]
  },
  {
    id: 'mty',
    nombre: 'Monterrey, NL (Tlalnepantla ➔ Monterrey)',
    queryParam: 'Monterrey, Nuevo Leon',
    rutaFormato: 'N. Laredo ➔ Monterrey',
    casetas: '$1,250 MXN',
    eta: '3h 15m',
    kmRestantes: 220,
    soundMensaje: "Operador, iniciamos ruta a Monterrey. Alerta en Cuesta de Mamulique: pavimento húmedo y visibilidad reducida. Mantonenga freno de motor activo.",
    alertas: {
      titulo: "Neblina en Saltillo - Monterrey",
      tipo: "accidente",
      descripcion: "Pavimento mojado por llovizna y visibilidad reducida a menos de 10 metros en zonas altas de la Cuesta de Mamulique.",
      tramo: "Autopista Mty-Laredo KM 65",
      riesgo: "Medio"
    },
    checkpoints: [
      { km: 0, instruccion: "Inicio de viaje. GPS activo en ruta a Monterrey.", alertaNom: null, tipo: 'normal' },
      { km: 65, instruccion: "Cuesta de Mamulique. Neblina intensa y llovizna reduciendo visibilidad. Disminuya velocidad.", alertaNom: "Freno de Motor Sugerido", tipo: 'alerta' },
      { km: 155, instruccion: "Caseta Sabinas Hidalgo. Costo $280 pesos para camiones T3-S2-R4.", alertaNom: "Peaje Clasificado", tipo: 'peaje' },
      { km: 220, instruccion: "Llegada a CEDIS Escobedo. Báscula privada aprobada.", alertaNom: "Ingreso Exitoso", tipo: 'bascula' }
    ]
  },
  {
    id: 'gdl',
    nombre: 'Guadalajara, Jal (Tlalnepantla ➔ Guadalajara)',
    queryParam: 'Guadalajara, Jalisco',
    rutaFormato: 'N. Laredo ➔ Guadalajara',
    casetas: '$3,920 MXN',
    eta: '8h 30m',
    kmRestantes: 710,
    soundMensaje: "Atención operador: Se reporta operativo militar y báscula SCT activa en KM 45 del Macrolibramiento de Guadalajara. Su perfil se encuentra en verde.",
    alertas: {
      titulo: "Operativo Báscula SCT GDL",
      tipo: "reten",
      descripcion: "Revisión rigurosa de peso bruto autorizado y NOM-012 en el ingreso al Macrolibramiento de Guadalajara.",
      tramo: "KM 45 del Macrolibramiento GDL",
      riesgo: "Medio"
    },
    checkpoints: [
      { km: 0, instruccion: "Empieza viaje a la Perla Tapatía. Configuración SICT registrada correctamente.", alertaNom: null, tipo: 'normal' },
      { km: 320, instruccion: "Límites de San Luis Potosí y Zacatecas. Tránsito fluido.", alertaNom: null, tipo: 'normal' },
      { km: 540, instruccion: "Lagos de Moreno. Incorporación con asfalto irregular.", alertaNom: "Baches carril derecho", tipo: 'alerta' },
      { km: 670, instruccion: "Ingreso al Macrolibramiento GDL. Operativo activo de báscula federal sintonizado en canal del operador.", alertaNom: "Báscula NOM-012 Activa", tipo: 'bascula' },
      { km: 710, instruccion: "Llegada a las bodegas de Guadalajara Oriente.", alertaNom: null, tipo: 'normal' }
    ]
  },
  {
    id: 'ver',
    nombre: 'Veracruz (Tlalnepantla ➔ Veracruz Puerto)',
    queryParam: 'Veracruz, Veracruz',
    rutaFormato: 'N. Laredo ➔ Veracruz',
    casetas: '$5,640 MXN',
    eta: '12h 15m',
    kmRestantes: 1140,
    soundMensaje: "Operador, la ruta seleccionada hacia Veracruz cuenta con gálibos seguros. Sin embargo, Cumbres de Maltrata reporta densa neblina. Modere velocidad.",
    alertas: {
      titulo: "Cumbres de Maltrata Cerrada",
      tipo: "accidente",
      descripcion: "Niebla extremadamente cerrada en el descenso de las cumbres. Operadores activando freno de motor de forma preventiva.",
      tramo: "Autopista Orizaba-Puebla KM 230",
      riesgo: "Alto"
    },
    checkpoints: [
      { km: 0, instruccion: "Salida del terminal portuario con contenedor de importación.", alertaNom: null, tipo: 'normal' },
      { km: 450, instruccion: "Libramiento de Tampico. Vientos racheados laterales. Mantenga volante firme.", alertaNom: "Vientos cruzados", tipo: 'alerta' },
      { km: 780, instruccion: "Tuxpan Caseta. Avance rápido sin demoras.", alertaNom: "Peaje OK", tipo: 'peaje' },
      { km: 990, instruccion: "Cumbres de Maltrata. Neblina densa y llovizna. Active freno de motor auxiliar.", alertaNom: "Accidente - Paro Preventivo", tipo: 'alerta' },
      { km: 1140, instruccion: "Llegada al recinto portuario de Veracruz.", alertaNom: null, tipo: 'bascula' }
    ]
  }
];

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'mapa' | 'copiloto' | 'camion'>('mapa');
  
  // Google API Key configurations stored in localStorage to persist
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('viapesada_google_maps_key') || 'AIzaSyBeAbgisBE5m8sVSpglnwXKHdoNRHZMG-s';
  });

  const [showApiKeySettings, setShowApiKeySettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // SICT Truck Profile Configuration
  const [truckProfile, setTruckProfile] = useState<TruckProfile>({
    configuracionSict: 'T3-S2-R4 (Full / Doble Remolque)',
    alturaMaxima: '4.25',
    pesoBruto: '75.5',
    tipoCarga: 'General'
  });

  // Active Route settings
  const [activeRoute, setActiveRoute] = useState<RutaDestino>(DESTINOS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Custom interactive features
  const [isEnRuta, setIsEnRuta] = useState(false);
  const [showRadarOverlays, setShowRadarOverlays] = useState(true); // NOM-012 risk radar layer active by default
  const [copilotoMensaje, setCopilotoMensaje] = useState<string | null>(null);
  
  // Live driving simulation state
  const [simulatedKmRestantes, setSimulatedKmRestantes] = useState(840);
  const [simulatedSpeed, setSimulatedSpeed] = useState(0);
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState(0);
  const [useVoiceSynthesis, setUseVoiceSynthesis] = useState(true);

  // GPS / Geolocation variables
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({ lat: 19.5430, lng: -99.1960 }); // default Tlalnepantla
  const [locationStatus, setLocationStatus] = useState<'detected' | 'failed'>('detected');
  const [navigationMode, setNavigationMode] = useState<'real' | 'simulated' | null>(null);
  const [showStartJourneyModal, setShowStartJourneyModal] = useState(false);
  const [hideOverlays, setHideOverlays] = useState(false);

  const sictOptions = [
    "T3-S2 (Sencillo)",
    "T3-S2-R4 (Full / Doble Remolque)",
    "C3 (Tándem)",
    "T3-S3 (Sencillo Reforzado)",
    "T3-S2-S2 (Doble Semirremolque R. Sencillo)"
  ];

  // Voice synthesis speaker
  const speakText = (text: string) => {
    if (useVoiceSynthesis && 'speechSynthesis' in window && !isMuted) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 0.95; // perfect speed for delivery operators in vehicles
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
      }
    }
  };

  // Attempt real GPS fetch on start
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus('detected');
        },
        (error) => {
          console.warn("Using default coordinates (Tlalnepantla, Mex):", error);
          setUserLocation({ lat: 19.5430, lng: -99.1960 });
          setLocationStatus('failed');
        }
      );
    }
  }, []);

  // Real-time high accuracy GPS tracker during active Route Monitored Mode
  useEffect(() => {
    let watchId: number | null = null;
    // Always fetch location initially to center the map when route changes or en-route starts
    if (isEnRuta && navigationMode === 'real' && navigator.geolocation) {
      // Fetch precise instant location when start button is hit
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLocationStatus('detected');
          
          const speedKmh = position.coords.speed ? Math.max(0, Math.round(position.coords.speed * 3.6)) : 0;
          setSimulatedSpeed(speedKmh);
          
          speakText(`GPS activado con precisión satelital. Ubicación actual detectada. Generando ruta segura hacia destino.`);
        },
        (error) => {
          console.warn("Error capturing fresh precise GPS:", error);
          setLocationStatus('failed');
          speakText("Aviso de señal satelital: No se pudo obtener la ubicación precisa. Utilizando coordenadas de base.");
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );

      // Continuously monitor precise physical updates and update the absolute Google Maps map background
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLocationStatus('detected');
          
          const speedKmh = position.coords.speed ? Math.max(0, Math.round(position.coords.speed * 3.6)) : 0;
          setSimulatedSpeed(speedKmh);
        },
        (error) => {
          console.warn("Active GPS lock intermittent:", error);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isEnRuta, navigationMode]);

  // Update simulator whenever route changes
  useEffect(() => {
    setSimulatedKmRestantes(activeRoute.kmRestantes);
    setActiveCheckpointIndex(0);
    
    // Vocalize automatic CoPilot IA warnings when route changes!
    const delayVoice = setTimeout(() => {
      speakText(activeRoute.soundMensaje);
      setCopilotoMensaje(activeRoute.soundMensaje);
    }, 600);

    return () => clearTimeout(delayVoice);
  }, [activeRoute]);

  // Monitorear en vivo simulation engine or real gps reset
  useEffect(() => {
    let simInterval: any;
    if (isEnRuta && navigationMode === 'simulated') {
      setSimulatedSpeed(74);
      // Trigger starting announcement
      speakText(`Sistema de monitoreo federal activado en vivo. Velocidad crucero segura programada en base a su perfil de ${truckProfile.pesoBruto} toneladas. Conduzca con precaución.`);
      
      simInterval = setInterval(() => {
        // Decrease km remaining realistically
        setSimulatedKmRestantes(prev => {
          if (prev <= 10) {
            setIsEnRuta(false);
            setNavigationMode(null);
            speakText("Arribo seguro completado. NOM-012 validada en destino.");
            return 0;
          }
          return prev - 8;
        });

        // Fluctuating heavy truck speed between 70km/h and 85km/h
        setSimulatedSpeed(prev => {
          const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
          const next = prev + change;
          return Math.min(Math.max(next, 68), 85);
        });

        // Simulate jumping checkpoints as we get closer to destination
        setActiveCheckpointIndex(prev => {
          const totalCp = activeRoute.checkpoints.length;
          const next = (prev + 1) % totalCp;
          
          // Vocalize specific checkpoints warnings
          const cp = activeRoute.checkpoints[next];
          const hasAlerta = cp.alertaNom ? `. Alerta reglamentaria: ${cp.alertaNom}` : '';
          const instructionPhrase = `Tramo ${cp.km} kilómetros: ${cp.instruccion}${hasAlerta}`;
          setCopilotoMensaje(instructionPhrase);
          speakText(instructionPhrase);
          
          return next;
        });
      }, 5000);
    } else if (!isEnRuta) {
      setSimulatedSpeed(0);
      setSimulatedKmRestantes(activeRoute.kmRestantes);
      setActiveCheckpointIndex(0);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      if (simInterval) clearInterval(simInterval);
    };
  }, [isEnRuta, navigationMode, activeRoute.kmRestantes, activeRoute.checkpoints]);

  const handleSelectRoute = (route: RutaDestino) => {
    setActiveRoute(route);
    setSearchQuery(route.nombre);
    setIsDropdownOpen(false);
  };

  const handleManualSearch = (query: string) => {
    setSearchQuery(query);
    setIsDropdownOpen(true);
  };

  const saveCustomKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem('viapesada_google_maps_key', key);
    setShowApiKeySettings(false);
    speakText("Clave de Google Maps actualizada.");
  };

  // Convert geolocation coords to query safe
  const originCoordString = userLocation 
    ? `${userLocation.lat},${userLocation.lng}` 
    : '19.5430,-99.1960';

  const getMapIframeSrc = () => {
    const originEncoded = encodeURIComponent(originCoordString);
    const destinationEncoded = encodeURIComponent(activeRoute.queryParam);

    if (customApiKey === 'AIzaSyBeAbgisBE5m8sVSpglnwXKHdoNRHZMG-s') {
      // Universal embed format
      return `https://maps.google.com/maps?saddr=${originEncoded}&daddr=${destinationEncoded}&output=embed&z=7`;
    } else {
      // Keyed Google Maps Embed Directions API Link
      return `https://www.google.com/maps/embed/v1/directions?key=${customApiKey}&origin=${originEncoded}&destination=${destinationEncoded}`;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none font-sans">
      
      {/* ABSOLUTE BACKGROUND MAP: 100% OF MAIN VIEW AREA */}
      <div className="absolute inset-0 w-full h-full z-0 bg-slate-950">
        <iframe
          title="Fondo Absoluto Google Maps - VíaPesada MX"
          id="real-map-iframe"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src={getMapIframeSrc()}
          className="w-full h-full opacity-90 transition-opacity duration-500"
          allowFullScreen
        ></iframe>
        
        {/* Sleek bottom dark projection overlay to seamlessly read status bars and telemetry layers */}
        <div className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-5" />
        <div className="absolute top-0 left-0 right-0 h-44 pointer-events-none bg-gradient-to-b from-slate-950 via-slate-950/20 to-transparent z-5" />
      </div>

      {/* FLOATING CAPA DE SEGURIDAD EXCLUSIVA: TACTICAL BADGES OVER THE MAP CONTAINER */}
      {showRadarOverlays && !hideOverlays && (
        <div className="absolute inset-0 pointer-events-none z-10 w-full h-full">
          {/* Badge Alerta 1: KM 142 Zona de Asaltos */}
          <div className="absolute top-[42%] left-[45%] pointer-events-auto flex items-center gap-2 bg-red-950/95 border-2 border-red-500 rounded-2xl px-3 py-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse hover:scale-105 transition-transform" id="radar-badge-assault">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[7.5px] font-black text-red-400 font-mono tracking-widest uppercase">¡PELIGRO ACTIVO!</span>
              <span className="text-xs font-extrabold text-white">KM 142: Zona de Asaltos</span>
              <span className="text-[8px] text-red-200">Guardia Nacional patrulla</span>
            </div>
          </div>

          {/* Badge Alerta 2: Gálibo Crítico Puente */}
          <div className="absolute top-[58%] left-[28%] pointer-events-auto flex items-center gap-2 bg-amber-950/95 border-2 border-amber-500 rounded-2xl px-3 py-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-105 transition-transform" id="radar-badge-bridge">
            <Ruler className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[7.5px] font-black text-amber-400 font-mono tracking-widest uppercase">CUIDADO DE EMBALAJE</span>
              <span className="text-xs font-extrabold text-white">Puente: Máximo 4.25m</span>
              <span className="text-[8px] text-amber-200">Km 65 • Cuesta Mamulique</span>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM CONTROLLER BAR */}
      <header className="w-full bg-slate-950/95 border-b border-slate-900 px-4 py-3.5 z-40 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-400 animate-pulse" />
          <div>
            <h1 className="text-xs font-black tracking-widest text-slate-100 uppercase font-mono">VíaPesada MX</h1>
            <span className="text-[8px] text-emerald-400 block font-bold font-mono tracking-wider">TECNOLOGÍA NOM-012 ACTIVA</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => setHideOverlays(!hideOverlays)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
              hideOverlays 
                ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-550' 
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-850'
            }`}
            title={hideOverlays ? "Mostrar controles" : "Ocultar controles para ver mapa completo"}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{hideOverlays ? 'Controles Ocultos' : 'Limpiar Pantalla'}</span>
          </button>

          <button 
            type="button" 
            onClick={() => setShowApiKeySettings(true)}
            className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Ajustes de Google Maps API"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1.5 rounded-lg text-[9px] font-mono text-slate-300 font-bold">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>5G GPS: {locationStatus === 'detected' ? 'ONLINE' : 'FALLBACK'}</span>
          </div>
        </div>
      </header>

      {/* MAIN VISUAL FLOATING CHASSIS */}
      <main className="flex-1 w-full relative z-20 flex flex-col pointer-events-none select-none">
        
        {/* INTERACTIVE COMPACT OVERLAYS FOR THE ACTIVE TAB */}

        {/* --- MAP TAB FLOATING COMPONENTS --- */}
        {activeTab === 'mapa' && (
          <div className="absolute inset-x-0 top-0 bottom-[84px] flex flex-col justify-between p-4 pointer-events-none">
            
            {hideOverlays ? (
              <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-auto z-10 p-4">
                <button
                  type="button"
                  onClick={() => setHideOverlays(false)}
                  className="bg-slate-950/98 text-amber-400 hover:text-white border-2 border-amber-400/80 hover:border-amber-400 px-6 py-3.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl animate-bounce hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>👁️ MOSTRAR CONTROLES</span>
                </button>
              </div>
            ) : (
              <>
                {/* TOP LAYOUT BAR: DESTINATIONS SEARCH & CONTROL RADAR */}
                <div className="w-full flex flex-col gap-2.5 max-w-sm mx-auto pointer-events-auto">
                  
                  {/* DROPDOWN DESTINATION SEARCH */}
                  <div className="relative">
                    <div className="flex items-center bg-slate-950/95 border-2 border-indigo-500/40 rounded-2xl px-3.5 py-3 shadow-2xl backdrop-blur">
                      <Search className="w-4.5 h-4.5 text-slate-400 mr-2 shrink-0 animate-pulse" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleManualSearch(e.target.value)}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder="Buscar autopistas federales o destino..."
                        className="w-full bg-transparent text-white text-xs placeholder-slate-500 font-sans outline-none font-black"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            setActiveRoute(DESTINOS[0]);
                          }} 
                          className="p-1 hover:bg-slate-900 rounded text-slate-400"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Drop-down suggest */}
                    {isDropdownOpen && (
                      <div className="absolute top-14 inset-x-0 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-3xl p-1.5 z-40 max-h-56 overflow-y-auto backdrop-blur-md">
                        <div className="text-[8px] text-slate-500 font-black px-2.5 py-1.5 uppercase tracking-wider font-mono">Seleccionar Destino Regulado</div>
                        {DESTINOS.filter(d => d.nombre.toLowerCase().includes(searchQuery.toLowerCase())).map((dest) => (
                          <button
                            key={dest.id}
                            onClick={() => handleSelectRoute(dest)}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-indigo-900/40 rounded-xl text-left transition-colors text-xs text-slate-200"
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                              <div>
                                <span className="font-extrabold text-white block text-xs">{dest.nombre}</span>
                                <span className="text-[9px] text-slate-400 font-mono text-indigo-400">{dest.rutaFormato}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-black text-amber-400">{dest.kmRestantes} km</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* FLOATING ACTION CAPA: REGLAMENTO & RADAR TOGGLE */}
                  <div className="flex gap-1.5 items-stretch">
                    <div className="flex bg-slate-950/95 border border-slate-800 p-1 rounded-xl shadow-xl flex-1 text-[9px] font-bold font-mono">
                      <span className="text-slate-500 px-2 py-1 block self-center">Radar NOM:</span>
                      <button
                        type="button"
                        onClick={() => setShowRadarOverlays(!showRadarOverlays)}
                        className={`flex-1 py-1 rounded-lg text-center transition-all ${
                          showRadarOverlays 
                            ? 'bg-amber-400 text-slate-950 font-black shadow-sm' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {showRadarOverlays ? '🎯 ACTIVO' : '💤 INACTIVO'}
                      </button>
                    </div>

                    {/* SOUND MUTED TOGGLE */}
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className={`bg-slate-950/95 border border-slate-800 px-3.5 rounded-xl shadow-xl text-xs transition-colors flex items-center justify-center gap-1.5 ${
                        isMuted ? 'text-red-400 hover:text-red-300' : 'text-slate-300 hover:text-white'
                      }`}
                      title={isMuted ? "Activar locutor nacional" : "Silenciar copiloto"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span className="text-[9px] font-bold font-mono uppercase">{isMuted ? 'Voz Muted' : 'Voz On'}</span>
                    </button>
                  </div>
                </div>

                {/* UPPER-MID: FLOATING COPILOTO SPEECH SENTENCE BOX */}
                {copilotoMensaje && (
                  <div className="w-full max-w-sm mx-auto mt-4 pointer-events-auto">
                    <div className="bg-slate-950/95 border-l-4 border-amber-400 rounded-2xl p-3 shadow-2xl backdrop-blur relative">
                      <button 
                        onClick={() => setCopilotoMensaje(null)} 
                        className="absolute top-2.5 right-2.5 text-slate-500 hover:text-white p-0.5 bg-slate-900 rounded-md"
                        type="button"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        <span className="text-[8.5px] font-black text-slate-400 font-mono tracking-widest uppercase">COPILOTO GEMINI EN AUDIO</span>
                      </div>
                      <p className="text-[10px] text-indigo-50 font-extrabold italic leading-relaxed">
                        &ldquo;{copilotoMensaje}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {/* LOWER PORTION: TELEMETRY & FLIGHT NAVIGATION HUD DE MONITOREO */}
                <div className="w-full flex flex-col gap-2 max-w-sm mx-auto mt-auto pointer-events-auto">
                  
                  {/* DRIVING SIMULATOR CONDUCCIÓN ACTIVA */}
                  {isEnRuta ? (
                    <div className={`bg-slate-950/98 border-2 ${navigationMode === 'real' ? 'border-emerald-500 shadow-emerald-500/10' : 'border-amber-400 shadow-amber-500/10'} rounded-2xl p-3 shadow-2xl backdrop-blur animate-slideUp`}>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${navigationMode === 'real' ? 'bg-emerald-400 animate-ping' : 'bg-amber-500 animate-ping'} shrink-0`} />
                          <span className={`text-[9px] font-black font-mono tracking-wider ${navigationMode === 'real' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {navigationMode === 'real' ? '🔴 CARRETERA REAL GPS' : '🤖 MONITOREO SIMULADO'}
                          </span>
                        </div>
                        <span className="text-[8px] bg-slate-900 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-850">
                          {navigationMode === 'real' ? 'Satélite Activo' : 'Modo Demo'}
                        </span>
                      </div>

                      {/* Telemetría Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 flex flex-col items-center">
                          <span className="text-[7.5px] text-slate-500 font-mono font-bold uppercase">Velocidad</span>
                          <div className="flex items-baseline gap-0.5 mt-0.5">
                            <span className={`text-base font-black font-mono ${navigationMode === 'real' ? 'text-emerald-400' : 'text-amber-400'}`}>{simulatedSpeed}</span>
                            <span className="text-[8px] text-slate-500 font-bold">km/h</span>
                          </div>
                        </div>

                        <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 flex flex-col items-center">
                          <span className="text-[7.5px] text-slate-500 font-mono font-bold uppercase">Distancia</span>
                          <div className="flex items-baseline gap-0.5 mt-0.5">
                            <span className="text-base font-black font-mono text-indigo-300">
                              {navigationMode === 'real' ? 'Real' : `${simulatedKmRestantes} km`}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 flex flex-col items-center">
                          <span className="text-[7.5px] text-slate-500 font-mono font-bold uppercase">Límite NOM</span>
                          <div className="flex items-baseline gap-0.5 mt-0.5">
                            <span className="text-base font-black font-mono text-amber-400">{truckProfile.alturaMaxima}</span>
                            <span className="text-[8px] text-slate-500 font-bold">m</span>
                          </div>
                        </div>
                      </div>

                      {/* Checkpoint Instruction Box */}
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-black font-mono text-amber-400 uppercase tracking-wider">
                            {navigationMode === 'real' ? 'Indicación de Viaje' : `TRAMO ${activeCheckpointIndex + 1} de ${activeRoute.checkpoints.length}`}
                          </span>
                          {activeRoute.checkpoints[activeCheckpointIndex]?.alertaNom && (
                            <span className="text-[7px] font-bold bg-red-950 text-red-500 border border-red-900 px-1.5 py-0.2 rounded uppercase">
                              ⚠️ NOM-012
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-white leading-normal filter font-medium">
                          {navigationMode === 'real' 
                            ? `GPS conectado. Guiando tractocamión hacia de ${activeRoute.rutaFormato.split("➔")[1]} de forma segura.` 
                            : activeRoute.checkpoints[activeCheckpointIndex]?.instruccion}
                        </p>
                      </div>

                      {/* HIGHLY ACCESSIBLE SECONDARY ACTION TO DELEGATE REAL-TIME NAVIGATION INTO NATIVE GOOGLE MAPS ON THE TRUCKER'S MOBILE DEVICE */}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originCoordString)}&destination=${encodeURIComponent(activeRoute.queryParam)}&travelmode=driving`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-indigo-950/85 hover:bg-indigo-900 border border-indigo-500/40 py-2 px-3 rounded-xl text-center text-[9px] font-black tracking-wider text-indigo-300 hover:text-white uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mb-2"
                      >
                        <Navigation className="w-3 h-3 text-indigo-400 animate-pulse" />
                        <span>🗺️ ABRIR INDICACIONES EN GOOGLE MAPS</span>
                      </a>
                    </div>
                  ) : (
                    /* STANDBY OVERVIEW INFO */
                    <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1 text-[8px] text-slate-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>GPS Activo: {locationStatus === 'detected' ? 'Ubicación Detectada' : 'Tlalnepantla CEDIS'}</span>
                        </div>
                        <span className="text-amber-400 text-[8px] text-right font-mono font-bold">{truckProfile.configuracionSict.split(" ")[0]} ({truckProfile.pesoBruto} Ton)</span>
                      </div>
                      
                      <div className="h-px w-full bg-slate-900 my-1.5" />

                      <div className="flex justify-between items-center gap-2">
                        <div className="flex-1">
                          <span className="text-[11px] font-black text-white block truncate">
                            CDMX/N. Laredo ➔ {activeRoute.rutaFormato.split("➔")[1]}
                          </span>
                          <span className="text-[8px] text-slate-400 font-mono">Duración Estimada: {activeRoute.eta}</span>
                        </div>

                        <div className="flex gap-2">
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-amber-400 block">{activeRoute.casetas}</span>
                            <span className="text-[7px] text-slate-500 font-mono block">PEAJES SUGERIDOS</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GIGANTIC ERGONOMIC MONITOREAR RUTA IN LIVE BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isEnRuta) {
                        setIsEnRuta(false);
                        setNavigationMode(null);
                      } else {
                        setShowStartJourneyModal(true);
                      }
                    }}
                    className={`w-full py-3.5 px-6 rounded-2xl border-2 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-3xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
                      isEnRuta
                        ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/50 animate-pulse shadow-rose-900/30'
                        : 'bg-amber-400 hover:bg-amber-500 text-slate-950 border-amber-300/65 shadow-amber-500/20'
                    }`}
                  >
                    <Compass className={`w-4 h-4 ${isEnRuta ? 'animate-spin' : ''}`} />
                    <span>{isEnRuta ? '🚨 DETENER NAVEGACIÓN EN CURSO' : '🟢 INICIAR VIAJE'}</span>
                  </button>

                </div>
              </>
            )}

          </div>
        )}

        {/* --- COPILOTO VOX TAB CHASSIS --- */}
        {activeTab === 'copiloto' && (
          <div className="absolute inset-0 w-full h-full bg-slate-950/95 overflow-y-auto p-4 pb-28 pointer-events-auto flex flex-col justify-between">
            <div className="w-full max-w-sm mx-auto">
              <div className="text-center mt-3 mb-6">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Gemini Copiloto Vocálico</span>
                <h2 className="text-lg font-black text-white tracking-tight mt-1">Sintonizador Manos Libres</h2>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Pregunte o emita órdenes por audio civil sobre las regulaciones NOM-012 y gálibos seguros federales.</p>
              </div>

              {/* Live waveform audio display */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center py-8 mb-5">
                <div className="flex items-center justify-center gap-1.5 h-11 mb-2.5">
                  <span className={`w-1 bg-amber-500 rounded-full transition-all duration-300 h-4 ${isEnRuta ? 'animate-pulse h-9' : ''}`}></span>
                  <span className={`w-1 bg-amber-400 rounded-full transition-all duration-200 h-6 ${isEnRuta ? 'animate-ping h-11' : ''}`}></span>
                  <span className={`w-1 bg-indigo-500 rounded-full transition-all duration-300 h-8 ${isEnRuta ? 'animate-pulse h-7' : ''}`}></span>
                  <span className={`w-1 bg-indigo-400 rounded-full transition-all duration-150 h-5 ${isEnRuta ? 'animate-bounce h-10' : ''}`}></span>
                  <span className={`w-1 bg-pink-500 rounded-full transition-all duration-300 h-3 ${isEnRuta ? 'animate-pulse h-5' : ''}`}></span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                  {isEnRuta ? "Canal de Audio Tráiler Sintonizado" : "Audio Esperando Entrada"}
                </span>
              </div>

              {/* Conversation log representation */}
              <div className="space-y-3.5">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[8px] font-bold text-slate-500 font-mono mb-1">CONDUCTOR ORDENÓ:</div>
                  <p className="text-xs text-white italic font-bold">"¿Cómo viene el gálibo regulado NOM hacia {activeRoute.rutaFormato.split("➔")[1]}?"</p>
                </div>

                <div className="bg-indigo-950/60 border border-indigo-900/60 p-4 rounded-xl">
                  <div className="text-[8px] font-bold text-amber-400 font-mono mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> GEMINI COPILOTO RESPONDE:
                  </div>
                  <p className="text-xs text-indigo-100 leading-normal font-sans">
                    {activeRoute.soundMensaje}
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Microphone Touch interaction */}
            <div className="w-full max-w-sm mx-auto flex flex-col items-center mt-6">
              <button
                type="button"
                onClick={() => {
                  speakText(activeRoute.soundMensaje);
                  setCopilotoMensaje(activeRoute.soundMensaje);
                }}
                className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20"
              >
                <Mic className="w-7 h-7 text-white" />
              </button>
              <span className="text-[10px] text-slate-400 font-black font-mono mt-2.5">
                TOCAR PARA VOCALIZAR REPORTES DE RUTA
              </span>
            </div>
          </div>
        )}

        {/* --- MI CAMION TAB CHASSIS --- */}
        {activeTab === 'camion' && (
          <div className="absolute inset-0 w-full h-full bg-slate-950/95 overflow-y-auto p-4 pb-28 pointer-events-auto">
            <div className="w-full max-w-sm mx-auto">
              
              {/* Profile setup header */}
              <div className="mb-5 pb-3 border-b border-slate-800">
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest font-mono">NOM-012 ESPECIFICACIONES</span>
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <Truck className="w-5 h-5 text-amber-500" /> Mi Configuración Física
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Configure el pesaje de báscula y el gálibo de su remolque en tiempo real para evitar atascos bajo puentes federales.
                </p>
              </div>

              {saveSuccess && (
                <div className="mb-4 bg-emerald-950/90 border border-emerald-500/60 rounded-xl p-3 text-emerald-300 flex items-center justify-between text-xs animate-fadeIn shadow-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-extrabold text-white block">Perfil de Carga Guardado</span>
                      <span className="text-[9px] text-emerald-400 font-mono">Límites NOM-012 re-calibrados</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form entries */}
              <div className="space-y-4">
                
                {/* SICT Option */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1">
                    Configuración Autorizada de Ejes
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {sictOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTruckProfile({ ...truckProfile, configuracionSict: opt })}
                        className={`w-full px-3.5 py-3 rounded-xl border text-left text-xs transition-all ${
                          truckProfile.configuracionSict === opt 
                            ? 'bg-amber-400/10 border-amber-500 text-white font-extrabold' 
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Altura / Peso Bruto */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1">
                      Altura Total Gálibo
                    </label>
                    <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5">
                      <Ruler className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                      <input
                        type="number"
                        step="0.05"
                        min="2.00"
                        max="5.50"
                        value={truckProfile.alturaMaxima}
                        onChange={(e) => setTruckProfile({ ...truckProfile, alturaMaxima: e.target.value })}
                        className="w-full bg-transparent text-white text-xs outline-none font-bold"
                      />
                      <span className="text-[10px] text-slate-500 font-mono font-bold">m</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1">
                      Peso Bruto Real
                    </label>
                    <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5">
                      <Scale className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                      <input
                        type="number"
                        step="0.1"
                        min="5.0"
                        max="120.0"
                        value={truckProfile.pesoBruto}
                        onChange={(e) => setTruckProfile({ ...truckProfile, pesoBruto: e.target.value })}
                        className="w-full bg-transparent text-white text-xs outline-none font-bold"
                      />
                      <span className="text-[10px] text-slate-500 font-mono font-bold">T</span>
                    </div>
                  </div>
                </div>

                {/* Cargo Selectors */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1.5">
                    Tipo de Carga Federal
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['General', 'Refrigerada', 'Hazmat'] as const).map((tipo) => {
                      const active = truckProfile.tipoCarga === tipo;
                      return (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => {
                            setTruckProfile({ ...truckProfile, tipoCarga: tipo });
                            if (tipo === 'Hazmat') {
                              speakText("Alerta: Protocolo de Cargas Peligrosas HAZMAT activado. Se restringe tránsito en túneles urbanos.");
                            }
                          }}
                          className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                            active
                              ? 'bg-amber-400 border-amber-500 text-slate-950 font-black shadow-lg scale-102'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          <span className="text-[10px] tracking-wide uppercase font-extrabold font-mono">{tipo}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DIAGNOSTIC VERDICT NOM-012 */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-slate-300 font-bold mb-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold">Diagnóstico VíaPesada Autopista</span>
                  </div>
                  <div className="space-y-1 text-slate-400 text-[10.5px]">
                    <div className="flex items-center justify-between">
                      <span>Límite Peso Autorizado SICT:</span>
                      <span className="font-mono text-white font-bold">{truckProfile.configuracionSict.includes('Full') ? '75.5' : '43.5'} Toneladas</span>
                    </div>
                    <span className="text-[9.5px] text-emerald-400 block mt-1 font-bold">✔ Peso menor o igual a lo reglamentario por la SCT</span>
                  </div>
                </div>

                {/* Save action button */}
                <button
                  type="button"
                  onClick={() => {
                    setSaveSuccess(true);
                    speakText("Configuración de tractocamión calibrada con éxito.");
                    setTimeout(() => {
                      setSaveSuccess(false);
                      setActiveTab('mapa');
                    }, 1400);
                  }}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg transition-all"
                >
                  Confirmar Perfil NOM-012
                </button>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* MAP GOOGLE KEY SETTINGS MODEL */}
      {showApiKeySettings && (
        <div className="absolute inset-0 bg-slate-950/98 backdrop-blur z-50 flex items-center justify-center p-6 animate-fadeIn pointer-events-auto">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-850 rounded-3xl p-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 animate-slideDown">
              <div className="flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-400 animate-spin" />
                <h3 className="text-sm font-black text-white">Google Maps API Key</h3>
              </div>
              <button onClick={() => setShowApiKeySettings(false)} className="text-slate-400 hover:text-white" type="button">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <p className="text-[10px] text-slate-300 leading-normal mb-4">
              La visualización avanzada por satélite del tráiler requiere una API Key que contenga Embed y Directions habilitadas. Ingrese una llave para personalizar el mapa:
            </p>

            <input
              type="text"
              defaultValue={customApiKey}
              id="custom-api-key-input-box"
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono font-bold mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const val = (document.getElementById('custom-api-key-input-box') as HTMLInputElement)?.value;
                  if (val) saveCustomKey(val);
                }}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition-all"
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

      {/* DIÁLOGO / MODAL DE INICIO DE VIAJE (REAL CON GPS VS SIMULADO) */}
      {showStartJourneyModal && (
        <div className="absolute inset-0 bg-slate-950/98 backdrop-blur z-50 flex items-center justify-center p-6 animate-fadeIn pointer-events-auto">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-5 shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-slideDown">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400 animate-spin" />
                <h3 className="text-sm font-black text-rose-50 font-mono tracking-wider">CONFIGURAR VIAJE</h3>
              </div>
              <button 
                onClick={() => setShowStartJourneyModal(false)} 
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" 
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[10px] text-slate-300 leading-normal mb-4 font-bold">
              Seleccione cómo desea iniciar el monitoreo de ruta para la unidad con configuración <span className="text-amber-400">{truckProfile.configuracionSict.split(" ")[0]}</span> ({truckProfile.pesoBruto} Ton):
            </p>

            <div className="space-y-3">
              {/* Opción 1: GPS Real Satelital */}
              <button
                type="button"
                onClick={() => {
                  setIsEnRuta(true);
                  setNavigationMode('real');
                  setShowStartJourneyModal(false);
                }}
                className="w-full bg-gradient-to-r from-emerald-600/20 to-emerald-700/10 hover:from-emerald-600/30 hover:to-emerald-700/20 border-2 border-emerald-500 rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-98 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shrink-0 group-hover:scale-110 transition-transform">
                    <Navigation className="w-3.5 h-3.5 text-slate-950" />
                  </div>
                  <span className="text-xs font-black text-white font-sans uppercase tracking-wider">Modo Conducción Real (GPS)</span>
                </div>
                <p className="text-[9.5px] text-slate-300 leading-relaxed pl-8">
                  Detecta las coordenadas reales de su teléfono o computadora. Traza la ruta y actualiza el mapa satelital en vivo según su avance real por la carretera.
                </p>
                <div className="mt-2.5 pl-8 text-[8px] text-emerald-400 font-mono font-black uppercase tracking-widest flex items-center gap-1">
                  <Wifi className="w-3 h-3 animate-pulse" /> Sincronización de Báscula Dinámica
                </div>
              </button>

              {/* Opción 2: Demostración Simulada */}
              <button
                type="button"
                onClick={() => {
                  setIsEnRuta(true);
                  setNavigationMode('simulated');
                  setShowStartJourneyModal(false);
                }}
                className="w-full bg-gradient-to-r from-amber-500/15 to-orange-500/5 hover:from-amber-400/25 hover:to-orange-500/15 border border-slate-700 hover:border-amber-400/60 rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-98 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-black text-white font-sans uppercase tracking-wider">Simulador de Ruta (Demo)</span>
                </div>
                <p className="text-[9.5px] text-slate-300 leading-relaxed pl-8">
                  Observa el comportamiento virtual del camión a 80km/h de forma acelerada. Excelente para ver cómo el Copiloto lee por voz las alertas y gálibos de puentes.
                </p>
                <div className="mt-2.5 pl-8 text-[8px] text-indigo-400 font-mono font-black uppercase tracking-widest flex items-center gap-1">
                  💡 Ideal para demostraciones de escritorio
                </div>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <span className="text-[8.5px] text-slate-500 font-mono font-bold">VíaPesada MX • Tecnología Satelital NOM-012</span>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE LOWER PILL NAVIGATION TAB FIXED */}
      <nav className="absolute bottom-0 left-0 right-0 bg-slate-950/98 border-t border-slate-900 py-3 pb-5 flex justify-around items-center text-slate-400 backdrop-blur-md z-45 shadow-2xl shrink-0 pointer-events-auto">
        
        {/* TAB 1: FULL INTERACTIVE MAPS */}
        <button
          onClick={() => setActiveTab('mapa')}
          className={`flex flex-col items-center gap-1.5 px-5 py-1 transition-all ${
            activeTab === 'mapa'
              ? 'text-amber-400 transform scale-105 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          type="button"
        >
          <MapIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold font-mono tracking-wider">MAPA GOOGLE</span>
        </button>

        {/* TAB 2: COPILOTO IA VOICE COMPANION */}
        <button
          onClick={() => setActiveTab('copiloto')}
          className={`flex flex-col items-center gap-1.5 px-5 py-1 transition-all ${
            activeTab === 'copiloto'
              ? 'text-amber-400 transform scale-105 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          type="button"
        >
          <Mic className="w-5 h-5 animate-pulse" />
          <span className="text-[9px] font-bold font-mono tracking-wider">TELEMETRÍA VOZ</span>
        </button>

        {/* TAB 3: TRUCK SPECIFICATIONS */}
        <button
          onClick={() => setActiveTab('camion')}
          className={`flex flex-col items-center gap-1.5 px-5 py-1 transition-all ${
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
