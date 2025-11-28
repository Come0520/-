import React from 'react';
import { SimulationState, LeadStatus, QuoteVersionStatus, SalesOrderStatus, ServiceOrderStatus, ReconciliationStatus } from '../types';

interface Props {
  state: SimulationState;
}

export const PipelineMap: React.FC<Props> = ({ state }) => {
  
  const getNodeStatus = (step: string) => {
    switch (step) {
      case 'lead':
        if (!state.lead) return 'inactive';
        if (state.lead.status === LeadStatus.CONVERTED) return 'completed';
        if (state.lead.status === LeadStatus.INVALID) return 'error';
        return 'active';
      case 'quote':
        if (!state.quote) return 'inactive';
        if (state.quote.currentStatus === QuoteVersionStatus.CONFIRMED) return 'completed';
        if (state.quote.currentStatus === QuoteVersionStatus.CANCELLED) return 'error';
        return 'active';
      case 'measure':
        if (!state.measurement) return 'inactive';
        if (state.measurement.status === ServiceOrderStatus.COMPLETED) return 'completed';
        if (state.measurement.status === ServiceOrderStatus.CANCELLED) return 'error';
        return 'active';
      case 'sales':
        if (!state.salesOrder) return 'inactive';
        if (state.salesOrder.status === SalesOrderStatus.COMPLETED) return 'completed';
        if (state.salesOrder.status === SalesOrderStatus.CANCELLED) return 'error';
        return 'active';
      case 'install':
        if (!state.installation) return 'inactive';
        if (state.installation.status === ServiceOrderStatus.COMPLETED) return 'completed';
        return 'active';
      case 'finance':
        if (!state.reconciliation) return 'inactive';
        if (state.reconciliation.status === ReconciliationStatus.COMPLETED) return 'completed';
        return 'active';
      default: return 'inactive';
    }
  };

  const Node = ({ id, label, x, y, type = 'main' }: any) => {
    const status = getNodeStatus(id);
    
    // 素描风格：黑色描边，白色或灰色填充
    let strokeClass = "stroke-gray-300";
    let fillClass = "fill-transparent";
    let textClass = "fill-gray-400";
    let lineDash = "5,5"; // 默认为虚线（未激活）
    let strokeWidth = "2";

    if (status === 'active') {
      strokeClass = "stroke-pencil-dark";
      fillClass = "fill-white";
      textClass = "fill-pencil-dark font-bold";
      lineDash = "0"; // 实线
      strokeWidth = "3";
    } else if (status === 'completed') {
      strokeClass = "stroke-pencil-dark";
      fillClass = "fill-gray-200"; // 涂黑/涂灰表示完成
      textClass = "fill-pencil-dark";
      lineDash = "0";
    } else if (status === 'error') {
      strokeClass = "stroke-ink-red";
      textClass = "fill-ink-red decoration-line-through";
    }

    const isSub = type === 'sub';
    const r = isSub ? 25 : 35;
    const fontSize = isSub ? '12px' : '14px';

    // 模拟手绘圆圈的不规则路径
    // 简单的圆形太完美了，这里保留圆形但用粗糙的笔触颜色
    return (
      <g transform={`translate(${x}, ${y})`} className="transition-all duration-500">
        {/* 外圈（多重描边模拟素描） */}
        <circle 
          r={r} 
          className={`${strokeClass} ${fillClass} transition-all duration-500`}
          strokeWidth={strokeWidth}
          strokeDasharray={lineDash}
          style={{ vectorEffect: 'non-scaling-stroke' }} 
        />
        
        {/* 如果激活，加一个稍微偏移的圈，模拟手画两圈 */}
        {status === 'active' && (
             <circle r={r} cx="2" cy="1" className="stroke-pencil-dark fill-transparent opacity-50" strokeWidth="1" />
        )}

        <text 
          y={isSub ? 45 : 60} 
          textAnchor="middle" 
          className={`font-hand tracking-widest ${fontSize} ${textClass}`}
        >
          {label}
        </text>

        {/* 内部标记 */}
        <text y="8" textAnchor="middle" className={`font-display text-lg ${status === 'completed' ? 'fill-pencil-dark' : 'fill-transparent'}`}>
           {status === 'completed' ? '✔' : ''}
        </text>
        {status === 'active' && (
           <text y="8" textAnchor="middle" className="fill-pencil-dark text-xs animate-pulse font-hand">...</text>
        )}
      </g>
    );
  };

  const Connection = ({ start, end, active }: any) => {
    // 模拟手绘线条
    const midX = (start[0] + end[0]) / 2;
    const pathD = `M ${start[0]} ${start[1]} Q ${midX} ${start[1] + (Math.random() * 2 - 1)} ${end[0]} ${end[1]}`; // 稍微加点随机弯曲太复杂，直接直线即可
    
    return (
      <line 
        x1={start[0]} y1={start[1]} 
        x2={end[0]} y2={end[1]} 
        className={`stroke-2 transition-all duration-700 ${active ? 'stroke-pencil-dark' : 'stroke-gray-300'}`}
        strokeDasharray={active ? "0" : "5,5"}
        strokeLinecap="round"
      />
    );
  };
  
  // 坐标
  const coords: any = {
    lead: [80, 100],
    quote: [240, 100],
    measure: [240, 220], 
    sales: [450, 100],
    install: [650, 100],
    finance: [850, 100]
  };

  // 路径状态逻辑
  const leadToQuote = state.lead?.status === LeadStatus.CONVERTED;
  const quoteToMeasure = state.quote?.currentStatus === QuoteVersionStatus.PRELIMINARY || state.quote?.currentStatus === QuoteVersionStatus.MEASURING;
  const measureToQuote = state.measurement?.status === ServiceOrderStatus.COMPLETED;
  const quoteToSales = state.quote?.currentStatus === QuoteVersionStatus.CONFIRMED;
  const salesToInstall = state.salesOrder?.status === SalesOrderStatus.SHIPPING || state.salesOrder?.status === SalesOrderStatus.INSTALLING;
  const installToSales = state.installation?.status === ServiceOrderStatus.COMPLETED;
  const salesToFinance = state.salesOrder?.status === SalesOrderStatus.RECONCILIATION || state.salesOrder?.status === SalesOrderStatus.COMPLETED;

  return (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center overflow-x-auto bg-paper rounded-xl border-2 border-pencil-dark relative sketch-box">
      
      <svg width="950" height="300" viewBox="0 0 950 300" className="z-10">
        <defs>
          <marker id="arrow-pencil" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
          </marker>
           <marker id="arrow-gray" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
          </marker>
        </defs>

        {/* 主水平线 */}
        <Connection start={[115, 100]} end={[205, 100]} active={leadToQuote} />
        <Connection start={[275, 100]} end={[415, 100]} active={quoteToSales} />
        <Connection start={[485, 100]} end={[615, 100]} active={salesToInstall} />
        <Connection start={[685, 100]} end={[815, 100]} active={salesToFinance} />

        {/* 垂直测量逻辑 */}
        <line x1={240} y1={135} x2={240} y2={195} 
          className={`stroke-2 ${quoteToMeasure ? 'stroke-pencil-dark' : 'stroke-gray-300'}`} 
          strokeDasharray={quoteToMeasure ? "0" : "5,5"}
          markerEnd={quoteToMeasure ? "url(#arrow-pencil)" : "url(#arrow-gray)"} 
        />
        
        {/* 回流线 (曲线) */}
        {measureToQuote && (
          <path d="M 265 220 C 320 220, 320 140, 275 110" fill="none" 
            className="stroke-2 stroke-ink-blue stroke-dasharray-4" 
            markerEnd="url(#arrow-pencil)">
          </path>
        )}
        
        {/* 安装回流 */}
        {installToSales && (
          <path d="M 650 135 C 650 160, 500 160, 485 125" fill="none" 
            className="stroke-2 stroke-ink-blue stroke-dasharray-4" 
            markerEnd="url(#arrow-pencil)" />
        )}

        {/* 节点绘制 */}
        <Node id="lead" label="线索录入" x={coords.lead[0]} y={coords.lead[1]} />
        <Node id="quote" label="报价方案" x={coords.quote[0]} y={coords.quote[1]} />
        <Node id="measure" label="上门测量" x={coords.measure[0]} y={coords.measure[1]} type="sub" />
        <Node id="sales" label="销售订单" x={coords.sales[0]} y={coords.sales[1]} />
        <Node id="install" label="上门安装" x={coords.install[0]} y={coords.install[1]} type="sub" />
        <Node id="finance" label="财务对账" x={coords.finance[0]} y={coords.finance[1]} />

        <text x="330" y="190" className="fill-ink-blue text-[10px] font-hand opacity-80 -rotate-6">状态同步</text>

      </svg>
    </div>
  );
};