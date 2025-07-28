// 路线
export interface RouteResult {
  mode: string;
  distance: number; // m
  duration: number; // s
  polyline?: [number, number][]; 
  success: boolean;
  error?: string;
}

// 路段
export interface RouteSegment {
  id: string;
  startPoint: {
    name: string;
    position: [number, number];
  };
  endPoint: {
    name: string;
    position: [number, number];
  };
  distance: number;
  duration: number;
  mode: string;
  polyline: [number, number][];
  success: boolean;
  error?: string;
}

// 完整路径结果
export interface CompleteRouteResult {
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  mode: string;
  success: boolean;
}
