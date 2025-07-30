import { CompleteRouteResult, RouteResult } from "@/services/types";
import { theme } from "antd";
import styles from '../index.less'

interface EmptyStateProps {
  loading: boolean;
  mapLoading: boolean;
  isSubmitted: boolean;
  completeRoute: CompleteRouteResult | null;
  routes: RouteResult[];
}

const EmptyState: React.FC<EmptyStateProps> = ({
  loading,
  mapLoading,
  isSubmitted,
  completeRoute,
  routes,
}) => {
  const { token } = theme.useToken();

  if (
    loading ||
    mapLoading ||
    (isSubmitted && completeRoute) ||
    (!isSubmitted && routes.length > 0)
  ) {
    return null;
  }

  return (
    <div className={styles.emptyState} style={{color: token.colorTextDescription}}>
      {isSubmitted
        ? "请选择至少2个景点计算路径"
        : "请设置起点和终点查看路线"}
    </div>
  );
};

export default EmptyState;