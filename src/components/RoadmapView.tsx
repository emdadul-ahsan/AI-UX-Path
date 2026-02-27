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

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Main Roadmap Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-4xl font-semibold tracking-tight mb-4">Design Learning Paths</h1>
            <p className="text-zinc-400 text-lg mb-8">
              Generate a personalized, step-by-step roadmap to master any UX, UI, or Product Design topic.
            </p>
            
            <form onSubmit={handleGenerate} className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-zinc-500" />
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI-Driven UX Design, Design Systems, User Research..."
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl py-4 pl-12 pr-32 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="absolute right-2 top-2 bottom-2 bg-zinc-100 text-zinc-900 px-6 rounded-xl font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
              </button>
            </form>
            
            {!roadmap && !loading && (
              <div className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
                {['AI Product Designer', 'UX Researcher', 'Design Systems Engineer'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setTopic(preset)}
                    className="text-sm px-4 py-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Crafting your personalized roadmap...</p>
            </div>
          )}

          {roadmap && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <h2 className="text-2xl font-semibold mb-12">{roadmap.title}</h2>
              
              <div className="absolute left-[27px] top-20 bottom-0 w-0.5 bg-zinc-800" />
              
              <div className="space-y-8">
                {roadmap.nodes.map((node, index) => (
                  <motion.div 
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleNodeClick(node)}
                    className={`relative pl-16 cursor-pointer group`}
                  >
                    <div className={`absolute left-5 top-6 w-4 h-4 rounded-full border-4 border-zinc-950 z-10 transition-colors ${
                      selectedNode?.id === node.id ? 'bg-zinc-100' : 'bg-zinc-700 group-hover:bg-zinc-500'
                    }`} />
                    
                    <div className={`p-6 rounded-2xl border transition-all ${
                      selectedNode?.id === node.id 
                        ? 'bg-zinc-800/80 border-zinc-700' 
                        : 'bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-mono text-zinc-500 mb-2">STEP 0{index + 1}</div>
                          <h3 className="text-xl font-medium text-zinc-100 mb-2">{node.title}</h3>
                          <p className="text-zinc-400 leading-relaxed">{node.description}</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-zinc-600 transition-transform ${
                          selectedNode?.id === node.id ? 'translate-x-1 text-zinc-300' : 'group-hover:translate-x-1'
                        }`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
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
            className="fixed inset-y-0 right-0 w-full lg:w-[400px] bg-zinc-900 border-l border-zinc-800 shadow-2xl z-40 flex flex-col"
          >
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/95 backdrop-blur sticky top-0 z-10">
              <h3 className="font-semibold text-lg truncate pr-4">{selectedNode.title}</h3>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-8">
                <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">Overview</h4>
                <p className="text-zinc-300 leading-relaxed">{selectedNode.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Recommended Resources</h4>
                
                {loadingResources ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mb-3" />
                    <p className="text-sm">Curating best resources...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resources.map((resource, i) => (
                      <a 
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <ResourceIcon type={resource.type} />
                          </div>
                          <div>
                            <h5 className="font-medium text-zinc-200 group-hover:text-zinc-100 mb-1 leading-snug">
                              {resource.title}
                            </h5>
                            <p className="text-sm text-zinc-500 line-clamp-2">
                              {resource.description}
                            </p>
                            <div className="mt-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
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
