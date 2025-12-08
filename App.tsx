import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PREDEFINED_TASKS, XP_PER_TASK, XP_TO_LEVEL_UP, XP_RATES, TASK_PENALTIES, DEFAULT_PENALTY } from './constants';
import { Task, DayLog, UserStats, Category, TaskType, Difficulty } from './types';
import WeekView from './components/WeekView';
import StatRadar from './components/StatRadar';
import ProgressHistoryChart from './components/ProgressHistoryChart';
import { generateOracleAdvice } from './services/geminiService';
import { Brain, Sparkles, ScrollText, Trophy, Crown, X } from 'lucide-react';

const App: React.FC = () => {
  // State with Lazy Initialization to prevent initial render "flicker" of levels
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasksRaw = localStorage.getItem('lifeRPG_tasks');
    if (savedTasksRaw) {
        const savedTasks = JSON.parse(savedTasksRaw) as Task[];
        
        // Merge strategy:
        // 1. Keep custom tasks from storage.
        // 2. For predefined tasks, ignore storage properties (like categories) and use the latest code definition,
        //    but respect if they were deleted (if we supported deletion of predefined tasks, which we don't really here yet).
        // 3. Add any new predefined tasks.
        
        const customTasks = savedTasks.filter(t => t.isCustom);
        
        // Return latest definitions of predefined tasks + saved custom tasks
        // This ensures updates to "Sugar" categories in constants.ts are reflected immediately
        return [...PREDEFINED_TASKS, ...customTasks];
    }
    return PREDEFINED_TASKS;
  });

  const [logs, setLogs] = useState<DayLog[]>(() => {
    const savedLogs = localStorage.getItem('lifeRPG_logs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  const [oracleMessage, setOracleMessage] = useState<string>("Приветствую, герой. Твой путь начинается.");
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  
  // Level Up State
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<number>(1);

  // Persistence
  useEffect(() => {
    localStorage.setItem('lifeRPG_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lifeRPG_logs', JSON.stringify(logs));
  }, [logs]);

  // Derived Stats Calculation
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
      log.completedTaskIds.forEach(taskId => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          if (task.type === TaskType.NEGATIVE) {
            // Apply Specific Penalty
            const penalty = TASK_PENALTIES[task.id] || DEFAULT_PENALTY;
            newStats.xp -= penalty;
            
            // Reduce attribute points
            task.affectedCategories.forEach(cat => {
                newStats[cat] = Math.max(0, newStats[cat] - 5); // Reduce stats but not below 0 locally
            });
          } else {
            // Apply Reward
            const taskXP = task.difficulty ? XP_RATES[task.difficulty] : XP_PER_TASK;
            newStats.xp += taskXP;
            
            // Add Stats
            task.affectedCategories.forEach(cat => {
              newStats[cat] += 5; // Base points per task completion for the category
            });
          }
        }
      });
    });

    // Calculate Level
    const calculatedLevel = 1 + Math.floor(Math.max(0, newStats.xp) / XP_TO_LEVEL_UP);
    newStats.level = Math.max(1, calculatedLevel);
    
    return newStats;
  }, [logs, tasks]);

  // Level Up Detection
  const prevLevelRef = useRef(stats.level);

  useEffect(() => {
    if (stats.level > prevLevelRef.current) {
        setLevelUpData(stats.level);
        setShowLevelUpModal(true);
        // Play sound here if desired in future
    }
    prevLevelRef.current = stats.level;
  }, [stats.level]);

  // Handlers
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
        newLogs.push({
          date,
          completedTaskIds: [taskId]
        });
      }
      return newLogs;
    });
  };

  const handleAddCustomTask = (taskName: string, difficulty: Difficulty = Difficulty.MEDIUM) => {
    const newTask: Task = {
      id: `custom_${Date.now()}`,
      name: taskName,
      type: TaskType.TEMPORARY,
      affectedCategories: [Category.PROFESSIONAL], // Custom tasks map to Professional
      isCustom: true,
      difficulty: difficulty
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const handleDeleteTask = (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleConsultOracle = async () => {
    setIsOracleLoading(true);
    const advice = await generateOracleAdvice(stats);
    setOracleMessage(advice);
    setIsOracleLoading(false);
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-950 text-slate-100 relative">
      
      {/* Level Up Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-slate-900 border-2 border-amber-500/50 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.3)] transform animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Background Rays Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="inline-block p-4 rounded-full bg-slate-800 border border-amber-500/30 mb-6 shadow-xl relative group">
                         <div className="absolute inset-0 bg-amber-400 blur opacity-20 group-hover:opacity-40 transition-opacity rounded-full animate-pulse"></div>
                         <Crown size={48} className="text-amber-400 relative z-10" />
                    </div>
                    
                    <h2 className="text-4xl rpg-font text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 font-bold mb-2 drop-shadow-sm">
                        НОВЫЙ УРОВЕНЬ!
                    </h2>
                    
                    <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                        Поздравляем! Вы достигли уровня <span className="text-amber-400 font-bold text-2xl">{levelUpData}</span>. 
                        Ваши навыки растут, а легенда о вас ширится.
                    </p>
                    
                    <button 
                        onClick={() => setShowLevelUpModal(false)}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-amber-900/40 transition-all transform hover:scale-105 active:scale-95 w-full uppercase tracking-wider"
                    >
                        Продолжить Путь
                    </button>
                </div>

                <button 
                    onClick={() => setShowLevelUpModal(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
      )}

      {/* Top Navigation / Branding */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-lg shadow-black/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-inner">
                <Brain className="text-white w-6 h-6" />
             </div>
             <div>
                <h1 className="text-xl font-bold rpg-font bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    LifeRPG
                </h1>
                <p className="text-xs text-slate-500">Система развития персонажа</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Уровень {stats.level}</span>
                  <div className="w-32 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-500" 
                        style={{ width: `${Math.max(0, (stats.xp % XP_TO_LEVEL_UP) / XP_TO_LEVEL_UP * 100)}%` }} 
                      />
                  </div>
              </div>
              <button 
                onClick={handleConsultOracle}
                disabled={isOracleLoading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
              >
                 {isOracleLoading ? <Sparkles className="animate-spin w-4 h-4" /> : <ScrollText className="w-4 h-4" />}
                 <span className="hidden sm:inline">Спросить Оракула</span>
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stats & Profile */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Oracle Message */}
            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={64} />
                </div>
                <h3 className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Brain size={14} /> Мудрость Оракула
                </h3>
                <p className="text-slate-300 italic font-medium leading-relaxed">
                    "{oracleMessage}"
                </p>
            </div>

            {/* Radar Chart */}
            <StatRadar stats={stats} />

            {/* Simple Text Stats Summary */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase">Физическая</div>
                    <div className="text-xl font-bold text-indigo-400">{stats[Category.PHYSICAL]}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase">Интеллект</div>
                    <div className="text-xl font-bold text-purple-400">{stats[Category.INTELLECT]}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase">Здоровье</div>
                    <div className="text-xl font-bold text-emerald-400">{stats[Category.HEALTH]}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase">Профессия</div>
                    <div className="text-xl font-bold text-amber-400">{stats[Category.PROFESSIONAL]}</div>
                </div>
            </div>
            
            <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg flex items-center gap-3">
                <Trophy className="text-amber-500" />
                <div>
                    <h4 className="text-amber-200 font-bold text-sm">Текущая Цель</h4>
                    <p className="text-amber-200/60 text-xs">Достигните 50 очков в категории "Профессия", чтобы разблокировать новый ранг.</p>
                </div>
            </div>
        </div>

        {/* Right Column: Task Board */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <h2 className="text-2xl rpg-font text-white mb-6 border-b border-slate-700 pb-2">
                    Журнал Задач
                </h2>
                <WeekView 
                    tasks={tasks} 
                    logs={logs}
                    onToggleTask={handleToggleTask}
                    onAddTask={handleAddCustomTask}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTask={handleUpdateTask}
                />
            </div>

            {/* New Strategic Progress Chart */}
            <ProgressHistoryChart tasks={tasks} logs={logs} />
        </div>
      </main>

    </div>
  );
};

export default App;