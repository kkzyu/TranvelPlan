export const formatDistance = (distance: number): string => {
    return distance > 1000 ? `${(distance/1000).toFixed(1)}km` : `${distance}m`;
};

export const formatDuration = (duration: number): string => {
    return `${Math.ceil(duration/60)}分钟`;
};
