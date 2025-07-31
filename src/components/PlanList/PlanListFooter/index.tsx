import { Flex, Button, Modal, Cascader } from "antd";
import PlaceSearchInput from "../PlaceSearchInput";
import cascaderOptions from '@pansy/china-division';

interface PlanListFooterProps {
  handleAddNewItem: () => void;
  isSubmitted: boolean;
  isModalOpen: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  setCity: (city: string) => void;
  setSelectedPlace: (place: any) => void;
  selectedPlace: any;
  city: string;
  handleEdit: () => void;
  handleSubmit: () => void;
}
const PlanListFooter: React.FC<PlanListFooterProps> = ({
  handleAddNewItem,
  isSubmitted,
  isModalOpen,
  handleOk,
  handleCancel,
  setCity,
  setSelectedPlace,
  selectedPlace,
  city,
  handleEdit,
  handleSubmit,
}) => {
  return (
    <Flex justify="space-between" style={{ padding: "16px 0", flexShrink: 0 }}>
      <Flex gap="middle">
        <Button
          type="primary"
          onClick={handleAddNewItem}
          disabled={isSubmitted}
        >
          新增
        </Button>
      </Flex>

      <Modal
        title="新增"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        zIndex={10000}
        getContainer={() => document.body}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: "bold" }}>城市范围</div>
          <Cascader
            options={cascaderOptions} 
            placeholder="请选择城市（可选）"
            onChange={(value, selectedOptions) => {
              const cityName =
                selectedOptions?.[selectedOptions.length - 1]?.label || "杭州";
              setCity(cityName);
            }}
            changeOnSelect={false}
            expandTrigger="hover"
            size="middle"
            style={{ width: "100%" }}
            showSearch 
          />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: "bold" }}>选择景点</div>
          <PlaceSearchInput
            onPlaceSelected={setSelectedPlace}
            placeholder="输入景点名称搜索"
            city={city === "杭州" ? "" : city}
            key={city}
          />
          {selectedPlace && (
            <div
              style={{
                marginTop: 8,
                padding: 8,
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: 4,
              }}
            >
              <div style={{ fontWeight: "bold" }}>{selectedPlace.name}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {selectedPlace.address}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Flex gap="middle" style={{ marginRight: 20 }}>
        {isSubmitted ? (
          <Button onClick={handleEdit}>返回编辑</Button>
        ) : (
          <>
            <Button type="primary" onClick={handleSubmit}>
              提交行程
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );
};
export default PlanListFooter;
