import MapView from "@/components/MapView";
import RichTextEditor from "@/components/NoteBook";
import { PlanItem } from "@/pages";
import { CollapseProps, Flex, Collapse } from "antd";
import styles from './index.less'

interface TravelMapProps {
    planItems: PlanItem[];
    isSubmitted: boolean;
    activeKeys: string[];
    onActiveKeysChange: (keys: string[]) => void;
    onImportData: (items: PlanItem[]) => void;
}
const TravelMap: React.FC<TravelMapProps> = ({
    planItems,
    isSubmitted,
    activeKeys,
    onActiveKeysChange,
    onImportData,
}) => {
    const city = planItems.length > 0 ? planItems[0].region : '';

    const collapseItems: CollapseProps['items'] = [
          {
            key: 'note',
            label: (
              <span className={styles.label}>
                📝 旅行笔记
              </span>
            ),
            children: <RichTextEditor />,
          },
          {
            key: 'map',
            label: (
              <span className={styles.label}>
                🗺️ 旅行地图
              </span>
            ),
            children: (
              <div className={styles.children}>
                <MapView
                  planItems={planItems}
                  isSubmitted={isSubmitted}
                  city={city}
                  onImportData={onImportData}
                />
              </div>
            ),
          }
        ];

        return (
          <Flex gap="middle" vertical>
            <Collapse
              activeKey={activeKeys}
              onChange={(keys) => onActiveKeysChange(keys as string[])}
              bordered={false}
              expandIconPosition="end"
              className={styles.collapseItems}
              collapsible="header"
            >
              {collapseItems.map((item) => (
                <Collapse.Panel key={String(item.key)} header={item.label}>
                  {item.children}
                </Collapse.Panel>
              ))}
            </Collapse>
          </Flex>
        );
}
export default TravelMap;