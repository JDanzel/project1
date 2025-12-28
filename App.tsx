
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PREDEFINED_TASKS, PREDEFINED_CHALLENGES, XP_PER_TASK, XP_TO_LEVEL_UP, XP_RATES, TASK_PENALTIES, DEFAULT_PENALTY, LEVEL_RANKS, SPECIALIZATIONS } from './constants';
import { Task, DayLog, UserStats, Category, TaskType, Difficulty, TaskStage, Challenge, UserProfile } from './types';
import WeekView from './components/WeekView';
import StatRadar from './components/StatRadar';
import ProgressHistoryChart from './components/ProgressHistoryChart';
import PomodoroPage from './components/PomodoroPage';
import ProjectsPage from './components/ProjectsPage';
import ChallengesPage from './components/ChallengesPage';
import Onboarding from './components/Onboarding';
import { generateOracleAdvice } from './services/geminiService';
import { 
  Castle, 
  Sparkles, 
  ScrollText, 
  Trophy, 
  Crown, 
  X, 
  ShieldCheck, 
  Sword, 
  Library, 
  Quote,
  Map as MapIcon,
  Flame,
  ShieldHalf,
  Star,
  Zap
} from 'lucide-react';

type View = 'dashboard' | 'challenges' | 'pomodoro' | 'projects';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('lifeRPG_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasksRaw = localStorage.getItem('lifeRPG_tasks');
    if (savedTasksRaw) {
        const savedTasks = JSON.parse(savedTasksRaw) as Task[];
        const customTasks = savedTasks.filter(t => t.isCustom);
        // Combine predefined with stored custom ones
        const predefinedIds = new Set(PREDEFINED_TASKS.map(pt => pt.id));
        const filteredCustom = customTasks.filter(ct => !predefinedIds.has(ct.id));
        return [...PREDEFINED_TASKS, ...filteredCustom];
    }
    return PREDEFINED_TASKS;
  });

  const [logs, setLogs] = useState<DayLog[]>(() => {
    const savedLogs = localStorage.getItem('lifeRPG_logs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const savedChallenges = localStorage.getItem('lifeRPG_challenges');
    if (savedChallenges) {
        const parsed = JSON.parse(savedChallenges) as Challenge[];
        const existingIds = new Set(parsed.map(c => c.id));
        const newChallenges = PREDEFINED_CHALLENGES.filter(c => !existingIds.has(c.id));
        return [...parsed, ...newChallenges];
    }
    return PREDEFINED_CHALLENGES;
  });

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [oracleMessage, setOracleMessage] = useState<string>("Приветствую, герой. Твой путь начинается.");
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('lifeRPG_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lifeRPG_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('lifeRPG_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('lifeRPG_profile', JSON.stringify(profile));
    }
  }, [profile]);

  const stats: UserStats = useMemo(() => {
    const newStats: UserStats = {
      level: 1,
      xp: 0,
      [Category.PHYSICAL]: 0,
      [Category.INTELLECT]: 0,
      [Category.HEALTH]: 0,
      [Category.PROFESSIONAL]: 0,
    };

    logs.forEach(log => {
      log.completedTaskIds.forEach(id => {
        // Find task or stage
        let task = tasks.find(t => t.id === id);
        let difficulty = task?.difficulty;

        // If not found directly, it might be a stage ID
        if (!task) {
           for (const t of tasks) {
              const stage = t.stages?.find(s => s.id === id);
              if (stage) {
                 task = t;
                 difficulty = stage.difficulty;
                 break;
              }
           }
        }

        if (task) {
          if (task.type === TaskType.NEGATIVE) {
            const penalty = TASK_PENALTIES[task.id] || DEFAULT_PENALTY;
            newStats.xp -= penalty;
            task.affectedCategories.forEach(cat => {
                newStats[cat] = Math.max(0, newStats[cat] - 5);
            });
          } else {
            const taskXP = difficulty ? XP_RATES[difficulty] : XP_PER_TASK;
            newStats.xp += taskXP;
            task.affectedCategories.forEach(cat => {
              newStats[cat] += 5;
            });
          }
        }
      });
    });

    const calculatedLevel = 1 + Math.floor(Math.max(0, newStats.xp) / XP_TO_LEVEL_UP);
    newStats.level = Math.max(1, calculatedLevel);
    
    return newStats;
  }, [logs, tasks]);

  const titleInfo = useMemo(() => {
    const rankInfo = [...LEVEL_RANKS].reverse().find(r => stats.level >= r.minLevel) || LEVEL_RANKS[0];
    const cats = [
        { id: Category.PHYSICAL, val: stats[Category.PHYSICAL] },
        { id: Category.INTELLECT, val: stats[Category.INTELLECT] },
        { id: Category.HEALTH, val: stats[Category.HEALTH] },
        { id: Category.PROFESSIONAL, val: stats[Category.PROFESSIONAL] },
    ];
    const dominant = cats.reduce((prev, curr) => (curr.val > prev.val ? curr : prev));
    const isBalanced = cats.every(c => Math.abs(c.val - dominant.val) < 15);
    const spec = isBalanced ? SPECIALIZATIONS.BALANCED : SPECIALIZATIONS[dominant.id as Category];
    
    return {
        full: `${rankInfo.title} ${spec.name}`,
        rank: rankInfo.title,
        spec: spec.name,
        color: spec.color,
        rankColor: rankInfo.color
    };
  }, [stats]);

  const prevLevelRef = useRef(stats.level);
  useEffect(() => {
    if (stats.level > prevLevelRef.current) {
        setShowLevelUpModal(true);
    }
    prevLevelRef.current = stats.level;
  }, [stats.level]);

  const handleToggleTask = (date: string, taskId: string) => {
    setLogs(prevLogs => {
      const existingLogIndex = prevLogs.findIndex(l => l.date === date);
      const newLogs = [...prevLogs];
      if (existingLogIndex >= 0) {
        const log = { ...newLogs[existingLogIndex] };
        if (log.completedTaskIds.includes(taskId)) {
          log.completedTaskIds = log.completedTaskIds.filter(id => id !== taskId);
        } else {
          log.completedTaskIds = [...log.completedTaskIds, taskId];
        }
        newLogs[existingLogIndex] = log;
      } else {
        newLogs.push({ date, completedTaskIds: [taskId] });
      }
      return newLogs;
    });
  };

  const handleAddTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    // Also cleanup logs for this task ID if needed (optional but cleaner)
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const handleCompleteTaskFromTimer = (taskId: string, specificDate?: string) => {
    const date = specificDate || new Date().toISOString().split('T')[0];
    handleToggleTask(date, taskId);
  };

  const handleAddProject = (name: string) => {
      const newProject: Task = {
          id: `proj_${Date.now()}`,
          name: name,
          type: TaskType.TEMPORARY,
          affectedCategories: [Category.PROFESSIONAL],
          isCustom: true,
          difficulty: Difficulty.MEDIUM,
          stages: []
      };
      setTasks(prev => [...prev, newProject]);
  };

  const handleDeleteProject = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleUpdateProject = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const handleAddStage = (taskId: string, stageData: Omit<TaskStage, 'id'>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newStage: TaskStage = {
          ...stageData,
          id: `stage_${Date.now()}`
        };
        return { ...t, stages: [...(t.stages || []), newStage] };
      }
      return t;
    }));
  };

  const handleDeleteStage = (taskId: string, stageId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, stages: (t.stages || []).filter(s => s.id !== stageId) };
      }
      return t;
    }));
  };

  const handleUpdateStage = (taskId: string, stageId: string, updates: Partial<TaskStage>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          stages: (t.stages || []).map(s => s.id === stageId ? { ...s, ...updates } : s)
        };
      }
      return t;
    }));
  };

  const handleAcceptChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'active', startDate: new Date().toISOString() } : c
    ));
  };

  const handleClaimChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'completed' } : c
    ));
  };

  const handleConsultOracle = async () => {
    if (!profile) return;
    setIsOracleLoading(true);
    const advice = await generateOracleAdvice(stats, profile);
    setOracleMessage(advice);
    setIsOracleLoading(false);
  };

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setOracleMessage(`Приветствую тебя, ${newProfile.name} из касты ${newProfile.characterClassName}! Твоя история в мире Дисциплины начинается сегодня.`);
  };

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen pb-24 bg-transparent text-[#2c1810] relative overflow-x-hidden">
      
      {/* Level Up Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
               <div className="w-[1200px] h-[1200px] bg-[radial-gradient(circle,rgba(217,119,6,0.3)_0%,transparent_70%)] opacity-50 animate-rays" />
            </div>

            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute animate-float-up text-amber-500"
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `${100 + Math.random() * 20}%`, 
                    animationDelay: `${Math.random() * 5}s`,
                    opacity: 0
                  }}
                >
                  {i % 2 === 0 ? <Star size={Math.random() * 15 + 5} fill="currentColor" /> : <Sparkles size={Math.random() * 15 + 5} />}
                </div>
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-6 animate-in zoom-in-90 duration-700 bg-[#f4e4bc] p-12 rounded-2xl border-4 border-amber-950 shadow-[0_0_50px_rgba(120,53,15,0.5)]">
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center justify-center">
                   <div className="relative">
                      <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-40 animate-pulse-gold scale-150" />
                      <div className="bg-amber-950 p-6 rounded-full border-4 border-[#f4e4bc] shadow-2xl relative z-10 animate-bounce">
                          <Crown size={80} className="text-[#f4e4bc]" />
                      </div>
                      <Sparkles className="absolute -top-4 -right-4 text-amber-600 animate-pulse" size={32} />
                      <Sparkles className="absolute -bottom-4 -left-4 text-amber-700 animate-pulse" style={{ animationDelay: '1s' }} size={24} />
                   </div>
                </div>

                <div className="mt-12 w-full">
                    <h2 className="text-5xl rpg-font font-black text-[#2c1810] mb-2 tracking-tighter uppercase drop-shadow-sm">НОВЫЙ ТИТУЛ</h2>
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-950/20 to-transparent mb-6" />
                    
                    <div className="relative inline-block px-8 py-4 mb-10">
                        <div className="absolute inset-0 bg-amber-900/5 rounded-xl border border-amber-900/10 rotate-1" />
                        <div className={`text-3xl rpg-font font-black relative z-10 ${titleInfo.color} drop-shadow-[1px_1px_rgba(255,255,255,0.5)]`}>
                            {titleInfo.full}
                        </div>
                        <div className="absolute -top-2 -left-2"><Zap className="text-amber-600/40" size={20} /></div>
                        <div className="absolute -bottom-2 -right-2"><Zap className="text-amber-600/40" size={20} /></div>
                    </div>

                    <p className="text-amber-900/60 quote-font italic mb-10 text-xl leading-relaxed">
                        Твои свершения эхом разносятся по всему королевству. Твой путь продолжается!
                    </p>

                    <button 
                      onClick={() => setShowLevelUpModal(false)} 
                      className="group relative bg-amber-950 hover:bg-amber-900 text-white px-16 py-5 rounded-xl font-black uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(62,39,35,0.3)] hover:shadow-[0_15px_40px_rgba(62,39,35,0.5)] active:scale-95 overflow-hidden"
                    >
                        <span className="relative z-10">Продолжить</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* FIXED HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#f4e4bc] border-b-2 border-amber-950/20 shadow-[0_4px_10px_rgba(0,0,0,0.1)] py-3 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
             <div className="relative bg-[#3e2723] p-1.5 rounded-lg border border-amber-800/40 shadow-sm transition-transform group-hover:scale-105">
                <div className="relative w-7 h-7 flex items-center justify-center">
                    <ShieldHalf className="text-stone-300 absolute inset-0 w-full h-full opacity-30" />
                    <Sword className="text-white absolute w-4 h-4 -rotate-45 z-10" />
                    <Flame className="text-amber-400 absolute bottom-0 w-3 h-3 animate-pulse z-20" />
                </div>
             </div>
             
             <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black rpg-font text-amber-950 tracking-tighter uppercase leading-none">Discipline</span>
                  <span className="text-xl font-black rpg-font text-amber-800 tracking-tight leading-none">Hero</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="text-[8px] font-black uppercase tracking-[0.2em] flex gap-1.5 items-center">
                        <span className={`${titleInfo.rankColor}`}>{titleInfo.rank}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-amber-800/40"></span>
                        <span className={`${titleInfo.color}`}>{titleInfo.spec}</span>
                    </div>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex flex-col items-end text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-amber-950 font-black uppercase tracking-widest leading-none">
                      {profile.name} <span className="text-amber-800 ml-1">Lvl {stats.level}</span>
                    </span>
                  </div>
                  <div className="w-24 sm:w-40 h-2 bg-amber-900/10 rounded-full mt-1.5 overflow-hidden border border-amber-900/20 shadow-inner p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-800 to-amber-600 rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${Math.max(0, (stats.xp % XP_TO_LEVEL_UP) / XP_TO_LEVEL_UP * 100)}%` }} 
                      />
                  </div>
              </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 pt-24 md:pt-28 relative z-10">
        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Oracle Wisdom */}
            <div className="relative group overflow-hidden rounded-lg border border-amber-900/10 bg-[#fdf2d9]/60 p-6 shadow-sm backdrop-blur-sm">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-amber-950 text-xs font-bold uppercase tracking-[0.2em] rpg-font flex items-center gap-2">
                            <Library size={16} /> Мудрость Оракула
                        </h3>
                    </div>
                    <div className="relative px-2">
                        <Quote className="absolute -top-2 -left-2 text-amber-900 opacity-10" size={36} />
                        <p className="relative z-10 text-lg md:text-xl quote-font italic leading-relaxed text-[#2c1810]">
                            {oracleMessage}
                        </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-amber-900/10 flex items-center justify-between">
                        <button 
                            onClick={handleConsultOracle} 
                            disabled={isOracleLoading} 
                            className="text-xs text-amber-950 hover:text-amber-700 flex items-center gap-2 transition-colors font-bold uppercase tracking-wider"
                        >
                            {isOracleLoading ? <Sparkles className="animate-spin w-3 h-3" /> : <ScrollText className="w-3 h-3" />}
                            {isOracleLoading ? 'Спрашиваю...' : 'Новый совет'}
                        </button>
                        <span className="text-[9px] text-amber-900/40 font-bold uppercase tracking-widest italic">Шепот веков</span>
                    </div>
                </div>
            </div>

            <StatRadar stats={stats} />

            <div className="bg-[#fdf2d9]/40 p-6 rounded-lg border border-amber-900/10 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Sword className="text-amber-900/60" size={24} />
                    <h2 className="text-2xl rpg-font text-amber-950 uppercase tracking-wide">Летопись Подвигов</h2>
                </div>
                <WeekView 
                  tasks={tasks} 
                  logs={logs} 
                  onToggleTask={handleToggleTask} 
                  onAddTask={handleAddTask} 
                  onDeleteTask={handleDeleteTask} 
                  onUpdateTask={handleUpdateTask} 
                />
            </div>

            <ProgressHistoryChart tasks={tasks} logs={logs} />
          </div>
        )}

        {currentView === 'challenges' && (
          <div className="bg-[#fdf2d9]/40 p-6 rounded-xl border border-amber-900/10 shadow-sm backdrop-blur-sm">
             <ChallengesPage challenges={challenges} onAccept={handleAcceptChallenge} onClaim={handleClaimChallenge} />
          </div>
        )}

        {currentView === 'pomodoro' && (
           <div className="bg-[#fdf2d9]/40 p-6 rounded-xl border border-amber-900/10 shadow-sm backdrop-blur-sm">
             <PomodoroPage tasks={tasks} onCompleteTask={handleCompleteTaskFromTimer} onBack={() => setCurrentView('dashboard')} />
           </div>
        )}

        {currentView === 'projects' && (
           <div className="bg-[#fdf2d9]/40 p-6 rounded-xl border border-amber-900/10 shadow-sm backdrop-blur-sm">
              <ProjectsPage 
                tasks={tasks} 
                logs={logs} 
                onAddProject={handleAddProject} 
                onDeleteProject={handleDeleteProject} 
                onUpdateProject={handleUpdateProject}
                onAddStage={handleAddStage} 
                onDeleteStage={handleDeleteStage} 
                onUpdateStage={handleUpdateStage} 
              />
           </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#e8d2ac]/90 backdrop-blur-lg border-t border-amber-900/20 z-40 pb-safe shadow-lg">
        <div className="flex justify-around items-center p-2 max-w-2xl mx-auto">
            <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center gap-1 p-2 w-full transition-all duration-300 ${currentView === 'dashboard' ? 'text-amber-900 scale-110 drop-shadow-[0_0_5px_rgba(120,53,15,0.2)]' : 'text-amber-900/40 hover:text-amber-900'}`}>
                <Castle size={22} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Зал</span>
            </button>
            <button onClick={() => setCurrentView('challenges')} className={`flex flex-col items-center gap-1 p-2 w-full transition-all duration-300 ${currentView === 'challenges' ? 'text-amber-900 scale-110 drop-shadow-[0_0_5px_rgba(120,53,15,0.2)]' : 'text-amber-900/40 hover:text-amber-900'}`}>
                <ShieldCheck size={22} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Испытания</span>
            </button>
            <button onClick={() => setCurrentView('pomodoro')} className={`flex flex-col items-center gap-1 p-2 w-full transition-all duration-300 ${currentView === 'pomodoro' ? 'text-amber-900 scale-110 drop-shadow-[0_0_5px_rgba(120,53,15,0.2)]' : 'text-amber-900/40 hover:text-amber-900'}`}>
                <Flame size={22} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Квесты</span>
            </button>
            <button onClick={() => setCurrentView('projects')} className={`flex flex-col items-center gap-1 p-2 w-full transition-all duration-300 ${currentView === 'projects' ? 'text-amber-900 scale-110 drop-shadow-[0_0_5px_rgba(120,53,15,0.2)]' : 'text-amber-900/40 hover:text-amber-900'}`}>
                <MapIcon size={22} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Кампании</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
