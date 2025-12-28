import React, { useState } from 'react';
import { UserProfile, Category } from '../types';
import { Swords, Brain, Heart, Briefcase, Sparkles, User, Calendar, ChevronRight, Info } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const CHARACTER_CLASSES = [
  {
    id: 'warrior',
    name: 'Поборник',
    description: 'Мастер физической силы и выносливости. Твой путь — преодоление пределов тела.',
    tooltip: 'Этот путь для тех, кто закаляет тело сталью и потом. Основной фокус на физической форме.',
    icon: Swords,
    category: Category.PHYSICAL,
    color: 'border-red-800 text-red-900 bg-red-100/50'
  },
  {
    id: 'scholar',
    name: 'Мастер Свитков',
    description: 'Искатель знаний и логики. Твой разум — твой самый острый клинок.',
    tooltip: 'Для искателей истины, чья сила — в знаниях и логике. Развивает интеллектуальные способности.',
    icon: Brain,
    category: Category.INTELLECT,
    color: 'border-amber-800 text-amber-900 bg-amber-100/50'
  },
  {
    id: 'stoic',
    name: 'Хранитель Жизни',
    description: 'Пример баланса и долголетия. Здоровье и дух — твои главные сокровища.',
    tooltip: 'Для тех, кто ценит баланс и крепость духа. Упор на долголетие и ментальное равновесие.',
    icon: Heart,
    category: Category.HEALTH,
    color: 'border-emerald-800 text-emerald-900 bg-emerald-100/50'
  },
  {
    id: 'artisan',
    name: 'Артефактор',
    description: 'Мастер своего дела. Твое ремесло превращает обыденность в величие.',
    tooltip: 'Для творцов и мастеров, меняющих мир своим трудом. Сосредоточено на профессиональном росте.',
    icon: Briefcase,
    category: Category.PROFESSIONAL,
    color: 'border-blue-800 text-blue-900 bg-blue-100/50'
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && name.trim() && age) {
      setStep(2);
    } else if (step === 2 && selectedClassId) {
      const charClass = CHARACTER_CLASSES.find(c => c.id === selectedClassId);
      onComplete({
        name,
        age: parseInt(age),
        characterClassId: selectedClassId,
        characterClassName: charClass?.name || 'Герой'
      });
    }
  };

  const Tooltip = ({ text }: { text: string }) => (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#fdf2d9] border border-amber-900/30 rounded shadow-xl text-[10px] leading-tight text-amber-900 font-medium italic opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#fdf2d9]"></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/10 p-4 md:p-8">
      {/* Scroll Panel Effect */}
      <div className="relative w-full max-w-2xl bg-[#fdf2d9] border-4 border-amber-900/30 rounded-lg shadow-2xl p-6 md:p-10 overflow-y-auto max-h-[95vh] custom-scrollbar scroll-container">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-amber-800' : 'bg-amber-900/10'}`}></div>
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-amber-800' : 'bg-amber-900/10'}`}></div>
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 bg-amber-900/5 rounded-full border-2 border-amber-800 flex items-center justify-center mb-4 shadow-sm overflow-hidden relative group">
                <div className="absolute inset-0 bg-amber-800/10 animate-pulse group-hover:bg-amber-800/20 transition-all"></div>
                <User size={48} className="text-amber-800 relative z-10" />
              </div>
              <h2 className="text-3xl rpg-font text-amber-900 mb-2 uppercase tracking-widest font-black">ПРИВЕТСТВИЕ ОРАКУЛА</h2>
              <p className="text-stone-700 quote-font italic text-2xl leading-relaxed">
                "Путник, ты переступил порог Храма Дисциплины. Прежде чем ты начнешь свой великий поход, назовись. Кто ты и как долго ты уже топчешь эту землю?"
              </p>
            </div>

            <div className="space-y-6 max-w-sm mx-auto">
              <div className="relative group">
                <label className="text-[10px] text-amber-800 uppercase font-black tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                  Имя Героя <Info size={12} className="opacity-50" />
                </label>
                <Tooltip text="Твое имя станет легендой в мире Дисциплины и будет вписано в Летописи Славы." />
                <div className="flex items-center">
                  <User className="absolute left-3 text-amber-900/40" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Напр. Арагорн"
                    className="w-full bg-white/50 border-2 border-amber-900/10 rounded px-10 py-3 text-amber-900 focus:border-amber-800 outline-none transition-all placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-[10px] text-amber-800 uppercase font-black tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                  Зим прожито (Возраст) <Info size={12} className="opacity-50" />
                </label>
                <Tooltip text="Возраст — это не просто число, а мера твоей накопленной воли и начального опыта." />
                <div className="flex items-center">
                  <Calendar className="absolute left-3 text-amber-900/40" size={18} />
                  <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="w-full bg-white/50 border-2 border-amber-900/10 rounded px-10 py-3 text-amber-900 focus:border-amber-800 outline-none transition-all placeholder:text-stone-400"
                  />
                </div>
              </div>

              <button 
                onClick={handleNext}
                disabled={!name.trim() || !age}
                className={`w-full py-4 rounded font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${name.trim() && age ? 'bg-amber-900 hover:bg-amber-800 text-white' : 'bg-amber-900/20 text-stone-400 cursor-not-allowed'}`}
              >
                Продолжить путь <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl rpg-font text-amber-900 mb-2 uppercase tracking-widest font-black">ВЫБЕРИ СВОЙ КЛАСС</h2>
              <p className="text-stone-700 quote-font italic text-2xl leading-relaxed">
                "Каждый герой начинает с искры, но лишь ты выбираешь, во что она превратится. Какой из путей тебе ближе?"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {CHARACTER_CLASSES.map((cls) => {
                const Icon = cls.icon;
                const isSelected = selectedClassId === cls.id;
                return (
                  <div 
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center text-center group ${isSelected ? `${cls.color} border-amber-800 ring-2 ring-amber-800/20 shadow-md` : 'border-amber-900/10 bg-white/30 hover:border-amber-800/40 hover:bg-white/50'}`}
                  >
                    <Tooltip text={cls.tooltip} />
                    <div className={`p-3 rounded-full mb-3 border ${isSelected ? 'bg-amber-900/10' : 'bg-amber-900/5 border-amber-900/10 group-hover:border-amber-900/30'}`}>
                      <Icon size={24} className={isSelected ? 'text-amber-900' : 'text-amber-900/60'} />
                    </div>
                    <h3 className="text-lg rpg-font font-bold mb-1 uppercase tracking-wider text-amber-900">{cls.name}</h3>
                    <p className="text-[11px] leading-relaxed text-stone-600 font-medium">{cls.description}</p>
                    <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      <Info size={14} className="text-amber-900" />
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={handleNext}
              disabled={!selectedClassId}
              className={`w-full py-4 rounded font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${selectedClassId ? 'bg-amber-900 hover:bg-amber-800 text-white' : 'bg-amber-900/20 text-stone-400 cursor-not-allowed'}`}
            >
              Вступить в игру <Sparkles size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;