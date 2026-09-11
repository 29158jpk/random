"use client";

import React from "react";

interface DataPoint {
  label: string;
  value: number;
}

export const GamingAreaChart: React.FC<{
  data: DataPoint[];
  title?: string;
  height?: number;
  color?: string;
}> = ({ data, title, height = 180, color = "#38bdf8" }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const paddingX = 40;
  const paddingY = 20;
  const width = 500;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * graphWidth;
    const y = height - paddingY - (d.value / maxValue) * graphHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, point, index) => {
    return `${acc} ${index === 0 ? "M" : "L"} ${point.x},${point.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  return (
    <div className="w-full">
      {title && (
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          {title}
        </div>
      )}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="cyberAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = height - paddingY - ratio * graphHeight;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#cyberAreaGrad)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="#090d16" stroke={color} strokeWidth="2" />
              <text
                x={p.x}
                y={height - 4}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="middle"
                fontWeight="bold"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export const GamingBarChart: React.FC<{
  data: DataPoint[];
  title?: string;
  color?: string;
}> = ({ data, title, color = "#818cf8" }) => {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full space-y-2.5">
      {title && (
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          {title}
        </div>
      )}
      {data.map((item, index) => {
        const percent = Math.round((item.value / maxValue) * 100);
        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-300 font-bold">{item.label}</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/5">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percent}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}88`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
