import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { MOCK_METRICS } from '../constants';

const MetricCard = ({ title, value, unit, target }: any) => {
  const isPositive = value >= target;
  return (
    <div className="sketch-box p-6 relative overflow-hidden group bg-white">
      {/* 胶带效果 */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-yellow-100/50 rotate-1 border-l border-r border-white/50 backdrop-blur-sm shadow-sm"></div>

      <div className={`absolute top-0 right-0 p-2 text-xs font-mono border-b border-l border-pencil-dark ${isPositive ? 'text-pencil-dark bg-green-100' : 'text-ink-red bg-red-50'}`}>
        目标: {target}{unit}
      </div>
      <h3 className="text-gray-500 text-sm font-hand mb-2">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-display text-pencil-dark">{value}</span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
      
      {/* 进度条：手绘风格填充 */}
      <div className="w-full h-2 border border-pencil-dark mt-4 rounded-sm p-[1px]">
        <div 
          className={`h-full transition-all duration-1000 ${isPositive ? 'bg-pencil-dark' : 'bg-gray-300'}`} 
          style={{ 
            width: `${Math.min((value / (target * 1.5)) * 100, 100)}%`,
            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)',
            backgroundSize: '1rem 1rem'
          }}
        />
      </div>
    </div>
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
    <div className="space-y-6 animate-fade-in">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_METRICS.map((m, i) => (
          <MetricCard key={i} title={m.name} value={m.value} target={m.target} unit={m.unit} />
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Activity Trend */}
        <div className="sketch-box p-4 lg:col-span-2 flex flex-col bg-white">
          <h3 className="text-pencil-dark mb-4 font-display text-xl border-b-2 border-pencil-dark inline-block w-fit px-2">
            周工作量统计
          </h3>
          <div className="flex-1 font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataActivity}>
                <defs>
                  {/* 使用图案填充代替渐变 */}
                  <pattern id="patternLeads" patternUnits="userSpaceOnUse" width="4" height="4">
                    <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#374151" strokeWidth="1"/>
                  </pattern>
                  <pattern id="patternSales" patternUnits="userSpaceOnUse" width="8" height="8">
                     <circle cx="2" cy="2" r="1" fill="#374151" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#374151" tick={{fontFamily: '"Ma Shan Zheng"'}} />
                <YAxis stroke="#374151" tick={{fontFamily: 'monospace'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#374151', borderStyle: 'dashed' }} 
                  itemStyle={{ color: '#374151' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#374151" strokeWidth={2} fillOpacity={0.2} fill="url(#patternLeads)" name="线索数" />
                <Area type="monotone" dataKey="sales" stroke="#000" strokeWidth={2} fillOpacity={0.1} fill="url(#patternSales)" name="成单数" />
                <Line type="step" dataKey="quotes" stroke="#9ca3af" strokeDasharray="5 5" strokeWidth={2} name="报价数" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cycle Time Analysis */}
        <div className="sketch-box p-4 flex flex-col bg-white">
          <h3 className="text-pencil-dark mb-4 font-display text-xl border-b-2 border-pencil-dark inline-block w-fit px-2">
            平均流转天数
          </h3>
          <div className="flex-1 font-hand">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCycle} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" stroke="#374151" />
                <YAxis dataKey="stage" type="category" stroke="#374151" width={80} style={{ fontSize: '12px' }} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ backgroundColor: '#fff', borderColor: '#374151' }} />
                <Bar dataKey="days" fill="#374151" barSize={15} name="天数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};