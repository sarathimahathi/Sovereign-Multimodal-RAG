import React, { useState } from 'react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import TaskDetailModal from '../components/TaskDetailModal';
import { useWorkbench } from '../context/WorkbenchContext';
import { History, Search, FileText, CheckCircle2, Clock, User, Filter } from 'lucide-react';

export const TaskHistory = () => {
  const { tasks } = useWorkbench();
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen page-transition select-none">
      <Header
        title="Task History & Audit Trail"
        subtitle="Searchable Ledger of All Local AI Engine Executions and Security Inspections"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by task, model, or type..."
              className="w-full pl-10 pr-4 py-2 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {['All', 'Completed', 'Running', 'Failed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-[#090d16] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Task Table */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#090d16] border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Task ID & Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Model Engine</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Deliverable Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                      No matching task history records found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className="hover:bg-[#182235] cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex flex-col">
                          <span className="group-hover:text-emerald-400 transition-colors">{t.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{t.id}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#090d16] text-sky-300 border border-sky-500/30 text-[11px] font-medium">
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-purple-300">{t.model}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{t.date}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-400 font-semibold">{t.duration || '5.2s'}</td>
                      <td className="py-3.5 px-4">
                        {t.deliverable ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                            <FileText className="w-3 h-3 text-emerald-400" />
                            {t.deliverable}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">None</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};

export default TaskHistory;
