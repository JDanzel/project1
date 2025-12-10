import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskType, TaskStage } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, Coffee, Sword, Dumbbell, BookOpen, Zap, Briefcase, StopCircle, X, Trophy, Settings2 } from 'lucide-react';
import { TASK_DURATIONS, XP_RATES, XP_PER_TASK } from '../constants';

interface PomodoroPageProps {
  tasks: Task[];
  onCompleteTask: (taskId: string, date?: string) => void;
  onBack: () => void;
}

// Allowed Predefined IDs + Temporary Task Type
const ALLOWED_TASK_IDS = ['basic_charge', 'const_run', 'const_strength', 'const_read'];

type TimerPhase = 'idle' | 'work' | 'break' | 'completed';

const PomodoroPage: React.FC<PomodoroPageProps> = ({ tasks, onCompleteTask, onBack }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  
  const [showStageSelector, setShowStageSelector] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardXP, setRewardXP] = useState(0);

  // Custom Timer Settings
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questTasks = tasks.filter(t => ALLOWED_TASK_IDS.includes(t.id) || t.type === TaskType.TEMPORARY);

  const getTaskIcon = (task: Task) => {
      if (task.type === TaskType.TEMPORARY) return Briefcase;
      switch (task.id) {
        case 'basic_charge': return Zap;
        case 'const_run': return Zap; 
        case 'const_strength': return Dumbbell;
        case 'const_read': return BookOpen;
        default: return Sword;
      }
  };

  const handleTaskClick = (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (task.type === TaskType.TEMPORARY) {
          // Open Stage Selector
          setSelectedTaskId(taskId);
          setShowStageSelector(true);
      } else {
          // Start Standard Task
          startStandardQuest(taskId);
      }
  };

  const startStandardQuest = (taskId: string) => {
      const duration = TASK_DURATIONS[taskId] || 25 * 60;
      setSelectedTaskId(taskId);
      setSelectedStageId(null);
      setPhase('work');
      setTimeLeft(duration);
      setIsRunning(true);
      setCyclesCompleted(0);
  };

  const startProjectQuest = (stageId: string) => {
      setSelectedStageId(stageId);
      setShowStageSelector(false);
      setPhase('work');
      // Use custom work minutes
      setTimeLeft(workMinutes * 60); 
      setIsRunning(true);
      setCyclesCompleted(0);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPhase('idle');
    setSelectedTaskId(null);
    setSelectedStageId(null);
    setCyclesCompleted(0);
    setShowRewardModal(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Called manually for Projects
  const finishProjectTask = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!selectedTaskId || !selectedStageId) return;

      const task = tasks.find(t => t.id === selectedTaskId);
      const stage = task?.stages?.find(s => s.id === selectedStageId);
      
      if (stage) {
          onCompleteTask(stage.id, stage.date);
          setRewardXP(XP_RATES[stage.difficulty]);
          setShowRewardModal(true);
          setPhase('completed');
          setIsRunning(false);
      }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handlePhaseComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handlePhaseComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    const task = tasks.find(t => t.id === selectedTaskId);
    const isProject = task?.type === TaskType.TEMPORARY;

    if (isProject) {
        // Infinite Loop Logic for Projects
        if (phase === 'work') {
            setPhase('break');
            // Use custom break minutes
            setTimeLeft(breakMinutes * 60);
        } else {
            setPhase('work');
            // Use custom work minutes
            setTimeLeft(workMinutes * 60);
        }
        setIsRunning(true); // Auto-continue
    } else {
        // Standard Task Logic: Timer Ends -> Complete
        if (selectedTaskId) {
            onCompleteTask(selectedTaskId);
            setRewardXP(XP_PER_TASK); // Standard XP
            setShowRewardModal(true);
        }
        setPhase('completed');
        setIsRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const selectedStage = selectedTask?.stages?.find(s => s.id === selectedStageId);

  // Stage Selector Modal
  if (showStageSelector && selectedTask) {
      const incompleteStages = selectedTask.stages?.filter(s => {
          // Rudimentary check based on app state not passed here fully, 
          // but we can list all and user chooses. 
          // Ideally we filter out completed ones if we had log data here.
          return true;
      }) || [];

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full relative">
                  <button onClick={() => setShowStageSelector(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                      <X size={20} />
                  </button>
                  <h3 className="text-xl rpg-font text-white mb-4">Выберите Этап</h3>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                      {incompleteStages.length === 0 && <p className="text-slate-500 text-sm">Нет этапов. Добавьте их в разделе "Проекты".</p>}
                      {incompleteStages.map(stage => (
                          <button 
                            key={stage.id} 
                            onClick={() => startProjectQuest(stage.id)}
                            className="w-full text-left p-3 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500 transition-colors"
                          >
                              <div className="font-bold text-slate-200">{stage.name}</div>
                              <div className="flex justify-between mt-1 text-xs">
                                  <span className="text-slate-500">{new Date(stage.date).toLocaleDateString('ru-RU')}</span>
                                  <span className="text-amber-500">{stage.difficulty}</span>
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  // Reward Modal
  if (showRewardModal) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center animate-in zoom-in-95 duration-500 pb-24">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full" />
                <Trophy size={80} className="text-emerald-400 relative z-10 drop-shadow-lg" />
            </div>
            <h2 className="text-4xl rpg-font text-white mb-2 font-bold">Квест Завершен!</h2>
            <div className="text-emerald-400 text-2xl font-bold mb-8 bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/30">
                +{rewardXP} XP
            </div>
            <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                Отличная работа! Прогресс записан в журнал героя.
            </p>
            <button onClick={resetTimer} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-emerald-500/20">
                Принять Награду
            </button>
        </div>
      );
  }

  // Selection Screen
  if (phase === 'idle') {
    return (
      <div className="p-6 max-w-lg mx-auto animate-in fade-in duration-300 pb-24">
        <h2 className="text-2xl rpg-font text-white mb-2 text-center">Выбор Квеста</h2>
        <p className="text-slate-400 text-center text-sm mb-6">Задачи для концентрации</p>
        
        {/* Timer Config */}
        <div className="flex items-center justify-center gap-6 mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-col items-center">
                <label className="text-[10px] text-amber-500 uppercase font-bold tracking-wider mb-1">Работа (мин)</label>
                <input 
                    type="number" 
                    min="1" 
                    value={workMinutes} 
                    onChange={(e) => setWorkMinutes(Math.max(1, parseInt(e.target.value) || 25))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded p-2 text-center text-white font-mono focus:border-amber-500 outline-none"
                />
            </div>
            <div className="text-slate-600">
                <Settings2 size={20} />
            </div>
            <div className="flex flex-col items-center">
                <label className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider mb-1">Отдых (мин)</label>
                <input 
                    type="number" 
                    min="1" 
                    value={breakMinutes} 
                    onChange={(e) => setBreakMinutes(Math.max(1, parseInt(e.target.value) || 5))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded p-2 text-center text-white font-mono focus:border-emerald-500 outline-none"
                />
            </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {questTasks.map(task => {
            const Icon = getTaskIcon(task);
            return (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className="flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500 rounded-xl transition-all group"
              >
                <div className="bg-slate-900 p-3 rounded-full border border-slate-600 group-hover:border-amber-400">
                  <Icon className="text-amber-400" size={24} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-bold text-slate-200 group-hover:text-white">{task.name}</h3>
                  {task.type === TaskType.TEMPORARY ? (
                      <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-400 uppercase tracking-wider font-bold">Проект</span>
                          <span className="text-[10px] text-slate-500">∞ Бесконечный цикл</span>
                      </div>
                  ) : (
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                          {Math.floor((TASK_DURATIONS[task.id] || 0) / 60)} Минут
                      </span>
                  )}
                </div>
                <Play className="text-slate-600 group-hover:text-emerald-400" size={20} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Timer Screen
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] p-6 pb-24 relative overflow-hidden">
        <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${phase === 'break' ? 'bg-emerald-900' : 'bg-rose-900'}`} />

        <div className="z-10 text-center w-full max-w-md">
            <h3 className="text-slate-200 text-lg font-bold mb-1">{selectedTask?.name}</h3>
            {selectedStage && <p className="text-amber-500 text-sm mb-4">{selectedStage.name}</p>}
            
            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border ${phase === 'break' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'}`}>
                {phase === 'work' ? <Sword size={12} /> : <Coffee size={12} />}
                {phase === 'work' ? 'Битва (Работа)' : 'Привал (Отдых)'}
            </div>

            <div className="relative w-64 h-64 mx-auto mb-10 flex items-center justify-center">
                <div className="text-6xl font-bold font-mono text-white drop-shadow-lg relative z-10">
                    {formatTime(timeLeft)}
                </div>
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin" style={{ animationDuration: '3s' }} /> 
            </div>

            <div className="flex items-center justify-center gap-6">
                <button onClick={resetTimer} className="p-4 rounded-full bg-slate-800 text-slate-400 hover:text-white border border-slate-700">
                    <RotateCcw size={24} />
                </button>
                <button onClick={toggleTimer} className={`p-6 rounded-full shadow-lg ${isRunning ? 'bg-amber-500' : 'bg-emerald-600'} text-white`}>
                    {isRunning ? <Pause size={32} /> : <Play size={32} />}
                </button>
            </div>

            {selectedTask?.type === TaskType.TEMPORARY && (
                <button onClick={finishProjectTask} className="mt-8 flex items-center gap-2 text-rose-400 hover:text-rose-300 mx-auto uppercase text-xs font-bold tracking-widest border border-rose-500/30 px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-all">
                    <StopCircle size={16} /> Завершить этап
                </button>
            )}
        </div>
    </div>
  );
};

export default PomodoroPage;