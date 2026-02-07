
import React, { useState, useMemo } from 'react';
import { AppState, MainStructure, Road } from '../types';
import { 
  Search, 
  Building2, 
  Map as MapIcon, 
  ChevronRight, 
  Info, 
  LayoutGrid, 
  Hash, 
  Wallet,
  Grid,
  LayoutList,
  Filter,
  X,
  ShieldCheck
} from 'lucide-react';
import AssetDetailModal, { UnifiedAsset } from './AssetDetailModal';

interface Props {
  state: AppState;
  onEditBuilding: (building: MainStructure) => void;
  onEditRoad: (road: Road) => void;
}

const TechnicalRegistry: React.FC<Props> = ({ state, onEditBuilding, onEditRoad }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'buildings' | 'roads'>('buildings');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Stati per i Filtri
  const [filterCostCenter, setFilterCostCenter] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRoadStatus, setFilterRoadStatus] = useState<string>('all');

  const allAssets: UnifiedAsset[] = useMemo(() => {
    if (activeCategory === 'roads') {
      return state.roads.map(r => ({
        id: r.id,
        type: 'road',
        name: r.name,
        code: r.code,
        uniqueCode: r.uniqueCode,
        costCenter: r.costCenter,
        technicalData: r.technicalData,
        originalData: r
      }));
    } else {
      const list: UnifiedAsset[] = [];
      state.structures.forEach(s => {
        list.push({
          id: s.id,
          type: 'structure',
          name: s.name,
          previousNames: s.previousNames,
          address: s.address,
          uniqueCode: s.uniqueCode,
          costCenter: s.costCenter,
          technicalData: s.technicalData,
          originalData: s
        });
        s.plessi.forEach(p => {
          list.push({
            id: p.id,
            type: 'plesso',
            name: p.name,
            previousNames: p.previousNames,
            parentName: s.name,
            address: s.address,
            uniqueCode: p.uniqueCode,
            costCenter: p.costCenter,
            technicalData: p.technicalData,
            originalData: p
          });
        });
      });
      return list;
    }
  }, [state, activeCategory]);

  const uniqueCostCenters = useMemo(() => {
    const centers = new Set(allAssets.map(a => a.costCenter).filter(Boolean));
    return Array.from(centers).sort();
  }, [allAssets]);

  const filteredAssets = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allAssets.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(term) || 
        (a.address || '').toLowerCase().includes(term) ||
        (a.uniqueCode || '').toLowerCase().includes(term) ||
        (a.parentName || '').toLowerCase().includes(term) ||
        (a.code || '').toLowerCase().includes(term);
      const matchesCostCenter = filterCostCenter === 'all' || a.costCenter === filterCostCenter;
      const matchesType = filterType === 'all' || a.type === filterType;
      const matchesRoadStatus = filterRoadStatus === 'all' || 
        (a.type === 'road' && a.technicalData?.maintenanceStatus === filterRoadStatus);
      return matchesSearch && matchesCostCenter && matchesType && matchesRoadStatus;
    });
  }, [allAssets, searchTerm, filterCostCenter, filterType, filterRoadStatus]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterCostCenter('all');
    setFilterType('all');
    setFilterRoadStatus('all');
  };

  const activeFilterCount = (searchTerm ? 1 : 0) + 
    (filterCostCenter !== 'all' ? 1 : 0) + 
    (filterType !== 'all' ? 1 : 0) + 
    (filterRoadStatus !== 'all' ? 1 : 0);

  // Memoize the selected asset based on the selected ID to resolve UI reference errors
  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    return allAssets.find(a => a.id === selectedAssetId) || null;
  }, [allAssets, selectedAssetId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 no-print">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase">Registro Tecnico Asset</h2>
          <p className="text-xs lg:text-sm text-slate-500 font-medium italic">Consultazione analitica dei dati patrimoniali</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="flex p-1 bg-slate-100 rounded-xl shrink-0">
             <button onClick={() => setViewMode('grid')} className={`flex-1 sm:flex-none p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-400'}`}><Grid size={18} /></button>
             <button onClick={() => setViewMode('list')} className={`flex-1 sm:flex-none p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-400'}`}><LayoutList size={18} /></button>
          </div>
          <div className="flex p-1 bg-slate-100 rounded-2xl w-full shadow-inner">
            <button 
              onClick={() => { setActiveCategory('buildings'); setSelectedAssetId(null); resetFilters(); }}
              className={`flex-1 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeCategory === 'buildings' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Building2 size={14} /> Immobili
            </button>
            <button 
              onClick={() => { setActiveCategory('roads'); setSelectedAssetId(null); resetFilters(); }}
              className={`flex-1 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeCategory === 'roads' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <MapIcon size={14} /> Strade
            </button>
          </div>
        </div>
      </div>

      {/* Barra dei Filtri Responsive */}
      <div className="bg-white p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm space-y-4 no-print">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ricerca Libera</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-institutional-700 transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Asset o codici..."
                className="w-full pl-11 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-institutional-700 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Centro Costo</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-institutional-700"
                value={filterCostCenter}
                onChange={(e) => setFilterCostCenter(e.target.value)}
              >
                <option value="all">Tutti</option>
                {uniqueCostCenters.map(cdc => <option key={cdc} value={cdc}>{cdc}</option>)}
              </select>
            </div>

            {activeCategory === 'buildings' ? (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipologia</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-institutional-700"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tutte</option>
                  <option value="structure">Fabbricati</option>
                  <option value="plesso">Plessi</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Stato</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-institutional-700"
                  value={filterRoadStatus}
                  onChange={(e) => setFilterRoadStatus(e.target.value)}
                >
                  <option value="all">Tutti</option>
                  <option value="ottimo">Ottimo</option>
                  <option value="buono">Buono</option>
                  <option value="sufficiente">Sufficiente</option>
                  <option value="degradato">Degradato</option>
                </select>
              </div>
            )}

            <button 
              onClick={resetFilters}
              className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all lg:mt-5 ${
                activeFilterCount > 0 
                  ? 'bg-red-50 text-red-600 border border-red-100' 
                  : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
              }`}
              disabled={activeFilterCount === 0}
            >
              <X size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 no-print">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
                className="bg-white p-5 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 text-left group relative overflow-hidden flex flex-col h-full"
              >
                  <div className="flex justify-between items-start mb-4 lg:mb-6">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      asset.type === 'road' ? 'bg-slate-900 text-white' : 
                      asset.type === 'plesso' ? 'bg-white border border-institutional-100 text-institutional-600' : 
                      'bg-institutional-50 text-institutional-700'
                    }`}>
                      {asset.type === 'road' ? <span className="text-[9px] font-black">{asset.code}</span> : 
                       asset.type === 'plesso' ? <LayoutGrid size={18} /> : <Building2 size={18} />}
                    </div>
                    <span className={`text-[7px] lg:text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                      asset.type === 'structure' ? 'bg-blue-50 text-blue-600' : 
                      asset.type === 'plesso' ? 'bg-purple-50 text-purple-600' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {asset.type === 'structure' ? 'Fabbricato' : asset.type === 'plesso' ? 'Unità' : 'Strada'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm lg:text-base font-black text-slate-900 leading-tight group-hover:text-institutional-700 transition-colors mb-1 truncate">
                      {asset.name}
                    </h4>
                    <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase truncate mb-4">
                      {asset.type === 'plesso' ? `In: ${asset.parentName}` : (asset.address || asset.code)}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      Vedi Dettagli
                    </div>
                    <ChevronRight size={14} className="text-slate-200 group-hover:text-institutional-700 group-hover:translate-x-1 transition-all" />
                  </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
                    <th className="px-6 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tipo</th>
                    <th className="px-6 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <div>
                          <p className="font-black text-slate-900 text-sm leading-none mb-1 group-hover:text-institutional-700">{asset.name}</p>
                          <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase">{asset.uniqueCode || '---'}</p>
                        </div>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5 text-center">
                        <span className={`text-[8px] lg:text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${asset.type === 'structure' ? 'bg-blue-50 text-blue-700' : asset.type === 'plesso' ? 'bg-purple-50 text-purple-700' : 'bg-slate-900 text-white'}`}>
                          {asset.type}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5 text-right">
                         <button onClick={() => setSelectedAssetId(asset.id)} className="text-[8px] lg:text-[10px] font-black text-institutional-700 uppercase tracking-widest bg-institutional-50 px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl border border-institutional-100 hover:bg-institutional-700 hover:text-white transition-all">Dettagli</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedAsset && (
        <AssetDetailModal 
          selectedAsset={selectedAsset} 
          interventi={state.interventi} 
          onClose={() => setSelectedAssetId(null)} 
        />
      )}
    </div>
  );
};

export default TechnicalRegistry;
