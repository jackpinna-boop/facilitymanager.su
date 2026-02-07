
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  ClipboardList, 
  History, 
  Search,
  FileText,
  LayoutGrid,
  Map as MapIcon,
  MapPinned,
  FileUp,
  Users,
  LogOut,
  PlusCircle,
  X,
  ChevronRight,
  User as UserIcon,
  Hash,
  BookOpen,
  HelpCircle,
  Database,
  Menu
} from 'lucide-react';
import Notifications from './Notifications';
import { AppState, User, Intervento } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearch: (term: string) => void;
  onSelectIntervention: (id: string) => void; 
  state: AppState;
  updateNotificationSettings: (s: any) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onSearch, 
  onSelectIntervention,
  state, 
  updateNotificationSettings, 
  currentUser,
  onLogout
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const institutionalCrest = "https://provincia-sulcis-iglesiente-api.municipiumapp.it/s3/150x150/s3/20243/sito/stemma.jpg";

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'buildings', icon: Building2, label: 'Patrimonio Immobili' },
    { id: 'roads', icon: MapIcon, label: 'Rete Viaria' },
    { id: 'tech-registry', icon: BookOpen, label: 'Registro Tecnico Asset' },
    { id: 'map-view', icon: MapPinned, label: 'Mappa Interattiva' },
    { id: 'interventions', icon: ClipboardList, label: 'Registro Interventi' },
    { id: 'data-view', icon: LayoutGrid, label: 'Analisi Tabellare' },
    { id: 'csv-import', icon: FileUp, label: 'Importazione CSV' },
    { id: 'reports', icon: FileText, label: 'Report & Export' },
    { id: 'history', icon: History, label: 'Log Audit' },
    { id: 'user-management', icon: Users, label: 'Gestione Utenti' },
    { id: 'manuals', icon: HelpCircle, label: 'Manuale Utente' },
    { id: 'system-db', icon: Database, label: 'Sistema DB', adminOnly: true }
  ];

  const visibleMenuItems = menuItems.filter(item => {
    const hasPermission = currentUser?.accessibleTabs.includes(item.id) || currentUser?.role === 'admin';
    const isAllowedByRole = !item.adminOnly || currentUser?.role === 'admin';
    return hasPermission && isAllowedByRole;
  });

  const searchResults = React.useMemo(() => {
    if (localSearch.length < 2) return [];
    const term = localSearch.toLowerCase();
    return state.interventi.filter(i => 
      i.cig.toLowerCase().includes(term) || 
      i.currentRup.toLowerCase().includes(term) || 
      (i.title || '').toLowerCase().includes(term) ||
      (i.description || '').toLowerCase().includes(term)
    ).slice(0, 8); 
  }, [localSearch, state.interventi]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabSelection = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 h-16 bg-slate-900 border-b border-slate-800 z-[210] shrink-0">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <img src={institutionalCrest} alt="Stemma" className="h-8 w-8 object-contain" />
          <h1 className="text-white font-black text-sm tracking-tighter uppercase">EdilGest <span className="text-institutional-500">Pro</span></h1>
        </div>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[220] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 bg-slate-900 text-white flex flex-col shrink-0 z-[230] shadow-2xl transition-transform duration-300 transform
        lg:static lg:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Branding Area */}
        <div className="p-8 border-b border-slate-800 bg-slate-950/40">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full p-2.5 shadow-2xl border-2 border-institutional-700/50 flex items-center justify-center transform hover:rotate-6 transition-transform">
              <img src={institutionalCrest} alt="Stemma" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-black text-institutional-400 uppercase tracking-[0.2em] mb-1">Provincia</p>
              <h1 className="text-xl font-black text-white leading-none tracking-tighter">EdilGest <span className="text-institutional-500">Pro</span></h1>
              <div className="flex items-center justify-center gap-2 mt-3 bg-slate-800/50 py-1 px-4 rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-institutional-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gestionale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Nuovo Intervento */}
        <div className="px-6 pt-6">
          <button 
            onClick={() => handleTabSelection('new-intervention')}
            className="w-full bg-institutional-700 hover:bg-institutional-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-institutional-900/40 active:scale-[0.98] group"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Nuovo Intervento
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-1.5 custom-scrollbar">
          {visibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabSelection(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 group ${
                activeTab === item.id
                  ? 'bg-white/10 text-white shadow-inner border border-white/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-institutional-400' : 'text-slate-500 group-hover:text-institutional-400'} />
              {item.label}
              {activeTab === item.id && (
                <div className="ml-auto w-1 h-3 bg-institutional-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* User Info Sidebar Bottom */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-4 bg-slate-800/30 p-3 rounded-2xl border border-white/5">
            <div className="w-10 h-10 bg-institutional-700 rounded-xl flex items-center justify-center text-white font-black text-sm uppercase">
              {currentUser ? `${currentUser.firstName[0]}${currentUser.lastName[0]}` : '??'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate">{currentUser?.firstName} {currentUser?.lastName}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{currentUser?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-[150] shadow-sm shrink-0">
          <div className="relative w-full max-w-xl group" ref={searchRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-institutional-700 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cerca per CIG o RUP..." 
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-12 text-sm font-medium focus:ring-2 focus:ring-institutional-700 transition-all outline-none placeholder:text-slate-400"
              value={localSearch}
              onFocus={() => setShowResults(true)}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setShowResults(true);
                onSearch(e.target.value);
              }}
            />
            {localSearch && (
              <button 
                onClick={() => { setLocalSearch(''); setShowResults(false); onSearch(''); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1"
              >
                <X size={16} />
              </button>
            )}

            {/* Risultati in Overlay */}
            {showResults && localSearch.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risultati Suggeriti ({searchResults.length})</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {searchResults.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => {
                        onSelectIntervention(i.id);
                        setShowResults(false);
                        setLocalSearch('');
                      }}
                      className="w-full text-left p-4 hover:bg-institutional-50 border-b border-slate-50 last:border-0 flex items-center gap-4 group transition-colors"
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-institutional-700 group-hover:text-white transition-all">
                        <Hash size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-black text-slate-900 group-hover:text-institutional-700 transition-colors uppercase">CIG {i.cig}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 truncate">{i.title || i.oggetto}</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-200 group-hover:text-institutional-700 transform group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                  {searchResults.length === 0 && (
                    <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
                      <Search size={32} className="opacity-10" />
                      <p className="text-xs font-bold uppercase tracking-widest">Nessun intervento trovato</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 lg:gap-5 ml-4">
            <Notifications state={state} updateSettings={updateNotificationSettings} />
            
            <div className="hidden lg:block h-8 w-px bg-slate-200" />

            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group flex items-center gap-2"
              title="Esci dal sistema"
            >
              <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest hidden xl:block">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
