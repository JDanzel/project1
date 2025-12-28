import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, Calendar, Target, Briefcase, ChevronRight, X, Swords, Pencil, Check, Filter, List, Lock, Link as LinkIcon, StickyNote } from 'lucide-react';
import { Task, TaskType, Category, Difficulty, TaskStage, DayLog } from '../types';
import { XP_RATES } from '../constants';

interface ProjectsPageProps {
  tasks: Task[];
  logs: DayLog[];
  onAddProject: (name: string) => void;
  onDeleteProject: (taskId: string) => void;
  onUpdateProject: (taskId: string, updates: Partial<Task>) => void;
  onAddStage: (taskId: string, stage: Omit<TaskStage, 'id'>) => void;
  onDeleteStage: (taskId: string, stageId: string) => void;
  onUpdateStage: (taskId: string, stageId: string, updates: Partial<TaskStage>) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ tasks, logs, onAddProject, onDeleteProject, onUpdateProject, onAddStage, onDeleteStage, onUpdateStage }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Stage Creation State
  const [stageName, setStageName] = useState('');
  const [stageDate, setStageDate] = useState('');
  const [stageDifficulty, setStageDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [stageDependsOn, setStageDependsOn] = useState<string>('');

  // Stage Editing State
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editStageName, setEditStageName] = useState('');
  const [editStageDate, setEditStageDate] = useState('');
  const [editStageDifficulty, setEditStageDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [editStageDependsOn, setEditStageDependsOn] = useState<string>('');

  // View Filter State
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);

  const projects = tasks.filter(t => t.type === TaskType.TEMPORARY);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Reset states when project changes
  useEffect(() => {
    setEditingStageId(null);
    setShowUpcomingOnly(false);
  }, [selectedProjectId]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onAddProject(newProjectName);
      setNewProjectName('');
    }
  };

  const handleCreateStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProjectId && stageName.trim() && stageDate) {
      onAddStage(selectedProjectId, {
        name: stageName,
        date: stageDate,
        difficulty: stageDifficulty,
        dependsOn: stageDependsOn || undefined
      });
      setStageName('');
      setStageDate('');
      setStageDifficulty(Difficulty.MEDIUM);
      setStageDependsOn('');
    }
  };

  const handleUpdateDescription = (val: string) => {
    if (selectedProjectId) {
      onUpdateProject(selectedProjectId, { description: val });
    }
  };

  const startEditingStage = (stage: TaskStage) => {
    setEditingStageId(stage.id);
    setEditStageName(stage.name);
    setEditStageDate(stage.date);
    setEditStageDifficulty(stage.difficulty);
    setEditStageDependsOn(stage.dependsOn || '');
  };

  const cancelEditingStage = () => {
    setEditingStageId(null);
  };

  const saveEditingStage = (stageId: string) => {
    if (selectedProjectId && editStageName.trim() && editStageDate) {
        onUpdateStage(selectedProjectId, stageId, {
            name: editStageName,
            date: editStageDate,
            difficulty: editStageDifficulty,
            dependsOn: editStageDependsOn || undefined
        });
        setEditingStageId(null);
    }
  };

  const DIFFICULTY_COLORS = {
    [Difficulty.EASY]: 'text-emerald-700 border-emerald-900/20 bg-emerald-500/10',
    [Difficulty.MEDIUM]: 'text-blue-700 border-blue-900/20 bg-blue-500/10',
    [Difficulty.HARD]: 'text-orange-700 border-orange-900/20 bg-orange-500/10',
    [Difficulty.EPIC]: 'text-purple-700 border-purple-900/20 bg-purple-500/10',
  };

  const allCompletedIds = useMemo(() => {
    const ids = new Set<string>();
    logs.forEach(log => log.completedTaskIds.forEach(id => ids.add(id)));
    return ids;
  }, [logs]);

  const getVisibleStages = () => {
      if (!selectedProject?.stages) return [];
      
      let stages = [...selectedProject.stages].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (showUpcomingOnly) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          stages = stages.filter(s => new Date(s.date) >= today);
      }
      return stages;
  };

  const getCompletedCount = (project: Task) => {
    if (!project.stages || project.stages.length === 0) return 0;
    return project.stages.filter(s => allCompletedIds.has(s.id)).length;
  };

  const calculateProgress = (project: Task) => {
      if (!project.stages || project.stages.length === 0) return 0;
      const completedCount = getCompletedCount(project);
      return Math.round((completedCount / project.stages.length) * 100);
  };

  const visibleStages = getVisibleStages();
  const completedCount = selectedProject ? getCompletedCount(selectedProject) : 0;
  const progressPercent = selectedProject ? calculateProgress(selectedProject) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-24 animate-in fade-in duration-300">
      
      {/* Left Column: Project List */}
      <div className="md:col-span-4 space-y-4">
        <div className="bg-[#fdf2d9]/60 p-5 rounded-xl border border-amber-900/15 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg rpg-font text-amber-950 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Briefcase size={20} className="text-amber-800" /> Кампании и Походы
          </h2>
          
          <form onSubmit={handleCreateProject} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Новая кампания..."
              className="bg-white/40 text-sm text-[#2c1810] rounded-lg px-3 py-2.5 flex-1 border border-amber-900/10 focus:border-amber-800 outline-none placeholder:text-amber-900/30 shadow-inner"
            />
            <button type="submit" className="bg-amber-900 hover:bg-amber-800 text-white p-2.5 rounded-lg transition-all shadow-md active:scale-95">
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {projects.length === 0 && (
                <div className="text-center text-amber-900/30 text-xs italic py-8 border-2 border-dashed border-amber-900/5 rounded-xl">Список пуст</div>
            )}
            {projects.map(project => (
              <div 
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`p-4 rounded-xl border transition-all group flex items-center justify-between shadow-sm ${selectedProjectId === project.id ? 'bg-amber-900/10 border-amber-900/30 ring-1 ring-amber-900/10' : 'bg-white/20 border-amber-900/5 hover:bg-white/40 cursor-pointer'}`}
              >
                <div className="flex-1 min-w-0">
                    <h3 className={`font-black text-sm truncate uppercase tracking-tight ${selectedProjectId === project.id ? 'text-amber-950' : 'text-amber-900/70'}`}>{project.name}</h3>
                    <div className="text-[10px] text-amber-900/40 mt-1 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span>{project.stages?.length || 0} этапов</span>
                    </div>
                </div>
                {selectedProjectId === project.id && <ChevronRight size={16} className="text-amber-900" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Stage Manager */}
      <div className="md:col-span-8">
        {selectedProject ? (
          <div className="bg-[#fdf2d9]/60 p-6 rounded-xl border border-amber-900/15 h-full flex flex-col shadow-sm backdrop-blur-sm">
            <div className="flex justify-between items-start mb-2 pb-2">
                <div>
                    <h2 className="text-2xl rpg-font text-amber-950 font-black uppercase tracking-tight">{selectedProject.name}</h2>
                    <p className="text-[10px] text-amber-900/40 font-bold uppercase tracking-[0.1em] mt-0.5">Управление цепочкой этапов похода</p>
                </div>
                <button 
                    onClick={() => {
                        if(confirm('Удалить кампанию и все ее этапы?')) {
                            onDeleteProject(selectedProject.id);
                            setSelectedProjectId(null);
                        }
                    }}
                    className="text-amber-950/30 hover:text-rose-700 transition-colors p-2 bg-white/10 rounded-lg border border-transparent hover:border-rose-200"
                    title="Удалить кампанию"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Campaign Notes/Description Section */}
            <div className="mb-4 bg-amber-900/5 p-3 rounded-lg border border-amber-900/10 shadow-inner">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-amber-900/50">
                <StickyNote size={12} />
                Заметки к кампании
              </div>
              <textarea 
                value={selectedProject.description || ''}
                onChange={(e) => handleUpdateDescription(e.target.value)}
                placeholder="Добавьте описание или заметки к этой кампании..."
                className="w-full bg-transparent text-xs text-amber-900/70 border-none outline-none resize-none min-h-[50px] font-medium leading-relaxed italic placeholder:text-amber-900/20"
              />
            </div>

            {/* Progress Bar */}
            {selectedProject.stages && selectedProject.stages.length > 0 && (
              <div className="flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-top-4 duration-500 bg-white/20 p-3 rounded-xl border border-amber-900/5 shadow-inner">
                <div className="flex-1">
                    <div className="flex justify-between text-[9px] mb-1.5 px-1">
                        <span className="text-amber-900/60 font-black uppercase tracking-[0.15em] flex items-center gap-1.5">
                          <Target size={10} className="text-amber-800"/>
                          Прогресс
                        </span>
                        <span className="text-amber-950 font-black font-mono">{progressPercent}%</span>
                    </div>
                    <div className="h-2 bg-amber-900/10 rounded-full border border-amber-900/10 overflow-hidden relative shadow-inner">
                        <div 
                            className="h-full bg-gradient-to-r from-amber-900 to-amber-600 rounded-full shadow-[0_0_8px_rgba(120,53,15,0.15)] transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
                <div className="text-center px-3 border-l border-amber-900/10 shrink-0">
                    <div className="text-lg font-black text-amber-950 leading-none">
                        {completedCount}
                        <span className="text-amber-900/30 text-xs">/{selectedProject.stages.length}</span>
                    </div>
                    <div className="text-[8px] text-amber-900/40 uppercase font-black tracking-widest mt-1">готово</div>
                </div>
              </div>
            )}

            {/* Visual Timeline - Minimized with consistent dots */}
            {selectedProject.stages && selectedProject.stages.length > 0 && (
                <div className="mb-4 p-2 bg-white/10 rounded-xl border border-amber-900/5 shadow-inner overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar pb-1">
                         <div className="min-w-[400px] flex items-center justify-around relative py-4 px-4">
                            {/* Track Line */}
                            <div className="absolute left-4 right-4 top-[1.75rem] h-0.5 bg-amber-900/10 rounded-full" />
                            
                            {[...selectedProject.stages]
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map((stage, idx, arr) => {
                                    const stageDate = new Date(stage.date);
                                    const isStageCompleted = allCompletedIds.has(stage.id);
                                    const isPrerequisiteMet = !stage.dependsOn || allCompletedIds.has(stage.dependsOn);
                                    
                                    let dotColor = 'bg-amber-900/20';
                                    if (stage.difficulty === Difficulty.EASY) dotColor = 'bg-emerald-600';
                                    if (stage.difficulty === Difficulty.MEDIUM) dotColor = 'bg-blue-600';
                                    if (stage.difficulty === Difficulty.HARD) dotColor = 'bg-orange-600';
                                    if (stage.difficulty === Difficulty.EPIC) dotColor = 'bg-purple-600';

                                    return (
                                        <div key={stage.id} className="flex flex-col items-center relative group px-1 flex-1">
                                            {stage.dependsOn && (
                                                <div className="absolute -top-1 left-[-50%] w-full flex justify-center pointer-events-none">
                                                   <div className={`h-2 w-full border-t border-x border-dashed rounded-t-lg opacity-10 transition-opacity group-hover:opacity-40 ${isPrerequisiteMet ? 'border-emerald-900/40' : 'border-rose-900/40'}`} />
                                                </div>
                                            )}

                                            <div className="mb-1 text-[8px] font-black uppercase tracking-widest text-amber-900/40 group-hover:text-amber-800 transition-colors whitespace-nowrap">
                                                {stageDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                                            </div>
                                            
                                            <div className="relative">
                                                {!isPrerequisiteMet && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-rose-800 animate-pulse">
                                                        <Lock size={10} />
                                                    </div>
                                                )}
                                                <div 
                                                    className={`w-3.5 h-3.5 rounded-full z-10 border ${isStageCompleted ? 'border-amber-950 ring-1 ring-emerald-500/20 bg-emerald-600 shadow-sm' : 'border-white/50'} ${isPrerequisiteMet ? dotColor : 'bg-amber-900/10'} group-hover:scale-110 transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center`} 
                                                    onClick={() => startEditingStage(stage)}
                                                >
                                                   {isStageCompleted && <Check size={8} className="text-white" />}
                                                </div>
                                            </div>

                                            <div className={`mt-1 text-[8px] font-black text-center leading-tight max-w-[60px] truncate uppercase tracking-tighter group-hover:text-amber-950 transition-all ${isStageCompleted ? 'text-emerald-800' : isPrerequisiteMet ? 'text-amber-900/60' : 'text-amber-900/30 italic'}`}>
                                                {stage.name}
                                            </div>
                                        </div>
                                    )
                                })
                            }
                         </div>
                    </div>
                </div>
            )}

            {/* Add Stage Form - Redesigned into 2 rows */}
            <form onSubmit={handleCreateStage} className="bg-white/20 p-4 rounded-xl border border-amber-900/10 mb-4 shadow-inner">
                <h4 className="text-[9px] font-black text-amber-900/50 uppercase tracking-[0.2em] mb-4 flex items-center gap-1.5">
                    <Target size={12} /> СОЗДАТЬ НОВЫЙ ЭТАП
                </h4>
                
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                    <div className="md:col-span-6">
                        <label className="text-[8px] text-amber-900/40 uppercase font-black tracking-widest mb-1 block">Цель</label>
                        <input 
                            type="text" 
                            value={stageName}
                            onChange={(e) => setStageName(e.target.value)}
                            placeholder="Название..."
                            className="w-full bg-white/50 text-xs text-[#2c1810] rounded-lg px-3 py-2 border border-amber-900/10 focus:border-amber-800 outline-none shadow-sm"
                            required
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="text-[8px] text-amber-900/40 uppercase font-black tracking-widest mb-1 block">Дата</label>
                        <div className="relative">
                            <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-900/40 pointer-events-none" />
                            <input 
                                type="date" 
                                value={stageDate}
                                onChange={(e) => setStageDate(e.target.value)}
                                className="w-full bg-white/50 text-xs text-[#2c1810] rounded-lg pl-8 pr-2 py-2 border border-amber-900/10 focus:border-amber-800 outline-none shadow-sm"
                                required
                            />
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <label className="text-[8px] text-amber-900/40 uppercase font-black tracking-widest mb-1 block">Сложность</label>
                        <select 
                            value={stageDifficulty}
                            onChange={(e) => setStageDifficulty(e.target.value as Difficulty)}
                            className="w-full bg-white/50 text-xs text-[#2c1810] rounded-lg px-2 py-2 border border-amber-900/10 focus:border-amber-800 outline-none shadow-sm"
                        >
                            {Object.values(Difficulty).map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label className="text-[8px] text-amber-900/40 uppercase font-black tracking-widest mb-1 block">Зависимость (требуется сперва)</label>
                        <select 
                            value={stageDependsOn}
                            onChange={(e) => setStageDependsOn(e.target.value)}
                            className="w-full bg-white/50 text-xs text-[#2c1810] rounded-lg px-3 py-2 border border-amber-900/10 focus:border-amber-800 outline-none shadow-sm"
                        >
                            <option value="">Нет (Начало)</option>
                            {selectedProject.stages?.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.date})</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="bg-amber-900 hover:bg-amber-800 text-white text-xs px-8 py-2.5 rounded-lg font-black uppercase tracking-widest transition-all shadow-md active:scale-95 shrink-0">
                        Вписать этап
                    </button>
                </div>
            </form>

            {/* List View */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {visibleStages.length === 0 && <div className="text-center py-6 italic text-amber-900/30 text-xs">Этапы похода еще не определены...</div>}
                {visibleStages.map((stage) => {
                    const isCompleted = allCompletedIds.has(stage.id);
                    const depStage = selectedProject.stages?.find(s => s.id === stage.dependsOn);
                    const isPrerequisiteMet = !stage.dependsOn || allCompletedIds.has(stage.dependsOn);

                    return (
                    <div key={stage.id} className={`group flex flex-col p-3 rounded-lg border transition-all shadow-sm ${isCompleted ? 'bg-emerald-500/10 border-emerald-900/20' : isPrerequisiteMet ? 'bg-white/30 border-amber-900/10 hover:bg-white/50' : 'bg-amber-900/5 border-amber-950/5 opacity-50'}`}>
                        {editingStageId === stage.id ? (
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <input className="flex-1 min-w-[120px] bg-white/60 text-xs text-[#2c1810] rounded-lg px-2 py-1.5 border border-amber-900/20" value={editStageName} onChange={e => setEditStageName(e.target.value)} />
                                    <input className="w-[120px] bg-white/60 text-xs text-[#2c1810] rounded-lg px-2 py-1.5 border border-amber-900/20" type="date" value={editStageDate} onChange={e => setEditStageDate(e.target.value)} />
                                    <select className="w-[100px] bg-white/60 text-xs text-[#2c1810] rounded-lg px-2 py-1.5 border border-amber-900/20" value={editStageDifficulty} onChange={e => setEditStageDifficulty(e.target.value as Difficulty)}>
                                        {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <select className="flex-1 bg-white/60 text-[10px] text-[#2c1810] rounded-lg px-2 py-1.5 border border-amber-900/20" value={editStageDependsOn} onChange={e => setEditStageDependsOn(e.target.value)}>
                                        <option value="">Без зависимости</option>
                                        {selectedProject.stages?.filter(s => s.id !== stage.id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <button onClick={() => saveEditingStage(stage.id)} className="p-1.5 bg-emerald-700 text-white rounded-lg shadow-sm"><Check size={14}/></button>
                                    <button onClick={cancelEditingStage} className="p-1.5 bg-amber-950/20 text-amber-900 rounded-lg"><X size={14}/></button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-2">
                                        {!isPrerequisiteMet && <Lock size={10} className="text-rose-800" />}
                                        <span className={`font-black text-xs uppercase tracking-tight ${isCompleted ? 'text-emerald-800' : 'text-amber-950'}`}>{stage.name}</span>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded-lg border font-black uppercase tracking-wider ${DIFFICULTY_COLORS[stage.difficulty]}`}>{stage.difficulty}</span>
                                    </div>
                                    {depStage && (
                                        <div className="flex items-center gap-1 mt-1 text-[8px] text-amber-900/40 font-bold uppercase tracking-widest">
                                            <LinkIcon size={8} />
                                            <span>Требует: {depStage.name}</span>
                                            {allCompletedIds.has(depStage.id) ? <Check size={8} className="text-emerald-700" /> : <Lock size={8} className="text-amber-900/20" />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black font-mono text-amber-900/40">{new Date(stage.date).toLocaleDateString('ru-RU')}</span>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all gap-1">
                                        <button onClick={() => startEditingStage(stage)} className="p-1.5 text-amber-900/30 hover:text-amber-900 bg-white/20 rounded-lg border border-transparent hover:border-amber-900/10 transition-all"><Pencil size={12} /></button>
                                        <button onClick={() => onDeleteStage(selectedProject.id, stage.id)} className="p-1.5 text-amber-900/30 hover:text-rose-700 bg-white/20 rounded-lg border border-transparent hover:border-rose-100 transition-all"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )})}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-amber-900/30 bg-[#fdf2d9]/40 rounded-2xl border-2 border-dashed border-amber-900/10 shadow-inner p-12 text-center">
             <Briefcase size={48} className="mb-4 opacity-10 animate-pulse mx-auto" />
             <p className="text-sm rpg-font uppercase tracking-widest font-black">Выберите кампанию слева</p>
             <span className="text-xs normal-case font-medium italic mt-2 block opacity-60">для настройки цепочки этапов похода</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;