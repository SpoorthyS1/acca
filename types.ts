

export interface Feature {
  id: string;
  type: 'window' | 'door';
  subtype?: 'hinged' | 'sliding' | 'opening'; // 'hinged' is default for doors, 'opening' for gaps
  // 'top' etc for rectangles, number (index of vertex pair) for polygons
  wall: 'top' | 'bottom' | 'left' | 'right' | number; 
  offset: number; // distance from start of the wall segment
  width: number;
  height: number;
  sillHeight?: number; // for windows
}

export interface Furniture {
  id: string;
  type: 'bed' | 'sofa' | 'table' | 'toilet' | 'sink' | 'counter';
  x: number; // relative to room origin
  y: number; // relative to room origin
  width: number;
  depth: number;
  rotation: number;
}

export interface Room {
  id: string;
  name: string;
  x: number; // in feet (bounding box top-left)
  y: number; // in feet
  width: number; // in feet (bounding box width)
  height: number; // in feet (bounding box height)
  
  // NEW: Support for irregular shapes (L-shaped, Diagonal walls)
  shape?: 'rectangle' | 'polygon';
  vertices?: {x: number, y: number}[]; // Relative to room (x,y)
  
  type: 'bedroom' | 'bathroom' | 'living' | 'kitchen' | 'garage' | 'hallway' | 'other';
  features: Feature[];
  furniture?: Furniture[];
}

export interface Blueprint {
  plotWidth: number;
  plotDepth: number;
  rooms: Room[];
}

export interface Violation {
  id: string;
  codeSection: string; 
  description: string;
  currentValue: string;
  requiredValue: string;
  fixRecommendation: string;
  relatedRoomId?: string;
  severity: 'high' | 'medium' | 'low';
  category: 'Spatial' | 'Egress' | 'Structural' | 'Other';
}

export interface ComplianceResult {
  score: number; 
  summary: string;
  location: string;
  codeAuthority: string;
  originalBlueprint: Blueprint;
  correctedBlueprint: Blueprint;
  violations: Violation[];
}

export interface AnalysisRequest {
  location: string;
  textPrompt?: string;
  imageData?: string; // base64
  mimeType?: string;
}