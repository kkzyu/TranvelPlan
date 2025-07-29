import { RouteResult, RouteSegment } from '@/services/types'
import { ensurePluginsLoaded, isPluginAvailable } from './'

export class SingleRouteCalculationService {
    async calculateSingleSegment(
        startItem: any,
        endItem: any,
        mode: string,
        segmentId: string
    ): Promise<RouteSegment> {
        try {
            let routeResult: RouteResult & { polyline?: [number, number][] };

            switch (mode) {
                case 'driving':
                    routeResult = await this.getDrivingRouteWithPolyline([startItem.lng, startItem.lat], [endItem.lng, endItem.lat]);
                    break;
                case 'walking':
                    routeResult = await this.getWalkingRouteWithPolyline([startItem.lng, startItem.lat], [endItem.lng, endItem.lat]);
                    break;
                case 'riding':
                    routeResult = await this.getRidingRouteWithPolyline([startItem.lng, startItem.lat], [endItem.lng, endItem.lat]);
                    break;
                case 'transfer':
                    routeResult = await this.getTransferRouteWithPolyline([startItem.lng, startItem.lat], [endItem.lng, endItem.lat], '杭州');
                    break;
                default:
                    routeResult = await this.getDrivingRouteWithPolyline([startItem.lng, startItem.lat], [endItem.lng, endItem.lat]);
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
                polyline: routeResult.polyline || [],
                success: routeResult.success,
                error: routeResult.error
            };
        } catch (error) {
            console.error(`路段计算失败:`, error);
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
                distance: 0,
                duration: 0,
                mode: mode as any,
                polyline: [],
                success: false,
                error: '路线计算失败'
            };
        }
    }



    private async getDrivingRouteWithPolyline(
        startPoint: [number, number], 
        endPoint: [number, number]
    ): Promise<RouteResult & { polyline: [number, number][] }> {
        try {
            await ensurePluginsLoaded();
        } catch (error) {
            return {
                mode: 'driving',
                distance: 0,
                duration: 0,
                success: false,
                error: '驾车路线规划插件加载失败',
                polyline: []
            };
        }

        if (!isPluginAvailable('driving')) {
            return {
                mode: 'driving',
                distance: 0,
                duration: 0,
                success: false,
                error: '驾车路线规划插件不可用',
                polyline: []
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
                    const polyline = this.extractPolylineFromRoute(route);
                    
                    resolve({
                        mode: 'driving',
                        distance: route.distance,
                        duration: route.time,
                        success: true,
                        polyline: polyline
                    });
                } else {
                    resolve({
                        mode: 'driving',
                        distance: 0,
                        duration: 0,
                        success: false,
                        error: '驾车路线查询失败',
                        polyline: []
                    });
                }
            });
        });
    }

    private async getWalkingRouteWithPolyline(
        startPoint: [number, number], 
        endPoint: [number, number]
    ): Promise<RouteResult & { polyline: [number, number][] }> {
        try {
            await ensurePluginsLoaded();
        } catch (error) {
            return {
                mode: 'walking',
                distance: 0,
                duration: 0,
                success: false,
                error: '步行路线规划插件加载失败',
                polyline: []
            };
        }

        if (!isPluginAvailable('walking')) {
            return {
                mode: 'walking',
                distance: 0,
                duration: 0,
                success: false,
                error: '步行路线规划插件不可用',
                polyline: []
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
                    const polyline = this.extractPolylineFromRoute(route);
                    
                    resolve({
                        mode: 'walking',
                        distance: route.distance,
                        duration: route.time,
                        success: true,
                        polyline: polyline
                    });
                } else {
                    resolve({
                        mode: 'walking',
                        distance: 0,
                        duration: 0,
                        success: false,
                        error: '步行路线查询失败',
                        polyline: []
                    });
                }
            });
        });
    }

    private async getRidingRouteWithPolyline(
        startPoint: [number, number], 
        endPoint: [number, number]
    ): Promise<RouteResult & { polyline: [number, number][] }> {
        try {
            await ensurePluginsLoaded();
        } catch (error) {
            return {
                mode: 'riding',
                distance: 0,
                duration: 0,
                success: false,
                error: '骑行路线规划插件加载失败',
                polyline: []
            };
        }

        if (!isPluginAvailable('riding')) {
            return {
                mode: 'riding',
                distance: 0,
                duration: 0,
                success: false,
                error: '骑行路线规划插件不可用',
                polyline: []
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
                    const polyline = this.extractPolylineFromRoute(route);
                    
                    resolve({
                        mode: 'riding',
                        distance: route.distance,
                        duration: route.time || route.duration,
                        success: true,
                        polyline: polyline
                    });
                } else {
                    resolve({
                        mode: 'riding',
                        distance: 0,
                        duration: 0,
                        success: false,
                        error: '骑行路线查询失败',
                        polyline: []
                    });
                }
            });
        });
    }

    private async getTransferRouteWithPolyline(
        startPoint: [number, number], 
        endPoint: [number, number],
        city: string = '杭州'
    ): Promise<RouteResult & { polyline: [number, number][] }> {
        try {
            await ensurePluginsLoaded();
        } catch (error) {
            return {
                mode: 'transfer',
                distance: 0,
                duration: 0,
                success: false,
                error: '公交路线规划插件加载失败',
                polyline: []
            };
        }

        if (!isPluginAvailable('transfer')) {
            return {
                mode: 'transfer',
                distance: 0,
                duration: 0,
                success: false,
                error: '公交路线规划插件不可用',
                polyline: []
            };
        }

        return new Promise((resolve) => {
            const transfer = new (window as any).AMap.Transfer({
                map: null,
                city: city,
                autoFitView: false
            });

            transfer.search(startPoint, endPoint, (status: string, result: any) => {
                if (status === 'complete' && result.plans && result.plans.length > 0) {
                    const plan = result.plans[0];
                    const polyline = this.extractPolylineFromRoute(plan);
                    
                    resolve({
                        mode: 'transfer',
                        distance: plan.distance,
                        duration: plan.time,
                        success: true,
                        polyline: polyline
                    });
                } else {
                    resolve({
                        mode: 'transfer',
                        distance: 0,
                        duration: 0,
                        success: false,
                        error: '公交路线查询失败',
                        polyline: []
                    });
                }
            });
        });
    }

    private extractPolylineFromRoute(route: any): [number, number][] {
    const points: [number, number][] = [];

    if (route.rides && Array.isArray(route.rides)) {
        route.rides.forEach((ride: any) => {
            if (ride.path && Array.isArray(ride.path)) {
                ride.path.forEach((point: any) => {
                    const pos = this.extractPosition(point);
                    if (pos) {
                        points.push(pos);
                    }
                });
            }
        });
        return points;
    }
    
    if (route.steps && Array.isArray(route.steps)) {
        route.steps.forEach((step: any, index: number) => {
            if (step.polyline) {
                const stepPoints = this.parsePolyline(step.polyline);
                points.push(...stepPoints);
            }

            else if (step.path && Array.isArray(step.path)) {
                step.path.forEach((point: any, pointIndex: number) => {
                    if (point && typeof point === 'object') {
                        let lng, lat;
                        if (point.lng !== undefined && point.lat !== undefined) {
                            lng = point.lng;
                            lat = point.lat;
                        } else if (point.longitude !== undefined && point.latitude !== undefined) {
                            lng = point.longitude;
                            lat = point.latitude;
                        } else if (point.x !== undefined && point.y !== undefined) {
                            lng = point.x;
                            lat = point.y;
                        } else if (Array.isArray(point) && point.length >= 2) {
                            lng = point[0];
                            lat = point[1];
                        } else if (point.getPosition && typeof point.getPosition === 'function') {
                            const pos = point.getPosition();
                            lng = pos.getLng();
                            lat = pos.getLat();
                        }
                        
                        if (lng !== undefined && lat !== undefined && !isNaN(lng) && !isNaN(lat)) {
                            points.push([lng, lat]);
                        }
                    }
                });
            }

            else {
                if (step.start_location) {
                    const startPos = this.extractPosition(step.start_location);
                    if (startPos) {
                        points.push(startPos);
                    }
                }
                if (step.end_location) {
                    const endPos = this.extractPosition(step.end_location);
                    if (endPos) {
                        points.push(endPos);
                    }
                }
            }
        });
    } 

    else if (route.path && Array.isArray(route.path)) {
        route.path.forEach((point: any, index: number) => {
            const pos = this.extractPosition(point);
            if (pos) {
                points.push(pos);
            }
        });
    }
    else if (route.polyline) {
        const routePoints = this.parsePolyline(route.polyline);
        points.push(...routePoints);
    }
    
    return points;
}

private extractPosition(positionObj: any): [number, number] | null {
    if (!positionObj) return null;
    
    let lng, lat;
    
    if (positionObj.lng !== undefined && positionObj.lat !== undefined) {
        lng = positionObj.lng;
        lat = positionObj.lat;
    } else if (positionObj.longitude !== undefined && positionObj.latitude !== undefined) {
        lng = positionObj.longitude;
        lat = positionObj.latitude;
    } else if (positionObj.x !== undefined && positionObj.y !== undefined) {
        lng = positionObj.x;
        lat = positionObj.y;
    } else if (Array.isArray(positionObj) && positionObj.length >= 2) {
        lng = positionObj[0];
        lat = positionObj[1];
    } else if (positionObj.getPosition && typeof positionObj.getPosition === 'function') {
        const pos = positionObj.getPosition();
        lng = pos.getLng();
        lat = pos.getLat();
    } else if (positionObj.getLng && typeof positionObj.getLng === 'function') {
        lng = positionObj.getLng();
        lat = positionObj.getLat();
    }
    
    if (lng !== undefined && lat !== undefined && !isNaN(lng) && !isNaN(lat)) {
        return [lng, lat];
    }
    
    return null;
}

private parsePolyline(polylineStr: string): [number, number][] {
    if (!polylineStr || typeof polylineStr !== 'string') {
        return [];
    }

    try {
        let points: string[];
        
        if (polylineStr.includes(';')) {
            points = polylineStr.split(';');
        } else if (polylineStr.includes('|')) {
            points = polylineStr.split('|');
        } else if (polylineStr.includes(' ')) {
            points = polylineStr.split(' ');
        } else {
            points = [polylineStr];
        }

        const coordinates: [number, number][] = [];

        for (let i = 0; i < points.length; i++) {
            const point = points[i].trim();
            if (!point) continue;
            
            const parts = point.split(',');
            if (parts.length >= 2) {
                const lng = parseFloat(parts[0]);
                const lat = parseFloat(parts[1]);

                if (!isNaN(lng) && !isNaN(lat) && 
                    lng >= -180 && lng <= 180 && 
                    lat >= -90 && lat <= 90) {
                    coordinates.push([lng, lat]);
                }
            }
        }
        return coordinates;
    } catch (error) {
        return [];
    }
}
}

export const singleRouteService = new SingleRouteCalculationService();

export const calculateSingleSegment = async (
    startItem: any,
    endItem: any,
    mode: string,
    segmentId: string
): Promise<RouteSegment> => {
    return singleRouteService.calculateSingleSegment(startItem,endItem,mode,segmentId);
}
