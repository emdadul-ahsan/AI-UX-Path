import { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { Image as ImageIcon, Loader2, Download, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function ImageGenView() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setImageUrl(null);
    try {
      const url = await generateImage(prompt, size);
      setImageUrl(url);
    } catch (error) {
      console.error(error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-12 overflow-y-auto relative">
      {/* Ambient backgrounds */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10">
        <div className="mb-12 text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 flex items-center gap-4 justify-center lg:justify-start bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl shadow-lg shadow-orange-500/25">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            Inspiration Generator
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl">
            Describe a UI concept, wireframe, or moodboard, and let Nano Banana Pro bring it to life.
          </p>
          
          <form onSubmit={handleGenerate} className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-[2rem] blur opacity-10 group-focus-within:opacity-20 transition-opacity duration-500 pointer-events-none" />
            
            <div className="mb-8 relative z-10">
              <label htmlFor="prompt" className="block text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">
                What do you want to design?
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A sleek, dark-mode dashboard for a fintech app, showing a line chart and recent transactions, neon green accents, highly detailed, dribbble style..."
                className="w-full bg-slate-950/50 border border-white/10 text-white rounded-2xl p-5 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 resize-none h-36 shadow-inner transition-all"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
                {(['1K', '2K', '4K'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      size === s 
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3.5 rounded-2xl font-bold hover:from-orange-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Concept'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12">
          {loading && (
            <div className="aspect-video bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-orange-400 shadow-2xl">
              <Loader2 className="w-12 h-12 animate-spin mb-6" />
              <p className="text-xl font-medium tracking-wide">Generating your masterpiece...</p>
              <p className="text-sm mt-2 text-slate-400">This might take a moment for {size} resolution.</p>
            </div>
          )}

          {!loading && imageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-orange-500/10"
            >
              <img 
                src={imageUrl} 
                alt="Generated concept" 
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between p-8">
                <div className="text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-bold text-xl mb-1">Generated Concept</p>
                  <p className="text-sm text-slate-300 font-medium tracking-wide uppercase">{size} Resolution</p>
                </div>
                <a 
                  href={imageUrl} 
                  download="concept.png"
                  className="bg-white hover:bg-slate-200 text-slate-900 p-4 rounded-2xl transition-all shadow-xl hover:scale-105"
                  title="Download Image"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          )}

          {!loading && !imageUrl && (
            <div className="aspect-video bg-slate-900/20 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-slate-500">
              <div className="p-6 bg-white/5 rounded-full mb-4">
                <ImageIcon className="w-12 h-12 opacity-50" />
              </div>
              <p className="font-medium text-lg">Your generated concept will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
