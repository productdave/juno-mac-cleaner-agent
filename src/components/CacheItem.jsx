import React from 'react';
import { formatBytes, shortenPath } from '../utils/format.js';

export default function CacheItem({ item, selected, onToggle, maxSize, onAskAI }) {
  const canSelect = item.safe === 'safe' && !item.denied;
  const sizePct = maxSize > 0 ? (item.size / maxSize) * 100 : 0;

  return (
    <div
      className={`cache-item ${selected ? 'selected' : ''} ${item.safe === 'manual' ? 'manual' : ''}`}
      onClick={() => canSelect && onToggle(item)}
      style={{ cursor: canSelect ? 'pointer' : 'default' }}
    >
      <div className={`cache-checkbox ${selected ? 'checked' : ''} ${!canSelect ? 'disabled' : ''}`} />
      <div className="cache-icon">{item.icon}</div>
      <div className="cache-info">
        <div className="cache-name-row">
          <span className="cache-name">{item.name}</span>
          <span className="cache-desc">{item.desc}</span>
          {item.denied ? (
            <span className="tag tag-denied">🔒 locked</span>
          ) : item.safe === 'safe' ? (
            <span className="tag tag-safe">safe to clear</span>
          ) : (
            <span className="tag tag-manual">clean in app</span>
          )}
        </div>
        <div className="cache-path">{shortenPath(item.path)}</div>
        {item.note && <div className="cache-note">⚠ {item.note}</div>}
      </div>
      <div className="cache-size-col">
        <div className="cache-size">{formatBytes(item.size)}</div>
        <div className="size-bar">
          <div className="size-bar-fill" style={{ width: `${sizePct}%` }} />
        </div>
        <button
          className="ai-ask-btn"
          title="Ask AI about this cache"
          onClick={(e) => { e.stopPropagation(); onAskAI(item); }}
        >
          ✨ Ask AI
        </button>
      </div>
    </div>
  );
}
