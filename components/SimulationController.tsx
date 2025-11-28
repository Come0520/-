import React, { useState } from 'react';
import { 
  SimulationState, 
  LeadStatus, 
  QuoteVersionStatus, 
  ServiceOrderStatus, 
  SalesOrderStatus, 
  ReconciliationStatus
} from '../types';
import { ChevronUp, ChevronDown, User, FileText, Settings, CreditCard, PenTool } from 'lucide-react';

interface Props {
  state: SimulationState;
  dispatch: (action: any) => void;
}

// XP Style Collapsible Panel
const XPPanel = ({ title, icon: Icon, children, defaultOpen = true, active = true }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`mb-3 overflow-hidden rounded-t-[3px] shadow-sm ${active ? 'opacity-100' : 'opacity-60 grayscale'}`}>
      {/* Header */}
      <div 
        className="xp-sidebar-header-blue h-6 px-3 flex items-center justify-between cursor-pointer border-[1px] border-[#fff] border-b-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-white" />}
          <span className="text-white font-bold text-xs tracking-wide">{title}</span>
        </div>
        <div className="bg-white rounded-full p-[1px] border border-[#245DDA]">
          {isOpen ? <ChevronUp size={10} color="#245DDA"/> : <ChevronDown size={10} color="#245DDA"/>}
        </div>
      </div>
      
      {/* Body */}
      {isOpen && (
        <div className="bg-[#D6DFF7] p-3 border border-t-0 border-white">
          <div className="space-y-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// XP Style Link Button
const XPTaskButton = ({ onClick, label, variant = 'normal', disabled = false, icon = null }: any) => {
  if (disabled) return null; // XP hides unavailable tasks usually

  // Variants map to different "icon" colors or styles if needed
  // For XP sidebar tasks, they are usually just links with icons
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left flex items-start group transition-all"
    >
      <div className="mr-2 mt-0.5">
         {/* Simulate the little icon next to tasks */}
         <div className={`w-4 h-4 rounded shadow-sm flex items-center justify-center border border-gray-400 ${
           variant === 'success' ? 'bg-green-100' : 
           variant === 'danger' ? 'bg-red-100' : 'bg-white'
         }`}>
           {icon ? icon : <div className="w-2 h-2 bg-[#245DDA] rounded-full"></div>}
         </div>
      </div>
      <span className={`text-[11px] text-[#215DC6] group-hover:underline group-hover:text-[#428EFF] leading-tight ${variant === 'success' ? 'font-bold' : ''}`}>
        {label}
      </span>
    </button>
  );
};

export const SimulationController: React.FC<Props> = ({ state, dispatch }) => {
  // Logic Helpers
  const hasLead = !!state.lead;
  const leadActive = hasLead && state.lead?.status !== LeadStatus.CONVERTED && state.lead?.status !== LeadStatus.INVALID;
  const hasQuote = !!state.quote;
  const quoteActive = hasQuote && state.quote?.currentStatus !== QuoteVersionStatus.CONFIRMED && state.quote?.currentStatus !== QuoteVersionStatus.CANCELLED;
  const hasMeasurement = !!state.measurement;
  const hasSales = !!state.salesOrder;
  const salesActive = hasSales && state.salesOrder?.status !== SalesOrderStatus.COMPLETED;
  const hasInstall = !!state.installation;
  const hasReconcile = !!state.reconciliation;

  return (
    <div className="h-full overflow-y-auto pr-1">
      
      {/* 1. 线索任务 */}
      <XPPanel title="线索任务" icon={User} active={!hasLead || leadActive}>
        {!hasLead ? (
          <XPTaskButton label="录入新线索" onClick={() => dispatch({ type: 'CREATE_LEAD' })} />
        ) : (
          <>
            {state.lead?.status === LeadStatus.NEW && (
              <XPTaskButton label="分配销售顾问" onClick={() => dispatch({ type: 'ASSIGN_LEAD' })} />
            )}
            {state.lead?.status === LeadStatus.ASSIGNED && (
              <XPTaskButton label="开始跟进客户" onClick={() => dispatch({ type: 'START_FOLLOWING' })} />
            )}
            {state.lead?.status === LeadStatus.FOLLOWING && (
              <>
                <XPTaskButton label="标记: 已报价" onClick={() => dispatch({ type: 'TAG_LEAD', payload: '已报价' })} />
                <XPTaskButton label="转化成功 (生成报价单)" variant="success" onClick={() => dispatch({ type: 'CONVERT_LEAD' })} />
                <XPTaskButton label="关闭无效线索" variant="danger" onClick={() => dispatch({ type: 'CLOSE_LEAD' })} />
              </>
            )}
          </>
        )}
      </XPPanel>

      {/* 2. 报价任务 */}
      <XPPanel title="报价管理" icon={FileText} active={quoteActive}>
        {hasQuote && !hasSales ? (
          <>
            {state.quote?.currentStatus === QuoteVersionStatus.DRAFT && (
               <XPTaskButton label="发布为初稿" onClick={() => dispatch({ type: 'PUBLISH_QUOTE' })} />
            )}
            {state.quote?.currentStatus === QuoteVersionStatus.PRELIMINARY && !hasMeasurement && (
               <XPTaskButton label="请求上门测量" onClick={() => dispatch({ type: 'CREATE_MEASUREMENT' })} />
            )}
            {state.quote?.currentStatus === QuoteVersionStatus.MEASURING && (
               <div className="text-[10px] text-gray-500 italic ml-6">等待测量结果...</div>
            )}
            {state.quote?.currentStatus === QuoteVersionStatus.REVISED && (
               <>
                 <XPTaskButton label="客户确认签字" variant="success" onClick={() => dispatch({ type: 'CONFIRM_QUOTE' })} />
                 <XPTaskButton label="创建新版本 (V1.2)" onClick={() => dispatch({ type: 'NEW_VERSION' })} />
               </>
            )}
          </>
        ) : (
           <div className="text-[10px] text-gray-500 italic ml-6">无可用任务</div>
        )}
      </XPPanel>

      {/* 2a. 测量 */}
      {hasMeasurement && state.measurement?.status !== ServiceOrderStatus.COMPLETED && (
        <XPPanel title="测量详情" icon={Settings} active={true}>
          {state.measurement?.status === ServiceOrderStatus.PENDING && (
             <XPTaskButton label="指派测量师" onClick={() => dispatch({ type: 'MEASURE_ACTION', payload: 'ASSIGN' })} />
          )}
          {state.measurement?.status === ServiceOrderStatus.ASSIGNING && (
             <XPTaskButton label="测量师接单" onClick={() => dispatch({ type: 'MEASURE_ACTION', payload: 'ACCEPT' })} />
          )}
          {state.measurement?.status === ServiceOrderStatus.WAITING && (
             <XPTaskButton label="完成上门测量" onClick={() => dispatch({ type: 'MEASURE_ACTION', payload: 'COMPLETE_SITE' })} />
          )}
          {state.measurement?.status === ServiceOrderStatus.CONFIRMING && (
             <>
               <XPTaskButton label="确认测量结果" variant="success" onClick={() => dispatch({ type: 'MEASURE_ACTION', payload: 'CONFIRM' })} />
               <XPTaskButton label="驳回重测" variant="danger" onClick={() => dispatch({ type: 'MEASURE_ACTION', payload: 'REJECT' })} />
             </>
          )}
        </XPPanel>
      )}

      {/* 3. 订单任务 */}
      <XPPanel title="订单与安装" icon={Settings} active={salesActive}>
         {hasSales ? (
           <>
            {state.salesOrder?.status === SalesOrderStatus.DRAFT && (
               <XPTaskButton label="确认生成正式订单" onClick={() => dispatch({ type: 'SALES_ACTION', payload: 'CONFIRM' })} />
            )}
            {state.salesOrder?.status === SalesOrderStatus.CONFIRMED && (
               <XPTaskButton label="录入采购信息" onClick={() => dispatch({ type: 'SALES_ACTION', payload: 'PROCURE' })} />
            )}
            {state.salesOrder?.status === SalesOrderStatus.PURCHASING && (
               <XPTaskButton label="添加物流发货信息" onClick={() => dispatch({ type: 'SALES_ACTION', payload: 'SHIP' })} />
            )}
            {state.salesOrder?.status === SalesOrderStatus.SHIPPING && !hasInstall && (
               <XPTaskButton label="安排上门安装" variant="success" onClick={() => dispatch({ type: 'CREATE_INSTALL' })} />
            )}
            
            {/* Install Actions embedded */}
            {hasInstall && state.installation?.status !== ServiceOrderStatus.COMPLETED && (
              <div className="ml-2 pl-2 border-l border-white/50 my-2">
                 <div className="text-[10px] text-[#245DDA] font-bold mb-1">安装进度:</div>
                 {state.installation?.status === ServiceOrderStatus.PENDING && (
                    <XPTaskButton label="指派安装师傅" onClick={() => dispatch({ type: 'INSTALL_ACTION', payload: 'ASSIGN' })} />
                 )}
                 {state.installation?.status === ServiceOrderStatus.ASSIGNING && (
                    <XPTaskButton label="师傅接单" onClick={() => dispatch({ type: 'INSTALL_ACTION', payload: 'ACCEPT' })} />
                 )}
                 {state.installation?.status === ServiceOrderStatus.WAITING && (
                    <XPTaskButton label="完成上门安装" onClick={() => dispatch({ type: 'INSTALL_ACTION', payload: 'COMPLETE_SITE' })} />
                 )}
                 {state.installation?.status === ServiceOrderStatus.CONFIRMING && (
                    <>
                      <XPTaskButton label="上传现场照片" onClick={() => dispatch({ type: 'INSTALL_ACTION', payload: 'UPLOAD_PHOTOS' })} />
                      <XPTaskButton label="确认安装验收" variant="success" onClick={() => dispatch({ type: 'INSTALL_ACTION', payload: 'CONFIRM' })} />
                    </>
                 )}
              </div>
            )}
            
            {state.salesOrder?.status === SalesOrderStatus.RECONCILIATION && !hasReconcile && (
               <XPTaskButton label="转入财务对账" onClick={() => dispatch({ type: 'CREATE_RECON' })} />
            )}
           </>
         ) : (
           <div className="text-[10px] text-gray-500 italic ml-6">无可用任务</div>
         )}
      </XPPanel>

      {/* 4. 财务 */}
      {hasReconcile && (
        <XPPanel title="财务中心" icon={CreditCard} active={true}>
           {state.reconciliation?.status === ReconciliationStatus.PENDING && (
             <XPTaskButton label="开始对账流程" onClick={() => dispatch({ type: 'RECON_ACTION', payload: 'START' })} />
           )}
           {state.reconciliation?.status === ReconciliationStatus.RECONCILING && (
             <>
                <XPTaskButton label="报告账目差异" variant="danger" onClick={() => dispatch({ type: 'RECON_ACTION', payload: 'DISCREPANCY' })} />
                <XPTaskButton label="核对无误 (结单)" variant="success" onClick={() => dispatch({ type: 'RECON_ACTION', payload: 'COMPLETE' })} />
             </>
           )}
           {state.reconciliation?.status === ReconciliationStatus.DISCREPANCY && (
             <XPTaskButton label="调整并重试" onClick={() => dispatch({ type: 'RECON_ACTION', payload: 'ADJUST' })} />
           )}
           {state.reconciliation?.status === ReconciliationStatus.ADJUSTED && (
             <XPTaskButton label="重新对账" onClick={() => dispatch({ type: 'RECON_ACTION', payload: 'START' })} />
           )}
           {state.reconciliation?.status === ReconciliationStatus.COMPLETED && (
             <div className="text-xs text-green-700 font-bold ml-6">业务已完结</div>
           )}
        </XPPanel>
      )}

      {/* 其它 */}
      <XPPanel title="其它位置" icon={Settings} active={true} defaultOpen={false}>
         <XPTaskButton label="重置系统状态" variant="danger" onClick={() => dispatch({type: 'RESET'})} />
         <XPTaskButton label="控制面板" disabled={true} />
         <XPTaskButton label="网络连接" disabled={true} />
      </XPPanel>

    </div>
  );
};