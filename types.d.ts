interface Place {
    id:string;
    name:string;
    address:string;
    location:{lat:number;lng:number};
    cityname?:string;
    adname?:string;
}

export interface Option {
  value: string;
  label: string;
  children?: Option[];
}

export type CityOptions = Option[];