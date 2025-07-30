import { MODE_COLORS, MODE_NAMES } from "@/constants/mapConfig";
import { CompleteRouteResult } from "@/services/types";
import { Flex, List, Badge, theme, Typography, Card } from "antd";

interface RouteSegmentItemProps {
  isSubmitted: boolean;
  completeRoute: CompleteRouteResult | null;
  selectedSegment: string | null;
  handleSegmentClick: (segmentId: string) => void;
}
const RouteSegmentItem: React.FC<RouteSegmentItemProps> = ({
  isSubmitted,
  completeRoute,
  selectedSegment,
  handleSegmentClick
}) => {
  const { token } = theme.useToken();
  const { Text } = Typography;

  if (!isSubmitted || !completeRoute) {
    return null;
  }

  return (
    <Flex vertical gap="small">
      <Text strong={true} style={{ fontSize: "13px", marginTop: "8px" }}>
        行程路线详情:
      </Text>

      <List
        size="small"
        dataSource={completeRoute.segments}
        split={false}
        renderItem={(segment) => (
          <List.Item
            key={segment.id}
            onClick={() => segment.success && handleSegmentClick(segment.id)}
            style={{
              background: segment.success
                ? selectedSegment === segment.id
                  ? token.colorInfoBg
                  : "#f5f5f5"
                : token.colorErrorBg,
              border: "none",
              borderRadius: token.borderRadiusSM,
              cursor: segment.success ? "pointer" : "not-allowed",
              opacity: segment.success ? 1 : 0.6,
              transition: "all 0.3s ease",
              padding: "0px 0px 0px 5px",
              marginBottom: "5px",
              boxShadow:
                selectedSegment === segment.id
                  ? `0 0 0 1px ${MODE_COLORS[segment.mode]}40`
                  : "none",
            }}
          >
            <List.Item.Meta
              avatar={
                <Badge
                  dot
                  offset={[8, 5]}
                  style={{
                    backgroundColor: MODE_COLORS[segment.mode],
                    boxShadow:
                      selectedSegment === segment.id
                        ? `0 0 0 2px ${MODE_COLORS[segment.mode]}40`
                        : "none",
                  }}
                />
              }
              title={
                <Text
                  strong={true}
                  style={{
                    fontSize: token.fontSizeSM,
                    color:
                      selectedSegment === segment.id
                        ? MODE_COLORS[segment.mode]
                        : undefined,
                  }}
                >
                  {segment.startPoint.name} → {segment.endPoint.name}
                  {selectedSegment === segment.id}
                </Text>
              }
              description={
                segment.success ? (
                  <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    距离: {(segment.distance / 1000).toFixed(1)}km | 时间:{" "}
                    {Math.ceil(segment.duration / 60)}分钟 | 方式:{" "}
                    {MODE_NAMES[segment.mode]}
                  </Text>
                ) : (
                  <Text type="danger" style={{ fontSize: token.fontSizeSM }}>
                    {segment.error}
                  </Text>
                )
              }
            />
          </List.Item>
        )}
      />

      {/* 总计卡片 */}
      {completeRoute.segments.some((s) => s.success) && (
        <Card
          type="inner"
          size="small"
          style={{
            fontSize: token.fontSizeSM,
            background: token.colorInfoBg,
            borderColor: token.colorInfoBorder,
          }}
        >
          <Text style={{ fontSize: token.fontSizeSM }} strong={true}>
            总计：
          </Text>
          <span>
            距离 {(completeRoute.totalDistance / 1000).toFixed(1)}km | 时间{" "}
            {Math.ceil(completeRoute.totalDuration / 60)}分钟
          </span>
        </Card>
      )}
    </Flex>
  );
};
export default RouteSegmentItem;
