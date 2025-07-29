import { PlanItem } from '@/pages/index';

const PLAN_ITEMS_KEY = 'travel_plan_items';
const SUBMITTED_STATE_KEY = 'travel_plan_submitted';

export const saveToLocalStorage = (planItems: PlanItem[], isSubmitted: boolean) => {
  try {
    localStorage.setItem(PLAN_ITEMS_KEY, JSON.stringify(planItems));
    localStorage.setItem(SUBMITTED_STATE_KEY, JSON.stringify(isSubmitted));
    console.log('数据已保存到localStorage');
  } catch (error) {
    console.error('保存到localStorage失败:', error);
  }
};

export const loadFromLocalStorage = (): { planItems: PlanItem[], isSubmitted: boolean } => {
  try {
    const planItemsStr = localStorage.getItem(PLAN_ITEMS_KEY);
    const isSubmittedStr = localStorage.getItem(SUBMITTED_STATE_KEY);
    
    const planItems = planItemsStr ? JSON.parse(planItemsStr) : [];
    const isSubmitted = isSubmittedStr ? JSON.parse(isSubmittedStr) : false;
    
    console.log('从localStorage加载数据:', { planItems: planItems.length, isSubmitted });
    return { planItems, isSubmitted };
  } catch (error) {
    console.error('从localStorage加载失败:', error);
    return { planItems: [], isSubmitted: false };
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(PLAN_ITEMS_KEY);
    localStorage.removeItem(SUBMITTED_STATE_KEY);
    console.log('localStorage已清除');
  } catch (error) {
    console.error('清除localStorage失败:', error);
  }
};