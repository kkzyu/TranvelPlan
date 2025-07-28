import { useEffect, useRef, useState } from 'react';
import { Button, Spin, message } from 'antd';
import { PlanItem } from '@/pages/index';
import {  RouteService, RouteResult, CompleteRouteResult, RouteSegment } from '@/services/maps';
import { loadAMapScript } from '@/services/types/center'
import { CITY_CENTERS } from '@/constants/options'
import { MODE_NAMES, MODE_COLORS } from '@/constants/mapConfig'


const MapView = ({ 
  planItems, 
  isSubmitted = false,
  city = '杭州'
}: { 
  planItems: PlanItem[], 
  isSubmitted?: boolean,
  city?: string
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeServiceRef = useRef<RouteService | null>(null);
  
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [completeRoute, setCompleteRoute] = useState<CompleteRouteResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('driving');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [routeDrawing, setRouteDrawing] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        await loadAMapScript();
        
        const center = CITY_CENTERS[city] || CITY_CENTERS['杭州'];
        
        mapInstanceRef.current = new (window as any).AMap.Map(mapContainerRef.current, {
          zoom: city === '杭州' ? 4 : 11,
          center: center,
          mapStyle: 'amap://styles/normal',
          showLabel: true,
          showBuildingBlock: true,
          viewMode: '2D',
          pitch: 0,
          skyColor: '#ffffff',
          features: ['bg', 'point', 'road', 'building'],
          resizeEnable: true,
          rotateEnable: true,
          pitchEnable: true,
          zoomEnable: true,
          dragEnable: true,
          keyboardEnable: true,
          doubleClickZoom: true,
          scrollWheel: true,
          touchZoom: true,
          touchZoomCenter: 1,
          animateEnable: true
        });

        routeServiceRef.current = new RouteService(mapInstanceRef.current);

        try {
        await new Promise<void>((resolve) => {
          (window as any).AMap.plugin([
            'AMap.Scale',
            'AMap.ToolBar', 
            'AMap.ControlBar'
          ], () => {
            if ((window as any).AMap.Scale) {
              mapInstanceRef.current.addControl(new (window as any).AMap.Scale({
                position: 'LB'
              }));
            }

            if ((window as any).AMap.ToolBar) {
              mapInstanceRef.current.addControl(new (window as any).AMap.ToolBar({
                locate: true,
                position: 'LT',
                direction: true,
                autoPosition: false,
                locationMarker: true,
                useNative: true,
              }));
            }

            if ((window as any).AMap.ControlBar) {
              mapInstanceRef.current.addControl(new (window as any).AMap.ControlBar({
                position: 'RT'
              }));
            }
            
            resolve();
          });
        });
      } catch (controlError) {
        console.warn('地图控件加载失败，但不影响主要功能:', controlError);
      }

      setMapLoading(false);
    } catch (error) {
      console.error('地图初始化失败:', error);
      setMapLoading(false);
    }
  };

  initMap();


    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [city]);

  useEffect(() => {
    if (!mapInstanceRef.current || planItems.length === 0) return;

    const overlays = mapInstanceRef.current.getAllOverlays('marker');
    overlays.forEach((overlay: any) => {
      mapInstanceRef.current.remove(overlay);
    });

    const markers: any[] = [];
    
    planItems.forEach((item, index) => {
      if (!item.lat || !item.lng) return;

      let markerContent = '';

      if (isSubmitted && item.checked) {
        const checkedItems = planItems.filter(p => p.checked);
        const orderIndex = checkedItems.findIndex(p => p.id === item.id);
        markerContent = `<div style="background: #1890ff; color: white; padding: 6px 10px; border-radius: 50%; font-size: 14px; font-weight: bold; min-width: 28px; text-align: center;">${orderIndex + 1}</div>`;
      } else {
        if (item.isStart) {
          markerContent = `<div style="background: #52c41a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">起点</div>`;
        } else if (item.isEnd) {
          markerContent = `<div style="background: #ff4d4f; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">终点</div>`;
        } else {
          markerContent = `<div style="background: #1890ff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${index + 1}</div>`;
        }
      }

      const marker = new (window as any).AMap.Marker({
        position: [item.lng, item.lat],
        content: markerContent,
        title: item.name,
        anchor: 'center', 
        offset: new (window as any).AMap.Pixel(0, -15), 
        label: {
          content: item.name,
          direction: 'top',
          offset: new (window as any).AMap.Pixel(0, -10),
          style: {
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }
        }
      });

      markers.push(marker);
      mapInstanceRef.current.add(marker);
    });

    if (markers.length > 0) {
      mapInstanceRef.current.setFitView(markers, false, [20, 20, 20, 20]);
    }

  }, [planItems, isSubmitted]);

  useEffect(() => {
    const handleRouteCalculation = async () => {
      if (!routeServiceRef.current || mapLoading) return;

      if (isSubmitted) {
        const checkedItems = planItems.filter(item => item.checked);
        if (checkedItems.length < 2) {
          setCompleteRoute(null);
          return;
        }

        setLoading(true);
        
        try {
          const completeRouteResult = await routeServiceRef.current.calculateCompleteRouteWithModes(
            checkedItems
          );
          
          setCompleteRoute(completeRouteResult);
          
          if (completeRouteResult.success) {
            routeServiceRef.current.drawCompleteRoute(completeRouteResult);
          }
        } catch (error) {
          console.error('完整路径计算失败:', error);
          setCompleteRoute(null);
        }
        
        setLoading(false);
      } else {
        const startPoint = planItems.find(item => item.isStart);
        const endPoint = planItems.find(item => item.isEnd);
        
        if (!startPoint || !endPoint) {
          setRoutes([]);
          return;
        }

        setLoading(true);
        
        try {
          const routeResults = await routeServiceRef.current.getAllRoutes(
            [startPoint.lng, startPoint.lat],
            [endPoint.lng, endPoint.lat],
            city
          );
          
          setRoutes(routeResults);
          
          const successRoutes = routeResults.filter(r => r.success);
          if (successRoutes.length > 0) {
            const defaultMode = successRoutes.find(r => r.mode === 'driving')?.mode || successRoutes[0].mode;
            setSelectedMode(defaultMode);
            handleModeChange(defaultMode);
          }
        } catch (error) {
          console.error('路线查询失败:', error);
          setRoutes([]);
        }
        
        setLoading(false);
      }
    };

    handleRouteCalculation();
  }, [planItems, mapLoading, city, isSubmitted]);

  const handleModeChange = async (mode: string) => {
    if (!routeServiceRef.current || routeDrawing || isSubmitted) return;
    
    const startPoint = planItems.find(item => item.isStart);
    const endPoint = planItems.find(item => item.isEnd);
    
    if (!startPoint || !endPoint) return;

    const routeInfo = routes.find(r => r.mode === mode);
    if (!routeInfo || !routeInfo.success) {
      message.warning(`${MODE_NAMES[mode]}路线规划暂不可用`);
      return;
    }

    setRouteDrawing(true);
    setSelectedMode(mode);

    try {
      const success = await routeServiceRef.current.drawRoute(
        [startPoint.lng, startPoint.lat],
        [endPoint.lng, endPoint.lat],
        mode
      );

      if (!success) {
        message.error(`${MODE_NAMES[mode]}路线绘制失败`);
      } else {
        if (mode === 'transfer') {
          message.success('公交路线已显示，红色标记为换乘站点');
        }
      }
    } catch (error) {
      console.error('路线绘制失败:', error);
      message.error(`${MODE_NAMES[mode]}路线绘制失败`);
    }

    setRouteDrawing(false);
  };

  const handleSegmentClick = (segmentId: string) => {
    if (!routeServiceRef.current) return;

    if (selectedSegment === segmentId) {
      setSelectedSegment(null);
      routeServiceRef.current.resetSegmentHighlight();
    } else {
      setSelectedSegment(segmentId);
      routeServiceRef.current.highlightSegment(segmentId);
    }
  };

  return (
    <div style={{ height: '80vh', width: '100%', border: '1px solid #e8e8e8', borderRadius: 8 }}>
      <div style={{ padding: '16px', background: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }}>
        {mapLoading ? '地图加载中...' : 
          loading ? (isSubmitted ? '计算完整路径中...' : '查询路线中...') : 
            routeDrawing ? `正在绘制${MODE_NAMES[selectedMode]}路线...` :
            isSubmitted ? 
              (completeRoute && completeRoute.success ? 
                `完整行程路线 (${completeRoute.segments.filter(s => s.success).length}/${completeRoute.segments.length} 段成功)` : 
                '完整路径计算') : 
              (routes.length > 0 ? 
                `多种出行方式对比 (${routes.filter(r => r.success).length}/${routes.length} 种可用)` : 
                '路线预览')
        }
        {(isSubmitted ? completeRoute : routes.length > 0) && !loading && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            当前显示: <span style={{ color: MODE_COLORS[selectedMode], fontWeight: 'bold' }}>
              {MODE_NAMES[selectedMode]}
            </span> 路线
            {isSubmitted && completeRoute && (
              <span style={{ marginLeft: '16px' }}>
                总距离: {(completeRoute.totalDistance/1000).toFixed(1)}km | 
                总时间: {Math.ceil(completeRoute.totalDuration/60)}分钟
              </span>
            )}
          </div>
        )}
      </div>
      
      
      <div 
            ref={mapContainerRef} 
            style={{ 
              height: 'calc(100% - 200px)', 
              width: '100%',
              background: '#f0f2f5'
            }} 
        />
      
      
      
      <div style={{ padding: '16px', maxHeight: '100vh', overflow: 'hidden' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="small" /> {isSubmitted ? '计算完整路径中...' : '查询多种出行方式中...'}
          </div>
        )}
        
        {isSubmitted && !loading && completeRoute && (
          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>
              行程路线详情：
            </div>
            {completeRoute.segments.map((segment, index) => (
              <div 
                key={segment.id}
                style={{ 
                  marginBottom: 8, 
                  padding: '8px 12px', 
                  background: segment.success ? 
                    (selectedSegment === segment.id ? '#e6f7ff' : '#fafafa') : 
                    '#fff2f0',
                  borderRadius: 4,
                  border: selectedSegment === segment.id ? 
                    `2px solid ${MODE_COLORS[segment.mode]}` : 
                    '1px solid transparent',
                  cursor: segment.success ? 'pointer' : 'default',
                  opacity: segment.success ? 1 : 0.6,
                  transition: 'all 0.3s ease'
                }}
                onClick={() => segment.success && handleSegmentClick(segment.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div 
                      style={{ 
                        width: 12, 
                        height: 12, 
                        backgroundColor: segment.success ? MODE_COLORS[segment.mode] : '#d9d9d9', 
                        borderRadius: '50%', 
                        marginRight: 8 
                      }}
                    />
                    <strong style={{ 
                      color: segment.success ? 
                        (selectedSegment === segment.id ? MODE_COLORS[segment.mode] : '#333') : 
                        '#999' 
                    }}>
                      {segment.startPoint.name} → {segment.endPoint.name}
                      {selectedSegment === segment.id && ' (高亮显示)'}
                    </strong>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: segment.success ? '#666' : '#999', marginTop: '4px' }}>
                  {segment.success ? (
                    <>
                      距离: {(segment.distance/1000).toFixed(1)}km | 
                      时间: {Math.ceil(segment.duration/60)}分钟 | 
                      方式: {MODE_NAMES[segment.mode]}
                    </>
                  ) : (
                    <span style={{ color: '#ff4d4f' }}>{segment.error}</span>
                  )}
                </div>
              </div>
            ))}
            
            {completeRoute.segments.some(s => s.success) && (
              <div style={{ 
                marginTop: '12px', 
                padding: '8px 12px', 
                background: '#f0f9ff', 
                borderRadius: 4,
                border: '1px solid #91d5ff'
              }}>
                <strong>总计：</strong>
                <span style={{ marginLeft: '8px' }}>
                  距离 {(completeRoute.totalDistance/1000).toFixed(1)}km | 
                  时间 {Math.ceil(completeRoute.totalDuration/60)}分钟
                </span>
              </div>
            )}
          </div>
        )}
        
        {!isSubmitted && !loading && routes.length > 0 && (
          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>
              出行方式对比：
            </div>
            {routes.map((route, index) => (
              <div 
                key={index} 
                style={{ 
                  marginBottom: 8, 
                  padding: '8px 12px', 
                  background: route.success ? 
                    (selectedMode === route.mode ? '#e6f7ff' : '#fafafa') : 
                    '#fff2f0',
                  borderRadius: 4,
                  border: selectedMode === route.mode && route.success ? 
                    `2px solid ${MODE_COLORS[route.mode]}` : 
                    '1px solid transparent',
                  cursor: route.success ? 'pointer' : 'default',
                  opacity: route.success ? 1 : 0.6,
                  transition: 'all 0.3s ease'
                }}
                onClick={() => route.success && !routeDrawing && handleModeChange(route.mode)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div 
                      style={{ 
                        width: 12, 
                        height: 12, 
                        backgroundColor: route.success ? MODE_COLORS[route.mode] : '#d9d9d9', 
                        borderRadius: '50%', 
                        marginRight: 8 
                      }}
                    />
                    <strong style={{ 
                      color: route.success ? 
                        (selectedMode === route.mode ? MODE_COLORS[route.mode] : '#333') : 
                        '#999' 
                    }}>
                      {MODE_NAMES[route.mode]}
                      {selectedMode === route.mode && route.success && ' (当前显示)'}
                    </strong>
                  </div>
                  {route.success && (
                    <Button 
                      size="small" 
                      type={selectedMode === route.mode ? 'primary' : 'default'}
                      loading={routeDrawing && selectedMode === route.mode}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModeChange(route.mode);
                      }}
                    >
                      {routeDrawing && selectedMode === route.mode ? '绘制中' : '查看路线'}
                    </Button>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: route.success ? '#666' : '#999', marginTop: '4px' }}>
                  {route.success ? (
                    <>
                      距离: {(route.distance/1000).toFixed(1)}km | 
                      时间: {Math.ceil(route.duration/60)}分钟
                      {route.mode === 'transfer' && ' | 含换乘'}
                    </>
                  ) : (
                    <span style={{ color: '#ff4d4f' }}>
                      {route.mode === 'elecbike' ? '该城市暂不支持电动车路径规划' : route.error}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && (isSubmitted ? !completeRoute : routes.length === 0) && !mapLoading && (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            {isSubmitted ? '请选择至少2个景点计算路径' : '请设置起点和终点查看路线'}
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;