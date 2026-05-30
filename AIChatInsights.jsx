import React, { useState, useMemo, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { Button } from './button';
import { Input } from './input';
import { generateFoodAppInsight, prepareAppStateData } from './generateFoodAppInsight';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';

const QUICK_QUESTIONS = [
  'quick_question_1',
  'quick_question_2',
  'quick_question_3',
  'quick_question_4',
];

// Memoized message component for performance
const MessageItem = React.memo(({ message, onRetry, onCopy, t }) => (
  <div className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`} role="article" aria-label={`${message.role === 'user' ? 'Your' : 'AI'} message`}>
    {message.role === 'ai' && (
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
        <Bot className="w-3 h-3 text-primary" />
      </div>
    )}
    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${message.role === 'user' ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}>
      {message.text}
      {message.error && (
        <div className="mt-2 flex gap-2" role="toolbar" aria-label="Error recovery options">
          <button
            onClick={() => onRetry(message.originalQuestion)}
            className="text-xs px-2 py-1 rounded-md bg-primary text-white hover:bg-primary/90"
            aria-label="Retry last question"
          >{t('retry') || 'Retry'}</button>
          <button
            onClick={() => onCopy(message.originalQuestion)}
            className="text-xs px-2 py-1 rounded-md border hover:bg-muted"
            aria-label="Copy question to clipboard"
          >{t('copy') || 'Copy'}</button>
        </div>
      )}
    </div>
  </div>
));
MessageItem.displayName = 'MessageItem';

function AIChatInsight({ donations, users, campaigns }) {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [showSnapshot, setShowSnapshot] = useState(false);

  // prepare a memoized snapshot of the app state for display and for requests
  const appStateSnapshot = useMemo(() => {
    return prepareAppStateData(donations || [], users || [], campaigns || [], currentUser || null);
  }, [donations, users, campaigns, currentUser]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (question) => {
    const q = question || input.trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);

    try {
      // Use the precomputed app state snapshot (memoized)
      const appState = appStateSnapshot;

      // Generate insight using the helper utility which wraps the LLM call
      const answer = await generateFoodAppInsight(q, appState);

      setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    } catch (err) {
      console.error('AI insight error:', err);
      // Push an AI message with retry option
      setMessages(prev => [...prev, { role: 'ai', text: t('ai_insight_error') || 'I could not generate an insight right now.', error: true, originalQuestion: q }]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of ask to prevent rapid repeated calls
  const debouncedAsk = useCallback(debounce((q) => {
    ask(q);
  }, 700), [appStateSnapshot]);

  // Optimized handlers for error recovery
  const handleRetry = useCallback((originalQuestion) => {
    debouncedAsk(originalQuestion);
  }, [debouncedAsk]);

  const handleCopy = useCallback((text) => {
    navigator.clipboard?.writeText(text || '');
    alert(t('copied_to_clipboard') || 'Question copied to clipboard');
  }, [t]);

  return (
    <div className="bg-card border rounded-2xl overflow-hidden" data-testid="ai-chat-panel" role="region" aria-labelledby="ai-chat-title">
      <header className="flex items-center gap-2 px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center" aria-hidden="true">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-sm text-foreground" id="ai-chat-title">{t('ai_chat_assistant_title')}</h2>
          <p className="text-xs text-muted-foreground">{t('ai_chat_assistant_subtitle')}</p>
        </div>
        <Sparkles className="w-4 h-4 text-primary ml-auto" aria-hidden="true" />
        <div className="ml-2">
          <button
            data-testid="ai-chat-toggle"
            onClick={() => setShowSnapshot(s => !s)}
            className="text-xs px-3 py-1 rounded-md border bg-muted/10 hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-pressed={showSnapshot}
            aria-label={showSnapshot ? 'Hide data snapshot' : 'Show data snapshot'}
          >
            {showSnapshot ? t('hide_data_snapshot') || 'Hide Data' : t('show_data_snapshot') || 'Show Data'}
          </button>
        </div>
      </header>

      {showSnapshot && (
        <div className="p-4 border-b bg-slate-50">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t('ai_data_snapshot_label') || 'AI Data Snapshot'}</p>
          <pre className="max-h-48 overflow-auto text-xs bg-white p-3 rounded-md border text-foreground">
            {JSON.stringify(appStateSnapshot, null, 2)}
          </pre>
        </div>
      )}

      {messages.length === 0 && (
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3 font-medium">{t('quick_questions_label')}</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map(q => (
              <button key={q} data-testid="ai-chat-quick-question" onClick={() => debouncedAsk(t(q))}
                className="text-xs bg-muted hover:bg-muted/70 text-foreground px-3 py-1.5 rounded-full border transition-colors">
                {t(q)}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="max-h-64 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map((m, i) => (
            <MessageItem
              key={i}
              message={m}
              onRetry={handleRetry}
              onCopy={handleCopy}
              t={t}
            />
          ))}
          {loading && (
            <div className="flex gap-2" aria-live="polite" aria-label="AI is generating response">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden="true">
                <Bot className="w-3 h-3 text-primary" />
              </div>
              <div className="bg-muted px-3 py-2 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-label="Loading" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4 border-t flex gap-2" role="search">
        <Input
          data-testid="ai-chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t('ai_chat_placeholder')}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              ask();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              ask();
            }
          }}
          className="text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Ask AI a question"
          disabled={loading}
        />
        <Button
          type="button"
          data-testid="ai-chat-send"
          onClick={() => ask()}
          disabled={!input.trim() || loading}
          size="icon"
          className="bg-primary hover:bg-primary/90 text-white shrink-0 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Send message (Enter or Ctrl+Enter)"
          title="Send (Enter)"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export default React.memo(AIChatInsight);
