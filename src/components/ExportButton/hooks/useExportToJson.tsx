import { MODE_NAMES } from "@/constants/mapConfig";
import { PlanItem } from "@/pages";
import { CompleteRouteResult } from "@/services/types";
import { message } from "antd";

export const useExportToJson = (
    planItems: PlanItem[],
    completeRoute: CompleteRouteResult | null,
) => {
    try {
      const checkedItems = planItems.filter(item => item.checked);
      const exportData = {
        metadata: {
          title: '旅行行程计划',
          exportTime: new Date().toISOString(),
          version: '1.0'
        },
        summary: {
          totalSpots: checkedItems.length,
          totalSegments: completeRoute?.segments.length || 0,
          totalDistance: completeRoute?.totalDistance || 0,
          totalDuration: completeRoute?.totalDuration || 0,
          successSegments: completeRoute?.segments.filter(s => s.success).length || 0
        },
        spots: checkedItems.map((item, index) => ({
          order: index + 1,
          id: item.id,
          name: item.name,
          location: item.location,
          region: item.region,
          coordinates: {
            latitude: item.lat,
            longitude: item.lng
          },
          transportMode: item.mode,
          transportModeName: MODE_NAMES[item.mode]
        })),
        routes: completeRoute?.segments.map((segment, index) => ({
          segmentId: segment.id,
          order: index + 1,
          from: {
            name: segment.startPoint.name,
            coordinates: segment.startPoint.position
          },
          to: {
            name: segment.endPoint.name,
            coordinates: segment.endPoint.position
          },
          distance: segment.distance,
          duration: segment.duration,
          mode: segment.mode,
          modeName: MODE_NAMES[segment.mode],
          success: segment.success,
          error: segment.error,
          polylinePoints: segment.polyline?.length || 0
        })) || []
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json;charset=utf-8' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `旅行行程计划_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('行程已导出为JSON文件');
    } catch (error) {
      console.error('导出JSON文件失败:', error);
      message.error('导出失败');
    }
  };
