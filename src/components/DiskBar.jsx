import React from 'react';
import { formatBytes } from '../utils/format.js';

export default function DiskBar({ info, freedSpace }) {
  if (!info) return null;
  const { total, used, free } = info;
  const usedPct = ((used - freedSpace) / total) * 100;
  const freedPct = (freedSpace / total) * 100;

  return (
    <div className="disk-card">
      <div className="disk-header">
        <div>
          <div className="disk-label">Macintosh HD</div>
        </div>
        <div className="disk-stats">
          <strong>{formatBytes(free + freedSpace)}</strong> free of <strong>{formatBytes(total)}</strong>
        </div>
      </div>
      <div className="disk-bar">
        <div className="disk-bar-used" style={{ width: `${Math.max(0, usedPct)}%` }} />
        {freedPct > 0 && <div className="disk-bar-freed" style={{ width: `${freedPct}%` }} />}
      </div>
      <div className="disk-legend">
        <span><span className="dot" style={{ background: 'linear-gradient(90deg, #ef4444, #f97316)' }} />Used</span>
        {freedSpace > 0 && <span><span className="dot" style={{ background: '#22c55e' }} />Freed {formatBytes(freedSpace)}</span>}
        <span><span className="dot" style={{ background: 'rgba(255,255,255,0.08)' }} />Free</span>
      </div>
    </div>
  );
}
