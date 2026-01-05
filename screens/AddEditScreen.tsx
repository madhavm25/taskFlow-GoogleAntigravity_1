import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Calendar, Type, AlignLeft, Flag, Check, Sparkles, Loader2, Wand2, Image as ImageIcon, RefreshCw, Upload, Mic, CheckSquare, Plus, X, CheckCircle2, Circle, Trash2, GripVertical } from 'lucide-react';
import { useTasks } from '../context/TaskContext.tsx';
import { Priority, Subtask, Task } from '../types.ts';
import { PRIORITY_CONFIG } from '../constants.tsx';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence, Reorder } from 'framer-motion';

const AddEditScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { tasks, addTask, updateTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Fix: Use local time for default date instead of UTC to prevent "yesterday" bug
  const [dueDate, setDueDate] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [error, setError] = useState('');

  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isRecordingTitle, setIsRecordingTitle] = useState(false);
  const [isRecordingDescription, setIsRecordingDescription] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(task.dueDate);
        setPriority(task.priority);
        setImageUrl(task.imageUrl);
        setSubtasks(task.subtasks || []);
      }
    }
    else if (location.state && (location.state as any).duplicateTask) {
      const task = (location.state as any).duplicateTask as Task;
      setTitle(`${task.title} (Copy)`);
      setDescription(task.description);
      setDueDate(task.dueDate);
      setPriority(task.priority);
      setImageUrl(task.imageUrl);
      setSubtasks((task.subtasks || []).map(st => ({
        ...st,
        id: crypto.randomUUID(),
        completed: false
      })));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [id, tasks, location.state]);

  const toggleSpeech = (field: 'title' | 'description') => {
    const isRecording = field === 'title' ? isRecordingTitle : isRecordingDescription;
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      if (field === 'title') setIsRecordingTitle(true);
      else setIsRecordingDescription(true);
      setError('');
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (field === 'title') setTitle(prev => (prev ? `${prev} ${transcript}` : transcript));
      else setDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => {
      setIsRecordingTitle(false);
      setIsRecordingDescription(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: crypto.randomUUID(),
      title: newSubtaskTitle.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const removeSubtask = (sid: string) => {
    setSubtasks(subtasks.filter(s => s.id !== sid));
  };

  const toggleSubtaskStatus = (sid: string) => {
    setSubtasks(subtasks.map(s => s.id === sid ? { ...s, completed: !s.completed } : s));
  };

  const refineTitleWithAI = async () => {
    if (!description.trim()) return;
    setIsRefining(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given this task description: "${description}", provide a single, punchy title. Output ONLY the title text.`,
      });
      const suggestedTitle = response.text?.replace(/^["']|["']$/g, '').trim();
      if (suggestedTitle) setAiSuggestion(suggestedTitle);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  const generateImageWithAI = async () => {
    const promptContext = description.trim() || title.trim();
    if (!promptContext) return;
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `A clean minimalist icon for the task: "${promptContext}". Studio lighting, white background.` }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return; // Prevent double submit

    setIsSubmitting(true);
    try {
      const taskData = { title, description, dueDate, priority, imageUrl, subtasks };
      if (id) await updateTask(id, taskData); // Ensure these are awaited if they perform async ops
      else await addTask(taskData);
      navigate(-1);
    } catch (error) {
      console.error("Failed to save task", error);
      setIsSubmitting(false); // Only re-enable on error
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 min-h-screen">
      <input type="file" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setIsUploading(true);
          const reader = new FileReader();
          reader.onloadend = () => { setImageUrl(reader.result as string); setIsUploading(false); };
          reader.readAsDataURL(file);
        }
      }} accept="image/*" className="hidden" />

      <div className="sticky top-0 p-4 flex items-center justify-between z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md transition-colors">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />
        </button>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {id ? 'Edit Task' : 'New Task'}
        </h2>
        <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="p-2.5 rounded-2xl bg-accent text-white shadow-lg shadow-accent-tonal transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100">
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-10 pb-12">
        {/* Title Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between ml-1">
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest"><Type className="w-3 h-3" />Task Title</label>
            <button type="button" onClick={() => toggleSpeech('title')} className={`p-2 rounded-xl transition-all ${isRecordingTitle ? 'bg-accent text-white animate-pulse shadow-lg' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}><Mic className="w-4 h-4" /></button>
          </div>
          <input ref={titleInputRef} autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" className="w-full text-2xl font-bold bg-transparent border-b-2 outline-none py-2 transition-all text-neutral-900 dark:text-white border-neutral-100 dark:border-neutral-800 focus:border-accent" />
          <AnimatePresence>{aiSuggestion && (<motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-3 bg-accent-tonal rounded-2xl border border-accent/10"><span className="text-sm italic font-medium text-neutral-600 dark:text-neutral-300 truncate pr-4">"{aiSuggestion}"</span><button type="button" onClick={() => { setTitle(aiSuggestion); setAiSuggestion(null); }} className="text-xs font-bold text-accent uppercase tracking-widest">Apply</button></motion.div>)}</AnimatePresence>
        </div>

        {/* Description Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between ml-1">
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest"><AlignLeft className="w-3 h-3" />Description</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => toggleSpeech('description')} className={`p-2 rounded-xl transition-all ${isRecordingDescription ? 'bg-accent text-white animate-pulse' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}><Mic className="w-4 h-4" /></button>
              <button type="button" disabled={isRefining || !description.trim()} onClick={refineTitleWithAI} className="p-2 bg-accent-tonal text-accent rounded-xl disabled:opacity-50 transition-colors">{isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}</button>
            </div>
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details here..." rows={2} className="w-full text-base bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl outline-none border border-neutral-100 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 transition-colors" />
        </div>

        {/* Subtasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest"><CheckSquare className="w-3 h-3" />Steps</label>
          </div>
          <Reorder.Group axis="y" values={subtasks} onReorder={setSubtasks} className="space-y-2">
            <AnimatePresence initial={false}>
              {subtasks.map((st) => (
                <Reorder.Item key={st.id} value={st} className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-700/50 group shadow-sm active:shadow-md cursor-grab active:cursor-grabbing transition-colors">
                  <div className="flex-shrink-0 text-neutral-300 dark:text-neutral-600 group-hover:text-accent transition-colors"><GripVertical className="w-4 h-4" /></div>
                  <button type="button" onClick={() => toggleSubtaskStatus(st.id)} className="flex-shrink-0">{st.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 group-hover:text-accent" />}</button>
                  <span className={`flex-1 text-sm font-medium truncate ${st.completed ? 'line-through text-neutral-300' : 'text-neutral-700 dark:text-neutral-200'}`}>{st.title}</span>
                  <button type="button" onClick={() => removeSubtask(st.id)} className="p-1.5 text-neutral-200 hover:text-rose-500 rounded-lg"><X className="w-4 h-4" /></button>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
          <div className="flex items-center gap-2 group">
            <input type="text" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())} placeholder="Next step..." className="flex-1 bg-neutral-50 dark:bg-neutral-800/20 p-4 rounded-2xl outline-none text-sm font-medium border border-neutral-100 dark:border-neutral-800 focus:border-accent/50 transition-colors text-neutral-900 dark:text-white" />
            <button type="button" onClick={addSubtask} disabled={!newSubtaskTitle.trim()} className="p-4 bg-accent text-white rounded-2xl disabled:opacity-20 transition-all shadow-md active:scale-95"><Plus className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Due Date & Priority Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Due Date Input */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">
              <Calendar className="w-3 h-3 text-accent" /> Due Date
            </label>
            <div className="relative overflow-hidden bg-neutral-50 dark:bg-neutral-800/60 p-1 rounded-3xl border border-neutral-200 dark:border-neutral-700/50 shadow-sm focus-within:border-accent/50 transition-colors">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-transparent px-4 py-3.5 rounded-2xl text-base font-semibold outline-none text-neutral-800 dark:text-white dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Priority Chip Selector */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">
              <Flag className="w-3 h-3 text-accent" /> Priority
            </label>
            <div className="flex gap-2 p-1.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-3xl border border-neutral-200 dark:border-neutral-700/50">
              {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map((p) => {
                const isActive = priority === p;
                const config = PRIORITY_CONFIG[p];
                return (
                  <motion.button
                    key={p}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPriority(p)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all
                      ${isActive
                        ? `${config.color} shadow-md`
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                      }`}
                  >
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                    {config.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual Context Section */}
        <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 transition-colors">
          <label className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1"><ImageIcon className="w-3 h-3" />Visual Context</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={isGeneratingImage || isUploading} onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-neutral-600 dark:text-neutral-300 font-bold text-sm shadow-sm transition-colors hover:bg-neutral-50"><Upload className="w-4 h-4" /> Upload</button>
            <button type="button" disabled={isGeneratingImage || isUploading || (!description.trim() && !title.trim())} onClick={generateImageWithAI} className="flex items-center justify-center gap-2 py-3 bg-accent-tonal text-accent font-bold text-sm rounded-2xl shadow-sm transition-colors hover:brightness-105 active:scale-95">{isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Image</button>
          </div>
          <AnimatePresence mode="wait">
            {(isGeneratingImage || isUploading) ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden w-full aspect-video bg-neutral-100 dark:bg-neutral-800/80 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-neutral-200"><Loader2 className="w-8 h-8 text-accent animate-spin mb-2" /><span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Generating...</span></motion.div>
            ) : imageUrl ? (
              <motion.div key="image" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group w-full aspect-video"><img src={imageUrl} alt="" className="w-full h-full object-cover rounded-3xl shadow-lg border-2 border-white dark:border-neutral-800" /><div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"><button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-white rounded-full text-neutral-900 shadow-xl"><RefreshCw className="w-5 h-5" /></button><button type="button" onClick={() => setImageUrl(undefined)} className="p-3 bg-rose-500 rounded-full text-white shadow-xl"><Trash2 className="w-5 h-5" /></button></div></motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
};

export default AddEditScreen;