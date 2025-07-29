import React, { useEffect, useState } from 'react';
import { Layout, theme, Menu, message, Button, Flex, Collapse, Divider } from 'antd';
import PlanListPage from '@/layouts/PlanListPage';
import MapView from '@/components/MapView';
import { DeleteOutlined } from '@ant-design/icons';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } from '@/services/utiles';
import RichTextEditor from '@/components/NoteBook';

import type { CollapseProps } from 'antd';

const { Header, Content } = Layout;

export interface PlanItem {
  id: string;
  name: string;
  location: string;
  region: string;
  lat: number;
  lng: number;
  isStart: boolean;
  isEnd: boolean;
  mode: 'riding' | 'driving' | 'walking' | 'transfer';
  time?: string;
  checked: boolean;
}

const HomePage: React.FC = () => {
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [selectedKey, setSelectedKey] = useState('1');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>(['map']); // 控制折叠面板

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const { planItems: savedPlanItems, isSubmitted: savedIsSubmitted } = loadFromLocalStorage();
    if (savedPlanItems.length > 0) {
      setPlanItems(savedPlanItems);
      setIsSubmitted(savedIsSubmitted);
      message.success(`已恢复 ${savedPlanItems.length} 个景点的旅行计划`);
    }
  }, []);
  
  useEffect(() => {
    if (planItems.length > 0) {
      saveToLocalStorage(planItems, isSubmitted);
    }
  }, [planItems, isSubmitted]);

  const handleMenuClick = (key: string) => {
    setSelectedKey(key);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleEdit = () => {
    setIsSubmitted(false);
  };

  const handleImportData = (importedItems: PlanItem[]) => {
    setPlanItems(importedItems);
    setIsSubmitted(false);
    setSelectedKey('2');
  };

  const handleClearAll = () => {
    setPlanItems([]);
    setIsSubmitted(false);
    clearLocalStorage();
    message.success('已清除所有数据');
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareData = urlParams.get('share');
    
    if (shareData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(shareData));
        if (decoded.spots && Array.isArray(decoded.spots)) {
          const sharedItems: PlanItem[] = decoded.spots.map((spot: any, index: number) => ({
            id: `shared-${Date.now()}-${index}`,
            name: spot.name,
            location: spot.name,
            region: '未知',
            lat: spot.lat,
            lng: spot.lng,
            isStart: index === 0,
            isEnd: index === decoded.spots.length - 1,
            mode: spot.mode || 'driving',
            checked: true
          }));
          
          setPlanItems(sharedItems);
          setSelectedKey('2');
          setIsSubmitted(true);
          message.success('已导入分享的行程计划');
          
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error('解析分享链接失败:', error);
        message.error('分享链接格式不正确');
      }
    }
  }, []);

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return (
          <PlanListPage
            planItems={planItems}
            setPlanItems={setPlanItems}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmit}
            onEdit={handleEdit}
            onImportData={handleImportData}
          />
        );

      case '2':
        const collapseItems: CollapseProps['items'] = [
          {
            key: 'note',
            label: (
              <span style={{ fontWeight: 500 }}>
                📝 旅行笔记
              </span>
            ),
            children: <RichTextEditor />,
          },
          {
            key: 'map',
            label: (
              <span style={{ fontWeight: 500 }}>
                🗺️ 旅行地图
              </span>
            ),
            children: (
              <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                <MapView
                  planItems={planItems}
                  isSubmitted={isSubmitted}
                  city={planItems.length > 0 ? planItems[0].region : '杭州'}
                  onImportData={handleImportData}
                />
              </div>
            ),
          }
        ];

        return (
          <Flex gap="middle" vertical>
            <Collapse
              activeKey={activeCollapseKeys}
              onChange={(keys) => setActiveCollapseKeys(keys as string[])}
              bordered={false}
              expandIconPosition="end"
              style={{ background: '#fff', borderRadius: '8px' }}
              collapsible="header"
            >
              {collapseItems.map((item) => (
                <Collapse.Panel key={String(item.key)} header={item.label}>
                  {item.children}
                </Collapse.Panel>
              ))}
            </Collapse>
          </Flex>
        );

      default:
        return null;
    }
  };

  return (
    <Layout style={{ height: '100vh', minWidth: '40vh', overflow: 'hidden' }}>
      <Header style={{ display: 'flex', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
        <div className="demo-logo" style={{ color: 'white', marginRight: 20 }}>
          自定义旅行计划
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => handleMenuClick(key)}
          items={[
            { key: '1', label: '愿望景点单' },
            { key: '2', label: '在线记事本' },
          ]}
          style={{ flex: 1, minWidth: 0 }}
        />

        {planItems.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              已保存 {planItems.length} 个景点
            </span>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleClearAll}
              style={{ color: 'rgba(255,255,255,0.7)' }}
              title="清除所有数据"
            >
              清除
            </Button>
          </div>
        )}
      </Header>

      <Content style={{ padding: '0 48px', flex: 1, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            background: colorBgContainer,
            padding: 24,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {renderContent()}
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;