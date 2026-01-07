
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import GanttChart from './components/GanttChart';
import { Task } from './types';
import { Share2, Download as DownloadIcon, Filter, Layers } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

const STORAGE_KEY = 'v_gantt_dashboard_data';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTasks(parsed);
        if (parsed.length > 0) setSelectedProject(parsed[0].projectName);
      } catch (e) { console.error(e); }
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const projects = useMemo(() => {
    const unique = Array.from(new Set(tasks.map(t => t.projectName)));
    return unique.sort();
  }, [tasks]);

  // Sync selected project if it becomes invalid or empty
  useEffect(() => {
    if (projects.length > 0 && (!selectedProject || !projects.includes(selectedProject))) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  const handleAddTask = useCallback((task: Task) => {
    setTasks(prev => {
      // Logic to update existing stage for same project if it exists
      const existingIdx = prev.findIndex(t => t.projectName === task.projectName && t.stage === task.stage);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = { ...task, id: next[existingIdx].id };
        return next;
      }
      return [...prev, task];
    });
    setSelectedProject(task.projectName);
  }, []);

  const handleImportCSV = useCallback((newTasks: Task[]) => {
    setTasks(prev => [...prev, ...newTasks]);
  }, []);

  const handleClearAll = useCallback(() => {
    if (confirm('Wipe all data?')) setTasks([]);
  }, []);

  const handleExportImage = async () => {
    const chartArea = document.querySelector('.gantt-svg');
    if (!chartArea) return;
    try {
      const dataUrl = await htmlToImage.toPng(chartArea as HTMLElement, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Project-Dashboard-${selectedProject}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        onAddTask={handleAddTask} 
        onImportCSV={handleImportCSV} 
        onClearAll={handleClearAll}
        tasksCount={tasks.length}
      />

      <main className="flex-1 flex flex-col min-w-0 p-6 lg:p-10 space-y-6 overflow-hidden">
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Layers className="text-indigo-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Project Dashboard</h2>
              <div className="flex items-center gap-2 text-slate-400 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest">Live Schedule Analysis</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none flex items-center bg-slate-100 rounded-lg px-3 py-2 gap-2 border border-slate-200">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={selectedProject} 
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none min-w-[150px]"
              >
                {projects.length === 0 ? (
                  <option value="">No Projects Found</option>
                ) : (
                  projects.map(p => <option key={p} value={p}>{p}</option>)
                )}
              </select>
            </div>
            
            <button 
              onClick={handleExportImage}
              disabled={!selectedProject}
              className="px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <DownloadIcon className="w-4 h-4" /> Export View
            </button>
          </div>
        </header>

        <section className="flex-1 min-h-0 relative">
          <GanttChart tasks={tasks} selectedProject={selectedProject} />
        </section>

        <footer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Proposed', desc: 'Initial baseline schedule agreed with stakeholders.', color: 'bg-blue-500' },
            { label: 'AF (Adjusted Forecast)', desc: 'Real-time re-estimation based on current progress.', color: 'bg-amber-500' },
            { label: 'Actual', desc: 'Finalized dates recorded upon stage completion.', color: 'bg-emerald-500' }
          ].map(stat => (
            <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3 shadow-sm">
              <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${stat.color}`}></div>
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{stat.label}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{stat.desc}</p>
              </div>
            </div>
          ))}
        </footer>
      </main>
    </div>
  );
};

export default App;
