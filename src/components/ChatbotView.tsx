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
    <div className="h-full flex flex-col bg-slate-950 relative">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-blue-500/25' 
                  : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-fuchsia-500/25'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`max-w-[80%] rounded-3xl p-5 shadow-xl ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/20 text-cyan-50 rounded-tr-sm backdrop-blur-md' 
                  : 'bg-slate-900/80 border border-white/10 text-slate-200 rounded-tl-sm backdrop-blur-md'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="prose prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-white/10 prose-a:text-fuchsia-400 hover:prose-a:text-fuchsia-300">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-900/80 border border-white/10 backdrop-blur-md rounded-3xl p-5 rounded-tl-sm flex items-center gap-3 text-fuchsia-400 shadow-xl">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 lg:p-6 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 relative z-10">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-end gap-2 group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500" />
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
              className="w-full bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 resize-none min-h-[60px] max-h-[200px] shadow-xl relative z-10"
              rows={1}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-2 p-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-fuchsia-500/25 z-20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-xs text-slate-500 mt-4 font-medium">
            AI Mentor uses Gemini 3.1 Pro. Responses may be inaccurate.
          </p>
        </div>
      </div>
    </div>
  );
}
