import React from 'react';
import { Row, Col } from 'antd';
import PlanList from '@/components/PlanList';
import MapView from '@/components/MapView';
import { PlanItem } from '@/pages/index';

interface PlanListPageProps {
  planItems: PlanItem[];
  setPlanItems: React.Dispatch<React.SetStateAction<PlanItem[]>>;
  isSubmitted: boolean;
  onSubmit: () => void;
  onEdit: () => void;
}

const PlanListPage: React.FC<PlanListPageProps> = ({
  planItems,
  setPlanItems,
  isSubmitted,
  onSubmit,
  onEdit
}) => {
  return (
    <Row gutter={[16, 16]} style={{ height: '100%' }}>
      <Col xs={24} lg={14} style={{ height: '100%' }}>
        <PlanList 
          items={planItems}
          setItems={setPlanItems}
          isSubmitted={isSubmitted}
          onSubmit={onSubmit}
          onEdit={onEdit}
        />
      </Col>
      <Col xs={24} lg={10} style={{ height: '100%' }}>
        <MapView 
          planItems={planItems}
          isSubmitted={isSubmitted}
          city={planItems.length > 0 ? planItems[0].region : '杭州'}
        />
      </Col>
    </Row>
  );
};

export default PlanListPage;