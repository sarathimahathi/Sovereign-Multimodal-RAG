import React, { useEffect, useState } from 'react';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Layers, 
  Send, 
  RefreshCw,
  Lock
} from 'lucide-react';
import { 
  fetchSessions, 
  createSession, 
  deleteSession, 
  fetchSessionDetail, 
  addMessageToSession, 
  SessionItem, 
  SessionDetailItem 
} from '../services/api';

export const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<SessionDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClassification, setNewClassification] = useState('CONFIDENTIAL - REFINERY OPERATIONS');
  const [newModel, setNewModel] = useState('auto');
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const res = await fetchSessions();
      setSessions(res.items);
      if (res.items.length > 0 && !selectedSessionId) {
        setSelectedSessionId(res.items[0].id);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionDetail = async (id: string) => {
    try {
      const detail = await fetchSessionDetail(id);
      setSelectedSessionDetail(detail);
    } catch (err) {
      console.error('Failed to load session detail:', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      loadSessionDetail(selectedSessionId);
    }
  }, [selectedSessionId]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await createSession(newTitle, newClassification, newModel);
      setNewTitle('');
      setIsCreating(false);
      await loadSessions();
      setSelectedSessionId(created.id);
    } catch (err: any) {
      alert(`Failed to create workspace: ${err.message}`);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this workspace and all associated conversation traces?')) return;
    try {
      await deleteSession(id);
      if (selectedSessionId === id) {
        setSelectedSessionId(null);
        setSelectedSessionDetail(null);
      }
      await loadSessions();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedSessionId) return;
    setIsSendingMessage(true);
    try {
      await addMessageToSession(selectedSessionId, 'user', messageInput);
      setMessageInput('');
      await loadSessionDetail(selectedSessionId);
    } catch (err: any) {
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Phase 2 Active: Workspaces & Sessions
            </span>
            <span className="text-xs text-slate-400">• Persistent Agent Execution State</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Industrial Workspaces & Reasoning Sessions
          </h1>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2 w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>New Confidential Workspace</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left: Sessions List */}
        <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Active Workspaces ({sessions.length})
            </span>
            <button onClick={loadSessions} className="text-slate-400 hover:text-white">
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                No active workspaces. Click &quot;New Confidential Workspace&quot; to begin.
              </div>
            ) : (
              sessions.map((s) => {
                const isSelected = s.id === selectedSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-indigo-600/15 border border-indigo-500/30'
                        : 'hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {s.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-mono text-indigo-400/80 truncate">
                          {s.classification}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-600 hover:text-white text-slate-500 transition-all"
                      title="Delete Workspace"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Workspace Details & Conversation Preview */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
          {selectedSessionDetail ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">{selectedSessionDetail.title}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {selectedSessionDetail.classification}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Model Preference: <strong className="text-slate-300">{selectedSessionDetail.model_preference || 'auto'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedSessionDetail.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono space-y-2">
                    <Bot className="h-8 w-8 text-indigo-400/40" />
                    <p>Workspace initialized. Ready to receive confidential tasks and documents.</p>
                    <p className="text-[10px] text-slate-600">Enter a task prompt below to log the first reasoning step.</p>
                  </div>
                ) : (
                  selectedSessionDetail.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mb-1 px-1">
                        <span>{msg.role.toUpperCase()}</span>
                        {msg.model_used && <span className="text-indigo-400">• {msg.model_used}</span>}
                        {msg.latency_ms && <span>• {msg.latency_ms}ms</span>}
                      </div>
                      <div
                        className={`p-3.5 rounded-xl max-w-xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 border border-slate-800 text-slate-200'
                        }`}
                      >
                        {msg.content}
                        {msg.tool_calls && (
                          <div className="mt-2 pt-2 border-t border-slate-800 font-mono text-[11px] text-amber-400">
                            <strong>Tool Executed:</strong> {JSON.stringify(msg.tool_calls)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/40 flex gap-2">
                <input
                  type="text"
                  placeholder="Record an agent step or user query for this workspace..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={isSendingMessage || !messageInput.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Log</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
              <Layers className="h-8 w-8 text-slate-700 mb-2" />
              <p>Select a workspace on the left or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 max-w-lg w-full bg-[#0F172A] space-y-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Create Confidential Industrial Workspace</h3>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Workspace Title / Objective:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Refinery Unit 4 P&ID Valve Anomaly Review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confidentiality Level:
                </label>
                <select
                  value={newClassification}
                  onChange={(e) => setNewClassification(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="CONFIDENTIAL - REFINERY OPERATIONS">CONFIDENTIAL - REFINERY OPERATIONS</option>
                  <option value="RESTRICTED - DEFENSE MANUFACTURING">RESTRICTED - DEFENSE MANUFACTURING</option>
                  <option value="SECRET - BOARD BRIEFING">SECRET - BOARD BRIEFING</option>
                  <option value="INTERNAL ONLY">INTERNAL ONLY</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Model Routing Preference:
                </label>
                <select
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="auto">Auto (Dynamic Task Router - Recommended)</option>
                  <option value="qwen2.5-coder:14b">Qwen 2.5 Coder (Engineering Code & Math)</option>
                  <option value="deepseek-r1:14b">DeepSeek R1 (Deep Industrial Reasoning)</option>
                  <option value="llama3:8b">Llama 3 (General Executive Briefings)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
