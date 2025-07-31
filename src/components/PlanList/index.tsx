import { Modal, Flex } from "antd";
import { arrayMove } from "@dnd-kit/sortable";
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { PlanItem } from "@/pages/index";
import React, { useCallback, useState } from "react";
import { Place } from "types";
import PlanListFooter from "./PlanListFooter";
import PlanListTable from "./PlanListTable";
import { usePlanListSelection, usePlanListColumns } from "./hooks";
interface PlanListProps {
  items: PlanItem[];
  setItems: React.Dispatch<React.SetStateAction<PlanItem[]>>;
  isSubmitted?: boolean;
  onSubmit?: () => void;
  onEdit?: () => void;
}

const PlanList: React.FC<PlanListProps> = ({
  items,
  setItems,
  isSubmitted = false,
  onSubmit,
  onEdit,
}) => {
  const [dataSource, setDataSource] = useState<PlanItem[]>(items);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [city, setCity] = useState("杭州");

  const rowSelection = usePlanListSelection(items, setItems, isSubmitted);

  React.useEffect(() => {
    setDataSource(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = dataSource.findIndex((item) => item.id === active.id);
      const newIndex = dataSource.findIndex((item) => item.id === over.id);
      const sorted = arrayMove(dataSource, oldIndex, newIndex);
      setDataSource(sorted);
      setItems(sorted);
    }
  };

  const handleSubmit = useCallback(() => {
    const checkedItems = items.filter((item) => item.checked);
    if (checkedItems.length < 2) {
      Modal.warning({
        title: "提示",
        content: "请至少选择2个景点才能提交行程",
      });
      return;
    }
    onSubmit?.();
  }, [items, onSubmit]);

  const handleEdit = () => {
    onEdit?.();
  };

  const setStartPoint = (id: string) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        isStart: item.id === id,
        isEnd: item.isEnd && item.id !== id,
      }))
    );
  };

  const setEndPoint = (id: string) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        isEnd: item.id === id,
        isStart: item.isStart && item.id !== id,
      }))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddNewItem = useCallback(() => {
    setSelectedPlace(null);
    setIsModalOpen(true);
    setCity("");
  }, []);

  const handleOk = () => {
    if (!selectedPlace) {
      Modal.warning({ title: "提示", content: "请选择一个景点" });
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
      mode: "driving",
      checked: false,
    };
    setItems((prev) => [...prev, newItem]);
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  const columns = usePlanListColumns(
    items,
    setItems,
    isSubmitted,
    deleteItem,
    setStartPoint,
    setEndPoint
  );

  return (
    <Flex vertical style={{ height: "100%" }}>
      <PlanListTable
        onDragEnd={onDragEnd}
        sensors={sensors}
        dataSource={dataSource}
        columns={columns}
        isSubmitted={isSubmitted}
        rowSelection={!isSubmitted ? rowSelection : undefined}
      />

      <PlanListFooter
        handleAddNewItem={handleAddNewItem}
        isModalOpen={isModalOpen}
        isSubmitted={isSubmitted}
        handleOk={handleOk}
        handleCancel={handleCancel}
        setCity={setCity}
        setSelectedPlace={setSelectedPlace}
        selectedPlace={selectedPlace}
        city={city}
        handleSubmit={handleSubmit}
        handleEdit={handleEdit}
      />
    </Flex>
  );
};

export default PlanList;
