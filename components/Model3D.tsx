
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

// --- ARCHITECTURAL MATERIALS PALETTE ---
const MAT_WALL = "#F5F5DC";        // Off-white drywall / Beige
const MAT_FLOOR = "#DEB887";       // Wood floor
const MAT_FLOOR_TILE = "#cbd5e1";  // Slate tile (Bath/Kitchen)
const MAT_DOOR_PANEL = "#8B4513";  // Wood brown
const MAT_DOOR_FRAME = "#FFFFFF";  // White trim
const MAT_WINDOW_FRAME = "#FFFFFF";// White frame
const MAT_GLASS = "#87CEEB";       // Sky blue glass

// --- Furniture Assets ---
const Bed = () => (
    <group position={[2, 0, 3]}>
        <mesh position={[0, 1, 0]} castShadow><boxGeometry args={[4, 2, 6]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
        <mesh position={[0, 2.1, -2]} castShadow><boxGeometry args={[4, 0.5, 1.5]} /><meshStandardMaterial color="#94a3b8" /></mesh>
        <mesh position={[0, 2.05, 1]} castShadow><boxGeometry args={[3.8, 0.1, 5]} /><meshStandardMaterial color="#f8fafc" /></mesh>
    </group>
);

const Sofa = () => (
    <group position={[2, 0, 2]}>
        <mesh position={[0, 1, 0]} castShadow><boxGeometry args={[6, 1.2, 2.5]} /><meshStandardMaterial color="#475569" /></mesh>
        <mesh position={[0, 2, -1]} castShadow><boxGeometry args={[6, 1.5, 0.5]} /><meshStandardMaterial color="#334155" /></mesh>
    </group>
);

const KitchenUnit = ({ width }: { width: number }) => (
    <group position={[width/2, 0, 1]}>
         <mesh position={[0, 1.5, 0]} castShadow><boxGeometry args={[width, 3, 2]} /><meshStandardMaterial color="#cbd5e1" roughness={0.2} /></mesh>
         <mesh position={[0, 3.01, 0]}><planeGeometry args={[width, 2]} rotation={[-Math.PI/2, 0, 0]} /><meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.5} /></mesh>
    </group>
)

const ProceduralFurniture: React.FC<{ room: Room }> = ({ room }) => {
    if (room.type === 'bedroom') return <group position={[room.width/2 - 2, 0, room.height/2 - 3]}><Bed /></group>;
    if (room.type === 'living') return <group position={[room.width/2 - 3, 0, room.height/2]} rotation={[0, Math.PI/4, 0]}><Sofa /></group>;
    if (room.type === 'kitchen') return <group position={[0, 0, 0]}><KitchenUnit width={room.width} /></group>;
    return null;
};

// --- Smart Wall Segment Generator ---
const SmartWallSegment: React.FC<{ length: number, height: number, features: Feature[] }> = ({ length, height, features }) => {
    const sortedFeatures = [...features].sort((a, b) => a.offset - b.offset);
    const segments = [];
    let cursor = 0;

    sortedFeatures.forEach((f, idx) => {
        // Solid wall before feature
        if (f.offset > cursor) {
            const width = f.offset - cursor;
            segments.push(
                <mesh key={`seg-${idx}`} position={[cursor + width/2 - length/2, height/2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[width, height, WALL_THICKNESS]} />
                    <meshLambertMaterial color={MAT_WALL} />
                </mesh>
            );
        }

        // Header above feature
        const headerH = height - (f.height + (f.sillHeight || 0));
        if (headerH > 0) {
             segments.push(
                <mesh key={`head-${idx}`} position={[f.offset + f.width/2 - length/2, height - headerH/2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[f.width, headerH, WALL_THICKNESS]} />
                    <meshLambertMaterial color={MAT_WALL} />
                </mesh>
            );
        }
        // Sill below feature
        const sillH = f.sillHeight || 0;
        if (sillH > 0) {
             segments.push(
                <mesh key={`sill-${idx}`} position={[f.offset + f.width/2 - length/2, sillH/2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[f.width, sillH, WALL_THICKNESS]} />
                    <meshLambertMaterial color={MAT_WALL} />
                </mesh>
            );
        }

        // Window Glass
        if (f.type === 'window') {
             segments.push(
                <mesh key={`glass-${idx}`} position={[f.offset + f.width/2 - length/2, sillH + f.height/2, 0]}>
                    <boxGeometry args={[f.width, f.height, 0.1]} />
                    <meshPhongMaterial color={MAT_GLASS} opacity={0.3} transparent shininess={100} />
                </mesh>
            );
            segments.push(
                 <mesh key={`frame-${idx}`} position={[f.offset + f.width/2 - length/2, sillH + f.height/2, 0]}>
                    <boxGeometry args={[f.width + 0.2, f.height + 0.2, 0.2]} />
                    <meshLambertMaterial color={MAT_WINDOW_FRAME} />
                </mesh>
            )
        } else {
             // DOOR / OPENING
             const isOpening = f.subtype === 'opening';
             
             if (!isOpening) {
                 // Door Frame
                 segments.push(
                    <mesh key={`door-frame-${idx}`} position={[f.offset + f.width/2 - length/2, f.height/2, 0]}>
                         <boxGeometry args={[f.width + 0.2, f.height + 0.1, 0.25]} />
                         <meshLambertMaterial color={MAT_DOOR_FRAME} />
                    </mesh>
                 );
                 // Door Panel
                 segments.push(
                    <group key={`door-leaf-${idx}`} position={[f.offset - length/2, 0, 0]}>
                        <mesh position={[f.width/2, f.height/2, 0]} rotation={[0, Math.PI/4, 0]} position-x={f.width/2}> 
                            <boxGeometry args={[f.width, f.height, 0.15]} />
                            <meshLambertMaterial color={MAT_DOOR_PANEL} />
                        </mesh>
                        {/* Handle */}
                        <mesh position={[f.width * 0.85, f.height * 0.45, 0.1]} rotation={[0, Math.PI/4, 0]} position-x={f.width * 0.85}>
                             <boxGeometry args={[0.1, 0.4, 0.1]} />
                             <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
                        </mesh>
                    </group>
                 );
             } else {
                 // Cased Opening
                 segments.push(
                    <mesh key={`opening-jamb-${idx}`} position={[f.offset + f.width/2 - length/2, f.height/2, 0]}>
                         <boxGeometry args={[f.width + 0.1, f.height + 0.1, WALL_THICKNESS + 0.1]} />
                         <meshLambertMaterial color={MAT_DOOR_FRAME} />
                    </mesh>
                 );
             }
        }
        cursor = f.offset + f.width;
    });

    if (cursor < length) {
        const width = length - cursor;
        segments.push(
             <mesh key={`seg-end`} position={[cursor + width/2 - length/2, height/2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, WALL_THICKNESS]} />
                <meshLambertMaterial color={MAT_WALL} />
            </mesh>
        );
    }
    return <group>{segments}</group>;
}

const RoomModel: React.FC<{ room: Room; x: number; y: number }> = ({ room, x, y }) => {
    // Determine Geometry Strategy
    const isPolygon = room.shape === 'polygon' && room.vertices && room.vertices.length > 2;

    // Floor Color Logic
    let floorColor = MAT_FLOOR;
    if (room.type === 'kitchen' || room.type === 'bathroom' || room.type === 'garage') floorColor = MAT_FLOOR_TILE;

    // Geometry Generation
    const shape = useMemo(() => {
        const s = new THREE.Shape();
        if (isPolygon && room.vertices && room.vertices.length > 0) {
            const start = room.vertices[0];
            if (start) {
                s.moveTo(start.x, start.y);
                for (let i = 1; i < room.vertices.length; i++) {
                    const v = room.vertices[i];
                    if (v) s.lineTo(v.x, v.y);
                }
                s.closePath();
            }
        } else {
            s.moveTo(0, 0);
            s.lineTo(room.width, 0);
            s.lineTo(room.width, room.height);
            s.lineTo(0, room.height);
            s.closePath();
        }
        return s;
    }, [room, isPolygon]);

    // Wall Loop
    const walls = [];
    if (isPolygon && room.vertices) {
        for (let i = 0; i < room.vertices.length; i++) {
            const v1 = room.vertices[i];
            const v2 = room.vertices[(i + 1) % room.vertices.length];
            
            if (!v1 || !v2) continue;
            
            const dx = v2.x - v1.x;
            const dy = v2.y - v1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx); 
            
            const wallFeatures = room.features.filter(f => f.wall === i);

            walls.push(
                <group key={`wall-${i}`} position={[v1.x, 0, v1.y]} rotation={[0, -angle, 0]}>
                    <group position={[len/2, 0, 0]}>
                         <SmartWallSegment length={len} height={WALL_HEIGHT} features={wallFeatures} />
                    </group>
                </group>
            );
        }
    } else {
        // Fallback for Rectangles
        walls.push(
             <group position={[room.width/2, 0, 0]}>
                 <SmartWallSegment length={room.width} height={WALL_HEIGHT} features={room.features.filter(f => f.wall === 'top')} />
             </group>
        );
        walls.push(
             <group position={[room.width/2, 0, room.height]}>
                 <SmartWallSegment length={room.width} height={WALL_HEIGHT} features={room.features.filter(f => f.wall === 'bottom')} />
             </group>
        );
        walls.push(
             <group position={[0, 0, room.height/2]} rotation={[0, Math.PI/2, 0]}>
                 <SmartWallSegment length={room.height} height={WALL_HEIGHT} features={room.features.filter(f => f.wall === 'left')} />
             </group>
        );
        walls.push(
             <group position={[room.width, 0, room.height/2]} rotation={[0, Math.PI/2, 0]}>
                 <SmartWallSegment length={room.height} height={WALL_HEIGHT} features={room.features.filter(f => f.wall === 'right')} />
             </group>
        );
    }

    return (
        <group position={[x, 0, y]}>
            {/* Floor Shape */}
            <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0.1, 0]} castShadow receiveShadow>
                <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: false }]} />
                <meshLambertMaterial color={floorColor} />
            </mesh>
            
            {/* Plinth */}
            <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0]}>
                <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: false }]} />
                <meshLambertMaterial color="#334155" />
            </mesh>

            {/* Walls */}
            {walls}

            {/* Furniture */}
            <group position={[room.width/2, 0, room.height/2]}> 
                 <ProceduralFurniture room={room} />
            </group>
            
            {/* Label */}
            <Text position={[room.width/2, 0.1, room.height/2]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.8} color="black" fillOpacity={0.4}>
                {room.name}
            </Text>
        </group>
    )
}

const Model3D: React.FC<Model3DProps> = ({ blueprint }) => {
  const [showRoof, setShowRoof] = useState(false);
  
  if (!blueprint) {
    return (
        <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden relative shadow-2xl border border-slate-800 flex items-center justify-center text-slate-500">
            <span className="text-sm font-mono">No 3D Geometry Available</span>
        </div>
    );
  }

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

        <ambientLight intensity={0.5} color="#ffffff" />
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

                {/* Ground */}
                <Grid position={[0, -0.05, 0]} args={[100, 100]} cellColor="#334155" sectionColor="#475569" fadeDistance={60} />
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
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
