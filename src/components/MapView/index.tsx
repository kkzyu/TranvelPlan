// src/components/MapView.tsx
import { useEffect, useRef, useState } from 'react';
import { mockBatchRoutes } from '@/mocks/api';
import { PlanItem } from '@/pages/index';

const MapView=({ planItems } : { planItems: PlanItem[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    const validItems = planItems.filter(item => item.checked);
    if (validItems.length < 2) {
      setRoutes([]);
      return;
    }

    mockBatchRoutes(validItems.map(item => ({
      name: item.name,
      mode: item.mode
    }))).then(setRoutes);
  }, [planItems]);

  useEffect(() => {
    if (!mapRef.current || routes.length === 0) return;

    mapRef.current.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('style', 'background:#f0f2f5');

    routes.forEach((route, index) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', (index * 100 + 50).toString());
      line.setAttribute('y1', '50');
      line.setAttribute('x2', ((index + 1) * 100 + 50).toString());
      line.setAttribute('y2', '50');
      line.setAttribute('stroke', '#1890ff');
      line.setAttribute('stroke-width', '4');
      svg.appendChild(line);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', (index * 100 + 50).toString());
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', '6');
      circle.setAttribute('fill', index === 0 ? '#52c41a' : index === routes.length ? '#ff4d4f' : '#1890ff');
      svg.appendChild(circle);
    });

    mapRef.current.appendChild(svg);
  }, [routes]);

  return (
    <div style={{ height: '40vh', width:'80vh', border: '1px solid #e8e8e8', borderRadius: 8 }}>
      <div style={{ padding: '16px', background: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }}>
        地图预览 (共 {routes.length} 段路线)
      </div>
      <div ref={mapRef} style={{ height: 'calc(100% - 50px)' }} />
      
      <div style={{ padding: '16px', maxHeight: '40vh', overflow: 'auto' }}>
        {routes.map((route, index) => (
          <div key={index} style={{ marginBottom: 8, padding: '8px', background: '#fafafa', borderRadius: 4 }}>
            <strong>{route.start} → {route.end}</strong>
            <div>距离: {(route.distance/1000).toFixed(1)}km | 
                   时间: {Math.ceil(route.duration/60)}分钟</div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default MapView;