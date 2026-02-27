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
    <div className="h-full flex flex-col p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-12 text-center lg:text-left">
          <h1 className="text-4xl font-semibold tracking-tight mb-4 flex items-center gap-3 justify-center lg:justify-start">
            <Wand2 className="w-8 h-8 text-indigo-400" />
            Inspiration Generator
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            Describe a UI concept, wireframe, or moodboard, and let Nano Banana Pro bring it to life.
          </p>
          
          <form onSubmit={handleGenerate} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-medium text-zinc-400 mb-2">
                What do you want to design?
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A sleek, dark-mode dashboard for a fintech app, showing a line chart and recent transactions, neon green accents, highly detailed, dribbble style..."
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-32"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-500 mr-2">Resolution:</span>
                {(['1K', '2K', '4K'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      size === s 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full sm:w-auto bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Concept'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12">
          {loading && (
            <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-500" />
              <p className="text-lg">Generating your masterpiece...</p>
              <p className="text-sm mt-2 opacity-60">This might take a moment for {size} resolution.</p>
            </div>
          )}

          {!loading && imageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl"
            >
              <img 
                src={imageUrl} 
                alt="Generated concept" 
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-6">
                <div className="text-white">
                  <p className="font-medium text-lg">Generated Concept</p>
                  <p className="text-sm text-zinc-300 opacity-80">{size} Resolution</p>
                </div>
                <a 
                  href={imageUrl} 
                  download="concept.png"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-xl transition-colors"
                  title="Download Image"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          )}

          {!loading && !imageUrl && (
            <div className="aspect-video bg-zinc-900/50 border border-zinc-800/50 border-dashed rounded-3xl flex flex-col items-center justify-center text-zinc-600">
              <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
              <p>Your generated concept will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
