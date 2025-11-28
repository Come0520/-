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

  const IconNode = ({ id, label, x, y, type = 'main' }: any) => {
    const status = getNodeStatus(id);
    const isSub = type === 'sub';
    
    // XP Icon Colors
    let baseColor = "#8FA8CF"; // Inactive Grey/Blue
    let iconContent: React.ReactNode = null;
    
    if (status === 'active') baseColor = "#245DDA"; // XP Blue
    if (status === 'completed') baseColor = "#3C8B18"; // XP Green
    if (status === 'error') baseColor = "#E62C2C"; // XP Red

    // Simple pixel-art style SVG paths representing XP icons
    switch(id) {
        case 'lead': iconContent = <path d="M16 16 L16 32 M8 16 L24 16 M16 8 C20 8 24 12 24 16 C24 20 20 24 16 24 C12 24 8 20 8 16 C8 12 12 8 16 8" fill="white" />; break; // User
        case 'quote': iconContent = <rect x="8" y="6" width="16" height="20" fill="white" />; break; // Document
        case 'measure': iconContent = <path d="M6 26 L26 6 L28 8 L8 28 Z" fill="white" />; break; // Ruler
        case 'sales': iconContent = <circle cx="16" cy="16" r="8" stroke="white" strokeWidth="2" fill="none" />; break; // Coin
        case 'install': iconContent = <rect x="4" y="12" width="24" height="10" fill="white" />; break; // Box
        case 'finance': iconContent = <rect x="6" y="8" width="20" height="16" rx="2" fill="white" />; break; // Calculator
    }

    return (
      <g transform={`translate(${x - 20}, ${y - 20})`} className="cursor-pointer hover:opacity-90 transition-opacity">
        {/* Shadow */}
        <rect x="4" y="4" width="40" height="40" rx="8" fill="rgba(0,0,0,0.2)" />
        
        {/* Icon Background */}
        <rect x="0" y="0" width="40" height="40" rx="6" fill={baseColor} stroke="white" strokeWidth="2" />
        
        {/* Icon Content */}
        <g transform="translate(4,4)">{iconContent}</g>

        {/* Gloss Effect (Top half) */}
        <path d="M2 2 L38 2 L38 20 Q20 25 2 20 Z" fill="white" opacity="0.2" />

        {/* Label */}
        <text x="20" y="55" textAnchor="middle" className="font-sans text-[11px] font-bold fill-[#333]" style={{textShadow: '0px 1px 0px white'}}>
          {label}
        </text>
        
        {/* Status Indicator */}
        {status === 'active' && (
            <circle cx="36" cy="4" r="6" fill="#E68B2C" stroke="white" strokeWidth="2">
                <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
            </circle>
        )}
      </g>
    );
  };

  const Connector = ({ start, end, active }: any) => {
    return (
      <g>
         <path 
            d={`M ${start[0]} ${start[1]} L ${end[0]} ${end[1]}`} 
            stroke={active ? "#3C8B18" : "#ccc"} 
            strokeWidth="4" 
            fill="none" 
         />
         {/* Highlight line for pseudo-3D pipe effect */}
         <path 
            d={`M ${start[0]} ${start[1]} L ${end[0]} ${end[1]}`} 
            stroke={active ? "#8CCF6F" : "#eee"} 
            strokeWidth="2" 
            fill="none" 
         />
      </g>
    );
  };
  
  // 坐标
  const coords: any = {
    lead: [80, 80],
    quote: [220, 80],
    measure: [220, 200], 
    sales: [400, 80],
    install: [550, 80],
    finance: [700, 80]
  };

  // 路径逻辑
  const leadToQuote = state.lead?.status === LeadStatus.CONVERTED;
  const quoteToMeasure = state.quote?.currentStatus === QuoteVersionStatus.PRELIMINARY || state.quote?.currentStatus === QuoteVersionStatus.MEASURING;
  const measureToQuote = state.measurement?.status === ServiceOrderStatus.COMPLETED;
  const quoteToSales = state.quote?.currentStatus === QuoteVersionStatus.CONFIRMED;
  const salesToInstall = state.salesOrder?.status === SalesOrderStatus.SHIPPING || state.salesOrder?.status === SalesOrderStatus.INSTALLING;
  const installToSales = state.installation?.status === ServiceOrderStatus.COMPLETED;
  const salesToFinance = state.salesOrder?.status === SalesOrderStatus.RECONCILIATION || state.salesOrder?.status === SalesOrderStatus.COMPLETED;

  return (
    <div className="w-full h-full min-h-[280px] flex items-center justify-center bg-white border-2 border-[#828790] shadow-inner p-4 relative overflow-auto">
      <div className="absolute top-2 left-2 text-xs text-gray-400 font-sans">流程视图 (C:\My Documents\Workflows)</div>
      
      <svg width="800" height="260" viewBox="0 0 800 260">
        
        {/* Horizontal */}
        <Connector start={[100, 80]} end={[200, 80]} active={leadToQuote} />
        <Connector start={[240, 80]} end={[380, 80]} active={quoteToSales} />
        <Connector start={[420, 80]} end={[530, 80]} active={salesToInstall} />
        <Connector start={[570, 80]} end={[680, 80]} active={salesToFinance} />

        {/* Vertical Measure */}
        <Connector start={[220, 100]} end={[220, 180]} active={quoteToMeasure} />
        
        {/* Return paths (Visualized as curved pipes) */}
        {measureToQuote && (
          <path d="M 240 200 C 300 200, 300 120, 240 100" fill="none" stroke="#3C8B18" strokeWidth="2" strokeDasharray="4 4" />
        )}

        <IconNode id="lead" label="我的线索" x={coords.lead[0]} y={coords.lead[1]} />
        <IconNode id="quote" label="报价单据" x={coords.quote[0]} y={coords.quote[1]} />
        <IconNode id="measure" label="测量工具" x={coords.measure[0]} y={coords.measure[1]} type="sub" />
        <IconNode id="sales" label="销售订单" x={coords.sales[0]} y={coords.sales[1]} />
        <IconNode id="install" label="安装服务" x={coords.install[0]} y={coords.install[1]} type="sub" />
        <IconNode id="finance" label="财务结算" x={coords.finance[0]} y={coords.finance[1]} />

      </svg>
    </div>
  );
};