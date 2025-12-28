import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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
      color: '#991b1b', // Red-800
      icon: Zap 
    },
    [Category.INTELLECT]: { 
      label: 'Интеллект', 
      color: '#7c2d12', // Orange-900
      icon: Brain 
    },
    [Category.HEALTH]: { 
      label: 'Здоровье', 
      color: '#064e3b', // Emerald-900
      icon: Heart 
    },
    [Category.PROFESSIONAL]: { 
      label: 'Профессия', 
      color: '#1e3a8a', // Blue-900
      icon: Briefcase 
    },
  };

  const data = useMemo(() => {
    if (logs.length === 0) return [];
    const logDates = logs.map(l => new Date(l.date).getTime());
    const minDate = Math.min(...logDates);
    const maxDate = new Date().getTime();

    const timeline: { dateStr: string; displayDate: string; timestamp: number }[] = [];
    let current = minDate;
    while (current <= maxDate) {
      const d = new Date(current);
      timeline.push({
        dateStr: d.toISOString().split('T')[0],
        displayDate: d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        timestamp: current
      });
      current += 86400000;
    }

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
    <div className="bg-[#fdf2d9]/30 p-6 rounded-xl border border-amber-900/15 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
            <h3 className="text-xl rpg-font text-amber-950 flex items-center gap-2">
            <TrendingUp className="text-amber-800" size={24} />
            Свиток Степеней Славы
            </h3>
            <p className="text-xs text-amber-900/40 mt-1">Накопление опыта по категориям (Ретроспектива)</p>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
            {(Object.values(Category) as Category[]).map(cat => {
                const config = CATEGORY_CONFIG[cat];
                const Icon = config.icon;
                const isActive = visibleCategories.includes(cat);
                return (
                    <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${isActive ? 'bg-amber-900/10 border-amber-900/20 text-amber-950 shadow-sm' : 'bg-transparent border-transparent text-amber-900/30 hover:text-amber-900/50'}`}
                    >
                        <Icon size={12} style={{ color: isActive ? config.color : 'currentColor' }} />
                        <span>{config.label}</span>
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
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8b5e3c" opacity={0.1} />
            <XAxis 
                dataKey="name" 
                tick={{ fill: '#451a03', fontSize: 10, fontWeight: 'bold' }} 
                axisLine={false}
                tickLine={false}
                dy={10}
                minTickGap={30}
            />
            <YAxis 
                tick={{ fill: '#451a03', fontSize: 10, fontWeight: 'bold' }} 
                axisLine={false}
                tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fdf2d9', 
                borderColor: '#8b5e3c', 
                color: '#2c1810',
                fontSize: '12px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
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
                        stroke={config.color} 
                        fill={`url(#color${cat})`}
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