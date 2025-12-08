import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Plus, Trash2, X, Check, Zap, Brain, Heart, Briefcase, Pencil, ArrowUpDown, Star, AlertCircle } from 'lucide-react';
import { DayLog, Task, TaskType, Category, Difficulty } from '../types';
import { XP_RATES, TASK_PENALTIES, DEFAULT_PENALTY } from '../constants';

interface WeekViewProps {
  tasks: Task[];
  logs: DayLog[];
  onToggleTask: (date: string, taskId: string) => void;
  onAddTask: (taskName: string, difficulty: Difficulty) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ tasks, logs, onToggleTask, onAddTask, onDeleteTask, onUpdateTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  
  // Responsive State
  const [isMobile, setIsMobile] = useState(false);

  // Add Task State
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const [sortByCategory, setSortByCategory] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Edit State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategories, setEditCategories] = useState<Category[]>([]);
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const CATEGORY_ICONS = {
    [Category.PHYSICAL]: { icon: Zap, color: 'text-rose-400', activeBg: 'bg-rose-500/30' },
    [Category.INTELLECT]: { icon: Brain, color: 'text-violet-400', activeBg: 'bg-violet-500/30' },
    [Category.HEALTH]: { icon: Heart, color: 'text-emerald-400', activeBg: 'bg-emerald-500/30' },
    [Category.PROFESSIONAL]: { icon: Briefcase, color: 'text-amber-400', activeBg: 'bg-amber-500/30' },
  };

  const DIFFICULTY_STYLES = {
    [Difficulty.EASY]: { text: 'Easy', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
    [Difficulty.MEDIUM]: { text: 'Med', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
    [Difficulty.HARD]: { text: 'Hard', color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
    [Difficulty.EPIC]: { text: 'Epic', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  };

  const GROUP_THEMES = {
    [TaskType.BASIC]: { bar: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' },
    [TaskType.CONSTANT]: { bar: 'bg-violet-500', text: 'text-violet-400', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.5)]' },
    [TaskType.TEMPORARY]: { bar: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]' },
    [TaskType.NEGATIVE]: { bar: 'bg-rose-600', text: 'text-rose-500', glow: 'shadow-[0_0_15px_rgba(225,29,72,0.5)]' },
  };

  // Helper to get start of week (Monday)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  useEffect(() => {
    let start: Date;
    let daysCount: number;

    if (isMobile) {
        // On Mobile: Show 5 days starting from the current View Date (Rolling Window)
        start = new Date(currentDate);
        daysCount = 5;
    } else {
        // On Desktop: Show 7 days starting from Monday (Calendar Week)
        start = getStartOfWeek(currentDate);
        daysCount = 7;
    }

    const days = [];
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    setWeekDates(days);
  }, [currentDate, isMobile]);

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    const step = isMobile ? 5 : 7;
    newDate.setDate(newDate.getDate() - step);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    const step = isMobile ? 5 : 7;
    newDate.setDate(newDate.getDate() + step);
    setCurrentDate(newDate);
  };

  const isCompleted = (dateStr: string, taskId: string) => {
    const log = logs.find(l => l.date === dateStr);
    return log?.completedTaskIds.includes(taskId);
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      onAddTask(newTaskName, newTaskDifficulty);
      setNewTaskName('');
      setNewTaskDifficulty(Difficulty.MEDIUM);
      setIsAddingTask(false);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditName(task.name);
    setEditCategories(task.affectedCategories);
    setEditDifficulty(task.difficulty || Difficulty.MEDIUM);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditName('');
    setEditCategories([]);
  };

  const saveEditing = () => {
    if (editingTaskId && editName.trim()) {
        onUpdateTask(editingTaskId, {
            name: editName,
            affectedCategories: editCategories,
            difficulty: editDifficulty
        });
        cancelEditing();
    }
  };

  const toggleEditCategory = (cat: Category) => {
    setEditCategories(prev => {
        if (prev.includes(cat)) {
            return prev.filter(c => c !== cat);
        } else {
            return [...prev, cat];
        }
    });
  };

  const renderDifficultySelector = (current: Difficulty, onChange: (d: Difficulty) => void) => {
      return (
          <div className="flex gap-1">
              {(Object.values(Difficulty) as Difficulty[]).map(diff => {
                  const style = DIFFICULTY_STYLES[diff];
                  const isActive = current === diff;
                  return (
                      <button
                          key={diff}
                          type="button"
                          onClick={() => onChange(diff)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${isActive ? `${style.bg} ${style.border} ${style.color} font-bold` : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                          title={`${XP_RATES[diff]} XP`}
                      >
                          {style.text}
                      </button>
                  )
              })}
          </div>
      )
  }

  const renderTaskGroup = (title: string, taskType: TaskType, groupTasks: Task[]) => {
    const theme = GROUP_THEMES[taskType];
    const todayKey = formatDateKey(new Date());
    const isNegativeGroup = taskType === TaskType.NEGATIVE;
    
    // Calculate progress for today
    const totalTasks = groupTasks.length;
    const completedCount = groupTasks.filter(t => isCompleted(todayKey, t.id)).length;
    const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
    // Animate from 0 on mount
    const displayPercent = mounted ? progressPercent : 0;

    let displayedTasks = groupTasks;

    if (taskType === TaskType.TEMPORARY && sortByCategory) {
      displayedTasks = [...groupTasks].sort((a, b) => {
        const catA = a.affectedCategories[0] || '';
        const catB = b.affectedCategories[0] || '';
        const catCompare = catA.localeCompare(catB);
        if (catCompare !== 0) return catCompare;
        return a.name.localeCompare(b.name);
      });
    }

    return (
        <div className="mb-8">
          <div className="flex items-end justify-between mb-3 px-2">
            <div className="flex items-center gap-4 flex-1">
                <h4 className={`text-sm font-bold uppercase tracking-wider ${theme.text} drop-shadow-sm`}>{title}</h4>
                
                {/* Daily Progress Bar */}
                <div className="flex flex-col gap-1 w-48 hidden sm:flex">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium uppercase leading-none px-1">
                        <span>Сегодня</span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-700/50 shadow-inner relative">
                        <div 
                            className={`h-full ${theme.bar} ${theme.glow} transition-all duration-1000 ease-out relative`} 
                            style={{ width: `${displayPercent}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>

            {taskType === TaskType.TEMPORARY && (
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSortByCategory(!sortByCategory)}
                        className={`text-xs flex items-center gap-1 transition-colors ${sortByCategory ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                        title="Сортировать по категориям"
                    >
                        <div title="Сортировать"><ArrowUpDown size={14} /></div>
                    </button>
                    <button 
                        onClick={() => setIsAddingTask(!isAddingTask)}
                        className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
                    >
                        <Plus size={14} /> Добавить
                    </button>
                </div>
            )}
          </div>

          {taskType === TaskType.TEMPORARY && isAddingTask && (
            <form onSubmit={handleAddNewTask} className="mb-4 px-2 p-3 bg-slate-800/30 rounded border border-slate-700">
                <div className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder="Название задачи..."
                        className="bg-slate-900 text-sm text-white rounded px-3 py-1 flex-1 border border-slate-600 focus:border-emerald-500 outline-none"
                        autoFocus
                    />
                </div>
                <div className="flex justify-between items-center">
                    {renderDifficultySelector(newTaskDifficulty, setNewTaskDifficulty)}
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1 rounded">OK</button>
                </div>
            </form>
          )}

          <div className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden shadow-lg">
            {displayedTasks.length === 0 && (
                <div className="p-4 text-center text-slate-600 text-sm italic">Нет задач этого типа</div>
            )}
            {displayedTasks.map(task => {
                const isEditing = task.id === editingTaskId;
                const penaltyValue = TASK_PENALTIES[task.id] || DEFAULT_PENALTY;

                return (
                    <div key={task.id} className="flex items-stretch border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                        {/* Left Column: Task Name & Edit Controls (Wider on mobile) */}
                        <div className="w-2/5 md:w-1/4 p-3 border-r border-slate-800 flex flex-col justify-center group relative min-h-[60px]">
                            
                            {isEditing ? (
                                <div className="flex flex-col gap-2 w-full animate-in fade-in duration-200">
                                    <input 
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="bg-slate-950 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none w-full"
                                        autoFocus
                                    />
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1">
                                            {(Object.values(Category) as Category[]).map(cat => {
                                                const isActive = editCategories.includes(cat);
                                                const config = CATEGORY_ICONS[cat];
                                                const Icon = config.icon;
                                                return (
                                                    <button
                                                        key={cat}
                                                        onClick={() => toggleEditCategory(cat)}
                                                        className={`p-1 rounded transition-all ${isActive ? config.activeBg : 'bg-slate-800 opacity-40 hover:opacity-70'}`}
                                                        title={cat}
                                                    >
                                                        <Icon size={12} className={isActive ? config.color : 'text-slate-400'} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {taskType === TaskType.TEMPORARY && (
                                            <div className="flex items-center justify-between">
                                                {renderDifficultySelector(editDifficulty, setEditDifficulty)}
                                                <div className="flex gap-1 ml-1">
                                                    <button onClick={saveEditing} className="text-emerald-500 hover:text-emerald-400 p-1"><Check size={14} /></button>
                                                    <button onClick={cancelEditing} className="text-rose-500 hover:text-rose-400 p-1"><X size={14} /></button>
                                                </div>
                                            </div>
                                        )}
                                        {taskType !== TaskType.TEMPORARY && (
                                            <div className="flex gap-1 ml-auto">
                                                <button onClick={saveEditing} className="text-emerald-500 hover:text-emerald-400 p-1"><Check size={14} /></button>
                                                <button onClick={cancelEditing} className="text-rose-500 hover:text-rose-400 p-1"><X size={14} /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col w-full">
                                    <div className="flex items-center justify-between w-full mb-1">
                                        {taskType === TaskType.TEMPORARY ? (
                                            <button 
                                                onClick={() => startEditing(task)}
                                                className="text-sm font-medium text-slate-300 text-left hover:text-emerald-400 transition-colors mr-2 flex items-center gap-2 max-w-full" 
                                                title="Нажмите для редактирования"
                                            >
                                                <span className="line-clamp-2 leading-tight">{task.name}</span>
                                                <Pencil size={10} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />
                                            </button>
                                        ) : (
                                            <span className={`text-sm font-medium line-clamp-2 leading-tight mr-2 ${isNegativeGroup ? 'text-rose-300' : 'text-slate-300'}`} title={task.name}>{task.name}</span>
                                        )}
                                        
                                        {task.isCustom && (
                                            <button onClick={() => onDeleteTask(task.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Task Metadata (Categories & Difficulty) */}
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {task.affectedCategories.map(cat => {
                                                const config = CATEGORY_ICONS[cat];
                                                const Icon = config.icon;
                                                return (
                                                    <div key={cat} title={cat}>
                                                        <Icon size={10} className={config.color} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {isNegativeGroup && (
                                            <div className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border border-rose-500/30 bg-rose-500/10 text-rose-400" title={`Штраф: -${penaltyValue} XP`}>
                                                -{penaltyValue} XP
                                            </div>
                                        )}

                                        {task.difficulty && (
                                            <div 
                                                className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border ${DIFFICULTY_STYLES[task.difficulty].color} ${DIFFICULTY_STYLES[task.difficulty].border} ${DIFFICULTY_STYLES[task.difficulty].bg}`}
                                                title={`Награда: ${XP_RATES[task.difficulty]} XP`}
                                            >
                                                {task.difficulty} ({XP_RATES[task.difficulty]} XP)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Days */}
                        <div className="flex-1 flex">
                        {weekDates.map(day => {
                            const dateKey = formatDateKey(day);
                            const completed = isCompleted(dateKey, task.id);
                            const isToday = formatDateKey(new Date()) === dateKey;
                            
                            return (
                            <div key={dateKey} className={`flex-1 flex justify-center items-center py-3 border-r border-slate-800 last:border-0 ${isToday ? 'bg-slate-800/40' : ''}`}>
                                <button
                                onClick={() => onToggleTask(dateKey, task.id)}
                                className={`transition-all duration-200 transform hover:scale-110 ${completed ? (isNegativeGroup ? 'text-rose-500' : 'text-emerald-500') : 'text-slate-700 hover:text-slate-500'}`}
                                title={isNegativeGroup ? "Отметить вредную привычку" : "Отметить выполнение"}
                                >
                                {completed ? 
                                    (isNegativeGroup ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />) 
                                    : <Circle size={20} />
                                }
                                </button>
                            </div>
                            );
                        })}
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      );
  }

  return (
    <div className="w-full">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4 px-2 py-3 bg-slate-900/50 rounded-lg border border-slate-800">
        <button onClick={handlePrevWeek} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        
        {/* Month Display */}
        <div className="text-center">
            <h2 className="text-xl font-bold text-slate-100 capitalize rpg-font tracking-wider">
                {weekDates[0]?.toLocaleDateString('ru-RU', { month: 'long' })} <span className="text-slate-500">{weekDates[0]?.getFullYear()}</span>
            </h2>
        </div>

        <button onClick={handleNextWeek} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Sticky Table Header */}
      <div className="flex items-stretch sticky top-0 z-20 bg-slate-950/95 backdrop-blur-sm border-y border-slate-800 mb-6 shadow-xl">
          {/* Left Column Spacer (matches Task Name col - wider on mobile) */}
          <div className="w-2/5 md:w-1/4 p-3 border-r border-slate-800 flex items-center">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Список задач</span>
          </div>

          {/* Date Columns (matches Days col) */}
          <div className="flex-1 flex">
            {weekDates.map(date => {
                const isToday = formatDateKey(new Date()) === formatDateKey(date);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                
                return (
                    <div key={date.toString()} className="flex-1 flex flex-col items-center justify-center py-2 border-r border-slate-800 last:border-0 relative group">
                        {isToday && <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />}
                        <div className={`flex flex-col items-center justify-center transition-colors ${isToday ? 'text-indigo-400 scale-110' : isWeekend ? 'text-slate-400' : 'text-slate-500'}`}>
                             <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">{date.toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
                             <span className={`text-lg font-bold leading-none ${isToday ? 'text-indigo-400' : 'text-slate-300'}`}>{date.getDate()}</span>
                        </div>
                    </div>
                );
            })}
          </div>
      </div>

      {/* Tasks Lists */}
      <div className="space-y-6">
        {renderTaskGroup("Базовые (Рутина)", TaskType.BASIC, tasks.filter(t => t.type === TaskType.BASIC))}
        {renderTaskGroup("Постоянные (Навыки)", TaskType.CONSTANT, tasks.filter(t => t.type === TaskType.CONSTANT))}
        {renderTaskGroup("Стратегические (Проекты)", TaskType.TEMPORARY, tasks.filter(t => t.type === TaskType.TEMPORARY))}
        {renderTaskGroup("Отрицательные (Вредные привычки)", TaskType.NEGATIVE, tasks.filter(t => t.type === TaskType.NEGATIVE))}
      </div>
    </div>
  );
};

export default WeekView;