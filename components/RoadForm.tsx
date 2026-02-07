
import React, { useState } from 'react';
import { Road, TechnicalData } from '../types';
import { Map as MapIcon, X, Save, Navigation, Settings2, Ruler, LayoutGrid, Info, ShieldCheck, Hash, Wallet, Search, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onSave: (road: Road) => void;
  onCancel: () => void;
  initialData?: Road | null;
  suggestedUniqueCode?: string;
}

const RoadForm: React.FC<Props> = ({ onSave, onCancel, initialData, suggestedUniqueCode }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    uniqueCode: initialData?.uniqueCode || suggestedUniqueCode || `STR_000001`,
    costCenter: initialData?.costCenter || '',
    name: initialData?.name || '',
    lengthKm: initialData?.lengthKm || 0,
    description: initialData?.description || '',
    lat: initialData?.lat || 39.16,
    lng: initialData?.lng || 8.52
  });

  const [techData, setTechData] = useState<TechnicalData>(initialData?.technicalData || {
    pavementType: '',
    averageWidth: 0,
    maintenanceStatus: '',
    surfaceArea: 0,
    floorPlans: []
  });

  const handleGeocodeSearch = async () => {
    const query = `${formData.code} ${formData.name}`;
    if (query.trim().length < 3) return;
    
    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Trova le coordinate geografiche di riferimento (centro o inizio) per la strada provinciale: "${query}". Rispondi esclusivamente in formato JSON: {"lat": numero, "lng": numero}`,
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
          lng: data.lng
        }));
      }
    } catch (error: any) {
      console.error("Errore geocoding strada:", error);
      if (error?.message?.includes("Requested entity was not found")) {
        alert("Configurazione API Key non valida per il servizio mappe.");
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoad: Road = {
      id: initialData?.id || `road-${crypto.randomUUID()}`,
      ...formData,
      technicalData: techData
    };
    onSave(newRoad);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <MapIcon size={20} className="text-blue-600" /> {initialData ? 'Modifica Strada' : 'Nuova Strada Provinciale'}
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Codice Univoco</label>
              <div className="relative">
                <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                <input readOnly className="w-full p-2 pl-8 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 outline-none" value={formData.uniqueCode} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Centro di Costo</label>
              <div className="relative">
                <Wallet className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                <input 
                  className="w-full p-2 pl-8 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none" 
                  placeholder="es. CdC-STR-01"
                  value={formData.costCenter}
                  onChange={e => setFormData({...formData, costCenter: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Codice Strada (SP)</label>
              <input 
                required
                className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="es. SP 12"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Estensione (Km)</label>
              <input 
                required
                type="number"
                step="0.1"
                className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="0.0"
                value={formData.lengthKm}
                onChange={e => setFormData({...formData, lengthKm: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Localizzazione Mappa</label>
            <div className="flex gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input type="number" step="any" className="p-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold" placeholder="Lat" value={formData.lat} onChange={e => setFormData({...formData, lat: Number(e.target.value)})} />
                <input type="number" step="any" className="p-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold" placeholder="Lng" value={formData.lng} onChange={e => setFormData({...formData, lng: Number(e.target.value)})} />
              </div>
              <button 
                type="button" 
                onClick={handleGeocodeSearch}
                disabled={isSearching}
                className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center shrink-0 w-10"
              >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="text-[10px] font-black text-blue-800 uppercase tracking-tight">Registro Tecnico</div>
            <button 
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="text-[9px] font-black uppercase text-blue-600 bg-white px-2 py-1 rounded-md border border-blue-200 shadow-sm"
            >
              Dati Avanzati
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nome / Denominazione</label>
            <input 
              required
              className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-bold"
              placeholder="es. Strada del Mare..."
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Note / Descrizione</label>
            <textarea 
              className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 h-24 font-medium"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all">Salva</button>
            <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all">Annulla</button>
          </div>
        </form>
      </div>

      {showAdvanced && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="bg-blue-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black uppercase tracking-tighter flex items-center gap-2"><Settings2 size={20} /> Advanced Road Specs</h3>
              </div>
              <button onClick={() => setShowAdvanced(false)} className="p-1 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Ruler size={14} className="text-blue-600" /> Dimensionamento</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Larghezza Media (m)</label>
                    <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold" value={techData.averageWidth} onChange={e => setTechData({...techData, averageWidth: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Superficie Pavimentata (mq)</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold" value={techData.surfaceArea} onChange={e => setTechData({...techData, surfaceArea: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><LayoutGrid size={14} className="text-blue-600" /> Caratteristiche</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Tipo Pavimentazione</label>
                    <input className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold" placeholder="es. Asfalto drenante, Binder..." value={techData.pavementType} onChange={e => setTechData({...techData, pavementType: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Stato Conservativo</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold" value={techData.maintenanceStatus} onChange={e => setTechData({...techData, maintenanceStatus: e.target.value})}>
                      <option value="">Seleziona...</option>
                      <option value="ottimo">Ottimo</option>
                      <option value="buono">Buono</option>
                      <option value="sufficiente">Sufficiente</option>
                      <option value="degradato">Degradato (Intervento urgente)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
               <button onClick={() => setShowAdvanced(false)} className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl shadow-lg flex items-center gap-2"><ShieldCheck size={14} /> Applica Modifiche Tecniche</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadForm;
