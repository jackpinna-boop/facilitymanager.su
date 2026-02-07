
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppState, MainStructure, Plesso, Intervento, AuditLog, NotificationSettings, Road, User, ScheduledExport, SecurityPolicy, InterventoType, ManualEntry } from './types';
import { loadState, saveState, exportToCSV, isCloudEnabled } from './utils/persistence';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InterventionForm from './components/InterventionForm';
import InterventionDetail from './components/InterventionDetail';
import Reports from './components/Reports';
import DataView from './components/DataView';
import BuildingForm from './components/BuildingForm';
import PlessoForm from './components/PlessoForm';
import RoadForm from './components/RoadForm';
import MapSection from './components/MapSection';
import CsvImport from './components/CsvImport';
import UserManagement from './components/UserManagement';
import AssetInterventionsModal from './components/AssetInterventionsModal';
import TechnicalRegistry from './components/TechnicalRegistry';
import AssetDetailModal, { UnifiedAsset } from './components/AssetDetailModal';
import Manuals from './components/Manuals';
import SystemDB from './components/SystemDB';
import { 
  Trash2, 
  Edit3, 
  Building,
  Table,
  Cloud,
  CloudOff,
  Map as MapIcon,
  ClipboardList,
  Plus,
  ChevronRight,
  ChevronDown,
  MapPin,
  ExternalLink,
  History as HistoryIcon,
  ShieldAlert,
  Server,
  Lock,
  User as UserIcon,
  Loader2,
  LogIn,
  KeyRound,
  AlertCircle,
  Key,
  LayoutGrid,
  Hash,
  LayoutList,
  Grid,
  ShieldCheck,
  Layers
} from 'lucide-react';

const SAMPLE_ROAD_ID = "road-sample-sp2";
const SAMPLE_ROAD_ID_2 = "road-sample-sp15";
const SAMPLE_SCHOOL_ID = "struct-scuola-marconi";
const SAMPLE_OFFICE_ID = "struct-provincia-sede";

const ADMIN_SECURITY_PASSWORD = "AdminPassword2025!";

const DEFAULT_STATE: AppState = {
  structures: [
    {
      id: SAMPLE_SCHOOL_ID,
      name: "Liceo Scientifico Statale 'G. Marconi'",
      uniqueCode: "IMM_000101",
      costCenter: "ISTR_AREA_A",
      address: "Via degli Studi 15, Carbonia",
      description: "Edificio scolastico principale risalente agli anni '70, composto da corpo centrale e laboratori.",
      lat: 39.1652,
      lng: 8.5214,
      technicalData: {
        surfaceArea: 4500,
        floors: 3,
        heatingSystem: "Caldaia a condensazione gas naturale",
        fireSafetyStatus: "Certificato prevenzione incendi attivo",
        floorPlans: []
      },
      plessi: [
        {
          id: "plesso-marconi-centrale",
          structureId: SAMPLE_SCHOOL_ID,
          uniqueCode: "PLX_000101",
          name: "Sede Centrale - Corpo A",
          description: "Aule didattiche e uffici amministrativi.",
          pertinenze: []
        },
        {
          id: "plesso-marconi-succursale",
          structureId: SAMPLE_SCHOOL_ID,
          uniqueCode: "PLX_000102",
          name: "Succursale Sud",
          previousNames: ["Ex Laboratorio Tecnico"],
          description: "Plesso distaccato per laboratori informatici e linguistici.",
          pertinenze: []
        }
      ]
    },
    {
      id: SAMPLE_OFFICE_ID,
      name: "Sede Istituzionale Provincia",
      uniqueCode: "IMM_000105",
      costCenter: "AMMIN_CENTRALE",
      address: "Piazza Roma 1, Carbonia",
      description: "Uffici amministrativi centrali dell'ente.",
      lat: 39.1633,
      lng: 8.5222,
      plessi: [
        {
          id: "plesso-prov-uffici",
          structureId: SAMPLE_OFFICE_ID,
          uniqueCode: "PLX_000105",
          name: "Palazzo Regio (Uffici)",
          description: "Sede di rappresentanza e uffici patrimonio.",
          pertinenze: []
        }
      ]
    }
  ],
  roads: [
    {
      id: SAMPLE_ROAD_ID,
      code: "SP 2",
      name: "Villaspeciosa - Siliqua",
      uniqueCode: "STR_000002",
      costCenter: "VIAB_AREA_SUD",
      lengthKm: 24.5,
      description: "Asse viario principale di collegamento sud.",
      lat: 39.2936,
      lng: 8.8921,
      technicalData: {
        pavementType: "Asfalto drenante",
        averageWidth: 8.5,
        maintenanceStatus: "buono",
        surfaceArea: 208250,
        floorPlans: []
      }
    },
    {
      id: SAMPLE_ROAD_ID_2,
      code: "SP 15",
      name: "Tratto Carbonia - Villamassargia",
      uniqueCode: "STR_000015",
      costCenter: "VIAB_AREA_CENTRALE",
      lengthKm: 12.8,
      description: "Collegamento strategico per pendolarismo lavorativo.",
      lat: 39.1822,
      lng: 8.5633,
      technicalData: { pavementType: "Bituminoso", averageWidth: 7.0, maintenanceStatus: "sufficiente", floorPlans: [] }
    }
  ],
  interventi: [
    {
      id: "int-sample-1",
      uniqueCode: "INT_000001",
      targetId: SAMPLE_ROAD_ID,
      targetType: 'road',
      type: InterventoType.MANUTENZIONE,
      title: "Rifacimento giunti SP 2",
      oggetto: "Manutenzione straordinaria del piano viabile Km 0-10.",
      description: "Intervento urgente per la sicurezza.",
      cig: "B23445566A",
      rupHistory: [],
      currentRup: "Ing. Mario Rossi",
      amount: 145000,
      dateStart: "2024-01-15",
      dateEnd: "2024-06-30",
      suspensions: [],
      extensions: [],
      createdAt: new Date().toISOString(),
      lat: 39.2936,
      lng: 8.8921
    },
    {
      id: "int-sample-3",
      uniqueCode: "INT_000002",
      targetId: SAMPLE_SCHOOL_ID,
      targetType: 'structure',
      type: InterventoType.STRAORDINARIO,
      title: "Efficientamento Energetico Liceo Marconi",
      oggetto: "Sostituzione infissi e isolamento termico coperture.",
      description: "Progetto finanziato PNRR per la riduzione dei consumi.",
      cig: "C99887766X",
      rupHistory: [],
      currentRup: "Arch. Luigi Verdi",
      amount: 450000,
      dateStart: "2023-09-01",
      dateEnd: "2024-05-15",
      suspensions: [],
      extensions: [],
      createdAt: new Date().toISOString(),
      lat: 39.1652,
      lng: 8.5214
    }
  ],
  auditLogs: [],
  notificationSettings: {
    daysBeforeDeadline: 7,
    notifyStart: true,
    notifyEnd: true,
    notifyTest: true
  },
  scheduledExport: {
    enabled: false,
    recipients: '',
    frequency: 'weekly',
    includeAuditLogs: false
  },
  securityPolicy: {
    enforceDomainCheck: false,
    allowedDomains: []
  },
  users: [
    {
      id: 'admin-001',
      username: 'admin',
      firstName: 'Amministratore',
      lastName: 'Sistema',
      email: 'admin@provincia.it',
      role: 'admin',
      accessibleTabs: ['dashboard', 'buildings', 'roads', 'map-view', 'interventions', 'data-view', 'csv-import', 'reports', 'history', 'user-management', 'tech-registry', 'manuals', 'system-db']
    },
    {
      id: 'editor-001',
      username: 'editor',
      firstName: 'Editor',
      lastName: 'Patrimonio',
      email: 'editor@provincia.it',
      role: 'editor',
      accessibleTabs: ['buildings', 'roads', 'tech-registry', 'data-view', 'history', 'dashboard', 'map-view', 'interventions', 'manuals']
    },
    {
      id: 'user-001',
      username: 'user',
      firstName: 'Operatore',
      lastName: 'Standard',
      email: 'user@provincia.it',
      role: 'user',
      accessibleTabs: ['dashboard', 'buildings', 'roads', 'map-view', 'interventions', 'tech-registry', 'manuals']
    }
  ],
  currentUserId: null,
  manualContents: {}
};

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [editingInterventionId, setEditingInterventionId] = useState<string | null>(null);
  const [viewingInterventionId, setViewingInterventionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // View modes
  const [buildingsView, setBuildingsView] = useState<'grid' | 'list'>('grid');
  const [roadsView, setRoadsView] = useState<'grid' | 'list'>('grid');
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set());

  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showRoadForm, setShowRoadForm] = useState(false);
  const [showPlessoFormFor, setShowPlessoFormFor] = useState<MainStructure | null>(null);
  const [editingPlesso, setEditingPlesso] = useState<{plesso: Plesso, buildingName: string} | null>(null);
  const [viewInterventionsFor, setViewInterventionsFor] = useState<{id: string, name: string} | null>(null);
  const [selectedAssetIdForScheda, setSelectedAssetIdForScheda] = useState<string | null>(null);
  const [preselectedTargetId, setPreselectedTargetId] = useState<string | null>(null);

  const [editingBuilding, setEditingBuilding] = useState<MainStructure | null>(null);
  const [editingRoad, setEditingRoad] = useState<Road | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function initData() {
      try {
        const keySelected = (await window.aistudio?.hasSelectedApiKey()) || false;
        if (isMounted) setHasApiKey(keySelected);

        const savedState = await loadState();
        if (isMounted) {
          if (!savedState.roads.length && !savedState.interventi.length && !savedState.structures.length) {
            setState(DEFAULT_STATE);
          } else {
            setState(savedState);
          }
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load initial state:", err);
        if (isMounted) setIsLoaded(true);
      }
    }
    initData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveState(state).catch(err => console.error("Save state error:", err));
    }
  }, [state, isLoaded]);

  const currentUser = useMemo(() => {
    return state.users.find(u => u.id === state.currentUserId) || null;
  }, [state.users, state.currentUserId]);

  const isAdmin = currentUser?.role === 'admin';

  const toggleBuildingExpansion = (id: string) => {
    const newSet = new Set(expandedBuildings);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedBuildings(newSet);
  };

  const handleSelectKey = async () => {
    await window.aistudio?.openSelectKey();
    setHasApiKey(true);
  };

  const getNextUniqueCode = (prefix: string, items: { uniqueCode?: string }[]) => {
    const numericParts = items
      .map(item => {
        if (!item.uniqueCode) return 0;
        const parts = item.uniqueCode.split('_');
        const num = parseInt(parts[parts.length - 1], 10);
        return isNaN(num) ? 0 : num;
      })
      .filter(n => n > 0);
    
    const maxNum = numericParts.length > 0 ? Math.max(...numericParts) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}_${nextNum.toString().padStart(6, '0')}`;
  };

  const nextBuildingCode = useMemo(() => getNextUniqueCode('IMM', state.structures), [state.structures]);
  const nextRoadCode = useMemo(() => getNextUniqueCode('STR', state.roads), [state.roads]);
  const nextInterventionCode = useMemo(() => getNextUniqueCode('INT', state.interventi), [state.interventi]);
  const nextPlessoCode = useMemo(() => {
    const allPlessi = state.structures.flatMap(s => s.plessi);
    return getNextUniqueCode('PLX', allPlessi);
  }, [state.structures]);

  const addLog = useCallback((action: AuditLog['action'], type: string, id: string, details: string) => {
    setState(prev => {
      const newLog: AuditLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action,
        entityType: type,
        entityId: id,
        details
      };
      return { ...prev, auditLogs: [newLog, ...prev.auditLogs] };
    });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === 'password') {
      setState(prev => ({ ...prev, currentUserId: 'admin-001' }));
      setAuthError(false);
      addLog('LOGIN', 'User', 'admin-001', 'Accesso amministratore eseguito.');
    } else if (loginUsername === 'editor' && loginPassword === 'password') {
      setState(prev => ({ ...prev, currentUserId: 'editor-001' }));
      setAuthError(false);
      addLog('LOGIN', 'User', 'editor-001', 'Accesso editor eseguito.');
    } else if (loginUsername === 'user' && loginPassword === 'password') {
      setState(prev => ({ ...prev, currentUserId: 'user-001' }));
      setAuthError(false);
      addLog('LOGIN', 'User', 'user-001', 'Accesso operatore standard eseguito.');
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 3000);
    }
  };

  const handleLogout = () => {
    if (confirm("Vuoi uscire dal sistema?")) {
      setState(prev => ({ ...prev, currentUserId: null }));
      setLoginUsername('');
      setLoginPassword('');
    }
  };

  const handleUpdateScheduledExport = (newConfig: ScheduledExport) => {
    setState(prev => ({ ...prev, scheduledExport: newConfig }));
    addLog('UPDATE', 'System', 'Automazione', `Schedulazione export aggiornata.`);
  };

  const handleUpdateSecurityPolicy = (newPolicy: SecurityPolicy) => {
    setState(prev => ({ ...prev, securityPolicy: newPolicy }));
    addLog('UPDATE', 'System', 'Sicurezza', `Politiche di accesso aggiornate.`);
  };

  const handleUpdateManualContent = (id: string, entry: ManualEntry) => {
    setState(prev => ({
      ...prev,
      manualContents: { ...prev.manualContents, [id]: entry }
    }));
    addLog('UPDATE', 'Manuale', id, `Aggiornato contenuto manuale: ${id}`);
  };

  const updateNotificationSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setState(prev => ({
      ...prev,
      notificationSettings: { ...prev.notificationSettings, ...newSettings }
    }));
  }, []);

  const handleAddUser = (user: User) => {
    setState(prev => ({ ...prev, users: [...prev.users, user] }));
    addLog('CREATE', 'Utente', user.id, `Creato utente: ${user.username}`);
  };

  const handleUpdateUser = (user: User) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === user.id ? user : u)
    }));
    addLog('UPDATE', 'Utente', user.id, `Aggiornato utente: ${user.username}`);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Eliminare definitivamente l'utente?")) {
      setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
      addLog('DELETE', 'Utente', id, "Utente rimosso.");
    }
  };

  const requestAdminPassword = (): boolean => {
    const pw = prompt("AZIONE PROTETTA: Inserisci la password di sicurezza amministratore per confermare l'eliminazione definitiva:");
    if (pw === ADMIN_SECURITY_PASSWORD) return true;
    if (pw !== null) alert("Password errata. Operazione annullata.");
    return false;
  };

  const handleAddStructure = (newStruct: MainStructure) => {
    const exists = state.structures.find(s => s.id === newStruct.id);
    if (exists && exists.name !== newStruct.name) {
      const history = exists.previousNames || [];
      if (!history.includes(exists.name)) {
        newStruct.previousNames = [...history, exists.name];
      }
    }
    
    setState(prev => ({ 
      ...prev, 
      structures: exists 
        ? prev.structures.map(s => s.id === newStruct.id ? newStruct : s)
        : [...prev.structures, newStruct]
    }));
    addLog(exists ? 'UPDATE' : 'CREATE', 'Immobile', newStruct.id, `Gestione immobile: ${newStruct.name}`);
    setShowBuildingForm(false);
    setEditingBuilding(null);
  };

  const handleDeleteStructure = (id: string) => {
    if (!isAdmin) {
      alert("Solo gli amministratori possono eliminare immobili.");
      return;
    }
    if (confirm("Sei sicuro di voler eliminare questo immobile e tutti i relativi plessi? L'azione è irreversibile.")) {
      if (requestAdminPassword()) {
        const struct = state.structures.find(s => s.id === id);
        setState(p => ({...p, structures: p.structures.filter(s => s.id !== id)}));
        addLog('DELETE', 'Immobile', id, `Eliminato immobile: ${struct?.name}`);
      }
    }
  };

  const handleAddRoad = (newRoad: Road) => {
    setState(prev => ({ 
      ...prev, 
      roads: prev.roads.find(r => r.id === newRoad.id)
        ? prev.roads.map(r => r.id === newRoad.id ? newRoad : r)
        : [...prev.roads, newRoad]
    }));
    addLog(state.roads.find(r => r.id === newRoad.id) ? 'UPDATE' : 'CREATE', 'Strada', newRoad.id, `Gestione strada: ${newRoad.code}`);
    setShowRoadForm(false);
    setEditingRoad(null);
  };

  const handleDeleteRoad = (id: string) => {
    if (!isAdmin) {
      alert("Solo gli amministratori possono eliminare strade.");
      return;
    }
    if (confirm("Sei sicuro di voler eliminare questa strada? L'azione è irreversibile.")) {
      if (requestAdminPassword()) {
        const road = state.roads.find(r => r.id === id);
        setState(p => ({...p, roads: p.roads.filter(r => r.id !== id)}));
        addLog('DELETE', 'Strada', id, `Eliminata strada: ${road?.code}`);
      }
    }
  };

  const handleSavePlesso = (p: Plesso) => {
    setState(s => ({
      ...s,
      structures: s.structures.map(st => {
        if (st.id === p.structureId) {
          const exists = st.plessi.find(px => px.id === p.id);
          if (exists) {
            if (exists.name !== p.name) {
              const history = exists.previousNames || [];
              if (!history.includes(exists.name)) {
                p.previousNames = [...history, exists.name];
              }
            }
            return { ...st, plessi: st.plessi.map(px => px.id === p.id ? p : px) };
          }
          return { ...st, plessi: [...st.plessi, p] };
        }
        return st;
      })
    }));
    addLog('UPDATE', 'Plesso', p.id, `Gestione plesso: ${p.name}`);
    setShowPlessoFormFor(null);
    setEditingPlesso(null);
  };

  const handleDeletePlesso = (plessoId: string, structureId: string) => {
    if (!isAdmin) {
      alert("Solo gli amministratori possono eliminare plessi.");
      return;
    }
    if (confirm("Sei sicuro di voler eliminare questo plesso? L'azione è irreversibile.")) {
      if (requestAdminPassword()) {
        setState(s => ({
          ...s,
          structures: s.structures.map(st => {
            if (st.id === structureId) {
              const plesso = st.plessi.find(p => p.id === plessoId);
              addLog('DELETE', 'Plesso', plessoId, `Eliminato plesso: ${plesso?.name} dall'immobile ${st.name}`);
              return { ...st, plessi: st.plessi.filter(p => p.id !== plessoId) };
            }
            return st;
          })
        }));
      }
    }
  };

  const handleSaveIntervention = (data: Intervento) => {
    setState(prev => {
      const exists = prev.interventi.find(i => i.id === data.id);
      if (exists) {
        addLog('UPDATE', 'Intervento', data.id, `Modificato CIG ${data.cig}`);
        return { ...prev, interventi: prev.interventi.map(i => i.id === data.id ? data : i) };
      } else {
        addLog('CREATE', 'Intervento', data.id, `Creato CIG ${data.cig}`);
        return { ...prev, interventi: [...prev.interventi, data] };
      }
    });
    setEditingInterventionId(null);
    setViewingInterventionId(null);
    setPreselectedTargetId(null);
    setActiveTab('interventions');
  };

  const handleDeleteIntervention = (id: string) => {
    if(confirm("Sei sicuro di voler eliminare definitivamente questo intervento?")) {
      const intervention = state.interventi.find(i => i.id === id);
      setState(prev => ({ ...prev, interventi: prev.interventi.filter(int => int.id !== id) }));
      addLog('DELETE', 'Intervento', id, `Eliminato intervento CIG: ${intervention?.cig}`);
    }
  };

  const getAssetNameForIntervention = useCallback((targetId: string, targetType: string) => {
    if (targetType === 'road') {
      const r = state.roads.find(road => road.id === targetId);
      return r ? `${r.code} - ${r.name}` : 'Strada N/D';
    }
    const struct = state.structures.find(s => s.id === targetId);
    if (struct) return struct.name;
    
    for (const s of state.structures) {
      const plesso = s.plessi.find(p => p.id === targetId);
      if (plesso) return `${s.name} > ${plesso.name}`;
    }
    return 'Target N/D';
  }, [state.structures, state.roads]);

  const selectedAssetForScheda = useMemo(() => {
    if (!selectedAssetIdForScheda) return null;
    const road = state.roads.find(r => r.id === selectedAssetIdForScheda);
    if (road) return { id: road.id, type: 'road', name: road.name, code: road.code, uniqueCode: road.uniqueCode, costCenter: road.costCenter, technicalData: road.technicalData, originalData: road } as UnifiedAsset;
    for (const s of state.structures) {
      if (s.id === selectedAssetIdForScheda) return { id: s.id, type: 'structure', name: s.name, previousNames: s.previousNames, address: s.address, uniqueCode: s.uniqueCode, costCenter: s.costCenter, technicalData: s.technicalData, originalData: s } as UnifiedAsset;
      const plesso = s.plessi.find(p => p.id === selectedAssetIdForScheda);
      if (plesso) return { id: plesso.id, type: 'plesso', name: plesso.name, previousNames: plesso.previousNames, parentName: s.name, address: s.address, uniqueCode: plesso.uniqueCode, costCenter: plesso.costCenter, technicalData: plesso.technicalData, originalData: plesso } as UnifiedAsset;
    }
    return null;
  }, [state, selectedAssetIdForScheda]);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-6 z-[9999]">
        <div className="w-24 h-24 relative flex items-center justify-center">
          <img src="https://provincia-sulcis-iglesiente-api.municipiumapp.it/s3/150x150/s3/20243/sito/stemma.jpg" className="w-16 h-16 object-contain animate-pulse z-10" alt="Stemma" />
          <div className="absolute inset-0 border-4 border-institutional-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">EdilGest Pro</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Inizializzazione Sistema...</p>
        </div>
      </div>
    );
  }

  if (!state.currentUserId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-institutional-700/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-slate-800/20 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className={`max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center relative z-10 animate-in fade-in zoom-in duration-700 ${authError ? 'animate-shake' : ''}`}>
           <div className="w-28 h-28 bg-slate-50 rounded-full mx-auto p-5 border border-slate-100 shadow-sm mb-8 flex items-center justify-center">
             <img src="https://provincia-sulcis-iglesiente-api.municipiumapp.it/s3/150x150/s3/20243/sito/stemma.jpg" alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
           </div>
           
           <div className="mb-10">
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">EdilGest <span className="text-institutional-700">Pro</span></h1>
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Area Riservata Operatori</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-5 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest px-1">Identificativo</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-institutional-700 transition-colors" size={18} />
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-white border border-slate-300 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-slate-950 outline-none focus:ring-2 focus:ring-institutional-700 transition-all placeholder:text-slate-400 shadow-sm" 
                    placeholder="Username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest px-1">Chiave di Accesso</label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-institutional-700 transition-colors" size={18} />
                  <input 
                    type="password" 
                    required 
                    className="w-full bg-white border border-slate-300 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-slate-950 outline-none focus:ring-2 focus:ring-institutional-700 transition-all placeholder:text-slate-400 shadow-sm" 
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-1">
                  Credenziali non valide
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-institutional-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-institutional-700/20 uppercase tracking-widest text-xs mt-6 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <LogIn size={20} /> Entra nel Sistema
              </button>
           </form>

           <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
             <ShieldAlert size={14} /> Sistema Istituzionale Protetto
           </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onSearch={setSearchTerm} 
      onSelectIntervention={(id) => { setViewingInterventionId(id); setActiveTab('view-intervention'); }}
      state={state} 
      updateNotificationSettings={updateNotificationSettings} 
      currentUser={currentUser} 
      onLogout={handleLogout}
    >
      <div className="mb-6 flex justify-between items-center no-print">
        <div>
           {!hasApiKey && (
             <button 
               onClick={handleSelectKey}
               className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse shadow-lg"
             >
               <Key size={14} /> Configura API Key per Grounding
             </button>
           )}
        </div>
        <div className="flex gap-2">
          {isCloudEnabled() ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-institutional-50 text-institutional-700 rounded-full text-[10px] font-black border border-institutional-100 shadow-sm"><Cloud size={14} className="animate-pulse" /> DATABASE CLOUD ATTIVO</div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black border border-slate-200"><CloudOff size={14} /> STORAGE LOCALE</div>
          )}
        </div>
      </div>

      {activeTab === 'dashboard' && <Dashboard state={state} onSelectAsset={setSelectedAssetIdForScheda} />}
      {activeTab === 'map-view' && <MapSection state={state} onViewIntervention={(id) => { setViewingInterventionId(id); setActiveTab('view-intervention'); }} />}
      {activeTab === 'tech-registry' && <TechnicalRegistry state={state} onEditBuilding={(b) => { setEditingBuilding(b); setShowBuildingForm(true); }} onEditRoad={(r) => { setEditingRoad(r); setShowRoadForm(true); }} />}
      {activeTab === 'interventions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Registro Interventi Manutentivi</h2>
             <button onClick={() => exportToCSV(state.interventi, 'interventi')} className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-all"><Table size={16} /> Esporta Registro</button>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Codice CIG / Titolo Intervento</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Asset di Riferimento</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Associazione Plesso</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">RUP In Carica</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Contratto</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Gestione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.interventi.filter(i => 
                  i.cig.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (i.uniqueCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  i.currentRup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (i.title || '').toLowerCase().includes(searchTerm.toLowerCase())
                ).map(i => (
                  <tr key={i.id} className="hover:bg-slate-50 cursor-pointer transition-colors group" onClick={() => { setViewingInterventionId(i.id); setActiveTab('view-intervention'); }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-slate-950 leading-tight group-hover:text-institutional-700 transition-colors uppercase tracking-tight">{i.cig}</p>
                        {i.uniqueCode && <span className="text-[9px] font-black text-institutional-600 bg-institutional-50 px-1.5 py-0.5 rounded border border-institutional-100">{i.uniqueCode}</span>}
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-xs">{i.title || 'Senza Titolo Specificato'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-institutional-50 text-institutional-700 rounded-lg group-hover:bg-institutional-700 group-hover:text-white transition-all">
                          {i.targetType === 'road' ? <MapIcon size={12} /> : <Building size={12} />}
                        </div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{getAssetNameForIntervention(i.targetId, i.targetType)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {i.targetType === 'plesso' ? (
                          <span className="bg-institutional-100 text-institutional-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-institutional-200 flex items-center gap-1"><Layers size={10} /> SÌ</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full">NO</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{i.currentRup}</td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-black text-slate-950">€ {i.amount.toLocaleString()}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase">{i.dateStart || 'Data N/D'}</p>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingInterventionId(i.id); setActiveTab('new-intervention'); }} className="p-2 text-slate-300 hover:text-institutional-700 transition-colors" title="Modifica"><Edit3 size={18} /></button>
                        <button onClick={() => handleDeleteIntervention(i.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Elimina"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {state.interventi.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardList size={40} className="text-slate-100" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nessun intervento registrato nel sistema</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'data-view' && <DataView state={state} onView={(id) => { setViewingInterventionId(id); setActiveTab('view-intervention'); }} onEdit={(id) => { setEditingInterventionId(id); setActiveTab('new-intervention'); }} />}
      {activeTab === 'csv-import' && (
        <CsvImport 
          state={state} 
          onImportStructures={(d) => setState(p => ({...p, structures: [...p.structures, ...d]}))} 
          onImportPlessi={(d) => setState(p => ({...p, structures: p.structures.map(s => { const rel = d.filter(pl => pl.structureId === s.id); return rel.length ? {...s, plessi: [...s.plessi, ...rel]} : s; })}))} 
          onImportRoads={(d) => setState(p => ({...p, roads: [...p.roads, ...d]}))} 
          onImportInterventions={(d) => setState(p => ({...p, interventi: [...p.interventi, ...d]}))}
        />
      )}
      {activeTab === 'reports' && <Reports state={state} />}
      {activeTab === 'user-management' && <UserManagement state={state} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onSwitchUser={(id) => setState(p => ({...p, currentUserId: id}))} onUpdateScheduledExport={handleUpdateScheduledExport} onUpdateSecurityPolicy={handleUpdateSecurityPolicy} />}
      {activeTab === 'manuals' && <Manuals currentUser={currentUser} manualContents={state.manualContents} onSaveManual={handleUpdateManualContent} />}
      {activeTab === 'system-db' && isAdmin && <SystemDB />}
      {activeTab === 'buildings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div><h2 className="text-2xl font-bold text-slate-800 tracking-tight">Patrimonio Immobiliare</h2><p className="text-sm text-slate-600 italic">Gestione nidificata degli asset e relative unità locali</p></div>
            <div className="flex gap-4">
              <div className="flex p-1 bg-slate-100 rounded-xl">
                 <button onClick={() => setBuildingsView('grid')} className={`p-2 rounded-lg transition-all ${buildingsView === 'grid' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} title="Vista Griglia"><Grid size={18} /></button>
                 <button onClick={() => setBuildingsView('list')} className={`p-2 rounded-lg transition-all ${buildingsView === 'list' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} title="Vista Elenco Nidificato"><LayoutList size={18} /></button>
              </div>
              <button onClick={() => setShowBuildingForm(true)} className="bg-institutional-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex gap-2 items-center hover:bg-institutional-800 transition-all shadow-lg"><Building size={18} /> Nuovo Immobile</button>
            </div>
          </div>
          
          {buildingsView === 'grid' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {state.structures.map(s => (
                <div key={s.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                  <div className="p-8 border-b border-slate-50 bg-gradient-to-br from-white to-slate-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-institutional-50 text-institutional-700 rounded-2xl group-hover:scale-110 transition-transform cursor-pointer" onClick={() => setSelectedAssetIdForScheda(s.id)}><Building size={24} /></div>
                        <div className="cursor-pointer" onClick={() => setSelectedAssetIdForScheda(s.id)}>
                          <h3 className="text-xl font-black text-slate-900 leading-tight hover:text-institutional-700 transition-colors">{s.name}</h3>
                          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold mt-1"><MapPin size={12} /> {s.address}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingBuilding(s); setShowBuildingForm(true); }} className="p-2 text-slate-400 hover:text-institutional-700 rounded-lg transition-colors"><Edit3 size={20} /></button>
                        <button onClick={() => setViewInterventionsFor({id: s.id, name: s.name})} className="p-2 text-slate-400 hover:text-institutional-700 rounded-lg transition-colors"><ClipboardList size={20} /></button>
                        {isAdmin && <button onClick={() => handleDeleteStructure(s.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Elimina Immobile"><Trash2 size={20} /></button>}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Unità Locali (Plessi):</p>
                      <div className="flex flex-wrap gap-2">
                        {s.plessi.length > 0 ? s.plessi.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => setSelectedAssetIdForScheda(p.id)}
                            className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl flex items-center gap-2 group/plesso hover:bg-institutional-700 hover:border-institutional-800 transition-all cursor-pointer relative"
                          >
                             <LayoutGrid size={12} className="text-institutional-500 group-hover/plesso:text-white" />
                             <div className="flex-1 min-w-0 pr-6">
                               <span className="text-[10px] font-bold text-slate-900 group-hover/plesso:text-white truncate block">{p.name}</span>
                               {p.previousNames && p.previousNames.length > 0 && <span className="text-[8px] font-black text-amber-700 group-hover/plesso:text-institutional-100 italic block">(Storico nomi attivo)</span>}
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-[9px] font-black text-slate-500 group-hover/plesso:text-institutional-200">{p.uniqueCode}</span>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setEditingPlesso({plesso: p, buildingName: s.name}); }}
                                 className="p-1 text-slate-400 hover:text-white opacity-0 group-hover/plesso:opacity-100 transition-all"
                                 title="Modifica Plesso"
                               >
                                 <Edit3 size={12} />
                               </button>
                               {isAdmin && <button 
                                 onClick={(e) => { e.stopPropagation(); handleDeletePlesso(p.id, s.id); }}
                                 className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover/plesso:opacity-100 transition-all"
                                 title="Elimina Plesso"
                               >
                                 <Trash2 size={12} />
                               </button>}
                             </div>
                          </div>
                        )) : (
                          <p className="text-[10px] italic text-slate-400 px-1">Nessun plesso registrato per questo immobile.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => { setPreselectedTargetId(s.id); setActiveTab('new-intervention'); }} className="flex-1 bg-white border border-slate-200 hover:border-institutional-600 hover:text-institutional-700 text-slate-700 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"><Plus size={14} /> Manutenzione</button>
                      <button onClick={() => setShowPlessoFormFor(s)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"><ChevronRight size={14} /> Nuovo Plesso</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="w-10 px-4"></th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Identificativo / Codice</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Ubicazione</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">CdC</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Plessi</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Azioni</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {state.structures.map(s => {
                     const isExpanded = expandedBuildings.has(s.id);
                     return (
                       <React.Fragment key={s.id}>
                         <tr className={`hover:bg-slate-50/50 transition-colors group ${isExpanded ? 'bg-slate-50/30' : ''}`}>
                            <td className="px-4">
                              <button onClick={() => toggleBuildingExpansion(s.id)} className="p-1 text-slate-400 hover:text-institutional-700 transition-all">
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              </button>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-institutional-50 text-institutional-700 flex items-center justify-center group-hover:bg-institutional-700 group-hover:text-white transition-all"><Building size={18}/></div>
                                <div><p className="font-black text-slate-900 leading-none mb-1 group-hover:text-institutional-700 transition-colors">{s.name}</p><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.uniqueCode}</p></div>
                              </div>
                            </td>
                            <td className="px-8 py-5"><p className="text-xs font-bold text-slate-700 italic">{s.address}</p></td>
                            <td className="px-8 py-5"><span className="text-[10px] font-black uppercase text-institutional-700 bg-institutional-50 px-2 py-0.5 rounded-full border border-institutional-100">{s.costCenter || '---'}</span></td>
                            <td className="px-8 py-5 text-center"><span className="text-xs font-black text-slate-900">{s.plessi.length}</span></td>
                            <td className="px-8 py-5 text-right flex justify-end gap-2">
                               <button onClick={() => { setEditingBuilding(s); setShowBuildingForm(true); }} className="p-2 text-slate-400 hover:text-institutional-700"><Edit3 size={18} /></button>
                               <button onClick={() => setViewInterventionsFor({id: s.id, name: s.name})} className="p-2 text-slate-400 hover:text-institutional-700"><ClipboardList size={18} /></button>
                               {isAdmin && <button onClick={() => handleDeleteStructure(s.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>}
                            </td>
                         </tr>
                         {isExpanded && s.plessi.map(p => (
                           <tr key={p.id} className="bg-slate-50/20 border-l-4 border-institutional-700 group animate-in slide-in-from-left-2">
                             <td></td>
                             <td className="px-8 py-4 pl-12">
                               <div className="flex items-center gap-3">
                                 <LayoutGrid size={14} className="text-slate-500" />
                                 <div>
                                   <p className="text-xs font-black text-slate-800">{p.name}</p>
                                   {p.previousNames && p.previousNames.length > 0 && <p className="text-[9px] text-amber-700 font-bold uppercase tracking-widest italic">Storico nomi presente</p>}
                                 </div>
                               </div>
                             </td>
                             <td className="px-8 py-4 text-[10px] text-slate-600 font-bold uppercase">{p.uniqueCode}</td>
                             <td className="px-8 py-4"><span className="text-[9px] font-black uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{p.costCenter || '---'}</span></td>
                             <td className="px-8 py-4 text-center">
                               <button onClick={() => setSelectedAssetIdForScheda(p.id)} className="text-[9px] font-black text-institutional-700 uppercase tracking-widest hover:underline">Vedi Scheda</button>
                             </td>
                             <td className="px-8 py-4 text-right">
                               <div className="flex justify-end gap-2">
                                 <button onClick={() => setEditingPlesso({plesso: p, buildingName: s.name})} className="p-1.5 text-slate-400 hover:text-institutional-700 transition-colors" title="Modifica Plesso"><Edit3 size={14} /></button>
                                 <button onClick={() => { setPreselectedTargetId(p.id); setActiveTab('new-intervention'); }} className="p-1.5 text-slate-400 hover:text-institutional-700 transition-colors" title="Nuovo Intervento"><Plus size={14} /></button>
                                 {/* Fix: Added missing onClick to handleDeletePlesso button */}
                                 {isAdmin && <button onClick={() => handleDeletePlesso(p.id, s.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Elimina Plesso"><Trash2 size={14} /></button>}
                               </div>
                             </td>
                           </tr>
                         ))}
                       </React.Fragment>
                     );
                   })}
                 </tbody>
               </table>
            </div>
          )}
        </div>
      )}
      {activeTab === 'roads' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div><h2 className="text-2xl font-bold text-slate-800 tracking-tight">Viabilità Provinciale</h2><p className="text-sm text-slate-600">Monitoraggio manutenzioni rete stradale</p></div>
            <div className="flex gap-4">
              <div className="flex p-1 bg-slate-100 rounded-xl">
                 <button onClick={() => setRoadsView('grid')} className={`p-2 rounded-lg transition-all ${roadsView === 'grid' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Grid size={18} /></button>
                 <button onClick={() => setRoadsView('list')} className={`p-2 rounded-lg transition-all ${roadsView === 'list' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><LayoutList size={18} /></button>
              </div>
              <button onClick={() => setShowRoadForm(true)} className="bg-institutional-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-institutional-800 transition-all shadow-lg"><MapIcon size={18} /> Nuova Strada</button>
            </div>
          </div>

          {roadsView === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {state.roads.map(r => (
                <div key={r.id} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className="flex justify-between mb-6">
                     <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedAssetIdForScheda(r.id)}><div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black tracking-tighter group-hover:bg-institutional-700 transition-all">{r.code}</div><div className="text-xs font-black text-institutional-700 bg-institutional-50 px-3 py-1 rounded-full uppercase tracking-widest">{r.lengthKm} Km</div></div>
                     <div className="flex gap-1">
                      <button onClick={() => { setEditingRoad(r); setShowRoadForm(true); }} className="p-2 text-slate-400 hover:text-institutional-700 rounded-lg transition-colors"><Edit3 size={20} /></button>
                      <button onClick={() => setViewInterventionsFor({id: r.id, name: r.code})} className="p-2 text-slate-400 hover:text-institutional-700 rounded-lg transition-colors"><ClipboardList size={18} /></button>
                      {isAdmin && <button onClick={() => handleDeleteRoad(r.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Elimina Strada"><Trash2 size={18} /></button>}
                     </div>
                  </div>
                  <div className="mb-8 cursor-pointer" onClick={() => setSelectedAssetIdForScheda(r.id)}><h3 className="text-lg font-black text-slate-900 mb-1 hover:text-institutional-700 transition-colors">{r.name}</h3><p className="text-xs text-slate-600 italic line-clamp-2">{r.description || 'Nessuna descrizione.'}</p></div>
                  <div className="flex gap-2"><button onClick={() => { setPreselectedTargetId(r.id); setActiveTab('new-intervention'); }} className="flex-1 bg-institutional-700 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl shadow-lg hover:bg-institutional-800 transition-all">+ Intervento</button><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.code + ' ' + r.name)}`} target="_blank" rel="noopener noreferrer" className="w-12 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all"><ExternalLink size={16} /></a></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Codice (SP)</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Denominazione</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Lunghezza (Km)</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">CdC</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Azioni</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {state.roads.map(r => (
                     <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                       <td className="px-8 py-5 cursor-pointer" onClick={() => setSelectedAssetIdForScheda(r.id)}><div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-[10px] tracking-tighter group-hover:bg-institutional-700 transition-all">{r.code}</div></td>
                       <td className="px-8 py-5 cursor-pointer" onClick={() => setSelectedAssetIdForScheda(r.id)}><div><p className="font-black text-slate-900 leading-none mb-1 group-hover:text-institutional-700 transition-colors">{r.name}</p><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{r.uniqueCode}</p></div></td>
                       <td className="px-8 py-5 text-center font-black text-slate-800">{r.lengthKm}</td>
                       <td className="px-8 py-5"><span className="text-[10px] font-black uppercase text-institutional-700 bg-institutional-50 px-2 py-0.5 rounded-full border border-institutional-100">{r.costCenter || '---'}</span></td>
                       <td className="px-8 py-5 text-right flex justify-end gap-2">
                          <button onClick={() => { setEditingRoad(r); setShowRoadForm(true); }} className="p-2 text-slate-400 hover:text-institutional-700 transition-colors" title="Modifica"><Edit3 size={18} /></button>
                          <button onClick={() => setViewInterventionsFor({id: r.id, name: r.code})} className="p-2 text-slate-400 hover:text-institutional-700 transition-colors" title="Interventi"><ClipboardList size={18} /></button>
                          {/* Fix: Added missing onClick to handleDeleteRoad button */}
                          {isAdmin && <button onClick={() => handleDeleteRoad(r.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Elimina Strada"><Trash2 size={18} /></button>}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          )}
        </div>
      )}
      {activeTab === 'history' && (
        <div className="space-y-6">
           <div className="flex items-center gap-3"><div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><HistoryIcon size={24} /></div><h2 className="text-2xl font-bold text-slate-800 tracking-tight">Registro Audit di Sistema</h2></div>
           <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-sm">
             {state.auditLogs.map(log => (
               <div key={log.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                 <div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-700' : log.action === 'DELETE' ? 'bg-red-50 text-red-700' : log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700' : log.action === 'LOGIN' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>{log.action.charAt(0)}</div><div><p className="text-sm font-bold text-slate-900">{log.details}</p><p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-0.5">{new Date(log.timestamp).toLocaleString('it-IT')}</p></div></div>
               </div>
             ))}
           </div>
        </div>
      )}
      {activeTab === 'view-intervention' && viewingInterventionId && <InterventionDetail state={state} intervention={state.interventi.find(i => i.id === viewingInterventionId)!} onEdit={(id) => { setEditingInterventionId(id); setActiveTab('new-intervention'); }} onClose={() => { setViewingInterventionId(null); setActiveTab('interventions'); }} />}
      {activeTab === 'new-intervention' && <InterventionForm state={state} initialData={state.interventi.find(i => i.id === editingInterventionId)} preselectedTargetId={preselectedTargetId} suggestedUniqueCode={nextInterventionCode} onSubmit={handleSaveIntervention} onCancel={() => { setEditingInterventionId(null); setPreselectedTargetId(null); setActiveTab('interventions'); }} />}
      {showBuildingForm && <BuildingForm onSave={handleAddStructure} onCancel={() => { setShowBuildingForm(false); setEditingBuilding(null); }} initialData={editingBuilding} suggestedUniqueCode={nextBuildingCode} />}
      {showRoadForm && <RoadForm onSave={handleAddRoad} onCancel={() => { setShowRoadForm(false); setEditingRoad(null); }} initialData={editingRoad} suggestedUniqueCode={nextRoadCode} />}
      {showPlessoFormFor && <PlessoForm buildingId={showPlessoFormFor.id} buildingName={showPlessoFormFor.name} onSave={handleSavePlesso} onCancel={() => setShowPlessoFormFor(null)} suggestedUniqueCode={nextPlessoCode} />}
      {editingPlesso && <PlessoForm initialData={editingPlesso.plesso} buildingId={editingPlesso.plesso.structureId} buildingName={editingPlesso.buildingName} onSave={handleSavePlesso} onCancel={() => setEditingPlesso(null)} />}
      {viewInterventionsFor && <AssetInterventionsModal assetId={viewInterventionsFor.id} assetName={viewInterventionsFor.name} state={state} onClose={() => setViewInterventionsFor(null)} onViewIntervention={(id) => { setViewingInterventionId(id); setActiveTab('view-intervention'); setViewInterventionsFor(null); }} />}
      {selectedAssetForScheda && (
        <AssetDetailModal 
          selectedAsset={selectedAssetForScheda} 
          interventi={state.interventi} 
          onClose={() => setSelectedAssetIdForScheda(null)} 
          onViewIntervention={(id) => {
            setViewingInterventionId(id);
            setActiveTab('view-intervention');
            setSelectedAssetIdForScheda(null);
          }}
        />
      )}
    </Layout>
  );
};

export default App;
