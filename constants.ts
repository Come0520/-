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
    actor: 'System',
    action: 'Ready',
    detail: 'Windows XP 业务系统已启动。等待指令...'
  }
];

// XP 风格：使用经典的系统高亮色
export const STATUS_COLORS: Record<string, string> = {
  // 线索 Lead
  [LeadStatus.NEW]: 'text-black',
  [LeadStatus.ASSIGNED]: 'text-[#000080] font-bold', // Navy
  [LeadStatus.FOLLOWING]: 'text-[#E68B2C] font-bold', // XP Orange
  [LeadStatus.CONVERTED]: 'text-[#3C8B18] font-bold', // XP Green
  [LeadStatus.INVALID]: 'text-gray-400 line-through',
  
  // 报价 Quote
  [QuoteVersionStatus.DRAFT]: 'text-gray-500 italic',
  [QuoteVersionStatus.PRELIMINARY]: 'text-black',
  [QuoteVersionStatus.MEASURING]: 'text-[#003399] underline',
  [QuoteVersionStatus.REVISED]: 'text-[#E68B2C]',
  [QuoteVersionStatus.CONFIRMED]: 'bg-[#3C8B18] text-white px-1 rounded-sm',
  [QuoteVersionStatus.CANCELLED]: 'text-red-600',

  // 销售 Sales
  [SalesOrderStatus.PURCHASING]: 'text-[#003399]',
  [SalesOrderStatus.SHIPPING]: 'text-[#E68B2C]',
  [SalesOrderStatus.INSTALLING]: 'text-black font-bold',
  [SalesOrderStatus.RECONCILIATION]: 'bg-[#E68B2C] text-white px-1',
  [SalesOrderStatus.COMPLETED]: 'bg-[#3C8B18] text-white px-1',

  // 服务 (测量/安装) Service
  [ServiceOrderStatus.PENDING]: 'text-gray-500',
  [ServiceOrderStatus.ASSIGNING]: 'text-[#000080]',
  [ServiceOrderStatus.WAITING]: 'text-[#E68B2C]',
  [ServiceOrderStatus.CONFIRMING]: 'text-red-600 font-bold', // Attention needed

  // 对账 Reconciliation
  [ReconciliationStatus.RECONCILING]: 'text-[#003399]',
  [ReconciliationStatus.DISCREPANCY]: 'bg-red-600 text-white px-1 blink',
  [ReconciliationStatus.ADJUSTED]: 'text-[#3C8B18]',
};

export const MOCK_METRICS = [
  { name: '线索转化率', value: 34, target: 30, unit: '%' },
  { name: '报价转销售', value: 42, target: 40, unit: '%' },
  { name: '平均处理周期', value: 28, target: 30, unit: '天' },
  { name: '回款完成率', value: 95, target: 90, unit: '%' },
];