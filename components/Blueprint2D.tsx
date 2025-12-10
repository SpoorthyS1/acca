
import React from 'react';
import { Blueprint, Violation } from '../types';

interface Blueprint2DProps {
  original: Blueprint;
  corrected: Blueprint;
  violations: Violation[];
}

// Helper to draw a dimension line
const DimensionLine: React.FC<{ x1: number, y1: number, x2: number, y2: number, text: string, offset?: number, vertical?: boolean }> = ({ x1, y1, x2, y2, text, offset = 0, vertical = false }) => {
    const ox = vertical ? offset : 0;
    const oy = vertical ? 0 : offset;
    
    return (
        <g>
            {/* Main Line */}
            <line x1={x1 + ox} y1={y1 + oy} x2={x2 + ox} y2={y2 + oy} stroke="#64748b" strokeWidth="0.05" />
            {/* Extension Lines */}
            <line x1={x1} y1={y1} x2={x1 + ox} y2={y1 + oy} stroke="#64748b" strokeWidth="0.02" strokeDasharray="0.1 0.1" opacity={0.5} />
            <line x1={x2} y1={y2} x2={x2 + ox} y2={y2 + oy} stroke="#64748b" strokeWidth="0.02" strokeDasharray="0.1 0.1" opacity={0.5} />
            {/* Ticks */}
            <line x1={x1 + ox - 0.2} y1={y1 + oy - (vertical?0:0.2)} x2={x1 + ox + 0.2} y2={y1 + oy + (vertical?0:0.2)} stroke="#64748b" strokeWidth="0.05" />
            <line x1={x2 + ox - 0.2} y1={y2 + oy - (vertical?0:0.2)} x2={x2 + ox + 0.2} y2={y2 + oy + (vertical?0:0.2)} stroke="#64748b" strokeWidth="0.05" />
            {/* Text */}
            <text 
                x={(x1 + x2)/2 + ox} 
                y={(y1 + y2)/2 + oy} 
                fontSize="0.4" 
                fill="#94a3b8" 
                textAnchor="middle" 
                alignmentBaseline="middle"
                dy={vertical ? 0 : -0.2}
                dx={vertical ? 0.2 : 0}
                fontFamily="monospace"
            >
                {text}
            </text>
        </g>
    )
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

            return (
              <g key={room.id} transform={`translate(${room.x}, ${room.y})`}>
                {/* Room Floor */}
                <rect
                  x={0} y={0}
                  width={room.width}
                  height={room.height}
                  fill={fill}
                  stroke="none"
                />

                {/* Walls (Double Line CAD Style) */}
                <rect
                  x={0} y={0}
                  width={room.width}
                  height={room.height}
                  fill="none"
                  stroke={wallStroke}
                  strokeWidth="0.6" // Outer thick line
                />
                 <rect
                  x={0.25} y={0.25}
                  width={room.width - 0.5}
                  height={room.height - 0.5}
                  fill="none"
                  stroke="#020617" // Gap
                  strokeWidth="0.4"
                />
                {/* Inner visible line */}
                 <rect
                  x={0.25} y={0.25}
                  width={room.width - 0.5}
                  height={room.height - 0.5}
                  fill="none"
                  stroke={wallStroke}
                  strokeWidth="0.05"
                  opacity={0.5}
                />

                {/* Features (Windows/Doors) */}
                {room.features.map((f, idx) => {
                   let fx = 0, fy = 0, fw = 0, fh = 0;
                   const wallThick = 0.6;
                   
                   if (f.wall === 'top') { fx = f.offset; fy = -wallThick/2; fw = f.width; fh = wallThick; }
                   if (f.wall === 'bottom') { fx = f.offset; fy = room.height - wallThick/2; fw = f.width; fh = wallThick; }
                   if (f.wall === 'left') { fx = -wallThick/2; fy = f.offset; fw = wallThick; fh = f.width; } 
                   if (f.wall === 'right') { fx = room.width - wallThick/2; fy = f.offset; fw = wallThick; fh = f.width; }

                   const isWindow = f.type === 'window';

                   return (
                       <g key={idx}>
                           {/* Punch hole in wall */}
                           <rect x={fx} y={fy} width={fw} height={fh} fill="#020617" stroke="none"/>
                           
                           {isWindow ? (
                               // Window Symbol
                               <g>
                                   <rect x={fx} y={fy} width={fw} height={fh} fill="#0ea5e9" fillOpacity={0.2} stroke="#0ea5e9" strokeWidth="0.05"/>
                                   {/* Mullion */}
                                   {f.wall === 'top' || f.wall === 'bottom' ? (
                                       <line x1={fx} y1={fy+fh/2} x2={fx+fw} y2={fy+fh/2} stroke="#0ea5e9" strokeWidth="0.05" />
                                   ) : (
                                       <line x1={fx+fw/2} y1={fy} x2={fx+fw/2} y2={fy+fh} stroke="#0ea5e9" strokeWidth="0.05" />
                                   )}
                               </g>
                           ) : (
                               // Door Symbol
                               <g>
                                    {/* Door jambs */}
                                    <rect x={fx} y={fy} width={fw} height={fh} fill="none" stroke="#d97706" strokeWidth="0.05"/>
                                    {/* Swing Arc - simplified logic assuming standard swing */}
                                    <path 
                                        d={f.wall === 'bottom' || f.wall === 'top' 
                                            ? `M ${fx} ${fy+fh/2} Q ${fx} ${fy+fh/2-f.width} ${fx+f.width} ${fy+fh/2-f.width} L ${fx+f.width} ${fy+fh/2}`
                                            : `M ${fx+fw/2} ${fy} Q ${fx+fw/2+f.width} ${fy} ${fx+fw/2+f.width} ${fy+f.width} L ${fx+fw/2} ${fy+f.width}`
                                        }
                                        fill="none" stroke="#d97706" strokeWidth="0.02" strokeDasharray="0.1 0.1"
                                    />
                                    {/* Door Leaf */}
                                    {f.wall === 'bottom' || f.wall === 'top' ? (
                                         <line x1={fx} y1={fy+fh/2} x2={fx} y2={fy+fh/2-f.width} stroke="#d97706" strokeWidth="0.1"/>
                                    ) : (
                                         <line x1={fx+fw/2} y1={fy} x2={fx+fw/2+f.width} y2={fy} stroke="#d97706" strokeWidth="0.1"/>
                                    )}
                               </g>
                           )}
                       </g>
                   )
                })}

                {/* Text Labels */}
                <text x={room.width/2} y={room.height/2} fontSize="0.7" fill="#f8fafc" textAnchor="middle" fontWeight="bold">
                    {room.name.toUpperCase()}
                </text>
                 <text x={room.width/2} y={room.height/2 + 0.8} fontSize="0.4" fill="#94a3b8" textAnchor="middle">
                    {room.width}' x {room.height}'
                </text>
              </g>
            );
          })}
          
           {/* Overall Dimensions (Example on first room for cleaner look) */}
           {blueprint.rooms.length > 0 && (
               <>
                <DimensionLine 
                    x1={blueprint.rooms[0].x} y1={blueprint.rooms[0].y + blueprint.rooms[0].height} 
                    x2={blueprint.rooms[0].x + blueprint.rooms[0].width} y2={blueprint.rooms[0].y + blueprint.rooms[0].height} 
                    text={`${blueprint.rooms[0].width}'`} offset={1.5} 
                />
                <DimensionLine 
                    x1={blueprint.rooms[0].x} y1={blueprint.rooms[0].y} 
                    x2={blueprint.rooms[0].x} y2={blueprint.rooms[0].y + blueprint.rooms[0].height} 
                    text={`${blueprint.rooms[0].height}'`} offset={-1.5} vertical
                />
               </>
           )}

        </svg>
    )
}

const Blueprint2D: React.FC<Blueprint2DProps> = ({ original, corrected, violations }) => {
  return (
    <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden relative shadow-2xl border border-slate-700 flex flex-col">
       <div className="absolute top-4 left-4 z-10 bg-slate-800/90 backdrop-blur px-3 py-1 rounded border border-slate-600 shadow-lg">
         <h3 className="text-sm font-bold text-white flex items-center tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            BLUEPRINT COMPARISON
         </h3>
       </div>

      <div className="flex-1 flex w-full h-full divide-x divide-slate-800">
          {/* Left: Original */}
          <div className="w-1/2 relative bg-[#020617] p-2">
                <div className="absolute top-4 right-4 bg-red-500/10 text-red-400 text-[10px] font-mono px-2 py-1 rounded border border-red-500/20 uppercase tracking-wider z-10">
                    Original
                </div>
                <RenderBlueprintSVG blueprint={original} violations={violations} isOriginal={true} />
          </div>

          {/* Right: Corrected */}
          <div className="w-1/2 relative bg-[#0f172a] p-2">
                <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-wider z-10">
                    Compliant
                </div>
                <RenderBlueprintSVG blueprint={corrected} isOriginal={false} />
          </div>
      </div>
    </div>
  );
};

export default Blueprint2D;
