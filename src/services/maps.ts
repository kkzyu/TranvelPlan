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
// Web端JS API Key (用于地图和前端路线规划)
const AMAP_JS_KEY = process.env.UMI_APP_AMAP_JS_KEY;

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

// 多种出行方式路线查询
export class RouteService {
  private map: any;
  private pluginsLoaded: boolean = false;
  private currentRouteInstance: any = null;   
  private segmentInstances: any[] = []; // 存储所有路段实例   
  private segmentOverlays: any[] = []; // 存储所有路段覆盖物

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
      (window as any).AMap.plugin([
        'AMap.Driving',       
        'AMap.Walking',       
        'AMap.Bicycling',     
        'AMap.Transfer',       
      ], () => {
        this.pluginsLoaded = true;
        console.log('路线规划插件加载完成');
        resolve();
      });
    });
  }

  private async ensurePluginsLoaded(): Promise<void> {
    if (this.pluginsLoaded) return;
    await this.loadPlugins();
  }

  // 清除地图上的所有路线
  clearRoutes(): void {
    if (this.currentRouteInstance) {
      // 如果有当前路线实例，清除它
      if (this.currentRouteInstance.clear) {
        this.currentRouteInstance.clear();
      }
      this.currentRouteInstance = null;
    }
    // 清除分段实例
    this.segmentInstances.forEach(instance => {
      if (instance && instance.clear) {
        instance.clear();
      }
    });
    this.segmentInstances = [];

    // 清除覆盖物
    this.segmentOverlays.forEach(overlay => {
      if (overlay && this.map) {
        this.map.remove(overlay);
      }
    });
    this.segmentOverlays = [];
    
    // 清除地图上的所有路线覆盖物，但保留标记点
    if (this.map) {
      const overlays = this.map.getAllOverlays('polyline');
      overlays.forEach((overlay: any) => {
        this.map.remove(overlay);
      });
    }
  }
  // 计算完整路径（分段路线）
  async calculateCompleteRoute(
    planItems: any[],
    mode: string = 'driving'
  ): Promise<CompleteRouteResult> {
    const checkedItems = planItems.filter(item => item.checked);
    if (checkedItems.length < 2) {
      return {
        segments: [],
        totalDistance: 0,
        totalDuration: 0,
        mode,
        success: false
      };
    }

    const segments: RouteSegment[] = [];
    let totalDistance = 0;
    let totalDuration = 0;

    // 分段计算路线（串行处理确保顺序）
    for (let i = 0; i < checkedItems.length - 1; i++) {
      const startItem = checkedItems[i];
      const endItem = checkedItems[i + 1];
      
      try {
        const segmentResult = await this.calculateSingleSegment(
          startItem,
          endItem,
          mode,
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
          mode,
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
      mode,
      success: segments.some(s => s.success)
    };
  }

  async calculateCompleteRouteWithModes(
    checkedItems: any[]
  ): Promise<CompleteRouteResult> {
    if (checkedItems.length < 2) {
      return {
        segments: [],
        totalDistance: 0,
        totalDuration: 0,
        mode: 'mixed', // 混合模式
        success: false
      };
    }

    const segments: RouteSegment[] = [];
    let totalDistance = 0;
    let totalDuration = 0;

    // 分段计算路线（串行处理确保顺序）
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
    const startPoint: [number, number] = [startItem.lng, startItem.lat];
    const endPoint: [number, number] = [endItem.lng, endItem.lat];

    return new Promise((resolve) => {
      let routeInstance: any = null;

      switch (mode) {
        case 'driving':
          routeInstance = new (window as any).AMap.Driving({
            map: null,
            showTraffic: false,
            autoFitView: false
          });
          break;

        case 'walking':
          if ((window as any).AMap.Walking) {
            routeInstance = new (window as any).AMap.Walking({
              map: null,
              autoFitView: false
            });
          }
          break;

        case 'bicycling':
          if ((window as any).AMap.Bicycling) {
            routeInstance = new (window as any).AMap.Bicycling({
              map: null,
              autoFitView: false
            });
          }
          break;

        case 'elecbike':
          if ((window as any).AMap.ElectroBike) {
            routeInstance = new (window as any).AMap.ElectroBike({
              map: null,
              autoFitView: false
            });
          }
          break;
      }

      if (!routeInstance) {
        resolve({
          id: segmentId,
          startPoint: { name: startItem.name, position: startPoint },
          endPoint: { name: endItem.name, position: endPoint },
          distance: 0,
          duration: 0,
          mode,
          polyline: [],
          success: false,
          error: `不支持${mode}路线规划`
        });
        return;
      }

      routeInstance.search(startPoint, endPoint, (status: string, result: any) => {
        if (status === 'complete' && result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          const polyline: [number, number][] = [];
          
          // 提取路线坐标点
          if (route.path && route.path.length > 0) {
            route.path.forEach((point: any) => {
              polyline.push([point.lng, point.lat]);
            });
          }

          resolve({
            id: segmentId,
            startPoint: { name: startItem.name, position: startPoint },
            endPoint: { name: endItem.name, position: endPoint },
            distance: route.distance,
            duration: route.time,
            mode,
            polyline,
            success: true
          });
        } else {
          resolve({
            id: segmentId,
            startPoint: { name: startItem.name, position: startPoint },
            endPoint: { name: endItem.name, position: endPoint },
            distance: 0,
            duration: 0,
            mode,
            polyline: [],
            success: false,
            error: '路线查询失败'
          });
        }
      });
    });
  }

  // 绘制完整路径
  drawCompleteRoute(completeRouteResult: CompleteRouteResult): void {
    this.clearRoutes();

    if (!completeRouteResult.success || completeRouteResult.segments.length === 0) {
      return;
    }

    const MODE_COLORS: Record<string, string> = {
      driving: '#1890ff',
      walking: '#52c41a',
      bicycling: '#faad14',
      elecbike: '#722ed1',
      transit: '#f759ab'
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

    // 自适应显示
    if (this.segmentOverlays.length > 0) {
      this.map.setFitView(this.segmentOverlays, false, [20, 20, 20, 20]);
    }
  }

  // 高亮特定路段
  highlightSegment(segmentId: string): void {
    const MODE_COLORS: Record<string, string> = {
      driving: '#1890ff',
      walking: '#52c41a',
      bicycling: '#faad14',
      elecbike: '#722ed1',
      transit: '#f759ab'
    };

    this.segmentOverlays.forEach(overlay => {
      if (overlay.CLASS_NAME === 'AMap.Polyline') {
        const extData = overlay.getExtData();
        if (extData && extData.segmentId === segmentId) {
          // 高亮选中路段
          overlay.setOptions({
            strokeWeight: 8,
            strokeOpacity: 1,
            zIndex: 100
          });
        } else {
          // 其他路段变灰
          overlay.setOptions({
            strokeWeight: 3,
            strokeOpacity: 0.3,
            zIndex: 1
          });
        }
      }
    });
  }

  // 恢复所有路段正常显示
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

  // 驾车路线
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
  async getBicyclingRoute(
    startPoint: [number, number], 
    endPoint: [number, number]
  ): Promise<RouteResult> {
    try {
      await this.ensurePluginsLoaded();
    } catch (error) {
      return {
        mode: 'bicycling',
        distance: 0,
        duration: 0,
        success: false,
        error: '路线规划插件加载失败'
      };
    }

    return new Promise((resolve) => {
      const bicycling = new (window as any).AMap.Bicycling({
        map: null,
        autoFitView: false
      });

      bicycling.search(startPoint, endPoint, (status: string, result: any) => {
        if (status === 'complete' && result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          resolve({
            mode: 'bicycling',
            distance: route.distance,
            duration: route.time,
            success: true
          });
        } else {
          resolve({
            mode: 'bicycling',
            distance: 0,
            duration: 0,
            success: false,
            error: '骑行路线查询失败'
          });
        }
      });
    });
  }

  // 电动车路线（需要特殊权限）
  async getElecBikeRoute(
    startPoint: [number, number], 
    endPoint: [number, number]
  ): Promise<RouteResult> {
    try {
      await this.ensurePluginsLoaded();
    } catch (error) {
      return {
        mode: 'elecbike',
        distance: 0,
        duration: 0,
        success: false,
        error: '路线规划插件加载失败'
      };
    }
    return new Promise((resolve) => {
      const elecBike = new (window as any).AMap.ElectroBike({
        map: null,
        autoFitView: false
      });

      elecBike.search(startPoint, endPoint, (status: string, result: any) => {
        if (status === 'complete' && result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          resolve({
            mode: 'elecbike',
            distance: route.distance,
            duration: route.time,
            success: true
          });
        } else {
          resolve({
            mode: 'elecbike',
            distance: 0,
            duration: 0,
            success: false,
            error: '电动车路线查询失败'
          });
        }
      });
    });
  }

  // 公交路线
  async getTransitRoute(
    startPoint: [number, number], 
    endPoint: [number, number],
    city: string = '全国'
  ): Promise<RouteResult> {
    try {
      await this.ensurePluginsLoaded();
    } catch (error) {
      return {
        mode: 'transit',
        distance: 0,
        duration: 0,
        success: false,
        error: '路线规划插件加载失败'
      };
    }

    return new Promise((resolve) => {
      const transfer = new (window as any).AMap.Transfer({
        map: null,
        city: city === '全国' ? '北京' : city, // 公交查询需要具体城市
        autoFitView: false
      });

      transfer.search(startPoint, endPoint, (status: string, result: any) => {
        if (status === 'complete' && result.plans && result.plans.length > 0) {
          const plan = result.plans[0];
          resolve({
            mode: 'transit',
            distance: plan.distance,
            duration: plan.time,
            success: true
          });
        } else {
          resolve({
            mode: 'transit',
            distance: 0,
            duration: 0,
            success: false,
            error: '公交路线查询失败'
          });
        }
      });
    });
  }

  // 查询所有支持的出行方式
  async getAllRoutes(
    startPoint: [number, number], 
    endPoint: [number, number],
    city: string = '全国'
  ): Promise<RouteResult[]> {
    const results = await Promise.all([
      this.getDrivingRoute(startPoint, endPoint),
      this.getWalkingRoute(startPoint, endPoint),
      this.getBicyclingRoute(startPoint, endPoint),
      this.getElecBikeRoute(startPoint, endPoint),
      this.getTransitRoute(startPoint, endPoint, city)
    ]);

    return results;
  }

  // 添加公交换乘站点标记
  private addTransitStations(plan: any): void {
    if (!plan.segments) return;

    plan.segments.forEach((segment: any, index: number) => {
      if (segment.transit && segment.transit.lines && segment.transit.lines.length > 0) {
        // 添加换乘站点标记
        const line = segment.transit.lines[0];
        if (line.departure_stop && line.departure_stop.location) {
          const marker = new (window as any).AMap.Marker({
            position: [line.departure_stop.location.lng, line.departure_stop.location.lat],
            content: `<div style="background: #ff7875; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px;">换乘</div>`,
            offset: new (window as any).AMap.Pixel(-12, -6)
          });
          this.map.add(marker);
        }
      }
    });
  }

  drawRoute(
    startPoint: [number, number], 
    endPoint: [number, number], 
    mode: string = 'driving'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      // 先清除之前的路线
      this.clearRoutes();

      switch (mode) {
        case 'driving':
          this.currentRouteInstance = new (window as any).AMap.Driving({
            map: this.map,
            showTraffic: true,
            autoFitView: true,
            strokeColor: '#1890ff',
            strokeWeight: 6,
            strokeOpacity: 0.8
          });
          
          this.currentRouteInstance.search(startPoint, endPoint, (status: string, result: any) => {
            resolve(status === 'complete');
          });
          break;

        case 'walking':
          if ((window as any).AMap.Walking) {
            this.currentRouteInstance = new (window as any).AMap.Walking({
              map: this.map,
              autoFitView: true,
              strokeColor: '#52c41a',
              strokeWeight: 4,
              strokeOpacity: 0.8
            });
            
            this.currentRouteInstance.search(startPoint, endPoint, (status: string, result: any) => {
              resolve(status === 'complete');
            });
          } else {
            resolve(false);
          }
          break;

        case 'bicycling':
          if ((window as any).AMap.Bicycling) {
            this.currentRouteInstance = new (window as any).AMap.Bicycling({
              map: this.map,
              autoFitView: true,
              strokeColor: '#faad14',
              strokeWeight: 4,
              strokeOpacity: 0.8
            });
            
            this.currentRouteInstance.search(startPoint, endPoint, (status: string, result: any) => {
              resolve(status === 'complete');
            });
          } else {
            resolve(false);
          }
          break;

        case 'elecbike':
          if ((window as any).AMap.ElectroBike) {
            this.currentRouteInstance = new (window as any).AMap.ElectroBike({
              map: this.map,
              autoFitView: true,
              strokeColor: '#722ed1',
              strokeWeight: 4,
              strokeOpacity: 0.8
            });
            
            this.currentRouteInstance.search(startPoint, endPoint, (status: string, result: any) => {
              resolve(status === 'complete');
            });
          } else {
            resolve(false);
          }
          break;

        case 'transit':
          if ((window as any).AMap.Transfer) {
            // 公交路线需要特殊处理，显示换乘站点
            this.currentRouteInstance = new (window as any).AMap.Transfer({
              map: this.map,
              autoFitView: true,
              city: '北京', // 根据实际城市设置
              policy: (window as any).AMap.TransferPolicy.LEAST_TIME,
              panel: null, // 不使用默认面板
              hideMarkers: false // 显示站点标记
            });
            
            this.currentRouteInstance.search(startPoint, endPoint, (status: string, result: any) => {
              if (status === 'complete' && result.plans && result.plans.length > 0) {
                // 可以在这里添加自定义的换乘站点标记
                this.addTransitStations(result.plans[0]);
                resolve(true);
              } else {
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
          break;

        default:
          resolve(false);
      }
    });
  }
}