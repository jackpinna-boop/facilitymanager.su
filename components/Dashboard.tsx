
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { AppState, InterventoType } from '../types';
import { Building2, Map as MapIcon, Navigation, ShieldCheck, Wallet, Calendar, Filter, ClipboardList, Clock, Search, CheckSquare, Square } from 'lucide-react';

interface DashboardProps {
  state: AppState;
  onSelectAsset: (id: string) => void;
}

const COLORS = ['#006600', '#16a34a', '#4ade80', '#052e16', '#22c55e', '#14532d'];

const StatCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all group">
    <div className={`p-3 rounded-xl bg-institutional-50 text-institutional-700 group-hover:bg-institutional-700 group-hover:text-white transition-colors duration-300`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ state, onSelectAsset }) => {
  const currentYear = new Date().getFullYear();

  // Filtri per Grafico Storico
  const [filterType, setFilterType] = useState<'all' | 'buildings' | 'roads'>('all');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('all');

  // Filtri per "Stato Manutenzioni" (Pie Chart)
  const [maintenanceTimeMode, setMaintenanceTimeMode] = useState<'currentYear' | 'specificYear' | 'range'>('currentYear');
  const [maintenanceYear, setMaintenanceYear] = useState<number>(currentYear);
  const [maintenanceRange, setMaintenanceRange] = useState({ start: '', end: '' });
  const [selectedMaintenanceTypes, setSelectedMaintenanceTypes] = useState<InterventoType[]>(Object.values(InterventoType));

  // Filtri per la sezione Dettaglio Asset (Tabella)
  const [assetCategory, setAssetCategory] = useState<'plessi' | 'roads'>('plessi');
  const [timeMode, setTimeMode] = useState<'range' | '6months' | 'year'>('year');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const totalBuildings = state.structures.length;
  const totalRoads = state.roads.length;
  const totalKm = state.roads.reduce((acc, r) => acc + r.lengthKm, 0);
  const totalBudget = state.interventi.reduce((acc, i) => acc + i.amount, 0);

  const institutionalCrest = "https://provincia-sulcis-iglesiente-api.municipiumapp.it/s3/150x150/s3/20243/sito/stemma.jpg";

  const procedureStats = [
    { 
      name: 'Edifici', 
      interventi: state.interventi.filter(i => i.targetType !== 'road').length 
    },
    { 
      name: 'Strade', 
      interventi: state.interventi.filter(i => i.targetType === 'road').length 
    }
  ];

  const { interventionTypesData, totalInterventionsCount } = useMemo(() => {
    const filteredByTime = state.interventi.filter(i => {
      const iDate = new Date(i.dateStart || i.createdAt);
      
      if (maintenanceTimeMode === 'currentYear') {
        return iDate.getFullYear() === currentYear;
      }
      if (maintenanceTimeMode === 'specificYear') {
        return iDate.getFullYear() === maintenanceYear;
      }
      if (maintenanceTimeMode === 'range' && maintenanceRange.start && maintenanceRange.end) {
        return iDate >= new Date(maintenanceRange.start) && iDate <= new Date(maintenanceRange.end);
      }
      return true;
    });

    const data = Object.values(InterventoType)
      .filter(type => selectedMaintenanceTypes.includes(type))
      .map(type => {
        return {
          name: type,
          value: filteredByTime.filter(i => i.type === type).length
        };
      })
      .filter(item => item.value > 0);

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    
    return { 
      interventionTypesData: data, 
      totalInterventionsCount: total 
    };
  }, [state.interventi, maintenanceTimeMode, maintenanceYear, maintenanceRange, selectedMaintenanceTypes, currentYear]);

  const toggleMaintenanceType = (type: InterventoType) => {
    setSelectedMaintenanceTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const yearlyStats = useMemo(() => {
    let filteredInterventions = state.interventi;

    if (filterType === 'buildings') {
      if (selectedAssetId === 'all') {
        filteredInterventions = filteredInterventions.filter(i => i.targetType !== 'road');
      } else {
        filteredInterventions = filteredInterventions.filter(i => i.targetId === selectedAssetId);
      }
    } else if (filterType === 'roads') {
      if (selectedAssetId === 'all') {
        filteredInterventions = filteredInterventions.filter(i => i.targetType === 'road');
      } else {
        filteredInterventions = filteredInterventions.filter(i => i.targetId === selectedAssetId);
      }
    }

    const yearMap: Record<string, number> = {};
    filteredInterventions.forEach(i => {
      const date = i.dateStart || i.createdAt;
      const year = new Date(date).getFullYear().toString();
      yearMap[year] = (yearMap[year] || 0) + 1;
    });

    return Object.entries(yearMap)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [state.interventi, filterType, selectedAssetId]);

  const assetInterventionSummary = useMemo(() => {
    const today = new Date();
    
    const filteredInterventions = state.interventi.filter(i => {
      const iDate = new Date(i.dateStart || i.createdAt);
      
      if (timeMode === '6months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        return iDate >= sixMonthsAgo;
      }
      if (timeMode === 'year') {
        return iDate.getFullYear() === selectedYear;
      }
      if (timeMode === 'range' && customRange.start && customRange.end) {
        return iDate >= new Date(customRange.start) && iDate <= new Date(customRange.end);
      }
      return true;
    });

    let assets: { id: string, name: string, info: string }[] = [];
    if (assetCategory === 'roads') {
      assets = state.roads.map(r => ({ id: r.id, name: r.code, info: r.name }));
    } else {
      state.structures.forEach(s => {
        s.plessi.forEach(p => {
          assets.push({ id: p.id, name: p.name, info: s.name });
        });
      });
    }

    return assets.map(asset => {
      const related = filteredInterventions.filter(i => i.targetId === asset.id);
      const countsByType: Record<string, number> = {};
      
      related.forEach(i => {
        countsByType[i.type] = (countsByType[i.type] || 0) + 1;
      });

      return {
        ...asset,
        total: related.length,
        types: Object.entries(countsByType).map(([type, count]) => ({ type, count }))
      };
    }).filter(a => a.total > 0 || timeMode === 'year');
  }, [state, assetCategory, timeMode, customRange, selectedYear]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const RADIAN = Math.PI / 180;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-black pointer-events-none">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700">
      {/* Intestazione Istituzionale Responsive */}
      <div className="bg-white rounded-3xl p-6 lg:p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-10 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 p-12 opacity-[0.05] pointer-events-none transform rotate-12">
           <img src={institutionalCrest} className="w-80" alt="" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 lg:gap-8 relative z-10">
          <div className="w-24 h-24 lg:w-36 lg:h-36 bg-white rounded-full p-3 lg:p-4 flex items-center justify-center border-4 border-slate-50 shadow-2xl overflow-hidden bg-gradient-to-br from-white to-slate-100">
             <img 
               src={institutionalCrest} 
               alt="Stemma Istituzionale"
               className="w-full h-full object-contain drop-shadow-2xl"
             />
          </div>
          <div>
            <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 mb-1">
               <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase">Gestionale Asset</h2>
               <span className="px-3 py-1 bg-institutional-700 text-white text-[9px] font-black rounded-full uppercase tracking-widest">Istituzionale</span>
            </div>
            <p className="text-xl lg:text-2xl font-medium text-institutional-700 tracking-tight">Provincia</p>
            <p className="text-slate-500 font-medium max-w-xl mt-4 leading-relaxed text-sm hidden md:block">
              Software gestionale centralizzato per il monitoraggio analitico del patrimonio immobiliare e viario. Controllo CIG, RUP e budget integrato.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3 relative z-10 shrink-0">
           <div className="flex items-center gap-2 text-institutional-700 bg-institutional-50 px-4 py-2 rounded-2xl text-[10px] font-black border border-institutional-100 shadow-sm uppercase">
             <ShieldCheck size={14} /> SISTEMA CERTIFICATO
           </div>
           <div className="text-center md:text-right">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Data Corrente</p>
             <p className="text-xs lg:text-sm font-bold text-slate-700 uppercase">{new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
           </div>
        </div>
      </div>

      {/* Grid Statistiche Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard icon={Building2} label="Plessi Immobiliari" value={totalBuildings} />
        <StatCard icon={MapIcon} label="Strade Provinciali" value={totalRoads} />
        <StatCard icon={Navigation} label="Rete Stradale" value={`${totalKm.toFixed(1)} Km`} />
        <StatCard icon={Wallet} label="Budget Totale" value={`€ ${totalBudget.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Distribuzione per Asset */}
        <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <h3 className="text-base lg:text-lg font-black text-slate-800 uppercase tracking-tight">Distribuzione per Asset</h3>
          </div>
          <div className="h-64 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={procedureStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Bar dataKey="interventi" fill="#006600" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stato Manutenzioni Responsive */}
        <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <h3 className="text-base lg:text-lg font-black text-slate-800 uppercase tracking-tight">Stato Manutenzioni</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tipologie attive nel periodo</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 no-print">
               <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100">
                  <Clock size={12} className="text-slate-400" />
                  <select 
                    className="bg-transparent border-none text-[8px] font-black uppercase tracking-widest text-slate-700 focus:ring-0 cursor-pointer p-0"
                    value={maintenanceTimeMode}
                    onChange={(e) => setMaintenanceTimeMode(e.target.value as any)}
                  >
                    <option value="currentYear">Anno Corrente</option>
                    <option value="specificYear">Anno Specifico</option>
                    <option value="range">Libero</option>
                  </select>
               </div>
            </div>
          </div>

          <div className="flex-1 min-h-[250px] w-full relative">
            {interventionTypesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={interventionTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {interventionTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', fontSize: '10px'}}
                  />
                  <Legend 
                    layout="horizontal" 
                    align="center" 
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '8px' }}
                    formatter={(value) => <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-3 text-center p-4">
                <Search size={24} className="opacity-20" />
                <p className="text-[9px] font-black uppercase tracking-widest italic">Nessuna manutenzione registrata</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dettaglio Interventi Responsive (Tabella con scroll orizzontale) */}
      <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 lg:p-8 bg-slate-50 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
            <div>
              <h3 className="text-base lg:text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                <ClipboardList className="text-institutional-700" size={20} /> Dettaglio Asset
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center no-print">
              <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setAssetCategory('plessi')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${assetCategory === 'plessi' ? 'bg-institutional-700 text-white' : 'text-slate-500'}`}
                >
                  Plessi
                </button>
                <button 
                  onClick={() => setAssetCategory('roads')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${assetCategory === 'roads' ? 'bg-institutional-700 text-white' : 'text-slate-500'}`}
                >
                  Strade
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identificativo</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Struttura</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Interventi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assetInterventionSummary.map(asset => (
                <tr 
                  key={asset.id} 
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => onSelectAsset(asset.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${assetCategory === 'roads' ? 'bg-slate-900 text-white' : 'bg-institutional-50 text-institutional-700'}`}>
                        {assetCategory === 'roads' ? <Navigation size={14} /> : <Building2 size={14} />}
                      </div>
                      <span className="text-xs font-black text-slate-900 uppercase">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{asset.info}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-[10px] ${asset.total > 0 ? 'bg-institutional-700 text-white shadow-md' : 'bg-slate-100 text-slate-300'}`}>
                      {asset.total}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
