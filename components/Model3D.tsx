
import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Text, Environment, ContactShadows, Grid } from '@react-three/drei';
import { Blueprint, Room, Feature } from '../types';
import * as THREE from 'three';

interface Model3DProps {
  blueprint: Blueprint;
}

const WALL_THICKNESS = 0.5;
const WALL_HEIGHT = 9;

// --- Furniture Assets (Procedural Geometries) ---
const Bed = () => (
    <group position={[2, 0, 3]}>
        <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[4, 2, 6]} />
            <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, 2.1, -2]} castShadow>
            <boxGeometry args={[4, 0.5, 1.5]} />
            <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 2.05, 1]} castShadow>
            <boxGeometry args={[3.8, 0.1, 5]} />
            <meshStandardMaterial color="#f8fafc" />
        </mesh>
    </group>
);

const Sofa = () => (
    <group position={[2, 0, 2]}>
        <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[6, 1.2, 2.5]} />
            <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 2, -1]} castShadow>
             <boxGeometry args={[6, 1.5, 0.5]} />
             <meshStandardMaterial color="#334155" />
        </mesh>
         <mesh position={[-2.75, 1.6, 0]} castShadow>
             <boxGeometry args={[0.5, 1, 2.5]} />
             <meshStandardMaterial color="#334155" />
        </mesh>
         <mesh position={[2.75, 1.6, 0]} castShadow>
             <boxGeometry args={[0.5, 1, 2.5]} />
             <meshStandardMaterial color="#334155" />
        </mesh>
    </group>
);

const KitchenUnit = ({ width }: { width: number }) => (
    <group position={[width/2, 0, 1]}>
         <mesh position={[0, 1.5, 0]} castShadow>
             <boxGeometry args={[width, 3, 2]} />
             <meshStandardMaterial color="#cbd5e1" roughness={0.2} />
         </mesh>
         <mesh position={[0, 3.01, 0]}>
             <planeGeometry args={[width, 2]} rotation={[-Math.PI/2, 0, 0]} />
             <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.5} />
         </mesh>
    </group>
)

const ProceduralFurniture: React.FC<{ room: Room }> = ({ room }) => {
    // Simple logic to place furniture based on room type
    if (room.type === 'bedroom') return <group position={[room.width/2 - 2, 0, room.height/2 - 3]}><Bed /></group>;
    if (room.type === 'living') return <group position={[room.width/2 - 3, 0, room.height/2]} rotation={[0, Math.PI/4, 0]}><Sofa /></group>;
    if (room.type === 'kitchen') return <group position={[0, 0, 0]}><KitchenUnit width={room.width} /></group>;
    return null;
};

// --- Wall Generation Logic ---
// Instead of CSG (which is heavy), we build walls from segments:
// Left of window, Right of window, Header (above), Sill (below).
const SmartWall: React.FC<{ length: number, height: number, features: Feature[] }> = ({ length, height, features }) => {
    
    // 1. Sort features by position
    const sortedFeatures = [...features].sort((a, b) => a.offset - b.offset);
    
    // 2. Create segments
    const segments = [];
    let cursor = 0;

    sortedFeatures.forEach((f, idx) => {
        // Solid wall before feature
        if (f.offset > cursor) {
            const width = f.offset - cursor;
            segments.push(
                <mesh key={`seg-${idx}`} position={[cursor + width/2 - length/2, height/2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[width, height, WALL_THICKNESS]} />
                    <meshStandardMaterial color="#e2e8f0" />
                </mesh>
            );
        }

        // Feature area (Hole logic)
        // Header
        const headerH = height - (f.height + (f.sillHeight || 0));
        if (headerH > 0) {
             segments.push(
                <mesh key={`head-${idx}`} position={[f.offset + f.width/2 - length/2, height - headerH/2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[f.width, headerH, WALL_THICKNESS]} />
                    <meshStandardMaterial color="#e2e8f0" />
                </mesh>
            );
        }
        // Sill
        const sillH = f.sillHeight || 0;
        if (sillH > 0) {
             segments.push(
                <mesh key={`sill-${idx}`} position={[f.offset + f.width/2 - length/2, sillH/2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[f.width, sillH, WALL_THICKNESS]} />
                    <meshStandardMaterial color="#e2e8f0" />
                </mesh>
            );
        }

        // Window Glass / Door Frame
        if (f.type === 'window') {
             segments.push(
                <mesh key={`glass-${idx}`} position={[f.offset + f.width/2 - length/2, sillH + f.height/2, 0]}>
                    <boxGeometry args={[f.width, f.height, 0.1]} />
                    <meshStandardMaterial color="#bae6fd" opacity={0.3} transparent metalness={0.8} roughness={0.1} />
                </mesh>
            );
            // Simple Frame
            segments.push(
                 <mesh key={`frame-${idx}`} position={[f.offset + f.width/2 - length/2, sillH + f.height/2, 0]}>
                    <boxGeometry args={[f.width + 0.2, f.height + 0.2, 0.2]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
            )
        } else {
             // Door
             segments.push(
                <mesh key={`door-${idx}`} position={[f.offset + f.width/2 - length/2, f.height/2, 0]}>
                    <boxGeometry args={[f.width, f.height, 0.1]} />
                    <meshStandardMaterial color="#92400e" />
                </mesh>
             );
        }

        cursor = f.offset + f.width;
    });

    // Final segment after last feature
    if (cursor < length) {
        const width = length - cursor;
        segments.push(
             <mesh key={`seg-end`} position={[cursor + width/2 - length/2, height/2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, WALL_THICKNESS]} />
                <meshStandardMaterial color="#e2e8f0" />
            </mesh>
        );
    }

    return <group>{segments}</group>;
}

const RoomModel: React.FC<{ room: Room; x: number; y: number }> = ({ room, x, y }) => {
    // Floor Material based on type
    const floorColor = room.type === 'kitchen' || room.type === 'bathroom' ? '#94a3b8' : '#dcbfa3';
    
    return (
        <group position={[x + room.width/2, 0, y + room.height/2]}>
            {/* Floor */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <planeGeometry args={[room.width, room.height]} />
                <meshStandardMaterial color={floorColor} roughness={0.6} />
            </mesh>
            
            {/* Ceiling (Optional visualization) - usually hidden in top-down but good for shadow casting if closed */}
            
            {/* Walls */}
            <group position={[0, 0, -room.height/2]}>
                <SmartWall length={room.width} height={WALL_HEIGHT} features={room.features.filter(f => f.wall === 'top')} />
            </group>
            <group position={[0, 0, room.height/2]}>
                <SmartWall length={room.width} height={WALL_HEIGHT} features={room.features.filter(f => f.wall === 'bottom')} />
            </group>
            <group position={[-room.width/2, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                <SmartWall length={room.height} height={WALL_HEIGHT} features={room.features.filter(f => f.wall === 'left')} />
            </group>
            <group position={[room.width/2, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                <SmartWall length={room.height} height={WALL_HEIGHT} features={room.features.filter(f => f.wall === 'right')} />
            </group>

            {/* Furniture */}
            <group position={[-room.width/2, 0, -room.height/2]}>
                 <ProceduralFurniture room={room} />
            </group>
            
            {/* Label */}
             <Text position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={1} color="black" fillOpacity={0.4}>
                {room.name}
            </Text>
        </group>
    )
}

const Model3D: React.FC<Model3DProps> = ({ blueprint }) => {
  const [showRoof, setShowRoof] = useState(false);
  
  const cx = blueprint.plotWidth / 2;
  const cy = blueprint.plotDepth / 2;

  return (
    <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden relative shadow-2xl border border-slate-800">
       <div className="absolute top-4 left-4 z-10 pointer-events-none">
         <h3 className="text-sm font-bold text-white flex items-center bg-slate-900/80 px-3 py-1 rounded backdrop-blur border border-slate-600 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
            3D MODEL VIEWER
         </h3>
       </div>
       
       <div className="absolute top-4 right-4 z-10">
            <button 
                onClick={() => setShowRoof(!showRoof)}
                className={`text-xs px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-all shadow-lg border ${showRoof ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}`}
            >
                {showRoof ? 'Hide Roof' : 'Show Roof'}
            </button>
       </div>

      <Canvas shadows camera={{ position: [30, 45, 40], fov: 35 }} dpr={[1, 2]}>
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 30, 100]} />

        <ambientLight intensity={0.4} color="#e2e8f0" />
        <directionalLight 
            position={[50, 80, 30]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
        >
             <orthographicCamera attach="shadow-camera" args={[-60, 60, 60, -60]} />
        </directionalLight>

        <Suspense fallback={null}>
          <Center>
            <group>
                {blueprint.rooms.map((room) => (
                    <RoomModel key={room.id} room={room} x={room.x - cx} y={room.y - cy} />
                ))}

                {/* Roof Visual (Toggle) */}
                {showRoof && (
                    <group position={[0, WALL_HEIGHT, 0]}>
                         <mesh position={[0, 4, 0]} rotation={[0, Math.PI/4, 0]}>
                            <coneGeometry args={[Math.max(blueprint.plotWidth, blueprint.plotDepth)*0.8, 8, 4]} />
                            <meshStandardMaterial color="#334155" roughness={0.9} />
                        </mesh>
                    </group>
                )}

                {/* Property Line / Ground */}
                <Grid position={[0, -0.05, 0]} args={[100, 100]} cellColor="#334155" sectionColor="#475569" fadeDistance={60} />
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                    <planeGeometry args={[200, 200]} />
                    <meshStandardMaterial color="#0f172a" />
                </mesh>
            </group>
          </Center>
          <ContactShadows resolution={1024} scale={100} blur={2} opacity={0.5} far={10} color="#000000" />
        </Suspense>

        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.2} minDistance={10} maxDistance={150} />
      </Canvas>
    </div>
  );
};

export default Model3D;
