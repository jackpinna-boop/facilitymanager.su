
import React, { useState, useMemo } from 'react';
import { AppState, Intervento, Road, MainStructure } from '../types';
import { MapPin, Navigation, Info, ExternalLink, Search, Filter, Layers, Crosshair, Map as MapIcon, FileText, ChevronRight, Building2, ClipboardList, Wallet } from 'lucide-react';

interface Props {
  state: AppState;
  onViewIntervention: (id: string) => void;
}

const MapSection: React.FC<Props> = ({ state, onViewIntervention }) => {
  const [viewMode, setViewMode] = useState<'interventions' | 'buildings' | 'roads'>('interventions');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [focusedLocation, setFocusedLocation] = useState<{lat: number, lng: number, zoom: number}>({
    lat: 39.15, 
    lng: 8.52,
    zoom: 10
  });

  const filteredInterventions = useMemo(() => {
    return state.interventi.filter(i => i.lat && i.lng);
  }, [state.interventi]);

  const localizableStructures = useMemo(() => {
    return state.structures.filter(s => s.lat && s.lng);
  }, [state.structures]);

  const localizableRoads = useMemo(() => {
    return state.roads.filter(r => r.lat && r.lng).map(road => {
      const roadInterventions = state.interventi.filter(i => i.targetId === road.id);
      const totalAmount = roadInterventions.reduce((sum, i) => sum + i.amount, 0);
      return {
        ...road,
        interventionsCount: roadInterventions.length,
        maintenanceValue: totalAmount
      };
    });
  }, [state.roads, state.interventi]);

  const handleFocus = (lat: number, lng: number, id: string) => {
    setFocusedLocation({
      lat,
      lng,
      zoom: 16 
    });
    setSelectedAssetId(id);
  };

  const resetMap = () => {
    setFocusedLocation({
      lat: 39.15,
      lng: 8.52,
      zoom: 10
    });
    setSelectedAssetId(null);
  };

  const mapUrl = useMemo(() => {
    return `https://www.google.com/maps?q=${focusedLocation.lat},${focusedLocation.lng}&z=${focusedLocation.zoom}&output=embed&t=m`;
  }, [focusedLocation]);

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-6 animate-in fade-in duration-500">
      {/* Sidebar Filtri e Lista */}
      <div className="w-96 flex flex-col gap-4 shrink-0">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight">
              <Layers size={20} className="text-institutional-700" /> Analisi Mappa
            </h3>
            <button 
              onClick={resetMap} 
              className="text-[10px] font-black text-slate-400 hover:text-institutional-700 uppercase tracking-widest transition-colors"
            >
              Reset
            </button>
          </div>
          
          {/* Selettore Modalità */}
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => { setViewMode('interventions'); resetMap(); }}
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${viewMode === 'interventions' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500'}`}
            >
              <ClipboardList size={14} /> Interventi
            </button>
            <button 
              onClick={() => { setViewMode('buildings'); resetMap(); }}
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${viewMode === 'buildings' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500'}`}
            >
              <Building2 size={14} /> Immobili
            </button>
            <button 
              onClick={() => { setViewMode('roads'); resetMap(); }}
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${viewMode === 'roads' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500'}`}
            >
              <MapIcon size={14} /> Strade
            </button>
          </div>
        </div>

        <div className="bg-white flex-1 p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-institutional-700" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {viewMode === 'interventions' ? `Interventi (${filteredInterventions.length})` : 
                 viewMode === 'buildings' ? `Asset Immobiliari (${localizableStructures.length})` : 
                 `Rete Viaria (${localizableRoads.length})`}
              </h4>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {viewMode === 'interventions' && (
              filteredInterventions.map(i => (
                <div 
                  key={i.id} 
                  className={`group cursor-pointer rounded-2xl border transition-all duration-300 ${
                    selectedAssetId === i.id 
                      ? 'bg-amber-50 border-amber-200 shadow-md ring-1 ring-amber-200' 
                      : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
                  }`}
                  onClick={() => handleFocus(i.lat!, i.lng!, i.id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        selectedAssetId === i.id ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        CIG {i.cig}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onViewIntervention(i.id); }}
                        className="p-1.5 bg-white text-slate-400 hover:text-institutional-700 hover:shadow-md rounded-xl border border-slate-100 transition-all"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                    <h5 className="text-sm font-black text-slate-900 leading-tight mb-1">{i.title || 'Senza Titolo'}</h5>
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <Crosshair size={12} className="text-amber-500" /> Cantiere Attivo
                    </div>
                  </div>
                </div>
              ))
            )}

            {viewMode === 'buildings' && (
              localizableStructures.map(s => (
                <div 
                  key={s.id} 
                  className={`group cursor-pointer rounded-2xl border transition-all duration-300 ${
                    selectedAssetId === s.id 
                      ? 'bg-institutional-50 border-institutional-200 shadow-md ring-1 ring-institutional-200' 
                      : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
                  }`}
                  onClick={() => handleFocus(s.lat!, s.lng!, s.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-institutional-700">
                        <Building2 size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h5 className="text-sm font-black text-slate-900 leading-tight truncate">{s.name}</h5>
                         <p className="text-[10px] text-slate-400 truncate font-bold uppercase">{s.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                       <div className="text-[10px] font-black text-institutional-700 uppercase tracking-tighter flex items-center gap-1">
                        <Crosshair size={12} /> Localizza
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{s.plessi.length} Plessi</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {viewMode === 'roads' && (
              localizableRoads.map(r => (
                <div 
                  key={r.id} 
                  className={`group cursor-pointer rounded-2xl border transition-all duration-300 ${
                    selectedAssetId === r.id 
                      ? 'bg-indigo-50 border-indigo-200 shadow-md ring-1 ring-indigo-200' 
                      : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
                  }`}
                  onClick={() => handleFocus(r.lat!, r.lng!, r.id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{r.code}</div>
                        <h5 className="text-sm font-black text-slate-900 truncate max-w-[140px]">{r.name}</h5>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-indigo-600">{r.interventionsCount} INT.</p>
                      </div>
                    </div>
                    <div className="bg-white/50 p-2 rounded-xl mb-3 border border-slate-100">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                         <Wallet size={12} className="text-indigo-500" /> € {r.maintenanceValue.toLocaleString()}
                       </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                       <div className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter flex items-center gap-1">
                        <Crosshair size={12} /> Centra Tratto
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{r.lengthKm} Km</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {((viewMode === 'interventions' && filteredInterventions.length === 0) || 
              (viewMode === 'buildings' && localizableStructures.length === 0) ||
              (viewMode === 'roads' && localizableRoads.length === 0)) && (
              <div className="py-20 text-center">
                <MapIcon size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nessun elemento localizzato trovato</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Viewport Mappa */}
      <div className="flex-1 bg-slate-200 rounded-[2.5rem] shadow-inner border-[6px] border-white relative overflow-hidden group shadow-2xl">
        <iframe 
          src={mapUrl} 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        
        {/* Overlay Info Mappa */}
        <div className="absolute bottom-8 left-8 z-10">
          <div className="bg-slate-900/95 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-2xl text-white">
             <div className="flex items-center gap-3 mb-1">
               <div className="w-2.5 h-2.5 rounded-full bg-institutional-500 animate-pulse"></div>
               <h2 className="text-base font-black tracking-tight uppercase">Live Mapping Provincia</h2>
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
               {viewMode === 'interventions' ? 'Registro Interventi Manutentivi' : 
                viewMode === 'buildings' ? 'Censimento Patrimonio Immobiliare' : 
                'Monitoraggio Rete Viaria Provinciale'}
             </p>
          </div>
        </div>

        <div className="absolute top-8 right-8 z-10">
           <a 
             href={`https://www.google.com/maps/search/?api=1&query=${focusedLocation.lat},${focusedLocation.lng}`} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="bg-white hover:bg-slate-50 text-slate-900 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-black transition-all hover:scale-105 border border-slate-100 uppercase tracking-widest"
           >
             <ExternalLink size={18} className="text-institutional-700" /> 
             Google Maps
           </a>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
