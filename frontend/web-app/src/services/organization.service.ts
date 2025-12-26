import { Organization, OrganizationType } from "../models";
import { BaseService } from "./base.service";

/**
 * Organization Service
 * Manages organizations (HQ, Branch, Post Office)
 */
class OrganizationServiceClass extends BaseService<Organization> {
  private mockData: Organization[] = [
    {
      id: 1,
      code: "HQ001",
      name: "Trụ sở Chính",
      type: OrganizationType.HQ,
      parentId: null,
      level: 1,
      address: "123 Nguyễn Huệ",
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      phone: "0281234567",
      email: "contact@postal.vn",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 2,
      code: "BR001",
      name: "Chi nhánh Miền Nam",
      type: OrganizationType.BRANCH,
      parentId: 1,
      level: 2,
      address: "456 Võ Văn Tần",
      province: "TP. Hồ Chí Minh",
      district: "Quận 3",
      ward: "Phường 1",
      phone: "0281234568",
      email: "south@postal.vn",
      isActive: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: 3,
      code: "PO001",
      name: "Bưu cục Quận 1",
      type: OrganizationType.POST_OFFICE,
      parentId: 2,
      level: 3,
      address: "789 Lê Lợi",
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Thành",
      phone: "0281234569",
      email: "q1@postal.vn",
      isActive: true,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
    },
    {
      id: 4,
      code: "PO002",
      name: "Bưu cục Quận 3",
      type: OrganizationType.POST_OFFICE,
      parentId: 2,
      level: 3,
      address: "321 Cách Mạng Tháng 8",
      province: "TP. Hồ Chí Minh",
      district: "Quận 3",
      ward: "Phường 3",
      phone: "0281234570",
      email: "q3@postal.vn",
      isActive: true,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
    },
    {
      id: 5,
      code: "BR002",
      name: "Chi nhánh Miền Bắc",
      type: OrganizationType.BRANCH,
      parentId: 1,
      level: 2,
      address: "111 Hai Bà Trưng",
      province: "Hà Nội",
      district: "Quận Hoàn Kiếm",
      ward: "Phường Cửa Đông",
      phone: "0241234567",
      email: "north@postal.vn",
      isActive: true,
      createdAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-01-20"),
    },
  ];

  async getAll(): Promise<Organization[]> {
    return this.mockSuccess([...this.mockData]);
  }

  async getById(id: number): Promise<Organization | null> {
    const org = this.mockData.find((o) => o.id === id);
    return this.mockSuccess(org || null);
  }

  async create(data: Partial<Organization>): Promise<Organization> {
    const newOrg: Organization = {
      id: this.generateId(),
      code: data.code || this.generateCode("ORG"),
      name: data.name || "",
      type: data.type || OrganizationType.POST_OFFICE,
      parentId: data.parentId || null,
      level: data.level || 3,
      address: data.address,
      province: data.province,
      district: data.district,
      ward: data.ward,
      phone: data.phone,
      email: data.email,
      isActive: data.isActive ?? true,
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    this.mockData.push(newOrg);
    return this.mockSuccess(newOrg);
  }

  async update(id: number, data: Partial<Organization>): Promise<Organization> {
    const index = this.mockData.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Organization with id ${id} not found`);
    }

    this.mockData[index] = {
      ...this.mockData[index],
      ...data,
      updatedAt: this.now(),
    };

    return this.mockSuccess(this.mockData[index]);
  }

  async delete(id: number): Promise<boolean> {
    const index = this.mockData.findIndex((o) => o.id === id);
    if (index === -1) {
      return this.mockSuccess(false);
    }

    this.mockData.splice(index, 1);
    return this.mockSuccess(true);
  }

  /**
   * Get organizations by type
   */
  async getByType(type: OrganizationType): Promise<Organization[]> {
    const filtered = this.mockData.filter((o) => o.type === type);
    return this.mockSuccess(filtered);
  }

  /**
   * Get child organizations
   */
  async getChildren(parentId: number): Promise<Organization[]> {
    const filtered = this.mockData.filter((o) => o.parentId === parentId);
    return this.mockSuccess(filtered);
  }

  /**
   * Get organization by code
   */
  async getByCode(code: string): Promise<Organization | null> {
    const org = this.mockData.find((o) => o.code === code);
    return this.mockSuccess(org || null);
  }
}

export const OrganizationService = new OrganizationServiceClass();
