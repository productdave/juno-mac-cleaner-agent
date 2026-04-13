import React from 'react';
import { formatBytes } from '../utils/format.js';

export default function ActionBar({ selectedCount, selectedSize, onClean, onRescan, loading }) {
  return (
    <div className="action-bar">
      <div className="action-summary">
        {selectedCount > 0 ? (
          <>
            <strong>{selectedCount}</strong> selected · <strong>{formatBytes(selectedSize)}</strong> to free
          </>
        ) : (
          <>Select caches above to clean</>
        )}
      </div>
      <div className="action-buttons">
        <button className="btn" onClick={onRescan} disabled={loading}>
          {loading ? 'Scanning…' : '↻ Rescan'}
        </button>
        <button className="btn btn-danger" onClick={onClean} disabled={selectedCount === 0 || loading}>
          Clean selected
        </button>
      </div>
    </div>
  );
}
