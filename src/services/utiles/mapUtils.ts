// 地图相关的工具函数
export const loadAMapScript = (): Promise<void> => {
    // 地图脚本加载逻辑
};

export const formatDistance = (distance: number): string => {
    return distance > 1000 ? `${(distance/1000).toFixed(1)}km` : `${distance}m`;
};

export const formatDuration = (duration: number): string => {
    return `${Math.ceil(duration/60)}分钟`;
};

export const parsePolyline = (polylineStr: string): [number, number][] => {
    // 解析路线坐标字符串
};