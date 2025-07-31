import { MODE_NAMES } from "@/constants/mapConfig";
import { PlanItem } from "@/pages";
import { CompleteRouteResult } from "@/services/types";
import { message } from "antd";

export const useExportToCsv = (
    planItems: PlanItem[],
    completeRoute: CompleteRouteResult | null,
) => {
    try {
      const checkedItems = planItems.filter(item => item.checked);

      let csvContent = '\uFEFF'; // BOM for UTF-8
      csvContent += '序号,景点名称,位置,地区,纬度,经度,出行方式,出行方式名称\n';

      checkedItems.forEach((item, index) => {
        csvContent += `${index + 1},"${item.name}","${item.location}","${item.region}",${item.lat},${item.lng},"${item.mode}","${MODE_NAMES[item.mode]}"\n`;
      });

      if (completeRoute && completeRoute.segments.length > 0) {
        csvContent += '\n路段序号,起点,终点,距离(米),时间(秒),出行方式,出行方式名称,状态,错误信息\n';
        completeRoute.segments.forEach((segment, index) => {
          csvContent += `${index + 1},"${segment.startPoint.name}","${segment.endPoint.name}",${segment.distance},${segment.duration},"${segment.mode}","${MODE_NAMES[segment.mode]}","${segment.success ? '成功' : '失败'}","${segment.error || ''}"\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `旅行行程计划_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('行程已导出为CSV文件');
    } catch (error) {
      console.error('导出CSV文件失败:', error);
      message.error('导出失败');
    }
  };