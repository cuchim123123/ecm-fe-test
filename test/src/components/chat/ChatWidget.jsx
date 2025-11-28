import React, { useState, useRef } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { sendChatMessage } from '@/services/chat.service';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    const nextHistory = [...messages, { role: 'user', content: text }];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);
    try {
      const res = await sendChatMessage(text, nextHistory);
      const reply =
        res.reply ||
        res.data?.reply ||
        res.message ||
        'Sorry, no reply.';
      setMessages([...nextHistory, { role: 'model', content: reply }]);
    } catch (err) {
      const msg =
        err?.message?.includes('API key')
          ? 'Chat is not configured yet. Please contact admin.'
          : err?.message || 'Sorry, chat service is unavailable.';
      setMessages([...nextHistory, { role: 'model', content: msg }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <>
      {!open && (
        <button
          aria-label="Open chat"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 rounded-full bg-orange-500 text-white shadow-lg w-12 h-12 flex items-center justify-center hover:bg-orange-600 transition"
        >
          <MessageCircle size={22} />
        </button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-40 w-80 sm:w-96 bg-white border shadow-xl rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <div>
              <div className="text-sm font-semibold">Gemini Assistant</div>
              <div className="text-[11px] opacity-90">Ask about products, orders, support</div>
            </div>
            <button aria-label="Close chat" onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded">
              <X size={16} />
            </button>
          </div>
          <div className="p-3 h-72 overflow-y-auto space-y-2 bg-stone-50">
            {messages.length === 0 && (
              <div className="text-xs text-stone-500">
                Hi there! I’m Gemini-powered. Ask me about toys, orders, or shipping.
              </div>
            )}
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[90%] px-3 py-2 rounded-lg text-sm ${
                  m.role === 'user'
                    ? 'ml-auto bg-orange-500 text-white'
                    : 'bg-white border text-stone-800'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="text-xs text-stone-500">Thinking...</div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t bg-white flex gap-2">
            <input
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-3 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
