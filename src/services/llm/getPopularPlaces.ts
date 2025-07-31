import axios from "axios";
import { Place } from "../types";

// src/services/llm/getPopularPlaces.ts
export const getPopularPlacesFromLLM = async (city: string): Promise<Place[]> => {
  if (!city || typeof city !== 'string') {
    console.warn('⚠️ city 无效，使用默认城市“北京”');
    city = '北京';
  }

  const trimmedCity = city.trim();
  if (!trimmedCity) return [];

  const API_KEY = process.env.UMI_APP_LLM_API_KEY;
  if (!API_KEY) {
    console.error('❌ 未配置 LLM_API_KEY');
    return [];
  }

  const prompt = `
请列出${trimmedCity}最受欢迎的8个旅游景点，要求：
- 按热度从高到低排序
- 每个景点包含字段：id、name、address、location(lat,lng)、cityname、adname、description
- 返回纯 JSON 数组，不要额外说明

示例格式：
[
  {
    "id": "bj-gugong-001",
    "name": "故宫",
    "address": "北京市东城区景山前街4号",
    "location": { "lat": 39.9165, "lng": 116.397 },
    "cityname": "北京市",
    "adname": "东城区",
    "description": "明清皇家宫殿，世界文化遗产"
  }
]
  `;

  try {
    const response = await axios.post(
      '/api/llm/generation',
      {
        model: 'qwen-plus',
        input: {
          messages: [{ role: 'user', content: prompt }],
        },
        parameters: {
          result_format: 'message',
          temperature: 0.2,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Qwen 响应:', response.data);

    // ✅ 正确提取 content
    const content = response.data.output.choices[0]?.message?.content;
    if (!content) {
      console.error('❌ LLM 返回内容为空');
      return [];
    }

    console.log('📝 LLM 返回文本:', content);

    // 尝试提取 JSON（可能被包裹在 ```json ... ``` 中）
    let jsonString = content.trim();

    // 匹配 ```json ... ```
    const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    } else {
      // 否则尝试匹配第一个 [{...}] 或 [...] 结构
      const arrayMatch = jsonString.match(/(\[.*\])/s);
      if (arrayMatch) {
        jsonString = arrayMatch[1];
      }
    }

    let places: Place[] = JSON.parse(jsonString);

    // ✅ 确保 location 是 { lat, lng } 结构
    places = places.map(p => ({
      ...p,
      location: p.location || { lat: 0, lng: 0 }, // 防止 undefined
    }));

    console.log('✅ 解析成功，景点数量:', places.length);
    return places;

  } catch (err: any) {
    console.error('❌ LLM 请求失败:', err.message || err);
    if (err.response) {
      console.error('响应数据:', err.response.data);
    }
    return [];
  }
};
