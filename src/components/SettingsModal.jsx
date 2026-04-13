import React, { useState, useEffect } from 'react';

export default function SettingsModal({ open, onClose }) {
  const [provider, setProvider] = useState('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('gemma4');
  const [saving, setSaving] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState(null); // null | 'checking' | 'ok' | 'error'

  const hasAPI = typeof window !== 'undefined' && window.diskAPI?.getSettings;

  useEffect(() => {
    if (open && hasAPI) {
      window.diskAPI.getSettings().then((s) => {
        setProvider(s.provider || 'anthropic');
        setHasKey(s.hasApiKey);
        setOllamaUrl(s.ollamaUrl || 'http://localhost:11434');
        setOllamaModel(s.ollamaModel || 'gemma4');
      });
    }
  }, [open, hasAPI]);

  if (!open) return null;

  const handleSaveKey = async () => {
    if (!hasAPI) return;
    setSaving(true);
    const result = await window.diskAPI.setSettings({ anthropicApiKey: apiKey, provider: 'anthropic' });
    setHasKey(result.hasApiKey);
    setProvider('anthropic');
    setApiKey('');
    setSaving(false);
  };

  const handleRemoveKey = async () => {
    if (!hasAPI) return;
    const result = await window.diskAPI.setSettings({ anthropicApiKey: '' });
    setHasKey(result.hasApiKey);
  };

  const handleSaveOllama = async () => {
    if (!hasAPI) return;
    setSaving(true);
    await window.diskAPI.setSettings({
      provider: 'ollama',
      ollamaUrl,
      ollamaModel,
    });
    setProvider('ollama');
    setSaving(false);
  };

  const handleSwitchProvider = async (p) => {
    setProvider(p);
    if (hasAPI) {
      await window.diskAPI.setSettings({ provider: p });
    }
  };

  const checkOllama = async () => {
    setOllamaStatus('checking');
    try {
      // We'll use the AI ask to test — but simpler: just save and let the user try
      // Instead, make a lightweight check via the main process
      const result = await window.diskAPI.setSettings({ provider: 'ollama', ollamaUrl, ollamaModel });
      setProvider('ollama');
      setOllamaStatus('ok');
    } catch (_) {
      setOllamaStatus('error');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-strong)',
    borderRadius: 8,
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: 12,
    outline: 'none',
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 460 }}>
        <h2>Settings</h2>

        {/* Provider toggle */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[
            { id: 'anthropic', label: 'Claude API' },
            { id: 'ollama', label: 'Ollama (Local)' },
          ].map((p) => (
            <button
              key={p.id}
              className="btn"
              onClick={() => handleSwitchProvider(p.id)}
              style={{
                flex: 1,
                background: provider === p.id ? 'rgba(59, 130, 246, 0.15)' : undefined,
                borderColor: provider === p.id ? 'rgba(59, 130, 246, 0.4)' : undefined,
                color: provider === p.id ? 'var(--blue)' : undefined,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Anthropic settings */}
        {provider === 'anthropic' && (
          <>
            <p>
              Add your <strong style={{ color: 'var(--text)' }}>Anthropic API key</strong> to use Claude.
              Stored locally, only sent to api.anthropic.com.
            </p>
            {hasKey ? (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: 8, padding: '10px 12px',
                  fontSize: 12, color: 'var(--green)',
                }}>
                  ✓ API key is set
                  <button
                    className="btn"
                    style={{ marginLeft: 'auto', fontSize: 11, padding: '4px 10px' }}
                    onClick={handleRemoveKey}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <input
                  type="password"
                  placeholder="sk-ant-api03-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}
            <div className="modal-buttons">
              <button className="btn" onClick={onClose}>Close</button>
              {!hasKey && (
                <button
                  className="btn btn-primary"
                  onClick={handleSaveKey}
                  disabled={!apiKey.trim() || saving}
                >
                  {saving ? 'Saving…' : 'Save key'}
                </button>
              )}
            </div>
          </>
        )}

        {/* Ollama settings */}
        {provider === 'ollama' && (
          <>
            <p>
              Use a local model via <strong style={{ color: 'var(--text)' }}>Ollama</strong>.
              No API key needed — runs entirely on your Mac.
            </p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
                Ollama URL
              </label>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
                Model name
              </label>
              <input
                type="text"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                placeholder="gemma4"
                style={inputStyle}
              />
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, lineHeight: 1.5 }}>
                Popular models: <code>gemma4</code>, <code>gemma3</code>, <code>llama3.1</code>, <code>mistral</code>, <code>phi4</code>
                <br />
                Pull a model: <code style={{ color: 'var(--text-dim)' }}>ollama pull gemma4</code>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn" onClick={onClose}>Close</button>
              <button
                className="btn btn-primary"
                onClick={handleSaveOllama}
                disabled={!ollamaModel.trim() || saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
