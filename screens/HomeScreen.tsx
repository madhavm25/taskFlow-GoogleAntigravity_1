import React, { useState, useMemo, useEffect } from 'react';
import { useTasks } from '../context/TaskContext.tsx';
import TaskItem from '../components/TaskItem.tsx';
import { Priority } from '../types.ts';
import { PRIORITY_CONFIG } from '../constants.tsx';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Search, X, ListTodo, CheckCheck, RotateCcw, PartyPopper } from 'lucide-react';

const HomeScreen: React.FC = () => {
  const { 
    tasks, 
    settings, 
    markAllComplete, 
    undoMarkAllComplete,
    lastDeletedTask, 
    lastBulkActionSnapshot,
    restoreLastDeleted, 
    clearLastDeleted, 
    clearBulkActionSnapshot,
    setTasks 
  } = useTasks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showUndoDelete, setShowUndoDelete] = useState(false);
  const [showUndoBulk, setShowUndoBulk] = useState(false);
  const [localTasks, setLocalTasks] = useState<any[]>([]);

  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      let sorted = [...activeTasks];
      if (settings.sortBy === 'priority') {
        sorted.sort((a, b) => PRIORITY_CONFIG[b.priority].weight - PRIORITY_CONFIG[a.priority].weight);
      } else if (settings.sortBy === 'date') {
        sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      }
      setLocalTasks(sorted);
    }
  }, [activeTasks, settings.sortBy, searchQuery]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return localTasks;
    const query = searchQuery.toLowerCase();
    return activeTasks.filter(
      t => t.title.toLowerCase().includes(query) || 
           t.description.toLowerCase().includes(query)
    );
  }, [localTasks, activeTasks, searchQuery]);

  // Handle single delete undo snackbar
  useEffect(() => {
    if (lastDeletedTask) {
      setShowUndoDelete(true);
      setShowUndoBulk(false); // Preference given to last action
      const timer = setTimeout(() => {
        setShowUndoDelete(false);
        setTimeout(clearLastDeleted, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastDeletedTask, clearLastDeleted]);

  // Handle bulk complete undo snackbar
  useEffect(() => {
    if (lastBulkActionSnapshot) {
      setShowUndoBulk(true);
      setShowUndoDelete(false); // Preference given to last action
      const timer = setTimeout(() => {
        setShowUndoBulk(false);
        setTimeout(clearBulkActionSnapshot, 300);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [lastBulkActionSnapshot, clearBulkActionSnapshot]);

  const handleReorder = (newOrder: any[]) => {
    setLocalTasks(newOrder);
    if (settings.sortBy === 'manual') {
      const completed = tasks.filter(t => t.completed);
      setTasks([...newOrder, ...completed]);
    }
  };

  const triggerDragHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const handleMarkAllComplete = () => {
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    markAllComplete();
  };

  return (
    <div className="p-6">
      <header className="mb-6 mt-4 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Today</h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium mt-1">{today}</p>
          
          <AnimatePresence>
            {activeTasks.length > 1 && !searchQuery && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={handleMarkAllComplete}
                className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full text-xs font-bold shadow-lg shadow-accent-tonal transition-all active:scale-95 group"
              >
                <CheckCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Finish all {activeTasks.length} tasks
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <div className="p-3 bg-accent-tonal rounded-2xl" aria-hidden="true">
          <ListTodo className="w-6 h-6 text-accent" />
        </div>
      </header>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-neutral-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-white dark:bg-neutral-800 py-4 pl-12 pr-12 rounded-2xl border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-accent/20 outline-none transition-all text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 shadow-sm"
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-neutral-400"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {activeTasks.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-20 text-center">
          <div className="w-32 h-32 bg-accent-tonal rounded-full flex items-center justify-center mb-6">
            <PartyPopper className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">You're all caught up</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 px-6">Your task list is empty. Take a break and recharge!</p>
        </motion.div>
      ) : (
        <Reorder.Group 
          axis="y" 
          values={filteredTasks} 
          onReorder={handleReorder}
          className="space-y-1 pb-10"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredTasks.map(task => (
              <Reorder.Item 
                key={task.id} 
                value={task}
                onDragStart={triggerDragHaptic}
                className="relative active:z-50"
              >
                <TaskItem task={task} />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Undo Snakbars Container */}
      <div className="fixed bottom-24 left-6 right-6 z-50 pointer-events-none space-y-2">
        {/* Single Delete Undo */}
        <AnimatePresence>
          {showUndoDelete && lastDeletedTask && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className="bg-neutral-900 dark:bg-neutral-800 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10">
                <span className="text-sm font-medium truncate">Deleted "{lastDeletedTask.title}"</span>
                <button
                  onClick={() => { restoreLastDeleted(); setShowUndoDelete(false); }}
                  className="ml-4 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold active:scale-95 transition-transform"
                >
                  Undo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Complete Undo */}
        <AnimatePresence>
          {showUndoBulk && lastBulkActionSnapshot && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className="bg-neutral-900 dark:bg-neutral-800 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-accent/30">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-accent/20 rounded-lg">
                    <CheckCheck className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium">All tasks marked as done</span>
                </div>
                <button
                  onClick={() => { undoMarkAllComplete(); setShowUndoBulk(false); }}
                  className="ml-4 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold active:scale-95 transition-transform flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Undo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HomeScreen;