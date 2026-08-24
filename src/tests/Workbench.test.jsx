import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { WorkbenchProvider } from '../context/WorkbenchContext';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Workbench from '../pages/Workbench';
import Security from '../pages/Security';
import FileUpload from '../components/FileUpload';
import ModelRouter from '../components/ModelRouter';

describe('Sovereign AI Workbench Frontend Test Suite', () => {
  it('1. Login page renders MRPL title, form inputs, and SSO buttons', () => {
    render(
      <WorkbenchProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </WorkbenchProvider>
    );

    expect(screen.getAllByText(/MRPL Sovereign AI Workbench/i)[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('2. Dashboard renders title, subtitle, and metrics', () => {
    render(
      <WorkbenchProvider>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </WorkbenchProvider>
    );

    expect(screen.getAllByText(/Sovereign AI Workbench/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Active Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/Local Models/i)).toBeInTheDocument();
    expect(screen.getByText(/Knowledge Docs/i)).toBeInTheDocument();
  });

  it('3. Workbench renders 3-column layout panels', () => {
    render(
      <WorkbenchProvider>
        <MemoryRouter>
          <Workbench />
        </MemoryRouter>
      </WorkbenchProvider>
    );

    expect(screen.getByText(/Current Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Agent Activity/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Model Router/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Tool Calls/i)).toBeInTheDocument();
  });

  it('4. File upload component renders drag and drop text', () => {
    render(
      <WorkbenchProvider>
        <FileUpload />
      </WorkbenchProvider>
    );

    expect(screen.getByText(/Drop files here or/i)).toBeInTheDocument();
  });

  it('5. Model Router displays auto-selected local model', () => {
    render(
      <WorkbenchProvider>
        <ModelRouter />
      </WorkbenchProvider>
    );

    expect(screen.getByText(/Model Router/i)).toBeInTheDocument();
    expect(screen.getByText(/Running Locally/i)).toBeInTheDocument();
  });

  it('6. Security page renders air-gapped status indicators and resource cards', () => {
    render(
      <WorkbenchProvider>
        <MemoryRouter>
          <Security />
        </MemoryRouter>
      </WorkbenchProvider>
    );

    expect(screen.getAllByText(/Security & System Status/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/GPU Usage/i)).toBeInTheDocument();
    expect(screen.getByText(/Memory Usage/i)).toBeInTheDocument();
    expect(screen.getByText(/CPU Usage/i)).toBeInTheDocument();
  });
});
