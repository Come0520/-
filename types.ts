// Document Types
export enum DocumentType {
  LEAD = 'LEAD',
  QUOTE = 'QUOTE',
  MEASUREMENT = 'MEASUREMENT',
  SALES_ORDER = 'SALES_ORDER',
  INSTALLATION = 'INSTALLATION',
  RECONCILIATION = 'RECONCILIATION',
}

// Stage Enums
export enum LeadStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  FOLLOWING = 'following',
  CONVERTED = 'converted',
  INVALID = 'invalid'
}

export enum QuoteVersionStatus {
  DRAFT = 'draft',
  PRELIMINARY = 'preliminary',
  MEASURING = 'measuring',
  REVISED = 'revised',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

export enum ServiceOrderStatus { // Shared for Measurement & Installation
  PENDING = 'pending', // 待分配
  ASSIGNING = 'assigning', // 分配中
  WAITING = 'waiting', // 待上门
  CONFIRMING = 'confirming', // 待确认
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled'
}

export enum SalesOrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PURCHASING = 'purchasing',
  SHIPPING = 'shipping',
  INSTALLING = 'installing',
  RECONCILIATION = 'reconciliation', // 待对账
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ReconciliationStatus {
  PENDING = 'pending',
  RECONCILING = 'reconciling',
  DISCREPANCY = 'discrepancy',
  ADJUSTED = 'adjusted',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Entity Interfaces
export interface Lead {
  id: string;
  customerName: string;
  status: LeadStatus;
  tags: string[]; // "已报价", "已到店", "已预约"
  history: string[];
}

export interface QuoteVersion {
  versionId: string; // V1.0, V1.1
  status: QuoteVersionStatus;
  createdAt: string;
  isCurrent: boolean;
}

export interface Quote {
  id: string;
  leadId: string;
  versions: QuoteVersion[];
  currentStatus: QuoteVersionStatus; // Synced from current version
}

export interface Measurement {
  id: string;
  quoteVersionId: string;
  status: ServiceOrderStatus;
}

export interface SalesOrder {
  id: string;
  quoteId: string;
  quoteVersion: string;
  status: SalesOrderStatus;
  procurementIds: string[]; // 采购单号
  logisticsStatus?: string; // "已发货" label
  installImage?: string;
}

export interface Installation {
  id: string;
  salesOrderId: string;
  status: ServiceOrderStatus;
}

export interface Reconciliation {
  id: string;
  salesOrderId: string;
  status: ReconciliationStatus;
}

// The entire state of a "Demo" run
export interface SimulationState {
  lead: Lead | null;
  quote: Quote | null;
  measurement: Measurement | null;
  salesOrder: SalesOrder | null;
  installation: Installation | null;
  reconciliation: Reconciliation | null;
  logs: LogEntry[];
}

export interface LogEntry {
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}
