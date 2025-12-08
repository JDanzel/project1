import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Defs, LinearGradient, Stop } from 'recharts';
import { Task, DayLog, Category } from '../types';
import { XP_RATES, XP_PER_TASK } from '../constants';
import { Zap, Brain, Heart, Briefcase, Filter, TrendingUp } from 'lucide-react';

interface ProgressHistoryChartProps {
  tasks: Task[];
  logs: DayLog[];
}

const ProgressHistoryChart: React.FC<ProgressHistoryChartProps> = ({ tasks, logs }) => {
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([
    Category.PHYSICAL,
    Category.INTELLECT,
    Category.HEALTH,
    Category.PROFESSIONAL
  ]);

  const toggleCategory = (cat: Category) => {
    setVisibleCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const CATEGORY_CONFIG = {
    [Category.PHYSICAL]: { 
      label: 'Физическая', 
      color: '#f43f5e', // rose-500
      icon: Zap 
    },
    [Category.INTELLECT]: { 
      label: 'Интеллект', 
      color: '#8b5cf6', // violet-500
      icon: Brain 
    },
    [Category.HEALTH]: { 
      label: 'Здоровье', 
      color: '#10b981', // emerald-500
      icon: Heart 
    },
    [Category.PROFESSIONAL]: { 
      label: 'Профессия', 
      color: '#f59e0b', // amber-500
      icon: Briefcase 
    },
  };

  const data = useMemo(() => {
    if (logs.length === 0) return [];

    // 1. Get all unique dates and sort them
    const logDates = logs.map(l => new Date(l.date).getTime());
    const minDate = Math.min(...logDates);
    const maxDate = new Date().getTime(); // Up to today

    // 2. Create a continuous timeline
    const timeline: { dateStr: string; displayDate: string; timestamp: number }[] = [];
    let current = minDate;
    while (current <= maxDate) {
      const d = new Date(current);
      timeline.push({
        dateStr: d.toISOString().split('T')[0],
        displayDate: d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        timestamp: current
      });
      current += 86400000; // +1 day
    }

    // 3. Calculate Cumulative Stats
    let accumulatedStats = {
      [Category.PHYSICAL]: 0,
      [Category.INTELLECT]: 0,
      [Category.HEALTH]: 0,
      [Category.PROFESSIONAL]: 0,
    };

    return timeline.map(day => {
      const log = logs.find(l => l.date === day.dateStr);
      
      if (log) {
        log.completedTaskIds.forEach(taskId => {
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            const xp = task.difficulty ? XP_RATES[task.difficulty] : XP_PER_TASK;
            // Distribute XP among affected categories
            task.affectedCategories.forEach(cat => {
              accumulatedStats[cat] += xp;
            });
          }
        });
      }

      return {
        name: day.displayDate,
        ...accumulatedStats
      };
    });
  }, [tasks, logs]);

  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
            <h3 className="text-xl rpg-font text-white flex items-center gap-2">
            <TrendingUp className="text-indigo-400" size={24} />
            История Прогресса
            </h3>
            <p className="text-xs text-slate-500 mt-1">Накопление опыта по категориям (Ретроспектива)</p>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex items-center gap-2 mr-2 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <Filter size={12} /> Фильтр:
            </div>
            {(Object.values(Category) as Category[]).map(cat => {
                const config = CATEGORY_CONFIG[cat];
                const Icon = config.icon;
                const isActive = visibleCategories.includes(cat);
                
                return (
                    <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${isActive ? 'bg-slate-800 border-slate-600 text-white shadow-sm' : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-900'}`}
                        style={{ borderColor: isActive ? config.color : 'transparent' }}
                    >
                        <Icon size={12} style={{ color: isActive ? config.color : 'currentColor' }} />
                        <span className={isActive ? '' : 'opacity-50'}>{config.label}</span>
                    </button>
                )
            })}
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
                dy={10}
                minTickGap={30}
            />
            <YAxis 
                tick={{ fill: '#64748b', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#475569', 
                color: '#e2e8f0',
                fontSize: '12px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
              }}
              labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}
              itemSorter={(item) => (item.value as number) * -1}
            />
            
            {(Object.values(Category) as Category[]).map(cat => {
                if (!visibleCategories.includes(cat)) return null;
                const config = CATEGORY_CONFIG[cat];
                return (
                    <Area 
                        key={cat}
                        type="monotone" 
                        dataKey={cat} 
                        stackId="1" 
                        stroke={config.color} 
                        fill={`url(#color${cat})`}
                        fillOpacity={1}
                        strokeWidth={2}
                        name={config.label}
                        dot={{ r: 2, fill: config.color, strokeWidth: 0 }}
                        activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                    />
                );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressHistoryChart;