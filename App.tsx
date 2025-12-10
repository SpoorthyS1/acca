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
      setError("Failed to analyze design. Ensure API Key is set and quota is available.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Left Sidebar */}
      <InputPanel onAnalyze={handleAnalyze} isAnalyzing={loading} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full p-4 overflow-hidden relative">
        
        {/* Error Notification */}
        {error && (
            <div className="absolute top-6 right-6 z-50 bg-red-500/90 text-white px-4 py-3 rounded shadow-lg flex items-center backdrop-blur animate-bounce">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
                <button onClick={() => setError(null)} className="ml-4 font-bold hover:text-red-100">X</button>
            </div>
        )}

        {/* Loading Overlay */}
        {loading && (
            <div className="absolute inset-0 z-40 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity">
                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-3xl font-black text-white tracking-widest animate-pulse">AUDITING DESIGN</h2>
                <div className="mt-4 flex flex-col items-center text-slate-400 space-y-1 text-sm font-mono">
                    <p>Fetching Local Codes...</p>
                    <p>Generating Geometric Volumes...</p>
                    <p>Calculating Egress Requirements...</p>
                </div>
            </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 grid-rows-12 gap-4 h-full">
            
            {/* Row 1: Visuals (60% height) */}
            <div className="col-span-12 row-span-7 grid grid-cols-12 gap-4">
                 {/* Panel A: 2D Blueprint (Comparsion) */}
                <div className="col-span-7 h-full">
                    {result ? (
                        <Blueprint2D 
                            original={result.originalBlueprint} 
                            corrected={result.correctedBlueprint} 
                            violations={result.violations} 
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-600 group">
                            <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-lg mb-4 group-hover:border-blue-500 transition-colors"></div>
                            <p>2D Blueprint Comparison (Original vs Corrected)</p>
                        </div>
                    )}
                </div>

                {/* Panel B: 3D Model */}
                <div className="col-span-5 h-full">
                    {result ? (
                        <Model3D blueprint={result.correctedBlueprint} />
                    ) : (
                        <div className="w-full h-full bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-600 group">
                            <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-full mb-4 group-hover:border-purple-500 transition-colors"></div>
                             <p>High-Fidelity 3D Interactive Model</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Data (40% height) */}
            <div className="col-span-12 row-span-5">
                {result ? (
                    <CompliancePanel result={result} />
                ) : (
                     <div className="w-full h-full bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-center text-slate-600">
                        <p>Awaiting Input for Compliance Audit Report</p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
