import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';

const QUICK_QUESTIONS = [
  'What food categories have the most waste?',
  'When is the best time to pick up donations?',
  'Which areas need more volunteers?',
  'How can we improve delivery rates?',
];

export default function AIChatInsight({ donations, users, campaigns }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (question) => {
    const q = question || input.trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);

    const statsContext = `
App Stats:
- Total donations: ${donations.length}
- Delivered: ${donations.filter(d => d.status === 'delivered').length}
- Available: ${donations.filter(d => d.status === 'available').length}
- Claimed: ${donations.filter(d => d.status === 'claimed').length}
- Expired: ${donations.filter(d => d.status === 'expired').length}
- Active volunteers: ${users.filter(u => u.role === 'volunteer').length}
- NGOs/Receivers: ${users.filter(u => u.role === 'receiver').length}
- Campaigns: ${campaigns.length}, Funds raised: ₹${campaigns.reduce((s, c) => s + (c.raised_amount || 0), 0)}
- Food categories: ${JSON.stringify(donations.reduce((acc, d) => { acc[d.category] = (acc[d.category] || 0) + 1; return acc; }, {}))}
    `;

    const answer = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI analytics assistant for FoodBridge, a food rescue platform. Answer this question concisely and helpfully with actionable insights.\n\n${statsContext}\n\nQuestion: ${q}`,
    });
    setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    setLoading(false);
  };

  return (
    <div className="bg-card border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">AI Analytics Assistant</p>
          <p className="text-xs text-muted-foreground">Ask anything about food waste patterns & optimization</p>
        </div>
        <Sparkles className="w-4 h-4 text-primary ml-auto" />
      </div>

      {messages.length === 0 && (
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3 font-medium">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => ask(q)}
                className="text-xs bg-muted hover:bg-muted/70 text-foreground px-3 py-1.5 rounded-full border transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="max-h-64 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-3 h-3 text-primary" />
              </div>
              <div className="bg-muted px-3 py-2 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4 border-t flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about food waste patterns..."
          onKeyDown={e => e.key === 'Enter' && ask()} className="text-sm" />
        <Button onClick={() => ask()} disabled={!input.trim() || loading} size="icon" className="bg-primary hover:bg-primary/90 text-white shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
