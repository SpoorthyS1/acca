
import React from 'react';
import { ComplianceResult } from '../types';
import { CheckCircle2, AlertTriangle, Hammer, MapPin, BookOpen, ShieldCheck, AlertOctagon } from 'lucide-react';

interface CompliancePanelProps {
  result: ComplianceResult;
}

const CompliancePanel: React.FC<CompliancePanelProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/50 from-emerald-500/20';
    if (score >= 70) return 'text-amber-400 border-amber-500/50 from-amber-500/20';
    return 'text-rose-400 border-rose-500/50 from-rose-500/20';
  };

  const scoreColorClass = getScoreColor(result.score);

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
      
      {/* Top Row: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
          
          {/* Card 1: Main Score */}
          <div className={`bg-slate-800/60 rounded-2xl border backdrop-blur-md p-6 relative overflow-hidden flex flex-col justify-between h-48 group transition-all hover:bg-slate-800/80 ${scoreColorClass.split(' ')[1]}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${scoreColorClass.split(' ')[2]} to-transparent opacity-30`}></div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Compliance Score</h3>
                        <div className={`text-6xl font-black mt-2 tracking-tighter ${scoreColorClass.split(' ')[0]}`}>
                            {result.score}<span className="text-3xl opacity-50">%</span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-full bg-slate-950/30 border border-white/10 ${scoreColorClass.split(' ')[0]}`}>
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                </div>
                <div className="relative z-10 mt-auto">
                    <div className="w-full bg-slate-950/50 h-2 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ease-out ${scoreColorClass.split(' ')[0].replace('text-', 'bg-')}`} 
                            style={{ width: `${result.score}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">
                        Based on {result.violations.length} detected violation{result.violations.length !== 1 ? 's' : ''}.
                    </p>
                </div>
          </div>

          {/* Card 2: Context Info */}
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 backdrop-blur-md p-6 flex flex-col justify-between h-48 hover:bg-slate-800/80 transition-all">
                <div>
                     <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Context</h3>
                     <div className="space-y-4">
                        <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-slate-200">{result.location}</p>
                                <p className="text-xs text-slate-500">Project Location</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <BookOpen className="w-5 h-5 text-purple-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-slate-200">{result.codeAuthority}</p>
                                <p className="text-xs text-slate-500">Governing Code</p>
                            </div>
                        </div>
                     </div>
                </div>
          </div>

          {/* Card 3: AI Summary */}
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 backdrop-blur-md p-6 h-48 overflow-y-auto hover:bg-slate-800/80 transition-all custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                    AI Assessment
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-slate-600 pl-3">
                    "{result.summary}"
                </p>
          </div>
      </div>

      {/* Bottom Section: Violation Table */}
      <div className="flex-1 bg-slate-800/60 rounded-2xl border border-slate-700/50 backdrop-blur-md overflow-hidden flex flex-col shadow-xl">
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <AlertOctagon className="w-5 h-5 text-rose-400" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Violation Report</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-500 uppercase">Sort By:</span>
                    <select className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500">
                        <option>Severity (High-Low)</option>
                        <option>Code Section</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="p-4 w-32 border-b border-slate-700/50">Severity</th>
                            <th className="p-4 w-40 border-b border-slate-700/50">Code Section</th>
                            <th className="p-4 border-b border-slate-700/50">Violation Detail</th>
                            <th className="p-4 w-1/3 border-b border-slate-700/50">Remediation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30 text-sm">
                        {result.violations.map((violation, idx) => (
                            <tr key={idx} className="hover:bg-slate-700/20 transition-colors group">
                                <td className="p-4 align-top">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                        violation.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                        violation.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                        {violation.severity.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 align-top">
                                    <span className="font-mono text-slate-300 bg-slate-900/50 px-2 py-1 rounded text-xs border border-slate-700">
                                        {violation.codeSection}
                                    </span>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-200 mb-1 flex items-start">
                                            {violation.description}
                                        </span>
                                        <div className="flex items-center space-x-4 mt-2 text-xs font-mono bg-slate-900/30 p-2 rounded-lg w-fit border border-slate-800">
                                            <div className="flex items-center space-x-1">
                                                <span className="text-slate-500">Current:</span>
                                                <span className="text-rose-400 font-bold">{violation.currentValue}</span>
                                            </div>
                                            <div className="w-px h-3 bg-slate-700"></div>
                                            <div className="flex items-center space-x-1">
                                                <span className="text-slate-500">Required:</span>
                                                <span className="text-emerald-400 font-bold">{violation.requiredValue}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="flex items-start text-emerald-400 bg-emerald-950/10 p-3 rounded-lg border border-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                                        <Hammer className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm font-medium">{violation.fixRecommendation}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {result.violations.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-300">No Violations Found</h4>
                                        <p className="text-slate-500 text-sm mt-1">This design meets all checked code requirements.</p>
                                    </div>
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
