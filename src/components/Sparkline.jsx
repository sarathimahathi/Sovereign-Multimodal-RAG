import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const Sparkline = ({
  data = [10, 15, 8, 22, 18, 30, 25, 40, 35, 48],
  color = '#38bdf8',
  width = 80,
  height = 30,
  isPositive = true,
  trendText,
}) => {
  const strokeColor = color || (isPositive ? '#10b981' : '#f43f5e');
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const firstVal = data[0] || 0;
  const lastVal = data[data.length - 1] || 0;
  const isUp = lastVal > firstVal;
  const isDown = lastVal < firstVal;

  const trendLabel = trendText || (isUp ? 'Increasing trend' : isDown ? 'Decreasing trend' : 'Stable trend');

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div
      className="inline-flex items-center gap-1.5"
      title={trendLabel}
      aria-label={trendLabel}
      tabIndex={0}
    >
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${strokeColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#grad-${strokeColor.replace('#', '')})`} />
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>

      <span className="shrink-0">
        {isUp ? (
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 stroke-[2.2]" aria-hidden="true" />
        ) : isDown ? (
          <TrendingDown className="w-3.5 h-3.5 text-rose-400 stroke-[2.2]" aria-hidden="true" />
        ) : (
          <Minus className="w-3.5 h-3.5 text-slate-500 stroke-[2.2]" aria-hidden="true" />
        )}
      </span>
    </div>
  );
};

export default Sparkline;
