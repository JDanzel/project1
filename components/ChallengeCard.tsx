import React, { useState } from 'react';
import { Challenge } from '../types';
import { Scroll, Sword, Shield, CheckCircle, X } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept: (id: string) => void;
  onClaim: (id: string) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onAccept, onClaim }) => {
  const [showModal, setShowModal] = useState(false);

  const getIcon = () => {
    if (challenge.type === 'avoidance') return <Shield className="text-emerald-700" size={24} />;
    return <Sword className="text-amber-800" size={24} />;
  };

  const progressPercent = Math.min(100, Math.round((challenge.progress / challenge.durationDays) * 100));

  return (
    <>
      {/* Widget / Small Card */}
      <div 
        onClick={() => setShowModal(true)}
        className="bg-white/10 border border-amber-900/20 rounded-xl p-4 cursor-pointer hover:border-amber-700/50 transition-all group relative overflow-hidden backdrop-blur-sm shadow-md"
      >
        {/* Background glow for active quests */}
        {challenge.status === 'active' && (
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        
        <div className="flex items-start gap-3 relative z-10">
          <div className="bg-[#fdf2d9]/60 p-2 rounded-lg border border-amber-900/10 group-hover:border-amber-900/30 transition-colors">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-950 leading-tight mb-1 uppercase tracking-tighter">{challenge.title}</h4>
            
            {challenge.status === 'available' && (
               <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider animate-pulse italic">Доступен свиток!</p>
            )}

            {challenge.status === 'active' && (
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-amber-900/60 font-bold mb-1">
                    <span>Прогресс</span>
                    <span>{challenge.progress} / {challenge.durationDays} дн.</span>
                </div>
                <div className="h-1.5 w-full bg-amber-950/20 rounded-full overflow-hidden border border-amber-950/10 shadow-inner">
                    <div className="h-full bg-amber-800 transition-all duration-500 shadow-[0_0_8px_rgba(146,64,14,0.3)]" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}

            {challenge.status === 'completed' && (
                <div className="mt-1 text-emerald-800 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle size={10} /> Подвиг совершен!
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal - Centered and Top Layer */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
          <div 
            className="bg-[#e8d2ac] border-4 border-amber-950 p-8 rounded-2xl max-w-md w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-all scale-100 animate-in zoom-in-95" 
            onClick={(e) => e.stopPropagation()}
          >
             <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-amber-950/40 hover:text-amber-950 transition-colors p-1">
                <X size={24} />
             </button>

             <div className="flex flex-col items-center text-center mb-6">
                <div className="p-5 bg-white/20 rounded-full border-2 border-amber-950/20 mb-5 shadow-inner">
                    <div className="bg-amber-100/50 p-2 rounded-full border border-amber-950/10">
                        {challenge.type === 'avoidance' ? <Shield size={48} className="text-emerald-800" /> : <Scroll size={48} className="text-amber-800" />}
                    </div>
                </div>
                <h3 className="text-3xl rpg-font text-amber-950 mb-3 uppercase font-black tracking-tight">{challenge.title}</h3>
                <p className="text-amber-900/80 quote-font italic leading-relaxed text-lg">{challenge.description}</p>
             </div>

             <div className="bg-amber-900/10 p-5 rounded-xl border border-amber-950/20 mb-8 flex justify-between items-center shadow-inner">
                <div className="text-[11px] text-amber-950/50 uppercase font-black tracking-widest">ДАР ОРАКУЛА</div>
                <div className="text-amber-900 font-black text-2xl drop-shadow-sm">+{challenge.rewardXP} XP</div>
             </div>

             {challenge.status === 'available' && (
                <button 
                    onClick={() => { onAccept(challenge.id); setShowModal(false); }}
                    className="w-full bg-amber-950 hover:bg-amber-900 text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-amber-500/20 active:scale-95"
                >
                    Принять Испытание
                </button>
             )}

             {challenge.status === 'active' && (
                 <div className="text-center">
                    <p className="text-amber-900/60 text-sm mb-5 font-black uppercase tracking-widest">Испытание в процессе. Не отступай!</p>
                    <button 
                        onClick={() => setShowModal(false)}
                        className="w-full bg-white/30 hover:bg-white/50 text-amber-950 font-black py-3 rounded-xl uppercase tracking-widest text-xs border-2 border-amber-950/10 transition-all"
                    >
                        Закрыть
                    </button>
                 </div>
             )}

             {challenge.status === 'completed' && (
                <button 
                    onClick={() => { onClaim(challenge.id); setShowModal(false); }}
                    className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-emerald-500/20 animate-pulse"
                >
                    Забрать Награду
                </button>
             )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChallengeCard;