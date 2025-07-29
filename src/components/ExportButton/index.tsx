import React from 'react';
import { Button, Dropdown, message } from 'antd';
import { DownloadOutlined, FileTextOutlined, FileExcelOutlined, ImportOutlined } from '@ant-design/icons';
import { PlanItem } from '@/pages/index';
import { CompleteRouteResult } from '@/services/types';
import { MODE_NAMES } from '@/constants/mapConfig';

interface ExportItineraryProps {
  planItems: PlanItem[];
  completeRoute: CompleteRouteResult | null;
  isSubmitted: boolean;
  onImportData?: (PlanItem: PlanItem[]) => void;
}

const ExportItinerary: React.FC<ExportItineraryProps> = ({ 
  planItems, 
  completeRoute, 
  isSubmitted,
  onImportData 
}) => {
  const generateItineraryText = () => {
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

  const exportToTxt = () => {
    try {
      const content = generateItineraryText();
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `旅行行程计划_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('行程已导出为文本文件');
    } catch (error) {
      console.error('导出文本文件失败:', error);
      message.error('导出失败');
    }
  };

  const exportToJson = () => {
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

  const exportToCsv = () => {
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

  const importFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
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
      }
    };
    input.click();
  };

  const copyToClipboard = async () => {
    try {
      const content = generateItineraryText();
      await navigator.clipboard.writeText(content);
      message.success('行程已复制到剪贴板');
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      message.error('复制失败，请手动复制');
    }
  };

  const generateShareLink = () => {
    try {
      const checkedItems = planItems.filter(item => item.checked);
      const shareData = {
        spots: checkedItems.map(item => ({
          name: item.name,
          lat: item.lat,
          lng: item.lng,
          mode: item.mode
        }))
      };
      
      const encodedData = encodeURIComponent(JSON.stringify(shareData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
      
      navigator.clipboard.writeText(shareUrl);
      message.success('分享链接已复制到剪贴板');
    } catch (error) {
      console.error('生成分享链接失败:', error);
      message.error('生成分享链接失败');
    }
  };

  const menuItems = [
    {
      key: 'import',
      label: '从文件导入',
      icon: <ImportOutlined />,
      onClick: importFromFile
    },
    {
      key: 'txt',
      label: '导出为文本文件',
      icon: <FileTextOutlined />,
      onClick: exportToTxt
    },
    {
      key: 'json',
      label: '导出为JSON文件',
      icon: <FileTextOutlined />,
      onClick: exportToJson
    },
    {
      key: 'csv',
      label: '导出为CSV文件',
      icon: <FileExcelOutlined />,
      onClick: exportToCsv
    },
    {
      key: 'copy',
      label: '复制到剪贴板',
      icon: <FileTextOutlined />,
      onClick: copyToClipboard
    },
    {
      key: 'share',
      label: '生成分享链接',
      icon: <FileTextOutlined />,
      onClick: generateShareLink
    }
  ];

  if (!isSubmitted || !completeRoute || completeRoute.segments.length === 0) {
    return (
      <Dropdown 
        menu={{ 
          items: [
            {
              key: 'import',
              label: '从文件导入',
              icon: <ImportOutlined />,
              onClick: importFromFile
            }
          ]
        }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Button 
          type="primary"
          size='small'
          icon={<ImportOutlined />}
          title="导入行程数据"
        >
          导入
        </Button>
      </Dropdown>
    );
  }

  return (
    <Dropdown 
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button 
        type="primary" 
        size='small'
        icon={<DownloadOutlined />}
      >
        导出
      </Button>
    </Dropdown>
  );
};

export default ExportItinerary;