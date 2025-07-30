import React from 'react';
import styles from './index.less';

interface MapContainerProps {
    mapContainerRef: React.RefObject<HTMLDivElement>;
}
const MapContainer:React.FC<MapContainerProps> = ({
    mapContainerRef,
}) => {
    return (
        <div 
            ref={mapContainerRef} 
            className={styles.mapContainer}
        />
    )
}
export default MapContainer;