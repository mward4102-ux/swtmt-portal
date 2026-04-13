'use client';
import { useState, useRef, useEffect } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hi Michael. Ask me to draft a capability statement, pull a document, or answer a compliance question.' }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    if (!input.trim() || busy) return;
    const next = [...messages, { role: 'user' as const, content: input }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const r = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: next })
      });
      const j = await r.json();
      setMessages(m => [...m, { role: 'assistant', content: j.reply || j.error || '(no response)' }]);
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error: ' + e.message }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 bg-navy hover:bg-ink text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
        aria-label="Open chatbot"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-24 right-5 w-96 h-[32rem] bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col">
          <div className="bg-navy text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
            <span className="font-semibold">SWTMT Assistant</span>
            <button onClick={() => setOpen(false)} className="text-gold">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <span className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-navy text-white' : 'bg-slate-100 text-ink'}`}>
                  {m.content}
                </span>
              </div>
            ))}
            {busy && <div className="text-slate-400 text-xs">Thinking…</div>}
            <div ref={endRef} />
          </div>
          <div className="p-2 border-t border-slate-200 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder="Ask or command…"
              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
            />
            <button onClick={send} disabled={busy} className="bg-navy text-white px-3 rounded text-sm disabled:opacity-50">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
