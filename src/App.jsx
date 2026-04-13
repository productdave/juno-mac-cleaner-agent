import React, { useState, useMemo } from 'react';
import { useDiskData } from './hooks/useDiskData.js';
import DiskBar from './components/DiskBar.jsx';
import CacheList from './components/CacheList.jsx';
import ActionBar from './components/ActionBar.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import AskAIModal from './components/AskAIModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';

export default function App() {
  const { caches, info, loading, freedSpace, refresh, deletePaths } = useDiskData();
  const [selected, setSelected] = useState(new Set());
  const [showSmall, setShowSmall] = useState(false);
  const [modal, setModal] = useState(null); // null | 'confirm' | 'success'
  const [cleaning, setCleaning] = useState(false);
  const [lastFreed, setLastFreed] = useState(0);
  const [aiCache, setAiCache] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggle = (item) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  const selectAllSafe = () => {
    const ids = caches.filter((c) => c.safe === 'safe' && !c.denied).map((c) => c.id);
    setSelected(new Set(ids));
  };

  const clearSelection = () => setSelected(new Set());

  const { selectedSize, selectedPaths } = useMemo(() => {
    const picked = caches.filter((c) => selected.has(c.id));
    return {
      selectedSize: picked.reduce((a, c) => a + c.size, 0),
      selectedPaths: picked.map((c) => c.path),
    };
  }, [caches, selected]);

  const totalSize = useMemo(() => caches.reduce((a, c) => a + c.size, 0), [caches]);

  const handleClean = async () => {
    setCleaning(true);
    const result = await deletePaths(selectedPaths);
    setCleaning(false);
    setSelected(new Set());
    setLastFreed(result.freedSpace || selectedSize);
    setModal('success');
  };

  const handleAskAI = async (item) => {
    const hasAPI = typeof window !== 'undefined' && window.diskAPI?.getSettings;
    if (hasAPI) {
      const s = await window.diskAPI.getSettings();
      // Ollama doesn't need a key; Anthropic does
      if (s.provider === 'anthropic' && !s.hasApiKey) {
        setSettingsOpen(true);
        return;
      }
    }
    setAiCache(item);
  };

  return (
    <div className="app">
      <div className="drag-region" />

      <div className="app-header">
        <div>
          <div className="app-title">🦕 Juno</div>
          <div className="app-subtitle">
            {loading
              ? 'Scanning caches…'
              : `${caches.length} caches found · ${formatTotal(totalSize)} to clean up`}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={() => setSettingsOpen(true)} title="Settings">
            ⚙
          </button>
        </div>
      </div>

      <DiskBar info={info} freedSpace={freedSpace} />

      {loading && caches.length === 0 ? (
        <div className="empty-state">
          <div className="spinner" />
          <div>Juno is sniffing out caches…</div>
        </div>
      ) : (
        <CacheList
          caches={caches}
          selected={selected}
          onToggle={toggle}
          showSmall={showSmall}
          onToggleSmall={() => setShowSmall((s) => !s)}
          onSelectAllSafe={selectAllSafe}
          onClearSelection={clearSelection}
          onAskAI={handleAskAI}
        />
      )}

      <ActionBar
        selectedCount={selected.size}
        selectedSize={selectedSize}
        onClean={() => setModal('confirm')}
        onRescan={refresh}
        loading={loading}
      />

      <ConfirmModal
        open={modal !== null}
        mode={modal}
        totalSize={modal === 'success' ? lastFreed : selectedSize}
        count={selected.size}
        onConfirm={handleClean}
        onClose={() => setModal(null)}
        cleaning={cleaning}
      />

      <AskAIModal
        open={aiCache !== null}
        cache={aiCache}
        onClose={() => setAiCache(null)}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

function formatTotal(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 ** 2)} MB`;
}
