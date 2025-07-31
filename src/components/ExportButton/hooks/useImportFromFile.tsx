import { PlanItem } from "@/pages";
import { message } from "antd";
import React from "react";

export const useImportFromFile = (
    onImportData?: (items: PlanItem[]) => void
) => {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const handleImport = () => {
        fileInputRef.current?.click();
    };
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);

            if (data.spots && Array.isArray(data.spots)) {
              const importedItems: PlanItem[] = data.spots.map((spot: any, index: number) => ({
                id: `imported-${Date.now()}-${index}`,
                name: spot.name,
                location: spot.location || spot.name,
                region: spot.region || '未知',
                lat: spot.coordinates?.latitude || spot.lat,
                lng: spot.coordinates?.longitude || spot.lng,
                isStart: index === 0,
                isEnd: index === data.spots.length - 1,
                mode: spot.transportMode || spot.mode || 'driving',
                checked: true
              }));

              if (onImportData) {
                onImportData(importedItems);
                message.success(`成功导入 ${importedItems.length} 个景点`);
              } else {
                message.error('导入功能不可用');
              }
            } else {
              message.error('文件格式不正确，请选择正确的JSON文件');
            }
          } catch (error) {
            console.error('导入文件解析失败:', error);
            message.error('文件格式不正确，请检查JSON格式');
          }
        };
        reader.readAsText(file);
    };
    return{
        fileInputRef,
        handleImport,
        handleChange
    }
  };
