import React, { useState, useRef, useEffect } from 'react';
import { formatBytes, shortenPath } from '../utils/format.js';

const AUTO_QUESTION = 'Is it safe to delete this?';

const FOLLOW_UPS = [
  'What does this folder contain?',
  'Will the app recreate it?',
  'Should I quit the app first?',
  'How much space can I expect to come back?',
  'Any hidden risks?',
];

export default function AskAIModal({ open, cache, onClose }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const autoAskedRef = useRef(null); // track which cache we already auto-asked for

  const hasAPI = typeof window !== 'undefined' && window.diskAPI?.askAI;

  // Auto-ask on open
  useEffect(() => {
    if (open && cache && hasAPI && autoAskedRef.current !== cache.id) {
      autoAskedRef.current = cache.id;
      setMessages([]);
      setQuestion('');
      setError(null);

      // Fire the auto question
      const autoAsk = async () => {
        setMessages([{ role: 'user', text: AUTO_QUESTION }]);
        setLoading(true);
        try {
          const result = await window.diskAPI.askAI({
            cache,
            question: AUTO_QUESTION,
            history: [],
          });
          setMessages([
            { role: 'user', text: AUTO_QUESTION },
            { role: 'assistant', text: result.text },
          ]);
        } catch (err) {
          setError(err.message || 'Something went wrong');
        } finally {
          setLoading(false);
        }
      };
      autoAsk();
    }
  }, [open, cache?.id]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      autoAskedRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!open || !cache) return null;

  const ask = async (q) => {
    const text = q || question.trim();
    if (!text || loading) return;

    setQuestion('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const result = await window.diskAPI.askAI({
        cache,
        question: text,
        history,
      });
      setMessages((prev) => [...prev, { role: 'assistant', text: result.text }]);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  // Show follow-up pills after the first AI response
  const hasResponse = messages.some((m) => m.role === 'assistant');
  const askedQuestions = new Set(messages.filter((m) => m.role === 'user').map((m) => m.text));
  const availableFollowUps = FOLLOW_UPS.filter((q) => !askedQuestions.has(q));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{cache.icon}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{cache.name} — {cache.desc}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                {shortenPath(cache.path)} · {formatBytes(cache.size)}
              </div>
            </div>
          </div>
          <button className="ai-close" onClick={onClose}>×</button>
        </div>

        {/* Messages */}
        <div className="ai-messages">
          {messages.map((m, i) => (
            <div key={i} className={`ai-msg ai-msg-${m.role}`}>
              <div className="ai-msg-label">{m.role === 'user' ? 'You' : 'AI'}</div>
              <div className="ai-msg-text">{m.text}</div>
            </div>
          ))}

          {loading && (
            <div className="ai-msg ai-msg-assistant">
              <div className="ai-msg-label">AI</div>
              <div className="ai-msg-text ai-thinking">
                <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
              </div>
            </div>
          )}

          {error && (
            <div className="ai-error">{error}</div>
          )}

          {/* Follow-up pills */}
          {hasResponse && !loading && availableFollowUps.length > 0 && (
            <div className="ai-followups">
              {availableFollowUps.map((q) => (
                <button key={q} className="ai-quick-btn" onClick={() => ask(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="ai-input-row">
          <input
            ref={inputRef}
            type="text"
            className="ai-input"
            placeholder="Ask a follow-up question…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className="btn btn-primary ai-send" onClick={() => ask()} disabled={!question.trim() || loading}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
