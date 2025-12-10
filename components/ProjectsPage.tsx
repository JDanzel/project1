import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Target, Briefcase, ChevronRight, X, Swords, Pencil, Check } from 'lucide-react';
import { Task, TaskType, Category, Difficulty, TaskStage } from '../types';
import { XP_RATES } from '../constants';

interface ProjectsPageProps {
  tasks: Task[];
  onAddProject: (name: string) => void;
  onDeleteProject: (taskId: string) => void;
  onAddStage: (taskId: string, stage: Omit<TaskStage, 'id'>) => void;
  onDeleteStage: (taskId: string, stageId: string) => void;
  onUpdateStage: (taskId: string, stageId: string, updates: Partial<TaskStage>) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ tasks, onAddProject, onDeleteProject, onAddStage, onDeleteStage, onUpdateStage }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Stage Creation State
  const [stageName, setStageName] = useState('');
  const [stageDate, setStageDate] = useState('');
  const [stageDifficulty, setStageDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);

  // Stage Editing State
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editStageName, setEditStageName] = useState('');
  const [editStageDate, setEditStageDate] = useState('');
  const [editStageDifficulty, setEditStageDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);

  const projects = tasks.filter(t => t.type === TaskType.TEMPORARY);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Reset editing state when project changes
  useEffect(() => {
    setEditingStageId(null);
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
        difficulty: stageDifficulty
      });
      setStageName('');
      setStageDate('');
      setStageDifficulty(Difficulty.MEDIUM);
    }
  };

  const startEditingStage = (stage: TaskStage) => {
    setEditingStageId(stage.id);
    setEditStageName(stage.name);
    setEditStageDate(stage.date);
    setEditStageDifficulty(stage.difficulty);
  };

  const cancelEditingStage = () => {
    setEditingStageId(null);
  };

  const saveEditingStage = (stageId: string) => {
    if (selectedProjectId && editStageName.trim() && editStageDate) {
        onUpdateStage(selectedProjectId, stageId, {
            name: editStageName,
            date: editStageDate,
            difficulty: editStageDifficulty
        });
        setEditingStageId(null);
    }
  };

  const DIFFICULTY_COLORS = {
    [Difficulty.EASY]: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    [Difficulty.MEDIUM]: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    [Difficulty.HARD]: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    [Difficulty.EPIC]: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-24 animate-in fade-in duration-300">
      
      {/* Left Column: Project List */}
      <div className="md:col-span-4 space-y-4">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h2 className="text-lg rpg-font text-amber-500 mb-4 flex items-center gap-2">
            <Briefcase size={20} /> Стратегические Проекты
          </h2>
          
          <form onSubmit={handleCreateProject} className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Новый проект..."
              className="bg-slate-950 text-sm text-white rounded px-3 py-2 flex-1 border border-slate-700 focus:border-amber-500 outline-none"
            />
            <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded transition-colors">
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {projects.length === 0 && (
                <div className="text-center text-slate-600 text-xs italic py-4">Список пуст</div>
            )}
            {projects.map(project => (
              <div 
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all group flex items-center justify-between ${selectedProjectId === project.id ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800'}`}
              >
                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm truncate ${selectedProjectId === project.id ? 'text-amber-400' : 'text-slate-300'}`}>{project.name}</h3>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>{project.stages?.length || 0} этапов</span>
                    </div>
                </div>
                {selectedProjectId === project.id ? <ChevronRight size={16} className="text-amber-500" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Stage Manager */}
      <div className="md:col-span-8">
        {selectedProject ? (
          <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-700">
                <div>
                    <h2 className="text-2xl rpg-font text-white">{selectedProject.name}</h2>
                    <p className="text-xs text-slate-400 mt-1">Управление этапами выполнения</p>
                </div>
                <button 
                    onClick={() => {
                        if(confirm('Удалить проект и все его этапы?')) {
                            onDeleteProject(selectedProject.id);
                            setSelectedProjectId(null);
                        }
                    }}
                    className="text-slate-500 hover:text-rose-500 transition-colors p-2"
                    title="Удалить проект"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Add Stage Form */}
            <form onSubmit={handleCreateStage} className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Target size={14} /> Добавить Этап
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                    <div className="md:col-span-6">
                        <input 
                            type="text" 
                            value={stageName}
                            onChange={(e) => setStageName(e.target.value)}
                            placeholder="Название этапа..."
                            className="w-full bg-slate-900 text-sm text-white rounded px-3 py-2 border border-slate-700 focus:border-amber-500 outline-none"
                            required
                        />
                    </div>
                    <div className="md:col-span-3">
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                type="date" 
                                value={stageDate}
                                onChange={(e) => setStageDate(e.target.value)}
                                className="w-full bg-slate-900 text-sm text-white rounded px-3 py-2 pl-9 border border-slate-700 focus:border-amber-500 outline-none appearance-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <select 
                            value={stageDifficulty}
                            onChange={(e) => setStageDifficulty(e.target.value as Difficulty)}
                            className="w-full bg-slate-900 text-sm text-white rounded px-3 py-2 border border-slate-700 focus:border-amber-500 outline-none"
                        >
                            {Object.values(Difficulty).map(d => (
                                <option key={d} value={d}>{d} ({XP_RATES[d]} XP)</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2 rounded font-bold flex items-center gap-2">
                        <Plus size={14} /> Добавить Этап
                    </button>
                </div>
            </form>

            {/* Stages List */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {!selectedProject.stages?.length && (
                    <div className="text-center py-10 opacity-30 flex flex-col items-center">
                        <Target size={48} className="mb-2" />
                        <p>Нет запланированных этапов</p>
                    </div>
                )}
                
                {selectedProject.stages?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((stage) => (
                    <div key={stage.id} className="group flex items-center gap-4 p-3 rounded bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all">
                        {editingStageId === stage.id ? (
                            // Editing Mode
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                                <div className="md:col-span-5">
                                    <input 
                                        type="text" 
                                        value={editStageName}
                                        onChange={(e) => setEditStageName(e.target.value)}
                                        className="w-full bg-slate-950 text-xs text-white rounded px-2 py-1.5 border border-slate-600 focus:border-amber-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <input 
                                        type="date" 
                                        value={editStageDate}
                                        onChange={(e) => setEditStageDate(e.target.value)}
                                        className="w-full bg-slate-950 text-xs text-white rounded px-2 py-1.5 border border-slate-600 focus:border-amber-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <select 
                                        value={editStageDifficulty}
                                        onChange={(e) => setEditStageDifficulty(e.target.value as Difficulty)}
                                        className="w-full bg-slate-950 text-xs text-white rounded px-2 py-1.5 border border-slate-600 focus:border-amber-500 outline-none"
                                    >
                                        {Object.values(Difficulty).map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-1">
                                    <button onClick={() => saveEditingStage(stage.id)} className="p-1.5 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600 hover:text-white transition-colors">
                                        <Check size={14} />
                                    </button>
                                    <button onClick={cancelEditingStage} className="p-1.5 bg-slate-700 text-slate-400 rounded hover:bg-slate-600 hover:text-white transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-slate-200">{stage.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold ${DIFFICULTY_COLORS[stage.difficulty]}`}>
                                            {stage.difficulty}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                                        <Calendar size={14} />
                                        <span>{new Date(stage.date).toLocaleDateString('ru-RU')}</span>
                                    </div>
                                    
                                    <div className="text-amber-500/50 font-bold text-xs" title="Награда за выполнение">
                                        +{XP_RATES[stage.difficulty]} XP
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={() => startEditingStage(stage)}
                                            className="text-slate-500 hover:text-blue-400 p-1"
                                            title="Редактировать"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteStage(selectedProject.id, stage.id)}
                                            className="text-slate-500 hover:text-rose-500 p-1"
                                            title="Удалить"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
             <Swords size={64} className="mb-4 opacity-20" />
             <p>Выберите или создайте проект слева, чтобы управлять этапами</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;