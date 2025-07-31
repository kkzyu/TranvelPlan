import axios from "axios";

export const parseQueryFromLLM = async (
  query: string
): Promise<{ types: string[]; keywords: string[] }> => {
  const API_KEY = process.env.UMI_APP_LLM_API_KEY;
  const MODEL = "qwen-plus";

  const prompt = `
请分析以下用户搜索语句，提取两个字段：

1. "types": 用户想查找的**场所类型**（如：商场、公园、餐厅、电影院）
   - 必须是通用类别，不能是品牌名
   - 示例：商场、超市、酒店、博物馆

2. "brands": 用户明确提到的**品牌或连锁店名称**
   - 只包括具体品牌，如星巴克、优衣库、海底捞
   - 不包括“附近”、“大型”等修饰词

返回纯 JSON，不要解释。

用户输入：“${query}”

示例输出：
{
  "types": ["商场"],
  "brands": ["星巴克", "优衣库"]
}
`;

  try {
    const response = await axios.post(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      {
        model: MODEL,
        input: {
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        parameters: {
          result_format: "message",
          temperature: 0.5,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.output.text.trim();

    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{.*\})/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;

    const result = JSON.parse(jsonString);
    return {
      types: result.types || [],
      keywords: result.keywords || [],
    };
  } catch (err) {
    console.error("LLM 请求失败:", err);
    return { types: [], keywords: [] };
  }
};
