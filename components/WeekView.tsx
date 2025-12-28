
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Zap, Brain, Heart, Briefcase, Calendar, ShieldAlert, Swords, Scroll, Skull, Target, Plus, X } from 'lucide-react';
import { DayLog, Task, TaskType, Category, Difficulty } from '../types';

interface WeekViewProps {
  tasks: Task[];
  logs: DayLog[];
  onToggleTask: (date: string, taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ tasks, logs, onToggleTask, onAddTask, onDeleteTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Category>(Category.PHYSICAL);
  const [newTaskType, setNewTaskType] = useState<TaskType>(TaskType.BASIC);

  const CATEGORY_ICONS = {
    [Category.PHYSICAL]: { icon: Swords, color: 'text-red-800', shadow: 'shadow-red-900/20' },
    [Category.INTELLECT]: { icon: Brain, color: 'text-amber-700', shadow: 'shadow-amber-900/20' },
    [Category.HEALTH]: { icon: Heart, color: 'text-emerald-800', shadow: 'shadow-emerald-900/20' },
    [Category.PROFESSIONAL]: { icon: Briefcase, color: 'text-blue-800', shadow: 'shadow-blue-900/20' },
  };

  const GROUP_THEMES = {
    [TaskType.BASIC]: { bar: 'bg-amber-900/10', text: 'text-amber-900', icon: ShieldAlert },
    [TaskType.CONSTANT]: { bar: 'bg-amber-800/10', text: 'text-amber-800', icon: Scroll },
    [TaskType.TEMPORARY]: { bar: 'bg-emerald-800/10', text: 'text-emerald-800', icon: Target },
    [TaskType.NEGATIVE]: { bar: 'bg-red-900/10', text: 'text-red-900', icon: Skull },
  };

  useEffect(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    setWeekDates(days);
  }, [currentDate]);

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  const allCompletedIds = new Set<string>();
  logs.forEach(log => log.completedTaskIds.forEach(id => allCompletedIds.add(id)));

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      onAddTask({
        name: newTaskName,
        type: newTaskType,
        affectedCategories: [newTaskCategory],
        isCustom: true
      });
      setNewTaskName('');
      setShowAddModal(false);
    }
  };

  const renderTaskGroup = (title: string, taskType: TaskType, groupTasks: Task[]) => {
    const theme = GROUP_THEMES[taskType];
    const Icon = theme.icon;

    if (groupTasks.length === 0 && taskType !== TaskType.BASIC) return null;

    return (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 px-2">
                <Icon size={18} className={theme.text} />
                <h4 className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.text}`}>{title}</h4>
                <div className="h-px flex-1 bg-amber-900/15" />
                {taskType === TaskType.BASIC && (
                  <button 
                    onClick={() => {
                      setNewTaskType(TaskType.BASIC);
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-1 text-[10px] font-black bg-amber-950 text-white px-3 py-1 rounded shadow-sm hover:bg-amber-900 transition-colors uppercase tracking-widest"
                  >
                    <Plus size={12} /> Добавить
                  </button>
                )}
          </div>

          <div className="bg-[#fdf2d9]/40 rounded border border-amber-900/15 overflow-hidden shadow-sm backdrop-blur-[1px]">
            {/* Table Header */}
            <div className="flex items-stretch border-b border-amber-900/10 bg-amber-900/5">
                <div className="w-1/3 md:w-1/4 p-3 border-r border-amber-900/10">
                    <span className="text-[10px] font-bold text-amber-900/50 uppercase">миссия</span>
                </div>
                <div className="flex-1 flex overflow-x-auto">
                     {weekDates.map(day => {
                         const isToday = formatDateKey(new Date()) === formatDateKey(day);
                         return (
                            <div key={day.getTime()} className={`flex-1 min-w-[45px] flex flex-col items-center py-2 border-r border-amber-900/10 last:border-0 relative ${isToday ? 'bg-amber-500/15' : ''}`}>
                                {isToday && (
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-600 shadow-sm"></div>
                                )}
                                <span className={`text-[9px] uppercase font-black tracking-widest ${isToday ? 'text-amber-800' : 'text-amber-900/40'}`}>{day.toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
                                <span className={`text-xs font-black ${isToday ? 'text-amber-950' : 'text-amber-900/60'}`}>{day.getDate()}</span>
                            </div>
                         );
                     })}
                </div>
            </div>

            {/* Table Rows */}
            {groupTasks.length === 0 && (
              <div className="p-8 text-center text-amber-900/20 italic text-xs">
                Список пуст. Самое время добавить новую привычку!
              </div>
            )}
            {groupTasks.map(task => {
                const isCampaign = taskType === TaskType.TEMPORARY;
                const stages = task.stages || [];
                const completedStagesCount = stages.filter(s => allCompletedIds.has(s.id)).length;
                const progress = stages.length > 0 ? Math.round((completedStagesCount / stages.length) * 100) : 0;

                return (
                    <div key={task.id} className="flex items-stretch border-b border-amber-900/10 last:border-0 hover:bg-amber-900/5 transition-colors group/row">
                        <div className="w-1/3 md:w-1/4 p-3 border-r border-amber-900/10 flex flex-col justify-center relative">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-black uppercase tracking-tight leading-tight ${taskType === TaskType.NEGATIVE ? 'text-red-900' : 'text-[#2c1810]'}`}>{task.name}</span>
                                {isCampaign && (
                                    <span className="text-[10px] font-black font-mono text-amber-900/60">{progress}%</span>
                                )}
                            </div>

                            {isCampaign && stages.length > 0 && (
                                <div className="space-y-1 mt-1">
                                    <div className="h-1 w-full bg-amber-900/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-700 transition-all duration-700" style={{ width: `${progress}%` }} />
                                    </div>
                                    <div className="text-[8px] uppercase font-black tracking-widest text-amber-900/30">
                                        {completedStagesCount}/{stages.length} готово
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 mt-2 items-center">
                                {!isCampaign && task.affectedCategories.map(cat => {
                                    const cfg = CATEGORY_ICONS[cat];
                                    const CatIcon = cfg.icon;
                                    return (
                                        <CatIcon key={cat} size={14} className={`${cfg.color} relative opacity-80`} title={cat} />
                                    );
                                })}
                                {isCampaign && <Briefcase size={12} className="text-amber-800 opacity-60" />}
                                
                                {task.isCustom && (
                                  <button 
                                    onClick={() => onDeleteTask(task.id)}
                                    className="ml-auto opacity-0 group-hover/row:opacity-100 transition-opacity text-rose-800 hover:text-rose-600 p-1"
                                    title="Удалить привычку"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 flex">
                            {weekDates.map(day => {
                                const dateKey = formatDateKey(day);
                                const isToday = formatDateKey(new Date()) === dateKey;
                                const log = logs.find(l => l.date === dateKey);
                                
                                let targetId = task.id;
                                let hasCheckpoint = true;
                                
                                if (isCampaign) {
                                    const stageOnThisDay = stages.find(s => s.date === dateKey);
                                    if (stageOnThisDay) {
                                        targetId = stageOnThisDay.id;
                                    } else {
                                        hasCheckpoint = false;
                                    }
                                }

                                const completed = log?.completedTaskIds.includes(targetId);
                                
                                return (
                                    <div key={dateKey} className={`flex-1 min-w-[45px] flex items-center justify-center py-4 border-r border-amber-900/10 last:border-0 relative ${isToday ? 'bg-amber-500/5' : ''}`}>
                                        {hasCheckpoint && (
                                            <button 
                                                onClick={() => onToggleTask(dateKey, targetId)} 
                                                className={`transition-all duration-300 relative z-10 ${completed ? (taskType === TaskType.NEGATIVE ? 'text-red-800 scale-110 drop-shadow-sm' : 'text-amber-700 scale-110 drop-shadow-sm') : 'text-amber-900/15 hover:text-amber-900/30'}`}
                                            >
                                                {completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            })}
          </div>
        </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 bg-[#3e2723]/5 p-3 rounded-xl border border-amber-950/10">
        <button onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000))} className="p-2 hover:bg-amber-900/10 rounded-lg transition-colors text-amber-950">
            <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
            <Calendar size={16} className="text-amber-900/40" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-950">
                {weekDates[0]?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — {weekDates[6]?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </span>
        </div>
        <button onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000))} className="p-2 hover:bg-amber-900/10 rounded-lg transition-colors text-amber-950">
            <ChevronRight size={20} />
        </button>
      </div>

      {renderTaskGroup('ОСНОВНЫЕ ЗАДАЧИ', TaskType.BASIC, tasks.filter(t => t.type === TaskType.BASIC))}
      {renderTaskGroup('ПОСТОЯННЫЕ КВЕСТЫ', TaskType.CONSTANT, tasks.filter(t => t.type === TaskType.CONSTANT))}
      {renderTaskGroup('КАМПАНИИ', TaskType.TEMPORARY, tasks.filter(t => t.type === TaskType.TEMPORARY))}
      {renderTaskGroup('ТЕМНЫЕ ПОРОКИ', TaskType.NEGATIVE, tasks.filter(t => t.type === TaskType.NEGATIVE))}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#f4e4bc] border-4 border-amber-950 rounded-2xl p-8 max-w-md w-full relative shadow-2xl overflow-hidden">
            {/* Visual Flourish */}
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-950/20" />
            
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-amber-950/40 hover:text-amber-950 transition-colors">
              <X size={24} />
            </button>
            
            <h3 className="text-2xl rpg-font font-black text-amber-950 mb-6 uppercase tracking-tight">Новый Свиток Задач</h3>
            
            <form onSubmit={handleCreateTask} className="space-y-6">
              <div>
                <label className="text-[10px] text-amber-950 font-black uppercase tracking-widest mb-1.5 block">Название Подвига</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Напр. Изучение рун"
                  className="w-full bg-white/40 border-2 border-amber-900/10 rounded-lg px-4 py-3 text-amber-950 outline-none focus:border-amber-800 transition-all shadow-inner"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-amber-950 font-black uppercase tracking-widest mb-1.5 block">Сфера</label>
                  <select 
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as Category)}
                    className="w-full bg-white/40 border-2 border-amber-900/10 rounded-lg px-3 py-3 text-amber-950 outline-none focus:border-amber-800"
                  >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-amber-950 font-black uppercase tracking-widest mb-1.5 block">Тип Обязательства</label>
                  <select 
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as TaskType)}
                    className="w-full bg-white/40 border-2 border-amber-900/10 rounded-lg px-3 py-3 text-amber-950 outline-none focus:border-amber-800"
                  >
                    <option value={TaskType.BASIC}>Основная</option>
                    <option value={TaskType.CONSTANT}>Постоянная</option>
                    <option value={TaskType.NEGATIVE}>Порок (Минус XP)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-amber-950 text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] shadow-lg hover:bg-amber-900 active:scale-95 transition-all">
                  Вписать в историю
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekView;
