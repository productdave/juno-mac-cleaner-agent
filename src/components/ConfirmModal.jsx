import React from 'react';
import { formatBytes } from '../utils/format.js';

const HUGE_THRESHOLD = 50 * 1024 ** 3; // 50 GB

export default function ConfirmModal({ open, mode, totalSize, count, onConfirm, onClose, cleaning }) {
  if (!open) return null;

  if (mode === 'success') {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2>✨ Space freed</h2>
          <div className="freed">{formatBytes(totalSize)}</div>
          <p>Juno cleaned it all up! Rescan anytime to check for more.</p>
          <div className="modal-buttons">
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  const huge = totalSize >= HUGE_THRESHOLD;

  return (
    <div className="modal-backdrop" onClick={cleaning ? null : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Delete {count} cache{count === 1 ? '' : 's'}?</h2>
        <p>
          This will permanently delete <strong style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{formatBytes(totalSize)}</strong> from your disk. Quit any running apps first to avoid corrupted state.
        </p>
        {huge && (
          <div className="warning">
            ⚠ You're about to delete over 50 GB. Double-check the selection — this cannot be undone.
          </div>
        )}
        <div className="modal-buttons">
          <button className="btn" onClick={onClose} disabled={cleaning}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={cleaning}>
            {cleaning ? 'Cleaning…' : 'Delete now'}
          </button>
        </div>
      </div>
    </div>
  );
}
