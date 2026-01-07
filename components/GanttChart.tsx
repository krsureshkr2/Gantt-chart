
import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
// Correcting the imports: getScheduleColor is in helpers, not types
import { Task, PROJECT_STAGES } from '../types';
import { getScheduleColor } from '../utils/helpers';

interface GanttChartProps {
  tasks: Task[];
  selectedProject: string;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, selectedProject }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.projectName === selectedProject);
  }, [tasks, selectedProject]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = Math.max(800, container.clientWidth);
    const margin = { top: 60, right: 60, bottom: 60, left: 200 };
    const stageHeight = 100; // Increased to fit 3 bars
    const height = PROJECT_STAGES.length * stageHeight + margin.top + margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    if (filteredTasks.length === 0) return;

    // Calculate time domain
    const allDates: Date[] = [];
    filteredTasks.forEach(t => {
      [t.pStart, t.pEnd, t.afStart, t.afEnd, t.aStart, t.aEnd].forEach(d => {
        if (d) allDates.push(new Date(d));
      });
    });

    if (allDates.length === 0) return;

    const domainStart = d3.timeMonth.offset(d3.min(allDates)!, -1);
    const domainEnd = d3.timeMonth.offset(d3.max(allDates)!, 1);

    const xScale = d3.scaleTime()
      .domain([domainStart, domainEnd])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleBand()
      .domain(PROJECT_STAGES as any)
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    // X-Axis (Monthly)
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeMonth.every(1))
      .tickFormat(d3.timeFormat("%b %Y") as any)
      .tickSize(-height + margin.top + margin.bottom);

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '2,2');

    svg.selectAll('.x-axis text').attr('fill', '#64748b').attr('font-size', '11px').attr('dy', '1.5em');

    // Y-Axis (Stages)
    const yAxis = d3.axisLeft(yScale as any);
    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#334155');

    svg.selectAll('.domain').attr('stroke', '#cbd5e1');

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute hidden bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl pointer-events-none z-50 border border-slate-700');

    // Grouping bars per stage
    PROJECT_STAGES.forEach((stage) => {
      const stageTasks = filteredTasks.filter(t => t.stage === stage);
      if (stageTasks.length === 0) return;

      // We only visualize the first entry per stage for this simplified dashboard view 
      // (usually projects have one set of dates per stage)
      const t = stageTasks[0];
      const yPos = yScale(stage as any) || 0;
      const barHeight = yScale.bandwidth() / 3.5;

      const schedules = [
        { label: 'Proposed', start: t.pStart, end: t.pEnd, color: getScheduleColor('Proposed'), offset: 0 },
        { label: 'AF', start: t.afStart, end: t.afEnd, color: getScheduleColor('AF'), offset: barHeight + 4 },
        { label: 'Actual', start: t.aStart, end: t.aEnd, color: getScheduleColor('Actual'), offset: (barHeight + 4) * 2 }
      ];

      schedules.forEach(sched => {
        if (!sched.start || !sched.end) return;

        const x = xScale(new Date(sched.start));
        const w = xScale(new Date(sched.end)) - x;

        svg.append('rect')
          .attr('x', x)
          .attr('y', yPos + sched.offset)
          .attr('width', Math.max(2, w))
          .attr('height', barHeight)
          .attr('rx', 3)
          .attr('fill', sched.color)
          .attr('class', 'cursor-help transition-opacity hover:opacity-80')
          .on('mouseover', (event) => {
            tooltip.style('display', 'block').html(`
              <div class="font-bold">${sched.label} Schedule</div>
              <div>${stage}</div>
              <div class="text-slate-400 mt-1">${sched.start} to ${sched.end}</div>
            `);
          })
          .on('mousemove', (event) => {
            tooltip.style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 10) + 'px');
          })
          .on('mouseout', () => tooltip.style('display', 'none'));
      });
    });

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${margin.left}, 25)`);
    ['Proposed', 'AF', 'Actual'].forEach((label, i) => {
      const g = legend.append('g').attr('transform', `translate(${i * 120}, 0)`);
      g.append('rect').attr('width', 15).attr('height', 15).attr('rx', 3).attr('fill', getScheduleColor(label as any));
      g.append('text').attr('x', 22).attr('y', 12).text(label).attr('font-size', '12px').attr('fill', '#64748b');
    });

    return () => { tooltip.remove(); };
  }, [filteredTasks, selectedProject]);

  return (
    <div ref={containerRef} className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto overflow-y-auto max-h-full custom-scrollbar">
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[500px] text-slate-400">
          <p className="text-lg font-medium">No schedule data for "{selectedProject}"</p>
          <p className="text-sm">Please add stage dates in the sidebar.</p>
        </div>
      ) : (
        <svg ref={svgRef} className="gantt-svg mx-auto"></svg>
      )}
    </div>
  );
};

export default GanttChart;
