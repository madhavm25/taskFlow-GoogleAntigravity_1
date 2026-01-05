import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, Priority, SortOption, AppSettings, SwipeAction } from '../types.ts';

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  settings: AppSettings;
  lastDeletedTask: Task | null;
  lastBulkActionSnapshot: Task[] | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  clearCompleted: () => void;
  markAllComplete: () => void;
  undoMarkAllComplete: () => void;
  restoreLastDeleted: () => void;
  clearLastDeleted: () => void;
  clearBulkActionSnapshot: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEY_TASKS = 'taskflow_tasks';
const STORAGE_KEY_SETTINGS = 'taskflow_settings';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaultSettings: AppSettings = {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      sortBy: 'date' as SortOption,
      swipeLeft: 'delete' as SwipeAction,
      swipeRight: 'complete' as SwipeAction,
      silentMode: false,
      accentColor: '#4f46e5'
    };
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);
  const [lastBulkActionSnapshot, setLastBulkActionSnapshot] = useState<Task[] | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    root.style.setProperty('--color-accent', settings.accentColor);
    root.style.setProperty('--color-accent-tonal', `${settings.accentColor}1a`);
    root.style.setProperty('--color-accent-tonal-heavy', `${settings.accentColor}33`);
    
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      completed: false
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const taskToDelete = prev.find(t => t.id === id);
      if (taskToDelete) {
        setLastDeletedTask(taskToDelete);
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(t => !t.completed));
  }, []);

  const markAllComplete = useCallback(() => {
    setLastBulkActionSnapshot([...tasks]);
    setTasks(prev => prev.map(t => ({ ...t, completed: true })));
  }, [tasks]);

  const undoMarkAllComplete = useCallback(() => {
    if (lastBulkActionSnapshot) {
      setTasks(lastBulkActionSnapshot);
      setLastBulkActionSnapshot(null);
    }
  }, [lastBulkActionSnapshot]);

  const restoreLastDeleted = useCallback(() => {
    if (lastDeletedTask) {
      setTasks(prev => {
        if (prev.find(t => t.id === lastDeletedTask.id)) return prev;
        return [lastDeletedTask, ...prev].sort((a, b) => b.createdAt - a.createdAt);
      });
      setLastDeletedTask(null);
    }
  }, [lastDeletedTask]);

  const clearLastDeleted = useCallback(() => {
    setLastDeletedTask(null);
  }, []);

  const clearBulkActionSnapshot = useCallback(() => {
    setLastBulkActionSnapshot(null);
  }, []);

  return (
    <TaskContext.Provider value={{
      tasks,
      setTasks,
      settings,
      lastDeletedTask,
      lastBulkActionSnapshot,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      updateSettings,
      clearCompleted,
      markAllComplete,
      undoMarkAllComplete,
      restoreLastDeleted,
      clearLastDeleted,
      clearBulkActionSnapshot
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};