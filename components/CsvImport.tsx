
import React, { useState, useRef } from 'react';
import { Download, FileUp, CheckCircle2, AlertCircle, Building2, Map as MapIcon, LayoutGrid, Info, ClipboardList } from 'lucide-react';
import { AppState, MainStructure, Plesso, Road, Intervento, InterventoType } from '../types';

interface Props {
  state: AppState;
  onImportStructures: (data: MainStructure[]) => void;
  onImportPlessi: (data: Plesso[]) => void;
  onImportRoads: (data: Road[]) => void;
  onImportInterventions: (data: Intervento[]) => void;
}

const CsvImport: React.FC<Props> = ({ state, onImportStructures, onImportPlessi, onImportRoads, onImportInterventions }) => {
  const [activeType, setActiveType] = useState<'structures' | 'plessi' | 'roads' | 'interventions'>('structures');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = {
    structures: {
      filename: 'template_immobili.csv',
      header: 'nome,indirizzo,descrizione,codice_univoco,centro_costo\n',
      example: 'Palazzo Regio,Piazza Palazzo 1,Sede storica istituzionale,IMM_000101,AMMIN_CENTRALE\nLiceo Scientifico,Via degli Studi 10,Edificio scolastico principale,IMM_000102,ISTR_AREA_A'
    },
    plessi: {
      filename: 'template_plessi.csv',
      header: 'codice_univoco_immobile_riferimento,nome_plesso,descrizione_plesso,codice_univoco_plesso,centro_di_costo\n',
      example: 'IMM_000101,Ala Sud,Uffici presidenza,PLX_000101,CDC_AREA_1\nIMM_000102,Palestra,Impianto sportivo coperto,PLX_000102,CDC_AREA_2'
    },
    roads: {
      filename: 'template_strade.csv',
      header: 'codice_sp,nome,lunghezza_km,descrizione,codice_univoco\n',
      example: 'SP 1,Strada Provinciale 1,15.5,Collegamento costa-entroterra,STR_000001\nSP 12,Via del Mare,8.2,Strada panoramica costiera,STR_000002'
    },
    interventions: {
      filename: 'template_interventi.csv',
      header: 'cig,titolo,oggetto,importo,rup,data_inizio,data_fine,codice_univoco_asset_target,tipologia\n',
      example: 'B12345678X,Rifacimento Tetto,Manutenzione straordinaria coperture,150000,Ing. Mario Rossi,2024-05-01,2024-12-31,IMM_000101,Interventi Straordinari\nC99887766Y,Segnaletica SP1,Posa cartellonistica Km 0-5,15000,Arch. Luigi Verdi,2024-06-15,2024-07-15,STR_000001,Manutenzioni'
    }
  };

  const downloadTemplate = (type: 'structures' | 'plessi' | 'roads' | 'interventions') => {
    const { filename, header, example } = templates[type];
    const blob = new Blob([header + example], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCsvData(text);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processCsvData = (text: string) => {
    try {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) throw new Error("File CSV vuoto o non valido.");

      const rows = lines.slice(1).map(line => {
        return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
      });

      if (activeType === 'structures') {
        const newData: MainStructure[] = rows.map(row => ({
          id: `struct-${crypto.randomUUID()}`,
          name: row[0],
          address: row[1],
          description: row[2],
          uniqueCode: row[3],
          costCenter: row[4],
          plessi: []
        }));
        onImportStructures(newData);
        setFeedback({ type: 'success', msg: `Importati con successo ${newData.length} immobili.` });
      } 
      else if (activeType === 'plessi') {
        const newData: Plesso[] = [];
        let errors = 0;
        rows.forEach(row => {
          const structure = state.structures.find(s => s.uniqueCode === row[0]);
          if (structure) {
            newData.push({
              id: `plesso-${crypto.randomUUID()}`,
              structureId: structure.id,
              name: row[1],
              description: row[2],
              uniqueCode: row[3],
              costCenter: row[4],
              pertinenze: []
            });
          } else {
            errors++;
          }
        });
        onImportPlessi(newData);
        setFeedback({ 
          type: errors > 0 ? 'error' : 'success', 
          msg: `Importati ${newData.length} plessi. ${errors > 0 ? `${errors} errori (codice immobile non trovato).` : ''}` 
        });
      } 
      else if (activeType === 'roads') {
        const newData: Road[] = rows.map(row => ({
          id: `road-${crypto.randomUUID()}`,
          code: row[0],
          name: row[1],
          lengthKm: parseFloat(row[2]) || 0,
          description: row[3],
          uniqueCode: row[4]
        }));
        onImportRoads(newData);
        setFeedback({ type: 'success', msg: `Importate con successo ${newData.length} strade.` });
      }
      else if (activeType === 'interventions') {
        const newData: Intervento[] = [];
        let errors = 0;

        rows.forEach(row => {
          const targetCode = row[7];
          let targetId = '';
          let targetType: 'structure' | 'plesso' | 'road' | 'pertinenza' = 'structure';

          // Ricerca target per Codice Univoco
          const s = state.structures.find(s => s.uniqueCode === targetCode);
          if (s) {
            targetId = s.id;
            targetType = 'structure';
          } else {
            const r = state.roads.find(r => r.uniqueCode === targetCode);
            if (r) {
              targetId = r.id;
              targetType = 'road';
            } else {
              for (const struct of state.structures) {
                const p = struct.plessi.find(pl => pl.uniqueCode === targetCode);
                if (p) {
                  targetId = p.id;
                  targetType = 'plesso';
                  break;
                }
              }
            }
          }

          if (targetId) {
            // Mappatura tipo intervento
            const rawType = row[8];
            let interventionType = InterventoType.ORDINARIO;
            if (rawType?.includes('Straordinari')) interventionType = InterventoType.STRAORDINARIO;
            else if (rawType?.includes('Manutenzioni')) interventionType = InterventoType.MANUTENZIONE;
            else if (rawType?.includes('progettazione')) interventionType = InterventoType.PROGETTAZIONE_ESECUZIONE;

            newData.push({
              id: crypto.randomUUID(),
              cig: row[0],
              title: row[1],
              oggetto: row[2],
              amount: parseFloat(row[3]) || 0,
              currentRup: row[4],
              dateStart: row[5],
              dateEnd: row[6],
              targetId,
              targetType,
              type: interventionType,
              description: `Importato via CSV il ${new Date().toLocaleDateString()}`,
              rupHistory: [],
              suspensions: [],
              extensions: [],
              createdAt: new Date().toISOString()
            });
          } else {
            errors++;
          }
        });

        onImportInterventions(newData);
        setFeedback({ 
          type: errors > 0 ? 'error' : 'success', 
          msg: `Importati ${newData.length} interventi. ${errors > 0 ? `${errors} record scartati (target asset non trovato).` : ''}` 
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: "Errore durante l'elaborazione del file CSV." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-institutional-50 text-institutional-700 rounded-2xl">
            <FileUp size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Importazione Massiva CSV</h2>
            <p className="text-slate-500 text-sm font-medium italic">Popola il database caricando file CSV pre-formattati</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl mb-8">
          {[
            { id: 'structures', label: 'Immobili', icon: Building2 },
            { id: 'plessi', label: 'Plessi', icon: LayoutGrid },
            { id: 'roads', icon: MapIcon, label: 'Strade' },
            { id: 'interventions', label: 'Interventi', icon: ClipboardList }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => { setActiveType(type.id as any); setFeedback(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeType === type.id 
                  ? 'bg-white text-institutional-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <type.icon size={16} />
              {type.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-institutional-200 transition-colors">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-institutional-700 shadow-sm font-black mb-2 border border-institutional-100">1</div>
            <h3 className="font-bold text-slate-800">Scarica il Modello</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Utilizza il formato corretto per garantire l'integrità dei dati. Il template include esempi di compilazione validi.
            </p>
            <button 
              onClick={() => downloadTemplate(activeType)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest"
            >
              <Download size={16} /> Scarica Template
            </button>
          </div>

          <div className="space-y-4 p-6 bg-institutional-50/30 rounded-2xl border border-institutional-100 group hover:border-institutional-300 transition-colors">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-institutional-700 shadow-sm font-black mb-2 border border-institutional-100">2</div>
            <h3 className="font-bold text-slate-800">Carica il File</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trascina il file CSV compilato o selezionalo dal dispositivo per avviare la procedura di parsing automatico.
            </p>
            <label className="cursor-pointer">
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".csv" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={isProcessing}
              />
              <div className="w-full flex items-center justify-center gap-2 py-3 bg-institutional-700 text-white text-xs font-black rounded-xl hover:bg-institutional-800 transition-all uppercase tracking-widest shadow-lg shadow-institutional-700/20">
                {isProcessing ? "Elaborazione..." : <><FileUp size={16} /> Seleziona File</>}
              </div>
            </label>
          </div>
        </div>

        {feedback && (
          <div className={`mt-8 p-4 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="shrink-0" size={20} /> : <AlertCircle className="shrink-0" size={20} />}
            <div className="text-sm font-bold">{feedback.msg}</div>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
        <Info className="text-amber-600 shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-black text-amber-800 uppercase tracking-tight mb-1">Logica di Associazione Asset</h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            Per l'importazione di <strong>Plessi</strong> e <strong>Interventi</strong>, è fondamentale utilizzare i Codici Univoci (IMM_..., PLX_..., STR_...) per collegare correttamente i record. In caso di codice errato o non esistente, il record verrà scartati per evitare dati orfani.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CsvImport;
