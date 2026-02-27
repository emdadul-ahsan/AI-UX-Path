import { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Image as ImageIcon, Key, Menu, X } from 'lucide-react';
import RoadmapView from './components/RoadmapView';
import ChatbotView from './components/ChatbotView';
import ImageGenView from './components/ImageGenView';

type View = 'roadmap' | 'chat' | 'image';

export default function App() {
  const [hasKey, setHasKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);
  const [currentView, setCurrentView] = useState<View>('roadmap');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        // @ts-ignore
        const has = await window.aistudio.hasSelectedApiKey();
        setHasKey(has);
      } else {
        // Fallback for local dev if window.aistudio is not injected
        setHasKey(!!process.env.GEMINI_API_KEY);
      }
      setCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success to mitigate race condition
      setHasKey(true);
    } else {
      alert("API Key selection is only available in the AI Studio environment.");
    }
  };

  if (checkingKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
          <p className="text-fuchsia-200/60 font-medium tracking-wide">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Colorful background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[128px] pointer-events-none" />
        
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-fuchsia-500/25 rotate-3">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">API Key Required</h1>
          <p className="text-slate-300 mb-8 leading-relaxed">
            To use the advanced AI features like high-resolution image generation and the Pro mentor chatbot, please select your Google Cloud API key.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 hover:-translate-y-0.5"
          >
            Select API Key
          </button>
          <p className="mt-6 text-xs text-slate-400">
            You need a paid Google Cloud project. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-2">Learn about billing</a>.
          </p>
        </div>
      </div>
    );
  }

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => { setCurrentView(view); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
        currentView === view 
          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/25' 
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-white' : 'text-slate-400'}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans selection:bg-fuchsia-500/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-white/5 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* Sidebar ambient glow */}
          <div className="absolute top-0 left-0 w-full h-64 bg-violet-500/10 blur-[80px] pointer-events-none" />
          
          <div className="p-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AI UX Path</span>
            </div>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
            <NavItem view="roadmap" icon={LayoutDashboard} label="Learning Paths" />
            <NavItem view="chat" icon={MessageSquare} label="AI Mentor" />
            <NavItem view="image" icon={ImageIcon} label="Inspiration Gen" />
          </nav>

          <div className="p-6 relative z-10">
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <span className="text-sm font-medium text-slate-300">API Connected</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-950">
        <header className="lg:hidden h-16 border-b border-white/5 flex items-center px-4 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-3 font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AI UX Path</span>
        </header>

        <div className="flex-1 overflow-y-auto">
          {currentView === 'roadmap' && <RoadmapView />}
          {currentView === 'chat' && <ChatbotView />}
          {currentView === 'image' && <ImageGenView />}
        </div>
      </main>
    </div>
  );
}
