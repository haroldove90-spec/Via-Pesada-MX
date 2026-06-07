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
  Minimize2
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
  checkpoints: CheckpointRuta[];
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
    },
    checkpoints: [
      { km: 0, instruccion: "Salida de terminal de origen. Todo el peso bruto y configuraciones validadas acordes a NOM-012.", alertaNom: null, tipo: 'normal' },
      { km: 120, instruccion: "Paso de Libramiento de Monterrey. Tránsito fluido, monitorear gálibo del puente intermedio de 4.50m.", alertaNom: "Gálibo seguro para 4.25m", tipo: 'normal' },
      { km: 340, instruccion: "Aproximándose a Matehuala. Tramo con alerta preventiva de asaltos. Mantenga comunicación fija y viaje acoplado.", alertaNom: "Peligro de Seguridad", tipo: 'alerta' },
      { km: 590, instruccion: "Llegada al punto de control San Luis Potosí. Casetas federales libres de obstáculos.", alertaNom: "Báscula SICT inactiva temporalmente", tipo: 'peaje' },
      { km: 840, instruccion: "Arribo a caseta de entrada a CDMX. Restricción de doble remolque nocturno activa." , alertaNom: "NOM-012: Restricción CDMX", tipo: 'bascula' }
    ]
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
    },
    checkpoints: [
      { km: 0, instruccion: "Salida de terminal Nuevo Laredo. GPS Activo en ruta a Monterrey.", alertaNom: null, tipo: 'normal' },
      { km: 65, instruccion: "Cuesta de Mamulique. Neblina intensa y llovizna reduciendo visibilidad. Disminuya velocidad y active luces preventivas.", alertaNom: "Freno de Motor Sugerido", tipo: 'alerta' },
      { km: 150, instruccion: "Caseta Sabinas Hidalgo. Costo $280 pesos para camiones T3-S2-R4. Preparar cobro exacto o TAG.", alertaNom: "Peaje NOM-012 Autorizado", tipo: 'peaje' },
      { km: 220, instruccion: "Llegada a CEDIS Escobedo, Monterrey. Control de gálibos y báscula privada de descarga aprobados.", alertaNom: "Ingreso Verde", tipo: 'bascula' }
    ]
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
    },
    checkpoints: [
      { km: 0, instruccion: "Empieza viaje a Perla Tapatía. Configuración SICT registrada correctamente.", alertaNom: null, tipo: 'normal' },
      { km: 290, instruccion: "Límites de Zacatecas y San Luis Potosí. Tráfico despejado. Velocidad crucero autorizada de 80 km/h.", alertaNom: "Todo en orden", tipo: 'normal' },
      { km: 540, instruccion: "Aproximándose a Lagos de Moreno. Incorporación con asfalto irregular y baches en carril derecho.", alertaNom: "Precaución Reducción", tipo: 'alerta' },
      { km: 670, instruccion: "Ingreso al Macrolibramiento GDL. Operativo activo de báscula federal sintonizado en canal del operador.", alertaNom: "Báscula NOM-012 Activa", tipo: 'bascula' },
      { km: 710, instruccion: "Llegada a las bodegas de Guadalajara Oriente.", alertaNom: "Viaje Exitoso", tipo: 'normal' }
    ]
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
    },
    checkpoints: [
      { km: 0, instruccion: "Salida del puerto terrestre fronterizo a Veracruz.", alertaNom: null, tipo: 'normal' },
      { km: 420, instruccion: "Libramiento de Tampico. Vientos racheados laterales. Sujete el volante firmemente con ambas manos.", alertaNom: "Vientos cruzados", tipo: 'alerta' },
      { km: 780, instruccion: "Tuxpan Caseta. Avance rápido sin demoras.", alertaNom: "Peaje OK", tipo: 'peaje' },
      { km: 990, instruccion: "Cumbres de Maltrata Cerrada por colisión y neblina. Buscando desvío o esperando apertura. Active freno de motor.", alertaNom: "Accidente - Paro Preventivo", tipo: 'alerta' },
      { km: 1140, instruccion: "Llegada al recinto portuario de Veracruz.", alertaNom: "Descarga NOM-012 OK", tipo: 'bascula' }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'mapa' | 'copiloto' | 'camion'>('mapa');
  
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

  // New features requested
  const [isEnRuta, setIsEnRuta] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  // Simulation variables for interactive GPS route
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState(0);
  const [simulatedSpeed, setSimulatedSpeed] = useState(0);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [useVoiceSynthesis, setUseVoiceSynthesis] = useState(true);

  // Geolocation States
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'detected' | 'failed'>('idle');
  const [locationText, setLocationText] = useState('Buscando ubicación GPS...');

  // Suggested SICT Options
  const sictOptions = [
    "T3-S2 (Sencillo)",
    "T3-S2-R4 (Full / Doble Remolque)",
    "C3 (Tándem)",
    "T3-S3 (Sencillo Reforzado)",
    "T3-S2-S2 (Doble Semirremolque R. Sencillo)"
  ];

  // Helper code to abbreviate profile SICT
  const getSictAbbreviation = (sict: string) => {
    if (sict.includes('Full') || sict.includes('R4')) return 'Full';
    if (sict.includes('Sencillo')) return 'Sencillo';
    if (sict.includes('Tándem') || sict.includes('C3')) return 'Tándem';
    return 'Sencillo';
  };

  const pDisplay = `${getSictAbbreviation(truckProfile.configuracionSict)} ${truckProfile.pesoBruto}T`;

  // Geolocation trigger on mount
  useEffect(() => {
    setLocationStatus('detecting');
    setLocationText('Localizando por GPS...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLocationStatus('detected');
          setLocationText('GPS Activo: Coordenadas detectadas');
        },
        (error) => {
          console.warn("GPS error, defaulting to Tlalnepantla, Mex:", error.message);
          // Default Tlalnepantla, Estado de México coordinates:
          setUserLocation({ lat: 19.5430, lng: -99.1960 });
          setLocationStatus('failed');
          setLocationText('GPS Predeterminado: Tlalnepantla, Mex');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setUserLocation({ lat: 19.5430, lng: -99.1960 });
      setLocationStatus('failed');
      setLocationText('GPS Sin soporte: Tlalnepantla, Mex');
    }
  }, []);

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
    setAlertDismissed(false); // Reset alert dismiss state when user changes route
    setActiveCheckpointIndex(0); // Reset simulation checkpoint
  };

  // Simulación activa de velocidad y telemetría de cabina en ruta activa
  useEffect(() => {
    let speedInterval: any;
    if (isEnRuta) {
      setSimulatedSpeed(76);
      speedInterval = setInterval(() => {
        // Oscilar velocidad entre 72 y 84 km/h de manera realista para tractocamión cargado
        setSimulatedSpeed(prev => {
          const change = Math.floor(Math.random() * 5) - 2; // -2 a +2
          const target = prev + change;
          return Math.min(Math.max(target, 70), 84);
        });
      }, 4000);
    } else {
      setSimulatedSpeed(0);
      setActiveCheckpointIndex(0);
    }

    return () => {
      if (speedInterval) clearInterval(speedInterval);
    };
  }, [isEnRuta]);

  // Ejecutar locución sintetizada y transcripción de copiloto al pasar de checkpoint
  useEffect(() => {
    if (isEnRuta && activeRoute.checkpoints[activeCheckpointIndex]) {
      const cp = activeRoute.checkpoints[activeCheckpointIndex];
      const alertSuffix = cp.alertaNom ? `. Alerta reglamentaria: ${cp.alertaNom}` : '';
      const phrase = `Tramo ${cp.km} km: ${cp.instruccion}${alertSuffix}`;
      
      setCopilotoMensaje(phrase);

      // Web Speech Synthesis API
      if (useVoiceSynthesis && 'speechSynthesis' in window && !isMuted) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(phrase);
          utterance.lang = 'es-MX';
          utterance.rate = 0.95; // Ritmo modulado para chofer de carga pesada
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn("Speech synthesis err:", err);
        }
      }
    }
  }, [isEnRuta, activeCheckpointIndex, activeRoute, useVoiceSynthesis, isMuted]);

  const handleMicToggle = () => {
    setCopilotoActivo(!copilotoActivo);
    if (!copilotoActivo) {
      setCopilotoMensaje(`Copiloto escuchando... "¿Cómo viene la autopista hacia ${activeRoute.nombre}?"`);
      setTimeout(() => {
        if (activeRoute.id === 'mty') {
          setCopilotoMensaje("Operador, la Cuesta de Mamulique presenta visibilidad reducida por llovizna. Mantenga distancia.");
        } else if (activeRoute.id === 'gdl') {
          setCopilotoMensaje(`Guadalajara reporta báscula federal operando en el Macrolibramiento. Su peso de ${truckProfile.pesoBruto} toneladas está dentro del rango seguro.`);
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

  // Coordinates formatting
  const originCoordString = userLocation 
    ? `${userLocation.lat},${userLocation.lng}` 
    : 'Tlalnepantla, Estado de Mexico';

  const getMapIframeSrc = () => {
    const originEncoded = encodeURIComponent(originCoordString);
    const destinationEncoded = encodeURIComponent(activeRoute.queryParam);

    if (customApiKey === 'AIzaSyBeAbgisBE5m8sVSpglnwXKHdoNRHZMG-s') {
      // Embed universal link (fully interactive directions without billing/restrictions errors)
      return `https://maps.google.com/maps?saddr=${originEncoded}&daddr=${destinationEncoded}&output=embed&z=7`;
    } else {
      // Developer client key link
      return `https://www.google.com/maps/embed/v1/directions?key=${customApiKey}&origin=${originEncoded}&destination=${destinationEncoded}`;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none font-sans">
      
      {/* IMMERSIVE HEADER / SYSTEM BAR */}
      <header className="w-full bg-slate-950/95 border-b border-slate-900 px-4 py-3 z-40 flex justify-between items-center shrink-0">
        <span className="text-xs font-black font-mono text-slate-400">09:41</span>
        
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
          <span className={`w-2 h-2 rounded-full ${isEnRuta ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
          <span className="text-[10px] text-slate-300 font-extrabold font-mono tracking-wider">VíaPesada MX</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            type="button" 
            onClick={() => setShowApiKeySettings(true)}
            className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition-colors"
            title="Ajustes de Google API"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-300 font-bold">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>5G</span>
          </div>
        </div>
      </header>

      {/* CORE VIEWPORT CONTENT */}
      <main className="flex-1 w-full flex flex-col relative overflow-hidden">
        
        {/* TAB 1: REGION MAPA */}
        {activeTab === 'mapa' && (
          <div className="absolute inset-0 w-full h-[calc(100vh-125px)] flex flex-col relative overflow-hidden animate-fadeIn">
            
            {/* FULL MAP BACKGROUND - GOOGLE MAPS INDEPENDENT & INTERACTIVE */}
            <div className="absolute inset-0 w-full h-full z-0 bg-slate-950">
              <iframe
                title="Visor Cartográfico VíaPesada MX - Google Maps"
                id="real-map-iframe"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                }}
                loading="lazy"
                src={getMapIframeSrc()}
                className="w-full h-full pointer-events-auto select-none"
                allowFullScreen
              ></iframe>
              {/* Subtle visual gradient at the bottom base only (so we can read status rows clearly without blocking the map click vectors) */}
              <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-5" />
            </div>

            {/* FLOATING ACTION OVERLAYS - MINIMALIST AND STRATEGIC */}

            {/* 1. TOP FLOATING PANEL: SEARCH BAR & ROUTE DISPATCH NAVIGATION */}
            <div className="absolute top-3 inset-x-4 z-25 pointer-events-auto flex flex-col gap-2 max-w-sm mx-auto">
              
              {/* ROUTE SEARCH BAR AREA AND QUICK NAV BANNER */}
              <div className="flex gap-1.5 items-stretch">
                <div className="relative flex-1">
                <div className="flex items-center bg-slate-900/95 border border-slate-800 rounded-xl px-3 py-2 shadow-lg backdrop-blur">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 animate-pulse" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Escribe tu destino (ej: Monterrey)..."
                    className="w-full bg-transparent text-white text-xs placeholder-slate-500 font-sans outline-none font-extrabold"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setActiveRoute(DESTINOS[0]);
                        setCopilotoMensaje(DESTINOS[0].soundMensaje);
                      }} 
                      className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white"
                      type="button"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search suggestion drop-down */}
                {isDropdownOpen && (
                  <div className="absolute top-11 inset-x-0 bg-slate-900/98 border border-slate-800 rounded-xl shadow-2xl p-1 z-35 max-h-48 overflow-y-auto">
                    <div className="text-[8px] text-slate-500 font-bold px-2 py-1 uppercase tracking-widest font-mono">Rutas de Transporte</div>
                    {filteredDestinos.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => handleSelectRoute(dest)}
                        className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-indigo-600/30 rounded-lg text-left transition-colors text-xs text-slate-200"
                        type="button"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <div>
                            <span className="font-extrabold text-white block text-xs">{dest.nombre}</span>
                            <span className="text-[8px] text-slate-400 font-mono">Tlalnepantla ➔ {dest.nombre}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-indigo-400">{dest.kmRestantes}</span>
                      </button>
                    ))}
                    {filteredDestinos.length === 0 && (
                      <div className="text-slate-500 text-[10px] py-2.5 text-center">Ruta no listada</div>
                    )}
                  </div>
                )}
              </div>

              {/* REAL GPS TURN-BY-TURN NAV BUTTON */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originCoordString)}&destination=${encodeURIComponent(activeRoute.queryParam)}&travelmode=driving`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 px-3.5 rounded-xl shadow-lg border border-amber-400/20 text-xs transition-colors cursor-pointer shrink-0 font-extrabold"
                title="Abrir navegación real con asistencia GPS detallada en Google Maps"
              >
                <Navigation className="w-3.5 h-3.5 shrink-0" />
                <span className="uppercase text-[9.5px] tracking-wider font-black">GPS Real</span>
              </a>
            </div>
          </div>

            {/* 2. LIVE HIGHWAY COMPACT ALERTS (NON-OBSTRUCTIVE DISMISSABLE BANNER) */}
            {activeRoute.alertas && !alertDismissed ? (
              <div className="absolute top-36 inset-x-4 z-20 max-w-sm mx-auto animate-slideDown pointer-events-auto">
                <div className="bg-red-950/95 border border-red-500/45 rounded-2xl p-3 shadow-2xl backdrop-blur relative">
                  <button 
                    onClick={() => setAlertDismissed(true)} 
                    className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-850"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[8px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      ⚠️ ALERTA DE RUTA ({activeRoute.alertas.riesgo})
                    </span>
                    <span className="text-[8px] text-slate-400 font-mono truncate max-w-[150px]">{activeRoute.alertas.tramo}</span>
                  </div>
                  <h4 className="font-black text-white text-xs pr-6">{activeRoute.alertas.titulo}</h4>
                  <p className="text-[10px] text-red-200 mt-1 mr-2 leading-relaxed bg-slate-950/60 p-2 rounded-xl">
                    {activeRoute.alertas.descripcion}
                  </p>
                </div>
              </div>
            ) : activeRoute.alertas ? (
              /* If alert is closed, show a tiny floating indicator to re-open it if requested */
              <div className="absolute top-28 right-4 z-20 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setAlertDismissed(false)}
                  className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-rose-300 border border-red-500/30 px-2 py-1 rounded-full text-[9px] font-bold font-mono transition-all animate-bounce"
                >
                  <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                  <span>Ver Alerta ({activeRoute.id.toUpperCase()})</span>
                </button>
              </div>
            ) : null}

            {/* 3. TRIP STATUS SUMMARY ROW o HUD ACTIVO DE CABINA */}
            <div className="absolute bottom-28 inset-x-4 z-20 max-w-sm mx-auto pointer-events-auto">
              {!isEnRuta ? (
                /* PANEL ORDINARIO SIN VIAJE ACTIVO */
                <div className="pointer-events-none">
                  <div className="bg-slate-900/90 border border-slate-800/80 px-3 py-2 rounded-xl shadow-xl backdrop-blur flex justify-between items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-[7.5px] font-black text-slate-500 font-mono uppercase tracking-widest">Ruta Activa</span>
                      <span className="text-[11px] font-black text-white truncate max-w-[120px]">
                        Tlalnepantla ➔ {activeRoute.nombre}
                      </span>
                    </div>
                    <div className="h-6 w-[1px] bg-slate-800" />
                    <div className="flex flex-col items-center">
                      <span className="text-[7.5px] font-bold text-slate-500 font-mono uppercase tracking-widest">Tiempo</span>
                      <span className="text-xs font-mono font-bold text-amber-400">{activeRoute.eta}</span>
                    </div>
                    <div className="h-6 w-[1px] bg-slate-800" />
                    <div className="flex flex-col items-end">
                      <span className="text-[7.5px] font-bold text-slate-500 font-mono uppercase tracking-widest">Restante</span>
                      <span className="text-xs font-mono font-extrabold text-indigo-400">{activeRoute.kmRestantes}</span>
                    </div>
                  </div>
                  
                  {/* GPS status pill below indices */}
                  <div className="flex justify-between items-center mt-1.5 px-1.5 text-[8.5px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{locationText}</span>
                    </div>
                    <span className="text-amber-400 font-bold bg-slate-950/70 border border-slate-850 px-1.5 rounded">{pDisplay} Max: {truckProfile.alturaMaxima}m</span>
                  </div>
                </div>
              ) : (
                /* HUD EN VIVO DE SIMULADOR NAV NOM-012 INTERACTIVO */
                <div className="bg-slate-950/95 border-2 border-indigo-500/70 rounded-2xl p-3 shadow-2xl backdrop-blur animate-slideUp">
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-indigo-500/10">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[9px] font-black font-mono text-emerald-400 uppercase tracking-widest">Viaje Activo • Simulación</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button
                         type="button"
                         onClick={() => setUseVoiceSynthesis(!useVoiceSynthesis)}
                         className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono transition-colors ${useVoiceSynthesis ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/20' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}
                         title={useVoiceSynthesis ? "Apagar locución automática" : "Encender locución automática"}
                       >
                         {useVoiceSynthesis ? "🗣️ Voz ON" : "🔇 Voz OFF"}
                       </button>
                    </div>
                  </div>

                  {/* Telemetría Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-2 pb-2 border-b border-indigo-500/5">
                    {/* Velocímetro real tractocamión */}
                    <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-850 flex flex-col items-center">
                      <span className="text-[7px] text-slate-500 font-mono font-bold uppercase tracking-wider">Velocidad</span>
                      <div className="flex items-baseline gap-0.5 mt-0.5">
                        <span className="text-base font-black font-mono text-emerald-400 tracking-tighter">{simulatedSpeed}</span>
                        <span className="text-[8px] text-slate-500 font-bold">km/h</span>
                      </div>
                    </div>

                    {/* Km Recorridos / Checkpoint índice */}
                    <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-850 flex flex-col items-center">
                      <span className="text-[7px] text-slate-500 font-mono font-bold uppercase tracking-wider">Progreso</span>
                      <div className="flex items-baseline gap-0.5 mt-0.5">
                        <span className="text-sm font-black font-mono text-indigo-400">
                          {activeRoute.checkpoints[activeCheckpointIndex]?.km || 0}
                        </span>
                        <span className="text-[8px] text-slate-500 font-bold">km</span>
                      </div>
                    </div>

                    {/* Indicador de Gálibo de seguridad */}
                    <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-850 flex flex-col items-center">
                      <span className="text-[7px] text-slate-500 font-mono font-bold uppercase tracking-wider">Gálibo NOM</span>
                      <div className="flex items-baseline gap-0.5 mt-0.5">
                        <span className="text-sm font-black font-mono text-amber-400">{truckProfile.alturaMaxima}</span>
                        <span className="text-[8px] text-slate-500 font-bold">m</span>
                      </div>
                    </div>
                  </div>

                  {/* Detalle Checkpoint e instrucción actual */}
                  <div className="bg-slate-900/90 border border-slate-850 p-2 rounded-xl mb-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-black font-mono text-amber-400 uppercase tracking-widest">
                        Check {activeCheckpointIndex + 1} de {activeRoute.checkpoints.length}
                      </span>
                      {activeRoute.checkpoints[activeCheckpointIndex]?.alertaNom && (
                        <span className="text-[7.5px] font-black bg-red-950 text-red-500 border border-red-900 px-1.5 py-0.1 rounded uppercase">
                          ⚠️ {activeRoute.checkpoints[activeCheckpointIndex].alertaNom}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-200 leading-tight">
                      {activeRoute.checkpoints[activeCheckpointIndex]?.instruccion}
                    </p>
                  </div>

                  {/* Controles de Checkpoints */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const prevIdx = activeCheckpointIndex > 0 ? activeCheckpointIndex - 1 : activeRoute.checkpoints.length - 1;
                        setActiveCheckpointIndex(prevIdx);
                      }}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg text-[9px] font-bold font-mono border border-slate-800 active:scale-95 transition-all text-center flex-1"
                    >
                      ◀ Retroceder
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const nextIdx = activeCheckpointIndex < activeRoute.checkpoints.length - 1 ? activeCheckpointIndex + 1 : 0;
                        setActiveCheckpointIndex(nextIdx);
                      }}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black font-mono border border-indigo-500/20 active:scale-95 transition-all text-center flex-1"
                    >
                      Avanzar Tramo ▶
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. MAIN ERGONOMIC ACTION BUTTON - "INICIAR VIAJE" */}
            <div className="absolute bottom-[72px] inset-x-4 z-30 pointer-events-auto max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => {
                  if (isEnRuta) {
                    setIsEnRuta(false);
                  } else {
                    setShowLaunchModal(true);
                  }
                }}
                className={`w-full py-4 px-6 rounded-xl border font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl transition-all duration-300 transform active:scale-95 ${
                  isEnRuta
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/40 animate-pulse shadow-rose-900/30'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-emerald-400/40 shadow-emerald-500/20'
                }`}
              >
                <Compass className={`w-4 h-4 ${isEnRuta ? 'animate-spin' : ''}`} />
                <span>{isEnRuta ? '🛑 DETENER VIAJE EN CURSO' : '🟢 INICIAR VIAJE (GPS)'}</span>
              </button>
            </div>

            {/* 5. AI VOICE COPILOTO TRANSCRIPT (SLIDED FLOATING CARD UPON MIC ACTIVATION) */}
            {copilotoMensaje && (
              <div className="absolute top-[284px] inset-x-4 z-20 max-w-sm mx-auto animate-slideUp pointer-events-auto">
                <div className="bg-slate-900/95 border-l-4 border-indigo-500 rounded-xl p-3 shadow-2xl backdrop-blur">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-indigo-500/10">
                    <span className="text-[9px] font-bold text-indigo-300 flex items-center gap-1">
                      <Sparkles className="w-3 text-purple-400 animate-spin" />
                      Gemini Copiloto Vocal
                    </span>
                    <button onClick={() => setCopilotoMensaje(null)} className="text-slate-500 hover:text-white p-0.5" type="button">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-indigo-50 font-medium leading-relaxed italic">
                    &ldquo;{copilotoMensaje}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* MIC BUTTON IN LOWER RIGHT OF THE ROAD FOR INSTANT ACCESSIBILITY */}
            <div className="absolute bottom-[136px] right-4 z-25 pointer-events-auto">
              <button
                type="button"
                onClick={handleMicToggle}
                className={`p-3.5 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 active:scale-90 ${
                  copilotoActivo 
                    ? 'bg-red-600 text-white animate-bounce' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                }`}
                title="Copiloto de Voz Inteligente"
              >
                {copilotoActivo ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: COPILOTO VOICE AI TRANSCRIPT VIEW */}
        {activeTab === 'copiloto' && (
          <div className="flex-1 w-full bg-slate-950 p-4 pb-24 overflow-y-auto flex flex-col justify-between animate-fadeIn">
            <div>
              <div className="mb-4 text-center mt-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Copiloto Activo • Manos Libres</span>
                <h2 className="text-lg font-black text-white tracking-tight mt-1">Interacción Digital de Voz</h2>
              </div>

              {/* SoundWave visualizer representation */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center py-7 mb-4">
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
                  copilotoActivo ? 'bg-red-600 animate-ping' : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20'
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
            <div className="mb-4 pb-3 border-b border-slate-800">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest font-mono">NOM-012 CONFIG</span>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                <Truck className="w-5 h-5 text-amber-400" /> Mi Configuración
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">Configure las especificaciones de su tractocamión para el cálculo inteligente de gálibos y pesos NOM-012.</p>
            </div>

            {saveSuccess && (
              <div className="mb-4 bg-emerald-950/90 border border-emerald-500/50 rounded-xl p-3 text-emerald-300 flex items-center justify-between text-xs animate-fadeIn shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-extrabold text-white block">Perfil Guardado</span>
                    <span className="text-[10px] text-emerald-400 font-mono">NOM-012 calculada exitosamente</span>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-950 px-2 py-0.5 rounded font-mono font-bold text-emerald-300 border border-emerald-500/30">VÍA SEGURA</span>
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
                  className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-left text-white focus:outline-none focus:ring-1 focus:ring-amber-400/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold">{truckProfile.configuracionSict}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showSictDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSictDropdown && (
                  <div className="absolute top-16 left-0 right-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 overflow-hidden py-1 animate-slideUp">
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
                  <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
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
                  <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
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
                        className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          active
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-lg scale-102'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
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
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300">
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

      {/* DIÁLOGO SELECCIÓN DE INICIO DE VIAJE */}
      {showLaunchModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn pointer-events-auto">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-amber-400" />
            <div className="flex justify-between items-start pb-3 mb-4">
              <div>
                <span className="text-[9px] font-black font-mono text-emerald-400 uppercase tracking-widest block mb-0.5">Módulo de Despacho GPS</span>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Iniciar Viaje Inteligente</h3>
              </div>
              <button 
                onClick={() => setShowLaunchModal(false)} 
                className="text-slate-400 hover:text-white p-1 bg-slate-950 rounded-lg hover:bg-slate-850"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10.5px] text-slate-300 leading-relaxed mb-4">
              Debido a políticas de seguridad móvil, la navegación GPS interactiva directa está optimizada para la app de Google Maps original o para nuestro simulador interno asistido con gálibos NOM-012:
            </p>

            <div className="space-y-3">
              {/* Opción 1: Simulación de cabina asistida */}
              <button
                type="button"
                onClick={() => {
                  setIsEnRuta(true);
                  setActiveCheckpointIndex(0);
                  setShowLaunchModal(false);
                }}
                className="w-full text-left bg-slate-950/80 hover:bg-indigo-950/40 p-3.5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all flex items-start gap-3 cursor-pointer group"
              >
                <div className="p-2.5 bg-indigo-600/10 rounded-xl text-indigo-400 group-hover:bg-indigo-600/20">
                  <Compass className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <span className="text-[11.5px] font-extrabold text-white block">1. Asistente Virtual en App (Simulado)</span>
                  <span className="text-[9.5px] text-slate-400 leading-relaxed block mt-0.5">
                    Activa telemetría en vivo, velocímetro, voz de copiloto y monitoreo automático de dimensiones/asaltos kilómetro a kilómetro.
                  </span>
                </div>
              </button>

              {/* Opción 2: Google Maps Externo */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originCoordString)}&destination=${encodeURIComponent(activeRoute.queryParam)}&travelmode=driving`}
                onClick={() => setShowLaunchModal(false)}
                target="_blank"
                rel="noreferrer"
                className="w-full text-left bg-slate-950/80 hover:bg-amber-950/20 p-3.5 rounded-2xl border border-slate-800 hover:border-amber-400/40 transition-all flex items-start gap-4 cursor-pointer group"
              >
                <div className="p-2.5 bg-amber-400/10 rounded-xl text-amber-400 group-hover:bg-amber-400/20">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[11.5px] font-extrabold text-white block">2. Lanzar GPS en Google Maps NATIVO</span>
                  <span className="text-[9.5px] text-slate-400 leading-relaxed block mt-0.5">
                    Lanza tu ruta en la app nativa de Google Maps de tu teléfono celular para arrancar navegación paso a paso con GPS de conducción real.
                  </span>
                </div>
              </a>
            </div>

            <div className="mt-4 flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
              <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-slate-400 font-mono">
                Ruta seleccionada: <span className="text-white font-bold">{activeRoute.rutaFormato}</span> • {activeRoute.kmRestantes}
              </span>
            </div>
          </div>
        </div>
      )}

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
              El mapa oficial de Google requiere una clave API con la opción de <strong>Directions y Embed API habilitadas</strong>. Introduce tu propia API Key para persistirla en esta sesión:
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
      <nav id="mobile-navigation-fixed-bar" className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800/80 py-3 pb-5 flex justify-around items-center text-slate-400 backdrop-blur-md z-45 shadow-2xl shrink-0 pointer-events-auto">
        
        {/* TAB 1: MAPS */}
        <button
          id="tab-btn-map"
          onClick={() => setActiveTab('mapa')}
          className={`flex flex-col items-center gap-1 px-4 py-1 transition-all ${
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
          className={`flex flex-col items-center gap-1 px-4 py-1 transition-all ${
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
          className={`flex flex-col items-center gap-1 px-4 py-1 transition-all ${
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
