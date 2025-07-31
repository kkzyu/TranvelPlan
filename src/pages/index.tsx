import React, { useEffect, useState } from 'react';
import { Layout, theme, message } from 'antd';
import PlanListPage from '@/layouts/PlanListPage';
import styles from './index.less'

import HeaderBar from '@/components/HeaderBar';
import { clearLocalStorage, loadFromLocalStorage, saveToLocalStorage } from '@/services/utils';
import { sharedLinkImport } from './hooks/useSharedLinkImport';
import TravelMap from '@/layouts/TravelMap';

const { Content } = Layout;

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
  // HeaderBar, PlanListPage, TravelMap
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  // HeaderBar
  const [selectedKey, setSelectedKey] = useState('1');
  // PlanListPage
  const [isSubmitted, setIsSubmitted] = useState(false);
  // TravelMap
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>(['map']); 
  // Content样式
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 从 URL 参数中解析并导入一个“分享的旅行计划”
  sharedLinkImport(setPlanItems, setSelectedKey, setIsSubmitted);

  // 存储：从localStorage恢复数据（只在初始化时）
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved.planItems.length > 0) {
      setPlanItems(saved.planItems);
      setIsSubmitted(saved.isSubmitted);
      message.success(`已恢复 ${saved.planItems.length} 个景点的旅行计划`);
    }
  }, []);
      
  // 存储：自动保存到 localStorage
  useEffect(() => {
      if (planItems.length > 0) {
        saveToLocalStorage(planItems, isSubmitted);
      }
    }, [planItems, isSubmitted]);

  // HeaderBar--清除数据
  const handleClearAll = () => {
      setPlanItems([]);
      setIsSubmitted(false);
      clearLocalStorage();
      message.success('已清除所有数据');
    };

  // HeaderBar--切换导航
  const handleMenuSelect = (key: string) => {
    setSelectedKey(key);
  };

  // PlanListPage--导入数据
  const handleImportData = (importedItems: PlanItem[]) => {
    setPlanItems(importedItems);
    setIsSubmitted(false);
    setSelectedKey('2');
  };

  // PlanListPage--提交状态
  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  // PlanListPage--编辑状态
  const handleEdit = () => {
    setIsSubmitted(false);
  };

  // 加载导航内容
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
        return (
          <TravelMap 
            planItems={planItems}
            isSubmitted={isSubmitted}
            activeKeys={activeCollapseKeys}
            onActiveKeysChange={setActiveCollapseKeys}
            onImportData={handleImportData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout className={styles.layout} >
      <HeaderBar 
        selectedKey={selectedKey}
        planItems={planItems}
        onMenuSelect={handleMenuSelect}
        onClearAll={handleClearAll}
      />

      <Content className={styles.contentContainer}>
        <div className={styles.content}
        style={{
            backgroundColor: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {renderContent()}
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;