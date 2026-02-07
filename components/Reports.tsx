
import React, { useState, useMemo } from 'react';
import { AppState, InterventoType, Intervento } from '../types';
import { FileText, Download, Filter, Search, TrendingUp, PieChart as PieIcon, ChevronDown, Database, FileCode } from 'lucide-react';
import { exportToCSV } from '../utils/persistence';

interface Props {
  state: AppState;
}

const Reports: React.FC<Props> = ({ state }) => {
  const [filters, setFilters] = useState({
    structureId: '',
    type: '',
    rup: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });

  const [isAdvancedVisible, setIsAdvancedVisible] = useState(false);

  const currentUser = useMemo(() => {
    return state.users.find(u => u.id === state.currentUserId) || null;
  }, [state.users, state.currentUserId]);

  const reportData = useMemo(() => {
    return state.interventi.filter(i => {
      const matchStructure = !filters.structureId || i.targetId === filters.structureId;
      const matchType = !filters.type || i.type === filters.type;
      const matchRup = !filters.rup || i.currentRup.toLowerCase().includes(filters.rup.toLowerCase());
      const matchDateFrom = !filters.dateFrom || (i.dateStart && i.dateStart >= filters.dateFrom);
      const matchDateTo = !filters.dateTo || (i.dateEnd && i.dateEnd <= filters.dateTo);
      const matchMinAmount = !filters.minAmount || i.amount >= Number(filters.minAmount);
      const matchMaxAmount = !filters.maxAmount || i.amount <= Number(filters.maxAmount);

      return matchStructure && matchType && matchRup && matchDateFrom && matchDateTo && matchMinAmount && matchMaxAmount;
    });
  }, [state, filters]);

  const summary = useMemo(() => {
    const totalCost = reportData.reduce((acc, i) => acc + i.amount, 0);
    const count = reportData.length;
    const avgCost = count > 0 ? totalCost / count : 0;
    return { totalCost, count, avgCost };
  }, [reportData]);

  const downloadPostgresConfig = () => {
    const configData = {
      system: "EdilGest Pro - Provincia",
      version: "2.5.0",
      target_db: "PostgreSQL 16+",
      schema_mapping: {
        structures: { 
          table: "structures", 
          columns: ["id", "unique_code", "cost_center", "name", "previous_names", "address", "description", "lat", "lng", "technical_data"] 
        },
        plessi: { 
          table: "plessi", 
          columns: ["id", "unique_code", "cost_center", "structure_id", "name", "previous_names", "description", "technical_data"] 
        },
        pertinenze: {
          table: "pertinenze",
          columns: ["id", "plesso_id", "name", "description"]
        },
        roads: { 
          table: "roads", 
          columns: ["id", "unique_code", "cost_center", "code", "name", "length_km", "description", "lat", "lng", "technical_data"] 
        },
        interventi: { 
          table: "interventi", 
          columns: ["id", "unique_code", "cig", "target_id", "target_type", "type", "title", "oggetto", "description", "current_rup", "rup_history", "amount", "date_start", "date_end", "date_delivery", "date_test", "suspensions", "extensions", "lat", "lng"] 
        },
        users: { 
          table: "users", 
          columns: ["id", "username", "first_name", "last_name", "email", "role", "accessible_tabs", "is_ldap_user"] 
        },
        app_config: {
          table: "app_config",
          columns: ["id", "category", "settings_json"]
        }
      },
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edilgest_postgres_mapping_v2.5.json'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadSupabaseSql = () => {
    const sqlContent = `-- ======================================================
-- EDILGEST PRO - SUPABASE COMPREHENSIVE MIGRATION SCHEMA
-- VERSION 2.5.0 - PRODUCTION ENVIRONMENT SETUP
-- ======================================================

-- 0. EXTENSIONS & UTILITIES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. USERS & ACCESS CONTROL
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'user')),
  accessible_tabs TEXT[] DEFAULT '{}',
  is_ldap_user BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- 2. ASSET HIERARCHY: STRUCTURES
CREATE TABLE IF NOT EXISTS public.structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_code TEXT UNIQUE NOT NULL,
  cost_center TEXT,
  name TEXT NOT NULL,
  previous_names TEXT[] DEFAULT '{}',
  address TEXT NOT NULL,
  description TEXT,
  lat NUMERIC(12, 9),
  lng NUMERIC(12, 9),
  technical_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at_structs BEFORE UPDATE ON public.structures FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- 3. ASSET HIERARCHY: PLESSI (Unit Locales)
CREATE TABLE IF NOT EXISTS public.plessi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_code TEXT UNIQUE NOT NULL,
  cost_center TEXT,
  structure_id UUID REFERENCES public.structures(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  previous_names TEXT[] DEFAULT '{}',
  description TEXT,
  technical_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ASSET HIERARCHY: PERTINENZE
CREATE TABLE IF NOT EXISTS public.pertinenze (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plesso_id UUID REFERENCES public.plessi(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ASSET CATEGORY: ROADS
CREATE TABLE IF NOT EXISTS public.roads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_code TEXT UNIQUE NOT NULL,
  cost_center TEXT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  length_km NUMERIC(10, 3) DEFAULT 0,
  description TEXT,
  lat NUMERIC(12, 9),
  lng NUMERIC(12, 9),
  technical_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. INTERVENTIONS REGISTER
CREATE TABLE IF NOT EXISTS public.interventi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_code TEXT UNIQUE,
  cig TEXT NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('structure', 'plesso', 'pertinenza', 'road')),
  type TEXT NOT NULL CHECK (type IN ('Interventi Ordinari', 'Interventi Straordinari', 'Manutenzioni', 'Interventi a seguito di progettazione', 'Sola Progettazione')),
  title TEXT NOT NULL,
  oggetto TEXT,
  description TEXT,
  current_rup TEXT,
  rup_history JSONB DEFAULT '[]',
  amount NUMERIC(15, 2) DEFAULT 0,
  date_delivery DATE,
  date_start DATE,
  date_end DATE,
  date_test DATE,
  suspensions JSONB DEFAULT '[]',
  extensions JSONB DEFAULT '[]',
  lat NUMERIC(12, 9),
  lng NUMERIC(12, 9),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SYSTEM CONFIGURATION & SETTINGS
CREATE TABLE IF NOT EXISTS public.app_config (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  settings_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. KNOWLEDGE BASE (MANUALS)
CREATE TABLE IF NOT EXISTS public.manual_contents (
  id TEXT PRIMARY KEY,
  title TEXT,
  content TEXT,
  external_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. AUDIT LOGGING
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'PURGE', 'LOGIN')),
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT
);

-- PERFORMANCE INDEXES
CREATE INDEX idx_interventi_cig_trgm ON public.interventi USING gin (cig gin_trgm_ops);
CREATE INDEX idx_interventi_target ON public.interventi(target_id, target_type);
CREATE INDEX idx_structures_name_trgm ON public.structures USING gin (name gin_trgm_ops);
CREATE INDEX idx_plessi_parent ON public.plessi(structure_id);
CREATE INDEX idx_roads_code ON public.roads(code);

-- SECURITY: ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permetti lettura a tutti gli autenticati" ON public.interventi FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestione totale per admin" ON public.interventi FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- SEED DATA: INITIAL SYSTEM USERS
INSERT INTO public.users (id, username, first_name, last_name, email, role, accessible_tabs)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin', 'Amministratore', 'Sistema', 'admin@provincia.it', 'admin', '{dashboard,buildings,roads,map-view,interventions,data-view,csv-import,reports,history,user-management,tech-registry,manuals}')
ON CONFLICT (username) DO NOTHING;

-- SEED DATA: DEFAULT CONFIGURATIONS
INSERT INTO public.app_config (id, category, settings_json)
VALUES 
('notifications', 'system', '{"daysBeforeDeadline": 7, "notifyStart": true, "notifyEnd": true, "notifyTest": true}'),
('security', 'policy', '{"enforceDomainCheck": false, "allowedDomains": []}')
ON CONFLICT (id) DO UPDATE SET settings_json = EXCLUDED.settings_json;

-- SEED DATA: INITIAL MANUAL ENTRIES
INSERT INTO public.manual_contents (id, title, content)
VALUES 
('censimento-immobile', 'Guida Censimento Immobili', 'Istruzioni operative per il caricamento del patrimonio immobiliare.'),
('man-1', 'Gestione CIG e RUP', 'Procedure per la corretta registrazione degli interventi manutentivi.')
ON CONFLICT (id) DO NOTHING;
`;

    const blob = new Blob([sqlContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edilgest_full_supabase_migration_v2.5.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reporting & Analisi Sistema</h2>
          <p className="text-sm text-slate-500 font-medium">Gestione flussi dati, integrazioni SQL e monitoraggio budget</p>
        </div>
        <div className="flex gap-2">
          {currentUser?.role === 'admin' && (
            <>
              <button 
                onClick={downloadSupabaseSql}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95"
                title="Scarica script SQL per Supabase/PostgreSQL"
              >
                <FileCode size={16} /> SQL Full Migration
              </button>
              <button 
                onClick={downloadPostgresConfig}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95"
                title="Scarica mapping colonne per PostgreSQL"
              >
                <Database size={16} /> Mapping Postgres
              </button>
            </>
          )}
          
          <button 
            onClick={() => exportToCSV(reportData, `export_edilgest_interventi_${new Date().toISOString().slice(0,10)}`)}
            className="bg-institutional-700 hover:bg-institutional-800 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-institutional-700/20 active:scale-95"
          >
            <Download size={18} /> Esporta Registro CSV
          </button>
        </div>
      </div>

      {/* Area Filtri */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6 text-institutional-700">
          <Filter size={20} />
          <h3 className="font-black uppercase tracking-tight text-sm">Filtri Analisi Registro</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Asset</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-institutional-700 transition-all"
              value={filters.structureId}
              onChange={(e) => setFilters({...filters, structureId: e.target.value})}
            >
              <option value="">Tutti gli asset</option>
              <optgroup label="Immobili">
                {state.structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
              <optgroup label="Strade">
                {state.roads.map(r => <option key={r.id} value={r.id}>{r.code} - {r.name}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipologia Intervento</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-institutional-700 transition-all"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">Tutte</option>
              {Object.values(InterventoType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RUP / Responsabile</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="w-full p-3 pl-9 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-institutional-700 transition-all"
                placeholder="Cerca RUP..."
                value={filters.rup}
                onChange={(e) => setFilters({...filters, rup: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => setIsAdvancedVisible(!isAdvancedVisible)}
              className="text-institutional-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline h-10 px-2"
            >
              {isAdvancedVisible ? 'Riduci Filtri' : 'Parametri Avanzati'} <ChevronDown size={14} className={isAdvancedVisible ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>

        {isAdvancedVisible && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dal (Data Inizio)</label>
              <input type="date" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Al (Data Fine)</label>
              <input type="date" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Importo Minimo (€)</label>
              <input type="number" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={filters.minAmount} onChange={e => setFilters({...filters, minAmount: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Importo Massimo (€)</label>
              <input type="number" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={filters.maxAmount} onChange={e => setFilters({...filters, maxAmount: e.target.value})} />
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-institutional-100 transition-colors">
          <div className="p-4 bg-institutional-50 text-institutional-700 rounded-2xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Record Elaborati</p>
            <p className="text-2xl font-black text-slate-900">{summary.count}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-institutional-100 transition-colors">
          <div className="p-4 bg-institutional-50 text-institutional-700 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Impegnato Totale</p>
            <p className="text-2xl font-black text-slate-900">€ {summary.totalCost.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-institutional-100 transition-colors">
          <div className="p-4 bg-institutional-50 text-institutional-700 rounded-2xl">
            <PieIcon size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Costo Medio Intervento</p>
            <p className="text-2xl font-black text-slate-900">€ {summary.avgCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          </div>
        </div>
      </div>

      {/* Tabella Risultati */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <FileCode size={18} className="text-institutional-700" />
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Dettaglio Flusso Dati Interventi</h3>
           </div>
           <span className="text-[10px] font-bold text-slate-400 uppercase italic">Formato Export Ottimizzato per Sistemi Contabili</span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">CIG / Codice Univoco</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Oggetto e Titolo</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">RUP</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Contratto (€)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reportData.map(i => (
              <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-5">
                  <p className="font-black text-slate-900 text-sm tracking-tight uppercase">{i.cig}</p>
                  {i.uniqueCode && <p className="text-[9px] font-black text-institutional-600 uppercase mt-0.5">{i.uniqueCode}</p>}
                </td>
                <td className="px-8 py-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight truncate max-w-xs mb-0.5">{i.title || 'Senza Titolo'}</p>
                  <p className="text-xs font-bold text-slate-600 truncate max-w-md group-hover:text-institutional-700 transition-colors">
                    {i.oggetto || i.description}
                  </p>
                </td>
                <td className="px-8 py-5 text-sm font-bold text-slate-600">{i.currentRup}</td>
                <td className="px-8 py-5 text-right font-black text-slate-900 text-sm">
                  € {i.amount.toLocaleString()}
                </td>
              </tr>
            ))}
            {reportData.length === 0 && (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Database size={40} className="text-slate-100" />
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Nessun record corrispondente ai filtri impostati.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
