
import React from 'react';
import { Priority } from './types.ts';
import { Circle, AlertCircle, Zap } from 'lucide-react';

export const PRIORITY_CONFIG = {
  [Priority.LOW]: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: <Circle className="w-4 h-4" />,
    label: 'Low',
    weight: 0
  },
  [Priority.MEDIUM]: {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Medium',
    weight: 1
  },
  [Priority.HIGH]: {
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    icon: <Zap className="w-4 h-4" />,
    label: 'High',
    weight: 2
  }
};
