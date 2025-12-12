
import React, { useState, useEffect } from 'react';
import InputPanel from './components/InputPanel';
import Blueprint2D from './components/Blueprint2D';
import Model3D from './components/Model3D';
import CompliancePanel from './components/CompliancePanel';
import { AnalysisRequest, ComplianceResult } from './types';
import { analyzeDesign } from './services/geminiService';
import { AlertCircle, Check, X, Box, FileText, Map, LayoutDashboard, ArrowRight } from 'lucide-react';

type ViewMode = 'blueprint' | 'model' | 'audit';

const App: React.FC = () => {
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation State
  const [activeView, setActiveView] = useState<ViewMode>('audit');
  const [showFixes, setShowFixes] = useState(false);

  const handleAnalyze = async (request: AnalysisRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeDesign(request);
      setResult(data);
      // Auto-switch to audit view on success
      setActiveView('audit'); 
      setShowFixes(true);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again. If uploading a blueprint, ensure it's clear.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for Tab Buttons
  const TabButton = ({ id, label, icon: Icon }: { id: ViewMode; label: string; icon: any }) => (
      <button
        onClick={() => setActiveView(id)}
        disabled={!result}
        className={`relative px-6 py-3 text-sm font-medium transition-all duration-300 flex items-center space-x-2 rounded-t-lg border-b-2
            ${!result ? 'opacity-50 cursor-not-allowed text-slate-600 border-transparent' : 
              activeView === id 
                ? 'text-blue-400 border-blue-500 bg-slate-800/50' 
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/30'
            }
        `}
      >
        <Icon className={`w-4 h-4 ${activeView === id ? 'text-blue-400' : 'text-slate-500'}`} />
        <span>{label}</span>
        {activeView === id && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
        )}
      </button>
  );

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden selection:bg-blue-500/30">
      {/* Left Sidebar */}
      <InputPanel onAnalyze={handleAnalyze} isAnalyzing={loading} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]">
        
        {/* Top Navigation Bar */}
        <header className="h-16 flex-shrink-0 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-8 z-30">
             <div className="flex items-end space-x-1 h-full pt-2">
                <TabButton id="audit" label="Audit Report" icon={FileText} />
                <TabButton id="blueprint" label="Blueprint Comparison" icon={Map} />
                <TabButton id="model" label="3D Visualization" icon={Box} />
             </div>
             
             {/* Global Context Controls */}
             {result && (activeView === 'blueprint' || activeView === 'model') && (
                 <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-right-4 duration-500">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">View Mode</span>
                    <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700/50 shadow-inner">
                        <button
                            onClick={() => setShowFixes(false)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center transition-all duration-300 ${!showFixes ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <X className="w-3 h-3 mr-2" /> Original
                        </button>
                        <button
                            onClick={() => setShowFixes(true)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center transition-all duration-300 ${showFixes ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Check className="w-3 h-3 mr-2" /> Corrected
                        </button>
                    </div>
                 </div>
             )}
        </header>

        {/* Main View Container */}
        <main className="flex-1 overflow-hidden relative p-6">
            
            {/* Error Notification */}
            {error && (
                <div className="absolute top-6 right-6 z-50 bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl shadow-2xl flex items-center backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-red-500/20 p-2 rounded-full mr-3">
                         <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="font-medium text-sm">{error}</span>
                    <button onClick={() => setError(null)} className="ml-4 opacity-70 hover:opacity-100 hover:text-white transition-colors">✕</button>
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center transition-all">
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <h2 className="mt-8 text-2xl font-bold text-white tracking-[0.2em] animate-pulse">PROCESSING</h2>
                    <div className="mt-4 flex flex-col items-center space-y-2 text-sm font-mono text-slate-400">
                        <p className="animate-fade-in-up delay-75">Accessing Code Database...</p>
                        <p className="animate-fade-in-up delay-150">Constructing 3D Geometry...</p>
                        <p className="animate-fade-in-up delay-300">Auditing Compliance Violations...</p>
                    </div>
                </div>
            )}

            {/* Empty State / Welcome Screen */}
            {!result && !loading && (
                 <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[100px]"></div>
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-[0_0_40px_rgba(59,130,246,0.3)] rotate-3">
                            <LayoutDashboard className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">ACCA</span>
                        </h1>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            Your AI-powered architectural compliance assistant. Upload a floor plan or describe your vision to generate instant 3D models and IRC-compliant audits.
                        </p>
                        <div className="flex items-center justify-center space-x-8 text-sm font-medium text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center"><Check className="w-4 h-4 mr-2 text-blue-500" /> Instant Audit</span>
                            <span className="flex items-center"><Check className="w-4 h-4 mr-2 text-purple-500" /> 3D Gen</span>
                            <span className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500" /> Code Fixes</span>
                        </div>
                    </div>
                 </div>
            )}

            {/* CONTENT VIEWS */}
            {result && !loading && (
                <div className="w-full h-full relative animate-in fade-in zoom-in-95 duration-500">
                    
                    {/* View 1: Audit Report */}
                    {activeView === 'audit' && (
                        <div className="h-full overflow-hidden">
                            <CompliancePanel result={result} />
                        </div>
                    )}

                    {/* View 2: Blueprint Comparison */}
                    {activeView === 'blueprint' && (
                         <div className="h-full bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm">
                             <Blueprint2D 
                                 original={result.originalBlueprint} 
                                 corrected={result.correctedBlueprint} 
                                 violations={result.violations} 
                                 showFixes={showFixes} // Controls split view vs single view inside Blueprint2D
                             />
                         </div>
                    )}

                    {/* View 3: 3D Model */}
                    {activeView === 'model' && (
                        <div className="h-full bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm relative group">
                            <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-400">
                                    <span className="text-white font-bold">Orbit:</span> Left Click + Drag <span className="mx-2">|</span> 
                                    <span className="text-white font-bold">Pan:</span> Right Click + Drag <span className="mx-2">|</span> 
                                    <span className="text-white font-bold">Zoom:</span> Scroll
                                </div>
                            </div>
                            <Model3D blueprint={showFixes ? result.correctedBlueprint : result.originalBlueprint} />
                        </div>
                    )}
                </div>
            )}

        </main>
      </div>
    </div>
  );
};

export default App;
