import { 
  LeadStatus, 
  QuoteVersionStatus, 
  SalesOrderStatus, 
  ServiceOrderStatus, 
  ReconciliationStatus 
} from './types';

export const INITIAL_LOGS = [
  {
    timestamp: new Date().toLocaleTimeString('zh-CN'),
    actor: '系统',
    action: '初始化',
    detail: '草稿本已就绪，等待录入新线索。'
  }
];

// 使用边框和文字颜色来区分状态，模仿笔迹
export const STATUS_COLORS: Record<string, string> = {
  // 线索 Lead
  [LeadStatus.NEW]: 'text-gray-500 border-gray-400 border-dashed',
  [LeadStatus.ASSIGNED]: 'text-ink-blue border-ink-blue border-dotted',
  [LeadStatus.FOLLOWING]: 'text-ink-blue border-ink-blue font-bold',
  [LeadStatus.CONVERTED]: 'text-pencil-dark border-pencil-dark bg-gray-100', // 填色代表完成
  [LeadStatus.INVALID]: 'text-gray-400 line-through decoration-2 decoration-red-500', // 划掉
  
  // 报价 Quote
  [QuoteVersionStatus.DRAFT]: 'text-gray-500 italic', // 铅笔草写
  [QuoteVersionStatus.PRELIMINARY]: 'text-ink-blue border-b-2 border-ink-blue',
  [QuoteVersionStatus.MEASURING]: 'text-pencil-dark border-2 border-dashed border-pencil-dark',
  [QuoteVersionStatus.REVISED]: 'text-ink-red font-bold', // 红色批改
  [QuoteVersionStatus.CONFIRMED]: 'text-pencil-dark font-bold border-2 border-pencil-dark ring-2 ring-pencil-dark/20', // 重点圈出
  [QuoteVersionStatus.CANCELLED]: 'text-gray-400 line-through decoration-double',

  // 销售 Sales
  [SalesOrderStatus.PURCHASING]: 'text-ink-blue underline decoration-wavy',
  [SalesOrderStatus.SHIPPING]: 'text-ink-blue dashed-underline',
  [SalesOrderStatus.INSTALLING]: 'text-pencil-dark font-bold',
  [SalesOrderStatus.RECONCILIATION]: 'text-ink-red border border-ink-red',
  [SalesOrderStatus.COMPLETED]: 'text-white bg-pencil-dark',
  // CANCELLED handled by QuoteVersionStatus.CANCELLED

  // 服务 (测量/安装) Service
  [ServiceOrderStatus.PENDING]: 'text-gray-400 border-gray-300 border-dashed',
  [ServiceOrderStatus.ASSIGNING]: 'text-ink-blue animate-pulse',
  [ServiceOrderStatus.WAITING]: 'text-ink-blue border-ink-blue',
  [ServiceOrderStatus.CONFIRMING]: 'text-ink-red border-ink-red',
  // COMPLETED handled by SalesOrderStatus.COMPLETED
  // CANCELLED handled by QuoteVersionStatus.CANCELLED

  // 对账 Reconciliation
  [ReconciliationStatus.RECONCILING]: 'text-ink-blue',
  [ReconciliationStatus.DISCREPANCY]: 'text-white bg-ink-red', // 醒目错误
  [ReconciliationStatus.ADJUSTED]: 'text-ink-blue italic',
  // COMPLETED handled by SalesOrderStatus.COMPLETED
};

export const MOCK_METRICS = [
  { name: '线索转化率', value: 34, target: 30, unit: '%' },
  { name: '报价转销售', value: 42, target: 40, unit: '%' },
  { name: '平均处理周期', value: 28, target: 30, unit: '天' },
  { name: '回款完成率', value: 95, target: 90, unit: '%' },
];

export const FLOW_STEPS = [
  { id: 'lead', label: '线索 Lead' },
  { id: 'quote', label: '报价 Quote' },
  { id: 'measurement', label: '测量 Measure', isSub: true, parent: 'quote' },
  { id: 'sales', label: '销售单 Sales' },
  { id: 'installation', label: '安装 Install', isSub: true, parent: 'sales' },
  { id: 'reconciliation', label: '对账 Finance', isSub: true, parent: 'sales' },
];