import React, { useReducer, useState } from 'react';
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
import { LayoutDashboard, Activity, Terminal, GitMerge, FileText, CheckSquare, PenTool } from 'lucide-react';

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
  switch (action.type) {
    case 'CREATE_LEAD':
      return {
        ...state,
        lead: { id: 'LD-2024-001', customerName: '张三 (拟定)', status: LeadStatus.NEW, tags: [], history: [] },
        logs: log(state, '销售顾问', '新建线索', '录入新客户张三，编号 LD-2024-001')
      };
    case 'ASSIGN_LEAD':
      if (!state.lead) return state;
      return { ...state, lead: { ...state.lead, status: LeadStatus.ASSIGNED }, logs: log(state, '店长', '分配', '分配给王牌销售') };
    case 'START_FOLLOWING':
      if (!state.lead) return state;
      return { ...state, lead: { ...state.lead, status: LeadStatus.FOLLOWING }, logs: log(state, '销售顾问', '跟进', '开始电话联系客户') };
    case 'TAG_LEAD':
      if (!state.lead) return state;
      return { ...state, lead: { ...state.lead, tags: [...state.lead.tags, action.payload] }, logs: log(state, '销售顾问', '打标签', `添加标签: ${action.payload}`) };
    case 'CONVERT_LEAD':
      if (!state.lead) return state;
      return { 
        ...state, 
        lead: { ...state.lead, status: LeadStatus.CONVERTED },
        quote: { id: 'QT-888', leadId: state.lead.id, versions: [{ versionId: 'V1.0', status: QuoteVersionStatus.DRAFT, createdAt: new Date().toISOString(), isCurrent: true }], currentStatus: QuoteVersionStatus.DRAFT },
        logs: log(state, '系统', '转化', '线索转化成功。生成报价单 QT-888 (V1.0 草稿)')
      };
    case 'CLOSE_LEAD':
      if (!state.lead) return state;
      return { ...state, lead: { ...state.lead, status: LeadStatus.INVALID }, logs: log(state, '销售顾问', '关闭', '线索标记为无效') };
    
    // Quote Actions
    case 'PUBLISH_QUOTE':
      if (!state.quote) return state;
      return { ...state, quote: { ...state.quote, currentStatus: QuoteVersionStatus.PRELIMINARY }, logs: log(state, '销售顾问', '发布', '报价单 V1.0 设为初稿') };
    case 'CREATE_MEASUREMENT':
      if (!state.quote) return state;
      return { 
        ...state, 
        measurement: { id: 'MS-101', quoteVersionId: 'V1.0', status: ServiceOrderStatus.PENDING },
        quote: { ...state.quote, currentStatus: QuoteVersionStatus.MEASURING }, // Sync
        logs: log(state, '系统', '测量需求', '创建测量任务 MS-101。报价单状态同步为"测量中"')
      };
    
    // Measurement Actions
    case 'MEASURE_ACTION':
      if (!state.measurement) return state;
      let newMStatus = state.measurement.status;
      let logMsg = '';
      if (action.payload === 'ASSIGN') { newMStatus = ServiceOrderStatus.ASSIGNING; logMsg = '已指派测量师'; }
      if (action.payload === 'ACCEPT') { newMStatus = ServiceOrderStatus.WAITING; logMsg = '测量师已接单'; }
      if (action.payload === 'COMPLETE_SITE') { newMStatus = ServiceOrderStatus.CONFIRMING; logMsg = '上门测量完成，等待确认'; }
      if (action.payload === 'REJECT') { newMStatus = ServiceOrderStatus.ASSIGNING; logMsg = '测量结果被驳回，重新指派'; }
      if (action.payload === 'CONFIRM') { newMStatus = ServiceOrderStatus.COMPLETED; logMsg = '测量数据确认无误。'; }

      // Sync Quote if Measurement Completed
      let updatedQuote = state.quote;
      if (newMStatus === ServiceOrderStatus.COMPLETED && state.quote) {
          updatedQuote = { ...state.quote, currentStatus: QuoteVersionStatus.REVISED }; // Logic: Measurement Done -> Quote needs Revision
          logMsg += ' 报价单同步为"需修改(再稿)"。';
      }

      return { 
        ...state, 
        measurement: { ...state.measurement, status: newMStatus },
        quote: updatedQuote,
        logs: log(state, '测量师', '更新进度', logMsg)
      };

    case 'NEW_VERSION':
      if (!state.quote) return state;
      return {
        ...state,
        quote: { 
          ...state.quote, 
          versions: [...state.quote.versions, { versionId: 'V1.1', status: QuoteVersionStatus.DRAFT, createdAt: new Date().toISOString(), isCurrent: true }],
          currentStatus: QuoteVersionStatus.REVISED // Stays revised until confirmed
        },
        logs: log(state, '销售顾问', '版本迭代', '基于测量数据创建 V1.1 版本')
      };

    case 'CONFIRM_QUOTE':
      if (!state.quote) return state;
      return {
        ...state,
        quote: { ...state.quote, currentStatus: QuoteVersionStatus.CONFIRMED },
        salesOrder: { id: 'SO-9000', quoteId: state.quote.id, quoteVersion: 'V1.1', status: SalesOrderStatus.DRAFT, procurementIds: [] },
        logs: log(state, '客户', '签字确认', '报价 V1.1 已确认。生成销售订单 SO-9000 (草稿)')
      };

    // Sales Actions
    case 'SALES_ACTION':
      if (!state.salesOrder) return state;
      let newSStatus = state.salesOrder.status;
      let sLog = '';
      if (action.payload === 'CONFIRM') { newSStatus = SalesOrderStatus.CONFIRMED; sLog = '销售订单已确认'; }
      if (action.payload === 'PROCURE') { newSStatus = SalesOrderStatus.PURCHASING; sLog = '采购信息已录入'; }
      if (action.payload === 'SHIP') { newSStatus = SalesOrderStatus.SHIPPING; sLog = '物流发货信息已添加'; }

      return {
        ...state,
        salesOrder: { ...state.salesOrder, status: newSStatus },
        logs: log(state, '订单客服', '订单更新', sLog)
      };

    case 'CREATE_INSTALL':
      if (!state.salesOrder) return state;
      return {
        ...state,
        salesOrder: { ...state.salesOrder, status: SalesOrderStatus.INSTALLING },
        installation: { id: 'INS-500', salesOrderId: state.salesOrder.id, status: ServiceOrderStatus.PENDING },
        logs: log(state, '客服', '安装需求', '创建安装任务 INS-500。订单同步为"安装中"')
      };

    // Install Actions
    case 'INSTALL_ACTION':
      if (!state.installation) return state;
      let newIStatus = state.installation.status;
      let iLog = '';
      if (action.payload === 'ASSIGN') { newIStatus = ServiceOrderStatus.ASSIGNING; iLog = '已指派安装师傅'; }
      if (action.payload === 'ACCEPT') { newIStatus = ServiceOrderStatus.WAITING; iLog = '师傅已接单'; }
      if (action.payload === 'COMPLETE_SITE') { newIStatus = ServiceOrderStatus.CONFIRMING; iLog = '安装完成，等待验收'; }
      if (action.payload === 'UPLOAD_PHOTOS') { iLog = '上传现场照片'; } // Just log
      if (action.payload === 'CONFIRM') { newIStatus = ServiceOrderStatus.COMPLETED; iLog = '安装验收通过。'; }

      // Sync Sales Order
      let updatedSales = state.salesOrder;
      if (newIStatus === ServiceOrderStatus.COMPLETED && state.salesOrder) {
        updatedSales = { ...state.salesOrder, status: SalesOrderStatus.RECONCILIATION }; // Move to Recon ready
        iLog += ' 订单同步为"待对账"。';
      }

      return {
        ...state,
        installation: { ...state.installation, status: newIStatus },
        salesOrder: updatedSales,
        logs: log(state, '安装师', '更新进度', iLog)
      };

    case 'CREATE_RECON':
      if (!state.salesOrder) return state;
      return {
        ...state,
        reconciliation: { id: 'REC-2024-NOV', salesOrderId: state.salesOrder.id, status: ReconciliationStatus.PENDING },
        logs: log(state, '财务', '对账初始化', '生成对账结算单。')
      };

    case 'RECON_ACTION':
      if (!state.reconciliation) return state;
      let newRStatus = state.reconciliation.status;
      let rLog = '';
      if (action.payload === 'START') { newRStatus = ReconciliationStatus.RECONCILING; rLog = '开始核对账目'; }
      if (action.payload === 'DISCREPANCY') { newRStatus = ReconciliationStatus.DISCREPANCY; rLog = '发现账目差异，需复核'; }
      if (action.payload === 'ADJUST') { newRStatus = ReconciliationStatus.ADJUSTED; rLog = '差异金额已调整'; }
      if (action.payload === 'COMPLETE') { newRStatus = ReconciliationStatus.COMPLETED; rLog = '对账完成，订单关闭。'; }

      // Final Closure
      let finalSales = state.salesOrder;
      if (newRStatus === ReconciliationStatus.COMPLETED && state.salesOrder) {
        finalSales = { ...state.salesOrder, status: SalesOrderStatus.COMPLETED };
      }

      return {
        ...state,
        reconciliation: { ...state.reconciliation, status: newRStatus },
        salesOrder: finalSales,
        logs: log(state, '财务', '对账更新', rLog)
      };

    case 'RESET':
      return { ...initialState, logs: log(initialState, '系统', '重置', '草稿本已翻页（重置）') };
    
    default:
      return state;
  }
}

// --- APP COMPONENT ---

const App = () => {
  const [activeTab, setActiveTab] = useState<'simulate' | 'dashboard'>('simulate');
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  return (
    <div className="flex h-screen bg-paper text-pencil-dark font-sans selection:bg-gray-300 selection:text-black">
      
      {/* SIDEBAR - 模拟笔记本侧边的索引标签 */}
      <aside className="w-16 lg:w-64 flex-shrink-0 border-r-2 border-pencil-dark bg-paper-dark/50 flex flex-col items-center lg:items-stretch relative z-20">
        {/* Logo区域 */}
        <div className="h-20 flex items-center justify-center border-b-2 border-dashed border-gray-400 p-4">
          <div className="w-10 h-10 border-2 border-pencil-dark rounded-full flex items-center justify-center text-pencil-dark font-bold font-display text-2xl bg-white shadow-sm transform -rotate-3">
            N
          </div>
          <div className="hidden lg:block ml-3">
             <div className="font-display font-bold text-2xl text-pencil-dark tracking-widest">Nexus<span className="text-ink-blue">Flow</span></div>
             <div className="text-[10px] font-hand text-gray-500 -mt-1 tracking-widest">业务草稿本</div>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 py-6 space-y-4 px-3 font-hand text-lg">
          <button 
            onClick={() => setActiveTab('simulate')}
            className={`w-full flex items-center p-3 rounded-sm border-2 transition-all transform hover:-translate-y-1 hover:shadow-md ${activeTab === 'simulate' ? 'bg-white border-pencil-dark shadow-[2px_2px_0px_#374151]' : 'border-transparent hover:border-gray-300 text-gray-500'}`}
          >
            <GitMerge size={20} />
            <span className="hidden lg:block ml-3">流程模拟</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center p-3 rounded-sm border-2 transition-all transform hover:-translate-y-1 hover:shadow-md ${activeTab === 'dashboard' ? 'bg-white border-pencil-dark shadow-[2px_2px_0px_#374151]' : 'border-transparent hover:border-gray-300 text-gray-500'}`}
          >
            <LayoutDashboard size={20} />
            <span className="hidden lg:block ml-3">数据看板</span>
          </button>
        </nav>

        {/* 底部信息 */}
        <div className="p-4 border-t-2 border-dashed border-gray-400 hidden lg:block bg-paper">
          <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2 font-display">系统状态</div>
          <div className="flex items-center gap-2 text-xs text-pencil-dark font-hand">
            <div className="w-3 h-3 border border-pencil-dark rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-1 h-1 bg-pencil-dark rounded-full animate-ping"></div>
            </div>
            运行正常
          </div>
          <div className="mt-2 text-[10px] text-gray-400 font-mono">v2.2.0 (Sketch Ed.)</div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header - 模拟笔记本顶部 */}
        <header className="h-16 border-b-2 border-pencil-dark bg-white/80 backdrop-blur flex items-center justify-between px-6 z-10 shadow-sm">
          <h1 className="text-xl font-display text-pencil-dark">
            {activeTab === 'simulate' ? '📝 业务流程交互模拟' : '📊 业务数据报表'}
          </h1>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-white border border-pencil-dark rounded-full text-xs text-gray-500 font-mono transform rotate-1 shadow-sm">
                环境: 生产 (PROD)
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          
          <div className="relative z-10 h-full overflow-y-auto p-6 scrollbar-hide">
            
            {activeTab === 'dashboard' ? (
              <DashboardView />
            ) : (
              <div className="flex flex-col h-full gap-6">
                
                {/* Top: Visualization Map */}
                <div className="flex-none h-[320px]">
                   <PipelineMap state={state} />
                </div>

                {/* Bottom: Split View (Controller + Logs) */}
                <div className="flex-1 min-h-[400px] flex flex-col lg:flex-row gap-6 pb-20">
                  
                  {/* Left: Controls */}
                  <div className="w-full lg:w-1/3 flex flex-col">
                    <h2 className="text-pencil-dark font-display text-xl mb-4 flex items-center gap-2 border-b-2 border-dashed border-gray-300 pb-2">
                       <PenTool size={20} /> 操作控制台
                    </h2>
                    <div className="flex-1 sketch-box p-4 bg-white/50 overflow-hidden flex flex-col">
                       <SimulationController state={state} dispatch={dispatch} />
                    </div>
                  </div>

                  {/* Center: State Details */}
                  <div className="w-full lg:w-1/3 flex flex-col">
                     <h2 className="text-ink-blue font-display text-xl mb-4 flex items-center gap-2 border-b-2 border-dashed border-gray-300 pb-2">
                       <FileText size={20} /> 单据状态卡
                    </h2>
                    <div className="flex-1 sketch-box p-4 bg-white font-hand text-sm overflow-y-auto custom-scrollbar relative">
                       {/* 装饰：右上角折角 */}
                       <div className="absolute top-0 right-0 border-t-[20px] border-r-[20px] border-t-white border-r-gray-200 shadow-sm"></div>

                       <div className="space-y-4 pt-2">
                          {state.lead && (
                            <div className="p-3 border border-pencil-dark bg-gray-50 relative">
                              <div className="text-gray-400 text-xs mb-1 font-sans">线索 LEAD</div>
                              <div className={`font-bold text-lg ${STATUS_COLORS[state.lead.status].split(' ')[0]}`}>
                                {state.lead.status === 'new' ? '新线索' : 
                                 state.lead.status === 'assigned' ? '已分配' :
                                 state.lead.status === 'following' ? '跟进中' :
                                 state.lead.status === 'converted' ? '已转化' : '无效'}
                              </div>
                              <div className="text-gray-500 mt-1 border-t border-dashed border-gray-300 pt-1">
                                标签: {state.lead.tags.join(', ') || '(无)'}
                              </div>
                            </div>
                          )}
                          {state.quote && (
                            <div className="p-3 border border-pencil-dark bg-gray-50">
                              <div className="text-gray-400 text-xs mb-1 font-sans">报价 QUOTE</div>
                              <div className={`font-bold text-lg ${STATUS_COLORS[state.quote.currentStatus].split(' ')[0]}`}>
                                {state.quote.currentStatus.toUpperCase()}
                              </div>
                              <div className="text-gray-500 mt-1 text-xs">版本数: {state.quote.versions.length}</div>
                            </div>
                          )}
                          {state.measurement && (
                            <div className="p-3 border border-pencil-dark bg-gray-50">
                              <div className="text-gray-400 text-xs mb-1 font-sans">测量任务 MEASURE</div>
                              <div className={`font-bold text-lg ${STATUS_COLORS[state.measurement.status].split(' ')[0]}`}>
                                {state.measurement.status.toUpperCase()}
                              </div>
                            </div>
                          )}
                          {state.salesOrder && (
                            <div className="p-3 border border-pencil-dark bg-gray-50">
                              <div className="text-gray-400 text-xs mb-1 font-sans">销售订单 ORDER</div>
                              <div className={`font-bold text-lg ${STATUS_COLORS[state.salesOrder.status].split(' ')[0]}`}>
                                {state.salesOrder.status.toUpperCase()}
                              </div>
                            </div>
                          )}
                          {state.installation && (
                            <div className="p-3 border border-pencil-dark bg-gray-50">
                              <div className="text-gray-400 text-xs mb-1 font-sans">安装任务 INSTALL</div>
                              <div className={`font-bold text-lg ${STATUS_COLORS[state.installation.status].split(' ')[0]}`}>
                                {state.installation.status.toUpperCase()}
                              </div>
                            </div>
                          )}
                       </div>
                       {!state.lead && <div className="text-gray-400 text-center mt-10 transform -rotate-2">
                         ( 空白页 ) <br/> 请先录入线索...
                       </div>}
                    </div>
                  </div>

                  {/* Right: Logs */}
                  <div className="w-full lg:w-1/3 flex flex-col">
                    <h2 className="text-pencil-dark font-display text-xl mb-4 flex items-center gap-2 border-b-2 border-dashed border-gray-300 pb-2">
                       <Activity size={20} /> 系统日志
                    </h2>
                    <div className="flex-1 sketch-box p-0 bg-[#fffdf5] overflow-hidden flex flex-col border-l-4 border-l-red-200">
                       <div className="flex-1 overflow-y-auto p-4 space-y-3 font-hand text-sm custom-scrollbar">
                          {state.logs.map((log, idx) => (
                            <div key={idx} className="flex gap-2 border-b border-blue-100 pb-2 last:border-0 items-start">
                               <span className="text-gray-400 shrink-0 text-xs font-sans mt-1">{log.timestamp}</span>
                               <span className="text-pencil-dark shrink-0 w-16 text-right font-bold bg-gray-100 px-1 rounded-sm text-xs mt-0.5 border border-gray-200">{log.actor}</span>
                               <div className="flex-1 text-gray-700 leading-snug">
                                  <span className="text-ink-blue mr-1">[{log.action}]</span>
                                  {log.detail}
                                </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;