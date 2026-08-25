import { create } from 'zustand';
import { fetchHealth, HealthResponse } from '../services/api';

export interface TelemetryPoint {
  time: string;
  latency: number;
  cpu: number;
  memory: number;
}

interface HealthState {
  healthData: HealthResponse | null;
  latency: number | null;
  latencyHistory: TelemetryPoint[];
  isLoading: boolean;
  error: string | null;
  lastChecked: Date | null;
  isAutoPolling: boolean;
  
  checkHealth: () => Promise<void>;
  toggleAutoPolling: () => void;
  setAutoPolling: (enabled: boolean) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  healthData: null,
  latency: null,
  latencyHistory: [],
  isLoading: false,
  error: null,
  lastChecked: null,
  isAutoPolling: true,

  checkHealth: async () => {
    set({ isLoading: true });
    try {
      const { data, latencyMs } = await fetchHealth();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newPoint: TelemetryPoint = {
        time: timeStr,
        latency: latencyMs,
        cpu: data.system.cpu_usage_percent,
        memory: data.system.memory_usage_mb,
      };

      set((state) => ({
        healthData: data,
        latency: latencyMs,
        error: null,
        lastChecked: now,
        isLoading: false,
        latencyHistory: [...state.latencyHistory.slice(-19), newPoint],
      }));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to connect to backend server';
      set({
        error: errorMessage,
        isLoading: false,
        lastChecked: new Date(),
        latency: null,
      });
    }
  },

  toggleAutoPolling: () => {
    set((state) => ({ isAutoPolling: !state.isAutoPolling }));
  },

  setAutoPolling: (enabled: boolean) => {
    set({ isAutoPolling: enabled });
  },
}));
