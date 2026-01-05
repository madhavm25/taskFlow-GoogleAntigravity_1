# Project Overview & Module Flow

## 🌟 High-Level Overview
**TaskFlow** is a modern, aesthetic To-Do application built with **React** and **Vite**. It features a "Material You" inspired design, smooth animations, and AI-powered features (using Google Gemini) to help users manage tasks efficiently.

## 🛠 Tech Stack
- **Core**: React, TypeScript, Vite
- **Styling**: Tailwind CSS (for layout/theming)
- **Animations**: Framer Motion (for swipe gestures and transitions)
- **Icons**: Lucide React
- **AI**: Google Generative AI SDK (Gemini)
- **Router**: React Router DOM

---

## 🔄 Module Flow Explained

### 1. Entry Point & State Management
Everything starts at `index.tsx`.
- It wraps the entire application in the `TaskProvider`.
- **`TaskContext.tsx`** is the "Brain" of the application.
    - It holds the **Global State**: `tasks` array, `settings` (dark mode, sound), and undo history.
    - It provides **Actions**: `addTask`, `deleteTask`, `toggleTask`, `markAllComplete`.
    - It handles **Persistence**: Automatically saves tasks and settings to `localStorage` so data isn't lost on refresh.

### 2. Navigation (Router)
`App.tsx` sets up the navigation structure.
- **`/` (Home Route)**: Renders `Layout` -> `HomeScreen`.
- **`/add`**: Renders `AddEditScreen` (for creating new tasks).
- **`/edit/:id`**: Renders `AddEditScreen` (pre-filled with existing task data).
- **`/settings`**: Renders `SettingsScreen`.

### 3. Screen Workflows

#### 🏠 HomeScreen (`screens/HomeScreen.tsx`)
This is the main dashboard.
1.  **Reads Data**: Hooks into `useTasks()` to get the list of tasks.
2.  **Filtering/Sorting**:
    - Filters out completed tasks (unless configured otherwise).
    - Sorts by Priority or Date.
    - Search functionality filters the list in real-time.
3.  **Rendering**: Maps through the filtered list and renders a `TaskItem` for each.
4.  **Gestures**: Supports reordering tasks via drag-and-drop (`Reorder.Group`).

#### 📝 Add/Edit Screen (`screens/AddEditScreen.tsx`)
This is where tasks are created or modified.
1.  **Input Handling**: Manages local state for Title, Description, Date, Priority, and Subtasks.
2.  **AI Features**:
    - **Magic Title**: Uses Gemini to summarize a long description into a punchy title.
    - **AI Image**: Generates a visual icon/sticker for the task context.
3.  **Smart Defaults**:
    - New tasks default to *Local Date* (fixed from UTC bug).
    - Subtask input adapts colors for Dark Mode.
4.  **Submission**:
    - Validates input (prevents double submits).
    - Calls `addTask` or `updateTask` from the Context.
    - Navigates back to Home.

#### 🧩 TaskItem Component (`components/TaskItem.tsx`)
The building block of the list.
1.  **Visuals**: Displays title, priority badge, and subtask progress bar.
2.  **Interactions**:
    - **Swipe Actions**: Swipe right to Complete, Swipe left to Delete (powered by Framer Motion).
    - **Audio Feedback**: Plays a satisfying "pop" sound on completion (optimized for performance).
    - **Quick Menu**: Duplicate, Edit, or Delete options.

---

## 📊 Data Flow Diagram

```mermaid
graph TD
    User[User Interaction] --> Router[App Router]
    
    subgraph Context [TaskContext (The Brain)]
        Store[Local Storage] <--> State[Tasks State]
        Actions[Actions: Add, Delete, Update]
    end

    Router --> Home[HomeScreen]
    Router --> Editor[AddEditScreen]

    Home -- Reads --> State
    Editor -- Reads/Writes --> Actions

    subgraph External [External Services]
        Gemini[Google Gemini AI]
    end

    Editor -- Generates Content --> Gemini
```
