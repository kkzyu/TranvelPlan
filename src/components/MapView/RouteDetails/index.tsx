import { Spin } from "antd";
import { CompleteRouteResult, RouteResult } from "@/services/types";
import EmptyState from "./Components/EmptyState";
import RouteModeItem from "./Components/RouteModeItem";
import RouteSegmentItem from "./Components/RouteSegmentItem";
import styles from './index.less'

interface RouteDetailProps {
  loading: boolean;
  isSubmitted: boolean;
  completeRoute: CompleteRouteResult | null;
  routes: RouteResult[];
  selectedMode: string;
  selectedSegment: string | null;
  routeDrawing: boolean;
  mapLoading: boolean;
  handleSegmentClick: (segmentId: string) => void;
  handleModeChange: (mode: string) => void;
}

const RouteDetail: React.FC<RouteDetailProps> = ({
  loading,
  isSubmitted,
  completeRoute,
  routes,
  selectedMode,
  selectedSegment,
  routeDrawing,
  mapLoading,
  handleSegmentClick,
  handleModeChange,
}) => {

  if (loading) {
    return (
      <div >
        <Spin size="small" className={styles.spin}/>{" "}
        {isSubmitted ? "计算完整路径中..." : "查询多种出行方式中..."}
      </div>
    );
  }

  return (
    <div className={styles.detailContainer}>
      {/* ====提交状态==== */}
      <RouteSegmentItem 
        isSubmitted={isSubmitted}
        completeRoute={completeRoute}
        selectedSegment={selectedSegment}
        handleSegmentClick={handleSegmentClick}
      />

      {/* ====编辑状态==== */}
      <RouteModeItem
        isSubmitted={isSubmitted}
        loading={loading}
        routes={routes}
        selectedMode={selectedMode}
        routeDrawing={routeDrawing}
        handleModeChange={handleModeChange}
      />

      {/* ===== 空状态 ==== */}
      <EmptyState
        loading={loading}
        mapLoading={mapLoading}
        isSubmitted={isSubmitted}
        completeRoute={completeRoute}
        routes={routes}
      />
    </div>
  );
};

export default RouteDetail;
