import React from 'react';
import { ComplianceResult } from '../types';
import { CheckCircle2, AlertTriangle, Hammer, MapPin, BookOpen } from 'lucide-react';

interface CompliancePanelProps {
  result: ComplianceResult;
}

const CompliancePanel: React.FC<CompliancePanelProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex h-full gap-4">
      {/* PANEL C: Summary & Score (Left Side) */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle2 className="w-48 h-48 text-white" />
        </div>
        
        <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Panel C: Audit Summary</h3>
            
            <div className="flex items-center space-x-2 mb-4 text-xs text-slate-500">
                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {result.location}</span>
                <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" /> {result.codeAuthority}</span>
            </div>

            <div className="flex items-end mt-4">
                <span className={`text-7xl font-black ${getScoreColor(result.score)} tracking-tighter`}>
                {result.score}%
                </span>
            </div>
            <span className="text-slate-500 font-medium text-sm block mt-1">COMPLIANCE SCORE</span>
        </div>

        <div className="mt-6 relative z-10">
             <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-blue-500 pl-4 italic">
            "{result.summary}"
            </p>
        </div>
      </div>

      {/* PANEL D: Violation Report (Right Side) */}
      <div className="w-2/3 bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Panel D: Violation & Fix Report</h3>
            <span className="bg-red-900/30 text-red-400 text-xs px-2 py-1 rounded border border-red-500/30 font-mono">
                {result.violations.length} Issues Found
            </span>
        </div>
        
        <div className="overflow-y-auto flex-1 p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="p-3 w-20">Code</th>
                <th className="p-3">Violation & Values</th>
                <th className="p-3">Recommended Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {result.violations.map((violation, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="p-3 font-mono text-red-400 font-bold whitespace-nowrap align-top">
                    {violation.codeSection}
                  </td>
                  <td className="p-3 text-slate-300 align-top">
                    <div className="flex flex-col">
                        <span className="font-medium text-white mb-1 flex items-center">
                            <AlertTriangle className="w-3 h-3 text-yellow-500 mr-2" />
                            {violation.description}
                        </span>
                        <div className="text-xs text-slate-500 flex space-x-3 mt-1 font-mono">
                            <span>Current: <span className="text-red-400">{violation.currentValue}</span></span>
                            <span>Required: <span className="text-green-400">{violation.requiredValue}</span></span>
                        </div>
                    </div>
                  </td>
                  <td className="p-3 text-emerald-400 font-semibold align-top bg-emerald-950/10 group-hover:bg-emerald-950/20">
                    <div className="flex items-start">
                        <Hammer className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        {violation.fixRecommendation}
                    </div>
                  </td>
                </tr>
              ))}
              {result.violations.length === 0 && (
                <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">
                        No violations found. Design is fully compliant.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompliancePanel;
