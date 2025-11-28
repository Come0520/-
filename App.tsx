import React, { useReducer, useState, useEffect } from 'react';
import { 
  SimulationState, 
  LeadStatus, 
  QuoteVersionStatus, 
  SalesOrderStatus, 
  ServiceOrderStatus,
  ReconciliationStatus,
  LogEntry
} from './types';
import { INITIAL_LOGS, STATUS_COLORS } from './constants';
import { SimulationController } from './components/SimulationController';
import { PipelineMap } from './components/PipelineMap';
import { DashboardView } from './views/DashboardView';
import { Maximize2, Minimize2, X, Monitor, ChevronRight, Layout } from 'lucide-react';

// --- REDUCER ---

const initialState: SimulationState = {
  lead: null,
  quote: null,
  measurement: null,
  salesOrder: null,
  installation: null,
  reconciliation: null,
  logs: INITIAL_LOGS
};

function log(state: SimulationState, actor: string, action: string, detail: string): LogEntry[] {
  return [{ timestamp: new Date().toLocaleTimeString('zh-CN'), actor, action, detail }, ...state.logs];
}

function simulationReducer(state: SimulationState, action: any): SimulationState {
  // Business logic remains exactly the same, just keeping it robust
  switch (action.type) {
    case 'CREATE_LEAD':
      return {
        ...state,
        lead: { id: 'LD-001', customerName: '张三', status: LeadStatus.NEW, tags: [], history: [] },
        logs: log(state, '系统', '新建', '新线索 LD-001 已录入')
      };
    case 'ASSIGN_LEAD':
      if (!state.lead) return state;
      return { ...state, lead: { ...state.lead, status: LeadStatus.ASSIGNED }, logs: log(state, '经理', '分配', '已分配销售顾问') };
    case 'START_FOLLOWING':
      if (!state.lead) return state;
      return { ...state, lead: { ...state.lead, status: LeadStatus.FOLLOWING }, logs: log(state, '销售', '跟进', '正在联系客户...') };
    case 'TAG_LEAD':
      if (!state.lead) return state;
      return { ...state, lead: { ...state.lead, tags: [...state.lead.tags, action.payload] }, logs: log(state, '销售', '标记', `添加标签: ${action.payload}`) };
    case 'CONVERT_LEAD':
      if (!state.lead) return state;
      return { 
        ...state, 
        lead: { ...state.lead, status: LeadStatus.CONVERTED },
        quote: { id: 'QT-888', leadId: state.lead.id, versions: [{ versionId: 'V1.0', status: QuoteVersionStatus.DRAFT, createdAt: new Date().toISOString(), isCurrent: true }], currentStatus: QuoteVersionStatus.DRAFT },
        logs: log(state, '系统', '转化', '生成报价单 V1.0 (草稿)')
      };
    case 'CLOSE_LEAD':
      if (!state.lead) return state;
      return { ...state, lead: { ...state.lead, status: LeadStatus.INVALID }, logs: log(state, '销售', '关闭', '线索无效') };
    case 'PUBLISH_QUOTE':
      if (!state.quote) return state;
      return { ...state, quote: { ...state.quote, currentStatus: QuoteVersionStatus.PRELIMINARY }, logs: log(state, '销售', '发布', '报价单 V1.0 初稿') };
    case 'CREATE_MEASUREMENT':
      if (!state.quote) return state;
      return { 
        ...state, 
        measurement: { id: 'MS-101', quoteVersionId: 'V1.0', status: ServiceOrderStatus.PENDING },
        quote: { ...state.quote, currentStatus: QuoteVersionStatus.MEASURING },
        logs: log(state, '系统', '测量', '创建测量任务 MS-101')
      };
    case 'MEASURE_ACTION':
      if (!state.measurement) return state;
      let newMStatus = state.measurement.status;
      let logMsg = '';
      if (action.payload === 'ASSIGN') { newMStatus = ServiceOrderStatus.ASSIGNING; logMsg = '派单测量'; }
      if (action.payload === 'ACCEPT') { newMStatus = ServiceOrderStatus.WAITING; logMsg = '测量接单'; }
      if (action.payload === 'COMPLETE_SITE') { newMStatus = ServiceOrderStatus.CONFIRMING; logMsg = '测量完成'; }
      if (action.payload === 'REJECT') { newMStatus = ServiceOrderStatus.ASSIGNING; logMsg = '测量驳回'; }
      if (action.payload === 'CONFIRM') { newMStatus = ServiceOrderStatus.COMPLETED; logMsg = '测量确认'; }
      let updatedQuote = state.quote;
      if (newMStatus === ServiceOrderStatus.COMPLETED && state.quote) {
          updatedQuote = { ...state.quote, currentStatus: QuoteVersionStatus.REVISED };
          logMsg += ' -> 报价重算';
      }
      return { 
        ...state, 
        measurement: { ...state.measurement, status: newMStatus },
        quote: updatedQuote,
        logs: log(state, '外勤', '进度', logMsg)
      };
    case 'NEW_VERSION':
      if (!state.quote) return state;
      return {
        ...state,
        quote: { 
          ...state.quote, 
          versions: [...state.quote.versions, { versionId: 'V1.1', status: QuoteVersionStatus.DRAFT, createdAt: new Date().toISOString(), isCurrent: true }],
          currentStatus: QuoteVersionStatus.REVISED
        },
        logs: log(state, '销售', '版本', '创建 V1.1')
      };
    case 'CONFIRM_QUOTE':
      if (!state.quote) return state;
      return {
        ...state,
        quote: { ...state.quote, currentStatus: QuoteVersionStatus.CONFIRMED },
        salesOrder: { id: 'SO-9000', quoteId: state.quote.id, quoteVersion: 'V1.1', status: SalesOrderStatus.DRAFT, procurementIds: [] },
        logs: log(state, '客户', '签字', '确认报价 -> 生成订单')
      };
    case 'SALES_ACTION':
      if (!state.salesOrder) return state;
      let newSStatus = state.salesOrder.status;
      let sLog = '';
      if (action.payload === 'CONFIRM') { newSStatus = SalesOrderStatus.CONFIRMED; sLog = '订单确认'; }
      if (action.payload === 'PROCURE') { newSStatus = SalesOrderStatus.PURCHASING; sLog = '采购录入'; }
      if (action.payload === 'SHIP') { newSStatus = SalesOrderStatus.SHIPPING; sLog = '物流发货'; }
      return { ...state, salesOrder: { ...state.salesOrder, status: newSStatus }, logs: log(state, '客服', '订单', sLog) };
    case 'CREATE_INSTALL':
      if (!state.salesOrder) return state;
      return {
        ...state,
        salesOrder: { ...state.salesOrder, status: SalesOrderStatus.INSTALLING },
        installation: { id: 'INS-500', salesOrderId: state.salesOrder.id, status: ServiceOrderStatus.PENDING },
        logs: log(state, '客服', '安装', '创建安装单 INS-500')
      };
    case 'INSTALL_ACTION':
      if (!state.installation) return state;
      let newIStatus = state.installation.status;
      let iLog = '';
      if (action.payload === 'ASSIGN') { newIStatus = ServiceOrderStatus.ASSIGNING; iLog = '派单安装'; }
      if (action.payload === 'ACCEPT') { newIStatus = ServiceOrderStatus.WAITING; iLog = '安装接单'; }
      if (action.payload === 'COMPLETE_SITE') { newIStatus = ServiceOrderStatus.CONFIRMING; iLog = '现场完成'; }
      if (action.payload === 'UPLOAD_PHOTOS') { iLog = '上传照片'; }
      if (action.payload === 'CONFIRM') { newIStatus = ServiceOrderStatus.COMPLETED; iLog = '安装验收'; }
      let updatedSales = state.salesOrder;
      if (newIStatus === ServiceOrderStatus.COMPLETED && state.salesOrder) {
        updatedSales = { ...state.salesOrder, status: SalesOrderStatus.RECONCILIATION };
        iLog += ' -> 待对账';
      }
      return { ...state, installation: { ...state.installation, status: newIStatus }, salesOrder: updatedSales, logs: log(state, '外勤', '进度', iLog) };
    case 'CREATE_RECON':
      if (!state.salesOrder) return state;
      return {
        ...state,
        reconciliation: { id: 'REC-2024', salesOrderId: state.salesOrder.id, status: ReconciliationStatus.PENDING },
        logs: log(state, '财务', '对账', '生成对账单')
      };
    case 'RECON_ACTION':
      if (!state.reconciliation) return state;
      let newRStatus = state.reconciliation.status;
      let rLog = '';
      if (action.payload === 'START') { newRStatus = ReconciliationStatus.RECONCILING; rLog = '开始核对'; }
      if (action.payload === 'DISCREPANCY') { newRStatus = ReconciliationStatus.DISCREPANCY; rLog = '发现差异'; }
      if (action.payload === 'ADJUST') { newRStatus = ReconciliationStatus.ADJUSTED; rLog = '调整差异'; }
      if (action.payload === 'COMPLETE') { newRStatus = ReconciliationStatus.COMPLETED; rLog = '对账完成'; }
      let finalSales = state.salesOrder;
      if (newRStatus === ReconciliationStatus.COMPLETED && state.salesOrder) {
        finalSales = { ...state.salesOrder, status: SalesOrderStatus.COMPLETED };
      }
      return { ...state, reconciliation: { ...state.reconciliation, status: newRStatus }, salesOrder: finalSales, logs: log(state, '财务', '对账', rLog) };
    case 'RESET':
      return { ...initialState, logs: log(initialState, '系统', '重置', '系统重置完成') };
    default:
      return state;
  }
}

// --- APP COMPONENT ---

const StartButton = () => (
  <button className="flex items-center px-2 py-1 rounded-r-lg space-x-2 xp-button-green h-full mr-4 shadow-md transition-all active:brightness-90">
    <div className="italic font-bold font-serif text-xl pr-1">Nexus</div>
    <span className="font-bold text-lg italic">Start</span>
  </button>
);

const TaskBarItem = ({ label, icon: Icon, active, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center w-40 px-2 py-1 mx-1 cursor-pointer select-none
      border rounded-[2px]
      ${active 
        ? 'bg-[#1D4EBF] border-[#103485] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]' 
        : 'bg-[#3C81F0] border-[#3C81F0] hover:bg-[#5293FA] shadow-[1px_1px_1px_rgba(255,255,255,0.2)]'}
    `}
  >
    <Icon size={16} className="text-white mr-2" />
    <span className="text-white text-xs truncate drop-shadow-md">{label}</span>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState<'simulate' | 'dashboard'>('simulate');
  const [state, dispatch] = useReducer(simulationReducer, initialState);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative selection:bg-[#000080] selection:text-white">
      
      {/* DESKTOP AREA */}
      <div className="flex-1 p-4 flex items-center justify-center relative z-10">
        
        {/* DESKTOP ICONS (Visual only) */}
        <div className="absolute top-4 left-4 flex flex-col gap-6">
           <div className="flex flex-col items-center gap-1 group cursor-pointer w-20">
              <Monitor size={32} className="text-white drop-shadow-md" strokeWidth={1.5} />
              <span className="text-white text-xs text-shadow px-1 group-hover:bg-[#0058EE] text-center">我的电脑</span>
           </div>
           <div className="flex flex-col items-center gap-1 group cursor-pointer w-20">
              <div className="w-8 h-8 bg-yellow-200 border border-yellow-400 rounded-sm shadow-md flex items-center justify-center">
                 <div className="w-6 h-1 bg-yellow-500/20 mb-1"></div>
              </div>
              <span className="text-white text-xs text-shadow px-1 group-hover:bg-[#0058EE] text-center">我的文档</span>
           </div>
        </div>

        {/* MAIN APPLICATION WINDOW */}
        <div className="w-full h-full max-w-6xl bg-[#ECE9D8] rounded-t-lg shadow-xp-window flex flex-col overflow-hidden border-[3px] border-[#245DDA]">
          
          {/* Title Bar */}
          <div className="h-8 xp-window-title flex items-center justify-between px-2 select-none">
            <div className="flex items-center gap-2 text-white font-bold text-sm drop-shadow-md">
              <Layout size={16} />
              <span>NexusFlow Enterprise Manager</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-5 h-5 bg-[#245DDA] border border-white/50 rounded-sm flex items-center justify-center hover:bg-[#4E85EB]">
                 <Minimize2 size={12} className="text-white" />
              </button>
              <button className="w-5 h-5 bg-[#245DDA] border border-white/50 rounded-sm flex items-center justify-center hover:bg-[#4E85EB]">
                 <Maximize2 size={12} className="text-white" />
              </button>
              <button className="w-5 h-5 bg-[#E62C2C] border border-white/50 rounded-sm flex items-center justify-center hover:bg-[#FF4D4D] shadow-sm">
                 <X size={14} className="text-white" />
              </button>
            </div>
          </div>

          {/* Menu Bar (Visual) */}
          <div className="h-6 bg-[#ECE9D8] border-b border-[#D4D0C8] flex items-center px-2 text-xs text-black select-none">
             <span className="px-2 py-1 hover:bg-[#0058EE] hover:text-white cursor-pointer">文件(F)</span>
             <span className="px-2 py-1 hover:bg-[#0058EE] hover:text-white cursor-pointer">编辑(E)</span>
             <span className="px-2 py-1 hover:bg-[#0058EE] hover:text-white cursor-pointer">视图(V)</span>
             <span className="px-2 py-1 hover:bg-[#0058EE] hover:text-white cursor-pointer">工具(T)</span>
             <span className="px-2 py-1 hover:bg-[#0058EE] hover:text-white cursor-pointer">帮助(H)</span>
          </div>

          {/* Address Bar (Visual) */}
          <div className="h-8 bg-[#ECE9D8] border-b border-[#D4D0C8] flex items-center px-2 gap-2 text-xs">
             <span className="text-gray-500">地址(D):</span>
             <div className="flex-1 bg-white border border-[#7F9DB9] h-5 flex items-center px-2">
               C:\Program Files\NexusFlow\{activeTab === 'simulate' ? 'Simulation.exe' : 'Dashboard.xls'}
             </div>
             <button className="px-2 py-0.5 border border-gray-400 bg-[#F0F0F0] text-black">转到</button>
          </div>

          {/* Window Body */}
          <div className="flex-1 flex overflow-hidden">
             
             {/* Left Sidebar (Common Tasks) */}
             <div className="w-48 bg-[#6375D6] p-3 overflow-y-auto hidden md:block" style={{ background: 'linear-gradient(to bottom, #7BA2E7 0%, #6375D6 100%)' }}>
               <SimulationController state={state} dispatch={dispatch} />
             </div>

             {/* Main Content (White Area) */}
             <div className="flex-1 bg-white p-4 overflow-hidden relative flex flex-col">
               
               {activeTab === 'simulate' ? (
                 <div className="h-full flex flex-col gap-4">
                    {/* Top Pipeline Map */}
                    <div className="flex-none h-[280px]">
                      <PipelineMap state={state} />
                    </div>

                    {/* Bottom Details & Logs (Split View) */}
                    <div className="flex-1 flex gap-4 min-h-0">
                       
                       {/* State Details Group */}
                       <div className="w-1/2 flex flex-col border border-[#D4D0C8] rounded-sm p-1">
                          <legend className="text-xs text-[#003399] px-1 font-bold -mt-3 bg-white w-fit">单据详情</legend>
                          <div className="flex-1 overflow-y-auto bg-white p-2 space-y-2">
                             {state.lead ? (
                               <div className="text-xs">
                                  <div className="font-bold border-b border-gray-200 mb-1">当前线索</div>
                                  <div>ID: {state.lead.id}</div>
                                  <div style={{ color: STATUS_COLORS[state.lead.status] }}>状态: {state.lead.status}</div>
                               </div>
                             ) : <div className="text-xs text-gray-400">暂无数据</div>}
                             
                             {state.quote && (
                               <div className="text-xs mt-2 pt-2 border-t border-gray-200">
                                  <div className="font-bold mb-1">报价单</div>
                                  <div>版本: {state.quote.versions.length} 个</div>
                                  <div className={STATUS_COLORS[state.quote.currentStatus]}>状态: {state.quote.currentStatus}</div>
                               </div>
                             )}

                             {state.salesOrder && (
                               <div className="text-xs mt-2 pt-2 border-t border-gray-200">
                                  <div className="font-bold mb-1">销售订单</div>
                                  <div>ID: {state.salesOrder.id}</div>
                                  <div className={STATUS_COLORS[state.salesOrder.status]}>状态: {state.salesOrder.status}</div>
                               </div>
                             )}
                          </div>
                       </div>

                       {/* Logs Group */}
                       <div className="w-1/2 flex flex-col border border-[#D4D0C8] rounded-sm p-1">
                          <legend className="text-xs text-[#003399] px-1 font-bold -mt-3 bg-white w-fit">系统日志 (Event Log)</legend>
                          <div className="flex-1 bg-white overflow-y-auto font-mono text-[10px] p-1 border border-gray-200 shadow-inner">
                             {state.logs.map((l, i) => (
                               <div key={i} className="mb-1 border-b border-dotted border-gray-100 pb-1">
                                  <span className="text-gray-500">[{l.timestamp}]</span>{' '}
                                  <span className="font-bold text-[#003399]">{l.actor}</span>:{' '}
                                  <span>{l.action}</span> - {l.detail}
                               </div>
                             ))}
                          </div>
                       </div>

                    </div>
                 </div>
               ) : (
                 <DashboardView />
               )}

             </div>
          </div>

          {/* Status Bar */}
          <div className="h-6 bg-[#ECE9D8] border-t border-[#D4D0C8] flex items-center px-2 text-xs gap-4 shadow-xp-inset">
             <div className="flex-1 truncate">Ready</div>
             <div className="w-px h-4 bg-[#A0A0A0]"></div>
             <div className="w-20">Num Lock</div>
             <div className="w-px h-4 bg-[#A0A0A0]"></div>
             <div className="w-32 truncate">{activeTab === 'simulate' ? 'Simulation Mode' : 'Reporting Mode'}</div>
          </div>
        </div>

      </div>

      {/* TASKBAR */}
      <div className="h-8 bg-[#245DDA] border-t-2 border-[#3F80E8] flex items-center justify-between px-0 relative z-50 shadow-md">
        
        {/* Start Button & Quick Launch */}
        <div className="flex items-center h-full pl-0">
          <StartButton />
          
          <div className="flex gap-2 px-2 border-r border-[#153E96] h-full items-center mr-2">
             {/* Quick Launch Icons */}
             <div className="w-4 h-4 bg-white rounded-sm opacity-80 hover:opacity-100 cursor-pointer"></div>
             <div className="w-4 h-4 bg-blue-200 rounded-sm opacity-80 hover:opacity-100 cursor-pointer"></div>
          </div>

          {/* Running Tasks */}
          <div className="flex items-center">
            <TaskBarItem 
              label="业务流程模拟器" 
              icon={Layout} 
              active={activeTab === 'simulate'} 
              onClick={() => setActiveTab('simulate')}
            />
            <TaskBarItem 
              label="企业数据看板.xls" 
              icon={Monitor} 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            />
          </div>
        </div>

        {/* System Tray */}
        <div className="h-full bg-[#1594E6] border-l border-[#103485] px-3 flex items-center gap-2 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.2)]">
           <div className="w-4 h-4 bg-white rounded-full text-[8px] flex items-center justify-center text-[#245DDA] font-bold border border-[#103485]">
             N
           </div>
           <span className="text-white text-xs font-sans drop-shadow-sm">{currentTime}</span>
        </div>
      </div>

    </div>
  );
};

export default App;