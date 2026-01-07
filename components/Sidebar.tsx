
import React, { useState } from 'react';
import { Task, PROJECT_STAGES, ProjectStage } from '../types';
import { generateId, validateDates, parseCSV } from '../utils/helpers';
import { Plus, Upload, Trash2, Calendar, Layout, Info } from 'lucide-react';

interface SidebarProps {
  onAddTask: (task: Task) => void;
  onImportCSV: (tasks: Task[]) => void;
  onClearAll: () => void;
  tasksCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddTask, onImportCSV, onClearAll, tasksCount }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    stage: PROJECT_STAGES[0] as ProjectStage,
    pStart: '', pEnd: '',
    afStart: '', afEnd: '',
    aStart: '', aEnd: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName) {
      setError('Project Name is required.');
      return;
    }

    // Validation for pairs
    if (!validateDates(formData.pStart, formData.pEnd) || 
        !validateDates(formData.afStart, formData.afEnd) || 
        !validateDates(formData.aStart, formData.aEnd)) {
      setError('Check your dates. Finish cannot be before Start.');
      return;
    }

    onAddTask({
      id: generateId(),
      ...formData
    });

    // Reset dates and stage, keep project name for batch entry
    setFormData(prev => ({
      ...prev,
      pStart: '', pEnd: '',
      afStart: '', afEnd: '',
      aStart: '', aEnd: ''
    }));
  };

  return (
    <aside className="w-full lg:w-[420px] bg-white border-r border-slate-200 flex flex-col h-full shadow-xl z-10">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Layout className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Project Hub</h1>
        </div>
        <p className="text-sm text-slate-500">Manage multi-schedule project timelines.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-100 pb-2">
              <Plus className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Entry Details</h2>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">PROJECT NAME</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="e.g. Skyline Residence"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">PROJECT STAGE</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                {PROJECT_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Schedule Groups */}
          {[
            { key: 'p', label: 'Proposed Schedule', color: 'border-blue-400' },
            { key: 'af', label: 'AF Schedule', color: 'border-amber-400' },
            { key: 'a', label: 'Actual Schedule', color: 'border-emerald-400' }
          ].map(group => (
            <div key={group.key} className={`p-4 border-l-4 ${group.color} bg-slate-50 rounded-r-lg space-y-3`}>
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{group.label}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">START DATE</label>
                  <input
                    type="date"
                    name={`${group.key}Start`}
                    value={(formData as any)[`${group.key}Start`]}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">END DATE</label>
                  <input
                    type="date"
                    name={`${group.key}End`}
                    value={(formData as any)[`${group.key}End`]}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}

          {error && <p className="text-red-500 text-xs font-medium animate-bounce">{error}</p>}

          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold text-sm hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Save Stage Data
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <Info className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-wider">Bulk Actions</h2>
          </div>
          
          <label className="flex items-center justify-center gap-2 w-full bg-white border-2 border-dashed border-slate-200 text-slate-500 py-3 rounded-xl cursor-pointer hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <Upload className="w-4 h-4" />
            <span className="text-sm font-semibold">Import Schedule CSV</span>
            <input type="file" accept=".csv" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const results = parseCSV(ev.target?.result as string);
                onImportCSV(results.map(r => ({ id: generateId(), ...r } as Task)));
              };
              reader.readAsText(file);
              e.target.value = '';
            }} className="hidden" />
          </label>

          <button
            onClick={onClearAll}
            disabled={tasksCount === 0}
            className="flex items-center justify-center gap-2 w-full bg-slate-50 text-slate-400 py-3 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100 disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" /> Clear All Records
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-slate-900 text-slate-400 text-center">
        <p className="text-[10px] font-bold tracking-widest uppercase">Database Active: {tasksCount} entries</p>
      </div>
    </aside>
  );
};

export default Sidebar;
