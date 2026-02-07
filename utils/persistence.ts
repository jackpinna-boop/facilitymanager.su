
import { AppState, User, ScheduledExport, SecurityPolicy, ManualEntry } from '../types';
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'edilgest_pro_data';

const SUPABASE_URL = 'https://fhjpazrloifriojbxnun.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoanBhenJsb2lmcmlvamJ4bnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjY0MTcsImV4cCI6MjA4NjA0MjQxN30.oqW0BFyrykTF2dmXRpcLhsVWBXLVCTfd4mfKaBZzQ2s'; 

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

export const isCloudEnabled = () => !!supabase;

const ALL_TABS = [
  'dashboard', 'buildings', 'roads', 'map-view', 
  'interventions', 'data-view', 'csv-import', 
  'reports', 'history', 'user-management', 'tech-registry', 'manuals', 'system-db'
];

const EDITOR_TABS = [
  'buildings', 'roads', 'tech-registry', 'data-view', 
  'history', 'dashboard', 'map-view', 'interventions', 'manuals'
];

const OPERATOR_TABS = [
  'dashboard', 'buildings', 'roads', 'map-view', 
  'interventions', 'tech-registry', 'manuals'
];

const DEFAULT_EXPORT_CONFIG: ScheduledExport = {
  enabled: false,
  recipients: '',
  frequency: 'weekly',
  includeAuditLogs: false
};

const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  enforceDomainCheck: false,
  allowedDomains: []
};

const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  firstName: 'Amministratore',
  lastName: 'Sistema',
  email: 'admin@provincia.it',
  password: 'AdminPassword2025!',
  role: 'admin',
  accessibleTabs: ALL_TABS
};

const DEFAULT_EDITOR: User = {
  id: 'editor-001',
  username: 'editor',
  firstName: 'Editor',
  lastName: 'Patrimonio',
  email: 'editor@provincia.it',
  password: 'password',
  role: 'editor',
  accessibleTabs: EDITOR_TABS
};

const DEFAULT_USER: User = {
  id: 'user-001',
  username: 'user',
  firstName: 'Operatore',
  lastName: 'Standard',
  email: 'user@provincia.it',
  role: 'user',
  accessibleTabs: OPERATOR_TABS
};

const INITIAL_USERS = [DEFAULT_ADMIN, DEFAULT_EDITOR, DEFAULT_USER];

const DEFAULT_MANUAL_CONTENTS: Record<string, ManualEntry> = {
  // Gestione Patrimonio
  "censimento-immobile": { 
    content: "<div><b>Come censire un nuovo immobile</b></div><div><br></div><div>Per inserire un nuovo immobile nel patrimonio della Provincia, seguire questi passaggi:</div><ul><li>Accedere alla sezione <b>Patrimonio Immobili</b>.</li><li>Cliccare sul pulsante <b>+ Nuovo Immobile</b>.</li><li>Inserire i dati anagrafici (Nome, Indirizzo).</li><li>Utilizzare la funzione di geolocalizzazione per centrare l'asset sulla mappa.</li><li>Salvare per generare automaticamente il <b>Codice Univoco (IMM_XXXX)</b>.</li></ul>",
    externalUrl: "https://www.provincia.it/patrimonio/linee-guida-censimento.pdf"
  },
  "associazione-plessi": {
    content: "<div><b>Gestione dei Plessi (Unità Locali)</b></div><div><br></div><div>Ogni immobile può contenere più plessi (es. Ala Nord, Palestra, Uffici distaccati):</div><ul><li>Individuare l'immobile padre nella griglia.</li><li>Cliccare su <b>Nuovo Plesso</b>.</li><li>Definire la destinazione d'uso e il centro di costo specifico se diverso dal fabbricato principale.</li><li>Il sistema manterrà il legame gerarchico garantendo la tracciabilità delle manutenzioni su singola unità.</li></ul>"
  },
  "storico-nomi": {
    content: "<div><b>Tracciabilità delle denominazioni</b></div><div><br></div><div>È fondamentale tenere traccia dei nomi storici degli edifici per consultare vecchie delibere:</div><ul><li>In fase di modifica asset, accedere alla sezione <b>Storico Nomi</b>.</li><li>Aggiungere le vecchie denominazioni.</li><li>Il motore di ricerca globale permetterà di trovare l'asset anche cercando con i nomi obsoleti.</li></ul>"
  },
  "dati-tecnici": {
    content: "<div><b>Inserimento Scheda Tecnica e Planimetrie</b></div><div><br></div><div>Per ogni asset è possibile caricare specifiche tecniche avanzate:</div><ul><li>Entrare nel form di creazione/modifica e aprire <b>Configurazione Dati Tecnici</b>.</li><li>Inserire superfici, volumi e tipologie di impianto.</li><li>Caricare file PDF delle planimetrie. I file vengono salvati nel database locale o cloud per consultazione immediata dei tecnici RUP.</li></ul>"
  },
  "man-1": { content: "### Registrazione di un nuovo intervento\n\nPer inserire un intervento manutentivo:\n1. Cliccare sul pulsante **Nuovo Intervento** nella barra laterale o nel dettaglio asset.\n2. Inserire obbligatoriamente il **CIG** (Codice Identificativo Gara).\n3. Selezionare l'asset target (Strada o Immobile).\n4. Definire l'importo di contratto e il RUP responsabile.\n5. Specificare se si tratta di manutenzione ordinaria o straordinaria." },
  "man-2": { content: "### Monitoraggio scadenze e cronoprogramma\n\nIl sistema monitora automaticamente le date:\n1. Il pannello **Notifiche** segnala gli interventi in scadenza.\n2. In Dashboard, il grafico 'Stato Manutenzioni' mostra la distribuzione dei lavori nel tempo.\n3. È possibile filtrare gli interventi per 'Data Inizio' o 'Data Fine' nella sezione Analisi Tabellare." },
  "man-3": { content: "### Gestione varianti: Proroghe e Sospensioni\n\nPer documentare ritardi o varianti in corso d'opera:\n1. Aprire la scheda di dettaglio dell'intervento.\n2. Cliccare su **Modifica**.\n3. Nella sezione 'Cronoprogramma', aggiungere una **Sospensione** (specificando inizio/fine e causa) o una **Proroga** (specificando i giorni aggiuntivi)." },
  "man-4": { content: "### Analisi Budget e Rendicontazione\n\nIl modulo Reporting permette di:\n1. Filtrare gli interventi per Centro di Costo (CdC).\n2. Esportare in CSV il registro completo per la contabilità dell'ente.\n3. Visualizzare l'importo totale impegnato per singolo edificio o tratta stradale." },
  "map-1": { content: "### Utilizzo della mappa interattiva\n\nLa mappa interattiva fornisce una vista geospaziale del patrimonio:\n1. Utilizzare i tasti 'Filtri Layer' per switchare tra Interventi, Immobili e Strade.\n2. Cliccare su un pin per visualizzare l'anteprima dei dati.\n3. Il tasto 'Centra' sulla sidebar permette di zoomare istantaneamente sull'asset selezionato." },
  "map-2": { content: "### Geocodifica automatica\n\nEdilGest Pro integra l'IA per la localizzazione:\n1. Nel form di inserimento, scrivere l'indirizzo testuale.\n2. Cliccare sull'icona **Bussola/Navigation**.\n3. Il sistema interroga i servizi cartografici e popola automaticamente le coordinate Lat/Lng." },
  "map-3": { content: "### Consultazione Registro Tecnico Stradale\n\nPer ogni strada provinciale (SP) il registro riporta:\n1. Lunghezza chilometrica totale.\n2. Larghezza media della carreggiata.\n3. Tipologia di manto e stato conservativo rilevato dall'ultimo sopralluogo." },
  "map-4": { content: "### Filtri avanzati per la rete viaria\n\nÈ possibile isolare tratti stradali specifici:\n1. Accedere a 'Rete Viaria'.\n2. Filtrare per codice SP (es. SP 12).\n3. Ordinare per estensione o per numero di interventi manutentivi attivi sulla tratta." },
  "admin-1": { content: "### Configurazione permessi granulari\n\nL'amministratore può definire chi vede cosa:\n1. Nella sezione **Gestione Utenti**, modificare un profilo esistente.\n2. Selezionare o deselezionare i 'Tab di Sistema'.\n3. Un utente 'User' solitamente ha accesso solo a Dashboard e Manuale, mentre un 'Editor' può modificare il patrimonio." },
  "admin-2": { content: "### Audit Log: Tracciabilità Totale\n\nOgni operazione viene registrata nel Log Audit:\n1. Azione compiuta (Creazione, Modifica, Eliminazione).\n2. Timestamp preciso dell'operazione.\n3. Identificativo dell'utente che ha effettuato l'azione.\n*Nota: Il Log Audit non è cancellabile per garantire la trasparenza amministrativa.*" },
  "admin-3": { content: "### Backup e Esportazione CSV\n\nPer la salvaguardia dei dati e l'interoperabilità:\n1. Accedere a 'Report & Export'.\n2. Scegliere i filtri desiderati.\n3. Scaricare il file CSV. L'admin può inoltre scaricare gli script di setup SQL per il database cloud." },
  "admin-4": { content: "### Politiche di sicurezza e White-list\n\nPer proteggere l'accesso al portale:\n1. Abilitare il 'Controllo Dominio'.\n2. Inserire i domini email autorizzati (es. provincia.it).\n3. Il sistema bloccherà qualsiasi tentativo di registrazione da email non appartenenti ai domini in lista." }
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;
  
  const allKeys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
  const headers = allKeys.join(',');
  
  const rows = data.map(obj => {
    return allKeys.map(key => {
      const val = obj[key];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(',');
  });
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const saveState = async (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  if (supabase) {
    try {
      if (state.auditLogs.length > 0) {
        const lastLog = state.auditLogs[0];
        await supabase.from('audit_logs').upsert({
          id: lastLog.id,
          action: lastLog.action,
          entity_type: lastLog.entityType,
          details: lastLog.details
        });
      }
    } catch (e) {
      console.error("Cloud Sync Error:", e);
    }
  }
};

export const loadState = async (): Promise<AppState> => {
  const defaultState: AppState = { 
    structures: [], 
    roads: [],
    interventi: [], 
    auditLogs: [],
    notificationSettings: {
      daysBeforeDeadline: 7,
      notifyStart: true,
      notifyEnd: true,
      notifyTest: true
    },
    scheduledExport: DEFAULT_EXPORT_CONFIG,
    securityPolicy: DEFAULT_SECURITY_POLICY,
    users: INITIAL_USERS,
    currentUserId: null,
    manualContents: DEFAULT_MANUAL_CONTENTS
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    let data = saved ? JSON.parse(saved) : { ...defaultState };

    if (supabase) {
      const { data: cloudLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
        
      if (!error && cloudLogs) {
        data.auditLogs = cloudLogs.map((l: any) => ({
          id: l.id,
          timestamp: l.timestamp,
          action: l.action,
          entityType: l.entity_type,
          entityId: l.entity_id || '',
          details: l.details
        }));
      }
    }

    return {
      ...defaultState,
      ...data,
      structures: data.structures || [],
      roads: data.roads || [],
      interventi: data.interventi || [],
      auditLogs: data.auditLogs || [],
      users: (data.users && data.users.length > 0) ? data.users : INITIAL_USERS,
      currentUserId: data.currentUserId || null,
      scheduledExport: data.scheduledExport || DEFAULT_EXPORT_CONFIG,
      securityPolicy: data.securityPolicy || DEFAULT_SECURITY_POLICY,
      notificationSettings: { ...defaultState.notificationSettings, ...(data.notificationSettings || {}) },
      manualContents: data.manualContents || DEFAULT_MANUAL_CONTENTS
    };
  } catch (e) {
    console.warn("Load state failed, using defaults", e);
    return defaultState;
  }
};
