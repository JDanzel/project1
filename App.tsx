import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PREDEFINED_TASKS, XP_PER_TASK, XP_TO_LEVEL_UP, XP_RATES, TASK_PENALTIES, DEFAULT_PENALTY } from './constants';
import { Task, DayLog, UserStats, Category, TaskType, Difficulty, TaskStage } from './types';
import WeekView from './components/WeekView';
import StatRadar from './components/StatRadar';
import ProgressHistoryChart from './components/ProgressHistoryChart';
import PomodoroPage from './components/PomodoroPage';
import ProjectsPage from './components/ProjectsPage';
import { generateOracleAdvice } from './services/geminiService';
import { Brain, Sparkles, ScrollText, Trophy, Crown, X, LayoutDashboard, Timer, Briefcase } from 'lucide-react';

type View = 'dashboard' | 'pomodoro' | 'projects';

const App: React.FC = () => {
  // State with Lazy Initialization
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasksRaw = localStorage.getItem('lifeRPG_tasks');
    if (savedTasksRaw) {
        const savedTasks = JSON.parse(savedTasksRaw) as Task[];
        // Merge saved tasks with predefined to ensure structure updates
        // Keep custom tasks
        const customTasks = savedTasks.filter(t => t.isCustom);
        // Ensure predefined tasks are up to date (e.g. new penalties) but allow overriding if needed? 
        // For simplicity, always use code-defined predefined tasks + saved custom tasks
        return [...PREDEFINED_TASKS, ...customTasks];
    }
    return PREDEFINED_TASKS;
  });

  const [logs, setLogs] = useState<DayLog[]>(() => {
    const savedLogs = localStorage.getItem('lifeRPG_logs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  const [currentView, setCurrentView] = useState<View>('dashboard');

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

    // Helper to find stage info if ID belongs to a stage
    const findStageInfo = (id: string): { stage: TaskStage, parentTask: Task } | null => {
        for (const task of tasks) {
            if (task.type === TaskType.TEMPORARY && task.stages) {
                const stage = task.stages.find(s => s.id === id);
                if (stage) return { stage, parentTask: task };
            }
        }
        return null;
    };

    logs.forEach(log => {
      log.completedTaskIds.forEach(id => {
        const task = tasks.find(t => t.id === id);
        
        if (task) {
          // It's a regular task
          if (task.type === TaskType.NEGATIVE) {
            const penalty = TASK_PENALTIES[task.id] || DEFAULT_PENALTY;
            newStats.xp -= penalty;
            task.affectedCategories.forEach(cat => {
                newStats[cat] = Math.max(0, newStats[cat] - 5);
            });
          } else {
            const taskXP = task.difficulty ? XP_RATES[task.difficulty] : XP_PER_TASK;
            newStats.xp += taskXP;
            task.affectedCategories.forEach(cat => {
              newStats[cat] += 5;
            });
          }
        } else {
            // Check if it's a Stage ID
            const stageInfo = findStageInfo(id);
            if (stageInfo) {
                const { stage, parentTask } = stageInfo;
                // Award XP based on Stage Difficulty
                newStats.xp += XP_RATES[stage.difficulty];
                // Award category points based on Parent Task categories
                parentTask.affectedCategories.forEach(cat => {
                    newStats[cat] += 5;
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
          // If toggling from dashboard, we remove it. 
          // Note: If called from timer to "Complete", we generally want to ADD only.
          // But using this logic handles both. For timer, we assume user hasn't done it yet today.
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

  const handleCompleteTaskFromTimer = (taskId: string, specificDate?: string) => {
    const date = specificDate || new Date().toISOString().split('T')[0];
    // Check if already completed to avoid toggling OFF
    const log = logs.find(l => l.date === date);
    if (log && log.completedTaskIds.includes(taskId)) {
        return; // Already done, don't toggle off
    }
    handleToggleTask(date, taskId);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const handleDeleteTask = (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Project Handlers
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

  const handleAddStage = (projectId: string, stageData: Omit<TaskStage, 'id'>) => {
      setTasks(prev => prev.map(t => {
          if (t.id === projectId) {
              const newStage: TaskStage = {
                  ...stageData,
                  id: `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              };
              return { ...t, stages: [...(t.stages || []), newStage] };
          }
          return t;
      }));
  };

  const handleUpdateStage = (projectId: string, stageId: string, updates: Partial<TaskStage>) => {
      setTasks(prev => prev.map(t => {
          if (t.id === projectId && t.stages) {
              return {
                  ...t,
                  stages: t.stages.map(s => s.id === stageId ? { ...s, ...updates } : s)
              };
          }
          return t;
      }));
  };

  const handleDeleteStage = (projectId: string, stageId: string) => {
      setTasks(prev => prev.map(t => {
          if (t.id === projectId) {
              return { ...t, stages: (t.stages || []).filter(s => s.id !== stageId) };
          }
          return t;
      }));
  };

  const handleConsultOracle = async () => {
    setIsOracleLoading(true);
    const advice = await generateOracleAdvice(stats);
    setOracleMessage(advice);
    setIsOracleLoading(false);
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-950 text-slate-100 relative">
      
      {/* Level Up Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-slate-900 border-2 border-amber-500/50 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.3)] transform animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <div className="inline-block p-4 rounded-full bg-slate-800 border border-amber-500/30 mb-6 shadow-xl relative group">
                         <Crown size={48} className="text-amber-400 relative z-10" />
                    </div>
                    <h2 className="text-4xl rpg-font text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 font-bold mb-2 drop-shadow-sm">
                        НОВЫЙ УРОВЕНЬ!
                    </h2>
                    <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                        Поздравляем! Вы достигли уровня <span className="text-amber-400 font-bold text-2xl">{levelUpData}</span>.
                    </p>
                    <button onClick={() => setShowLevelUpModal(false)} className="bg-amber-600 text-white px-8 py-3 rounded-lg font-bold w-full uppercase">
                        Продолжить Путь
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Brain className="text-white w-6 h-6" />
             </div>
             <h1 className="text-xl font-bold rpg-font bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                LifeRPG
             </h1>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Lvl {stats.level}</span>
                    <span className={`text-[10px] font-bold ${useMemo(() => {
                        const today = new Date().toISOString().split('T')[0];
                        const log = logs.find(l => l.date === today);
                        if (!log) return 'text-slate-600';
                        return 'text-emerald-400';
                    }, [logs])}`}>
                        {useMemo(() => {
                            const today = new Date().toISOString().split('T')[0];
                            const log = logs.find(l => l.date === today);
                            if (!log) return '+0 XP';
                            
                            // Calculate daily XP change
                            let dailyXP = 0;
                            log.completedTaskIds.forEach(id => {
                                // Is it a stage?
                                let task = tasks.find(t => t.id === id);
                                if (task) {
                                    if (task.type === TaskType.NEGATIVE) {
                                        dailyXP -= (TASK_PENALTIES[task.id] || DEFAULT_PENALTY);
                                    } else {
                                        dailyXP += task.difficulty ? XP_RATES[task.difficulty] : XP_PER_TASK;
                                    }
                                } else {
                                    // Try find stage
                                    for (const t of tasks) {
                                        const stage = t.stages?.find(s => s.id === id);
                                        if (stage) {
                                            dailyXP += XP_RATES[stage.difficulty];
                                            break;
                                        }
                                    }
                                }
                            });
                            return (dailyXP >= 0 ? '+' : '') + dailyXP + ' XP';
                        }, [logs, tasks])}
                    </span>
                  </div>
                  <div className="w-24 sm:w-32 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-500" style={{ width: `${Math.max(0, (stats.xp % XP_TO_LEVEL_UP) / XP_TO_LEVEL_UP * 100)}%` }} />
                  </div>
              </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        
        {currentView === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
                    <h3 className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Brain size={14} /> Мудрость Оракула
                    </h3>
                    <p className="text-slate-300 italic font-medium leading-relaxed">"{oracleMessage}"</p>
                    <button onClick={handleConsultOracle} disabled={isOracleLoading} className="mt-4 text-xs text-indigo-400 underline flex items-center gap-1">
                       {isOracleLoading ? <Sparkles className="animate-spin w-3 h-3" /> : <ScrollText className="w-3 h-3" />} Спросить совет
                    </button>
                </div>
                <StatRadar stats={stats} />
                <div className="grid grid-cols-2 gap-3">
                   {/* Stat boxes omitted for brevity */}
                </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-2xl rpg-font text-white mb-6 border-b border-slate-700 pb-2">Журнал Задач</h2>
                    <WeekView 
                        tasks={tasks} 
                        logs={logs}
                        onToggleTask={handleToggleTask}
                        onAddTask={() => {}} 
                        onDeleteTask={handleDeleteTask}
                        onUpdateTask={handleUpdateTask}
                    />
                </div>
                <ProgressHistoryChart tasks={tasks} logs={logs} />
            </div>
          </div>
        )}

        {currentView === 'pomodoro' && (
          <PomodoroPage 
            tasks={tasks}
            onCompleteTask={handleCompleteTaskFromTimer}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'projects' && (
            <ProjectsPage 
                tasks={tasks}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteTask}
                onAddStage={handleAddStage}
                onDeleteStage={handleDeleteStage}
                onUpdateStage={handleUpdateStage}
            />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur border-t border-slate-800 z-40 pb-safe">
        <div className="flex justify-around items-center p-2 max-w-lg mx-auto">
            <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${currentView === 'dashboard' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <LayoutDashboard size={24} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Дашборд</span>
            </button>
            
            <div className="w-px h-8 bg-slate-800" />

            <button 
                onClick={() => setCurrentView('pomodoro')}
                className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${currentView === 'pomodoro' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Timer size={24} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Квесты</span>
            </button>

            <div className="w-px h-8 bg-slate-800" />

            <button 
                onClick={() => setCurrentView('projects')}
                className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${currentView === 'projects' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Briefcase size={24} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Проекты</span>
            </button>
        </div>
      </nav>

    </div>
  );
};

export default App;