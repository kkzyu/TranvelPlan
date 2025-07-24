// src/components/PlanList.tsx
import { Checkbox, Modal, Flex, Button, Select, Table, TableColumnsType } from 'antd';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSensors, useSensor, PointerSensor, DndContext } from '@dnd-kit/core'
import { PlanItem } from '@/pages/index';
import { CSS } from '@dnd-kit/utilities'
import React, { useState } from 'react';
import PlaceSearchInput from '../PlaceSearchInput';
import SelectCity from './SelectCity';
import { Place } from 'types';

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement>{
  'data-row-key':string;
}

const Row:React.FC<RowProps> = ({'data-row-key':rowKey,...props})=>{
  const {attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id:rowKey,
  });
  const style:React.CSSProperties={
    ...props.style,
    transform:CSS.Translate.toString(transform),
    transition,
    cursor:'move',
    ...(isDragging ? {position:'relative',zIndex:9999,background:'#fafafa'}:{}),
  };
  return(
    <tr
      {...props}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-row-key={rowKey}
    />
  );
};
const PlanList = ({ 
  items, 
  setItems 
}: { 
  items: PlanItem[], 
  setItems: React.Dispatch<React.SetStateAction<PlanItem[]>> 
}) => {
  const [dataSource, setDataSource] = useState<PlanItem[]>(items);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place|null>(null);
  const [city, setCity] = useState('全国');

  React.useEffect(()=>{
    setDataSource(items);
  },[items]);

  const sensors = useSensors(
    useSensor(PointerSensor,{
      activationConstraint:{distance:5},
    })
  );

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if( active.id !== over?.id){
      const oldIndex = dataSource.findIndex((item) => item.id === active.id);
      const newIndex = dataSource.findIndex((item) => item.id === over.id);
      const sorted = arrayMove(dataSource,oldIndex,newIndex);
      setDataSource(sorted);
      setItems(sorted);
    }
  };

  const toggleCheck = (id: string) => {
    setItems((prev)=>
      prev.map((item) => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const setStartPoint = (id: string) => {
    setItems((prev)=>
      prev.map((item) => ({
      ...item,
      isStart: item.id === id,
      isEnd: item.isEnd && item.id !== id 
    })));
  };

  const setEndPoint = ( id: string ) => {
    setItems((prev)=>
      prev.map((item)=>({
        ...item,
        isEnd:item.id === id,
        isStart:item.isStart && item.id !== id,
      }))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddNewItem = () => {
    setSelectedPlace(null);
    setIsModalOpen(true);
    setCity('全国');
  }

  const handleOk = () => {
    if(!selectedPlace){
      Modal.warning({title:'提示', content:'请输入景点名称'});
      return;
    }

    const newItem: PlanItem = {
      id: `pois-${Date.now()}`, 
      name: selectedPlace.name,
      location: selectedPlace.address,
      region:selectedPlace.cityname || city,
      lat: selectedPlace?.location.lat,
      lng: selectedPlace?.location.lng,
      isStart: false,
      isEnd: false,
      mode: 'riding', 
      checked: false,
    };
    setItems((prev)=>[...prev,newItem]);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: '景点',
      dataIndex: 'name',
      render: (text:string, record:PlanItem)=>(
        <>
        <Flex gap='middle'>
          <Checkbox checked={record.checked} onChange={()=>toggleCheck(record.id)}/>
          {text}
        </Flex>
        </>
      )
    },
    {
      title: '出行方式',
      dataIndex: 'mode',
      render:(value:string,record:PlanItem)=>(
        <Select
          value={value}
          style={{width:100}}
          onChange={(newMode)=>{
            setItems((prev)=>
              prev.map((item)=>
                item.id === record.id ? { ...item, mode: newMode as PlanItem['mode'] } : item
              )
            );
          }}>
            <Select.Option value="riding">电动车</Select.Option>
            <Select.Option value="driving">驾车</Select.Option>
            <Select.Option value="walking">步行</Select.Option>
          </Select>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PlanItem)=>(
        <>
          <Button
            size='small'
            type={record.isStart ? 'primary' : 'default'}
            onClick={()=>setStartPoint(record.id)}
            style={{marginRight:8}}
          >设为起点</Button>
          <Button
            size='small'
            type={record.isEnd ? 'primary' : 'default'}
            onClick={()=>setEndPoint(record.id)}
          >设为终点</Button>
          <Button variant='link' color='primary' onClick={()=>deleteItem(record.id)}>
            删除
          </Button>
        </>
      )
    }
  ] satisfies TableColumnsType<PlanItem>;

  return (
    <>
    <Flex vertical>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={dataSource.map((item)=>item.id)} strategy={verticalListSortingStrategy}>
        <Table<PlanItem>
        components={{
          body:{
            row:Row,
          },
        }}
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        style={{background:'#fff'}}
        />
      </SortableContext>
      </DndContext>
      <Flex justify='space-between' style={{margin:10}}>
      <Button  color='primary' variant='solid' onClick={handleAddNewItem} >
        新增
      </Button>

      <Modal 
        title="新增景点"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 4 }}>城市范围</div>
          <SelectCity onChange={(value,selectedOptions)=>{
            if(selectedOptions && selectedOptions.length>0){
              const cityName = selectedOptions[selectedOptions.length-1].label;
              setCity(cityName);
            }else{
              setCity('全国');
            }
          }}/>
        </div>

        <div>
          <div style={{ marginBottom: 4 }}>选择景点</div>
          <PlaceSearchInput
                onPlaceSelected={setSelectedPlace}
                placeholder="输入景点名称搜索"
                city={city === '全国' ? '' : city} 
                key={''}/>
  </div>
      </Modal>
      <Flex gap='large' vertical={false} justify='right'>
        <Button >编辑</Button>
        <Button color='primary' variant='solid'>提交</Button>
      </Flex>
    </Flex>
    </Flex>
    </>
  );
}

export default PlanList;