import { ImportOutlined, FileTextOutlined, FileExcelOutlined, DownloadOutlined } from "@ant-design/icons";
import { message, Dropdown, Button } from "antd";
import { useExportToTxt, useExportToJson, useExportToCsv } from "./hooks";
import { useImportFromFile } from "./hooks/useImportFromFile";
import { generateItineraryText } from "../../services/utils/itineraryText";
import { PlanItem } from "@/pages";
import { CompleteRouteResult } from "@/services/types";
interface ExportItineraryProps {
  planItems: PlanItem[];
  completeRoute: CompleteRouteResult | null;
  isSubmitted: boolean;
  onImportData: (data: PlanItem[]) => void;
}

const ExportItinerary: React.FC<ExportItineraryProps> = ({
  planItems,
  completeRoute,
  isSubmitted,
  onImportData,
}) => {
  const { handleImport, fileInputRef, handleChange } = useImportFromFile(onImportData);
  
  const copyToClipboard = async () => {
    try {
      const content = generateItineraryText(planItems, completeRoute, isSubmitted);
      await navigator.clipboard.writeText(content);
      message.success('行程已复制到剪贴板');
    } catch (error) {
      message.error('复制失败，请手动复制');
    }
  };

  const generateShareLink = () => {
    try {
      const checkedItems = planItems.filter((item) => item.checked);
      const shareData = {
        spots: checkedItems.map((item) => ({
          name: item.name,
          lat: item.lat,
          lng: item.lng,
          mode: item.mode,
        })),
      };

      const encodedData = encodeURIComponent(JSON.stringify(shareData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;

      navigator.clipboard.writeText(shareUrl);
      message.success('分享链接已复制到剪贴板');
    } catch (error) {
      message.error('生成分享链接失败');
    }
  };

  const handleMenuClick = (e: { key: string }) => {
    switch (e.key) {
      case 'import':
        handleImport();
        break;
      case 'txt':
        useExportToTxt(planItems, completeRoute, isSubmitted);
        break;
      case 'json':
        useExportToJson(planItems, completeRoute);
        break;
      case 'csv':
        useExportToCsv(planItems, completeRoute);
        break;
      case 'copy':
        copyToClipboard();
        break;
      case 'share':
        generateShareLink();
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      key: 'import',
      label: '从文件导入',
      icon: <ImportOutlined />,
    },
    {
      key: 'txt',
      label: '导出为文本文件',
      icon: <FileTextOutlined />,
    },
    {
      key: 'json',
      label: '导出为JSON文件',
      icon: <FileTextOutlined />,
    },
    {
      key: 'csv',
      label: '导出为CSV文件',
      icon: <FileExcelOutlined />,
    },
    {
      key: 'copy',
      label: '复制到剪贴板',
      icon: <FileTextOutlined />,
    },
    {
      key: 'share',
      label: '生成分享链接',
      icon: <FileTextOutlined />,
    },
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
            },
          ],
          onClick: handleMenuClick,
        }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Button type="primary" size="small" icon={<ImportOutlined />}>
          导入
        </Button>
      </Dropdown>
    );
  }

  return (
    <>
      <input
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleChange}
      />

      <Dropdown
        menu={{
          items: menuItems,
          onClick: handleMenuClick,
        }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Button type="primary" size="small" icon={<DownloadOutlined />}>
          导出
        </Button>
      </Dropdown>
    </>
  );
};

export default ExportItinerary;