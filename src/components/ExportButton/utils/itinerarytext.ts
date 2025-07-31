import { MODE_NAMES } from "@/constants/mapConfig";
import { PlanItem } from "@/pages";
import { CompleteRouteResult } from "@/services/types";

export const generateItineraryText = (
  planItems: PlanItem[],
  completeRoute: CompleteRouteResult | null,
  isSubmitted: boolean
): string => {
    if (!isSubmitted || !completeRoute) {
      return '';
    }
    const checkedItems = planItems.filter(item => item.checked);
        
        let content = `旅行行程计划\n`;
        content += `生成时间: ${new Date().toLocaleString()}\n`;
        content += `=====================================\n\n`;
    
        content += `行程概览:\n`;
        content += `景点数量: ${checkedItems.length}个\n`;
        content += `路段数量: ${completeRoute.segments.length}段\n`;
        content += `总距离: ${(completeRoute.totalDistance/1000).toFixed(1)}km\n`;
        content += `总时间: ${Math.ceil(completeRoute.totalDuration/60)}分钟\n`;
        content += `成功路段: ${completeRoute.segments.filter(s => s.success).length}/${completeRoute.segments.length}段\n\n`;
    
        content += `景点列表:\n`;
        checkedItems.forEach((item, index) => {
            content += `${index + 1}. ${item.name}\n`;
            content += `   位置: ${item.location}\n`;
            content += `   坐标: ${item.lat}, ${item.lng}\n`;
            content += `   出行方式: ${MODE_NAMES[item.mode]}\n\n`;
        });
    
        content += `路线详情:\n`;
        completeRoute.segments.forEach((segment, index) => {
            content += `路段 ${index + 1}: ${segment.startPoint.name} → ${segment.endPoint.name}\n`;
            if (segment.success) {
            content += `   距离: ${(segment.distance/1000).toFixed(1)}km\n`;
            content += `   时间: ${Math.ceil(segment.duration/60)}分钟\n`;
            content += `   方式: ${MODE_NAMES[segment.mode]}\n`;
            } else {
            content += `   状态: 计算失败 - ${segment.error}\n`;
            }
            content += `\n`;
        });
        
        return content;
};