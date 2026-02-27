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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
          <p>Initializing workspace...</p>
        </div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-zinc-300" />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-3">API Key Required</h1>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            To use the advanced AI features like high-resolution image generation and the Pro mentor chatbot, please select your Google Cloud API key.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Select API Key
          </button>
          <p className="mt-6 text-xs text-zinc-500">
            You need a paid Google Cloud project. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-zinc-300">Learn about billing</a>.
          </p>
        </div>
      </div>
    );
  }

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => { setCurrentView(view); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        currentView === view 
          ? 'bg-zinc-800 text-zinc-100' 
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-zinc-900" />
              </div>
              <span className="font-semibold text-lg tracking-tight">AI UX Path</span>
            </div>
            <button className="lg:hidden text-zinc-400 hover:text-zinc-100" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            <NavItem view="roadmap" icon={LayoutDashboard} label="Learning Paths" />
            <NavItem view="chat" icon={MessageSquare} label="AI Mentor" />
            <NavItem view="image" icon={ImageIcon} label="Inspiration Gen" />
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-zinc-300">API Connected</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="lg:hidden h-16 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-semibold">AI UX Path</span>
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
