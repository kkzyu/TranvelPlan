import poiTypes from './poi-types.json';

export const POI_TYPES_MAP: Record<string, string> = {};
export const POI_TYPES_LIST = poiTypes;

poiTypes.forEach((item) => {
  // 优先级：小类 > 中类 > 大类
  if (item.小类) POI_TYPES_MAP[item.小类] = item.NEW_TYPE;
  if (item.中类) POI_TYPES_MAP[item.中类] = item.NEW_TYPE;
  if (item.大类) POI_TYPES_MAP[item.大类] = item.NEW_TYPE;
});

