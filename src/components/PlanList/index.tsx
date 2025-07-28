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
    ...(isDragging ? {position:'relative',zIndex:999,background:'#fafafa'}:{}),
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
  setItems,
  isSubmitted = false,
  onSubmit,
  onEdit
}: { 
  items: PlanItem[], 
  setItems: React.Dispatch<React.SetStateAction<PlanItem[]>>,
  isSubmitted?: boolean,
  onSubmit?: () => void,
  onEdit?: () => void
}) => {
  const [dataSource, setDataSource] = useState<PlanItem[]>(items);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place|null>(null);
  const [city, setCity] = useState('杭州');

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

  const handleSubmit = () => {
    const checkedItems = items.filter(item => item.checked);
    if (checkedItems.length < 2) {
      Modal.warning({
        title: '提示',
        content: '请至少选择2个景点才能提交行程'
      });
      return;
    }
    onSubmit?.();
  };

  const handleEdit = () => {
    onEdit?.();
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
    setCity('杭州');
  };

  const handleOk = () => {
    if(!selectedPlace){
      Modal.warning({title:'提示', content:'请选择一个景点'});
      return;
    }

    const newItem: PlanItem = {
      id: `pois-${Date.now()}`, 
      name: selectedPlace.name,
      location: selectedPlace.address,
      region: selectedPlace.cityname || city,
      lat: selectedPlace?.location.lat,
      lng: selectedPlace?.location.lng,
      isStart: false,
      isEnd: false,
      mode: 'driving',
      checked: false,
    };
    setItems((prev)=>[...prev,newItem]);
    setIsModalOpen(false);
    setSelectedPlace(null); 
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  const rowSelection = {
    type: 'checkbox' as const,
    selectedRowKey: items.filter(item=>item.checked).map(item => item.id),
    onSelect:(record:PlanItem,selected:boolean)=>{
      setItems((prev)=>
        prev.map((item)=>
          item.id === record.id ? {...item,checked:selected}:item
        ))
    },
    onSelectAll:(selected:boolean,selectedRows:PlanItem[],changeRows:PlanItem[])=>{
      setItems((prev)=>
      prev.map((item)=>({
        ...item,
        checked:selected
      }))  
    )
    },
    getCheckboxProps:(record:PlanItem)=>({
      disabled:isSubmitted,
      name:record.name,
    }),
    columnTitle:isSubmitted?'选择状态':'选择',
    columnWidth:60,
  }

  const columns = [
    {
      title: isSubmitted ? '行程顺序' : '景点',
      dataIndex: 'name',
      width:200,
      render: (text:string, record:PlanItem, index: number)=>(
        <Flex gap='middle' align='center'>
          {isSubmitted && record.checked && (
            <div style={{
              minWidth: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              backgroundColor: '#1890ff', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {items.filter(item => item.checked).findIndex(item => item.id === record.id) + 1}
            </div>
          )}
          <div>
            <div style={{ fontWeight: record.isStart || record.isEnd ? 'bold' : 'normal' }}>
              {record.isStart && <span style={{color: '#52c41a', marginRight: 4}}>[起点]</span>}
              {record.isEnd && <span style={{color: '#ff4d4f', marginRight: 4}}>[终点]</span>}
              {text}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.location}
            </div>
          </div>
        </Flex>
      )
    },
    {
      title: '出行方式',
      dataIndex: 'mode',
      width:150,
      render:(value:string,record:PlanItem)=>(
        <Select
          value={value}
          style={{width:100}}
          disabled={isSubmitted}
          onChange={(newMode)=>{
            setItems((prev)=>
              prev.map((item)=>
                item.id === record.id ? { ...item, mode: newMode as PlanItem['mode'] } : item
              )
            );
          }}>
          <Select.Option value="driving">驾车</Select.Option>
          <Select.Option value="walking">步行</Select.Option>
          <Select.Option value="riding">骑行</Select.Option>
          <Select.Option value="transfer">公交</Select.Option>
        </Select>
      )
    },
    {
      title: '操作',
      key: 'action',
      width:150,
      render: (_: any, record: PlanItem)=>(
        <Flex gap={4} wrap>
          {!isSubmitted && (
            <>
              <Button
                size='small'
                type={record.isStart ? 'primary' : 'default'}
                onClick={()=>setStartPoint(record.id)}
              >
                {record.isStart ? '起点' : '设为起点'}
              </Button>
              <Button
                size='small'
                type={record.isEnd ? 'primary' : 'default'}
                onClick={()=>setEndPoint(record.id)}
              >
                {record.isEnd ? '终点' : '设为终点'}
              </Button>
              <Button 
                size='small'
                variant='link' 
                color='danger' 
                onClick={()=>deleteItem(record.id)}
              >
                删除
              </Button>
            </>
          )}
          {isSubmitted && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.checked ? '已选择' : '未选择'}
            </div>
          )}
        </Flex>
      )
    }
  ] satisfies TableColumnsType<PlanItem>;

  return (
    <Flex vertical style={{ height: '100%' }}>
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
            scroll={{y:'calc(100vh - 200px)'}}
            rowSelection={!isSubmitted?rowSelection:undefined}
            style={{
              background:'#fff',
              flex: 1,
              position: 'relative',
              zIndex: 1
            }}
            locale={{
              emptyText: (
                <div style={{ 
                  padding: '60px 20px', 
                  textAlign: 'center',
                  color: '#999'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                    暂无景点数据
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    点击下方"新增景点"按钮添加您想去的地方
                  </div>
                </div>
              )
            }}
          />
        </SortableContext>
      </DndContext>

      <Flex justify='space-between' style={{padding:'16px 0', flexShrink: 0}}>
        <Button 
          type='primary'
          onClick={handleAddNewItem}
          disabled={isSubmitted}
        >
          新增景点
        </Button>

        <Modal 
          title="新增景点"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="确定"
          cancelText="取消"
          zIndex={10000}
          getContainer={() => document.body}
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>城市范围</div>
            <SelectCity onChange={(value,selectedOptions)=>{
              if(selectedOptions && selectedOptions.length>0){
                const cityName = selectedOptions[selectedOptions.length-1].label;
                setCity(cityName);
              }else{
                setCity('杭州');
              }
            }}/>
          </div>

          <div>
            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>选择景点</div>
            <PlaceSearchInput
              onPlaceSelected={setSelectedPlace}
              placeholder="输入景点名称搜索"
              city={city === '杭州' ? '' : city} 
              key={city}
            />
            {selectedPlace && (
              <div style={{ 
                marginTop: 8, 
                padding: 8, 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f',
                borderRadius: 4
              }}>
                <div style={{ fontWeight: 'bold' }}>{selectedPlace.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{selectedPlace.address}</div>
              </div>
            )}
          </div>
        </Modal>

        <Flex gap='middle'>
          {isSubmitted ? (
            <Button onClick={handleEdit}>返回编辑</Button>
          ) : (
            <>
              <Button type='default'>编辑</Button>
              <Button type='primary' onClick={handleSubmit}>
                提交行程
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}

export default PlanList;