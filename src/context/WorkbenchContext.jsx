import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_TASKS, apiService } from '../services/api';

const WorkbenchContext = createContext();

export const WORKFLOW_STEPS = [
  { id: 1, label: 'Task Analysis', key: 'analysis' },
  { id: 2, label: 'Model Router', key: 'router' },
  { id: 3, label: 'Agent', key: 'agent' },
  { id: 4, label: 'Tools / RAG', key: 'tools' },
  { id: 5, label: 'Verification', key: 'verification' },
  { id: 6, label: 'Deliverable', key: 'deliverable' },
];

export const PRESET_SCENARIOS = [
  {
    id: 'preset-1',
    title: 'MRPL Turbine Inspection Report & Approval Note',
    category: 'Document Analysis',
    prompt: 'Read this inspection report, identify the major findings, search relevant internal MRPL SOPs, and prepare an approval note.',
    targetModel: 'Local Reasoning Model',
    files: [
      { id: 'f-1', name: 'mrpl_inspection_report.pdf', size: '4.2 MB', status: 'Ready', type: 'application/pdf' },
      { id: 'f-2', name: 'refinery_equipment_photo.jpg', size: '1.8 MB', status: 'Ready', type: 'image/jpeg' },
    ],
    deliverables: [
      {
        id: 'del-1',
        title: 'MRPL_Approval_Note_Turbine_042.docx',
        type: 'docx',
        size: '1.4 MB',
        date: '2026-08-24 12:45',
        summary: 'Official MRPL Approval Note detailing 3 minor bearing anomalies and recommended 120-hour maintenance cycle per Safety SOP 2026.',
        previewText: `MANGALORE REFINERY AND PETROCHEMICALS LIMITED (MRPL)
==================================================
DOCUMENT REF: MRPL-APN-2026-0842-TURBINE
DATE: 2026-08-24
SECURITY LEVEL: STRICTLY CONFIDENTIAL (AIR-GAPPED)

SUBJECT: TECHNICAL APPROVAL FOR STAGE-3 TURBINE GENERATOR MAINTENANCE

1. EXECUTIVE SUMMARY:
   Based on automated multimodal inspection report analysis and RAG cross-verification with Safety_SOP_HighPressure_2026.pdf, the unit requires scheduled bearing replacement within 120 operating hours.

2. KEY FINDINGS:
   - Bearing-2 acoustic frequency surge (+14.2% above baseline).
   - Thermal acoustic imaging shows 0.042mm expansion (within safe threshold <0.05mm).
   - No immediate emergency shutdown required.

3. RECOMMENDATIONS:
   - Approve 120-hour scheduled maintenance window.
   - Dispatch acoustic calibration team with Replacement Part #TRB-99-B2.

APPROVED BY: MRPL Sovereign AI Workbench (Local Audit Engine)
STATUS: VERIFIED & CONFIDENTIAL`,
      },
      {
        id: 'del-2',
        title: 'MRPL_Telemetry_Analysis.xlsx',
        type: 'xlsx',
        size: '850 KB',
        date: '2026-08-24 12:45',
        summary: 'Structured frequency spectrum dataset extracted from report figures.',
        previewText: 'Sheet 1: Telemetry Data\nTimestamp, Bearing, Frequency (Hz), Temp (C), Status\n08:00, B1, 120.4, 52.1, Normal\n08:15, B2, 142.8, 64.3, Warning\n08:30, B2, 145.1, 65.8, Warning',
      },
    ],
    sources: [
      { id: 'DOC-SOP-01', title: 'MRPL_Safety_SOP_HighPressure_2026.pdf', score: '98% Match', snippet: 'Section 4.2: Maximum operational pressure for Stage-3 compressor unit shall not exceed 450 PSI.' },
      { id: 'DOC-MAN-02', title: 'MRPL_Turbine_Generator_Maintenance_Manual.pdf', score: '94% Match', snippet: 'Boring inspection protocol requires thermal acoustic imaging every 500 operating hours.' },
    ],
  },
  {
    id: 'preset-2',
    title: 'MRPL Gas Pipeline Telemetry Code Verification',
    category: 'Coding',
    prompt: 'Review the Modbus telemetry parser code, verify security against buffer overflow, and isolate non-compliant logic.',
    targetModel: 'Local Code Model',
    files: [
      { id: 'f-3', name: 'mrpl_telemetry_parser.py', size: '28 KB', status: 'Ready', type: 'text/x-python' },
    ],
    deliverables: [
      {
        id: 'del-3',
        title: 'MRPL_Verified_Pipeline_Logic.py',
        type: 'code',
        size: '32 KB',
        date: '2026-08-24 12:50',
        summary: 'Hardened Modbus TCP frame parser with HMAC verification and strict boundary bounds checking.',
        previewText: `import hmac
import hashlib

def parse_modbus_frame(raw_bytes: bytes, secret_hsm_key: bytes) -> dict:
    """
    MRPL Sovereign Verified Code: Modbus Frame Inspector with HMAC validation.
    Zero external dependencies. Runs isolated in container sandbox.
    """
    if len(raw_bytes) < 12:
        raise ValueError("Security Alert: Malformed Modbus frame length")
    
    payload = raw_bytes[:-32]
    received_hmac = raw_bytes[-32:]
    
    expected_hmac = hmac.new(secret_hsm_key, payload, hashlib.sha256).digest()
    if not hmac.compare_digest(received_hmac, expected_hmac):
        raise PermissionError("Tamper Detection: Invalid HMAC signature on frame")
        
    return {"status": "SECURE", "telemetry_payload": payload}`,
      },
    ],
    sources: [
      { id: 'DOC-ENG-04', title: 'MRPL_Substation_Telemetry_Architecture.pdf', score: '99% Match', snippet: 'All control frames must be verified via HMAC-SHA256 hardware security module.' },
    ],
  },
];

export const WorkbenchProvider = ({ children }) => {
  // Authentication State — Defaults to false so Login Page shows FIRST
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('mrpl_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('mrpl_user') !== null;
  });

  const login = (userData) => {
    const userObj = userData || { name: 'MRPL Engineer', email: 'operator@mrpl.co.in' };
    setCurrentUser(userObj);
    setIsAuthenticated(true);
    localStorage.setItem('mrpl_user', JSON.stringify(userObj));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('mrpl_user');
  };

  // Application State
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [currentTaskName, setCurrentTaskName] = useState('MRPL Turbine Inspection Report Analysis');
  const [taskPrompt, setTaskPrompt] = useState('Read this inspection report, identify the major findings, search the relevant internal MRPL SOPs, and prepare an approval note.');
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 'f-1', name: 'mrpl_inspection_report.pdf', size: '4.2 MB', status: 'Ready', type: 'application/pdf' },
    { id: 'f-2', name: 'refinery_equipment_photo.jpg', size: '1.8 MB', status: 'Ready', type: 'image/jpeg' },
  ]);
  
  // Execution & Demo Mode State
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Read this inspection report, identify the major findings, search the relevant internal MRPL SOPs, and prepare an approval note.',
      timestamp: '11:28 AM',
      files: ['mrpl_inspection_report.pdf', 'refinery_equipment_photo.jpg'],
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      text: 'I have ingested the attached MRPL files (`mrpl_inspection_report.pdf` & `refinery_equipment_photo.jpg`). I will analyze the findings, cross-reference our internal Safety SOPs, and generate the formal Approval Note.',
      timestamp: '11:29 AM',
    },
  ]);

  // Dynamic Right Panel States
  const [agentActivity, setAgentActivity] = useState([
    { id: 'act-1', label: 'Task analyzed', status: 'completed' },
    { id: 'act-2', label: 'Plan created', status: 'completed' },
    { id: 'act-3', label: 'Model selected', status: 'completed' },
    { id: 'act-4', label: 'PDF processed', status: 'completed' },
    { id: 'act-5', label: 'OCR completed', status: 'completed' },
    { id: 'act-6', label: 'Searching internal knowledge base', status: 'completed' },
    { id: 'act-7', label: 'Generate approval note', status: 'completed' },
    { id: 'act-8', label: 'Verify output', status: 'completed' },
    { id: 'act-9', label: 'Task completed', status: 'completed' },
  ]);

  const [selectedModel, setSelectedModel] = useState({
    taskType: 'Document Analysis',
    name: 'Local Reasoning Model',
    architecture: 'Qwen2.5-72B-Instruct-GGUF',
    status: 'Running Locally',
  });

  const [toolCalls, setToolCalls] = useState([
    { name: 'File Reader', status: 'Completed', time: '0.4s' },
    { name: 'OCR', status: 'Completed', time: '1.2s' },
    { name: 'Knowledge Search', status: 'Completed', time: '0.8s' },
    { name: 'Calculator', status: 'Completed', time: '0.2s' },
    { name: 'Code Sandbox', status: 'Pending', time: '-' },
    { name: 'Document Generator', status: 'Completed', time: '1.6s' },
  ]);

  const [deliverables, setDeliverables] = useState(PRESET_SCENARIOS[0].deliverables);
  const [sourcesUsed, setSourcesUsed] = useState(PRESET_SCENARIOS[0].sources);
  const [errorState, setErrorState] = useState(null);

  // Selected Deliverable for Preview Modal
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

  // Load initial tasks
  useEffect(() => {
    apiService.getTasks().then(setTasks).catch(() => {});
  }, []);

  // Handle Preset Load
  const applyPresetScenario = (scenarioId) => {
    const preset = PRESET_SCENARIOS.find((p) => p.id === scenarioId) || PRESET_SCENARIOS[0];
    setCurrentTaskName(preset.title);
    setTaskPrompt(preset.prompt);
    setUploadedFiles(preset.files);
    setDeliverables(preset.deliverables);
    setSourcesUsed(preset.sources);
    setSelectedModel({
      taskType: preset.category,
      name: preset.targetModel,
      architecture: preset.targetModel === 'Local Code Model' ? 'DeepSeek-Coder-V2-Lite-16B' : 'Qwen2.5-72B-Instruct',
      status: 'Ready (Local GPU)',
    });
    setChatMessages([
      {
        id: `msg-p1-${Date.now()}`,
        sender: 'user',
        text: preset.prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        files: preset.files.map((f) => f.name),
      },
    ]);
    setActiveStep(0);
    setIsRunning(false);
  };

  // Upload File Handler
  const handleAddFiles = (newFiles) => {
    const fileCards = Array.from(newFiles).map((file, idx) => ({
      id: `up-${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'Ready',
      type: file.type,
    }));
    setUploadedFiles((prev) => [...prev, ...fileCards]);
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // DEMO MODE RUN TASK EXECUTION
  const runDemoTask = () => {
    if (isRunning) return;
    if (!taskPrompt.trim() && uploadedFiles.length === 0) return;

    setIsRunning(true);
    setErrorState(null);
    setActiveStep(1);

    const isCode = taskPrompt.toLowerCase().includes('code') || taskPrompt.toLowerCase().includes('python') || taskPrompt.toLowerCase().includes('modbus');
    const modelName = isCode ? 'Local Code Model' : 'Local Reasoning Model';
    const taskType = isCode ? 'Coding & Verification' : 'Document Analysis';

    setSelectedModel({
      taskType,
      name: modelName,
      architecture: isCode ? 'DeepSeek-Coder-V2-16B-GGUF' : 'Qwen2.5-72B-Instruct-GGUF',
      status: 'Running Locally',
    });

    setAgentActivity([
      { id: 'act-1', label: 'Task analyzed', status: 'running' },
      { id: 'act-2', label: 'Plan created', status: 'pending' },
      { id: 'act-3', label: 'Model selected', status: 'pending' },
      { id: 'act-4', label: 'PDF processed', status: 'pending' },
      { id: 'act-5', label: 'OCR completed', status: 'pending' },
      { id: 'act-6', label: 'Searching internal knowledge base', status: 'pending' },
      { id: 'act-7', label: 'Generate output deliverable', status: 'pending' },
      { id: 'act-8', label: 'Verify output', status: 'pending' },
      { id: 'act-9', label: 'Task completed', status: 'pending' },
    ]);

    setToolCalls([
      { name: 'File Reader', status: 'Running', time: '...' },
      { name: 'OCR', status: 'Pending', time: '-' },
      { name: 'Knowledge Search', status: 'Pending', time: '-' },
      { name: 'Calculator', status: 'Pending', time: '-' },
      { name: 'Code Sandbox', status: isCode ? 'Pending' : 'N/A', time: '-' },
      { name: 'Document Generator', status: 'Pending', time: '-' },
    ]);

    const userMsg = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: taskPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      files: uploadedFiles.map((f) => f.name),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      setActiveStep(2);
      setAgentActivity((prev) =>
        prev.map((a) =>
          a.id === 'act-1' ? { ...a, status: 'completed' } : a.id === 'act-2' ? { ...a, status: 'completed' } : a.id === 'act-3' ? { ...a, status: 'running' } : a
        )
      );
      setToolCalls((prev) => prev.map((t) => (t.name === 'File Reader' ? { ...t, status: 'Completed', time: '0.3s' } : t)));
    }, 1000);

    setTimeout(() => {
      setActiveStep(3);
      setAgentActivity((prev) =>
        prev.map((a) =>
          a.id === 'act-3' ? { ...a, status: 'completed' } : a.id === 'act-4' ? { ...a, status: 'completed' } : a.id === 'act-5' ? { ...a, status: 'running' } : a
        )
      );
      setToolCalls((prev) => prev.map((t) => (t.name === 'OCR' ? { ...t, status: 'Completed', time: '0.9s' } : t)));
    }, 2200);

    setTimeout(() => {
      setActiveStep(4);
      setAgentActivity((prev) =>
        prev.map((a) =>
          a.id === 'act-5' ? { ...a, status: 'completed' } : a.id === 'act-6' ? { ...a, status: 'running' } : a
        )
      );
      setToolCalls((prev) => prev.map((t) => (t.name === 'Knowledge Search' ? { ...t, status: 'Completed', time: '0.6s' } : t)));
    }, 3400);

    setTimeout(() => {
      setActiveStep(5);
      setAgentActivity((prev) =>
        prev.map((a) =>
          a.id === 'act-6' ? { ...a, status: 'completed' } : a.id === 'act-7' ? { ...a, status: 'completed' } : a.id === 'act-8' ? { ...a, status: 'running' } : a
        )
      );
      setToolCalls((prev) =>
        prev.map((t) =>
          t.name === 'Code Sandbox'
            ? { ...t, status: isCode ? 'Completed' : 'N/A', time: isCode ? '1.1s' : '-' }
            : t.name === 'Document Generator'
            ? { ...t, status: 'Completed', time: '1.4s' }
            : t
        )
      );
    }, 4600);

    setTimeout(() => {
      setActiveStep(6);
      setIsRunning(false);
      setAgentActivity((prev) =>
        prev.map((a) => ({ ...a, status: 'completed' }))
      );

      const newDel = isCode
        ? {
            id: `del-code-${Date.now()}`,
            title: `MRPL_Verified_Sensor_Code_${Math.floor(100 + Math.random() * 900)}.py`,
            type: 'code',
            size: '26 KB',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            summary: 'Verified Python Telemetry Script with zero high-severity vulnerabilities for MRPL pipeline.',
            previewText: `# MRPL Sovereign AI Workbench - Code Verification Deliverable\n# Generated by Local Code Model (DeepSeek-Coder-V2-16B)\n\ndef process_mrpl_industrial_stream():\n    print("All input frames sanity checked against MRPL local RAG security SOPs")\n    return True`,
          }
        : {
            id: `del-doc-${Date.now()}`,
            title: `MRPL_Approval_Note_${Math.floor(100 + Math.random() * 900)}.docx`,
            type: 'docx',
            size: '1.6 MB',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            summary: 'Formal Approval Note compiled from MRPL inspection report analysis and Safety SOP cross-matching.',
            previewText: `MANGALORE REFINERY AND PETROCHEMICALS LIMITED (MRPL)\n======================================================\nSTATUS: APPROVED (ON-PREMISE VERIFIED)\nMODEL USED: Local Reasoning Model\nAIR-GAPPED COMPLIANCE: 100% PASS\n\nExecutive Summary:\nThe requested task has been analyzed locally. All thermal, acoustic, and pressure parameters fall within tolerable limits prescribed by internal MRPL manuals.`,
          };

      setDeliverables((prev) => [newDel, ...prev]);

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-a-${Date.now()}`,
          sender: 'assistant',
          text: `Task execution completed successfully. I have analyzed your request, queried the MRPL local knowledge base, executed verification tools, and generated the official deliverable: **${newDel.title}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          deliverable: newDel,
        },
      ]);

      const newTaskEntry = {
        id: `TSK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        name: currentTaskName || taskPrompt.substring(0, 32),
        type: taskType,
        model: modelName,
        status: 'Completed',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        duration: '5.8s',
        user: currentUser ? currentUser.name : 'MRPL User',
        fileCount: uploadedFiles.length,
        deliverable: newDel.title,
        deliverableType: newDel.type,
      };
      setTasks((prev) => [newTaskEntry, ...prev]);
    }, 5800);
  };

  return (
    <WorkbenchContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        tasks,
        currentTaskName,
        setCurrentTaskName,
        taskPrompt,
        setTaskPrompt,
        uploadedFiles,
        handleAddFiles,
        handleRemoveFile,
        isRunning,
        activeStep,
        chatMessages,
        agentActivity,
        selectedModel,
        toolCalls,
        deliverables,
        sourcesUsed,
        errorState,
        selectedDeliverable,
        setSelectedDeliverable,
        runDemoTask,
        applyPresetScenario,
        PRESET_SCENARIOS,
      }}
    >
      {children}
    </WorkbenchContext.Provider>
  );
};

export const useWorkbench = () => {
  const context = useContext(WorkbenchContext);
  if (!context) throw new Error('useWorkbench must be used within WorkbenchProvider');
  return context;
};
