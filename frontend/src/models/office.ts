
export interface WardOfficePairResponse {
  officePairId: string;
  warehouse: {
    officeId: string;
    officeName: string;
    officeEmail: string;
    officePhoneNumber: string;
    officeAddress: string;
    officeType: string;
    parentOfficeId: string;
    parentOfficeName: string;
  };
  postOffice: {
    officeId: string;
    officeName: string;
    officeEmail: string;
    officePhoneNumber: string;
    officeAddress: string;
    officeType: string;
    parentOfficeId: string;
    parentOfficeName: string;
  };
  provinceCode: string;
  provinceName: string;
  regionName: string;
  assignedWards: Array<{
    wardCode: string;
    wardName: string;
  }>;
  createdAt: string;
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
  isAssigned: boolean;
  assignedWarehouseId: string | null;
  assignedPostOfficeId: string | null;
}
