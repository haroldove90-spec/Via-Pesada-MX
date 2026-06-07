import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Mic, 
  MicOff, 
  VolumeX, 
  Volume2, 
  Settings, 
  Sparkles, 
  MessageSquare, 
  ShieldAlert, 
  Navigation, 
  Flame, 
  CheckCircle2, 
  Radio 
} from 'lucide-react';

interface Message {
  id: number;
  sender: 'chofer' | 'gemini';
  text: string;
  time: string;
}

export default function CopilotoVoiceDemo({ onBackToMap }: { onBackToMap?: () => void }) {
  const [isListening, setIsListening] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [waveHeight, setWaveHeight] = useState<number[]>([4, 12, 8, 24, 16, 28, 14, 32, 10, 20]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'chofer',
      text: "¿El parador de San Luis Potosí tiene espacio para fulles y es seguro ahorita?",
      time: "21:02"
    },
    {
      id: 2,
      sender: 'gemini',
      text: "Afirmativo operador. El parador 'El Potosino' en el km 57 tiene espacio libre para doble remolque y cuenta con resguardo de la Guardia Nacional. El tramo siguiente está despejado.",
      time: "21:03"
    }
  ]);
  
  const [inputText, setInputText] = useState("");

  // Animate the audio wave levels when listening
  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      setWaveHeight(prev => prev.map(() => Math.floor(Math.random() * 28) + 6));
    }, 120);
    return () => clearInterval(interval);
  }, [isListening]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMsg: Message = {
      id: Date.now(),
      sender: 'chofer',
      text: inputText,
      time: "21:04"
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setIsListening(true);

    // Simulate smart Gemini responses
    setTimeout(() => {
      let responseText = "Entendido, estoy consultando las bitácoras SCT en tiempo real. La ruta de conexión no reporta restricciones activas.";
      
      const query = inputText.toLowerCase();
      if (query.includes('caseta') || query.includes('pago')) {
        responseText = "La caseta de Palmillas opera con flujo continuo pero con báscula de peso SCT activa. Tarifa aproximada para camión articulado es de $345 MXN.";
      } else if (query.includes('clima') || query.includes('neblina') || query.includes('lluvia')) {
        responseText = "Se reporta neblina ligera descendiendo Río Frío en autopista México-Puebla. Recomiendo activar luces auxiliares y regular velocidad a 60 km/h.";
      } else if (query.includes('peson') || query.includes('rom-012') || query.includes('dimension')) {
        responseText = "Recuerda cumplir estrictamente con los límites de la NOM-012. Los retenes federales están aplicando multas severas hoy en la libre a Monterrey.";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'gemini',
        text: responseText,
        time: "21:04"
      }]);
    }, 2000);
  };

  return (
    <div id="phone-simulation-mockup" className="relative max-w-[390px] h-[780px] bg-slate-950 rounded-[46px] border-[10px] border-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden mx-auto font-sans p-5 text-white ring-4 ring-indigo-500/10">
      
      {/* PHONE STATUS HEADER & DYNAMIC ISLAND MOCKUP */}
      <div className="absolute top-0 inset-x-0 h-9 bg-slate-950 flex justify-between items-center px-8 z-30 pointer-events-none">
        <span className="text-[11px] font-semibold font-mono tracking-tighter text-slate-400">9:41 AM</span>
        {/* Dynamic Island / Notch */}
        <div className="h-5 w-24 bg-slate-900 rounded-full border border-slate-800/50 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#101014] mr-2"></div>
          <div className="w-3.5 h-1 rounded-full bg-indigo-500/40"></div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs text-[11px]">
          <span>LTE</span>
          <span className="w-5 h-2.5 border border-slate-500 rounded-xs flex items-center p-0.5"><span className="h-full w-4 bg-emerald-400 rounded-2xs"></span></span>
        </div>
      </div>

      {/* TOP COMPONENT APP BAR */}
      <div className="mt-6 flex items-center justify-between border-b border-slate-900 pb-3">
        {onBackToMap ? (
          <button 
            onClick={onBackToMap}
            className="flex items-center gap-1 text-xs text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
        ) : (
          <span className="text-xs text-slate-500 font-bold font-mono">VÍA_PESADA_OS</span>
        )}

        <div className="flex items-center gap-1 bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-[10px] font-bold text-slate-300 font-mono">COPILOTO ACTIVO</span>
        </div>

        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* CENTRAL AREA: AUDIO PULSING WAVES (GEMINI LIVE FEEL) */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        
        {/* Animated concentric rings */}
        <div className="relative flex items-center justify-center w-48 h-48 mb-6">
          <div className={`absolute inset-0 rounded-full bg-indigo-500/5 border border-indigo-500/10 transition-all duration-1000 ${
            isListening ? 'animate-ping scale-110' : 'scale-90'
          }`}></div>
          <div className={`absolute inset-4 rounded-full bg-purple-500/5 border border-purple-500/10 transition-all duration-700 ${
            isListening ? 'animate-ping' : 'scale-90'
          }`}></div>
          
          {/* Main glowing orb */}
          <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-950 to-slate-900 border-2 border-indigo-500/40 flex flex-col items-center justify-center shadow-2xl transition-transform ${
            isListening ? 'scale-105 shadow-indigo-500/20' : 'scale-100'
          }`}>
            <Sparkles className={`w-10 h-10 transition-all ${
              isListening ? 'text-indigo-400 animate-pulse' : 'text-slate-500'
            }`} />
            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold mt-1.5 uppercase">
              {isListening ? "Escuchando" : "Modo En Espera"}
            </span>
          </div>
        </div>

        {/* Audio frequency wave visualizer spikes */}
        <div className="flex items-end justify-center gap-1.5 h-12 w-full px-8">
          {waveHeight.map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-100 ${
                isListening 
                  ? 'bg-gradient-to-t from-indigo-500 to-purple-400' 
                  : 'bg-slate-800'
              }`}
              style={{ height: isListening ? `${h}px` : '4px' }}
            ></div>
          ))}
        </div>
      </div>

      {/* CHAT TRANSCRIPTION & DIAOLG TIMELINE */}
      <div className="h-56 flex flex-col bg-[#0b0e14]/90 border border-slate-900 rounded-3xl p-3 overflow-hidden shadow-inner">
        <div className="flex items-center gap-1 bg-[#13171f] px-2.5 py-1.5 rounded-xl border border-slate-800 mb-2">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Transcripción del Viaje</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-slate-900 text-xs">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'chofer' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  {m.sender === 'chofer' ? 'Tú (Operador)' : 'VíaPesada IA'}
                </span>
                <span className="text-[8px] text-slate-600 font-mono">{m.time}</span>
              </div>
              <p className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                m.sender === 'chofer'
                  ? 'bg-indigo-600/25 text-indigo-100 rounded-tr-none border border-indigo-500/20'
                  : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'
              }`}>
                {m.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK INQUIRY INPUT PRESETS BOX */}
      <div className="mt-3">
        <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
          <button 
            onClick={() => setInputText("¿Cómo está la báscula en Palmillas?")}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-full shrink-0 font-medium"
          >
            📋 Básula Palmillas
          </button>
          <button 
            onClick={() => setInputText("¿Hay neblina en Río Frío?")}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-full shrink-0 font-medium"
          >
            🌫️ Clima Río Frío
          </button>
          <button 
            onClick={() => setInputText("¿Cuáles son los límites NOM-012?")}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-full shrink-0 font-medium"
          >
            ⚖️ NOM-012
          </button>
        </div>
        
        {/* Real-time typing message field */}
        <div className="flex items-center gap-2 mt-1">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe o presiona el botón inferior..."
            className="flex-1 bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl focus:border-indigo-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            onClick={handleSendMessage}
            className="bg-indigo-600 text-white rounded-xl px-2.5 py-1.5 text-xs font-bold hover:bg-indigo-700 cursor-pointer"
          >
            Enviar
          </button>
        </div>
      </div>

      {/* BOTTOM CONTROLS OR BAR WITH MIC */}
      <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between">
        
        {/* Toggle Mute Status */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 rounded-full border transition-all ${
            isMuted 
              ? 'bg-rose-950/40 border-rose-900/50 text-rose-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Silenciar Copiloto"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* GIANT CENTER MIC BUTTON */}
        <button
          onClick={() => setIsListening(!isListening)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer ${
            isListening 
              ? 'bg-indigo-600 shadow-indigo-600/30 text-white ring-4 ring-indigo-500/15' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700/80 ring-2 ring-slate-700/20'
          }`}
          title="Hablar con Gemini IA"
        >
          {isListening ? <Mic className="w-6 h-6 animate-pulse" /> : <MicOff className="w-6 h-6" />}
        </button>

        {/* Configurations secondary option */}
        <button 
          className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          title="Parámetros de cabina"
        >
          <Settings className="w-4 h-4" />
        </button>

      </div>

      {/* Safe NOM-012 & UTC metadata */}
      <div className="text-center text-[10px] text-slate-600 mt-2 font-mono">
        Ruta Segura Verificada NOM-012 • 2026 UTC
      </div>

    </div>
  );
}
