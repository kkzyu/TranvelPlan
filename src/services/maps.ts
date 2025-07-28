import axios from 'axios';

// 关键词检索
export interface Place {
    id: string;
    name: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    cityname: string;
    adname: string;
}

export interface PlaceSearchInputProps {
    value?: string;
    onChange?: (value: string) => void;
    onPlaceSelected: (place: Place | null) => void;
    placeholder?: string;
    city?: string;
}

export interface AutoCompleteOption {
    value: string;
    label: string;
    address: string;
    place: Place;
}

// Web服务API Key (用于HTTP请求)
const AMAP_WEB_SERVICE_KEY = process.env.UMI_APP_AMAP_WEB_SERVICE_KEY;

export const searchPlacesByKeyword = async (keyword: string, city: string): Promise<Place[]> => {
    try {
        const response = await axios.get('https://restapi.amap.com/v5/place/text', {
            params: {
                key: AMAP_WEB_SERVICE_KEY,
                keywords: keyword,
                city: city,
                output: 'json',
            }
        });

        if (response.data && response.data.status === '1' && response.data.pois) {
            const places: Place[] = response.data.pois.map((p: any) => {
                const [lng, lat] = p.location.split(',');
                return {
                    id: p.id,
                    name: p.name,
                    address: p.address,
                    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
                    cityname: p.cityname,
                    adname: p.adname,
                };
            });
            return places;
        } else {
            console.error('高德 API 返回错误:', response.data.info);
            return [];
        }
    } catch (error) {
        console.error('搜索地点请求失败:', error);
        return [];
    }
};

// 路线数据接口
export interface RouteResult {
  mode: string;
  distance: number; // 距离（米）
  duration: number; // 时间（秒）
  polyline?: [number, number][]; // 路线坐标点
  success: boolean;
  error?: string;
}

// 路线段数据接口
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

export class RouteService {
  private map: any;
  private pluginsLoaded: boolean = false;
  private availablePlugins: Set<string> = new Set();
  private currentRouteInstance: any = null;   
  private segmentInstances: any[] = [];   
  private segmentOverlays: any[] = []; 

  constructor(map: any) {
    this.map = map;
  }

  private async loadPlugins(): Promise<void> {
    if(this.pluginsLoaded) return;

    return new Promise((resolve,reject) => {
        
      if (!(window as any).AMap) {
        reject(new Error('AMap未加载'));
        return;
      }
      const basicPlugins = ['AMap.Driving', 'AMap.Walking', 'AMap.Transfer'];
      const advancedPlugins = ['AMap.Riding'];

      (window as any).AMap.plugin(basicPlugins, () => {
        basicPlugins.forEach(plugin=>{
            const pluginName=plugin.replace('AMap.','');
            if((window as any).AMap[pluginName]){
                this.availablePlugins.add(pluginName.toLowerCase());
            }
        });

        (window as any).AMap.plugin(advancedPlugins, () => {
          advancedPlugins.forEach(plugin => {
            const pluginName = plugin.replace('AMap.', '');
            if ((window as any).AMap[pluginName]) {
              this.availablePlugins.add(pluginName.toLowerCase());
            }
          });
          
          this.pluginsLoaded = true;
          console.log('已加载的插件:', Array.from(this.availablePlugins));
          resolve();
        });
      });
    });
  }

  private async ensurePluginsLoaded(): Promise<void> {
    if (this.pluginsLoaded) return;
    await this.loadPlugins();
  }

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

  async drawRoute(
    startPoint: [number, number],
    endPoint: [number, number],
    mode: string
  ): Promise<boolean> {
    try {
      await this.ensurePluginsLoaded();
      
      // 清除之前的路线
      this.clearAllRoutes();

      switch (mode) {
        case 'driving':
          return this.drawDrivingRoute(startPoint, endPoint);
        case 'walking':
          return this.drawWalkingRoute(startPoint, endPoint);
        case 'riding':
          return this.drawridingRoute(startPoint, endPoint);
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

  private drawDrivingRoute(startPoint: [number, number], endPoint: [number, number]): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.availablePlugins.has('driving')) {
        resolve(false);
        return;
      }

      this.currentRouteInstance = new (window as any).AMap.Driving({
        map: this.map, // 直接绘制到地图上
        showTraffic: false,
        autoFitView: true, // 自动调整视野
        showSteps: true, // 显示路径步骤
        hideMarkers: false // 显示起终点标记
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
      if (!this.availablePlugins.has('walking')) {
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
  private drawridingRoute(startPoint: [number, number], endPoint: [number, number]): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.availablePlugins.has('riding')) {
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
      if (!this.availablePlugins.has('transfer')) {
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

  // 创建路段实例
  private async createSegmentInstance(segment: RouteSegment): Promise<any> {
    return new Promise((resolve) => {
      const startPoint = segment.startPoint.position;
      const endPoint = segment.endPoint.position;

      let routeInstance: any;

      switch (segment.mode) {
        case 'driving':
          if (this.availablePlugins.has('driving')) {
            routeInstance = new (window as any).AMap.Driving({
              map: this.map,
              autoFitView: false,
              showSteps: false,
              hideMarkers: true // 隐藏默认标记，使用自定义标记
            });
          }
          break;
        case 'walking':
          if (this.availablePlugins.has('walking')) {
            routeInstance = new (window as any).AMap.Walking({
              map: this.map,
              autoFitView: false,
              showSteps: false,
              hideMarkers: true
            });
          }
          break;
        case 'riding':
          if (this.availablePlugins.has('riding')) {
            routeInstance = new (window as any).AMap.Riding({
              map: this.map,
              autoFitView: false,
              showSteps: false,
              hideMarkers: true
            });
          }
          break;
        case 'transfer':
          if (this.availablePlugins.has('transfer')) {
            routeInstance = new (window as any).AMap.Transfer({
              map: this.map,
              city: '杭州',
              autoFitView: false,
              showSteps: false,
              hideMarkers: true
            });
          }
          break;
      }

      if (!routeInstance) {
        resolve(null);
        return;
      }

      routeInstance.search(startPoint, endPoint, (status: string, result: any) => {
        if (status === 'complete') {
          resolve(routeInstance);
        } else {
          resolve(null);
        }
      });
    });
  }

  drawCompleteRoute(completeRouteResult: CompleteRouteResult): void {
    this.clearAllRoutes();

    if (!completeRouteResult.success || completeRouteResult.segments.length === 0) {
      return;
    }

    const MODE_COLORS: Record<string, string> = {
      driving: '#1890ff',
      walking: '#52c41a',
      riding: '#faad14',
      elecbike: '#722ed1',
      transfer: '#f759ab'
    };

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
    const MODE_COLORS: Record<string, string> = {
      driving: '#1890ff',
      walking: '#52c41a',
      riding: '#faad14',
      elecbike: '#722ed1',
      transfer: '#f759ab'
    };

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

  async getAllRoutes(
    startPoint: [number, number],
    endPoint: [number, number], 
    city: string = '全国'
  ): Promise<RouteResult[]> {
    console.log('getAllRoutes 被调用:', { startPoint, endPoint, city });

    const routePromises = [
      this.getDrivingRoute(startPoint, endPoint),
      this.getWalkingRoute(startPoint, endPoint),
      this.getRidingRoute(startPoint, endPoint),
      this.getTransitRoute(startPoint, endPoint, city)
    ];

    try {
      const results = await Promise.allSettled(routePromises);
      const routes = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`路线查询失败 (索引${index}):`, result.reason);
          const modes = ['driving', 'walking', 'riding', 'transfer'];
          return {
            mode: modes[index],
            distance: 0,
            duration: 0,
            success: false,
            error: '查询失败'
          } as RouteResult;
        }
      });

      console.log('所有路线查询完成:', routes);
      return routes;
    } catch (error) {
      console.error('批量路线查询失败:', error);
      return [];
    }
  }

  // 新增：按景点设置的出行方式计算完整路径
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

    // 分段计算路线
    for (let i = 0; i < checkedItems.length - 1; i++) {
      const startItem = checkedItems[i];
      const endItem = checkedItems[i + 1];
      
      // 使用起点景点设置的出行方式
      const segmentMode = startItem.mode || 'driving';
      
      try {
        const segmentResult = await this.calculateSingleSegment(
          startItem,
          endItem,
          segmentMode,
          `segment-${i}`
        );

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

    return {
      segments,
      totalDistance,
      totalDuration,
      mode: 'mixed',
      success: segments.some(s => s.success)
    };
  }

  // 计算单个路段
  private async calculateSingleSegment(
    startItem: any,
    endItem: any,
    mode: string,
    segmentId: string
  ): Promise<RouteSegment> {
    let routeResult: RouteResult;

    switch (mode) {
      case 'driving':
        routeResult = await this.getDrivingRoute([startItem.lng, startItem.lat], [endItem.lng, endItem.lat]);
        break;
      case 'walking':
        routeResult = await this.getWalkingRoute([startItem.lng, startItem.lat], [endItem.lng, endItem.lat]);
        break;
      case 'riding':
        routeResult = await this.getRidingRoute([startItem.lng, startItem.lat], [endItem.lng, endItem.lat]);
        break;
      case 'transfer':
        routeResult = await this.getTransitRoute([startItem.lng, startItem.lat], [endItem.lng, endItem.lat], '杭州');
        break;
      default:
        routeResult = await this.getDrivingRoute([startItem.lng, startItem.lat], [endItem.lng, endItem.lat]);
    }

    return {
      id: segmentId,
      startPoint: {
        name: startItem.name,
        position: [startItem.lng, startItem.lat]
      },
      endPoint: {
        name: endItem.name,
        position: [endItem.lng, endItem.lat]
      },
      distance: routeResult.distance,
      duration: routeResult.duration,
      mode: mode as any,
      polyline: [], // 可以从路线结果中提取
      success: routeResult.success,
      error: routeResult.error
    };
  }

  async getDrivingRoute(
    startPoint: [number, number], 
    endPoint: [number, number]
  ): Promise<RouteResult> {
    try {
      await this.ensurePluginsLoaded();
    } catch (error) {
      return {
        mode: 'driving',
        distance: 0,
        duration: 0,
        success: false,
        error: '路线规划插件加载失败'
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
      await this.ensurePluginsLoaded();
    } catch (error) {
      return {
        mode: 'walking',
        distance: 0,
        duration: 0,
        success: false,
        error: '路线规划插件加载失败'
      };
    }

    return new Promise((resolve) => {
      const walking = new (window as any).AMap.Walking({
        map: null,
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
      await this.ensurePluginsLoaded();
    } catch (error) {
      return {
        mode: 'riding',
        distance: 0,
        duration: 0,
        success: false,
        error: '路线规划插件加载失败'
      };
    }

    return new Promise((resolve) => {
      const riding = new (window as any).AMap.Riding({
        map: null,
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


  // 公交路线
  async getTransitRoute(
    startPoint: [number, number], 
    endPoint: [number, number],
    city: string = '杭州'
  ): Promise<RouteResult> {
    try {
      await this.ensurePluginsLoaded();
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
}