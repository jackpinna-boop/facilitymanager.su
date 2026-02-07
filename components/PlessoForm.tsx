
import React, { useState } from 'react';
import { Plesso, TechnicalData, FloorPlan } from '../types';
import { LayoutGrid, X, Save, Settings2, Ruler, Zap, FileText, Plus, Trash2, ShieldCheck, Hash, Wallet, History } from 'lucide-react';

interface Props {
  buildingName: string;
  buildingId: string;
  onSave: (plesso: Plesso) => void;
  onCancel: () => void;
  initialData?: Plesso | null;
  suggestedUniqueCode?: string;
}

const PlessoForm: React.FC<Props> = ({ buildingName, buildingId, onSave, onCancel, initialData, suggestedUniqueCode }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    costCenter: initialData?.costCenter || '',
    uniqueCode: initialData?.uniqueCode || suggestedUniqueCode || `PLX_000001`,
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
    const updatedPlesso: Plesso = {
      id: initialData?.id || `plesso-${crypto.randomUUID()}`,
      structureId: buildingId,
      ...formData,
      technicalData: techData,
      pertinenze: initialData?.pertinenze || []
    };
    onSave(updatedPlesso);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <LayoutGrid size={20} className="text-institutional-700" /> {initialData ? 'Modifica Plesso' : 'Nuova Unità Locale'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Asset: {buildingName}</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
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
                <input className="w-full p-2 pl-8 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none" placeholder="es. CdC-002" value={formData.costCenter} onChange={e => setFormData({...formData, costCenter: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nome Attuale</label>
            <input required className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-institutional-700 font-bold" placeholder="es. Ala Est, Padiglione B..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          {/* Gestione Storico Nomi */}
          <div className="space-y-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
            <label className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
              <History size={14} /> Storico Nomi Precedenti
            </label>
            <div className="flex gap-2">
              <input 
                type="text"
                className="flex-1 p-2 bg-white border border-amber-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Nome storico..."
                value={newNameHistory}
                onChange={e => setNewNameHistory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNameHistory())}
              />
              <button 
                type="button"
                onClick={addNameHistory}
                className="bg-amber-600 text-white px-3 rounded-lg hover:bg-amber-700 transition-all font-black text-[9px] uppercase"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.previousNames.map(name => (
                <div key={name} className="bg-white border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
                  <span className="text-[10px] font-bold text-amber-900">{name}</span>
                  <button type="button" onClick={() => removeNameHistory(name)} className="text-amber-400 hover:text-red-500">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-institutional-50/50 rounded-xl border border-institutional-100">
            <div className="text-[10px] font-black text-institutional-800 uppercase tracking-tight">Registro Tecnico</div>
            <button type="button" onClick={() => setShowAdvanced(true)} className="text-[9px] font-black uppercase text-institutional-700 bg-white px-2 py-1 rounded-md border border-institutional-200 shadow-sm">Dati Avanzati</button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Descrizione Funzionale</label>
            <textarea className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-institutional-700 h-24" placeholder="Dettagli sulle funzioni del plesso..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-4 shrink-0">
            <button type="submit" className="flex-1 bg-institutional-700 text-white font-black py-3 rounded-xl shadow-lg hover:bg-institutional-800 transition-all">Salva Plesso</button>
            <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200">Annulla</button>
          </div>
        </form>
      </div>

      {showAdvanced && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-tighter flex items-center gap-2"><Settings2 size={20} /> Specifiche Tecniche Unità</h3>
              <button onClick={() => setShowAdvanced(false)} className="p-1 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Ruler size={14} className="text-institutional-700" /> Dimensionamento</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase">Superficie (mq)</label><input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold" value={techData.surfaceArea} onChange={e => setTechData({...techData, surfaceArea: Number(e.target.value)})} /></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase">N. Piani</label><input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold" value={techData.floors} onChange={e => setTechData({...techData, floors: Number(e.target.value)})} /></div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14} className="text-institutional-700" /> Impianti</h4>
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase">Climatizzazione</label><input className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold" value={techData.heatingSystem} onChange={e => setTechData({...techData, heatingSystem: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase">Elettrico/Dati</label><input className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold" value={techData.electricalSystem} onChange={e => setTechData({...techData, electricalSystem: e.target.value})} /></div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14} className="text-institutional-700" /> Planimetrie</h4>
                <div className="flex flex-wrap gap-3">
                  {techData.floorPlans.map(plan => (
                    <div key={plan.id} className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center gap-2">
                      <FileText size={12} className="text-institutional-700" />
                      <span className="text-[9px] font-bold text-slate-700 truncate max-w-[80px]">{plan.name}</span>
                      <button onClick={() => removePlan(plan.id)} className="text-red-400"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <label className="cursor-pointer"><input type="file" multiple className="hidden" onChange={handleFileUpload} /><div className="border border-dashed border-institutional-200 p-2 rounded-xl text-institutional-400 hover:bg-institutional-50 text-[9px] font-bold uppercase">+ Add Plan</div></label>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
               <button onClick={() => setShowAdvanced(false)} className="bg-institutional-700 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl shadow-lg flex items-center gap-2"><ShieldCheck size={14} /> Conferma Dati Tecnici</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlessoForm;
