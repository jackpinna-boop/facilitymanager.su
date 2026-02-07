
import React from 'react';
import { Intervento, AppState, Road } from '../types';
import { 
  Calendar, 
  User, 
  Info, 
  DollarSign, 
  Building2, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  ChevronLeft,
  FileText,
  History,
  Map as MapIcon,
  ExternalLink,
  Tag,
  Hash,
  Printer,
  ShieldCheck
} from 'lucide-react';

interface Props {
  intervention: Intervento;
  state: AppState;
  onEdit: (id: string) => void;
  onClose: () => void;
}

const InterventionDetail: React.FC<Props> = ({ intervention, state, onEdit, onClose }) => {
  const targetRoad = React.useMemo(() => {
    if (intervention.targetType === 'road') {
      return state.roads.find(r => r.id === intervention.targetId);
    }
    return null;
  }, [intervention.targetId, intervention.targetType, state.roads]);

  const targetName = React.useMemo(() => {
    if (targetRoad) {
      return `${targetRoad.code} - ${targetRoad.name} (Strada)`;
    }

    const s = state.structures.find(s => s.id === intervention.targetId);
    if (s) return s.name + " (Struttura)";
    
    for (const struct of state.structures) {
      const p = struct.plessi.find(pl => pl.id === intervention.targetId);
      if (p) return `${struct.name} > ${p.name} (Plesso)`;
      
      for (const plesso of struct.plessi) {
        const pert = plesso.pertinenze.find(per => per.id === intervention.targetId);
        if (pert) return `${struct.name} > ${plesso.name} > ${pert.name} (Pertinenza)`;
      }
    }
    return "Target N/D";
  }, [intervention.targetId, targetRoad, state.structures]);

  const handlePrint = () => {
    window.print();
  };

  const openAnacData = () => {
    if (intervention.cig) {
      window.open(`https://dati.anticorruzione.it/opencig/cig/${intervention.cig}`, '_blank');
    }
  };

  const DetailItem = ({ icon: Icon, label, value, color = "blue", extra, noTruncate = false }: any) => (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 h-full print:bg-white print:border-slate-200">
      <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600 shrink-0 print:border`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 print:text-slate-600">{label}</p>
        <div className="flex items-center gap-2">
          <p className={`text-sm font-semibold text-slate-800 ${noTruncate ? '' : 'truncate'} print:whitespace-normal`}>{value || 'N/D'}</p>
          {extra}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 print:shadow-none print:border-none">
      {/* Header */}
      <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center print:bg-white print:text-slate-900 print:border-b-2 print:border-institutional-700">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-institutional-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 print:bg-slate-100 print:text-slate-700 print:border">
               <FileText size={10} /> CIG {intervention.cig}
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest print:text-slate-500">{intervention.type}</span>
            {intervention.cig && (
              <button 
                onClick={openAnacData}
                className="no-print bg-white/10 hover:bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 transition-all"
              >
                <ShieldCheck size={10} className="text-institutional-400" /> VEDI DATI ANAC
              </button>
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">
            Scheda Intervento n. <span className="text-institutional-400 print:text-institutional-700">{intervention.uniqueCode || intervention.cig}</span>
          </h2>
          <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-tight print:text-slate-700">{intervention.title || 'Senza Titolo Specificato'}</p>
        </div>
        <div className="flex gap-3 ml-6 no-print">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg"
          >
            <Printer size={16} /> Stampa PDF
          </button>
          <button 
            onClick={() => onEdit(intervention.id)}
            className="flex items-center gap-2 bg-institutional-700 hover:bg-institutional-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-institutional-700/20"
          >
            <Edit3 size={16} /> Modifica
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8 print:p-0 print:mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2">
          <DetailItem 
            icon={intervention.targetType === 'road' ? MapIcon : Building2} 
            label="Destinazione" 
            value={targetName} 
            color={intervention.targetType === 'road' ? 'indigo' : 'blue'}
            noTruncate={true}
            extra={targetRoad && (
              <span className="no-print">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetRoad.code + ' ' + targetRoad.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                  title="Visualizza su Google Maps"
                >
                  <ExternalLink size={14} />
                </a>
              </span>
            )}
          />
          <DetailItem icon={User} label="RUP Attuale" value={intervention.currentRup} color="indigo" />
          <DetailItem icon={DollarSign} label="Importo Totale" value={`€ ${intervention.amount.toLocaleString()}`} color="emerald" />
          <DetailItem icon={FileText} label="Codice CIG" value={intervention.cig} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:space-y-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-3">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 uppercase tracking-tight print:border-slate-300">
                <Tag size={16} className="text-institutional-700" /> Oggetto del Procedimento
              </h3>
              <div className="bg-institutional-50/30 p-6 rounded-2xl border border-institutional-100 print:bg-white print:border-slate-200">
                <p className="text-slate-800 text-sm leading-relaxed font-bold">
                  {intervention.oggetto || "Nessun oggetto formale inserito."}
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 uppercase tracking-tight print:border-slate-300">
                <FileText size={16} className="text-blue-500" /> Note Tecniche e Dettagli
              </h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 min-h-[120px] print:bg-white print:border-slate-200">
                <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed italic print:text-slate-800">
                  {intervention.description || "Nessuna descrizione tecnica inserita."}
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 print:border-slate-300">
                  <Clock size={16} className="text-red-500" /> Sospensioni ({intervention.suspensions.length})
                </h3>
                <div className="space-y-2">
                  {intervention.suspensions.length > 0 ? intervention.suspensions.map(s => (
                    <div key={s.id} className="p-3 bg-red-50/50 rounded-lg border border-red-100 flex justify-between items-center print:bg-white print:border-slate-200">
                      <div className="text-xs">
                        <p className="font-bold text-red-700 print:text-slate-900">{s.reason || 'Senza motivazione specificata'}</p>
                        <p className="text-red-500 font-medium print:text-slate-600">{s.startDate} → {s.endDate || 'In corso'}</p>
                      </div>
                    </div>
                  )) : <p className="text-xs text-slate-400 italic py-2">Nessuna sospensione registrata.</p>}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 print:border-slate-300">
                  <AlertTriangle size={16} className="text-amber-500" /> Proroghe ({intervention.extensions.length})
                </h3>
                <div className="space-y-2">
                  {intervention.extensions.length > 0 ? intervention.extensions.map(e => (
                    <div key={e.id} className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 flex justify-between items-center print:bg-white print:border-slate-200">
                      <div className="text-xs">
                        <p className="font-bold text-amber-700 print:text-slate-900">Proroga di +{e.days} giorni</p>
                        <p className="text-amber-500 print:text-slate-600">{e.reason}</p>
                      </div>
                    </div>
                  )) : <p className="text-xs text-slate-400 italic py-2">Nessuna proroga concessa.</p>}
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 print:border-slate-300">
                <Calendar size={16} className="text-blue-500" /> Cronologia Procedimento
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Consegna Lavori', val: intervention.dateDelivery },
                  { label: 'Inizio Lavori', val: intervention.dateStart },
                  { label: 'Esecuzione', val: intervention.dateExecution },
                  { label: 'Fine Lavori', val: intervention.dateEnd },
                  { label: 'Collaudo Finale', val: intervention.dateTest },
                ].map(d => (
                  <div key={d.label} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-100 print:bg-white print:border-slate-200">
                    <span className="text-slate-500 font-medium print:text-slate-700">{d.label}</span>
                    <span className={`font-bold ${d.val ? 'text-slate-800' : 'text-slate-300'}`}>{d.val || '---'}</span>
                  </div>
                ))}
              </div>
            </section>

            {intervention.rupHistory.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 print:border-slate-300">
                  <History size={16} className="text-blue-500" /> Cronologia RUP
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 print:max-h-none print:overflow-visible">
                  {intervention.rupHistory.map(rup => (
                    <div key={rup.id} className="text-[11px] p-2.5 bg-slate-50 rounded-lg border-l-4 border-blue-400 print:bg-white print:border-slate-200">
                      <p className="font-bold text-slate-700">{rup.name}</p>
                      <p className="text-slate-400 italic print:text-slate-500">Subentrato il: {rup.startDate}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer di Stampa (Firme e Note Legali) */}
        <div className="hidden print:grid grid-cols-2 gap-20 pt-20 mt-20 border-t-2 border-slate-200">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase mb-16">Il Responsabile Unico del Procedimento (RUP)</p>
            <div className="border-b border-slate-400 w-full mb-2"></div>
            <p className="text-[9px] font-bold text-slate-500 italic">(Firma digitale o autografa)</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase mb-16">Il Dirigente di Settore</p>
            <div className="border-b border-slate-400 w-full mb-2"></div>
            <p className="text-[9px] font-bold text-slate-500 italic">(Firma digitale o autografa)</p>
          </div>
        </div>
        
        <div className="hidden print:block text-center pt-10 text-[8px] text-slate-400 uppercase font-black tracking-widest border-t border-slate-100 mt-10">
          Documento generato dal sistema EdilGest Pro - Provincia | Data Stampa: {new Date().toLocaleString('it-IT')} | Identificativo univoco: {intervention.id}
        </div>
      </div>
    </div>
  );
};

export default InterventionDetail;
