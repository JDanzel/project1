import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { UserStats, Category } from '../types';

interface StatRadarProps {
  stats: UserStats;
}

const StatRadar: React.FC<StatRadarProps> = ({ stats }) => {
  const data = [
    { subject: 'Физическая', A: stats[Category.PHYSICAL], fullMark: 100 },
    { subject: 'Интеллект', A: stats[Category.INTELLECT], fullMark: 100 },
    { subject: 'Здоровье', A: stats[Category.HEALTH], fullMark: 100 },
    { subject: 'Профессия', A: stats[Category.PROFESSIONAL], fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 md:h-80 bg-slate-800/50 rounded-xl border border-slate-700 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
      <h3 className="text-xl text-center text-slate-200 rpg-font mb-2">Характеристики Героя</h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
          <Radar
            name="Stats"
            dataKey="A"
            stroke="#8b5cf6"
            strokeWidth={3}
            fill="#8b5cf6"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#c084fc' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      <div className="absolute bottom-2 right-4 text-xs text-slate-500">
        LVL {stats.level}
      </div>
    </div>
  );
};

export default StatRadar;
