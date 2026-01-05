export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
  imageUrl?: string;
  subtasks?: Subtask[];
}

export type SortOption = 'date' | 'priority' | 'manual';
export type SwipeAction = 'complete' | 'delete' | 'none' | 'edit';

export interface AppSettings {
  darkMode: boolean;
  sortBy: SortOption;
  swipeLeft: SwipeAction;
  swipeRight: SwipeAction;
  silentMode: boolean;
  accentColor: string;
}