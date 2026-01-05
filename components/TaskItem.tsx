import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Pencil, Calendar, Ban, ChevronDown, ChevronUp, MoreVertical, Copy, Image as ImageIcon } from 'lucide-react';
import { Task, SwipeAction } from '../types.ts';
import { PRIORITY_CONFIG } from '../constants.tsx';
import { useTasks } from '../context/TaskContext.tsx';

interface TaskItemProps {
  task: Task;
}

// Fix: Create audio instance once outside component to prevent lag/memory issues
const completionAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
completionAudio.volume = 0.2;

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask, deleteTask, updateTask, settings } = useTasks();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const priority = PRIORITY_CONFIG[task.priority];

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-160, -100, 0, 100, 160], [0, 0.4, 1, 0.4, 0]);
  const scale = useTransform(x, [-160, 0, 160], [0.98, 1, 0.98]);

  const getActionUI = (action: SwipeAction) => {
    switch (action) {
      case 'complete':
        return {
          icon: <CheckCircle2 className="w-5 h-5 mr-2" />,
          label: task.completed ? 'Undo' : 'Complete',
          colorClass: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'delete':
        return {
          icon: <Trash2 className="w-5 h-5 mr-2" />,
          label: 'Delete',
          colorClass: 'text-rose-600 dark:text-rose-400',
        };
      case 'edit':
        return {
          icon: <Pencil className="w-5 h-5 mr-2" />,
          label: 'Edit',
          colorClass: 'text-accent',
        };
      default:
        return {
          icon: <Ban className="w-5 h-5 mr-2" />,
          label: 'None',
          colorClass: 'text-neutral-400',
        };
    }
  };

  const leftActionUI = getActionUI(settings.swipeRight);
  const rightActionUI = getActionUI(settings.swipeLeft);

  const leftSideOpacity = useTransform(x, [20, 80], [0, 1]);
  const rightSideOpacity = useTransform(x, [-80, -20], [1, 0]);

  const triggerFeedback = (isCompleting: boolean) => {
    if (!isCompleting) {
      if (navigator.vibrate) navigator.vibrate(10);
      return;
    }
    if (settings.silentMode) {
      if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
    } else {
      completionAudio.currentTime = 0; // Reset to start
      completionAudio.play().catch(() => { });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerFeedback(!task.completed);
    toggleTask(task.id);
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) executeAction(settings.swipeRight);
    else if (info.offset.x < -threshold) executeAction(settings.swipeLeft);
  };

  const executeAction = (action: SwipeAction) => {
    if (action === 'complete') {
      triggerFeedback(!task.completed);
      toggleTask(task.id);
    }
    if (action === 'delete') {
      if (navigator.vibrate) navigator.vibrate(20);
      deleteTask(task.id);
    }
    if (action === 'edit') navigate(`/edit/${task.id}`);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(15);
    setShowMenu(false);
    navigate('/add', { state: { duplicateTask: task } });
  };

  const toggleSubtask = (subtaskId: string) => {
    if (!task.subtasks) return;
    const becomingCompleted = !task.subtasks.find(st => st.id === subtaskId)?.completed;
    triggerFeedback(becomingCompleted);
    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask(task.id, { subtasks: updatedSubtasks });
  };

  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasksCount = task.subtasks?.filter(st => st.completed).length || 0;
  const progress = subtasksCount > 0 ? (completedSubtasksCount / subtasksCount) * 100 : 0;

  return (
    <div
      className="relative mb-3 rounded-3xl group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-3xl bg-neutral-100 dark:bg-neutral-800/40 -z-10 overflow-hidden">
        <motion.div style={{ opacity: leftSideOpacity }} className={`flex items-center font-bold text-sm ${leftActionUI.colorClass}`}>
          {leftActionUI.icon} {leftActionUI.label}
        </motion.div>
        <motion.div style={{ opacity: rightSideOpacity }} className={`flex items-center font-bold text-sm ${rightActionUI.colorClass}`}>
          {rightActionUI.icon} {rightActionUI.label}
        </motion.div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{
          left: settings.swipeLeft === 'none' ? 0 : -160,
          right: settings.swipeRight === 'none' ? 0 : 160
        }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        style={{ x, opacity, scale }}
        className={`bg-white dark:bg-neutral-800 p-4 rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-sm transition-colors ${showMenu ? 'z-50' : 'z-10'}`}
      >
        <div className="flex items-start gap-4">
          <button onClick={handleToggle} className="mt-1 flex-shrink-0">
            <AnimatePresence mode="wait">
              {task.completed ? (
                <motion.div key="done" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                  <CheckCircle2 className="w-6 h-6 text-accent fill-accent-tonal transition-colors" />
                </motion.div>
              ) : (
                <motion.div key="todo" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                  <Circle className="w-6 h-6 text-neutral-300 dark:text-neutral-600 hover:text-accent transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  onClick={() => navigate(`/edit/${task.id}`)}
                  className={`font-semibold truncate transition-all cursor-pointer ${task.completed ? 'line-through text-neutral-400 opacity-60' : 'text-neutral-900 dark:text-neutral-100'}`}
                >
                  {task.title}
                </h3>
                {task.description && isHovered && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 line-clamp-1 italic">
                    {task.description}
                  </motion.p>
                )}
              </div>

              {/* Task Image Preview */}
              {task.imageUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={task.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-neutral-100 dark:border-neutral-700 shadow-sm transition-transform active:scale-150 active:z-50 cursor-zoom-in"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 ml-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${priority.color}`}>
                  {priority.label}
                </span>

                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className={`p-2 rounded-xl transition-colors ${showMenu ? 'bg-neutral-100 dark:bg-neutral-700' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
                  >
                    <MoreVertical className="w-5 h-5 text-neutral-400" />
                  </button>
                  <AnimatePresence>
                    {showMenu && (
                      <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMenu(false)} className="fixed inset-0 z-40 bg-transparent" />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className="absolute right-0 top-full mt-2 z-50 min-w-[140px] bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-700 py-2"
                        >
                          <button onClick={handleDuplicate} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                            <Copy className="w-4 h-4 text-neutral-400" /> Duplicate
                          </button>
                          <button onClick={() => navigate(`/edit/${task.id}`)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                            <Pencil className="w-4 h-4 text-neutral-400" /> Edit
                          </button>
                          <button onClick={() => deleteTask(task.id)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {subtasksCount > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-50 dark:border-neutral-700/50">
                <div className="flex items-center justify-between mb-1.5">
                  <button onClick={() => setIsExpanded(!isExpanded)} className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1">
                    {completedSubtasksCount}/{subtasksCount} steps
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <div className="flex-1 h-1 bg-neutral-100 dark:bg-neutral-700/50 rounded-full overflow-hidden ml-4">
                    <motion.div animate={{ width: `${progress}%` }} className={`h-full rounded-full transition-colors ${progress === 100 ? 'bg-emerald-500' : 'bg-accent'}`} />
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-1.5 mt-2 overflow-hidden">
                      {task.subtasks?.map(st => (
                        <div key={st.id} onClick={() => toggleSubtask(st.id)} className="flex items-center gap-2 cursor-pointer group/st p-1 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                          {st.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />}
                          <span className={`text-xs ${st.completed ? 'line-through text-neutral-300' : 'text-neutral-600 dark:text-neutral-300'}`}>{st.title}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskItem;