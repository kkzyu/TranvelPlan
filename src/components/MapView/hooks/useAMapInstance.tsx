import { CITY_CENTERS } from "@/constants/options";
import { RouteService } from "@/services/maps";
import { loadAMapScript } from "@/services/types";
import { useEffect, useRef, useState } from "react";

export const useAMapInstance = (city: string) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeServiceRef = useRef<RouteService | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        // 加载地图脚本
        await loadAMapScript();

        // 设置初始状态地图中心点
        const center = CITY_CENTERS[city] || CITY_CENTERS["杭州"];

        // 设置地图容器状态
        mapInstanceRef.current = new (window as any).AMap.Map(
          mapContainerRef.current,
          {
            zoom: city === "杭州" ? 4 : 11,
            center: center,
            mapStyle: "amap://styles/normal",
            showLabel: true,
            showBuildingBlock: true,
            viewMode: "2D",
            pitch: 0,
            skyColor: "#ffffff",
            features: ["bg", "point", "road", "building"],
            resizeEnable: true,
            rotateEnable: true,
            pitchEnable: true,
            zoomEnable: true,
            dragEnable: true,
            keyboardEnable: true,
            doubleClickZoom: true,
            scrollWheel: true,
            touchZoom: true,
            touchZoomCenter: 1,
            animateEnable: true, 
          }
        );

        routeServiceRef.current = new RouteService(mapInstanceRef.current);

        try {
          await new Promise<void>((resolve) => {
            // 加载地图插件
            (window as any).AMap.plugin(
              ["AMap.Scale", "AMap.ToolBar", "AMap.ControlBar"],
              () => {
                if ((window as any).AMap.Scale) {
                  mapInstanceRef.current.addControl(
                    new (window as any).AMap.Scale({
                      position: "LB",
                    })
                  );
                }

                if ((window as any).AMap.ToolBar) {
                  mapInstanceRef.current.addControl(
                    new (window as any).AMap.ToolBar({
                      locate: true,
                      position: "LT",
                      direction: true,
                      autoPosition: false,
                      locationMarker: true,
                      useNative: true,
                    })
                  );
                }

                if ((window as any).AMap.ControlBar) {
                  mapInstanceRef.current.addControl(
                    new (window as any).AMap.ControlBar({
                      position: "RT",
                    })
                  );
                }

                resolve();
              }
            );
          });
        } catch (controlError) {
          console.warn("地图控件加载失败，但不影响主要功能:", controlError);
        }

        setMapLoading(false);
      } catch (error) {
        console.error("地图初始化失败:", error);
        setMapLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [city]);

  return {
    mapContainerRef,
    mapInstanceRef,
    mapLoading,
    routeServiceRef,
  };
};
