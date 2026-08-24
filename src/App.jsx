import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { WorkbenchProvider, useWorkbench } from './context/WorkbenchContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workbench from './pages/Workbench';
import KnowledgeBase from './pages/KnowledgeBase';
import TaskHistory from './pages/TaskHistory';
import Security from './pages/Security';
import FilesPage from './pages/FilesPage';
import CodeSandboxPage from './pages/CodeSandboxPage';
import DocumentsPage from './pages/DocumentsPage';
import SettingsPage from './pages/SettingsPage';

// Protected Layout Guard Component
function ProtectedLayout({ children }) {
  const { isAuthenticated } = useWorkbench();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans antialiased text-slate-900">
      {/* Main Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}

// Public Route Guard Component for Login
function LoginRoute() {
  const { isAuthenticated } = useWorkbench();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

export function AppContent() {
  return (
    <Routes>
      {/* 1st Page: MRPL Login Page */}
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/" element={<LoginRoute />} />

      {/* Protected Feature Routes (Redirects to /login if unauthenticated) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/workbench"
        element={
          <ProtectedLayout>
            <Workbench />
          </ProtectedLayout>
        }
      />
      <Route
        path="/files"
        element={
          <ProtectedLayout>
            <FilesPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/knowledge"
        element={
          <ProtectedLayout>
            <KnowledgeBase />
          </ProtectedLayout>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedLayout>
            <TaskHistory />
          </ProtectedLayout>
        }
      />
      <Route
        path="/tools/code"
        element={
          <ProtectedLayout>
            <CodeSandboxPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/tools/documents"
        element={
          <ProtectedLayout>
            <DocumentsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/security"
        element={
          <ProtectedLayout>
            <Security />
          </ProtectedLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <SettingsPage />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <WorkbenchProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </WorkbenchProvider>
  );
}

export default App;
