import { PlanItem } from "@/pages";
import { Flex, Select, Button, TableColumnsType } from "antd";
import styles from "../index.less";

export const usePlanListColumns = (
  items: PlanItem[],
  setItems: React.Dispatch<React.SetStateAction<PlanItem[]>>,
  isSubmitted: boolean,
  deleteItem: (id: string) => void,
  setStartPoint: (id: string) => void,
  setEndPoint: (id: string) => void
): TableColumnsType<PlanItem> => [
  {
    title: isSubmitted ? "行程顺序" : "景点",
    dataIndex: "name",
    width: 200,
    render: (text: string, record: PlanItem, index: number) => (
      <Flex gap="middle" align="center">
        {isSubmitted && record.checked && (
          <div className={styles.orderNumber}>
            {items
              .filter((item) => item.checked)
              .findIndex((item) => item.id === record.id) + 1}
          </div>
        )}
        <div>
          <div
            style={{
              fontWeight: record.isStart || record.isEnd ? "bold" : "normal",
            }}
          >
            {record.isStart && (
              <span className={styles.startPoint}>[起点]</span>
            )}
            {record.isEnd && <span className={styles.endPoint}>[终点]</span>}
            {text}
          </div>
          <div className={styles.location}>{record.location}</div>
        </div>
      </Flex>
    ),
  },
  {
    title: "出行方式",
    dataIndex: "mode",
    width: 100,
    render: (value: string, record: PlanItem) => (
      <Select
        value={value}
        style={{ width: 70 }}
        disabled={isSubmitted}
        onChange={(newMode) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === record.id
                ? { ...item, mode: newMode as PlanItem["mode"] }
                : item
            )
          );
        }}
      >
        <Select.Option value="driving">驾车</Select.Option>
        <Select.Option value="walking">步行</Select.Option>
        <Select.Option value="riding">骑行</Select.Option>
        <Select.Option value="transfer">公交</Select.Option>
      </Select>
    ),
  },
  {
    title: "操作",
    key: "action",
    width: 150,
    render: (_: any, record: PlanItem) => (
      <Flex gap={4} wrap>
        {!isSubmitted && (
          <>
            <Button
              size="small"
              type={record.isStart ? "primary" : "default"}
              onClick={() => setStartPoint(record.id)}
            >
              {record.isStart ? "起点" : "设为起点"}
            </Button>
            <Button
              size="small"
              type={record.isEnd ? "primary" : "default"}
              onClick={() => setEndPoint(record.id)}
            >
              {record.isEnd ? "终点" : "设为终点"}
            </Button>
            <Button
              size="small"
              variant="link"
              color="danger"
              onClick={() => deleteItem(record.id)}
            >
              删除
            </Button>
          </>
        )}
        {isSubmitted && (
          <div className={styles.selectionStatus}>
            {record.checked ? "已选择" : "未选择"}
          </div>
        )}
      </Flex>
    ),
  },
];
