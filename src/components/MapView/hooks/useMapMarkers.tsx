import { PlanItem } from "@/pages";
import { useEffect } from "react";

export const useMapMarkers = (
    mapInstanceRef: React.MutableRefObject<any>,
    planItems: PlanItem[],
    isSubmitted: boolean
) => {
  useEffect(() => {
    if (!mapInstanceRef.current || planItems.length === 0) return;

    const overlays = mapInstanceRef.current.getAllOverlays("marker");
    overlays.forEach((overlay: any) => {
      mapInstanceRef.current.remove(overlay);
    });

    const markers: any[] = [];

    planItems.forEach((item, index) => {
      if (!item.lat || !item.lng) return;

      let markerContent = "";

      if (isSubmitted && item.checked) {
        const checkedItems = planItems.filter((p) => p.checked);
        const orderIndex = checkedItems.findIndex((p) => p.id === item.id);
        markerContent = `<div style="background: #1890ff; color: white; padding: 6px 10px; border-radius: 50%; font-size: 14px; font-weight: bold; min-width: 28px; text-align: center;">${
          orderIndex + 1
        }</div>`;
      } else {
        if (item.isStart) {
          markerContent = `<div style="background: #52c41a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">起点</div>`;
        } else if (item.isEnd) {
          markerContent = `<div style="background: #ff4d4f; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">终点</div>`;
        } else {
          markerContent = `<div style="background: #1890ff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${
            index + 1
          }</div>`;
        }
      }

      const marker = new (window as any).AMap.Marker({
        position: [item.lng, item.lat],
        content: markerContent,
        title: item.name,
        anchor: "center",
        offset: new (window as any).AMap.Pixel(0, -15),
        label: {
          content: item.name,
          direction: "top",
          offset: new (window as any).AMap.Pixel(0, -10),
          style: {
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
          },
        },
      });

      markers.push(marker);
      mapInstanceRef.current.add(marker);
    });

    if (markers.length > 0) {
      mapInstanceRef.current.setFitView(markers, false, [20, 20, 20, 20]);
    }
  }, [mapInstanceRef, planItems, isSubmitted]);
};
