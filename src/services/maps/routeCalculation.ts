import { RouteResult, RouteSegment, CompleteRouteResult } from '@/services/types'
import { calculateSingleSegment } from './singleRouteCalculation';
import { ensurePluginsLoaded } from './'

export class RouteCalculationService {
  // 驾车路线
  async getDrivingRoute(
      startPoint: [number, number], 
      endPoint: [number, number]
    ): Promise<RouteResult> {
      try {
        await ensurePluginsLoaded();
      } catch (error) {
        return {
          mode: 'driving',
          distance: 0,
          duration: 0,
          success: false,
          error: '驾车路线规划插件加载失败'
        };
      }
  
      return new Promise((resolve) => {
        const driving = new (window as any).AMap.Driving({
          map: null, 
          showTraffic: false,
          autoFitView: false
        });
  
        driving.search(startPoint, endPoint, (status: string, result: any) => {
          if (status === 'complete' && result.routes && result.routes.length > 0) {
            const route = result.routes[0];
            resolve({
              mode: 'driving',
              distance: route.distance,
              duration: route.time,
              success: true
            });
          } else {
            resolve({
              mode: 'driving',
              distance: 0,
              duration: 0,
              success: false,
              error: '驾车路线查询失败'
            });
          }
        });
      });
    }

    // 步行路线
    async getWalkingRoute(
        startPoint: [number, number], 
        endPoint: [number, number]
      ): Promise<RouteResult> {
    
        try {
          await ensurePluginsLoaded();
        } catch (error) {
          return {
            mode: 'walking',
            distance: 0,
            duration: 0,
            success: false,
            error: '步行路线规划插件加载失败'
          };
        }
    
        return new Promise((resolve) => {
          const walking = new (window as any).AMap.Walking({
            map: null,
            showTraffic: false,
            autoFitView: false
          });
    
          walking.search(startPoint, endPoint, (status: string, result: any) => {
            if (status === 'complete' && result.routes && result.routes.length > 0) {
              const route = result.routes[0];
              resolve({
                mode: 'walking',
                distance: route.distance,
                duration: route.time,
                success: true
              });
            } else {
              resolve({
                mode: 'walking',
                distance: 0,
                duration: 0,
                success: false,
                error: '步行路线查询失败'
              });
            }
          });
        });
      }

    // 骑行路线
    async getRidingRoute(
          startPoint: [number, number], 
          endPoint: [number, number]
        ): Promise<RouteResult> {
          try {
            await ensurePluginsLoaded();
          } catch (error) {
            return {
              mode: 'riding',
              distance: 0,
              duration: 0,
              success: false,
              error: '骑行路线规划插件加载失败'
            };
          }
      
          return new Promise((resolve) => {
            const riding = new (window as any).AMap.Riding({
              map: null,
              showTraffic: false,
              autoFitView: false
            });
      
            riding.search(startPoint, endPoint, (status: string, result: any) => {
              if (status === 'complete' && result.routes && result.routes.length > 0) {
                const route = result.routes[0];
                resolve({
                  mode: 'riding',
                  distance: route.distance,
                  duration: route.time,
                  success: true
                });
              } else {
                resolve({
                  mode: 'riding',
                  distance: 0,
                  duration: 0,
                  success: false,
                  error: '骑行路线查询失败'
                });
              }
            });
          });
        }
    
    // 公交地铁路线
    async getTransitRoute(
        startPoint: [number, number], 
        endPoint: [number, number],
        city: string = '杭州'
      ): Promise<RouteResult> {
        try {
          await ensurePluginsLoaded();
        } catch (error) {
          return {
            mode: 'transfer',
            distance: 0,
            duration: 0,
            success: false,
            error: '路线规划插件加载失败'
          };
        }
    
        return new Promise((resolve) => {
          const transfer = new (window as any).AMap.Transfer({
            map: null,
            city: city === '杭州' ? '北京' : city, // 公交查询需要具体城市
            autoFitView: false
          });
    
          transfer.search(startPoint, endPoint, (status: string, result: any) => {
            if (status === 'complete' && result.plans && result.plans.length > 0) {
              const plan = result.plans[0];
              resolve({
                mode: 'transfer',
                distance: plan.distance,
                duration: plan.time,
                success: true
              });
            } else {
              resolve({
                mode: 'transfer',
                distance: 0,
                duration: 0,
                success: false,
                error: '公交路线查询失败'
              });
            }
          });
        });
      }
    
    // 编辑状态下，查询所有的出行方式
    async getAllRoutes(
        startPoint: [number, number], 
        endPoint: [number, number],
        city: string = '杭州'
      ): Promise<RouteResult[]> {
        const results = await Promise.all([
          this.getDrivingRoute(startPoint, endPoint),
          this.getWalkingRoute(startPoint, endPoint),
          this.getRidingRoute(startPoint, endPoint),
          this.getTransitRoute(startPoint, endPoint, city)
        ]);
    
        return results;
      }

    // 提交状态下，计算完整路径的长度和耗时
    async calculateCompleteRouteWithModes(
        checkedItems: any[]
      ): Promise<CompleteRouteResult> {
        if (checkedItems.length < 2) {
          return {
            segments: [],
            totalDistance: 0,
            totalDuration: 0,
            mode: 'mixed',
            success: false
          };
        }
    
        const segments: RouteSegment[] = [];
        let totalDistance = 0;
        let totalDuration = 0;
    
        for (let i = 0; i < checkedItems.length - 1; i++) {
          const startItem = checkedItems[i];
          const endItem = checkedItems[i + 1];
          
          const segmentMode = startItem.mode || 'driving';
          
          try {
            console.log(`计算路段 ${i + 1}:`, startItem.name, '→', endItem.name, `(${segmentMode})`);
            const segmentResult = await calculateSingleSegment(
              startItem,
              endItem,
              segmentMode,
              `segment-${i}`
            );

            console.log(`路段 ${i + 1} 计算结果:`, segmentResult);
            segments.push(segmentResult);
            
            if (segmentResult.success) {
              totalDistance += segmentResult.distance;
              totalDuration += segmentResult.duration;
            }
          } catch (error) {
            console.error(`路段 ${startItem.name} → ${endItem.name} 计算失败:`, error);
            segments.push({
              id: `segment-${i}`,
              startPoint: {
                name: startItem.name,
                position: [startItem.lng, startItem.lat]
              },
              endPoint: {
                name: endItem.name,
                position: [endItem.lng, endItem.lat]
              },
              distance: 0,
              duration: 0,
              mode: segmentMode,
              polyline: [],
              success: false,
              error: '路线计算失败'
            });
          }
        }
    
        const result = {
          segments,
          totalDistance,
          totalDuration,
          mode: 'mixed',
          success: segments.some(s => s.success)
        };
        console.log('完整路线计算结果:', result);
        return result;
      }
}