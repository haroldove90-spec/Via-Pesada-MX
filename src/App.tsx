import { useState } from 'react';
import RouteMapDemo from './components/RouteMapDemo';
import CopilotoVoiceDemo from './components/CopilotoVoiceDemo';
import CommunityFeedDemo from './components/CommunityFeedDemo';
import { 
  Map, 
  Mic, 
  Bell, 
  Wifi,
  Radio
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'mapa' | 'copiloto' | 'comunidad'>('comunidad');

  return (
    <div className="w-full h-screen bg-slate-900 md:bg-slate-950 flex items-center justify-center p-0 md:p-4 overflow-hidden select-none">
      <div 
        id="main-applet-app" 
        className="w-full md:max-w-[412px] h-full md:h-[94vh] md:max-h-[860px] bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden md:rounded-[44px] md:border-[10px] md:border-slate-900 md:shadow-[0_20px_50px_rgba(0,0,0,0.8)] md:ring-2 md:ring-slate-800/60 relative"
      >
        {/* NATIVE PHONE TOP NOTCH / SYSTEM STATUS BAR */}
        <div className="w-full bg-slate-950 flex justify-between items-center px-6 pt-3.5 pb-2 z-50 pointer-events-none sticky top-0 shrink-0">
          <span className="text-xs font-bold font-mono tracking-tighter text-slate-300">9:41 AM</span>
          
          {/* Dynamic Island Notch */}
          <div className="h-5 w-24 bg-slate-900 rounded-full border border-slate-800/80 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
            <span className="text-[8px] text-indigo-400 font-bold font-mono uppercase tracking-widest">Satelital</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-mono">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">5G</span>
          </div>
        </div>

        {/* CORE VIEWPORT CONTENT */}
        <main className="flex-1 w-full flex flex-col relative overflow-hidden">
          {activeTab === 'comunidad' ? (
            <div className="animate-fadeIn flex-1 flex flex-col h-full overflow-hidden">
              <CommunityFeedDemo onNavigate={(tab) => {
                if (tab === 'detector') return; // WhatsApp tab removed in basic native mobile layout
                setActiveTab(tab);
              }} />
            </div>
          ) : activeTab === 'mapa' ? (
            <div className="animate-fadeIn flex-1 flex flex-col h-full overflow-hidden pt-2 px-3 pb-24">
              {/* Native Inline Mini Title and Subheading */}
              <div className="mb-2 px-1 flex justify-between items-center shrink-0">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Ruta Activa • NOM-012</span>
                  <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">Control de Carretera</h2>
                </div>
                <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">VÍA_PESADA</span>
              </div>
              <RouteMapDemo />
            </div>
          ) : (
            <div className="animate-fadeIn flex-1 flex flex-col h-full overflow-hidden">
              <CopilotoVoiceDemo onBackToMap={() => setActiveTab('mapa')} />
            </div>
          )}
        </main>

        {/* LOCKED NATIVE BOTTOM NAVIGATION TAB BAR */}
        <nav id="mobile-navigation-absolute-bar" className="absolute bottom-0 left-0 right-0 bg-slate-900/98 border-t border-slate-800/80 py-3 pb-5 flex justify-around items-center text-slate-400 backdrop-blur-md z-40 shadow-2xl">
          
          {/* TAB 1: MAPS */}
          <button
            id="tab-btn-map"
            onClick={() => setActiveTab('mapa')}
            className={`flex flex-col items-center gap-1 px-4 py-1 transition-all cursor-pointer ${
              activeTab === 'mapa'
                ? 'text-amber-400 transform scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-5 h-5" />
            <span className="text-[9px] font-bold font-mono tracking-wider">MAPA</span>
          </button>

          {/* TAB 2: COPILOTO VOICE */}
          <button
            id="tab-btn-voice"
            onClick={() => setActiveTab('copiloto')}
            className={`flex flex-col items-center gap-1 px-4 py-1 transition-all cursor-pointer ${
              activeTab === 'copiloto'
                ? 'text-amber-400 transform scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span className="text-[9px] font-bold font-mono tracking-wider">COPILOTO</span>
          </button>

          {/* TAB 3: ALERTS FEED */}
          <button
            id="tab-btn-alerts"
            onClick={() => setActiveTab('comunidad')}
            className={`flex flex-col items-center gap-1 px-4 py-1 transition-all cursor-pointer ${
              activeTab === 'comunidad'
                ? 'text-amber-400 transform scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[9px] font-bold font-mono tracking-wider">ALERTAS</span>
          </button>

        </nav>
      </div>
    </div>
  );
}
