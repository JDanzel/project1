import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { UserStats, Category } from '../types';
import { Swords, Brain, Heart, Briefcase } from 'lucide-react';

interface StatRadarProps {
  stats: UserStats;
}

const CustomTick = (props: any) => {
  const { x, y, payload } = props;
  const labels: Record<string, { text: string; icon: React.ReactNode; color: string }> = {
    'Тело': { text: 'Тело', icon: <Swords size={14} />, color: '#7f1d1d' }, 
    'Интеллект': { text: 'Интеллект', icon: <Brain size={14} />, color: '#92400e' }, 
    'Здоровье': { text: 'Здоровье', icon: <Heart size={14} />, color: '#064e3b' }, 
    'Профессия': { text: 'Профессия', icon: <Briefcase size={14} />, color: '#1e3a8a' }, 
  };

  const current = labels[payload.value] || { text: payload.value, icon: null, color: '#451a03' };

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x="-40" y="-10" width="80" height="40" className="overflow-visible">
        <div className="flex flex-col items-center justify-center gap-1">
          <div style={{ color: current.color }}>
            {current.icon}
          </div>
          <span 
            className="text-[10px] font-bold uppercase tracking-wider text-[#2c1810] whitespace-nowrap"
            style={{ fontFamily: 'Cinzel' }}
          >
            {current.text}
          </span>
        </div>
      </foreignObject>
    </g>
  );
};

const StatRadar: React.FC<StatRadarProps> = ({ stats }) => {
  const data = [
    { subject: 'Тело', A: stats[Category.PHYSICAL], fullMark: 100 },
    { subject: 'Интеллект', A: stats[Category.INTELLECT], fullMark: 100 },
    { subject: 'Здоровье', A: stats[Category.HEALTH], fullMark: 100 },
    { subject: 'Профессия', A: stats[Category.PROFESSIONAL], fullMark: 100 },
  ];

  return (
    <div className="w-full bg-[#fdf2d9]/40 rounded-lg border border-amber-900/20 p-6 relative overflow-hidden flex flex-col items-center shadow-sm">
      <div className="w-full relative">
          <h3 className="text-xl text-center text-[#2c1810] rpg-font mb-8 uppercase tracking-widest">Характеристики Героя</h3>
          <div className="w-full h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke="#8b5e3c" strokeOpacity={0.2} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={<CustomTick />}
                />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar
                    name="Характеристики"
                    dataKey="A"
                    stroke="#78350f"
                    strokeWidth={2}
                    fill="#78350f"
                    fillOpacity={0.2}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fdf2d9', borderColor: '#8b5e3c', color: '#2c1810', borderRadius: '4px' }}
                    itemStyle={{ color: '#78350f' }}
                />
                </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-0 right-0 text-[10px] text-amber-900 font-black uppercase tracking-[0.2em] border border-amber-900/10 rounded px-3 py-1 bg-amber-900/5">
            Уровень {stats.level}
          </div>
      </div>
    </div>
  );
};

export default StatRadar;