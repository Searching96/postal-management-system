import type { WardResponse } from "./administrative";

export interface WardOfficePairResponse {
  officePairId: string;
  wardPostId: string;
  wardPostName: string;
  wardWarehouseId: string;
  wardWarehouseName: string;
  provinceName: string;
  wards: WardResponse[];
}

export interface CreateWardOfficeRequest {
  warehouseName: string;
  warehouseEmail: string;
  warehousePhoneNumber: string;
  warehouseAddress: string;
  warehouseCapacity: number;
  postOfficeName: string;
  postOfficeEmail: string;
  postOfficePhoneNumber: string;
  postOfficeAddress: string;
  provinceCode?: string;
}

export interface AssignWardsRequest {
  officePairId: string;
  wardCodes: string[];
}

export interface WardAssignmentInfo {
  wardCode: string;
  wardName: string;
  assigned: boolean;
  officePairId?: string;
  wardPostName?: string;
}
