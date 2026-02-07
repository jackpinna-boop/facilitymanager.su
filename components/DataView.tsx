
import React, { useState, useMemo, useCallback } from 'react';
import { AppState, Intervento, InterventoType } from '../types';
import { 
  ArrowUpDown, 
  Filter, 
  X, 
  Eye, 
  Edit3,
  Search,
  Printer,
  Tag
} from 'lucide-react';

interface Props {
  state: AppState;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

type SortConfig = {
  key: keyof Intervento | 'targetName';
  direction: 'asc' | 'desc';
} | null;

const ColumnHeader = ({ 
  label, 
  sortKey, 
  filterKey, 
  filters, 
  setFilters, 
  requestSort, 
  sortConfig 
}: { 
  label: string, 
  sortKey: keyof Intervento | 'targetName', 
  filterKey: string,
  filters: any,
  setFilters: any,
  requestSort: any,
  sortConfig: SortConfig
}) => (
  <th className="px-4 py-3 bg-slate-50 border-b border-slate-200">
    <div className="flex flex-col gap-2">
      <button 
        onClick={() => requestSort(sortKey)}
        className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wider hover:text-institutional-700 transition-colors"
      >
        {label}
        <ArrowUpDown size={12} className={sortConfig?.key === sortKey ? 'text-institutional-700' : 'text-slate-300'} />
      </button>
      <div className="relative group no-print">
        <input 
          type="text"
          className="w-full bg-white border border-slate-200 rounded p-1 text-[11px] outline-none focus:ring-1 focus:ring-institutional-700 transition-all font-normal"
          placeholder={`Filtra ${label}...`}
          value={filters[filterKey]}
          onChange={(e) => setFilters({...filters, [filterKey]: e.target.value})}
        />
        {filters[filterKey] && (
          <button 
            onClick={() => setFilters({...filters, [filterKey]: ''})}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
          >
            <X size={10} />
          </button>
        )}
      </div>
    </div>
  </th>
);

const DataView: React.FC<Props> = ({ state, onView, onEdit }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [filters, setFilters] = useState<any>({
    title: '',
    cig: '',
    targetName: '',
    type: '',
    rup: '',
    amount: '',
    dateStart: '',
    dateEnd: ''
  });

  const getTargetName = useCallback((targetId: string) => {
    const s = state.structures.find(s => s.id === targetId);
    if (s) return s.name;
    for (const struct of state.structures) {
      const p = struct.plessi.find(pl => pl.id === targetId);
      if (p) return p.name;
      for (const plesso of struct.plessi) {
        const pert = plesso.pertinenze.find(per => per.id === targetId);
        if (pert) return pert.name;
      }
    }
    return "N/D";
  }, [state.structures]);

  const filteredData = useMemo(() => {
    let data = state.interventi.map(i => ({
      ...i,
      targetName: getTargetName(i.targetId)
    }));

    data = data.filter(item => {
      return (
        (item.title || '').toLowerCase().includes(filters.title.toLowerCase()) &&
        item.cig.toLowerCase().includes(filters.cig.toLowerCase()) &&
        item.targetName.toLowerCase().includes(filters.targetName.toLowerCase()) &&
        item.type.toLowerCase().includes(filters.type.toLowerCase()) &&
        item.currentRup.toLowerCase().includes(filters.rup.toLowerCase()) &&
        item.amount.toString().includes(filters.amount) &&
        (item.dateStart || '').includes(filters.dateStart) &&
        (item.dateEnd || '').includes(filters.dateEnd)
      );
    });

    if (sortConfig !== null) {
      data.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [state.interventi, filters, sortConfig, getTargetName]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredData]);

  const requestSort = (key: keyof Intervento | 'targetName') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => setFilters({
    title: '',
    cig: '',
    targetName: '',
    type: '',
    rup: '',
    amount: '',
    dateStart: '',
    dateEnd: ''
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="print-only mb-8">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">EdilGest Pro</h1>
            <p className="text-sm font-bold text-slate-500">REPORT AVANZATO INTERVENTI</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">Data Generazione: {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <p className="text-xs text-slate-500 font-medium">Record trovati: {filteredData.length}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Visualizzazione Avanzata</h2>
          <p className="text-slate-500 text-sm">Analisi tabellare con filtri granulari per colonna</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="text-xs font-black text-white bg-slate-800 hover:bg-slate-900 flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all shadow-lg shadow-slate-900/10 uppercase tracking-widest"
          >
            <Printer size={16} /> Stampa PDF
          </button>
          <button 
            onClick={clearFilters}
            className="text-xs font-black text-institutional-700 hover:text-institutional-800 flex items-center gap-1.5 px-3 py-1.5 bg-institutional-50 rounded-xl transition-colors uppercase tracking-widest"
          >
            <Filter size={14} /> Resetta Filtri
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr>
                <ColumnHeader label="Titolo Intervento" sortKey="title" filterKey="title" filters={filters} setFilters={setFilters} requestSort={requestSort} sortConfig={sortConfig} />
                <ColumnHeader label="CIG" sortKey="cig" filterKey="cig" filters={filters} setFilters={setFilters} requestSort={requestSort} sortConfig={sortConfig} />
                <ColumnHeader label="Target" sortKey="targetName" filterKey="targetName" filters={filters} setFilters={setFilters} requestSort={requestSort} sortConfig={sortConfig} />
                <th className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => requestSort('type')}
                      className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wider hover:text-institutional-700 transition-colors"
                    >
                      Tipologia
                      <ArrowUpDown size={12} className={sortConfig?.key === 'type' ? 'text-institutional-700' : 'text-slate-300'} />
                    </button>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded p-1 text-[11px] outline-none focus:ring-1 focus:ring-institutional-700 no-print"
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                    >
                      <option value="">Tutte</option>
                      {Object.values(InterventoType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </th>
                <ColumnHeader label="RUP" sortKey="currentRup" filterKey="rup" filters={filters} setFilters={setFilters} requestSort={requestSort} sortConfig={sortConfig} />
                <ColumnHeader label="Importo" sortKey="amount" filterKey="amount" filters={filters} setFilters={setFilters} requestSort={requestSort} sortConfig={sortConfig} />
                <th className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider no-print">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map(i => (
                <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag size={12} className="text-institutional-700" />
                      <span className="text-sm font-black text-slate-900">{i.title || 'Senza Titolo'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-500 uppercase">{i.cig}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-medium">{i.targetName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded badge uppercase tracking-tighter ${i.type.includes('Straordinario') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {i.type.split(' ').pop()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{i.currentRup}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">€ {i.amount.toLocaleString('it-IT')}</td>
                  <td className="px-4 py-3 text-right no-print">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onView(i.id)}
                        className="p-1.5 text-slate-400 hover:text-institutional-700 hover:bg-institutional-50 rounded"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => onEdit(i.id)}
                        className="p-1.5 text-slate-400 hover:text-institutional-700 hover:bg-institutional-50 rounded"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr className="no-print">
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center text-slate-400">
                      <Search size={40} className="mb-2 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">Nessun dato corrispondente ai filtri.</p>
                      <button onClick={clearFilters} className="text-xs text-institutional-700 mt-2 hover:underline font-black uppercase tracking-widest">Resetta filtri</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataView;
