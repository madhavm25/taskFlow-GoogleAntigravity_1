
import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext.tsx';
import TaskItem from '../components/TaskItem.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';

const CompletedScreen: React.FC = () => {
  const { tasks, clearCompleted } = useTasks();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const completedTasks = tasks.filter(t => t.completed);

  const handleClearRequest = () => {
    if (completedTasks.length > 0) {
      setShowConfirmClear(true);
    }
  };

  const confirmClear = () => {
    clearCompleted();
    setShowConfirmClear(false);
  };

  return (
    <div className="p-6">
      <header className="mb-8 mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Completed</h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            {completedTasks.length} {completedTasks.length === 1 ? 'task' : 'tasks'} finished
          </p>
        </div>
        {completedTasks.length > 0 && (
          <button
            onClick={handleClearRequest}
            aria-label="Clear all completed tasks"
            className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors active:scale-95"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </header>

      {completedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-32 h-32 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">No completed tasks</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 px-6">
            Keep crushing those goals! Finished tasks will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {completedTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Confirmation Dialog (Material 3 Standard) */}
      <AnimatePresence>
        {showConfirmClear && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmClear(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-sm bg-white dark:bg-neutral-800 rounded-[2rem] p-6 shadow-2xl border border-neutral-100 dark:border-neutral-700"
              role="alertdialog"
              aria-labelledby="clear-dialog-title"
              aria-describedby="clear-dialog-desc"
            >
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mb-5">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                </div>
                <h3 id="clear-dialog-title" className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Empty history?
                </h3>
                <p id="clear-dialog-desc" className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
                  You are about to permanently remove {completedTasks.length} completed tasks. This cannot be undone.
                </p>
                <div className="flex items-center justify-end w-full gap-2">
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="px-6 py-2.5 text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmClear}
                    className="px-6 py-2.5 text-sm font-bold bg-rose-500 text-white rounded-full shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition-all active:scale-95"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompletedScreen;
