
import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, ArrowRight, MapPin } from 'lucide-react';
import { AnalysisRequest } from '../types';

interface InputPanelProps {
  onAnalyze: (req: AnalysisRequest) => void;
  isAnalyzing: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({ onAnalyze, isAnalyzing }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [location, setLocation] = useState('');
  
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [textPrompt, setTextPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleNextStep = () => {
      if (location.trim()) setStep(2);
  };

  const handleSubmit = async () => {
    if (mode === 'text' && !textPrompt.trim()) return;
    if (mode === 'image' && !selectedFile) return;

    if (mode === 'text') {
      onAnalyze({ location, textPrompt });
    } else if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onAnalyze({
          location,
          imageData: base64String,
          mimeType: selectedFile.type,
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div className="bg-slate-900 border-r border-slate-700 w-80 flex-shrink-0 flex flex-col h-full z-10 shadow-2xl">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400 tracking-tight">ACCA</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Architectural Code Compliance Agent</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        
        {/* Step 1: Location */}
        <div className={`transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'hidden'}`}>
            <h3 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center">
                <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center mr-2 text-xs">1</span>
                Project Location
            </h3>
            <p className="text-xs text-slate-500 mb-4">ACCA uses your location to identify specific building codes (e.g., California Residential Code vs. Standard IRC).</p>
            <div className="relative">
                <MapPin className="absolute top-3 left-3 w-4 h-4 text-slate-500" />
                <input 
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX, USA"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>
            <button 
                onClick={handleNextStep}
                disabled={!location.trim()}
                className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
                Next Step
            </button>
        </div>

        {/* Step 2: Design Input */}
        <div className={`transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'hidden'}`}>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase flex items-center">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center mr-2 text-xs">2</span>
                    Input Method
                </h3>
                <button onClick={() => setStep(1)} className="text-xs text-blue-400 hover:text-blue-300">Change Loc</button>
             </div>

            <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
            <button
                onClick={() => setMode('text')}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'text' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
            >
                <FileText className="w-4 h-4 mr-2" /> Text Brief
            </button>
            <button
                onClick={() => setMode('image')}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'image' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
            >
                <Upload className="w-4 h-4 mr-2" /> Blueprint
            </button>
            </div>

            {mode === 'text' ? (
            <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">Design Brief</label>
                <textarea
                className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm placeholder-slate-500"
                placeholder="E.g., Design a modern 3-bedroom ranch with an open concept kitchen and a large master bath..."
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                />
            </div>
            ) : (
            <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">Upload Floor Plan</label>
                <div 
                className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-800/50"
                onClick={() => fileInputRef.current?.click()}
                >
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-40 object-contain rounded mb-4" />
                ) : (
                    <Upload className="w-12 h-12 text-slate-500 mb-4" />
                )}
                <span className="text-sm text-slate-400">
                    {selectedFile ? selectedFile.name : "Click to upload image"}
                </span>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                </div>
            </div>
            )}
        </div>
      </div>

      <div className="p-6 border-t border-slate-700 bg-slate-900">
        <button
          onClick={handleSubmit}
          disabled={isAnalyzing || step === 1}
          className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              Generate Audit <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputPanel;
