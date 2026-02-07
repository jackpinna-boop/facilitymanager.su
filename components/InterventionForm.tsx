
import React, { useState } from 'react';
import { 
  Intervento, 
  InterventoType, 
  AppState, 
  RupHistory
} from '../types';
import { 
  Plus, 
  Calendar, 
  User, 
  Info, 
  DollarSign, 
  Building2, 
  MapPin, 
  Search, 
  Loader2, 
  Navigation,
  Globe,
  Tag,
  FileText,
  Hash,
  ShieldCheck
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  initialData?: Intervento;
  preselectedTargetId?: string | null;
  suggestedUniqueCode?: string;
  state: AppState;
  onSubmit: (data: Intervento) => void;
  onCancel: () => void;
}

const InterventionForm: React.FC<Props> = ({ initialData, preselectedTargetId, suggestedUniqueCode, state, onSubmit, onCancel }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const getTargetType = (id: string): 'structure' | 'plesso' | 'pertinenza' | 'road' => {
    if (state.roads.some(r => r.id === id)) return 'road';
    if (state.structures.some(s => s.id === id)) return 'structure';
    if (state.structures.some(s => s.plessi.some(p => p.id === id))) return 'plesso';
    return 'pertinenza';
  };

  const [formData, setFormData] = useState<Intervento>(initialData || {
    id: crypto.randomUUID(),
    uniqueCode: suggestedUniqueCode || '',
    targetId: preselectedTargetId || '',
    targetType: preselectedTargetId ? getTargetType(preselectedTargetId) : 'structure',
    type: InterventoType.ORDINARIO,
    title: '',
    oggetto: '',
    description: '',
    cig: '',
    rupHistory: [],
    currentRup: '',
    amount: 0,
    dateExecution: '',
    dateDelivery: '',
    dateStart: '',
    dateEnd: '',
    dateTest: '',
    suspensions: [],
    extensions: [],
    createdAt: new Date().toISOString(),
    lat: 39.16, 
    lng: 8.52
  });

  const handleRupChange = (newName: string) => {
    if (newName !== formData.currentRup) {
      const newHistoryEntry: RupHistory = {
        id: crypto.randomUUID(),
        name: formData.currentRup || 'N/D',
        startDate: new Date().toISOString().split('T')[0]
      };
      setFormData(prev => ({
        ...prev,
        currentRup: newName,
        rupHistory: prev.currentRup ? [...prev.rupHistory, newHistoryEntry] : prev.rupHistory
      }));
    }
  };

  const openAnacData = () => {
    if (formData.cig) {
      window.open(`https://dati.anticorruzione.it/opencig/cig/${formData.cig}`, '_blank');
    }
  };

  const handleAddressSearch = async () => {
    if (!addressQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let userLocation = { latitude: 39.16, longitude: 8.52 }; 
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        userLocation = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch (e) {
        console.warn("Impossibile ottenere geolocalizzazione utente, uso default.");
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Trova le coordinate geografiche precise (Latitudine e Longitudine) per l'indirizzo seguente nella zona della Provincia: "${addressQuery}". Rispondi esclusivamente con un oggetto JSON nel formato: {"lat": numero, "lng": numero, "address": "indirizzo completo trovato"}`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: userLocation
            }
          }
        },
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        if (data.lat && data.lng) {
          setFormData(prev => ({
            ...prev,
            lat: data.lat,
            lng: data.lng
          }));
          setAddressQuery(data.address || addressQuery);
        } else {
          throw new Error("Coordinate non trovate nel risultato.");
        }
      } else {
        throw new Error("Formato risposta non valido.");
      }
    } catch (error: any) {
      console.error("Errore ricerca indirizzo:", error);
      if (error?.message?.includes("Requested entity was not found")) {
        setSearchError("Modello non trovato. Riconfigurazione API Key necessaria.");
        await window.aistudio.openSelectKey();
      } else {
        setSearchError("Impossibile trovare l'indirizzo. Verifica i dati o inserisci le coordinate manualmente.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-4xl mx-auto border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            {initialData ? 'Modifica Intervento' : 'Nuovo Procedimento'}
          </h2>
          <p className="text-sm text-slate-500 font-medium">Configurazione tecnica e amministrativa del CIG</p>
        </div>
        <button onClick={onCancel} className="bg-slate-50 text-slate-400 hover:text-slate-900 p-3 rounded-2xl transition-all font-bold">Chiudi</button>
      </div>

      <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
        {/* Identificativi Principali */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
             <Tag className="text-institutional-700" size={24} />
             <h3 className="text-lg font-black text-slate-800 tracking-tight">Dati Identificativi</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titolo Intervento</label>
              <input 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-bold shadow-sm transition-all"
                placeholder="es. Rifacimento manto stradale..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Hash size={12} /> Codice Univoco Sistema
              </label>
              <input 
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 text-sm font-black text-slate-500 outline-none cursor-not-allowed"
                value={formData.uniqueCode}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Oggetto del Procedimento (Formale)</label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-medium shadow-sm transition-all h-24"
              placeholder="Inserire l'oggetto formale come da bando o contratto..."
              value={formData.oggetto}
              onChange={(e) => setFormData(prev => ({ ...prev, oggetto: e.target.value }))}
              required
            />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={14} className="text-institutional-700" /> Asset Destinatario
            </label>
            <select 
              className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-bold shadow-sm transition-all"
              value={formData.targetId}
              onChange={(e) => {
                const id = e.target.value;
                const type = getTargetType(id);
                setFormData(prev => ({ ...prev, targetId: id, targetType: type }));
              }}
              required
            >
              <option value="">Seleziona Asset...</option>
              <optgroup label="RETE VIARIA PROVINCIALE">
                {state.roads.map(r => <option key={r.id} value={r.id}>{r.code} - {r.name}</option>)}
              </optgroup>
              {state.structures.map(s => (
                <optgroup label={`IMMOBILE: ${s.name}`} key={s.id}>
                  <option value={s.id}>{s.name} (Intera Struttura)</option>
                  {s.plessi.map(p => <option key={p.id} value={p.id}>-- PLESSO: {p.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Info size={14} className="text-institutional-700" /> Tipologia Procedimento
            </label>
            <select 
              className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-bold shadow-sm"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as InterventoType }))}
            >
              {Object.values(InterventoType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Codice CIG</label>
              {formData.cig && (
                <button 
                  type="button" 
                  onClick={openAnacData}
                  className="text-[9px] font-black text-institutional-700 hover:underline flex items-center gap-1 uppercase"
                >
                  <ShieldCheck size={10} /> Verifica ANAC
                </button>
              )}
            </div>
            <input 
              className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-bold shadow-sm"
              value={formData.cig}
              placeholder="Inserisci CIG Alpha-Numerico..."
              onChange={(e) => setFormData(prev => ({ ...prev, cig: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <DollarSign size={14} className="text-institutional-700" /> Importo di Contratto (€)
            </label>
            <input 
              type="number"
              className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-bold shadow-sm"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
            />
          </div>
        </section>

        {/* Geolocalizzazione */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
             <Globe className="text-institutional-700" size={24} />
             <h3 className="text-lg font-black text-slate-800 tracking-tight">Geolocalizzazione Area</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Search size={12} /> Cerca Indirizzo (tramite Google Maps)
              </label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-bold shadow-sm transition-all"
                  placeholder="es. Via Roma 1..."
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddressSearch())}
                />
                <button 
                  type="button"
                  onClick={handleAddressSearch}
                  disabled={isSearching || !addressQuery.trim()}
                  className="bg-slate-900 text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 shadow-lg shadow-slate-900/10"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
                  Trova
                </button>
              </div>
              {searchError && <p className="text-[10px] text-red-500 font-bold mt-1 px-1 italic">{searchError}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-institutional-50/20 p-6 rounded-[2rem] border border-institutional-100">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Coordinata Lat</label>
                <input 
                  type="number" 
                  step="0.000001" 
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-medium" 
                  value={formData.lat} 
                  onChange={(e) => setFormData(prev => ({ ...prev, lat: Number(e.target.value) }))} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Coordinata Lng</label>
                <input 
                  type="number" 
                  step="0.000001" 
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-medium" 
                  value={formData.lng} 
                  onChange={(e) => setFormData(prev => ({ ...prev, lng: Number(e.target.value) }))} 
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
             <User className="text-institutional-700" size={24} />
             <h3 className="text-lg font-black text-slate-800 tracking-tight">Responsabile Procedimento</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RUP in Carica</label>
              <input className="w-full bg-white border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-bold shadow-sm" value={formData.currentRup} placeholder="Inserire Nome e Cognome del RUP..." onBlur={(e) => handleRupChange(e.target.value)} onChange={(e) => setFormData(prev => ({ ...prev, currentRup: e.target.value }))} required />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
             <Calendar className="text-institutional-700" size={24} />
             <h3 className="text-lg font-black text-slate-800 tracking-tight">Cronoprogramma Temporale</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Consegna Lavori', field: 'dateDelivery' },
              { label: 'Inizio Lavori', field: 'dateStart' },
              { label: 'Fine Lavori Prevista', field: 'dateEnd' },
            ].map(d => (
              <div key={d.field} className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.label}</label>
                <input type="date" className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-bold shadow-sm" value={(formData as any)[d.field] || ''} onChange={(e) => setFormData(prev => ({ ...prev, [d.field]: e.target.value }))} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
             <FileText className="text-institutional-700" size={24} />
             <h3 className="text-lg font-black text-slate-800 tracking-tight">Note Tecniche</h3>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dettagli Aggiuntivi</label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-institutional-700 text-sm font-medium shadow-sm transition-all h-32"
              placeholder="Inserire eventuali note di cantiere, varianti o dettagli tecnici non inclusi nell'oggetto..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </section>

        <div className="pt-10 flex gap-4">
          <button type="submit" className="flex-1 bg-institutional-700 hover:bg-institutional-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-institutional-700/30 transition-all uppercase tracking-[0.2em] text-xs">
            Registra Intervento
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-xs">
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
};

export default InterventionForm;
