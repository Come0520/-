import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { MOCK_METRICS } from '../constants';

const XPCard = ({ title, children, className }: any) => (
  <div className={`rounded-t-md overflow-hidden bg-[#ECE9D8] shadow-xp-window flex flex-col ${className}`}>
    <div className="bg-gradient-to-r from-[#0058EE] to-[#245DDA] px-2 py-1 flex justify-between items-center select-none">
      <span className="text-white font-bold text-xs shadow-sm" style={{textShadow: '1px 1px 0px rgba(0,0,0,0.5)'}}>
        {title}
      </span>
      <div className="flex gap-1">
         <div className="w-4 h-4 bg-[#D6DFF7] border border-white rounded-[2px] flex items-center justify-center opacity-80">
            <div className="w-2 h-[2px] bg-[#245DDA]"></div>
         </div>
      </div>
    </div>
    <div className="p-[2px] border border-[#0058EE] border-t-0 flex-1 flex flex-col">
       <div className="bg-white border border-[#828790] flex-1 p-2">
         {children}
       </div>
    </div>
  </div>
);

const MetricCard = ({ title, value, unit, target }: any) => {
  const isPositive = value >= target;
  return (
    <XPCard title={title}>
      <div className="flex flex-col h-full justify-center items-center p-2">
         <div className="text-3xl font-bold font-sans text-[#444] tracking-tighter">
            {value} <span className="text-sm text-gray-500">{unit}</span>
         </div>
         <div className="w-full bg-[#E5E5E5] h-3 border border-[#999] mt-2 relative rounded-sm overflow-hidden">
            <div 
               className={`h-full ${isPositive ? 'bg-gradient-to-b from-[#8CCF6F] to-[#45A118]' : 'bg-gradient-to-b from-[#E68B2C] to-[#C25E00]'}`} 
               style={{ width: `${Math.min((value / (target * 1.5)) * 100, 100)}%` }}
            ></div>
         </div>
         <div className="text-[10px] text-gray-500 mt-1">目标: {target}{unit}</div>
      </div>
    </XPCard>
  );
};

const dataActivity = [
  { name: '周一', leads: 4, quotes: 2, sales: 1 },
  { name: '周二', leads: 3, quotes: 3, sales: 2 },
  { name: '周三', leads: 7, quotes: 4, sales: 3 },
  { name: '周四', leads: 5, quotes: 6, sales: 4 },
  { name: '周五', leads: 8, quotes: 5, sales: 5 },
  { name: '周六', leads: 2, quotes: 1, sales: 1 },
  { name: '周日', leads: 1, quotes: 0, sales: 0 },
];

const dataCycle = [
  { stage: '线索>报价', days: 3 },
  { stage: '报价>销售', days: 8 },
  { stage: '销售>安装', days: 12 },
  { stage: '安装>对账', days: 3 },
];

export const DashboardView = () => {
  return (
    <div className="space-y-4 p-2 h-full overflow-y-auto">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_METRICS.map((m, i) => (
          <MetricCard key={i} title={m.name} value={m.value} target={m.target} unit={m.unit} />
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[350px]">
        {/* Activity Trend */}
        <XPCard title="每周业务趋势图.xls" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataActivity} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#245DDA" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#245DDA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{fontSize: 11}} />
                <YAxis tick={{fontSize: 11}} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFE1', border: '1px solid black', fontSize: '11px' }} />
                <Area type="monotone" dataKey="leads" stroke="#245DDA" fillOpacity={1} fill="url(#colorLeads)" name="线索" />
                <Line type="monotone" dataKey="sales" stroke="#3C8B18" strokeWidth={2} name="销售" />
              </AreaChart>
            </ResponsiveContainer>
        </XPCard>

        {/* Cycle Time Analysis */}
        <XPCard title="周期分析.ppt">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCycle} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" width={70} tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFE1', border: '1px solid black', fontSize: '11px' }} />
                <Bar dataKey="days" fill="#E68B2C" radius={[0, 4, 4, 0]} barSize={20} name="天数" />
              </BarChart>
            </ResponsiveContainer>
        </XPCard>
      </div>
    </div>
  );
};