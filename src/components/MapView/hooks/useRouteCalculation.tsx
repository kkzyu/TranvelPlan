// hooks/useRouteCalculation.ts
import { useEffect, useState } from 'react';
import { PlanItem } from '@/pages/index';
import { RouteResult, CompleteRouteResult } from '@/services/types';
import { RouteService } from '@/services/maps';

export const useRouteCalculation = (
  routeServiceRef: React.MutableRefObject<RouteService | null>,
  planItems: PlanItem[],
  isSubmitted: boolean,
  city: string,
  mapLoading: boolean
) => {
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [completeRoute, setCompleteRoute] = useState<CompleteRouteResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const calculateRoutes = async () => {
      if (!routeServiceRef.current || mapLoading) return;

      setLoading(true);
      try {
        if (isSubmitted) {
          const checkedItems = planItems.filter(item => item.checked);
          if (checkedItems.length < 2) {
            setCompleteRoute(null);
            return;
          }

          const result = await routeServiceRef.current.calculateCompleteRouteWithModes(checkedItems);
          setCompleteRoute(result);

          if (result.success && result.segments.length > 0) {
            routeServiceRef.current.drawCompleteRoute(result);
          }
        } else {
          const startPoint = planItems.find(item => item.isStart);
          const endPoint = planItems.find(item => item.isEnd);
          if (!startPoint || !endPoint) {
            setRoutes([]);
            return;
          }

          const routeResults = await routeServiceRef.current.getAllRoutes(
            [startPoint.lng, startPoint.lat],
            [endPoint.lng, endPoint.lat],
            city
          );
          setRoutes(routeResults);
        }
      } catch (error) {
        console.error('路线计算失败:', error);
        isSubmitted ? setCompleteRoute(null) : setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    calculateRoutes();
  }, [planItems, isSubmitted, city, mapLoading, routeServiceRef]);

  return {
    routes,
    completeRoute,
    loading,
    setRoutes,
    setCompleteRoute,
  };
};