import PlanList from '@/components/PlanList';
import MapView from '@/components/MapView';
import { mockPlanItems } from '@/mocks/data';
import { Flex } from 'antd'
import React,{useState} from 'react';
import { PlanItem } from '@/pages';

const PlanListPage:React.FC=()=>{
    const [planItems, setPlanItems] = useState<PlanItem[]>(mockPlanItems);
    return(
        <Flex gap='large' vertical={false} justify='center'>
            <PlanList items={planItems} setItems={setPlanItems} />
            <MapView planItems={planItems} />
        </Flex>
    )
}
export default PlanListPage;