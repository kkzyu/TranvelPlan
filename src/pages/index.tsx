import React, { useState } from 'react';
import { Layout, theme, Menu } from 'antd';
import PlanListPage from '@/layouts/PlanListPage';
import MapView from '@/components/MapView';
import ExportButton from '@/components/ExportButton';

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
  mode: 'riding' | 'driving' | 'walking' | 'riding' | 'transfer';
  time?: string;
  checked: boolean;
}

const HomePage: React.FC = () => {
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [selectedKey, setSelectedKey] = useState('1');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (key: string) => {
    setSelectedKey(key);
  };

  const handleSubmit=()=>{
    setIsSubmitted(true);
  }

  const handleEdit=()=>{
    setIsSubmitted(false);
  }

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <PlanListPage
          planItems={planItems}
          setPlanItems={setPlanItems}
          isSubmitted={isSubmitted}
          onSubmit={handleSubmit}
          onEdit={handleEdit}
        />;
      case '2':
        return <MapView 
          planItems={planItems} 
          isSubmitted={isSubmitted}
          city={planItems.length > 0 ? planItems[0].region : '杭州'}
        />;
      default:
        return null;
    }
  };

  return (
    <Layout style={{ height: '100vh', minWidth:'40vh', overflow: 'hidden' }}>
      <Header style={{ display: 'flex', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
        <div className="demo-logo" style={{ color: 'white', marginRight: 20 }}>自定义旅行计划</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => handleMenuClick(key)}
          items={[
            { key: '1', label: '愿望景点单' },
            { key: '2', label: '协作记事本' },
          ]}
          style={{ flex: 1, minWidth: 0 }}
        />
        {selectedKey === '1' && (
          <ExportButton planItems={planItems} />
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