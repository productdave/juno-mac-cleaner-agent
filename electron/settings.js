const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function read() {
  try {
    const raw = fs.readFileSync(settingsPath(), 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

function write(obj) {
  const file = settingsPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), { mode: 0o600 });
}

function get() {
  const s = read();
  return {
    provider: s.provider || 'anthropic', // 'anthropic' | 'ollama'
    hasApiKey: !!s.anthropicApiKey,
    model: s.model || (s.provider === 'ollama' ? 'gemma4' : 'claude-haiku-4-5'),
    ollamaUrl: s.ollamaUrl || 'http://localhost:11434',
    ollamaModel: s.ollamaModel || 'gemma4',
  };
}

function set(patch) {
  const current = read();
  const next = { ...current, ...patch };
  if (next.anthropicApiKey === '') delete next.anthropicApiKey;
  write(next);
  return get();
}

function getApiKey() {
  return read().anthropicApiKey || null;
}

function getProvider() {
  return read().provider || 'anthropic';
}

function getModel() {
  const s = read();
  if ((s.provider || 'anthropic') === 'ollama') return s.ollamaModel || 'gemma4';
  return s.model || 'claude-haiku-4-5';
}

function getOllamaUrl() {
  return read().ollamaUrl || 'http://localhost:11434';
}

module.exports = { get, set, getApiKey, getProvider, getModel, getOllamaUrl };
