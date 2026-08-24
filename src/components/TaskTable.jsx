import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Eye, FileText, ArrowRight, ChevronRight } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';

export const TaskTable = ({ tasks = [], limit }) => {
  const [selectedTask, setSelectedTask] = useState(null);

  const displayedTasks = limit ? tasks.slice(0, limit) : tasks;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Task Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Selected Model</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date / Time</th>
              <th className="py-3 px-4 text-right">Output</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedTasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                  No task executions recorded.
                </td>
              </tr>
            ) : (
              displayedTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span className="group-hover:text-blue-700 transition-colors">{task.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                      {task.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{task.model}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{task.date}</td>
                  <td className="py-3 px-4 text-right">
                    {task.deliverable ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px] group-hover:underline">
                        <FileText className="w-3 h-3 text-emerald-600" />
                        {task.deliverable.length > 20 ? task.deliverable.substring(0, 18) + '...' : task.deliverable}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">None</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};

export default TaskTable;
