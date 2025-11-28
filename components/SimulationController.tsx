import React from 'react';
import { 
  SimulationState, 
  LeadStatus, 
  QuoteVersionStatus, 
  ServiceOrderStatus, 
  SalesOrderStatus, 
  ReconciliationStatus
} from '../types';
import { User, ClipboardList, PenTool, Truck, DollarSign, CheckCircle, XCircle, RotateCw, PenLine } from 'lucide-react';

interface Props {
  state: SimulationState;
  dispatch: (action: any) => void;
}

export const SimulationController: React.FC<Props> = ({ state, dispatch }) => {

  const Section = ({ title, icon: Icon, children, active }: any) => (
    <div className={`p-4 mb-6 transition-all duration-300 relative ${active ? 'opacity-100' : 'opacity-50 grayscale'}`}>
      {/* 类似便利贴或方框的标题背景 */}
      <div className="absolute -top-3 left-2 bg-white px-2 border-2 border-pencil-dark transform -rotate-1 z-10">
        <div className="flex items-center gap-2 text-pencil-dark font-display text-lg">
          <Icon size={18} strokeWidth={2.5} />
          <span>{title}</span>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className={`pt-6 pb-4 px-4 border-2 border-pencil-dark ${active ? 'bg-white' : 'bg-transparent border-dashed'}`}>
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </div>
  );

  const ActionButton = ({ onClick, label, variant = 'primary', disabled = false }: any) => {
    // 手绘风格按钮：使用边框和特殊的hover效果
    let variantClass = "";
    
    switch(variant) {
      case 'primary': // 铅笔黑
        variantClass = "border-pencil-dark text-pencil-dark hover:bg-pencil-dark hover:text-white";
        break;
      case 'success': // 绿色/深黑
        variantClass = "border-pencil-dark text-pencil-dark hover:border-double font-bold bg-green-50/50 hover:bg-green-100";
        break;
      case 'warning': // 橙色/墨水蓝
        variantClass = "border-ink-blue text-ink-blue hover:bg-blue-50";
        break;
      case 'danger': // 红色
        variantClass = "border-ink-red text-ink-red hover:bg-red-50";
        break;
    }

    if (disabled) variantClass = "border-gray-300 text-gray-300 cursor-not-allowed border-dashed";

    return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`w-full py-2 px-3 text-sm font-hand tracking-widest transition-all duration-200 border-2 rounded-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 ${variantClass}`}
        style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }} // 手绘不规则圆角
      >
        {label}
        {!disabled && <PenLine size={14} className="opacity-50" />}
      </button>
    );
  };

  // 逻辑辅助
  const hasLead = !!state.lead;
  const leadActive = hasLead && state.lead?.status !== LeadStatus.CONVERTED && state.lead?.status !== LeadStatus.INVALID;
  
  const hasQuote = !!state.quote;
  const quoteActive = hasQuote && state.quote?.currentStatus !== QuoteVersionStatus.CONFIRMED && state.quote?.currentStatus !== QuoteVersionStatus.CANCELLED;
  
  const hasMeasurement = !!state.measurement;
  const measureActive = hasMeasurement && state.measurement?.status !== ServiceOrderStatus.COMPLETED && state.measurement?.status !== ServiceOrderStatus.CANCELLED;
  
  const hasSales = !!state.salesOrder;
  const salesActive = hasSales && state.salesOrder?.status !== SalesOrderStatus.COMPLETED && state.salesOrder?.status !== SalesOrderStatus.CANCELLED;

  const hasInstall = !!state.installation;
  const installActive = hasInstall && state.installation?.status !== ServiceOrderStatus.COMPLETED && state.installation?.status !== ServiceOrderStatus.CANCELLED;

  const hasReconcile = !!state.reconciliation;
  const reconActive = hasReconcile && state.reconciliation?.status !== ReconciliationStatus.COMPLETED && state.reconciliation?.status !== ReconciliationStatus.CANCELLED;

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      
      {/* 线索阶段 */}
      <Section title="1. 线索管理" icon={User} active={!hasLead || leadActive}>
        {!hasLead ? (
          <ActionButton 
            label="✍️ 录入新线索" 
            onClick={() => dispatch({ type: 'CREATE_LEAD' })} 
          />
        ) : (
          <>
            {state.lead?.status === LeadStatus.NEW && (
              <ActionButton 
                label="分配销售顾问" 
                onClick={() => dispatch({ type: 'ASSIGN_LEAD' })} 
              />
            )}
            {state.lead?.status === LeadStatus.ASSIGNED && (
              <ActionButton 
                label="开始跟进客户" 
                onClick={() => dispatch({ type: 'START_FOLLOWING' })} 
              />
            )}
            {state.lead?.status === LeadStatus.FOLLOWING && (
              <div className="grid grid-cols-2 gap-3">
                 <ActionButton 
                  label="标记：已报价" 
                  variant="warning"
                  onClick={() => dispatch({ type: 'TAG_LEAD', payload: '已报价' })} 
                />
                <ActionButton 
                  label="转化成功" 
                  variant="success"
                  onClick={() => dispatch({ type: 'CONVERT_LEAD' })} 
                />
                 <ActionButton 
                  label="关闭无效线索" 
                  variant="danger"
                  onClick={() => dispatch({ type: 'CLOSE_LEAD' })} 
                />
              </div>
            )}
          </>
        )}
      </Section>

      {/* 报价阶段 */}
      <Section title="2. 报价与版本" icon={ClipboardList} active={quoteActive}>
        {hasQuote && !hasSales ? (
          <>
             <div className="text-sm font-hand text-gray-500 mb-2 border-b border-dashed border-gray-300 pb-1">当前状态: {state.quote?.currentStatus}</div>
             
             {/* 草稿动作 */}
             {state.quote?.currentStatus === QuoteVersionStatus.DRAFT && (
               <ActionButton 
                 label="发布为初稿" 
                 onClick={() => dispatch({ type: 'PUBLISH_QUOTE' })} 
               />
             )}

             {/* 初稿动作 */}
             {state.quote?.currentStatus === QuoteVersionStatus.PRELIMINARY && (
               <div className="space-y-2">
                 {!hasMeasurement && (
                   <ActionButton 
                     label="上传户型测量需求" 
                     variant="warning"
                     onClick={() => dispatch({ type: 'CREATE_MEASUREMENT' })} 
                   />
                 )}
               </div>
             )}
             
             {/* 测量中 */}
             {state.quote?.currentStatus === QuoteVersionStatus.MEASURING && (
                <div className="text-sm text-pencil-dark font-hand text-center p-2 bg-gray-100 rounded-sm transform rotate-1 border border-gray-300">
                  ⏳ 等待测量数据回传...
                </div>
             )}

             {/* 再稿动作 */}
             {state.quote?.currentStatus === QuoteVersionStatus.REVISED && (
                <div className="grid grid-cols-2 gap-3">
                   <ActionButton 
                     label="客户确认签字" 
                     variant="success"
                     onClick={() => dispatch({ type: 'CONFIRM_QUOTE' })} 
                   />
                   <ActionButton 
                     label="创建新版本 (V1.2)" 
                     variant="primary"
                     onClick={() => dispatch({ type: 'NEW_VERSION' })} 
                   />
                </div>
             )}
          </>
        ) : (
          <div className="text-sm text-gray-400 font-hand italic text-center">...等待线索转化...</div>
        )}
      </Section>

      {/* 测量单子阶段 */}
      {hasMeasurement && (
        <Section title="2a. 测量任务单" icon={PenTool} active={measureActive}>
          <div className="text-sm font-hand text-gray-500 mb-2">进度: {state.measurement?.status}</div>
          {state.measurement?.status === ServiceOrderStatus.PENDING && (
             <ActionButton label="指派测量师" onClick={() => dispatch({ type: 'MEASURE_ACTION', payload: 'ASSIGN' })} />
          )}
          {state.measurement?.status === ServiceOrderStatus.ASSIGNING && (
             <ActionButton label="测量师接单" onClick={() => dispatch({ type: 'MEASURE_ACTION', payload: 'ACCEPT' })} />
          )}
          {state.measurement?.status === ServiceOrderStatus.WAITING && (
             <ActionButton label="完成上门测量" onClick={() => dispatch({ type: 'MEASURE_ACTION', payload: 'COMPLETE_SITE' })} />
          )}
          {state.measurement?.status === ServiceOrderStatus.CONFIRMING && (
             <div className="grid grid-cols-2 gap-3">
               <ActionButton label="驳回重测" variant="danger" onClick={() => dispatch({ type: 'MEASURE_ACTION', payload: 'REJECT' })} />
               <ActionButton label="确认测量结果" variant="success" onClick={() => dispatch({ type: 'MEASURE_ACTION', payload: 'CONFIRM' })} />
             </div>
          )}
          {state.measurement?.status === ServiceOrderStatus.COMPLETED && (
             <div className="text-sm text-pencil-dark font-bold font-hand flex items-center gap-1 justify-center border-b-2 border-pencil-dark pb-1">
               <CheckCircle size={16}/> 数据已同步至报价
             </div>
          )}
        </Section>
      )}

      {/* 销售单阶段 */}
      <Section title="3. 销售订单" icon={DollarSign} active={salesActive}>
         {hasSales ? (
           <>
            <div className="text-sm font-hand text-gray-500 mb-2">状态: {state.salesOrder?.status}</div>
            
            {state.salesOrder?.status === SalesOrderStatus.DRAFT && (
               <ActionButton label="确认生成销售单" onClick={() => dispatch({ type: 'SALES_ACTION', payload: 'CONFIRM' })} />
            )}
            
            {state.salesOrder?.status === SalesOrderStatus.CONFIRMED && (
               <ActionButton label="录入采购信息" variant="primary" onClick={() => dispatch({ type: 'SALES_ACTION', payload: 'PROCURE' })} />
            )}

            {state.salesOrder?.status === SalesOrderStatus.PURCHASING && (
               <ActionButton label="添加物流信息 (发货)" variant="warning" onClick={() => dispatch({ type: 'SALES_ACTION', payload: 'SHIP' })} />
            )}

            {state.salesOrder?.status === SalesOrderStatus.SHIPPING && !hasInstall && (
               <ActionButton label="安排上门安装" variant="success" onClick={() => dispatch({ type: 'CREATE_INSTALL' })} />
            )}

            {state.salesOrder?.status === SalesOrderStatus.INSTALLING && (
               <div className="text-sm text-pencil-dark font-hand italic text-center border-2 border-dashed border-gray-300 p-2">
                  🚧 安装作业进行中...
                </div>
            )}
            
            {/* 销售单等待安装完成后进入对账 */}
            {state.salesOrder?.status === SalesOrderStatus.RECONCILIATION && !hasReconcile && (
               <ActionButton label="生成对账结算单" onClick={() => dispatch({ type: 'CREATE_RECON' })} />
            )}

           </>
         ) : (
           <div className="text-sm text-gray-400 font-hand italic text-center">...等待报价确认...</div>
         )}
      </Section>

      {/* 安装单子阶段 */}
      {hasInstall && (
        <Section title="3a. 安装任务单" icon={Truck} active={installActive}>
          <div className="text-sm font-hand text-gray-500 mb-2">进度: {state.installation?.status}</div>
          {state.installation?.status === ServiceOrderStatus.PENDING && (
             <ActionButton label="指派安装师傅" onClick={() => dispatch({ type: 'INSTALL_ACTION', payload: 'ASSIGN' })} />
          )}
          {state.installation?.status === ServiceOrderStatus.ASSIGNING && (
             <ActionButton label="师傅接单" onClick={() => dispatch({ type: 'INSTALL_ACTION', payload: 'ACCEPT' })} />
          )}
          {state.installation?.status === ServiceOrderStatus.WAITING && (
             <ActionButton label="完成上门安装" onClick={() => dispatch({ type: 'INSTALL_ACTION', payload: 'COMPLETE_SITE' })} />
          )}
          {state.installation?.status === ServiceOrderStatus.CONFIRMING && (
             <div className="grid grid-cols-2 gap-3">
               <ActionButton label="上传现场照片" variant="primary" onClick={() => dispatch({ type: 'INSTALL_ACTION', payload: 'UPLOAD_PHOTOS' })} />
               <ActionButton label="确认安装验收" variant="success" onClick={() => dispatch({ type: 'INSTALL_ACTION', payload: 'CONFIRM' })} />
             </div>
          )}
        </Section>
      )}

      {/* 对账阶段 */}
      {hasReconcile && (
        <Section title="4. 财务对账与结单" icon={RotateCw} active={reconActive}>
           <div className="text-sm font-hand text-gray-500 mb-2">状态: {state.reconciliation?.status}</div>
           {state.reconciliation?.status === ReconciliationStatus.PENDING && (
             <ActionButton label="开始对账流程" onClick={() => dispatch({ type: 'RECON_ACTION', payload: 'START' })} />
           )}
           {state.reconciliation?.status === ReconciliationStatus.RECONCILING && (
             <div className="grid grid-cols-2 gap-3">
                <ActionButton label="报告账目差异" variant="danger" onClick={() => dispatch({ type: 'RECON_ACTION', payload: 'DISCREPANCY' })} />
                <ActionButton label="账目核对一致 (完成)" variant="success" onClick={() => dispatch({ type: 'RECON_ACTION', payload: 'COMPLETE' })} />
             </div>
           )}
           {state.reconciliation?.status === ReconciliationStatus.DISCREPANCY && (
             <ActionButton label="调整并重试" variant="warning" onClick={() => dispatch({ type: 'RECON_ACTION', payload: 'ADJUST' })} />
           )}
           {state.reconciliation?.status === ReconciliationStatus.ADJUSTED && (
             <ActionButton label="重新开始对账" onClick={() => dispatch({ type: 'RECON_ACTION', payload: 'START' })} />
           )}
           {state.reconciliation?.status === ReconciliationStatus.COMPLETED && (
             <div className="p-3 bg-pencil-dark text-white text-center font-display text-xl transform rotate-2 shadow-lg border-2 border-gray-800">
               <CheckCircle className="inline mr-2" size={20}/>
               全流程完结
             </div>
           )}
        </Section>
      )}

      {/* 重置 */}
      <div className="pt-8 pb-4">
        <button 
          onClick={() => dispatch({type: 'RESET'})}
          className="w-full py-3 border-2 border-gray-300 border-dashed text-gray-400 hover:border-red-400 hover:text-red-500 rounded font-hand tracking-widest transition-colors"
        >
          - 擦除并重新开始 (Reset) -
        </button>
      </div>

    </div>
  );
};