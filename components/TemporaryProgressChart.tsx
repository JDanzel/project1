import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Task, DayLog, TaskType } from '../types';
import { Briefcase } from 'lucide-react';

interface TemporaryProgressChartProps {
  tasks: Task[];
  logs: DayLog[];
}

const TemporaryProgressChart: React.FC<TemporaryProgressChartProps> = ({ tasks, logs }) => {
  const data = useMemo(() => {
    const tempTaskIds = tasks
      .filter(t => t.type === TaskType.TEMPORARY)
      .map(t => t.id);

    const result = [];
    const today = new Date();
    
    // Generate last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      
      const log = logs.find(l => l.date === dateKey);
      let count = 0;
      
      if (log) {
        count = log.completedTaskIds.filter(id => tempTaskIds.includes(id)).length;
      }

      result.push({
        date: dateKey,
        displayDate: d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        count: count
      });
    }
    return result;
  }, [tasks, logs]);

  // Calculate total completed in period for a summary stat
  const totalCompletedPeriod = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-xl rpg-font text-white flex items-center gap-2">
            <Briefcase className="text-amber-500" size={20} />
            Стратегическая Активность
            </h3>
            <p className="text-xs text-slate-500 mt-1">Выполненные временные задачи (последние 14 дней)</p>
        </div>
        <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">{totalCompletedPeriod}</div>
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">За период</div>
        </div>
      </div>

      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
            <XAxis 
                dataKey="displayDate" 
                tick={{ fill: '#64748b', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
                dy={10}
            />
            <YAxis 
                tick={{ fill: '#64748b', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: '#1e293b', opacity: 0.5 }}
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#475569', 
                color: '#e2e8f0',
                fontSize: '12px',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.count > 0 ? '#f59e0b' : '#334155'} 
                    fillOpacity={entry.count > 0 ? 0.8 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemporaryProgressChart;