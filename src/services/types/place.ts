// 关键词检索
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