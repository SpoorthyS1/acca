export interface Feature {
  id: string;
  type: 'window' | 'door';
  wall: 'top' | 'bottom' | 'left' | 'right';
  offset: number; // distance from top-left corner of the wall
  width: number;
  height: number;
  sillHeight?: number; // for windows
}

export interface Room {
  id: string;
  name: string;
  x: number; // in feet
  y: number; // in feet
  width: number; // in feet
  height: number; // in feet
  type: 'bedroom' | 'bathroom' | 'living' | 'kitchen' | 'garage' | 'other';
  features: Feature[];
}

export interface Blueprint {
  plotWidth: number;
  plotDepth: number;
  rooms: Room[];
}

export interface Violation {
  id: string;
  codeSection: string; // e.g., "IRC R310.1"
  description: string;
  currentValue: string;
  requiredValue: string;
  fixRecommendation: string;
  relatedRoomId?: string;
  severity: 'high' | 'medium' | 'low';
  category: 'Spatial' | 'Egress' | 'Structural' | 'Other';
}

export interface ComplianceResult {
  score: number; // 0-100
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
