import { message } from "antd";
import { CompleteRouteResult } from "@/services/types";
import { PlanItem } from "@/pages";
import { generateItineraryText } from "../utils/itinerarytext";

export const useExportToTxt = (
  planItems: PlanItem[],
  completeRoute: CompleteRouteResult | null,
  isSubmitted: boolean
) => {
  try {
    const content = generateItineraryText(
    planItems,
    completeRoute,
    isSubmitted
  );
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `旅行行程计划_${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success("行程已导出为文本文件");
  } catch (error) {
    console.error("导出文本文件失败:", error);
    message.error("导出失败");
  }
};
