
import React from 'react';
import { Intervento, AppState } from '../types';
import { X, ClipboardList, Eye, Calendar, DollarSign } from 'lucide-react';

interface Props {
  assetId: string;
  assetName: string;
  state: AppState;
  onClose: () => void;
  onViewIntervention: (id: string) => void;
}

const AssetInterventionsModal: React.FC<Props> = ({ assetId, assetName, state, onClose, onViewIntervention }) => {
  // Find all interventions related to this asset
  const filteredInterventions = state.interventi.filter(i => {
    // Exact match
    if (i.targetId === assetId) return true;
    
    // If it's a building, check if the intervention is on its plexes or pertinences
    const building = state.structures.find(s => s.id === assetId);
    if (building) {
      const isPlessoIntervention = building.plessi.some(p => p.id === i.targetId);
      const isPertinenzaIntervention = building.plessi.some(p => p.pertinenze.some(pert => pert.id === i.targetId));
      return isPlessoIntervention || isPertinenzaIntervention;
    }
    return false;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList size={20} className="text-blue-600" /> Storico Interventi
            </h3>
            <p className="text-xs text-slate-500 font-medium">Asset: <span className="text-slate-900 font-bold">{assetName}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {filteredInterventions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInterventions.map(i => (
                <div key={i.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-4 hover:border-blue-200 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                      {i.type.split(' ').pop()}
                    </span>
                    <button 
                      onClick={() => onViewIntervention(i.id)}
                      className="text-slate-400 hover:text-blue-600 p-1 rounded-lg group-hover:bg-blue-50 transition-all"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">CIG: {i.cig || 'N/D'}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 italic leading-relaxed">
                    {i.description || 'Nessuna descrizione.'}
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Calendar size={12} /> {i.dateStart || '---'}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-900 font-bold">
                        <DollarSign size={12} className="text-emerald-500" /> € {i.amount.toLocaleString()}
                      </div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${i.dateTest ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-4">
                <ClipboardList size={32} />
              </div>
              <p className="text-slate-500 font-medium">Nessun intervento caricato per questo asset.</p>
              <p className="text-xs text-slate-400 mt-1">Puoi aggiungere nuovi interventi dalla sezione "Nuovo Intervento".</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-all"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetInterventionsModal;
