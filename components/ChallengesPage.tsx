import React, { useState } from 'react';
import { Challenge } from '../types';
import ChallengeCard from './ChallengeCard';
import FeatJournal from './FeatJournal';
import { Trophy, ScrollText, Shield, Sword, CheckCircle, Target, Activity } from 'lucide-react';

interface ChallengesPageProps {
  challenges: Challenge[];
  onAccept: (id: string) => void;
  onClaim: (id: string) => void;
}

const ChallengesPage: React.FC<ChallengesPageProps> = ({ challenges, onAccept, onClaim }) => {
  const [filter, setFilter] = useState<'all' | 'streak' | 'avoidance'>('all');

  const active = challenges.filter(c => c.status === 'active');
  const available = challenges.filter(c => c.status === 'available');
  const completed = challenges.filter(c => c.status === 'completed');

  const filteredAvailable = available.filter(c => filter === 'all' || c.type === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl rpg-font text-amber-950 font-black flex items-center gap-3 uppercase tracking-tight">
            <Trophy className="text-amber-800" size={32} /> Зал Испытаний
          </h2>
          <p className="text-amber-900/60 quote-font italic mt-1">Принимай вызовы и доказывай свою доблесть</p>
        </div>

        <div className="flex bg-[#3e2723]/10 p-1 rounded-xl border border-amber-950/10 backdrop-blur-sm shadow-inner">
          <button 
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === 'all' ? 'bg-amber-950 text-white shadow-lg' : 'text-amber-950/40 hover:text-amber-950/60'}`}
          >
            Все
          </button>
          <button 
            onClick={() => setFilter('streak')}
            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === 'streak' ? 'bg-amber-950 text-white shadow-lg' : 'text-amber-950/40 hover:text-amber-950/60'}`}
          >
            Серии
          </button>
          <button 
            onClick={() => setFilter('avoidance')}
            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === 'avoidance' ? 'bg-amber-950 text-white shadow-lg' : 'text-amber-950/40 hover:text-amber-950/60'}`}
          >
            Отказ
          </button>
        </div>
      </div>

      {/* Feat Journal Block */}
      <section className="animate-in slide-in-from-top-4 duration-500">
        <FeatJournal challenges={challenges} />
      </section>

      {/* Legend / Info - MOVED TO TOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white/10 rounded-3xl border border-amber-950/20 backdrop-blur-md shadow-2xl animate-in slide-in-from-top-2 duration-700">
        <div className="flex gap-5">
          <div className="bg-[#fdf2d9]/80 p-4 rounded-2xl border border-amber-950/20 shrink-0 h-fit shadow-lg shadow-amber-950/5 group">
            <Sword size={28} className="text-amber-900 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h4 className="font-black text-amber-950 uppercase tracking-tight mb-2 text-lg">Испытания Серии</h4>
            <p className="text-xs text-amber-900/60 leading-relaxed font-bold italic">
              Требуют выполнения конкретной задачи каждый день в течение указанного срока. Пропуск одного дня сбрасывает накопленную доблесть.
            </p>
          </div>
        </div>
        <div className="flex gap-5">
          <div className="bg-[#fdf2d9]/80 p-4 rounded-2xl border border-emerald-950/10 shrink-0 h-fit shadow-lg shadow-emerald-950/5 group">
            <Shield size={28} className="text-emerald-800 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h4 className="font-black text-amber-950 uppercase tracking-tight mb-2 text-lg">Испытания Отказа</h4>
            <p className="text-xs text-amber-900/60 leading-relaxed font-bold italic">
              Ваша задача — избегать вредных привычек. Любое нарушение священного свитка приводит к немедленному обнулению счетчика.
            </p>
          </div>
        </div>
      </div>

      {/* Active Challenges Detailed Visualization Block */}
      {active.length > 0 && (
        <section className="bg-white/10 p-6 rounded-2xl border border-amber-900/20 shadow-xl animate-in fade-in duration-700 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <Activity size={24} className="text-amber-800" />
            <h3 className="text-xl rpg-font text-amber-950 uppercase font-black tracking-wide">Активные Подвиги</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {active.map(c => {
               const percent = Math.min(100, Math.round((c.progress / c.durationDays) * 100));
               return (
                 <div key={c.id} className="bg-[#fdf2d9]/40 p-5 rounded-xl border border-amber-950/10 shadow-inner relative overflow-hidden group hover:border-amber-900/30 transition-all">
                   <div className="absolute top-0 left-0 h-1 bg-amber-900 w-full opacity-20" />
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-amber-950 uppercase tracking-tighter text-lg">{c.title}</h4>
                        <p className="text-[11px] text-amber-900/60 font-bold italic leading-tight mt-1">{c.description}</p>
                      </div>
                      <div className="text-right">
                         <div className="text-amber-950 font-black font-mono text-2xl drop-shadow-sm">{c.progress}<span className="text-amber-950/30 text-sm">/{c.durationDays}</span></div>
                         <div className="text-[8px] uppercase font-black text-amber-900/40 tracking-[0.2em]">дней завершено</div>
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <div className="flex justify-between items-end text-[9px] font-black uppercase tracking-[0.2em] text-amber-950/50">
                         <span>Ход миссии</span>
                         <span>{percent}%</span>
                      </div>
                      <div className="h-3 w-full bg-amber-950/10 rounded-full overflow-hidden border border-amber-950/5 shadow-inner">
                         <div 
                            className="h-full bg-gradient-to-r from-amber-900 to-amber-700 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(120,53,15,0.4)]" 
                            style={{ width: `${percent}%` }}
                         />
                      </div>
                   </div>

                   <div className="mt-5 pt-4 border-t border-amber-950/10 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-[10px] font-black text-amber-900 uppercase tracking-widest bg-amber-950/5 px-2.5 py-1 rounded-lg border border-amber-950/10">
                        {c.type === 'avoidance' ? <Shield size={12} /> : <Sword size={12} />}
                        <span>{c.type === 'avoidance' ? 'Отказ' : 'Серия'}</span>
                      </div>
                      <div className="text-[10px] font-black text-emerald-900 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-900/20 uppercase tracking-wider shadow-sm">
                        Награда: {c.rewardXP} XP
                      </div>
                   </div>
                 </div>
               );
            })}
          </div>
        </section>
      )}

      {/* Completed Section (Ready to Claim) */}
      {completed.length > 0 && (
        <section className="animate-in fade-in duration-700 bg-emerald-500/5 p-6 rounded-2xl border border-emerald-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle size={20} className="text-emerald-800" />
            <h3 className="text-lg rpg-font font-black uppercase tracking-widest text-emerald-950">Выполненные Подвиги</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map(c => (
              <ChallengeCard key={c.id} challenge={c} onAccept={onAccept} onClaim={onClaim} />
            ))}
          </div>
        </section>
      )}

      {/* Available Section */}
      <section className="bg-white/5 p-6 rounded-2xl border border-amber-950/10 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <ScrollText size={22} className="text-amber-900" />
          <h3 className="text-lg rpg-font font-black uppercase tracking-widest text-amber-950">Доступные Испытания</h3>
        </div>
        
        {filteredAvailable.length === 0 ? (
          <div className="bg-amber-950/5 border-2 border-dashed border-amber-950/10 rounded-2xl py-16 text-center shadow-inner">
            <p className="text-amber-900/30 quote-font italic">На доске объявлений пока пусто...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAvailable.map(c => (
              <ChallengeCard key={c.id} challenge={c} onAccept={onAccept} onClaim={onClaim} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ChallengesPage;