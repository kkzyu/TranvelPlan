import { message } from "antd";
import { useEffect } from "react";
import { PlanItem } from "@/pages";

export const sharedLinkImport = (
    setPlanItems: (items: PlanItem[]) => void,
    setSelectedKey: (key: string) => void,
    setIsSubmitted: (submitted: boolean) => void
) => {
    useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareData = urlParams.get('share');
    
    if (shareData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(shareData));
        if (decoded.spots && Array.isArray(decoded.spots)) {
          const sharedItems: PlanItem[] = decoded.spots.map((spot: any, index: number) => ({
            id: `shared-${Date.now()}-${index}`,
            name: spot.name,
            location: spot.name,
            region: '未知',
            lat: spot.lat,
            lng: spot.lng,
            isStart: index === 0,
            isEnd: index === decoded.spots.length - 1,
            mode: spot.mode || 'driving',
            checked: true
          }));
          
          setPlanItems(sharedItems);
          setSelectedKey('2');
          setIsSubmitted(true);
          message.success('已导入分享的行程计划');
          
          // 清除url参数，防止刷新重复导入
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error('解析分享链接失败:', error);
        message.error('分享链接格式不正确');
      }
    }
  }, []);
}