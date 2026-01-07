
import { Task, PROJECT_STAGES, ProjectStage } from '../types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const validateDates = (start: string, finish: string): boolean => {
  if (!start || !finish) return true; // Optional dates allowed
  const startDate = new Date(start);
  const finishDate = new Date(finish);
  return finishDate >= startDate;
};

export const getScheduleColor = (type: 'Proposed' | 'AF' | 'Actual'): string => {
  switch (type) {
    case 'Proposed': return '#3b82f6'; // Blue
    case 'AF': return '#f59e0b';       // Orange
    case 'Actual': return '#10b981';   // Green
    default: return '#cbd5e1';
  }
};

export const parseCSV = (csvText: string): Partial<Task>[] => {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',').map(v => v.trim());
    const task: any = {};
    
    headers.forEach((header, index) => {
      const val = values[index];
      if (header.includes('project')) task.projectName = val;
      if (header.includes('stage') || header.includes('scope')) {
        // Find closest match to predefined stages
        const matchedStage = PROJECT_STAGES.find(s => s.toLowerCase() === val.toLowerCase());
        task.stage = matchedStage || PROJECT_STAGES[0];
      }
      
      // Map multiple date columns
      if (header.includes('p_start') || (header.includes('proposed') && header.includes('start'))) task.pStart = val;
      if (header.includes('p_end') || (header.includes('proposed') && header.includes('end'))) task.pEnd = val;
      
      if (header.includes('af_start') || (header.includes('af') && header.includes('start'))) task.afStart = val;
      if (header.includes('af_end') || (header.includes('af') && header.includes('end'))) task.afEnd = val;
      
      if (header.includes('a_start') || (header.includes('actual') && header.includes('start'))) task.aStart = val;
      if (header.includes('a_end') || (header.includes('actual') && header.includes('end'))) task.aEnd = val;
    });
    
    return task;
  });
};
