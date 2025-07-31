import { Flex, Button, Modal, Cascader, Typography } from "antd";
import PlaceSearchInput from "../PlaceSearchInput";
import styles from "../index.less";
import { CityOptions } from "@/constants/options";
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
            options={CityOptions}
            placeholder="请选择城市（可选）"
            onChange={(value, selectedselectedPlaces) => {
              const cityName =
                selectedselectedPlaces?.[selectedselectedPlaces.length - 1]
                  ?.label || "杭州";
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
            placeholder="输入景点名称或需求搜索（如“附近有KTV和优衣库的商场”）"
            city={city === "杭州" ? "" : city}
            key={city}
          />
          {selectedPlace && (
            <div className={styles.selectedPlace}>
              {/* 景点名称 */}
              <Typography.Text strong>{selectedPlace.name}</Typography.Text>
              {/* 景点地址 */}
              <div className={styles.placeAddress}>{selectedPlace.address}</div>
              {/* 展示热门景点的简介 */}
              {selectedPlace?.place?.description && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    fontStyle: "normal",
                  }}
                >
                  {selectedPlace.description.length > 50
                    ? `${selectedPlace.description.slice(0, 50)}...`
                    : selectedPlace.description}
                </div>
              )}

              {/* 混合搜索时，展示商场包含的品牌 */}
              {(() => {
                const matchedBrands = selectedPlace?.matchedBrands;
                if (!Array.isArray(matchedBrands)) return null;
                return (
                  <div style={{ fontSize: "12px", color: "#1890ff" }}>
                    🔔 包含：{matchedBrands.join("、")}
                  </div>
                );
              })()}
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
