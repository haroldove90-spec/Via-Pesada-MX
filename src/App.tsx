import { useState } from 'react';
import { REPORTES_INICIALES } from './data';
import { ReporteCarretera, AlertaTipo, RiesgoNivel } from './types';
import { AlertCard } from './components/AlertCard';
import { JsonViewer } from './components/JsonViewer';
import { ParserSandbox } from './components/ParserSandbox';
import RouteMapDemo from './components/RouteMapDemo';
import CopilotoVoiceDemo from './components/CopilotoVoiceDemo';
import CommunityFeedDemo from './components/CommunityFeedDemo';
import { 
  Plus, 
  Search, 
  Trash2, 
  FileJson, 
  MapPin, 
  ArrowRight,
  ShieldAlert,
  Car,
  Scale,
  Ban,
  Info,
  MessageSquareCode,
  Map,
  Mic,
  Users
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'detector' | 'mapa' | 'copiloto' | 'comunidad'>('comunidad'); // default to community feed to showcase!
  const [reportes, setReportes] = useState<ReporteCarretera[]>(REPORTES_INICIALES);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(REPORTES_INICIALES[0].id);
  
  // Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<AlertaTipo | 'todos'>('todos');
  const [filterRiesgo, setFilterRiesgo] = useState<RiesgoNivel | 'todos'>('todos');

  // Find currently selected report object
  const currentReportObj = reportes.find(r => r.id === selectedReportId) || null;

  // Handle adding a new report (from sandbox)
  const handleAddReporte = (nuevo: ReporteCarretera) => {
    setReportes(prev => [nuevo, ...prev]);
    setSelectedReportId(nuevo.id); // Auto-focus on the newly created report
  };

  // Handle deletion of an alert
  const handleDeleteReporte = (id: number) => {
    setReportes(prev => {
      const filtered = prev.filter(r => r.id !== id);
      // Auto-assign new select ID if currently chosen was deleted
      if (selectedReportId === id) {
        setSelectedReportId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  // Filter computation
  const filteredReportes = reportes.filter(r => {
    const matchesSearch = r.carretera.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.descripcion_corta.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.raw_message && r.raw_message.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTipo = filterTipo === 'todos' || r.tipo_alerta === filterTipo;
    const matchesRiesgo = filterRiesgo === 'todos' || r.nivel_riesgo === filterRiesgo;

    return matchesSearch && matchesTipo && matchesRiesgo;
  });

  return (
    <div id="main-applet-app" className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-12">
      
      {/* Top Header Banner */}
      <header className="bg-slate-900 text-white py-6 px-4 sm:px-6 md:px-8 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest font-mono text-slate-400 font-bold">VíaPesada MX • Demostración de Telemetría</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Plataforma de Navegación de Carga
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Detección de alertas por IA y simulación de copiloto satelital. Una interfaz optimizada para operadores de quinta rueda y monitores logísticos.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex flex-wrap items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1">
            <button
              id="switch-to-comunidad-tab"
              onClick={() => setActiveTab('comunidad')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'comunidad'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Alertas Comunidad</span>
            </button>

            <button
              id="switch-to-map-tab"
              onClick={() => setActiveTab('mapa')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mapa'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Mapa en Vivo</span>
            </button>

            <button
              id="switch-to-copiloto-tab"
              onClick={() => setActiveTab('copiloto')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'copiloto'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-4.5 h-4.5" />
              <span>Copiloto de Voz Gemini</span>
            </button>

            <button
              id="switch-to-detector-tab"
              onClick={() => setActiveTab('detector')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'detector'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquareCode className="w-4.5 h-4.5" />
              <span>Analizador WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        
        {activeTab === 'comunidad' ? (
          <div className="animate-fadeIn py-2">
            {/* Displaying Screen 4: Immersive Community Alerts mobile feed */}
            <div className="mb-4 bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs max-w-lg mx-auto">
              <div className="text-xs sm:text-sm text-slate-600">
                📢 <strong className="text-slate-800">Radars de Comunidad:</strong> Reportes unificados mediante procesamiento por Inteligencia Artificial y confirmación satelital.
              </div>
              <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded font-mono">EN VIVO MX</span>
            </div>
            <CommunityFeedDemo onNavigate={(tab) => setActiveTab(tab)} />
          </div>
        ) : activeTab === 'mapa' ? (
          <div className="animate-fadeIn">
            {/* Displaying Screen 2: Real-time map with simulation & Voice Copilot */}
            <div className="mb-4 bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="text-xs sm:text-sm text-slate-600">
                📌 <strong className="text-slate-800">Demo Interactiva:</strong> Explora el mapa de carreteras viales. Puedes dar clic a los pines de alerta (<i>Matehuala, Palmillas, Puebla</i>) o interactuar con el micrófono del <b>Copiloto IA</b> en la esquina inferior derecha.
              </div>
              <div className="text-[11px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold border border-indigo-100 shrink-0">
                NOM-012 Regulación SCT
              </div>
            </div>
            
            <RouteMapDemo />
          </div>
        ) : activeTab === 'copiloto' ? (
          <div className="animate-fadeIn py-2">
            {/* Displaying Screen 3: Immersive Dynamic Phone Copilot demo */}
            <div className="mb-4 bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs max-w-lg mx-auto">
              <div className="text-xs sm:text-sm text-slate-600">
                🎙️ <strong className="text-slate-800">Modo Copiloto Satelital:</strong> Simulación móvil optimizada para cabina de camión operado con una sola mano. Habla directamente con Gemini Live.
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded font-mono">NOM-012</span>
            </div>
            <CopilotoVoiceDemo onBackToMap={() => setActiveTab('mapa')} />
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* Interactive Sandbox for Raw Message Inputs */}
            <section className="mb-6">
              <ParserSandbox onAddReporte={handleAddReporte} />
            </section>

            {/* Filters Controls Box */}
            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="search-road-input"
                    type="text"
                    placeholder="Buscar por carretera o palabras clave..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
                  />
                </div>

                {/* Filter by Category */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Filtro Tipo:</span>
                  <button
                    id="filter-tipo-todos-btn"
                    onClick={() => setFilterTipo('todos')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                      filterTipo === 'todos' 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos ({reportes.length})
                  </button>
                  {(['seguridad', 'accidente', 'reten', 'bloqueo'] as AlertaTipo[]).map(t => (
                    <button
                      id={`filter-tipo-${t}-btn`}
                      key={t}
                      onClick={() => setFilterTipo(t)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors capitalize ${
                        filterTipo === t 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t} ({reportes.filter(r => r.tipo_alerta === t).length})
                    </button>
                  ))}
                </div>

                {/* Filter by Risk Level */}
                <div className="flex items-center gap-2">
                  <label htmlFor="risk-select" className="text-xs font-semibold text-slate-400 uppercase shrink-0">Riesgo:</label>
                  <select
                    id="risk-select"
                    value={filterRiesgo}
                    onChange={(e) => setFilterRiesgo(e.target.value as RiesgoNivel | 'todos')}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="todos">Cualquiera</option>
                    <option value="alto">Alto</option>
                    <option value="medio">Medio</option>
                    <option value="bajo">Bajo</option>
                  </select>
                </div>

              </div>
            </section>

            {/* Dashboard grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* LEFT PANEL: Alerts feed Column */}
              <div id="alerts-feed-column" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    Feed de Carreteras Estandarizado
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
                      {filteredReportes.length} de {reportes.length}
                    </span>
                  </h2>
                  
                  {/* Reset filter shortcut */}
                  {(searchTerm !== "" || filterTipo !== 'todos' || filterRiesgo !== 'todos') && (
                    <button 
                      onClick={() => {
                        setSearchTerm("");
                        setFilterTipo('todos');
                        setFilterRiesgo('todos');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Limpiar Filtros
                    </button>
                  )}
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                  {filteredReportes.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-100 text-slate-400">
                      <p className="text-sm font-medium">No se encontraron incidentes con los filtros aplicados.</p>
                      <p className="text-xs mt-1">Busca otro nombre de carretera o agrega un nuevo incidente arriba.</p>
                    </div>
                  ) : (
                    filteredReportes.map(r => (
                      <AlertCard
                        key={r.id}
                        reporte={r}
                        isSelected={selectedReportId === r.id}
                        onSelect={() => setSelectedReportId(r.id)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT PANEL: Details Inspect Sheet + JSON Code Viewer */}
              <div id="inspector-column" className="space-y-6">
                
                {/* Expanded Detailed Card Info */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <FileJson className="w-5 h-5 text-indigo-600" />
                      Inspector de Registro Estandarizado
                    </h3>
                    
                    {/* Deletable if not part of the initial list */}
                    {currentReportObj && (
                      <button
                        id="delete-alert-button"
                        onClick={() => handleDeleteReporte(currentReportObj.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar reporte de la lista"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>

                  {currentReportObj ? (
                    <div>
                      {/* Visual Blueprint Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                        
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-0.5">Tipo Alerta</span>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1 capitalize">
                            {currentReportObj.tipo_alerta === 'seguridad' && <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                            {currentReportObj.tipo_alerta === 'accidente' && <Car className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                            {currentReportObj.tipo_alerta === 'reten' && <Scale className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                            {currentReportObj.tipo_alerta === 'bloqueo' && <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                            {currentReportObj.tipo_alerta}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-0.5">Kilómetro</span>
                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {currentReportObj.kilometro !== null ? currentReportObj.kilometro : 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-0.5">Sentido</span>
                          <span className="text-xs font-bold text-slate-800 truncate block">{currentReportObj.sentido}</span>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-0.5">Severidad</span>
                          <span className="text-xs font-bold block">
                            {currentReportObj.nivel_riesgo === 'alto' && <span className="text-red-600">Riesgo Alto</span>}
                            {currentReportObj.nivel_riesgo === 'medio' && <span className="text-amber-600">Riesgo Medio</span>}
                            {currentReportObj.nivel_riesgo === 'bajo' && <span className="text-emerald-600">Riesgo Bajo</span>}
                          </span>
                        </div>

                      </div>

                      {/* Fact Sheet Rows */}
                      <div className="space-y-3 font-sans pb-4 border-b border-slate-100">
                        <div>
                          <span className="block text-xs text-slate-400 font-semibold uppercase">Carretera / Ruta:</span>
                          <p className="text-sm font-bold text-slate-800 mt-0.5">{currentReportObj.carretera}</p>
                        </div>

                        <div>
                          <span className="block text-xs text-slate-400 font-semibold uppercase">Resumen de Incidente:</span>
                          <p className="text-sm text-slate-700 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200">
                            {currentReportObj.descripcion_corta}
                          </p>
                        </div>

                        {currentReportObj.raw_message && (
                          <div>
                            <span className="block text-xs text-slate-400 font-semibold uppercase">Mensaje Original de WhatsApp:</span>
                            <div className="text-xs font-mono bg-amber-50/60 border border-amber-100/80 p-3 rounded-lg text-slate-600 italic mt-1 leading-relaxed">
                              &ldquo;{currentReportObj.raw_message}&rdquo;
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dispatch workflow tips */}
                      <div className="mt-4 flex gap-2 p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800">
                        <Info className="w-4 text-indigo-500 shrink-0" />
                        <span>Este incidente ha sido estructurado en base a las coordenadas semánticas y la logística de carreteras nacionales en México. Puede copiar el bloque JSON generado a su ERP o enviarlo a cabina.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      Selecciona una alerta del catálogo a la izquierda para inspeccionar sus detalles específicos.
                    </div>
                  )}
                </div>

                {/* Code outputs block */}
                <section>
                  <JsonViewer
                    currentReport={currentReportObj}
                    allReports={reportes}
                  />
                </section>

              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
