
import React, { useState } from 'react';
import InputPanel from './components/InputPanel';
import Blueprint2D from './components/Blueprint2D';
import Model3D from './components/Model3D';
import CompliancePanel from './components/CompliancePanel';
import { AnalysisRequest, ComplianceResult } from './types';
import { analyzeDesign } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (request: AnalysisRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeDesign(request);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again with a clearer image or prompt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-blue-500/30">
      {/* Left Sidebar */}
      <InputPanel onAnalyze={handleAnalyze} isAnalyzing={loading} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full p-4 overflow-hidden relative">
        
        {/* Error Notification */}
        {error && (
            <div className="absolute top-6 right-6 z-50 bg-red-500/90 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center backdrop-blur animate-in slide-in-from-top-4">
                <AlertCircle className="w-5 h-5 mr-3" />
                <span className="font-medium">{error}</span>
                <button onClick={() => setError(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
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

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 grid-rows-12 gap-4 h-full">
            
            {/* Row 1: Visuals (60% height) */}
            <div className="col-span-12 row-span-7 grid grid-cols-12 gap-4">
                 {/* Panel A: 2D Blueprint (Comparsion) */}
                <div className="col-span-6 h-full">
                    {result ? (
                        <Blueprint2D 
                            original={result.originalBlueprint} 
                            corrected={result.correctedBlueprint} 
                            violations={result.violations} 
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-600 group border-dashed hover:border-slate-700 transition-colors">
                            <div className="p-4 rounded-full bg-slate-800/50 mb-4">
                                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            </div>
                            <p className="font-medium">2D Blueprint Analysis</p>
                        </div>
                    )}
                </div>

                {/* Panel B: 3D Model */}
                <div className="col-span-6 h-full">
                    {result ? (
                        <Model3D blueprint={result.correctedBlueprint} />
                    ) : (
                        <div className="w-full h-full bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-600 group border-dashed hover:border-slate-700 transition-colors">
                             <div className="p-4 rounded-full bg-slate-800/50 mb-4">
                                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                             <p className="font-medium">3D Spatial Model</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Data (40% height) */}
            <div className="col-span-12 row-span-5">
                {result ? (
                    <CompliancePanel result={result} />
                ) : (
                     <div className="w-full h-full bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-600 border-dashed">
                        <p className="text-sm">Ready to Audit</p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
