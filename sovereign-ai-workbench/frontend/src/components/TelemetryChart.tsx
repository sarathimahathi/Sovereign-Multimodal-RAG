import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TelemetryPoint } from '../store/useHealthStore';

interface TelemetryChartProps {
  data: TelemetryPoint[];
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
        <p>Awaiting latency telemetry data...</p>
        <p className="text-[10px] text-slate-600 mt-1">Polling /api/health</p>
      </div>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#64748b"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            unit="ms"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#F8FAFC',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            }}
            labelStyle={{ color: '#94A3B8', fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="latency"
            name="API Latency (ms)"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#latencyGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
