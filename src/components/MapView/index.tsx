import { Flex } from "antd";
import { PlanItem } from "@/pages/index";
import MapContainer from "./MapContainer";
import MapHeader from "./MapHeader";
import RouteDetail from "./RouteDetails";
import {
  useAMapInstance,
  useMapMarkers,
  useRouteCalculation,
  useRouteInteraction,
} from "./hooks";

const MapView = ({
  planItems,
  isSubmitted = false,
  city = "杭州",
  onImportData,
}: {
  planItems: PlanItem[];
  isSubmitted?: boolean;
  city?: string;
  onImportData?: (PlanItems: PlanItem[]) => void;
}) => {
  // 获取地图实例和服务
  const { mapContainerRef, mapInstanceRef, mapLoading, routeServiceRef } =
    useAMapInstance(city);

  // 管理地图标记
  useMapMarkers(mapInstanceRef, planItems, isSubmitted);

  const { routes, completeRoute, loading } = useRouteCalculation(
    routeServiceRef,
    planItems,
    isSubmitted,
    city,
    mapLoading
  );
  // 交互逻辑
  const {
    selectedMode,
    selectedSegment,
    routeDrawing,
    handleModeChange,
    handleSegmentClick,
  } = useRouteInteraction(routeServiceRef, routes, planItems, isSubmitted);

  // 导入数据回调
  const handleImportData = (importedItems: PlanItem[]) => {
    onImportData?.(importedItems);
  };

  return (
    <Flex
      vertical
      style={{
        height: "100%",
        overflow: "auto",
        border: "1px solid #f0f0f0",
        borderRadius: 8,
      }}
    >
      <MapHeader
        planItems={planItems}
        routes={routes}
        completeRoute={completeRoute}
        isSubmitted={isSubmitted}
        selectedMode={selectedMode}
        routeDrawing={routeDrawing}
        loading={loading}
        mapLoading={mapLoading}
        onImportData={handleImportData}
      />
      <div style={{ flex: 1, minHeight: "40vh" }}>
        <MapContainer mapContainerRef={mapContainerRef} />
      </div>

      <RouteDetail
        loading={loading}
        isSubmitted={isSubmitted}
        completeRoute={completeRoute}
        routes={routes}
        selectedMode={selectedMode}
        selectedSegment={selectedSegment}
        routeDrawing={routeDrawing}
        mapLoading={mapLoading}
        handleSegmentClick={handleSegmentClick}
        handleModeChange={handleModeChange}
      />
    </Flex>
  );
};

export default MapView;
