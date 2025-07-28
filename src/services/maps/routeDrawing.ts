import { CompleteRouteResult } from '@/services/types';
import { MODE_COLORS } from '@/constants/mapConfig';
import { ensurePluginsLoaded, isPluginAvailable } from './'

export class RouteDrawingService {
    private map: any;
    private currentRouteInstance: any = null;   
    private segmentInstances: any[] = [];   
    private segmentOverlays: any[] = []; 

    // 初始化地图容器
    constructor(map: any) {
        this.map = map;
    }

    // 绘制驾车路线
    private drawDrivingRoute(startPoint: [number, number], endPoint: [number, number]): Promise<boolean> {
    return new Promise((resolve) => {
      if (!isPluginAvailable('driving')) {
        resolve(false);
        return;
      }

      this.currentRouteInstance = new (window as any).AMap.Driving({
        map: this.map, 
        showTraffic: false,
        autoFitView: true, 
        showSteps: true, 
        hideMarkers: false 
      });

      this.currentRouteInstance.search(startPoint, endPoint, (status: string, result: any) => {
        if (status === 'complete' && result.routes && result.routes.length > 0) {
          console.log('驾车路线绘制成功');
          resolve(true);
        } else {
          console.error('驾车路线绘制失败:', status, result);
          resolve(false);
        }
      });
    });
  }

    // 绘制步行路线
    private drawWalkingRoute(startPoint: [number, number], endPoint: [number, number]): Promise<boolean> {
        return new Promise((resolve) => {
        if (!isPluginAvailable('walking')) {
            resolve(false);
            return;
        }

        this.currentRouteInstance = new (window as any).AMap.Walking({
            map: this.map,
            autoFitView: true,
            showSteps: true,
            hideMarkers: false
        });

        this.currentRouteInstance.search(startPoint, endPoint, (status: string, result: any) => {
            if (status === 'complete' && result.routes && result.routes.length > 0) {
            console.log('步行路线绘制成功');
            resolve(true);
            } else {
            console.error('步行路线绘制失败:', status, result);
            resolve(false);
            }
        });
        });
    }

    // 绘制骑行路线
    private drawRidingRoute(startPoint: [number, number], endPoint: [number, number]): Promise<boolean> {
        return new Promise((resolve) => {
        if (!isPluginAvailable('riding')) {
            resolve(false);
            return;
        }

        this.currentRouteInstance = new (window as any).AMap.Riding({
            map: this.map,
            autoFitView: true,
            showSteps: true,
            hideMarkers: false
        });

        this.currentRouteInstance.search(startPoint, endPoint, (status: string, result: any) => {
            if (status === 'complete' && result.routes && result.routes.length > 0) {
            console.log('骑行路线绘制成功');
            resolve(true);
            } else {
            console.error('骑行路线绘制失败:', status, result);
            resolve(false);
            }
        });
        });
    }

    // 绘制公交路线
    private drawTransitRoute(startPoint: [number, number], endPoint: [number, number]): Promise<boolean> {
        return new Promise((resolve) => {
        if (!isPluginAvailable('transfer')) {
            resolve(false);
            return;
        }

        this.currentRouteInstance = new (window as any).AMap.Transfer({
            map: this.map,
            city: '杭州', // 根据实际城市调整
            autoFitView: true,
            showSteps: true,
            hideMarkers: false
        });

        this.currentRouteInstance.search(startPoint, endPoint, (status: string, result: any) => {
            if (status === 'complete' && result.plans && result.plans.length > 0) {
            console.log('公交路线绘制成功');
            resolve(true);
            } else {
            console.error('公交路线绘制失败:', status, result);
            resolve(false);
            }
        });
        });
    }

    // 提交状态下，绘制对应出行方式的路线
    async drawRoute(
        startPoint: [number, number],
        endPoint: [number, number],
        mode: string
    ): Promise<boolean> {
        try {
        ensurePluginsLoaded();
        
        this.clearAllRoutes();

        switch (mode) {
            case 'driving':
            return this.drawDrivingRoute(startPoint, endPoint);
            case 'walking':
            return this.drawWalkingRoute(startPoint, endPoint);
            case 'riding':
            return this.drawRidingRoute(startPoint, endPoint);
            case 'transfer':
            return this.drawTransitRoute(startPoint, endPoint);
            default:
            return false;
        }
        } catch (error) {
        console.error('绘制路线失败:', error);
        return false;
        }
    }

    // 清理地图容器上的所有路径
    clearAllRoutes(): void {
        if (this.currentRouteInstance) {
        this.currentRouteInstance.clear();
        this.currentRouteInstance = null;
        }

        this.segmentInstances.forEach(instance => {
        if (instance && instance.clear) {
            instance.clear();
        }
        });
        this.segmentInstances = [];

        this.segmentOverlays.forEach(overlay => {
        if (overlay) {
            this.map.remove(overlay);
        }
        });
        this.segmentOverlays = [];
        
        const polylines = this.map.getAllOverlays('polyline');
        polylines.forEach((polyline: any) => {
        this.map.remove(polyline);
        });
    }

    drawCompleteRoute(completeRouteResult: CompleteRouteResult): void {
        this.clearAllRoutes();
    
        if (!completeRouteResult.success || completeRouteResult.segments.length === 0) {
        return;
        }
    
        completeRouteResult.segments.forEach((segment, index) => {
        if (segment.success && segment.polyline.length > 0) {
            const polyline = new (window as any).AMap.Polyline({
            path: segment.polyline,
            strokeColor: MODE_COLORS[segment.mode] || '#1890ff',
            strokeWeight: 5,
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            extData: { segmentId: segment.id, segmentIndex: index }
            });
    
            this.map.add(polyline);
            this.segmentOverlays.push(polyline);
    
            // 添加路段标识
            if (segment.polyline.length > 0) {
            const midIndex = Math.floor(segment.polyline.length / 2);
            const midPoint = segment.polyline[midIndex];
            
            const marker = new (window as any).AMap.Marker({
                position: midPoint,
                content: `<div style="background: ${MODE_COLORS[segment.mode]}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; border: 1px solid white;">${index + 1}</div>`,
                offset: new (window as any).AMap.Pixel(-10, -10)
            });
    
            this.map.add(marker);
            this.segmentOverlays.push(marker);
            }
        }
        });
    
        if (this.segmentOverlays.length > 0) {
        this.map.setFitView(this.segmentOverlays, false, [20, 20, 20, 20]);
        }
    }
    

    highlightSegment(segmentId: string): void {
    this.segmentOverlays.forEach(overlay => {
      if (overlay.CLASS_NAME === 'AMap.Polyline') {
        const extData = overlay.getExtData();
        if (extData && extData.segmentId === segmentId) {
          overlay.setOptions({
            strokeWeight: 8,
            strokeOpacity: 1,
            zIndex: 100
          });
        } else {
          overlay.setOptions({
            strokeWeight: 3,
            strokeOpacity: 0.3,
            zIndex: 1
          });
        }
      }
    });
  }

  resetSegmentHighlight(): void {
    this.segmentOverlays.forEach(overlay => {
      if (overlay.CLASS_NAME === 'AMap.Polyline') {
        overlay.setOptions({
          strokeWeight: 5,
          strokeOpacity: 0.8,
          zIndex: 10
        });
      }
    });
  }
}