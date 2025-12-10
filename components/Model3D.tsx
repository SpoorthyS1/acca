import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Text, Sky, ContactShadows } from '@react-three/drei';
import { Blueprint, Room } from '../types';
import * as THREE from 'three';

interface Model3DProps {
  blueprint: Blueprint;
}

const WALL_THICKNESS = 0.5;
const WALL_HEIGHT = 9;

const RoomStructure: React.FC<{ room: Room; x: number; y: number }> = ({ room, x, y }) => {
  const renderWall = (wallType: 'top' | 'bottom' | 'left' | 'right') => {
    const features = room.features?.filter(f => f.wall === wallType).sort((a, b) => a.offset - b.offset) || [];
    
    let wallLength = (wallType === 'top' || wallType === 'bottom') ? room.width : room.height;
    
    // Position/Rotation math
    let posX = x + room.width / 2;
    let posZ = y + room.height / 2;
    let rotY = 0;

    if (wallType === 'top') { posZ = y; rotY = 0; }
    if (wallType === 'bottom') { posZ = y + room.height; rotY = 0; }
    if (wallType === 'left') { posX = x; rotY = Math.PI / 2; }
    if (wallType === 'right') { posX = x + room.width; rotY = Math.PI / 2; }

    return (
        <group position={[posX, 0, posZ]} rotation={[0, rotY, 0]}>
            {features.length === 0 ? (
                 <mesh position={[0, WALL_HEIGHT/2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[wallLength, WALL_HEIGHT, WALL_THICKNESS]} />
                    <meshStandardMaterial color="#e2e8f0" />
                </mesh>
            ) : (
                <>
                {(() => {
                    const parts = [];
                    let c = 0;
                    const zOffset = 0;

                    for (let i = 0; i < features.length; i++) {
                        const f = features[i];
                        // Left of feature
                        if (f.offset > c) {
                            const w = Math.max(0, f.offset - c);
                            if (w > 0) {
                                parts.push(
                                    <mesh key={`l-${i}`} position={[c + w/2 - wallLength/2, WALL_HEIGHT/2, zOffset]} castShadow>
                                        <boxGeometry args={[w, WALL_HEIGHT, WALL_THICKNESS]} />
                                        <meshStandardMaterial color="#cbd5e1" />
                                    </mesh>
                                );
                            }
                        }
                        
                        // Above feature
                        const headH = WALL_HEIGHT - (f.height + (f.sillHeight||0));
                        if (headH > 0) {
                             parts.push(
                                <mesh key={`t-${i}`} position={[f.offset + f.width/2 - wallLength/2, WALL_HEIGHT - headH/2, zOffset]} castShadow>
                                    <boxGeometry args={[f.width, headH, WALL_THICKNESS]} />
                                    <meshStandardMaterial color="#cbd5e1" />
                                </mesh>
                            )
                        }
                        // Below feature
                        if (f.sillHeight && f.sillHeight > 0) {
                             parts.push(
                                <mesh key={`b-${i}`} position={[f.offset + f.width/2 - wallLength/2, f.sillHeight/2, zOffset]} castShadow>
                                    <boxGeometry args={[f.width, f.sillHeight, WALL_THICKNESS]} />
                                    <meshStandardMaterial color="#cbd5e1" />
                                </mesh>
                            )
                        }
                        
                        // The Feature itself (Window Glass / Door)
                         if (f.type === 'window') {
                            parts.push(
                                <mesh key={`win-${i}`} position={[f.offset + f.width/2 - wallLength/2, (f.sillHeight||0) + f.height/2, zOffset]}>
                                    <boxGeometry args={[f.width, f.height, 0.1]} />
                                    <meshStandardMaterial color="#bae6fd" opacity={0.6} transparent />
                                </mesh>
                            )
                             // Frame
                             parts.push(
                                <mesh key={`winframe-${i}`} position={[f.offset + f.width/2 - wallLength/2, (f.sillHeight||0) + f.height/2, zOffset]}>
                                    <boxGeometry args={[f.width + 0.1, f.height + 0.1, WALL_THICKNESS * 0.6]} />
                                    <meshStandardMaterial color="#1e293b" />
                                </mesh>
                             )
                         } else {
                             parts.push(
                                <mesh key={`door-${i}`} position={[f.offset + f.width/2 - wallLength/2, f.height/2, zOffset]}>
                                    <boxGeometry args={[f.width, f.height, 0.1]} />
                                    <meshStandardMaterial color="#573e21" />
                                </mesh>
                            )
                         }

                        c = f.offset + f.width;
                    }
                    // Final Right
                    if (c < wallLength) {
                        const w = Math.max(0, wallLength - c);
                        if (w > 0) {
                            parts.push(
                                <mesh key={`last`} position={[c + w/2 - wallLength/2, WALL_HEIGHT/2, zOffset]} castShadow>
                                    <boxGeometry args={[w, WALL_HEIGHT, WALL_THICKNESS]} />
                                    <meshStandardMaterial color="#cbd5e1" />
                                </mesh>
                            )
                        }
                    }
                    return parts;
                })()}
                </>
            )}
        </group>
    );
  };

  return (
    <group>
       {renderWall('top')}
       {renderWall('bottom')}
       {renderWall('left')}
       {renderWall('right')}
       {/* Floor */}
       <mesh rotation={[-Math.PI/2, 0, 0]} position={[x + room.width/2, 0.05, y + room.height/2]} receiveShadow>
          <planeGeometry args={[Math.max(0.1, room.width - 0.1), Math.max(0.1, room.height - 0.1)]} />
          <meshStandardMaterial color={room.type === 'bathroom' ? '#94a3b8' : '#dcbfa3'} />
       </mesh>
       {/* Room Label */}
       <Text
        position={[x + room.width/2, 0.1, y + room.height/2]}
        rotation={[-Math.PI/2, 0, 0]}
        fontSize={1}
        color="#000000"
        fillOpacity={0.5}
       >
        {room.name}
       </Text>
    </group>
  );
};

const Model3D: React.FC<Model3DProps> = ({ blueprint }) => {
  const [showRoof, setShowRoof] = useState(false);

  // Center logic
  const cx = blueprint.plotWidth / 2;
  const cy = blueprint.plotDepth / 2;

  return (
    <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden relative shadow-inner border border-slate-700">
       <div className="absolute top-4 left-4 z-10 pointer-events-none">
         <h3 className="text-sm font-bold text-white flex items-center bg-slate-900/80 px-3 py-1 rounded backdrop-blur border border-slate-600">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
            PANEL B: High-Fidelity 3D
         </h3>
       </div>
       
       <div className="absolute top-4 right-4 z-10 flex space-x-2">
            <button 
                onClick={() => setShowRoof(!showRoof)}
                className={`text-xs px-3 py-1 rounded border transition-colors ${showRoof ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-slate-300 border-slate-600'}`}
            >
                {showRoof ? 'Hide Roof' : 'Show Roof'}
            </button>
       </div>

       <div className="absolute bottom-4 right-4 z-10 text-xs text-slate-500 pointer-events-none">
          Drag to Rotate • Scroll to Zoom
       </div>

      <Canvas shadows camera={{ position: [30, 25, 30], fov: 35 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.4} />
        <directionalLight 
            position={[50, 50, 25]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
        />
        
        <Suspense fallback={null}>
          <Center top>
            <group>
                {/* Structure */}
                {blueprint.rooms.map((room) => (
                    <RoomStructure key={room.id} room={room} x={room.x - cx} y={room.y - cy} />
                ))}

                {/* Roof (Simplified Pyramid for bounding box) */}
                {showRoof && (
                    <mesh position={[0, WALL_HEIGHT + 2, 0]} rotation={[0, Math.PI/4, 0]}>
                        <coneGeometry args={[Math.max(blueprint.plotWidth, blueprint.plotDepth) * 0.8, 6, 4]} />
                        <meshStandardMaterial color="#475569" roughness={0.9} />
                    </mesh>
                )}

                {/* Plot Grass */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
                
                {/* Plot Boundary Line */}
                <lineSegments position={[0, 0.05, 0]}>
                     <edgesGeometry args={[new THREE.BoxGeometry(blueprint.plotWidth, 0.1, blueprint.plotDepth)]} />
                     <lineBasicMaterial color="#ffffff" opacity={0.2} transparent dashSize={1} gapSize={1} />
                </lineSegments>

            </group>
          </Center>
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={50} blur={2} far={10} resolution={256} color="#000000" />
        </Suspense>

        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
};

export default Model3D;
