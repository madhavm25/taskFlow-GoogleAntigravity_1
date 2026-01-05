# 📘 Comprehensive Project Guide: TaskFlow

## 1. Introduction
**TaskFlow** is a modern, aesthetics-first To-Do application. It is designed to feel "native" on mobile devices with smooth animations and haptic feedback, while providing powerful features like AI text summarization and image generation.

---

## 2. Project Structure 📂
Here is the detailed breakdown of the codebase:

```
src/
├── components/          # Reusable UI building blocks
│   ├── Layout.tsx       # wrappers for navigation & transitions
│   └── TaskItem.tsx     # The individual task card component
├── context/
│   └── TaskContext.tsx  # Global state manager (The "Brain")
├── screens/             # Full page views
│   ├── AddEditScreen.tsx # Form to create/edit tasks
│   ├── HomeScreen.tsx    # Main dashboard
│   ├── SettingsScreen.tsx# User preferences
│   ├── CompletedScreen.tsx # (Optional) View for done tasks
│   └── SplashScreen.tsx  # Initial loading state
├── App.tsx              # Main Router setup
├── constants.tsx        # Config for colors, icons, priorities
├── index.css            # Global styles & Tailwind directives
├── index.tsx            # Entry point
└── types.ts             # TypeScript interfaces (Data Models)
```

---

## 3. Deep Dive: Key Modules 🔍

### A. The "Brain": TaskContext (`context/TaskContext.tsx`)
This is the most important file. It acts as the central database for the app running in your browser.
- **State**:
    - `tasks`: An array of all your to-dos.
    - `settings`: User preferences like Dark Mode, Sound, and Accent Color.
- **Persistence**: It uses `useEffect` hooks to automatically save everything to `localStorage`. This means if you close the tab and come back, your data is still there.
- **Actions**: It exposes functions like `addTask()`, `deleteTask()`, and `markAllComplete()` so any screen can modify data without needing to know *how* it's stored.

### B. The "Skeleton": Layout (`components/Layout.tsx`)
Every screen is wrapped in this component.
- **Navigation**: Renders the bottom navigation bar (`<nav>`).
- **Floating Action Button (FAB)**: The big "+" button at the bottom right.
- **Transitions**: It uses `Framer Motion` to animate pages sliding in and out (`opacity` and `x` axis transitions) as you navigate.

### C. The "Dashboard": HomeScreen (`screens/HomeScreen.tsx`)
- **Data Fetching**: Calls `useTasks()` to get the list of active tasks.
- **Logic**:
    - **Sorting**: Re-arranges tasks based on Date or Priority.
    - **Searching**: Filters tasks in real-time as you type in the search bar.
- **Empty States**: Shows a "Party Popper" animation if you have zero tasks.

### D. The "Creator": AddEditScreen (`screens/AddEditScreen.tsx`)
This screen handles complex user input.
- **Forms**: Inputs for Title, Description, Date, and Priority.
- **AI Integration**:
    - **Magic Wand**: Sends your description to Google Gemini API to generate a short, punchy title.
    - **AI Image**: ask Gemini to generate an icon/sticker based on your task.
- **Subtasks**: Allows you to add a checklist within a task.

### E. The "Card": TaskItem (`components/TaskItem.tsx`)
The standard unit of content.
- **Micro-interactions**:
    - **Swipe-to-Action**: You can drag the card left to delete or right to complete.
    - **Haptics**: Triggers `navigator.vibrate()` for tactile feedback on mobile.
    - **Audio**: Plays a sound effect when a task is checked off.

---

## 4. Data Models (`types.ts`) 📐
Understanding the data helps understand the app.

- **Task**:
    ```typescript
    interface Task {
      id: string;          // Unique ID
      title: string;       // "Buy Milk"
      description: string; // "2% and Chocolate"
      dueDate: string;     // "2024-01-01"
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      completed: boolean;
      subtasks: Subtask[]; // [{ title: "Go to store", completed: false }]
    }
    ```

- **AppSettings**:
    ```typescript
    interface AppSettings {
      darkMode: boolean;   // true/false
      accentColor: string; // "#4f46e5" (Indigo)
      silentMode: boolean; // if true, disable sound effects
    }
    ```

---

## 5. APIs & External Services 🌐

1.  **Google Gemini AI (`@google/genai`)**:
    - Used in `AddEditScreen`.
    - Requires `VITE_GEMINI_API_KEY` in `.env.local`.
    - **Flow**: User clicks "Wand" -> App sends text -> Gemini summarizes -> App updates Title input.

2.  **Local Storage (Browser API)**:
    - Used in `TaskContext`.
    - Keys: `taskflow_tasks` and `taskflow_settings`.
    - **Flow**: State changes -> `useEffect` detects change -> Writes JSON string to storage.

3.  **Vibration API**:
    - Used in `TaskItem` and `HomeScreen`.
    - Provides physical feedback on mobile devices.

---

## 6. How to Run 🚀

1.  **Install**: `npm install` (downloads React, Vite, Framer Motion, etc.)
2.  **Configure**: Create `.env.local` and add `GEMINI_API_KEY=...`
3.  **Run**: `npm run dev`
    - This starts the Vite development server.
    - Open `http://localhost:3000` to view.

---
*This document provides a complete technical roadmap of the TaskFlow application.*
