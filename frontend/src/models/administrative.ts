export interface RegionResponse {
  id: number;
  name: string;
}

export interface ProvinceResponse {
  code: string;
  name: string;
  administrativeRegionName: string;
}

export interface WardResponse {
  code: string;
  name: string;
  provinceName: string;
}
