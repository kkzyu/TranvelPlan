// src/components/AMapSearchInput.tsx
import { useState, useEffect } from 'react';
import { AutoComplete } from 'antd';
import { mockAMapSearch } from '@/mocks/api';

interface Props {
  value: string;
  onChange: (value: string) => void;
  location?: string;
}

export default function AMapSearchInput({ value, onChange, location = '北京' }: Props) {
  const [options, setOptions] = useState<Array<{value: string, label: JSX.Element}>>([]);

  useEffect(() => {
    if (value.length < 2) {
      setOptions([]);
      return;
    }

mockAMapSearch(value, location).then(result => {
      setOptions(result.suggestions.map(s => ({
        value: s.name,
        label: (
          <div>
            <div>{s.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{s.location}</div>
          </div>
        )
      })));
    });
  }, [value, location]);

  return (
    <AutoComplete
      value={value}
      options={options}
      onSearch={(text) => onChange(text)}
      onSelect={(value) => onChange(value)}
      placeholder="输入景点名称"
      style={{ width: 200, marginRight: 8 }}
    />
  );
}