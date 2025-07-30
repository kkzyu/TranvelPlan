// hooks/useRouteInteraction.ts
import { useState } from 'react';
import { message } from 'antd';
import { PlanItem } from '@/pages/index';
import { RouteService } from '@/services/maps';
import { MODE_NAMES } from '@/constants/mapConfig';

export const useRouteInteraction = (
  routeServiceRef: React.MutableRefObject<RouteService | null>,
  routes: any[],
  planItems: PlanItem[],
  isSubmitted: boolean
) => {
  const [selectedMode, setSelectedMode] = useState<string>('driving');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [routeDrawing, setRouteDrawing] = useState(false);

  // 切换出行方式
  const handleModeChange = async (mode: string) => {
    if (!routeServiceRef.current || routeDrawing || isSubmitted) return;

    const startPoint = planItems.find(item => item.isStart);
    const endPoint = planItems.find(item => item.isEnd);
    if (!startPoint || !endPoint) return;

    const routeInfo = routes.find(r => r.mode === mode);
    if (!routeInfo || !routeInfo.success) return;

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
      }
    } catch (error) {
      console.error('路线绘制失败:', error);
      message.error(`${MODE_NAMES[mode]}路线绘制失败`);
    } finally {
      setRouteDrawing(false);
    }
  };

  // 点击路段
  const handleSegmentClick = (segmentId: string) => {
    if (!routeServiceRef.current) {
      console.error('routeService 未初始化');
      return;
    }

    if (selectedSegment === segmentId) {
      setSelectedSegment(null);
      routeServiceRef.current.resetSegmentHighlight();
    } else {
      setSelectedSegment(segmentId);
      routeServiceRef.current.highlightSegment(segmentId);
    }
  };

  return {
    selectedMode,
    selectedSegment,
    routeDrawing,
    handleModeChange,
    handleSegmentClick,
    setSelectedMode,
  };
};