import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Models } from './pages/Models';
import { Security } from './pages/Security';
import { Documents } from './pages/Documents';
import { Sessions } from './pages/Sessions';
import { Architecture } from './pages/Architecture';
import { Roadmap } from './pages/Roadmap';
import { RagEngine } from './pages/RagEngine';
import { Sandbox } from './pages/Sandbox';
import { Multimodal } from './pages/Multimodal';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/models" element={<Models />} />
              <Route path="/rag" element={<RagEngine />} />
              <Route path="/sandbox" element={<Sandbox />} />
              <Route path="/multimodal" element={<Multimodal />} />
              <Route path="/security" element={<Security />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/roadmap" element={<Roadmap />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
