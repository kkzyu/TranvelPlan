import React,{useState, useEffect, useRef} from "react";
import { AutoComplete , Tag } from "antd";
import { CloseSquareFilled } from "@ant-design/icons";
import { PlaceSearchInputProps, AutoCompleteOption, Place, searchPlacesByKeyword } from '@/services/maps';

const PlaceSearchInput:React.FC<PlaceSearchInputProps>=({
   value='',
   onChange,
   onPlaceSelected,
   placeholder = '输入景点名称搜索',
   city='',
})=>{
    const[searchValue, setSearchValue] = useState(value);
    const [options, setOptions] = useState<AutoCompleteOption[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<Place| null>(null);   
    const [loading,setLoading] = useState(false);
    const timerRef = useRef<number|null>(null);
    console.log('AMAP_KEY:', process.env);

    useEffect(()=>{
        setSearchValue(value);
    },[value]);

    const handleSelect = (value:string, option:AutoCompleteOption)=>{
        const place = option.place as Place;
        setSelectedPlace(place);
        setSearchValue(place.name);
        onChange?.(place.name);
        onPlaceSelected(place);
    }

    const clearSelection = () => {
        setSelectedPlace(null);
        setSearchValue('');
        onChange?.('');
        onPlaceSelected(null);
    }
    const handleSearch = (inputValue:string)=>{
        setSearchValue(inputValue);
        onChange?.(inputValue)

        if(!inputValue.trim()){
            setOptions([]);
            return;
        }

        if(timerRef.current){
            window.clearTimeout(timerRef.current);
        }

        setLoading(true);

        timerRef.current = window.setTimeout(async()=>{
            const places = await searchPlacesByKeyword(inputValue,city);
            const searchOptions = places.map((p)=>({
                value:p.name,
                label:p.name,
                address:p.address,
                place:p
            }));
            setOptions(searchOptions);
            setLoading(false);
        },300);
    }
    return (
        <div style={{width:'100%'}}>
            <AutoComplete
            allowClear={{clearIcon:<CloseSquareFilled/>}}
            value={searchValue}
            options={options}
            onSelect={handleSelect}
            onSearch={handleSearch}
            onClear={clearSelection}
            placeholder={placeholder}
            notFoundContent={loading?'搜索中...':'无匹配结果'}
            style={{width:'100%'}}
        >
        {options.map((option)=>(
            <AutoComplete.Option key={option.value} value={option.value} data-place={option.place}>
                <div className="search-option">
                    <div style={{ fontWeight: 'bold' }}>{option.label}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{option.address}</div>
                </div>
            </AutoComplete.Option>
        ))}
        {selectedPlace && (
            <Tag color="blue" closable onClose={clearSelection} style={{marginTop:8}}>{selectedPlace.name}</Tag>
        )}
        </AutoComplete>
        </div>
    )
}


export default PlaceSearchInput;
