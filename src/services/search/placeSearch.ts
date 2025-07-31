// 根据关键词搜索
import axios from 'axios';
import { Place } from '@/services/types'
import { POI_TYPES_MAP } from '@/constants/poiTypes';

const AMAP_WEB_SERVICE_KEY = process.env.UMI_APP_AMAP_WEB_SERVICE_KEY;

const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // 地球半径，单位为米
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 返回距离，单位为米
}

export const searchPlacesByKeyword = async (keyword: string, city: string): Promise<Place[]> => {
    try {
        const response = await axios.get('https://restapi.amap.com/v5/place/text', {
            params: {
                key: AMAP_WEB_SERVICE_KEY,
                keywords: keyword,
                city: city,
                output: 'json',
            }
        });

        if (response.data && response.data.status === '1' && response.data.pois) {
            const places: Place[] = response.data.pois.map((p: any) => {
                const [lng, lat] = p.location.split(',');
                return {
                    id: p.id,
                    name: p.name,
                    address: p.address,
                    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
                    cityname: p.cityname,
                    adname: p.adname,
                    type: p.type,
                };
            });
            return places;
        } else {
            console.error('高德 API 返回错误:', response.data.info);
            return [];
        }
    } catch (error) {
        console.error('搜索地点请求失败:', error);
        return [];
    }
};

export const searchPlacesByType = async (type: string, city: string): Promise<Place[]> => {
    try {
        const response = await axios.get('https://restapi.amap.com/v5/place/around', {
            params: {
                key: AMAP_WEB_SERVICE_KEY,
                keywords: type,
                city: city,
                output: 'json',
            }
        });

        if (response.data && response.data.status === '1' && response.data.pois) {
            const places: Place[] = response.data.pois.map((p: any) => {
                const [lng, lat] = p.location.split(',');
                return {
                    id: p.id,
                    name: p.name,
                    address: p.address,
                    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
                    cityname: p.cityname,
                    adname: p.adname,
                    type: p.type,
                };
            });
            return places;
        } else {
            console.error('高德 API 返回错误:', response.data.info);
            return [];
        }
    } catch (error) {
        console.error('按类型搜索地点请求失败:', error);
        return [];
    }
};

export const searchCombinedPlaces = async (
    types: string[],
    keywords: string[],
    city: string,
    radius: number = 500 // 规定搜索商圈范围为500米
): Promise<Place[]> => {
    if (types.length === 0 && keywords.length === 0) return [];
    
    // 1. 获取所有${type[]}类的场所
    const typePromise = types.map(typeName => {
        const typeCode = POI_TYPES_MAP[typeName];
        return searchPlacesByType(typeCode, city);
    })
    const typeResults = await Promise.all(typePromise);
    const places = typeResults.flat();

    if (places.length === 0) return [];

    // 2. 获取所有包含${keyword[]}的地点
    const keywordPromise = keywords.map(keyword => searchPlacesByKeyword(keyword, city));
    const keywordResults = await Promise.all(keywordPromise);
    const keywordPlaces = keywordResults.flat();

    if (keywordPlaces.length === 0) return [];

    // 3. 对每个${type[]}场所，检查在 radius 范围内是否包含了所有的${keyword[]}地点
    const matchedPlaces = places
        .map(place => {
            const nearbyBrands = keywordPlaces.filter(brandPlace => {
                const distance = getDistance(
                    place.location.lat,
                    place.location.lng,
                    brandPlace.location.lat,
                    brandPlace.location.lng
                );
                return distance <= radius;
            });

            const matchedBrandNames = [...new Set(nearbyBrands.map(p => p.name))];
            const matchCount = matchedBrandNames.length;

            return {
                ...place,
                matchedBrands: matchedBrandNames,
                matchCount,
                nearbyBrandsCount: nearbyBrands.length,
            }
        })
        .filter(place => place.matchCount > 0)
        .sort ((a, b) => b.matchCount - a.matchCount);
    
    return matchedPlaces as any;
};
