import { useState, useRef, useEffect } from 'react';
import { createChatSession } from '../services/geminiService';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatbotView() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your AI Mentor for UX and Product Design. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = createChatSession();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessageStream({ message: userMsg });
      
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      let fullText = '';
      for await (const chunk of response) {
        fullText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-zinc-800' : 'bg-emerald-900/50 text-emerald-400'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`max-w-[80%] rounded-2xl p-5 ${
                msg.role === 'user' 
                  ? 'bg-zinc-800 text-zinc-100 rounded-tr-sm' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 rounded-tl-sm flex items-center gap-2 text-zinc-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 lg:p-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Ask your mentor anything..."
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-zinc-700 resize-none min-h-[60px] max-h-[200px]"
              rows={1}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-2 p-3 bg-zinc-100 text-zinc-900 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-xs text-zinc-600 mt-3">
            AI Mentor uses Gemini 3.1 Pro. Responses may be inaccurate.
          </p>
        </div>
      </div>
    </div>
  );
}
