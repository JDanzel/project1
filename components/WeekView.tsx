import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Plus, Trash2, X, Check, Zap, Brain, Heart, Briefcase, Pencil, ArrowUpDown, Star, AlertCircle, Calendar } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Edit State (Only for basic tasks now)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const CATEGORY_ICONS = {
    [Category.PHYSICAL]: { icon: Zap, color: 'text-rose-400' },
    [Category.INTELLECT]: { icon: Brain, color: 'text-violet-400' },
    [Category.HEALTH]: { icon: Heart, color: 'text-emerald-400' },
    [Category.PROFESSIONAL]: { icon: Briefcase, color: 'text-amber-400' },
  };

  const GROUP_THEMES = {
    [TaskType.BASIC]: { bar: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' },
    [TaskType.CONSTANT]: { bar: 'bg-violet-500', text: 'text-violet-400', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.5)]' },
    [TaskType.TEMPORARY]: { bar: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]' },
    [TaskType.NEGATIVE]: { bar: 'bg-rose-600', text: 'text-rose-500', glow: 'shadow-[0_0_15px_rgba(225,29,72,0.5)]' },
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
  };

  useEffect(() => {
    let start: Date;
    let daysCount: number;

    if (isMobile) {
        start = new Date(currentDate);
        daysCount = 5;
    } else {
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

  const isCompleted = (dateStr: string, id: string) => {
    const log = logs.find(l => l.date === dateStr);
    return log?.completedTaskIds.includes(id);
  };

  const renderTaskGroup = (title: string, taskType: TaskType, groupTasks: Task[]) => {
    const theme = GROUP_THEMES[taskType];
    const displayPercent = mounted ? 100 : 0; // Simplified animation for now

    return (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3 px-2">
                <h4 className={`text-sm font-bold uppercase tracking-wider ${theme.text} drop-shadow-sm`}>{title}</h4>
                <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                     <div className={`h-full ${theme.bar} ${theme.glow}`} style={{ width: '40%', opacity: 0.5 }} />
                </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden shadow-lg">
            {groupTasks.length === 0 && (
                <div className="p-4 text-center text-slate-600 text-sm italic">
                    {taskType === TaskType.TEMPORARY ? 'Создайте проекты во вкладке "Проекты"' : 'Нет задач'}
                </div>
            )}
            
            {groupTasks.map(task => {
                const penaltyValue = TASK_PENALTIES[task.id] || DEFAULT_PENALTY;

                return (
                    <div key={task.id} className="flex items-stretch border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                        {/* Task Name Column */}
                        <div className="w-2/5 md:w-1/4 p-3 border-r border-slate-800 flex flex-col justify-center min-h-[60px]">
                            <div className="flex items-center justify-between w-full mb-1">
                                <span className={`text-sm font-medium line-clamp-2 leading-tight ${taskType === TaskType.NEGATIVE ? 'text-rose-300' : 'text-slate-300'}`} title={task.name}>
                                    {task.name}
                                </span>
                            </div>
                            
                            {/* Metadata */}
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex gap-1 opacity-60">
                                    {task.affectedCategories.map(cat => {
                                        const config = CATEGORY_ICONS[cat];
                                        const Icon = config.icon;
                                        return <div key={cat}><Icon size={10} className={config.color} /></div>;
                                    })}
                                </div>
                                {taskType === TaskType.NEGATIVE && (
                                    <div className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold text-rose-400 border border-rose-500/30">
                                        -{penaltyValue} XP
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Days Column */}
                        <div className="flex-1 flex">
                        {weekDates.map(day => {
                            const dateKey = formatDateKey(day);
                            const isToday = formatDateKey(new Date()) === dateKey;
                            
                            // -----------------------------------------------------------------
                            // RENDER LOGIC FOR TEMPORARY TASKS (PROJECTS)
                            // -----------------------------------------------------------------
                            if (taskType === TaskType.TEMPORARY) {
                                const totalStages = task.stages?.length || 0;
                                const scheduledStage = task.stages?.find(s => s.date === dateKey);

                                // If no stage scheduled for this day, render empty
                                if (!scheduledStage) {
                                     return (
                                        <div key={dateKey} className={`flex-1 flex flex-col justify-center items-center py-3 border-r border-slate-800 last:border-0 ${isToday ? 'bg-slate-800/40' : ''}`}>
                                            <div className="w-1 h-1 rounded-full bg-slate-800" />
                                        </div>
                                    );
                                }

                                // Calculate Total Project Progress (only needed if completed)
                                const allCompletedStageIds = new Set<string>();
                                logs.forEach(l => {
                                    l.completedTaskIds.forEach(id => {
                                        if (task.stages?.some(s => s.id === id)) {
                                            allCompletedStageIds.add(id);
                                        }
                                    });
                                });
                                const completedCount = allCompletedStageIds.size;
                                const percentage = totalStages > 0 ? Math.round((completedCount / totalStages) * 100) : 0;
                                
                                // Check if THIS specific stage is completed
                                const stageCompleted = isCompleted(dateKey, scheduledStage.id);

                                return (
                                    <div key={dateKey} className={`flex-1 flex flex-col justify-center items-center py-2 px-1 border-r border-slate-800 last:border-0 relative group ${isToday ? 'bg-slate-800/40' : ''}`}>
                                        
                                        {/* Stage Name */}
                                        <div className="text-[9px] text-amber-500/80 mb-1 text-center font-medium leading-none truncate w-full px-1">
                                            {scheduledStage.name}
                                        </div>

                                        {stageCompleted ? (
                                            // IF DONE: Show Project Progress Bar
                                            <div className="w-full px-2">
                                                <div className="w-full h-2.5 bg-slate-900 rounded-full border border-slate-700 overflow-hidden relative shadow-inner">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="text-[8px] text-center text-slate-500 font-mono mt-0.5">
                                                    {percentage}%
                                                </div>
                                            </div>
                                        ) : (
                                            // IF NOT DONE: Show Toggle Button
                                            <button
                                                onClick={() => onToggleTask(dateKey, scheduledStage.id)}
                                                className={`transition-all duration-200 transform hover:scale-110 text-slate-700 hover:text-amber-500`}
                                                title={`Завершить этап: ${scheduledStage.name}`}
                                            >
                                                <Circle size={20} />
                                            </button>
                                        )}
                                    </div>
                                );
                            }

                            // -----------------------------------------------------------------
                            // STANDARD RENDER LOGIC FOR OTHER TASKS
                            // -----------------------------------------------------------------
                            const completed = isCompleted(dateKey, task.id);
                            
                            return (
                            <div key={dateKey} className={`flex-1 flex flex-col justify-center items-center py-3 border-r border-slate-800 last:border-0 relative group ${isToday ? 'bg-slate-800/40' : ''}`}>
                                <button
                                    onClick={() => onToggleTask(dateKey, task.id)}
                                    className={`transition-all duration-200 transform hover:scale-110 ${completed ? (taskType === TaskType.NEGATIVE ? 'text-rose-500' : 'text-emerald-500') : 'text-slate-700 hover:text-slate-500'}`}
                                    title={taskType === TaskType.NEGATIVE ? "Отметить вредную привычку" : "Отметить выполнение"}
                                >
                                    {completed ? 
                                        (taskType === TaskType.NEGATIVE ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />) 
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
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4 px-2 py-3 bg-slate-900/50 rounded-lg border border-slate-800">
        <button onClick={handlePrevWeek} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
            <h2 className="text-xl font-bold text-slate-100 capitalize rpg-font tracking-wider">
                {weekDates[0]?.toLocaleDateString('ru-RU', { month: 'long' })} <span className="text-slate-500">{weekDates[0]?.getFullYear()}</span>
            </h2>
        </div>
        <button onClick={handleNextWeek} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-stretch sticky top-0 z-20 bg-slate-950/95 backdrop-blur-sm border-y border-slate-800 mb-6 shadow-xl">
          <div className="w-2/5 md:w-1/4 p-3 border-r border-slate-800 flex items-center">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Список задач</span>
          </div>
          <div className="flex-1 flex">
            {weekDates.map(date => {
                const isToday = formatDateKey(new Date()) === formatDateKey(date);
                return (
                    <div key={date.toString()} className={`flex-1 flex flex-col items-center justify-center py-2 border-r border-slate-800 last:border-0 ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                             <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">{date.toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
                             <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                    </div>
                );
            })}
          </div>
      </div>

      {/* Tasks */}
      <div className="space-y-6">
        {renderTaskGroup("Базовые", TaskType.BASIC, tasks.filter(t => t.type === TaskType.BASIC))}
        {renderTaskGroup("Навыки", TaskType.CONSTANT, tasks.filter(t => t.type === TaskType.CONSTANT))}
        {renderTaskGroup("Проекты (Этапы)", TaskType.TEMPORARY, tasks.filter(t => t.type === TaskType.TEMPORARY))}
        {renderTaskGroup("Вредные привычки", TaskType.NEGATIVE, tasks.filter(t => t.type === TaskType.NEGATIVE))}
      </div>
    </div>
  );
};

export default WeekView;