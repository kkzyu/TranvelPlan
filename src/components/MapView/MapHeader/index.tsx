import ExportItinerary from "@/components/ExportButton";
import { MODE_COLORS, MODE_NAMES } from "@/constants/mapConfig";
import styles from './index.less'
import { PlanItem } from "@/pages";
import { CompleteRouteResult, RouteResult } from "@/services/types";

interface MapHeaderProps {
    planItems: PlanItem[];
    routes: RouteResult[]; 
    completeRoute: CompleteRouteResult | null;
    isSubmitted: boolean;
    selectedMode: string;
    routeDrawing: boolean;
    loading: boolean;
    mapLoading: boolean;
    onImportData: (items: PlanItem[]) => void;
}

const MapHeader: React.FC<MapHeaderProps> = ({
    planItems,
    routes,
    completeRoute,
    isSubmitted,
    selectedMode,
    routeDrawing,
    loading,
    mapLoading,
    onImportData
}) => {
    return (
        <div className={styles.mapHeader}>
            <div className={styles.headerTitle}>
                <div>
                    {/* 一级标题 */}
                    {mapLoading ? '地图加载中...' : 
                    loading ? (isSubmitted ? '计算完整路径中...' : '查询路线中...') : 
                        routeDrawing ? `正在绘制${MODE_NAMES[selectedMode]}路线...` :
                        isSubmitted ? 
                        // 提交状态
                        (completeRoute && completeRoute.success ? 
                            `完整行程路线 (${completeRoute.segments.filter(s => s.success).length}/${completeRoute.segments.length} 段成功)` : 
                            '完整路径计算') : 
                        // 编辑状态
                        (routes.length > 0 ? 
                            `多种出行方式对比 (${routes.filter(r => r.success).length}/${routes.length} 种可用)` : 
                            '路线预览')
                    }

                    {/* 细节标题 */}
                    {(isSubmitted ? completeRoute : routes.length > 0) && !loading && (
                    // 提交 && 编辑状态--显示路线
                    <div className={styles.routeInfo}>
                        当前显示: <span style={{ color: MODE_COLORS[selectedMode] }} className={styles.selectedMode}>
                            {MODE_NAMES[selectedMode] || selectedMode}
                        </span> 路线
                        {/* 提交状态 */}
                        {isSubmitted && completeRoute && (
                        <span className={styles.routeDetails}>
                            总距离: {(completeRoute.totalDistance/1000).toFixed(1)}km | 
                            总时间: {Math.ceil(completeRoute.totalDuration/60)}分钟
                        </span>
                        )}
                    </div>
                    )}
                </div>
            
                {/* 导入数据按钮 */}
                <ExportItinerary 
                    planItems={planItems}
                    completeRoute={completeRoute}
                    isSubmitted={isSubmitted}
                    onImportData={onImportData}
                />
            </div>
      </div>
    )
}
export default MapHeader;