
import React from 'react';
import { Blueprint, Room, Violation } from '../types';

interface Blueprint2DProps {
  original: Blueprint;
  corrected: Blueprint;
  violations: Violation[];
  showFixes: boolean;
}

const RenderBlueprintSVG: React.FC<{ blueprint: Blueprint; violations?: Violation[]; isOriginal: boolean }> = ({ blueprint, violations, isOriginal }) => {
    if (!blueprint) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <span className="text-slate-600 text-xs font-mono uppercase tracking-widest border border-slate-700 px-3 py-2 rounded">
                    Data Unavailable
                </span>
            </div>
        );
    }

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
            <pattern id={`grid-${isOriginal ? 'orig' : 'corr'}`} width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#1e293b" strokeWidth="0.02" />
            </pattern>
          </defs>
          
          <rect x={-padding} y={-padding} width={totalWidth} height={totalHeight} fill="#020617" />
          <rect x={-padding} y={-padding} width={totalWidth} height={totalHeight} fill={`url(#grid-${isOriginal ? 'orig' : 'corr'})`} />

          {/* Plot Boundary */}
          <rect
            x={0}
            y={0}
            width={blueprint.plotWidth}
            height={blueprint.plotDepth}
            fill="none"
            stroke="#334155"
            strokeWidth="0.1"
            strokeDasharray="0.5 0.5"
          />

          {blueprint.rooms.map((room) => {
            const roomViolations = getViolationsForRoom(room.id);
            const hasViolations = isOriginal && roomViolations.length > 0;
            const wallStroke = hasViolations ? "#f87171" : (isOriginal ? "#94a3b8" : "#22d3ee");
            const fill = hasViolations ? "rgba(248, 113, 113, 0.1)" : "transparent";

            // Determine geometry
            const isPolygon = room.shape === 'polygon' && room.vertices && room.vertices.length > 0;
            
            return (
              <g key={room.id} transform={`translate(${room.x}, ${room.y})`}>
                
                {isPolygon ? (
                    // Polygon Render
                    <polygon
                        points={room.vertices!.map(v => `${v.x},${v.y}`).join(' ')}
                        fill={fill}
                        stroke={wallStroke}
                        strokeWidth="0.6"
                    />
                ) : (
                    // Rectangle Render
                     <rect
                        x={0} y={0}
                        width={room.width}
                        height={room.height}
                        fill={fill}
                        stroke={wallStroke}
                        strokeWidth="0.6"
                    />
                )}

                {/* Inner Line for CAD look */}
                {isPolygon ? (
                    <polygon
                        points={room.vertices!.map(v => `${v.x},${v.y}`).join(' ')}
                        fill="none"
                        stroke={wallStroke}
                        strokeWidth="0.05"
                        opacity={0.5}
                        transform="scale(0.98) translate(0.1, 0.1)" // Rough inner offset
                    />
                ) : (
                    <rect
                        x={0.25} y={0.25}
                        width={room.width - 0.5}
                        height={room.height - 0.5}
                        fill="none"
                        stroke={wallStroke}
                        strokeWidth="0.05"
                        opacity={0.5}
                    />
                )}

                {/* Features (Windows/Doors) */}
                {room.features.map((f, idx) => {
                   let fx = 0, fy = 0, fw = 0, fh = 0, rot = 0;
                   const wallThick = 0.6;
                   
                   if (isPolygon && typeof f.wall === 'number' && room.vertices) {
                       // Polygon Feature Logic
                       // CRITICAL FIX: Bounds check
                       if (f.wall < 0 || f.wall >= room.vertices.length) return null;

                       const v1 = room.vertices[f.wall];
                       const v2 = room.vertices[(f.wall + 1) % room.vertices.length];
                       
                       // CRITICAL FIX: Existence check
                       if (!v1 || !v2) return null;

                       const dx = v2.x - v1.x;
                       const dy = v2.y - v1.y;
                       const len = Math.sqrt(dx*dx + dy*dy);
                       const angle = Math.atan2(dy, dx) * (180/Math.PI);
                       
                       // Normalize vector
                       const nx = dx/len;
                       const ny = dy/len;

                       // Position: Start + Offset * direction
                       fx = v1.x + nx * f.offset;
                       fy = v1.y + ny * f.offset;
                       fw = f.width;
                       fh = wallThick;
                       rot = angle;
                   } else {
                       // Rectangle Logic
                       if (f.wall === 'top') { fx = f.offset; fy = -wallThick/2; fw = f.width; fh = wallThick; }
                       if (f.wall === 'bottom') { fx = f.offset; fy = room.height - wallThick/2; fw = f.width; fh = wallThick; }
                       if (f.wall === 'left') { fx = -wallThick/2; fy = f.offset; fw = wallThick; fh = f.width; } 
                       if (f.wall === 'right') { fx = room.width - wallThick/2; fy = f.offset; fw = wallThick; fh = f.width; }
                   }

                   return (
                       <g key={idx} transform={`translate(${fx}, ${fy}) rotate(${rot})`}>
                           {isPolygon ? (
                               <>
                                <rect x={0} y={-wallThick/2} width={fw} height={fh} fill="#020617" stroke="none" />
                                {f.type === 'window' ? (
                                    <g>
                                        <rect x={0} y={-wallThick/2} width={fw} height={fh} fill="#0ea5e9" fillOpacity={0.2} stroke="#0ea5e9" strokeWidth="0.05"/>
                                        <line x1={0} y1={0} x2={fw} y2={0} stroke="#0ea5e9" strokeWidth="0.05" />
                                    </g>
                                ) : (
                                    <g>
                                         <rect x={0} y={-wallThick/2} width={fw} height={fh} fill="none" stroke="#d97706" strokeWidth="0.05"/>
                                         {/* Simple Door Swing */}
                                         <path d={`M ${fw} ${wallThick/2} Q ${fw} ${-fw} 0 ${-fw} L 0 ${wallThick/2}`} fill="none" stroke="#d97706" strokeWidth="0.05" strokeDasharray="0.1 0.1"/>
                                         <line x1={0} y1={wallThick/2} x2={0} y2={-fw} stroke="#d97706" strokeWidth="0.1"/>
                                    </g>
                                )}
                               </>
                           ) : (
                                <g>
                                   <rect x={0} y={0} width={fw} height={fh} fill="#020617" stroke="none"/>
                                   {f.type === 'window' ? (
                                       <g>
                                           <rect x={0} y={0} width={fw} height={fh} fill="#0ea5e9" fillOpacity={0.2} stroke="#0ea5e9" strokeWidth="0.05"/>
                                           {f.wall === 'top' || f.wall === 'bottom' ? (
                                               <line x1={0} y1={fh/2} x2={fw} y2={fh/2} stroke="#0ea5e9" strokeWidth="0.05" />
                                           ) : (
                                               <line x1={fw/2} y1={0} x2={fw/2} y2={fh} stroke="#0ea5e9" strokeWidth="0.05" />
                                           )}
                                       </g>
                                   ) : (
                                       <g>
                                            <rect x={0} y={0} width={fw} height={fh} fill="none" stroke="#d97706" strokeWidth="0.05"/>
                                            <line x1={fw/2} y1={fh/2} x2={fw/2+fw} y2={fh/2} stroke="#d97706" strokeWidth="0.05" opacity={0}/>
                                       </g>
                                   )}
                                </g>
                           )}
                       </g>
                   )
                })}

                <text x={room.width/2} y={room.height/2} fontSize="0.7" fill="#f8fafc" textAnchor="middle" fontWeight="bold">
                    {room.name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
    )
}

const Blueprint2D: React.FC<Blueprint2DProps> = ({ original, corrected, violations, showFixes }) => {
  return (
    <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden relative shadow-2xl border border-slate-700 flex flex-col">
       <div className="absolute top-4 left-4 z-10 bg-slate-800/90 backdrop-blur px-3 py-1 rounded border border-slate-600 shadow-lg">
         <h3 className="text-sm font-bold text-white flex items-center tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            BLUEPRINT COMPARISON
         </h3>
       </div>

       {/* Conditional Render Logic: If showFixes is TRUE, split the view. If FALSE, show only Original */}
       {showFixes ? (
           <div className="flex-1 flex w-full h-full divide-x divide-slate-800">
               <div className="w-1/2 relative bg-[#020617] p-2 border-r border-slate-800">
                     <div className="absolute top-4 right-4 bg-red-500/10 text-red-400 text-[10px] font-mono px-2 py-1 rounded border border-red-500/20 uppercase tracking-wider z-10">
                         Original (With Violations)
                     </div>
                     <RenderBlueprintSVG blueprint={original} violations={violations} isOriginal={true} />
               </div>
               <div className="w-1/2 relative bg-[#0f172a] p-2">
                     <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-wider z-10">
                         Compliant (Fixes Applied)
                     </div>
                     <RenderBlueprintSVG blueprint={corrected} isOriginal={false} />
               </div>
           </div>
       ) : (
           <div className="flex-1 w-full h-full bg-[#020617] p-2 relative">
                <div className="absolute top-4 right-4 bg-red-500/10 text-red-400 text-[10px] font-mono px-2 py-1 rounded border border-red-500/20 uppercase tracking-wider z-10">
                    Original Audit
                </div>
                <RenderBlueprintSVG blueprint={original} violations={violations} isOriginal={true} />
           </div>
       )}
    </div>
  );
};

export default Blueprint2D;
