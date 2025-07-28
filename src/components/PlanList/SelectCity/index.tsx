import React from 'react';
import { Cascader } from 'antd';
import {CityOptions} from '@/constants/options'

interface SelectOptionProps{
  value?: string,
  onChange?:(value:string[], selectOptions: CityOptions)=>void,
}

const SelectCity: React.FC<SelectOptionProps> = ({
  value='',
  onChange,
}) => (
  <Cascader defaultValue={['浙江', '杭州']} options={CityOptions} onChange={onChange}/>
);

export default SelectCity;