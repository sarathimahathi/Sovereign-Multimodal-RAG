import React, { useState } from 'react';
import Header from '../components/Header';
import {
  Search,
  FileText,
  CheckCircle2,
  Upload,
  Database,
} from 'lucide-react';

const MOCK_KNOWLEDGE_DOCS = [
  {
    id: 'K-01',
    title: 'MRPL_Safety_SOP_HighPressure_2026.pdf',
    category: 'SOPs',
    size: '14.2 MB',
    vectors: '1,420 Chunks',
    updated: '2026-08-10',
    status: 'Indexed',
    matches: '42 Query Matches',
  },
  {
    id: 'K-02',
    title: 'MRPL_Turbine_Generator_Maintenance_Manual.pdf',
    category: 'Manuals',
    size: '28.6 MB',
    vectors: '3,850 Chunks',
    updated: '2026-07-22',
    status: 'Indexed',
    matches: '18 Query Matches',
  },
  {
    id: 'K-03',
    title: 'Substation_Telemetry_Modbus_Architecture_Specification.pdf',
    category: 'Engineering Documents',
    size: '8.4 MB',
    vectors: '940 Chunks',
    updated: '2026-08-18',
    status: 'Indexed',
    matches: '31 Query Matches',
  },
  {
    id: 'K-04',
    title: 'MRPL_Environmental_Compliance_Audit_2025_Q4.pdf',
    category: 'Inspection Reports',
    size: '19.1 MB',
    vectors: '2,110 Chunks',
    updated: '2026-08-01',
    status: 'Indexed',
    matches: '12 Query Matches',
  },
];

export const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'SOPs', 'Manuals', 'Inspection Reports', 'Engineering Documents'];

  const filteredDocs = MOCK_KNOWLEDGE_DOCS.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen page-transition select-none">
      <Header
        title="Local Knowledge Base"
        subtitle="ChromaDB On-Premise Vector Store & Industrial RAG Document Library"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Summary Banner */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 text-[11px] font-mono font-semibold">
              <Database className="w-3.5 h-3.5 text-indigo-400" /> ChromaDB Local Vector Store
            </div>
            <h2 className="text-xl font-extrabold text-white">On-Premise MRPL SOP & Manual Directory</h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              18 indexed documents embedded into 12,280 dense vector chunks (bge-large-en-v1.5). Zero external API lookup.
            </p>
          </div>

          <button
            onClick={() => alert('Document upload modal activated')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Upload className="w-4 h-4" /> Upload & Index SOPs
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SOPs, manuals, codes..."
              className="w-full pl-10 pr-4 py-2 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all font-sans"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-[#090d16] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Document Table */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#090d16] border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Document Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">File Size</th>
                  <th className="py-3.5 px-4">Vector Count</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4">Indexing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#182338] transition-colors group">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="group-hover:text-sky-300 transition-colors">{doc.title}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#090d16] text-slate-300 border border-slate-800 text-[11px] font-medium">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{doc.size}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-300 font-bold">{doc.vectors}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{doc.updated}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" /> {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KnowledgeBase;
