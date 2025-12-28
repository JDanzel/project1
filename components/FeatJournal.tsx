import React from 'react';
import { Challenge } from '../types';
import { Gift, Star, Scroll, Target } from 'lucide-react';

interface FeatJournalProps {
  challenges: Challenge[];
}

const FeatJournal: React.FC<FeatJournalProps> = ({ challenges = [] }) => {
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  const totalEarnedXP = completedChallenges.reduce((sum, c) => sum + c.rewardXP, 0);

  if (challenges.length === 0) return null;

  return (
    <div className="w-full bg-white/10 rounded-lg border border-amber-900/10 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Scroll size={24} className="text-amber-800/60" />
        <h3 className="text-xl rpg-font text-amber-950 uppercase tracking-wide">Журнал Подвигов</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-amber-900/5 rounded border border-amber-900/10 p-4 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
              <div className="bg-amber-900/10 p-2 rounded border border-amber-900/10">
                  <Gift className="text-amber-800" size={20} />
              </div>
              <div>
                  <div className="text-[10px] text-amber-900/60 uppercase font-black tracking-widest leading-none mb-1">Награды</div>
                  <div className="text-xs text-amber-900/80">Завершенные свитки</div>
              </div>
          </div>
          <div className="text-right">
              <div className="flex items-center gap-1 text-amber-900 font-black text-xl leading-none">
                  {totalEarnedXP}
                  <Star size={14} fill="currentColor" />
              </div>
          </div>
        </div>

        <div className="bg-amber-900/5 p-4 rounded border border-amber-900/10 flex flex-col justify-center text-center">
            <div className="text-2xl font-bold text-amber-950 leading-none mb-1">{activeChallenges.length}</div>
            <div className="text-[10px] text-amber-900/40 uppercase tracking-wider font-bold">Активные Свитки</div>
        </div>

        <div className="bg-amber-900/5 p-4 rounded border border-amber-900/10 flex flex-col justify-center text-center">
            <div className="text-2xl font-bold text-amber-700 leading-none mb-1">{completedChallenges.length}</div>
            <div className="text-[10px] text-amber-900/40 uppercase tracking-wider font-bold">Завершенные Подвиги</div>
        </div>
      </div>
    </div>
  );
};

export default FeatJournal;