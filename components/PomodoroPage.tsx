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

// --- Audio Utility ---
const playNotificationSound = (type: 'bell' | 'success') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'bell') {
      // High-pitched crystal bell sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.5);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.8);
    } else if (type === 'success') {
      // Fantasy success arpeggio (C-E-G)
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + i * 0.1;
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.6);
      });
    }
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
};

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

  const finishProjectTask = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!selectedTaskId || !selectedStageId) return;

      const task = tasks.find(t => t.id === selectedTaskId);
      const stage = task?.stages?.find(s => s.id === selectedStageId);
      
      if (stage) {
          playNotificationSound('success');
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
    
    // Play sound notification
    playNotificationSound('bell');

    const task = tasks.find(t => t.id === selectedTaskId);
    const isProject = task?.type === TaskType.TEMPORARY;

    if (isProject) {
        if (phase === 'work') {
            setPhase('break');
            setTimeLeft(breakMinutes * 60);
        } else {
            setPhase('work');
            setTimeLeft(workMinutes * 60);
        }
        setIsRunning(true);
    } else {
        if (selectedTaskId) {
            onCompleteTask(selectedTaskId);
            setRewardXP(XP_PER_TASK);
            setShowRewardModal(true);
            playNotificationSound('success');
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

  // Stage Selector Modal - Centered and Visible
  if (showStageSelector && selectedTask) {
      const incompleteStages = selectedTask.stages || [];

      return (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
              <div className="bg-[#e8d2ac] border-4 border-amber-950 p-6 rounded-xl max-w-sm w-full relative shadow-2xl transform scale-100 transition-all duration-300">
                  <button onClick={() => setShowStageSelector(false)} className="absolute top-4 right-4 text-amber-950/40 hover:text-amber-950 p-1">
                      <X size={20} />
                  </button>
                  <h3 className="text-xl rpg-font text-amber-950 mb-4 uppercase font-black tracking-tight">ВЫБОР ЭТАПА ПОХОДА</h3>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                      {incompleteStages.length === 0 && <p className="text-amber-900/60 text-xs italic text-center py-4">Этапы не найдены. Создайте их в Кампаниях.</p>}
                      {incompleteStages.map(stage => (
                          <button 
                            key={stage.id} 
                            onClick={() => startProjectQuest(stage.id)}
                            className="w-full text-left p-3 rounded-lg bg-white/20 border border-amber-900/10 hover:border-amber-900/40 hover:bg-white/30 transition-all shadow-sm group"
                          >
                              <div className="font-black text-amber-950 uppercase tracking-tighter group-hover:text-amber-800">{stage.name}</div>
                              <div className="flex justify-between mt-1 text-[10px] font-bold uppercase tracking-widest text-amber-900/50">
                                  <span>{new Date(stage.date).toLocaleDateString('ru-RU')}</span>
                                  <span className="text-amber-700">{stage.difficulty}</span>
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
        <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center animate-in zoom-in-95 duration-500">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-10 rounded-full" />
                <Trophy size={80} className="text-amber-800 relative z-10 drop-shadow-xl" />
            </div>
            <h2 className="text-4xl rpg-font text-amber-950 mb-2 font-black uppercase tracking-tight">Квест Завершен!</h2>
            <div className="text-amber-900 text-2xl font-black mb-8 bg-amber-900/10 px-6 py-2 rounded-full border border-amber-900/20 shadow-inner">
                +{rewardXP} XP
            </div>
            <p className="text-amber-900/70 quote-font italic mb-8 max-w-xs mx-auto leading-relaxed">
                Твоя воля непоколебима, герой. Летопись пополнилась новым свершением.
            </p>
            <button onClick={resetTimer} className="bg-amber-950 hover:bg-amber-900 text-white px-10 py-4 rounded-lg font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-950/20">
                Забрать Награду
            </button>
        </div>
      );
  }

  // Selection Screen
  if (phase === 'idle') {
    return (
      <div className="max-w-lg mx-auto animate-in fade-in duration-300 space-y-8">
        <div className="text-center">
            <h2 className="text-3xl rpg-font text-amber-950 mb-2 uppercase font-black">Сбор Группы</h2>
            <p className="text-amber-900/60 quote-font italic">Подготовься к сосредоточенному труду</p>
        </div>
        
        {/* Timer Config */}
        <div className="flex items-center justify-center gap-8 bg-white/10 p-5 rounded-2xl border border-amber-900/10 backdrop-blur-sm shadow-inner">
            <div className="flex flex-col items-center">
                <label className="text-[10px] text-amber-900/50 uppercase font-black tracking-widest mb-1.5">Битва (мин)</label>
                <input 
                    type="number" 
                    min="1" 
                    value={workMinutes} 
                    onChange={(e) => setWorkMinutes(Math.max(1, parseInt(e.target.value) || 25))}
                    className="w-20 bg-amber-950/5 border border-amber-950/20 rounded-lg p-2.5 text-center text-amber-950 font-black focus:border-amber-700 outline-none transition-all shadow-sm"
                />
            </div>
            <div className="text-amber-900/30">
                <Settings2 size={24} />
            </div>
            <div className="flex flex-col items-center">
                <label className="text-[10px] text-emerald-900/50 uppercase font-black tracking-widest mb-1.5">Привал (мин)</label>
                <input 
                    type="number" 
                    min="1" 
                    value={breakMinutes} 
                    onChange={(e) => setBreakMinutes(Math.max(1, parseInt(e.target.value) || 5))}
                    className="w-20 bg-amber-950/5 border border-amber-950/20 rounded-lg p-2.5 text-center text-amber-950 font-black focus:border-amber-700 outline-none transition-all shadow-sm"
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
                className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 border border-amber-900/15 hover:border-amber-900/40 rounded-xl transition-all group shadow-md backdrop-blur-sm"
              >
                <div className="bg-[#fdf2d9]/60 p-3 rounded-xl border border-amber-950/10 group-hover:border-amber-900/30 transition-colors shadow-inner">
                  <Icon className="text-amber-900" size={24} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-black text-amber-950 uppercase tracking-tighter group-hover:text-amber-800">{task.name}</h3>
                  {task.type === TaskType.TEMPORARY ? (
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black">Проект</span>
                          <span className="text-[9px] text-amber-900/40 font-bold uppercase tracking-widest">∞ Бесконечный цикл</span>
                      </div>
                  ) : (
                      <span className="text-[10px] text-amber-900/50 uppercase tracking-widest font-black">
                          {Math.floor((TASK_DURATIONS[task.id] || 0) / 60)} Минут
                      </span>
                  )}
                </div>
                <Play className="text-amber-950/20 group-hover:text-amber-800 group-hover:scale-110 transition-all" size={20} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Timer Screen
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] relative overflow-hidden animate-in fade-in duration-700">
        <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${phase === 'break' ? 'bg-emerald-900' : 'bg-rose-900'}`} />

        <div className="z-10 text-center w-full max-w-md">
            <h3 className="text-amber-950 text-xl font-black uppercase tracking-tight mb-1">{selectedTask?.name}</h3>
            {selectedStage && <p className="text-amber-800 text-xs font-bold uppercase tracking-widest mb-6 opacity-60">{selectedStage.name}</p>}
            
            <div className={`inline-flex items-center gap-2 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-12 border-2 ${phase === 'break' ? 'border-emerald-700/30 bg-emerald-500/10 text-emerald-800' : 'border-rose-700/30 bg-rose-500/10 text-rose-800'}`}>
                {phase === 'work' ? <Sword size={12} /> : <Coffee size={12} />}
                {phase === 'work' ? 'Битва (Работа)' : 'Привал (Отдых)'}
            </div>

            <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
                <div className="text-6xl font-black font-mono text-amber-950 drop-shadow-md relative z-10">
                    {formatTime(timeLeft)}
                </div>
                <div className="absolute inset-0 border-8 border-amber-950/5 rounded-full shadow-inner" />
                <div className={`absolute inset-0 rounded-full border-t-8 border-r-8 transition-colors duration-500 animate-spin ${phase === 'break' ? 'border-emerald-600' : 'border-amber-700'}`} style={{ animationDuration: '3s' }} /> 
            </div>

            <div className="flex items-center justify-center gap-8">
                <button onClick={resetTimer} className="p-4 rounded-full bg-white/10 text-amber-950/50 hover:text-amber-950 border border-amber-950/10 hover:border-amber-950/30 transition-all shadow-md">
                    <RotateCcw size={28} />
                </button>
                <button onClick={toggleTimer} className={`p-7 rounded-full shadow-2xl transition-all transform active:scale-95 ${isRunning ? 'bg-amber-950 shadow-amber-950/40' : 'bg-emerald-800 shadow-emerald-950/40'} text-white`}>
                    {isRunning ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" />}
                </button>
            </div>

            {selectedTask?.type === TaskType.TEMPORARY && (
                <button onClick={finishProjectTask} className="mt-10 flex items-center gap-2 text-rose-800 hover:text-rose-600 mx-auto uppercase text-[10px] font-black tracking-[0.3em] border-2 border-rose-800/20 px-6 py-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 transition-all backdrop-blur-sm">
                    <StopCircle size={16} /> Завершить этап
                </button>
            )}
        </div>
    </div>
  );
};

export default PomodoroPage;