import React, { useState, useEffect, useRef } from "react";
import { AutoComplete } from "antd";
import { CloseSquareFilled } from "@ant-design/icons";
import { getPopularPlacesFromLLM, parseQueryFromLLM } from "@/services/llm";
import {
  PlaceSearchInputProps,
  AutoCompleteOption,
  Place,
} from "@/services/types";
import { SYNONYMS } from "@/constants/synonyms";
import {
  searchCombinedPlaces,
  searchPlacesByKeyword,
} from "@/services/search/placeSearch";

const PlaceSearchInput: React.FC<PlaceSearchInputProps> = ({
  value = "",
  onChange,
  onPlaceSelected,
  placeholder,
  city = "杭州",
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!searchValue && city) {
      loadPopularPlaces();
    }
  }, [city]); // 依赖 city

  const loadPopularPlaces = async () => {
    if (!city) return;

    setLoading(true);
    console.log("🌆 开始加载城市热门景点:", city);
    try {
      const places = await getPopularPlacesFromLLM(city);
      console.log("✅ 加载成功，景点数量:", places.length);
      const options = places.map((p) => ({
        value: p.name,
        label: p.name,
        address: p.address,
        place: p,
      }));
      setOptions(options);
    } catch (err) {
      console.error("❌ 加载热门景点失败:", err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const handleSelect = (value: string, option: AutoCompleteOption) => {
    const place = option.place as Place;
    setSelectedPlace(place);
    setSearchValue(place.name);
    onChange?.(place.name);
    onPlaceSelected(place);
  };

  const clearSelection = () => {
    setSelectedPlace(null);
    setSearchValue("");
    onChange?.("");
    onPlaceSelected(null);
  };

  const normalizeInput = (input: string): string => {
    const words = input.split(" ");
    return words
      .map((word) => SYNONYMS[word] || word) // 使用同义词映射
      .join(" ");
  };

  const handleSearch = async (input: string) => {
    const inputValue = normalizeInput(input);
    console.log("[PlaceSearchInput] handleSearch called:", {
      inputValue,
      city,
    });

    setSearchValue(inputValue);
    onChange?.(inputValue);

    if (!inputValue.trim()) {
      console.log("[PlaceSearchInput] 输入为空，准备加载热门景点，city:", city);

      if (city) {
        try {
          setLoading(true);
          console.log(
            "[PlaceSearchInput] 正在调用 getPopularPlacesFromLLM(",
            city,
            ")"
          );

          console.log("city:", city);
          const places = await getPopularPlacesFromLLM(city);
          console.log("[PlaceSearchInput] LLM 返回结果:", places);

          if (places.length === 0) {
            console.warn("[PlaceSearchInput] LLM 返回空数组");
          }

          const options = places.map((p) => ({
            value: p.name,
            label: p.name,
            address: p.address,
            place: p,
          }));
          setOptions(options);
        } catch (err) {
          console.error("[PlaceSearchInput] LLM 请求失败:", err);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("[PlaceSearchInput] city 为空，不加载");
        setOptions([]);
      }
      return;
    }

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    setLoading(true);

    timerRef.current = window.setTimeout(async () => {
      let results: Place[] = [];

      const isComplexQuery =
        (inputValue.includes("有") && inputValue.includes("的")) ||
        (inputValue.includes("和") &&
          (inputValue.includes("的") || inputValue.includes("附近")));

      if (isComplexQuery) {
        const parsed = await parseQueryFromLLM(inputValue);
        const { types, keywords } = parsed;

        if (types.length > 0 && keywords.length > 0) {
          results = await searchCombinedPlaces(types, keywords, city, 300);
        }
      }
      if (results.length === 0) {
        results = await searchPlacesByKeyword(inputValue, city);
      }

      const searchOptions = results.map((p) => {
        let label = p.name;
        if ("matchedBrands" in p && Array.isArray((p as any).matchedBrands)) {
          const matched = (p as any).matchedBrands.join("、");
          label = `${p.name} (含${matched})`;
        }
        return {
          value: p.name,
          label,
          address: p.address,
          place: {...p},
        };
      });
      setOptions(searchOptions);
      setLoading(false);
    }, 300);
  };

  return (
    <div style={{ width: "100%" }}>
      <AutoComplete
        allowClear={{ clearIcon: <CloseSquareFilled /> }}
        value={searchValue}
        options={options}
        onSelect={handleSelect}
        onSearch={handleSearch}
        onClear={clearSelection}
        placeholder={placeholder}
        notFoundContent={
          loading ? (
            <div
              style={{ color: "#1890ff", padding: "8px", textAlign: "center" }}
            >
              🔍 正在生成 {city} 的热门景点推荐...
            </div>
          ) : (
            "无匹配结果"
          )
        }
        style={{ width: "100%" }}
      >
        {options.map((option) => (
          <AutoComplete.Option
            key={option.value}
            value={option.value}
          >
            {''}
          </AutoComplete.Option>
        ))}
        
      </AutoComplete>
    </div>
  );
};

export default PlaceSearchInput;
