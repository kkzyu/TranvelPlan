import axios from 'axios';

export interface Place {
    id: string;
    name: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    cityname: string;
    adname: string;
}

export interface PlaceSearchInputProps {
    value?: string;
    onChange?: (value: string) => void;
    onPlaceSelected: (place: Place | null) => void;
    placeholder?: string;
    city?: string;
}

export interface AutoCompleteOption {
    value: string;
    label: string;
    address: string;
    place: Place;
}

/**
 * 根据关键字搜索地点
 * @param keyword 搜索关键字
 * @param city 搜索城市（可选）
 * @returns 返回地点列表 Promise
 */
export const searchPlacesByKeyword = async (keyword: string, city: string): Promise<Place[]> => {
    const AMAP_KEY = process.env.UMI_APP_AMAP_KEY;
    try {
        const response = await axios.get('https://restapi.amap.com/v5/place/text', {
            params: {
                key: AMAP_KEY,
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