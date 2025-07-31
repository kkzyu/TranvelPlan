import { PlanItem } from "@/pages";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Table, TableColumnsType } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import { CSS } from "@dnd-kit/utilities";

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}
const Row: React.FC<RowProps> = ({ "data-row-key": rowKey, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: rowKey,
  });
  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: "move",
    ...(isDragging
      ? { position: "relative", zIndex: 999, background: "#fafafa" }
      : {}),
  };
  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-row-key={rowKey}
    />
  );
};

interface PlanListTableProps {
  onDragEnd: (event: any) => void;
  sensors: any[];
  dataSource: PlanItem[];
  columns: TableColumnsType<PlanItem>;
  isSubmitted?: boolean;
  rowSelection?: TableRowSelection<PlanItem> | undefined;
}

const PlanListTable: React.FC<PlanListTableProps> = ({
  onDragEnd,
  sensors,
  dataSource,
  columns,
  isSubmitted,
  rowSelection,
}) => {
  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <SortableContext
        items={dataSource.map((item: { id: any }) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <Table<PlanItem>
          components={{
            body: {
              row: Row,
            },
          }}
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ y: "calc(100vh - 260px)" }}
          rowSelection={!isSubmitted ? rowSelection : undefined}
          style={{
            background: "#fff",
            flex: 1,
            position: "relative",
            zIndex: 1,
          }}
          locale={{
            emptyText: (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                <div style={{ fontSize: "16px", marginBottom: "8px" }}>
                  暂无景点数据
                </div>
                <div style={{ fontSize: "14px" }}>
                  点击下方"新增景点"按钮添加您想去的地方
                </div>
              </div>
            ),
          }}
        />
      </SortableContext>
    </DndContext>
  );
};
export default PlanListTable;
