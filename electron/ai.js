const settings = require('./settings');

const SYSTEM_PROMPT = `You are an expert macOS power user helping someone decide whether it's safe to delete a specific cache or data folder on their Mac.

You will be given:
- The app or service that owns the folder
- The folder path
- The folder size
- A safety classification the user's cleanup tool already assigned ("safe" or "manual")

Answer the user's question concisely (3-6 sentences max). When relevant, explain:
1. What this folder actually contains
2. What happens after deletion (e.g., re-downloads next launch, loses settings, breaks the app)
3. Whether the app should be quit before deleting
4. Any non-obvious risk

Be direct. Don't hedge with "it depends" if you can give a clear answer. If you genuinely don't know what a folder is, say so rather than guessing.`;

async function ask({ cache, question, history = [] }) {
  const provider = settings.getProvider();

  const contextBlock = `Cache details:
- App: ${cache.name}
- Description: ${cache.desc}
- Path: ${cache.path}
- Size: ${formatBytes(cache.size)}
- Classification by cleanup tool: ${cache.safe}${cache.note ? `\n- Existing note: ${cache.note}` : ''}`;

  const userMessage = `${contextBlock}\n\nQuestion: ${question}`;

  if (provider === 'ollama') {
    return askOllama(userMessage, history);
  }
  return askAnthropic(userMessage, history);
}

async function askAnthropic(userMessage, history) {
  const apiKey = settings.getApiKey();
  if (!apiKey) {
    throw new Error('No Anthropic API key set. Open Settings to add one.');
  }

  const model = settings.getModel();
  const messages = [...history, { role: 'user', content: userMessage }];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    let msg = `API error ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed.error?.message) msg = parsed.error.message;
    } catch (_) { /* keep default */ }
    throw new Error(msg);
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return { text, model };
}

async function askOllama(userMessage, history) {
  const baseUrl = settings.getOllamaUrl();
  const model = settings.getModel();

  // Ollama uses OpenAI-compatible /api/chat
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  let res;
  try {
    res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false }),
    });
  } catch (err) {
    throw new Error(
      `Can't connect to Ollama at ${baseUrl}. Is it running?\n` +
      `Install: https://ollama.com\n` +
      `Then run: ollama pull ${model}`
    );
  }

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 404 || text.includes('not found')) {
      throw new Error(
        `Model "${model}" not found. Pull it first:\n  ollama pull ${model}`
      );
    }
    throw new Error(`Ollama error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = (data.message?.content || '').trim();

  if (!text) {
    throw new Error('Ollama returned an empty response. Try a different model.');
  }

  return { text, model };
}

function formatBytes(bytes) {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let i = -1;
  let n = bytes;
  do { n /= 1024; i++; } while (n >= 1024 && i < units.length - 1);
  return `${n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)} ${units[i]}`;
}

module.exports = { ask };
