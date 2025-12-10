import React, { useState } from 'react';
import { Blueprint, Violation } from '../types';
import { Eye, EyeOff } from 'lucide-react';

interface Blueprint2DProps {
  original: Blueprint;
  corrected: Blueprint;
  violations: Violation[];
}

const RenderBlueprintSVG: React.FC<{ blueprint: Blueprint; violations?: Violation[]; isOriginal: boolean }> = ({ blueprint, violations, isOriginal }) => {
    const padding = 5;
    const totalWidth = blueprint.plotWidth + padding * 2;
    const totalHeight = blueprint.plotDepth + padding * 2;

    const getViolationsForRoom = (roomId: string) => violations ? violations.filter(v => v.relatedRoomId === roomId) : [];

    return (
        <svg
          viewBox={`-${padding} -${padding} ${totalWidth} ${totalHeight}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id={`grid-${isOriginal ? 'orig' : 'corr'}`} width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#334155" strokeWidth="0.1" />
            </pattern>
          </defs>
          <rect x={-padding} y={-padding} width={totalWidth} height={totalHeight} fill={`url(#grid-${isOriginal ? 'orig' : 'corr'})`} />

          {/* Plot Boundary */}
          <rect
            x={0}
            y={0}
            width={blueprint.plotWidth}
            height={blueprint.plotDepth}
            fill="none"
            stroke="#475569"
            strokeWidth="0.5"
            strokeDasharray="1 1"
          />

          {blueprint.rooms.map((room) => {
            const roomViolations = getViolationsForRoom(room.id);
            const hasViolations = isOriginal && roomViolations.length > 0;

            return (
              <g key={room.id} transform={`translate(${room.x}, ${room.y})`}>
                <rect
                  width={room.width}
                  height={room.height}
                  fill={isOriginal ? "#1e293b" : "#0f172a"}
                  stroke={hasViolations ? "#ef4444" : "#94a3b8"}
                  strokeWidth={hasViolations ? 0.5 : 0.3}
                />
                
                {hasViolations && (
                  <rect
                    width={room.width}
                    height={room.height}
                    fill="rgba(239, 68, 68, 0.15)"
                  />
                )}

                {/* Features (Windows/Doors) */}
                {room.features.map((f, idx) => {
                   let fx = 0, fy = 0, fw = 0, fh = 0;
                   if (f.wall === 'top') { fx = f.offset; fy = -0.5; fw = f.width; fh = 0.5; }
                   if (f.wall === 'bottom') { fx = f.offset; fy = room.height; fw = f.width; fh = 0.5; }
                   if (f.wall === 'left') { fx = -0.5; fy = f.offset; fw = 0.5; fh = f.width; } // width is length along wall
                   if (f.wall === 'right') { fx = room.width; fy = f.offset; fw = 0.5; fh = f.width; }

                   return (
                       <rect 
                            key={idx}
                            x={fx} y={fy} width={fw} height={fh}
                            fill={f.type === 'window' ? '#60a5fa' : '#d97706'}
                            opacity={0.7}
                       />
                   )
                })}

                <text
                  x={room.width / 2}
                  y={room.height / 2}
                  fontSize="1"
                  fill="#e2e8f0"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-sans font-medium"
                >
                  {room.name}
                </text>
                 <text
                  x={room.width / 2}
                  y={room.height / 2 + 1.2}
                  fontSize="0.7"
                  fill={hasViolations ? "#f87171" : "#94a3b8"}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-sans"
                >
                  {room.width}' x {room.height}'
                </text>
              </g>
            );
          })}
        </svg>
    )
}

const Blueprint2D: React.FC<Blueprint2DProps> = ({ original, corrected, violations }) => {
  return (
    <div className="w-full h-full bg-slate-800 rounded-xl overflow-hidden relative shadow-inner border border-slate-700 flex flex-col">
       <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur px-3 py-1 rounded border border-slate-600">
         <h3 className="text-sm font-bold text-white flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            PANEL A: Compliance Comparison
         </h3>
       </div>

      <div className="flex-1 flex w-full h-full divide-x divide-slate-700">
          {/* Left: Original */}
          <div className="w-1/2 relative p-8 bg-slate-800/50">
                <div className="absolute top-4 right-4 bg-red-900/50 text-red-200 text-xs px-2 py-1 rounded border border-red-500/30">
                    ORIGINAL (Violations Detected)
                </div>
                <RenderBlueprintSVG blueprint={original} violations={violations} isOriginal={true} />
          </div>

          {/* Right: Corrected */}
          <div className="w-1/2 relative p-8 bg-emerald-900/10">
                <div className="absolute top-4 right-4 bg-emerald-900/50 text-emerald-200 text-xs px-2 py-1 rounded border border-emerald-500/30">
                    CORRECTED (Compliant)
                </div>
                <RenderBlueprintSVG blueprint={corrected} isOriginal={false} />
          </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 p-2 rounded border border-slate-700 flex space-x-4 text-xs">
          <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 opacity-70 mr-2"></div>
              <span className="text-slate-300">Window</span>
          </div>
          <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-600 opacity-70 mr-2"></div>
              <span className="text-slate-300">Door</span>
          </div>
          <div className="flex items-center">
              <div className="w-3 h-3 bg-red-900/50 border border-red-500 mr-2"></div>
              <span className="text-red-400 font-bold">Violation Zone</span>
          </div>
      </div>
    </div>
  );
};

export default Blueprint2D;
