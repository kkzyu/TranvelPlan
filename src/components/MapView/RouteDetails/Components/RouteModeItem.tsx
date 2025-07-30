import { MODE_COLORS, MODE_NAMES } from "@/constants/mapConfig";
import { RouteResult } from "@/services/types";
import { Flex, List, Badge, theme, Typography } from "antd";

interface RouteModeItemProps {
    isSubmitted: boolean;
    loading: boolean;
    routes: RouteResult[];
    selectedMode: string;
    routeDrawing: boolean;
    handleModeChange: (mode: string) => void;
}
const RouteModeItem: React.FC<RouteModeItemProps> = ({
  isSubmitted,
  loading,
  routes,
  selectedMode,
  routeDrawing,
  handleModeChange
}) => {
  const { token } = theme.useToken();
  const { Text } = Typography;
  
  if (isSubmitted || loading || routes.length <= 0) {
    return null;
  }

  return (
    <Flex vertical gap="small">
      <Text strong style={{ fontSize: "13px", marginTop: "8px" }}>
        出行方式对比：
      </Text>

      <List
        size="small"
        dataSource={routes}
        split={false}
        renderItem={(route) => (
          <List.Item
            key={route.mode}
            onClick={() =>
              route.success && !routeDrawing && handleModeChange(route.mode)
            }
            style={{
              background: route.success
                ? selectedMode === route.mode
                  ? token.colorInfoBg
                  : "#f5f5f5"
                : token.colorErrorBg,
              border: "none",
              borderRadius: token.borderRadiusSM,
              cursor: route.success ? "pointer" : "not-allowed",
              opacity: route.success ? 1 : 0.6,
              transition: "all 0.3s ease",
              padding: "6px 12px",
              marginBottom: "5px",
              alignItems: "center",
              boxShadow:
                selectedMode === route.mode
                  ? `0 0 0 1px ${MODE_COLORS[route.mode]}40`
                  : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <Badge
                dot
                offset={[-2, 8]}
                style={{
                  backgroundColor: MODE_COLORS[route.mode],
                  boxShadow:
                    selectedMode === route.mode && route.success
                      ? `0 0 0 2px ${MODE_COLORS[route.mode]}40`
                      : "none",
                  marginRight: 8,
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <Flex align="center" gap={8}>
                  <Text
                    strong
                    style={{
                      fontSize: token.fontSizeSM,
                      color:
                        selectedMode === route.mode && route.success
                          ? MODE_COLORS[route.mode]
                          : undefined,
                    }}
                  >
                    {MODE_NAMES[route.mode]}
                    {selectedMode === route.mode && route.success}
                  </Text>
                  {route.success ? (
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      距离: {(route.distance / 1000).toFixed(1)}km | 时间:{" "}
                      {Math.ceil(route.duration / 60)}分钟
                      {route.mode === "transfer" && " | 含换乘"}
                    </Text>
                  ) : (
                    <Text type="danger" style={{ fontSize: "11px" }}>
                      {route.error || "路线不可用"}
                    </Text>
                  )}
                </Flex>
              </div>
            </div>
          </List.Item>
        )}
      />
    </Flex>
  );
};
export default RouteModeItem;
