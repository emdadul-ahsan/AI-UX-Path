import { useState } from 'react';
import { generateRoadmap, generateResources, Roadmap, RoadmapNode, Resource } from '../services/geminiService';
import { Search, Loader2, PlayCircle, FileText, GraduationCap, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RoadmapView() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    setRoadmap(null);
    setSelectedNode(null);
    try {
      const result = await generateRoadmap(topic);
      setRoadmap(result);
    } catch (error) {
      console.error(error);
      alert('Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (node: RoadmapNode) => {
    setSelectedNode(node);
    setLoadingResources(true);
    setResources([]);
    try {
      const result = await generateResources(node.title, node.description);
      setResources(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingResources(false);
    }
  };

  const ResourceIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-5 h-5 text-red-400" />;
      case 'article': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'course': return <GraduationCap className="w-5 h-5 text-emerald-400" />;
      default: return <FileText className="w-5 h-5 text-zinc-400" />;
    }
  };

  const colors = [
    'from-cyan-500 to-blue-500',
    'from-violet-500 to-fuchsia-500',
    'from-fuchsia-500 to-pink-500',
    'from-orange-500 to-amber-500',
    'from-emerald-500 to-teal-500',
  ];

  return (
    <div className="h-full flex flex-col lg:flex-row relative">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Main Roadmap Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Design Learning Paths
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl">
              Generate a personalized, step-by-step roadmap to master any UX, UI, or Product Design topic.
            </p>
            
            <form onSubmit={handleGenerate} className="relative max-w-2xl group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., AI-Driven UX Design, Design Systems..."
                  className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white rounded-2xl py-4 pl-12 pr-36 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all shadow-xl"
                />
                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 rounded-xl font-medium hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-fuchsia-500/25 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                </button>
              </div>
            </form>
            
            {!roadmap && !loading && (
              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                {['AI Product Designer', 'UX Researcher', 'Design Systems Engineer'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setTopic(preset)}
                    className="text-sm px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-fuchsia-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium tracking-wide">Crafting your personalized roadmap...</p>
            </div>
          )}

          {roadmap && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <h2 className="text-3xl font-bold mb-12 text-white">{roadmap.title}</h2>
              
              <div className="absolute left-[27px] top-24 bottom-0 w-0.5 bg-gradient-to-b from-white/20 to-transparent" />
              
              <div className="space-y-6">
                {roadmap.nodes.map((node, index) => {
                  const colorClass = colors[index % colors.length];
                  const isSelected = selectedNode?.id === node.id;
                  
                  return (
                    <motion.div 
                      key={node.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleNodeClick(node)}
                      className={`relative pl-16 cursor-pointer group`}
                    >
                      <div className={`absolute left-5 top-8 w-4 h-4 rounded-full z-20 transition-all duration-300 ${
                        isSelected 
                          ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-125' 
                          : `bg-gradient-to-br ${colorClass} group-hover:scale-110 shadow-lg`
                      }`} />
                      
                      <div className={`p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 ${
                        isSelected 
                          ? 'bg-slate-800/80 border-white/20 shadow-2xl shadow-black/50 scale-[1.02]' 
                          : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60 hover:border-white/10'
                      }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className={`text-xs font-bold tracking-wider uppercase mb-2 bg-clip-text text-transparent bg-gradient-to-r ${colorClass}`}>
                              STEP 0{index + 1}
                            </div>
                            <h3 className={`text-xl font-semibold mb-2 transition-colors ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                              {node.title}
                            </h3>
                            <p className="text-slate-400 leading-relaxed">{node.description}</p>
                          </div>
                          <ChevronRight className={`w-6 h-6 transition-all duration-300 ${
                            isSelected ? 'translate-x-1 text-white' : 'text-slate-600 group-hover:translate-x-1 group-hover:text-slate-400'
                          }`} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Side Panel for Resources */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full lg:w-[450px] bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-40 flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 z-10 bg-slate-900/50 backdrop-blur-xl">
              <h3 className="font-bold text-xl text-white truncate pr-4">{selectedNode.title}</h3>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-10">
                <h4 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-3">Overview</h4>
                <p className="text-slate-300 leading-relaxed text-lg">{selectedNode.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-4">Recommended Resources</h4>
                
                {loadingResources ? (
                  <div className="flex flex-col items-center justify-center py-16 text-fuchsia-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm font-medium">Curating best resources via Search...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resources.map((resource, i) => (
                      <a 
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-5 rounded-2xl bg-slate-950/50 border border-white/5 hover:border-fuchsia-500/30 hover:bg-slate-900 transition-all group shadow-lg"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 p-2.5 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                            <ResourceIcon type={resource.type} />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-200 group-hover:text-white mb-1.5 leading-snug">
                              {resource.title}
                            </h5>
                            <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                              {resource.description}
                            </p>
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                              {resource.type}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
