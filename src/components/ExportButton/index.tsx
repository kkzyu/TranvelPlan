// src/components/ExportButton.tsx
import { Button } from 'antd';
import { utils, writeFile } from 'xlsx';
import { PlanItem } from '@/pages/index';

export default function ExportButton({ planItems }: { planItems: PlanItem[] }) {
  const handleExport = () => {
    const checkedItems = planItems.filter(item => item.checked);
    const exportData = checkedItems.map(item => ({
      景点名称: item.name,
      是否前往: item.checked ? '是' : '否',
      出行方式: ({ riding: '骑行', driving: '电动车', walking: '步行' })[item.mode],
      建议时间: item.time || '-',
      是否起点: item.isStart ? '是' : '否',
      是否终点: item.isEnd ? '是' : '否'
    }));

    // 添加路线信息
    const ws = utils.json_to_sheet(exportData);
    const routes = [];
    for (let i = 0; i < checkedItems.length - 1; i++) {
      const mode = checkedItems[i].mode;
      routes.push({
        '行程': `${checkedItems[i].name} → ${checkedItems[i+1].name}`,
        '距离': mode === 'driving' ? '3.0km' : mode === 'riding' ? '1.8km' : '1.2km',
        '预计时间': mode === 'driving' ? '10分钟' : mode === 'riding' ? '20分钟' : '15分钟'
      });
    }
    
    const routeWs = utils.json_to_sheet(routes);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, '景点清单');
    utils.book_append_sheet(wb, routeWs, '路线详情');
    
    writeFile(wb, `旅行计划_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <Button 
      type="primary" 
      onClick={handleExport}
      disabled={planItems.filter(p => p.checked).length === 0}
    >
      导出计划表
    </Button>
  );
}