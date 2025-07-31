// 根据关键词搜索
import axios from 'axios';
import { Place } from '@/services/types'
const AMAP_WEB_SERVICE_KEY = process.env.UMI_APP_AMAP_WEB_SERVICE_KEY;

// TODO： 大模型解析type&keywords，关键词搜索+周边搜索，multipule支持&逻辑
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
