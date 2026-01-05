import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext.tsx';
import { Moon, Sun, Filter, Palette, ShieldCheck, Heart, ArrowLeft, ArrowRight, AlertTriangle, Check, Volume2, VolumeX } from 'lucide-react';
import { SwipeAction, SortOption } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';

const ACCENT_PRESETS = [
  { name: 'Indigo', color: '#4f46e5' },
  { name: 'Violet', color: '#8b5cf6' },
  { name: 'Sky', color: '#0ea5e9' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Fuchsia', color: '#d946ef' },
];

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, clearCompleted, tasks } = useTasks();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const completedCount = tasks.filter(t => t.completed).length;

  const toggleTheme = () => updateSettings({ darkMode: !settings.darkMode });
  const toggleSilentMode = () => updateSettings({ silentMode: !settings.silentMode });

  const SettingGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1 mb-4">{title}</h3>
      <div className="bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden border border-neutral-100 dark:border-neutral-700 shadow-sm">
        {children}
      </div>
    </div>
  );

  const SettingItem: React.FC<{ 
    icon: React.ElementType; 
    label: string; 
    action: React.ReactNode;
    last?: boolean;
    description?: string;
  }> = ({ icon: Icon, label, action, last, description }) => (
    <div className={`p-4 flex items-center justify-between ${!last ? 'border-b border-neutral-50 dark:border-neutral-700/50' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <span className="font-medium text-neutral-800 dark:text-neutral-100 block transition-colors">{label}</span>
          {description && <span className="text-[10px] text-neutral-400 block mt-0.5">{description}</span>}
        </div>
      </div>
      <div>{action}</div>
    </div>
  );

  return (
    <div className="p-6">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium mt-1">Personalize your flow</p>
      </header>

      <SettingGroup title="Personalization">
        <SettingItem
          icon={settings.darkMode ? Moon : Sun}
          label="Dark Mode"
          description={settings.darkMode ? "Easier on your eyes" : "Classic light theme"}
          action={
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full relative transition-colors ${settings.darkMode ? 'bg-accent' : 'bg-neutral-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-6' : ''}`} />
            </button>
          }
        />
        
        <div className="p-4 border-b border-neutral-50 dark:border-neutral-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
              <Palette className="w-5 h-5" />
            </div>
            <span className="font-medium text-neutral-800 dark:text-neutral-100">Theme Color</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.color}
                onClick={() => updateSettings({ accentColor: preset.color })}
                className="relative w-10 h-10 rounded-full transition-transform active:scale-90 flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
                style={{ backgroundColor: preset.color }}
              >
                {settings.accentColor === preset.color && (
                  <motion.div layoutId="activeAccent" className="text-white">
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>

        <SettingItem
          icon={settings.silentMode ? VolumeX : Volume2}
          label="Silent Mode"
          description="Use haptics for completion"
          action={
            <button
              onClick={toggleSilentMode}
              className={`w-12 h-6 rounded-full relative transition-colors ${settings.silentMode ? 'bg-accent' : 'bg-neutral-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.silentMode ? 'translate-x-6' : ''}`} />
            </button>
          }
        />
        <SettingItem
          icon={Filter}
          label="Sort Method"
          last
          action={
            <select
              value={settings.sortBy}
              onChange={(e) => updateSettings({ sortBy: e.target.value as SortOption })}
              className="bg-transparent text-sm font-bold text-accent outline-none cursor-pointer"
            >
              <option value="manual">Manual (Drag)</option>
              <option value="date">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          }
        />
      </SettingGroup>

      <SettingGroup title="Gestures">
        <SettingItem
          icon={ArrowLeft}
          label="Swipe Left"
          action={
            <select
              value={settings.swipeLeft}
              onChange={(e) => updateSettings({ swipeLeft: e.target.value as SwipeAction })}
              className="bg-transparent text-sm font-bold text-accent outline-none text-right cursor-pointer"
            >
              <option value="delete">Delete</option>
              <option value="complete">Complete</option>
              <option value="edit">Edit</option>
              <option value="none">None</option>
            </select>
          }
        />
        <SettingItem
          icon={ArrowRight}
          label="Swipe Right"
          last
          action={
            <select
              value={settings.swipeRight}
              onChange={(e) => updateSettings({ swipeRight: e.target.value as SwipeAction })}
              className="bg-transparent text-sm font-bold text-accent outline-none text-right cursor-pointer"
            >
              <option value="complete">Complete</option>
              <option value="delete">Delete</option>
              <option value="edit">Edit</option>
              <option value="none">None</option>
            </select>
          }
        />
      </SettingGroup>

      <SettingGroup title="Danger Zone">
        <SettingItem
          icon={ShieldCheck}
          label="Wipe Completed"
          description={`${completedCount} tasks ready for removal`}
          last
          action={
            <button
              onClick={() => setShowConfirmClear(true)}
              disabled={completedCount === 0}
              className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${completedCount === 0 ? 'text-neutral-300 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}
            >
              Clear
            </button>
          }
        />
      </SettingGroup>

      <AnimatePresence>
        {showConfirmClear && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirmClear(false)} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm bg-white dark:bg-neutral-800 rounded-[2.5rem] p-6 shadow-2xl border border-neutral-100 dark:border-neutral-700">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Clear history?</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">This will permanently delete all your finished tasks. This cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowConfirmClear(false)} className="px-6 py-2 text-sm font-bold text-neutral-500">Cancel</button>
                <button onClick={() => { clearCompleted(); setShowConfirmClear(false); }} className="px-6 py-2 bg-rose-500 text-white rounded-full text-sm font-bold shadow-lg shadow-rose-100 active:scale-95 transition-transform">Clear All</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsScreen;