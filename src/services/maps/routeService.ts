import { RouteCalculationService } from './routeCalculation';
import { RouteDrawingService } from './routeDrawing';
import { RouteResult, CompleteRouteResult } from '@/services/types';

export class RouteService {
    private calculationService: RouteCalculationService;
    private drawingService: RouteDrawingService;

    constructor(map: any) {
        this.calculationService = new RouteCalculationService();
        this.drawingService = new RouteDrawingService(map);
    }

    async getAllRoutes(startPoint: [number, number], endPoint: [number, number], city: string): Promise<RouteResult[]> {
        return this.calculationService.getAllRoutes(startPoint, endPoint, city);
    }

    async calculateCompleteRouteWithModes(checkedItems: any[]): Promise<CompleteRouteResult> {
        return this.calculationService.calculateCompleteRouteWithModes(checkedItems);
    }

    async drawRoute(startPoint: [number, number], endPoint: [number, number], mode: string): Promise<boolean> {
        return this.drawingService.drawRoute(startPoint, endPoint, mode);
    }

    drawCompleteRoute(completeRouteResult: CompleteRouteResult): void {
        this.drawingService.drawCompleteRoute(completeRouteResult);
    }

    clearAllRoutes(): void {
        this.drawingService.clearAllRoutes();
    }

    highlightSegment(segmentId: string): void {
        this.drawingService.highlightSegment(segmentId);
    }

    resetSegmentHighlight(): void {
        this.drawingService.resetSegmentHighlight();
    }
}