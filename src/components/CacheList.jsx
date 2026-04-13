import React from 'react';
import CacheItem from './CacheItem.jsx';

const SMALL_THRESHOLD = 50 * 1024 * 1024; // 50 MB

export default function CacheList({ caches, selected, onToggle, showSmall, onToggleSmall, onSelectAllSafe, onClearSelection, onAskAI }) {
  const visible = showSmall ? caches : caches.filter((c) => c.size >= SMALL_THRESHOLD);
  const hiddenCount = caches.length - visible.length;
  const maxSize = caches.reduce((m, c) => Math.max(m, c.size), 0);

  return (
    <div className="cache-list">
      <div className="list-toolbar">
        <span>{visible.length} caches{hiddenCount ? ` · ${hiddenCount} small hidden` : ''}</span>
        <div className="toolbar-actions">
          <span className="toolbar-link" onClick={onToggleSmall}>
            {showSmall ? 'Hide small caches' : 'Show small caches'}
          </span>
          <span className="toolbar-link" onClick={onSelectAllSafe}>Select all safe</span>
          {selected.size > 0 && <span className="toolbar-link" onClick={onClearSelection}>Clear</span>}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 28 }}>✨</div>
          <div>No caches to show. Juno says you're all clean!</div>
        </div>
      ) : (
        visible.map((item) => (
          <CacheItem
            key={item.id}
            item={item}
            selected={selected.has(item.id)}
            onToggle={onToggle}
            maxSize={maxSize}
            onAskAI={onAskAI}
          />
        ))
      )}
    </div>
  );
}
