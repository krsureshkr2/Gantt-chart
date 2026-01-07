
export type ScheduleType = 'Proposed' | 'AF' | 'Actual';

export const PROJECT_STAGES = [
  'Concept stage',
  'Schematic Design',
  'Design Development',
  'Construction documents',
  'Bidding and Negotiation',
  'Shop drawing review',
  'Construction admin'
] as const;

export type ProjectStage = typeof PROJECT_STAGES[number];

export interface Task {
  id: string;
  projectName: string;
  stage: ProjectStage;
  // Proposed Schedule
  pStart: string;
  pEnd: string;
  // AF Schedule
  afStart: string;
  afEnd: string;
  // Actual Schedule
  aStart: string;
  aEnd: string;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
