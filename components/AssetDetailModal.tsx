
import React, { useState, useMemo } from 'react';
import { AppState, TechnicalData, Road, Intervento } from '../types';
import { 
  X, 
  Printer, 
  Calendar, 
  Info, 
  Wallet, 
  ShieldCheck, 
  FileText, 
  Ruler, 
  Zap, 
  FlameKindling, 
  Map as MapIcon, 
  LayoutGrid, 
  ChevronDown, 
  History, 
  Hash,
  Eye,
  Building2,
  ArrowRight
} from 'lucide-react';

export type UnifiedAsset = {
  id: string;
  type: 'structure' | 'plesso' | 'road';
  name: string;
  previousNames?: string[];
  parentName?: string;
  address?: string;
  code?: string;
  uniqueCode?: string;
  costCenter?: string;
  technicalData?: TechnicalData;
  originalData: any;
};

interface Props {
  selectedAsset: UnifiedAsset;
  interventi: Intervento[];
  onClose: () => void;
  onViewIntervention?: (id: string) => void;
}

const AssetDetailModal: React.FC<Props> = ({ selectedAsset, interventi, onClose, onViewIntervention }) => {
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');

  const assetInterventions = useMemo(() => {
    let list = interventi.filter(i => i.targetId === selectedAsset.id);
    if (reportDateFrom) {
      list = list.filter(i => (i.dateStart || i.createdAt) >= reportDateFrom);
    }
    if (reportDateTo) {
      list = list.filter(i => (i.dateStart || i.createdAt) <= reportDateTo);
    }
    return list;
  }, [interventi, selectedAsset.id, reportDateFrom, reportDateTo]);

  const totalMaintenanceValue = useMemo(() => {
    return assetInterventions.reduce((acc, i) => acc + i.amount, 0);
  }, [assetInterventions]);

  const handlePrint = () => { window.print(); };

  const TechBadge = ({ label, value, icon: Icon }: { label: string, value: string | number | undefined, icon: any }) => (
    <div className="flex items-start gap-3 p-3 lg:p-4 bg-slate-50 rounded-xl lg:rounded-2xl border border-slate-100 h-full">
      <div className="p-2 bg-white rounded-lg text-institutional-700 shadow-sm shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{label}</p>
        <p className="text-xs lg:text-sm font-bold text-slate-800 break-words">{value || 'N/D'}</p>
      </div>
    </div>
  );

  const crestUrl = "https://provincia-sulcis-iglesiente-api.municipiumapp.it/s3/150x150/s3/20243/sito/stemma.jpg";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 lg:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md no-print" onClick={onClose}></div>
      <div className="bg-white w-full lg:w-[85%] xl:w-[80%] lg:rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col h-full lg:h-auto lg:max-h-[90vh] animate-in zoom-in slide-in-from-bottom-8 duration-500 print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Header Responsive */}
        <div className="bg-slate-900 p-4 lg:p-8 text-white flex justify-between items-center shrink-0 print:bg-white print:text-black print:border-b-2 print:border-institutional-700">
          <div className="flex items-center gap-3 lg:gap-6 min-w-0">
            <div className="w-10 h-10 lg:w-16 lg:h-16 bg-white rounded-xl lg:rounded-2xl p-1.5 lg:p-2.5 flex items-center justify-center shadow-lg shrink-0">
              <img src={crestUrl} className="w-full h-full object-contain" alt="Stemma" />
            </div>
            <div className="min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-slate-400 text-[8px] lg:text-[10px] font-black uppercase tracking-widest">
                  {selectedAsset.type.toUpperCase()}
                </span>
              </div>
              <h2 className="text-sm lg:text-2xl font-black uppercase tracking-tighter truncate">{selectedAsset.name}</h2>
            </div>
          </div>
          <div className="flex gap-2 lg:gap-3 shrink-0 ml-4 no-print">
            <button onClick={handlePrint} className="bg-institutional-700 hover:bg-institutional-800 text-white p-2 lg:p-3 rounded-lg lg:rounded-2xl transition-all shadow-lg">
              <Printer size={18} />
            </button>
            <button onClick={onClose} className="p-2 lg:p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg lg:rounded-2xl transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-8 lg:space-y-12 custom-scrollbar print:overflow-visible">
          
          {/* Info Principali Mobile Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            <div className="bg-slate-50 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100 flex items-center gap-4">
              <div className="p-2 lg:p-3 bg-white rounded-lg lg:rounded-2xl text-institutional-700 shadow-sm shrink-0">
                <Wallet size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Manutenz.</p>
                <p className="text-sm lg:text-xl font-black text-slate-900 truncate">€ {totalMaintenanceValue.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100 flex items-center gap-4">
              <div className="p-2 lg:p-3 bg-white rounded-lg lg:rounded-2xl text-institutional-700 shadow-sm shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Record</p>
                <p className="text-sm lg:text-xl font-black text-slate-900">{assetInterventions.length}</p>
              </div>
            </div>
          </div>

          {/* Dati Geometrici Responsive Grid */}
          <div className="space-y-4 lg:space-y-6">
            <h3 className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2"><Ruler size={14} className="text-institutional-700" /> Parametri Dimensionali</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
              {selectedAsset.type !== 'road' ? (
                <>
                  <TechBadge label="Superficie (mq)" value={selectedAsset.technicalData?.surfaceArea} icon={Ruler} />
                  <TechBadge label="Volume (mc)" value={selectedAsset.technicalData?.volume} icon={LayoutGrid} />
                  <TechBadge label="N. Piani" value={selectedAsset.technicalData?.floors} icon={ChevronDown} />
                </>
              ) : (
                <>
                  <TechBadge label="Lunghezza (Km)" value={(selectedAsset.originalData as Road).lengthKm} icon={Ruler} />
                  <TechBadge label="Largh. Media (m)" value={selectedAsset.technicalData?.averageWidth} icon={LayoutGrid} />
                </>
              )}
            </div>
          </div>

          {/* Lista Interventi ottimizzata per schermi piccoli */}
          <div className="space-y-4 lg:space-y-6">
            <h3 className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2"><History size={14} className="text-institutional-700" /> Cronologia Interventi</h3>
            <div className="space-y-3">
              {assetInterventions.length > 0 ? assetInterventions.map(i => (
                <div key={i.id} className="p-4 bg-slate-50/50 rounded-xl lg:rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] lg:text-[10px] font-black text-slate-900 uppercase">CIG: {i.cig}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 truncate lg:max-w-lg">{i.title || i.oggetto}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs lg:text-sm font-black text-institutional-700">€ {i.amount.toLocaleString()}</p>
                      <p className="text-[8px] lg:text-[9px] text-slate-400 font-bold uppercase">{new Date(i.dateStart || i.createdAt).toLocaleDateString()}</p>
                    </div>
                    {onViewIntervention && (
                      <button 
                        onClick={() => onViewIntervention(i.id)}
                        className="p-2 bg-white border border-slate-200 text-institutional-700 rounded-lg shadow-sm hover:bg-institutional-700 hover:text-white transition-all"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Nessuna registrazione presente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0 no-print">
          <button onClick={onClose} className="w-full lg:w-auto px-10 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl lg:rounded-2xl shadow-xl active:scale-95">
            Chiudi Scheda
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailModal;
