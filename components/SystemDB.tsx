
import React, { useState } from 'react';
import { Database, Copy, Check, FileCode, Server, ShieldCheck, Terminal, Brackets, FileJson } from 'lucide-react';

const SystemDB: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSchema, setActiveSchema] = useState<'sql' | 'json'>('sql');

  const sqlSchema = `-- ======================================================
-- EDILGEST PRO - SUPABASE COMPREHENSIVE MIGRATION SCHEMA
-- VERSION 2.5.0 - PRODUCTION ENVIRONMENT SETUP
-- ======================================================

-- 0. ESTENSIONI E UTILITY
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Funzione per aggiornamento automatico timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. TABELLA UTENTI (Profilo esteso e permessi)
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

-- 2. PATRIMONIO IMMOBILIARE (Asset Principali)
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

-- 3. UNITÀ LOCALI (Plessi nidificati)
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

-- 4. PERTINENZE (Sotto-unità tecniche)
CREATE TABLE IF NOT EXISTS public.pertinenze (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plesso_id UUID REFERENCES public.plessi(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RETE VIARIA (Asset infrastrutturali)
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

-- 6. REGISTRO INTERVENTI (Gare e Manutenzioni)
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

-- INDICI DI PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_interventi_cig_trgm ON public.interventi USING gin (cig gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_interventi_target ON public.interventi(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_structures_name_trgm ON public.structures USING gin (name gin_trgm_ops);
`;

  const jsonSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EdilGest Pro Data Schema",
  "description": "Struttura dati per lo storage locale e l'integrità del sistema",
  "type": "object",
  "required": ["structures", "roads", "interventi", "users"],
  "properties": {
    "structures": {
      "type": "array",
      "items": { "$ref": "#/definitions/MainStructure" }
    },
    "roads": {
      "type": "array",
      "items": { "$ref": "#/definitions/Road" }
    },
    "interventi": {
      "type": "array",
      "items": { "$ref": "#/definitions/Intervento" }
    }
  },
  "definitions": {
    "MainStructure": {
      "type": "object",
      "required": ["id", "name", "address", "uniqueCode"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string" },
        "address": { "type": "string" },
        "uniqueCode": { "type": "string", "pattern": "^IMM_\\\\d{6}$" },
        "costCenter": { "type": "string" },
        "plessi": {
          "type": "array",
          "items": { "$ref": "#/definitions/Plesso" }
        }
      }
    },
    "Plesso": {
      "type": "object",
      "required": ["id", "name", "uniqueCode"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string" },
        "uniqueCode": { "type": "string", "pattern": "^PLX_\\\\d{6}$" },
        "costCenter": { "type": "string" }
      }
    },
    "Road": {
      "type": "object",
      "required": ["id", "code", "name", "uniqueCode"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "code": { "type": "string", "description": "Codice SP" },
        "name": { "type": "string" },
        "uniqueCode": { "type": "string", "pattern": "^STR_\\\\d{6}$" },
        "lengthKm": { "type": "number" }
      }
    },
    "Intervento": {
      "type": "object",
      "required": ["id", "cig", "targetId", "type"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "cig": { "type": "string", "minLength": 10 },
        "targetId": { "type": "string" },
        "targetType": { "enum": ["structure", "plesso", "road"] },
        "amount": { "type": "number", "minimum": 0 },
        "dateStart": { "type": "string", "format": "date" }
      }
    }
  }
}`;

  const copyToClipboard = () => {
    const textToCopy = activeSchema === 'sql' ? sqlSchema : jsonSchema;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-institutional-50 text-institutional-700 rounded-3xl shadow-sm">
             <Database size={32} />
           </div>
           <div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Infrastruttura Dati</h2>
             <p className="text-sm text-slate-500 font-medium italic">Documentazione tecnica per l'integrazione e la validazione dei dati</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex p-1 bg-slate-100 rounded-2xl shadow-inner shrink-0">
             <button 
               onClick={() => setActiveSchema('sql')}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeSchema === 'sql' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <FileCode size={14} /> Schema SQL
             </button>
             <button 
               onClick={() => setActiveSchema('json')}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeSchema === 'json' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <FileJson size={14} /> Schema JSON
             </button>
          </div>

          <button 
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 whitespace-nowrap ${copied ? 'bg-emerald-600 text-white shadow-emerald-700/20' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'}`}
          >
            {copied ? <><Check size={16} /> Copiato</> : <><Copy size={16} /> Copia {activeSchema.toUpperCase()}</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
               <div className="flex items-center gap-2">
                 {activeSchema === 'sql' ? <Terminal size={16} className="text-institutional-400" /> : <Brackets size={16} className="text-institutional-400" />}
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {activeSchema === 'sql' ? 'migration_schema_v2.5.sql' : 'data_definition_v2.5.json'}
                 </span>
               </div>
               <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
               </div>
            </div>
            <pre className="p-8 text-xs font-mono text-institutional-400 overflow-x-auto custom-scrollbar max-h-[70vh] leading-relaxed">
              <code>{activeSchema === 'sql' ? sqlSchema : jsonSchema}</code>
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
              <ShieldCheck size={16} className="text-institutional-700" /> Note Tecniche
            </h3>
            <div className="space-y-4">
               {activeSchema === 'sql' ? (
                 <>
                   <div className="flex items-start gap-3">
                     <div className="w-6 h-6 rounded bg-institutional-50 text-institutional-700 flex items-center justify-center shrink-0 font-bold text-[10px]">1</div>
                     <p className="text-[11px] text-slate-600 leading-relaxed font-medium"><b>SQL Migration:</b> Script ottimizzato per Supabase con gestione automatica di UUID e indici testuali (GIN).</p>
                   </div>
                   <div className="flex items-start gap-3">
                     <div className="w-6 h-6 rounded bg-institutional-50 text-institutional-700 flex items-center justify-center shrink-0 font-bold text-[10px]">2</div>
                     <p className="text-[11px] text-slate-600 leading-relaxed font-medium"><b>Cascade:</b> Relazioni gerarchiche protette da eliminazione a cascata per prevenire dati orfani.</p>
                   </div>
                 </>
               ) : (
                 <>
                   <div className="flex items-start gap-3">
                     <div className="w-6 h-6 rounded bg-institutional-50 text-institutional-700 flex items-center justify-center shrink-0 font-bold text-[10px]">1</div>
                     <p className="text-[11px] text-slate-600 leading-relaxed font-medium"><b>JSON Schema:</b> Utilizzato per validare gli oggetti in ingresso durante l'importazione CSV e la sincronizzazione API.</p>
                   </div>
                   <div className="flex items-start gap-3">
                     <div className="w-6 h-6 rounded bg-institutional-50 text-institutional-700 flex items-center justify-center shrink-0 font-bold text-[10px]">2</div>
                     <p className="text-[11px] text-slate-600 leading-relaxed font-medium"><b>RegEx Validation:</b> Codici univoci (IMM_, PLX_, STR_) validati tramite espressioni regolari.</p>
                   </div>
                 </>
               )}
            </div>
          </div>

          <div className="bg-institutional-50 p-8 rounded-[2rem] border border-institutional-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-institutional-800 uppercase tracking-widest flex items-center gap-2">
              <Server size={16} /> Deploy & Interoperabilità
            </h3>
            <p className="text-[11px] text-institutional-700 leading-relaxed italic">
              {activeSchema === 'sql' 
                ? 'Esegui lo script nel SQL Editor di Supabase per attivare il backend cloud.' 
                : 'Utilizza questo schema per mappare flussi di dati provenienti da sistemi terzi (es. Ragioneria).'}
            </p>
            <div className="pt-4 border-t border-institutional-200">
               <div className="flex items-center justify-between">
                 <span className="text-[9px] font-black text-institutional-600 uppercase">Versione</span>
                 <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">STABLE 2.5.0</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDB;
