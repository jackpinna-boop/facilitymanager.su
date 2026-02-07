
export enum InterventoType {
  ORDINARIO = 'Interventi Ordinari',
  STRAORDINARIO = 'Interventi Straordinari',
  MANUTENZIONE = 'Manutenzioni',
  PROGETTAZIONE_ESECUZIONE = 'Interventi a seguito di progettazione',
  SOLA_PROGETTAZIONE = 'Sola Progettazione'
}

export interface RupHistory {
  name: string;
  startDate: string;
  id: string;
}

export interface Suspension {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface Extension {
  id: string;
  days: number;
  reason: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface TechnicalData {
  surfaceArea?: number;
  volume?: number;
  floors?: number;
  heatingSystem?: string;
  electricalSystem?: string;
  waterSystem?: string;
  fireSafetyStatus?: string;
  pavementType?: string; // Specifico per strade
  averageWidth?: number; // Specifico per strade
  maintenanceStatus?: string; // Specifico per strade
  floorPlans: FloorPlan[];
}

export interface Intervento {
  id: string;
  uniqueCode?: string; // Codice univoco generato dal sistema
  targetId: string; // ID of structure, plesso, pertinenza OR road
  targetType: 'structure' | 'plesso' | 'pertinenza' | 'road';
  type: InterventoType;
  title: string;
  oggetto: string;
  description: string;
  cig: string;
  rupHistory: RupHistory[];
  currentRup: string;
  amount: number;
  dateExecution?: string;
  dateDelivery?: string;
  dateStart?: string;
  dateEnd?: string;
  dateTest?: string;
  suspensions: Suspension[];
  extensions: Extension[];
  createdAt: string;
  lat?: number;
  lng?: number;
}

export interface Pertinenza {
  id: string;
  plessoId: string;
  name: string;
  description: string;
}

export interface Plesso {
  id: string;
  structureId: string;
  name: string;
  previousNames?: string[];
  description: string;
  costCenter?: string;
  uniqueCode?: string;
  pertinenze: Pertinenza[];
  technicalData?: TechnicalData;
}

export interface MainStructure {
  id: string;
  name: string;
  address: string;
  description: string;
  previousNames?: string[];
  costCenter?: string;
  uniqueCode?: string;
  plessi: Plesso[];
  lat?: number;
  lng?: number;
  technicalData?: TechnicalData;
}

export interface Road {
  id: string;
  code: string; // e.g., SP 12
  uniqueCode?: string;
  costCenter?: string;
  name: string;
  lengthKm: number;
  description: string;
  lat?: number;
  lng?: number;
  technicalData?: TechnicalData;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PURGE' | 'LOGIN';
  entityType: string;
  entityId: string;
  details: string;
}

export interface NotificationSettings {
  daysBeforeDeadline: number;
  notifyStart: boolean;
  notifyEnd: boolean;
  notifyTest: boolean;
}

export type UserRole = 'admin' | 'editor' | 'user';

export type ExportFrequency = 'daily' | 'weekly' | 'monthly';

export interface ScheduledExport {
  enabled: boolean;
  recipients: string; // comma separated emails
  frequency: ExportFrequency;
  exportTime?: string; // HH:mm format
  lastRun?: string;
  includeAuditLogs: boolean;
}

export interface SecurityPolicy {
  enforceDomainCheck: boolean;
  allowedDomains: string[]; // e.g. ["provincia.sulcis.it"]
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  accessibleTabs: string[];
  isLdapUser?: boolean;
}

export interface ManualEntry {
  content: string;
  externalUrl?: string;
  title?: string;
}

export interface AppState {
  structures: MainStructure[];
  roads: Road[];
  interventi: Intervento[];
  auditLogs: AuditLog[];
  notificationSettings: NotificationSettings;
  scheduledExport: ScheduledExport;
  securityPolicy: SecurityPolicy;
  users: User[];
  currentUserId: string | null;
  manualContents: Record<string, ManualEntry>;
}
