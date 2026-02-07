
import React, { useState } from 'react';
import { User, UserRole, AppState, ScheduledExport, ExportFrequency, SecurityPolicy } from '../types';
import { 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  Check, 
  X, 
  Search,
  Key,
  Globe,
  Settings2,
  Mail,
  Clock,
  Send,
  CalendarCheck,
  ShieldCheck,
  AlertTriangle,
  AtSign,
  PlusCircle,
  FileSpreadsheet,
  UserPlus,
  LayoutDashboard,
  Building2,
  Map as MapIcon,
  BookOpen,
  MapPinned,
  ClipboardList,
  LayoutGrid,
  FileUp,
  FileText,
  History,
  CheckSquare,
  Square,
  HelpCircle
} from 'lucide-react';

interface Props {
  state: AppState;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onSwitchUser: (id: string) => void;
  onUpdateScheduledExport: (config: ScheduledExport) => void;
  onUpdateSecurityPolicy: (policy: SecurityPolicy) => void;
}

const ALL_SYSTEM_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'buildings', label: 'Patrimonio Immobili', icon: Building2 },
  { id: 'roads', label: 'Rete Viaria', icon: MapIcon },
  { id: 'tech-registry', label: 'Registro Tecnico Asset', icon: BookOpen },
  { id: 'map-view', label: 'Mappa Interattiva', icon: MapPinned },
  { id: 'interventions', label: 'Registro Interventi', icon: ClipboardList },
  { id: 'data-view', label: 'Analisi Tabellare', icon: LayoutGrid },
  { id: 'csv-import', label: 'Importazione CSV', icon: FileUp },
  { id: 'reports', label: 'Report & Export', icon: FileText },
  { id: 'history', label: 'Log Audit', icon: History },
  { id: 'user-management', label: 'Gestione Utenti', icon: Users },
  { id: 'manuals', label: 'Manuale Utente', icon: HelpCircle }
];

const EDITOR_DEFAULT_TABS = ['buildings', 'roads', 'tech-registry', 'data-view', 'history', 'dashboard', 'map-view', 'interventions', 'manuals'];
const USER_DEFAULT_TABS = ['dashboard', 'map-view', 'interventions', 'manuals'];

const UserManagement: React.FC<Props> = ({ 
  state, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser, 
  onSwitchUser, 
  onUpdateScheduledExport,
  onUpdateSecurityPolicy
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'exports' | 'security'>('users');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [exportForm, setExportForm] = useState<ScheduledExport>(state.scheduledExport);
  const [securityForm, setSecurityForm] = useState<SecurityPolicy>(state.securityPolicy);
  const [newDomain, setNewDomain] = useState('');
  const [newRecipient, setNewRecipient] = useState('');

  const [formData, setFormData] = useState<User>({
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    accessibleTabs: USER_DEFAULT_TABS
  });

  const resetForm = () => {
    setFormData({
      id: '',
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'user',
      accessibleTabs: USER_DEFAULT_TABS
    });
    setIsEditing(null);
    setShowForm(false);
  };

  const handleRoleChange = (newRole: UserRole) => {
    let newTabs = formData.accessibleTabs;
    
    // Applica i default se l'utente non ha ancora personalizzato pesantemente i tab o se stiamo creando un nuovo utente
    if (newRole === 'editor') {
      newTabs = EDITOR_DEFAULT_TABS;
    } else if (newRole === 'user') {
      newTabs = USER_DEFAULT_TABS;
    } else if (newRole === 'admin') {
      newTabs = ALL_SYSTEM_TABS.map(t => t.id);
    }

    setFormData({
      ...formData,
      role: newRole,
      accessibleTabs: newTabs
    });
  };

  const handleExportSave = () => {
    onUpdateScheduledExport(exportForm);
    alert("Schedulazione Export salvata correttamente.");
  };

  const handleSecuritySave = () => {
    onUpdateSecurityPolicy(securityForm);
    alert("Politiche di Sicurezza aggiornate.");
  };

  const addDomain = () => {
    const domain = newDomain.trim().toLowerCase().replace('@', '');
    if (domain && !securityForm.allowedDomains.includes(domain)) {
      setSecurityForm({
        ...securityForm,
        allowedDomains: [...securityForm.allowedDomains, domain]
      });
      setNewDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    setSecurityForm({
      ...securityForm,
      allowedDomains: securityForm.allowedDomains.filter(d => d !== domain)
    });
  };

  const addRecipient = (email?: string) => {
    const targetEmail = (email || newRecipient).trim().toLowerCase();
    if (targetEmail) {
      const currentRecipients = exportForm.recipients ? exportForm.recipients.split(',').map(e => e.trim()) : [];
      if (!currentRecipients.includes(targetEmail)) {
        setExportForm({
          ...exportForm,
          recipients: [...currentRecipients, targetEmail].join(', ')
        });
      }
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    const currentRecipients = exportForm.recipients.split(',').map(e => e.trim());
    setExportForm({
      ...exportForm,
      recipients: currentRecipients.filter(e => e !== email).join(', ')
    });
  };

  const toggleTab = (tabId: string) => {
    setFormData(prev => {
      const isSelected = prev.accessibleTabs.includes(tabId);
      if (isSelected) {
        return { ...prev, accessibleTabs: prev.accessibleTabs.filter(t => t !== tabId) };
      } else {
        return { ...prev, accessibleTabs: [...prev.accessibleTabs, tabId] };
      }
    });
  };

  const handleSelectAllTabs = () => {
    setFormData(prev => ({
      ...prev,
      accessibleTabs: ALL_SYSTEM_TABS.map(t => t.id)
    }));
  };

  const handleDeselectAllTabs = () => {
    setFormData(prev => ({
      ...prev,
      accessibleTabs: []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityForm.enforceDomainCheck && securityForm.allowedDomains.length > 0) {
      const userDomain = formData.email.split('@')[1]?.toLowerCase();
      if (!securityForm.allowedDomains.includes(userDomain)) {
        alert(`Errore: Il dominio @${userDomain} non è tra quelli autorizzati.`);
        return;
      }
    }

    if (isEditing) {
      onUpdateUser(formData);
    } else {
      onAddUser({ ...formData, id: `user-${crypto.randomUUID()}` });
    }
    resetForm();
  };

  const filteredUsers = state.users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.firstName && u.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.lastName && u.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Amministrazione Sistema</h2>
          <p className="text-sm text-slate-500">Gestione operatori, sicurezza e automazioni</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
           <button 
             onClick={() => setActiveSubTab('users')}
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'users' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <Users size={16} /> Utenti
           </button>
           <button 
             onClick={() => setActiveSubTab('exports')}
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'exports' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <Send size={16} /> Export
           </button>
           <button 
             onClick={() => setActiveSubTab('security')}
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'security' ? 'bg-white text-institutional-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <ShieldCheck size={16} /> Sicurezza
           </button>
        </div>
      </div>

      {activeSubTab === 'users' && (
        <>
          {showForm && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl animate-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-institutional-50 text-institutional-700 rounded-xl"><UserPlus size={20} /></div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    {isEditing ? 'Modifica Privilegi Utente' : 'Registrazione Nuovo Utente'}
                  </h3>
                </div>
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors p-2"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome</label>
                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-institutional-700 outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cognome</label>
                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-institutional-700 outline-none" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username</label>
                    <input required className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-institutional-700 outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Istituzionale</label>
                    <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-institutional-700 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ruolo di Sistema</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-institutional-700 outline-none" 
                      value={formData.role} 
                      onChange={e => handleRoleChange(e.target.value as UserRole)}
                    >
                      <option value="user">User (Operatore Standard)</option>
                      <option value="editor">Editor (Autorità di Inserimento)</option>
                      <option value="admin">Admin (Amministratore Totale)</option>
                    </select>
                    <p className="text-[10px] text-slate-400 italic px-1">* La selezione del ruolo aggiorna i privilegi predefiniti. Gli Admin hanno accesso totale.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password Iniziale</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-institutional-700 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>

                {/* Sezione Privilegi Accesso */}
                <div className="space-y-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Key size={18} className="text-institutional-700" /> Privilegi di Accesso alle Funzionalità
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Seleziona le sezioni visibili all'operatore</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleSelectAllTabs} className="text-[10px] font-black text-institutional-700 hover:underline uppercase tracking-widest">Seleziona Tutto</button>
                      <span className="text-slate-300">|</span>
                      <button type="button" onClick={handleDeselectAllTabs} className="text-[10px] font-black text-slate-400 hover:text-red-500 hover:underline uppercase tracking-widest">Rimuovi Tutti</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ALL_SYSTEM_TABS.map(tab => {
                      const isSelected = formData.accessibleTabs.includes(tab.id);
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => toggleTab(tab.id)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group ${
                            isSelected 
                              ? 'bg-white border-institutional-200 shadow-sm ring-1 ring-institutional-200' 
                              : 'bg-white/40 border-slate-100 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-institutional-50 text-institutional-700' : 'bg-slate-50 text-slate-300 group-hover:text-slate-400'}`}>
                            <tab.icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-black uppercase tracking-tight truncate ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>{tab.label}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">{isSelected ? 'Abilitato' : 'Disabilitato'}</p>
                          </div>
                          {isSelected ? <CheckSquare size={18} className="text-institutional-600" /> : <Square size={18} className="text-slate-200" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-institutional-700 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition-all hover:bg-institutional-800 shadow-xl shadow-institutional-700/20 active:scale-[0.98]">
                    {isEditing ? 'Salva Modifiche Privilegi' : 'Crea Account Operatore'}
                  </button>
                  <button type="button" onClick={resetForm} className="px-10 bg-slate-100 text-slate-500 font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition-all hover:bg-slate-200">
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-institutional-700 outline-none shadow-inner" placeholder="Cerca operatore per nome, username o email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              {!showForm && (
                <button onClick={() => setShowForm(true)} className="bg-institutional-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-institutional-800 shadow-lg shadow-institutional-700/20 active:scale-95">
                  <PlusCircle size={18} /> Registra Operatore
                </button>
              )}
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identità Operatore</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ruolo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Funzionalità Abilitate</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Configurazione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-institutional-700 text-white font-black flex items-center justify-center shadow-sm text-lg">{user.username[0].toUpperCase()}</div>
                        <div>
                          <p className="font-black text-slate-900 leading-none mb-1 group-hover:text-institutional-700 transition-colors">
                            {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium lowercase italic">
                            <AtSign size={10} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                        user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 
                        user.role === 'editor' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-700">{user.role === 'admin' ? 'Tutte' : user.accessibleTabs.length}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">sezioni abilitate</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => { setFormData(user); setIsEditing(user.id); setShowForm(true); }} 
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-institutional-700 hover:border-institutional-700 rounded-xl transition-all shadow-sm group-hover:scale-105"
                        title="Modifica Privilegi"
                      >
                        <Settings2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDeleteUser(user.id)} 
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-600 rounded-xl transition-all shadow-sm group-hover:scale-105"
                        title="Elimina Utente"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeSubTab === 'exports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-institutional-50 text-institutional-700 rounded-3xl shadow-sm"><Mail size={32} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Automazione Export CSV</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Invio automatico dei dati tecnici e manutentivi</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer scale-110">
                    <input type="checkbox" className="sr-only peer" checked={exportForm.enabled} onChange={e => setExportForm({...exportForm, enabled: e.target.checked})} />
                    <div className="w-16 h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-institutional-700 after:content-[''] after:absolute after:top-1 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                  </label>
                </div>

                <div className={`space-y-10 transition-all duration-500 ${exportForm.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                  {/* Schedulazione */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Clock size={16} className="text-institutional-700" /> Pianificazione Invio</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Frequenza</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['daily', 'weekly', 'monthly'] as ExportFrequency[]).map(freq => (
                            <button
                              key={freq}
                              onClick={() => setExportForm({...exportForm, frequency: freq})}
                              className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${exportForm.frequency === freq ? 'bg-institutional-50 border-institutional-200 text-institutional-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                            >
                              {freq === 'daily' ? 'Giorno' : freq === 'weekly' ? 'Sett' : 'Mese'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Orario di Invio</label>
                        <input 
                          type="time" 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-institutional-700"
                          value={exportForm.exportTime || '08:00'}
                          onChange={e => setExportForm({...exportForm, exportTime: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Destinatari */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><AtSign size={16} className="text-institutional-700" /> Destinatari Report</h4>
                    <div className="flex gap-2">
                       <input 
                         className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-institutional-700" 
                         placeholder="Inserisci indirizzo email..."
                         value={newRecipient}
                         onChange={e => setNewRecipient(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && addRecipient()}
                       />
                       <button onClick={() => addRecipient()} className="bg-slate-900 text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                         <Plus size={16} /> Aggiungi
                       </button>
                    </div>

                    {/* Quick Add from Users */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Aggiunta Rapida:</span>
                       {state.users.filter(u => u.email).slice(0, 5).map(u => (
                         <button 
                           key={u.id}
                           onClick={() => addRecipient(u.email)}
                           className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[9px] font-bold transition-all flex items-center gap-1 whitespace-nowrap"
                         >
                           <UserPlus size={10} /> {u.username}
                         </button>
                       ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {(exportForm.recipients ? exportForm.recipients.split(',').map(e => e.trim()).filter(e => e.length > 0) : []).map(email => (
                        <div key={email} className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3 animate-in zoom-in duration-200 shadow-sm">
                          <span className="text-xs font-bold text-slate-700">{email}</span>
                          <button onClick={() => removeRecipient(email)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-institutional-50/50 rounded-2xl border border-institutional-100">
                    <input 
                      type="checkbox" 
                      id="includeAudit" 
                      className="w-5 h-5 rounded border-slate-300 text-institutional-700 focus:ring-institutional-700"
                      checked={exportForm.includeAuditLogs}
                      onChange={e => setExportForm({...exportForm, includeAuditLogs: e.target.checked})}
                    />
                    <label htmlFor="includeAudit" className="text-xs font-bold text-slate-600 cursor-pointer">Includi il registro Audit (log attività) nell'allegato CSV</label>
                  </div>
                </div>

                <button onClick={handleExportSave} className="w-full bg-institutional-700 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs transition-all hover:bg-institutional-800 shadow-xl shadow-institutional-700/20">
                  Salva Configurazione Automazione
                </button>
             </div>
           </div>

           <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><FileSpreadsheet size={16} className="text-institutional-700" /> Stato Servizio</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ultimo Export</span>
                    <span className="text-[10px] font-bold text-slate-700">{exportForm.lastRun ? new Date(exportForm.lastRun).toLocaleString() : 'Mai eseguito'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedulazione</span>
                    <span className="text-[10px] font-black uppercase text-institutional-700">{exportForm.frequency} @ {exportForm.exportTime || '08:00'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stato Schedulatore</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${exportForm.enabled ? 'text-emerald-600' : 'text-slate-300'}`}>
                      {exportForm.enabled ? 'Attivo' : 'Sospeso'}
                    </span>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {activeSubTab === 'security' && (
        <div className="max-w-4xl space-y-8">
           <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-institutional-50 text-institutional-700 rounded-3xl shadow-sm"><Shield size={32} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Politiche di Accesso</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Restrizione domini email e sicurezza account</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer scale-110">
                    <input type="checkbox" className="sr-only peer" checked={securityForm.enforceDomainCheck} onChange={e => setSecurityForm({...securityForm, enforceDomainCheck: e.target.checked})} />
                    <div className="w-16 h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-institutional-700 after:content-[''] after:absolute after:top-1 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                  </label>
               </div>

               <div className={`space-y-8 transition-all duration-500 ${securityForm.enforceDomainCheck ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe size={14} /> Domini Email Autorizzati (White List)</label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                        <input 
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-8 text-sm font-bold outline-none focus:ring-2 focus:ring-institutional-700" 
                          placeholder="provincia.it"
                          value={newDomain}
                          onChange={e => setNewDomain(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addDomain()}
                        />
                      </div>
                      <button onClick={addDomain} className="bg-slate-900 text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                        <PlusCircle size={16} /> Aggiungi
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      {securityForm.allowedDomains.map(domain => (
                        <div key={domain} className="bg-institutional-50 border border-institutional-100 px-4 py-2 rounded-xl flex items-center gap-3 animate-in zoom-in duration-200">
                          <span className="text-xs font-black text-institutional-700 uppercase">@{domain}</span>
                          <button onClick={() => removeDomain(domain)} className="text-institutional-300 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {securityForm.allowedDomains.length === 0 && (
                        <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-3xl w-full">
                          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Nessun dominio configurato. Qualsiasi email sarà accettata.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4">
                    <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Attenzione sulla restrizione domini</p>
                      <p className="text-[10px] text-amber-700 font-bold leading-relaxed">Attivando questo controllo, non sarà possibile registrare nuovi utenti con email appartenenti a domini non elencati sopra. Gli utenti già registrati manterranno l'accesso.</p>
                    </div>
                  </div>
               </div>

               <button onClick={handleSecuritySave} className="w-full bg-institutional-700 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs transition-all hover:bg-institutional-800 shadow-xl shadow-institutional-700/20">
                 Salva Politiche di Sicurezza
               </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
