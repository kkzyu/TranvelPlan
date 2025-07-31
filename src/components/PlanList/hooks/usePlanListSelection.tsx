import { PlanItem } from "@/pages";
import { Checkbox } from "antd";

export const usePlanListSelection = (
    items: PlanItem[],
    setItems: (items: PlanItem[]) => void,
    isSubmitted?: boolean,
) => {
  return {
    type: "checkbox" as const,

    selectedRowKeys: items
      .filter((item) => item.checked)
      .map((item) => item.id),

    onChange: (selectedRowKeys: React.Key[]) => {
      setItems(
        items.map((item) => ({
          ...item,
          checked: selectedRowKeys.includes(item.id),
        }))
      );
    },

    onSelect: (
      record: PlanItem,
      selected: boolean,
    ) => {
      setItems(
        items.map((item) =>
          item.id === record.id ? { ...item, checked: selected } : item
        )
      );
    },

    onSelectAll: (
      selected: boolean,
    ) => {
      setItems(
        items.map((item) => ({
          ...item,
          checked: selected,
        }))
      );
    },
  
    getCheckboxProps: (record: PlanItem) => ({
      disabled: isSubmitted,
      name: record.name,
    }),

    columnTitle: isSubmitted ? (
      "选择状态"
    ) : (
      <Checkbox
        indeterminate={
          items.some((item) => item.checked) &&
          !items.every((item) => item.checked)
        }
        checked={items.length > 0 && items.every((item) => item.checked)}
        disabled={isSubmitted || items.length === 0}
        onChange={(e) => {
          const checked = e.target.checked;
          setItems(
            items.map((item) => ({
              ...item,
              checked: checked,
            }))
          );
        }}
      ></Checkbox>
    ),

    columnWidth: 60,
  };
};
