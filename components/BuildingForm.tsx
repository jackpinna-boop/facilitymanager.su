
import React, { useState, useEffect } from 'react';
import { MainStructure, TechnicalData, FloorPlan } from '../types';
import { Building2, X, Save, MapPin, Search, Loader2, Navigation, Globe, Settings2, Ruler, Zap, FlameKindling, FileText, Plus, Trash2, ShieldCheck, Hash, Wallet, History } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onSave: (building: MainStructure) => void;
  onCancel: () => void;
  initialData?: MainStructure | null;
  suggestedUniqueCode?: string;
}

const BuildingForm: React.FC<Props> = ({ onSave, onCancel, initialData, suggestedUniqueCode }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    description: initialData?.description || '',
    costCenter: initialData?.costCenter || '',
    uniqueCode: initialData?.uniqueCode || suggestedUniqueCode || `IMM_000001`,
    lat: initialData?.lat || 39.16,
    lng: initialData?.lng || 8.52,
    previousNames: initialData?.previousNames || []
  });

  const [newNameHistory, setNewNameHistory] = useState('');

  const [techData, setTechData] = useState<TechnicalData>(initialData?.technicalData || {
    surfaceArea: 0,
    volume: 0,
    floors: 1,
    heatingSystem: '',
    electricalSystem: '',
    waterSystem: '',
    fireSafetyStatus: '',
    floorPlans: []
  });

  const handleAddressSearch = async () => {
    if (!formData.address.trim()) return;
    
    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: `Trova le coordinate precise per questo indirizzo: "${formData.address}". Rispondi JSON: {"lat": numero, "lng": numero, "address": "formato corretto"}`,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        setFormData(prev => ({
          ...prev,
          lat: data.lat,
          lng: data.lng,
          address: data.address || prev.address
        }));
      }
    } catch (error: any) {
      console.error("Errore geocoding:", error);
      if (error?.message?.includes("Requested entity was not found")) {
        alert("Errore di configurazione API: Il modello richiesto non è stato trovato nel tuo progetto. Seleziona una API Key valida per un progetto con permessi attivi.");
        await window.aistudio.openSelectKey();
      } else {
        alert("Errore durante la ricerca dell'indirizzo. Verifica la connessione.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPlans: FloorPlan[] = Array.from(files).map((f: File) => ({
        id: crypto.randomUUID(),
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type
      }));
      setTechData(prev => ({
        ...prev,
        floorPlans: [...prev.floorPlans, ...newPlans]
      }));
    }
  };

  const removePlan = (id: string) => {
    setTechData(prev => ({
      ...prev,
      floorPlans: prev.floorPlans.filter(p => p.id !== id)
    }));
  };

  const addNameHistory = () => {
    if (newNameHistory.trim() && !formData.previousNames.includes(newNameHistory.trim())) {
      setFormData(prev => ({
        ...prev,
        previousNames: [...prev.previousNames, newNameHistory.trim()]
      }));
      setNewNameHistory('');
    }
  };

  const removeNameHistory = (name: string) => {
    setFormData(prev => ({
      ...prev,
      previousNames: prev.previousNames.filter(n => n !== name)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBuilding: MainStructure = {
      id: initialData?.id || `struct-${crypto.randomUUID()}`,
      ...formData,
      technicalData: techData,
      plessi: initialData?.plessi || []
    };
    onSave(newBuilding);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              <Building2 size={24} className="text-institutional-700" /> {initialData ? 'Modifica Immobile' : 'Censimento Immobile'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Aggiornamento dati patrimonio</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Codice Univoco</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  readOnly
                  className="w-full p-3 pl-10 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 outline-none cursor-not-allowed"
                  value={formData.uniqueCode}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Centro di Costo</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  className="w-full p-3 pl-10 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-institutional-700 outline-none"
                  placeholder="es. CdC-001"
                  value={formData.costCenter}
                  onChange={e => setFormData({...formData, costCenter: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Identificativo Asset</label>
            <input 
              required
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-institutional-700 outline-none transition-all"
              placeholder="es. Sede Centrale, Palazzo del Comune..."
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* Gestione Storico Nomi */}
          <div className="space-y-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
            <label className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
              <History size={14} /> Storico Denominazioni Precedenti
            </label>
            <div className="flex gap-2">
              <input 
                type="text"
                className="flex-1 p-2.5 bg-white border border-amber-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Aggiungi nome storico..."
                value={newNameHistory}
                onChange={e => setNewNameHistory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNameHistory())}
              />
              <button 
                type="button"
                onClick={addNameHistory}
                className="bg-amber-600 text-white px-4 rounded-xl hover:bg-amber-700 transition-all font-black text-[10px] uppercase"
              >
                Aggiungi
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.previousNames.map(name => (
                <div key={name} className="bg-white border border-amber-200 px-3 py-1 rounded-lg flex items-center gap-2 shadow-sm">
                  <span className="text-[10px] font-bold text-amber-900">{name}</span>
                  <button type="button" onClick={() => removeNameHistory(name)} className="text-amber-400 hover:text-red-500">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicazione (Indirizzo)</label>
            <div className="flex gap-2">
              <input 
                required
                className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-institutional-700 outline-none transition-all"
                placeholder="Via, Piazza, Numero civico..."
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
              <button 
                type="button"
                onClick={handleAddressSearch}
                className="bg-slate-900 text-white px-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center"
              >
                {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-institutional-50/50 rounded-2xl border border-institutional-100">
            <div>
              <p className="text-xs font-black text-institutional-800 uppercase tracking-tight">Dati Tecnici Avanzati</p>
              <p className="text-[10px] text-institutional-600 font-medium">Geometrici, impianti e planimetrie</p>
            </div>
            <button 
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="flex items-center gap-2 bg-white text-institutional-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-institutional-200 shadow-sm hover:bg-institutional-50 transition-all"
            >
              <Settings2 size={14} /> Configurazione
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Note Patrimoniali</label>
            <textarea 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-institutional-700 outline-none transition-all h-24"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-4 shrink-0">
            <button type="submit" className="flex-1 bg-institutional-700 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-institutional-800 uppercase tracking-widest text-xs">Salva Modifiche</button>
            <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl uppercase tracking-widest text-xs">Annulla</button>
          </div>
        </form>
      </div>

      {showAdvanced && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><Settings2 className="text-institutional-400" /> Scheda Tecnica Avanzata</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dati geometrici e documentali</p>
              </div>
              <button onClick={() => setShowAdvanced(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3 flex items-center gap-2"><Ruler size={14} className="text-institutional-700" /> Dimensionamento</h4>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Superficie (mq)</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold" value={techData.surfaceArea} onChange={e => setTechData({...techData, surfaceArea: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Volumetria (mc)</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold" value={techData.volume} onChange={e => setTechData({...techData, volume: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">N. Piani</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold" value={techData.floors} onChange={e => setTechData({...techData, floors: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3 flex items-center gap-2"><Zap size={14} className="text-institutional-700" /> Impianti</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Riscaldamento</label>
                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold" value={techData.heatingSystem} onChange={e => setTechData({...techData, heatingSystem: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Elettrico</label>
                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold" value={techData.electricalSystem} onChange={e => setTechData({...techData, electricalSystem: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3 flex items-center gap-2"><FileText size={14} className="text-institutional-700" /> Planimetrie</h4>
                <div className="flex flex-wrap gap-4">
                  {techData.floorPlans.map(plan => (
                    <div key={plan.id} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-3">
                      <FileText size={16} className="text-institutional-700" />
                      <span className="text-[10px] font-black text-slate-800 truncate max-w-[100px]">{plan.name}</span>
                      <button onClick={() => removePlan(plan.id)} className="text-red-500"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <label className="cursor-pointer">
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                    <div className="border-2 border-dashed border-slate-200 p-3 rounded-2xl flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase">
                      <Plus size={16} /> Aggiungi
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
               <button onClick={() => setShowAdvanced(false)} className="px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl flex items-center gap-2"><ShieldCheck size={18} /> Conferma Dati</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingForm;
