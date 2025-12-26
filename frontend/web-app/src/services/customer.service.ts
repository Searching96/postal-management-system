import { Customer, CustomerType } from "../models";
import { BaseService } from "./base.service";

/**
 * Customer Service
 * Manages customer data (Individual, SME, Enterprise)
 */
class CustomerServiceClass extends BaseService<Customer> {
  private mockData: Customer[] = [
    {
      id: 1,
      code: "C000001",
      type: CustomerType.INDIVIDUAL,
      fullName: "Nguyễn Văn Dũng",
      companyName: undefined,
      phone: "0912345678",
      email: "nvdung@gmail.com",
      address: "123 Nguyễn Văn Cừ",
      province: "TP. Hồ Chí Minh",
      district: "Quận 5",
      ward: "Phường 1",
      isActive: true,
      createdBy: 2,
      createdAt: new Date("2025-01-10"),
      updatedAt: new Date("2025-01-10"),
    },
    {
      id: 2,
      code: "C000002",
      type: CustomerType.SME,
      fullName: "Trần Thị Hoa",
      companyName: "Thời Trang Hoa Mai",
      phone: "0923456789",
      email: "hoamai.fashion@gmail.com",
      address: "456 Lê Văn Sỹ",
      province: "TP. Hồ Chí Minh",
      district: "Quận 3",
      ward: "Phường 2",
      isActive: true,
      createdBy: 2,
      createdAt: new Date("2025-01-05"),
      updatedAt: new Date("2025-01-05"),
    },
    {
      id: 3,
      code: "C000003",
      type: CustomerType.ENTERPRISE,
      fullName: "Phạm Minh Tuấn",
      companyName: "Công ty TNHH Điện Tử Việt",
      phone: "0934567890",
      email: "contact@electronicvn.com",
      address: "789 Điện Biên Phủ",
      province: "TP. Hồ Chí Minh",
      district: "Quận Bình Thạnh",
      ward: "Phường 25",
      isActive: true,
      createdBy: 2,
      createdAt: new Date("2024-12-20"),
      updatedAt: new Date("2024-12-20"),
    },
    {
      id: 4,
      code: "C000004",
      type: CustomerType.INDIVIDUAL,
      fullName: "Lê Thị Mai",
      companyName: undefined,
      phone: "0945678901",
      email: "lethimai87@yahoo.com",
      address: "321 Hai Bà Trưng",
      province: "Hà Nội",
      district: "Quận Hoàn Kiếm",
      ward: "Phường Cửa Nam",
      isActive: true,
      createdBy: 2,
      createdAt: new Date("2025-01-15"),
      updatedAt: new Date("2025-01-15"),
    },
    {
      id: 5,
      code: "C000005",
      type: CustomerType.SME,
      fullName: "Võ Thanh Tùng",
      companyName: "Mỹ Phẩm Thiên Nhiên",
      phone: "0956789012",
      email: "info@naturalskin.vn",
      address: "555 Cách Mạng Tháng 8",
      province: "TP. Hồ Chí Minh",
      district: "Quận Tân Bình",
      ward: "Phường 7",
      isActive: true,
      createdBy: 2,
      createdAt: new Date("2025-01-08"),
      updatedAt: new Date("2025-01-08"),
    },
  ];

  async getAll(): Promise<Customer[]> {
    return this.mockSuccess([...this.mockData]);
  }

  async getById(id: number): Promise<Customer | null> {
    const customer = this.mockData.find((c) => c.id === id);
    return this.mockSuccess(customer || null);
  }

  async create(data: Partial<Customer>): Promise<Customer> {
    const newCustomer: Customer = {
      id: this.generateId(),
      code: this.generateCode("C"),
      type: data.type || CustomerType.INDIVIDUAL,
      fullName: data.fullName || "",
      companyName: data.companyName,
      phone: data.phone || "",
      email: data.email,
      address: data.address,
      province: data.province,
      district: data.district,
      ward: data.ward,
      isActive: data.isActive ?? true,
      createdBy: data.createdBy || 1,
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    this.mockData.push(newCustomer);
    return this.mockSuccess(newCustomer);
  }

  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    const index = this.mockData.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Customer with id ${id} not found`);
    }

    this.mockData[index] = {
      ...this.mockData[index],
      ...data,
      updatedAt: this.now(),
    };

    return this.mockSuccess(this.mockData[index]);
  }

  async delete(id: number): Promise<boolean> {
    const index = this.mockData.findIndex((c) => c.id === id);
    if (index === -1) {
      return this.mockSuccess(false);
    }

    this.mockData.splice(index, 1);
    return this.mockSuccess(true);
  }

  /**
   * Search customers by name, phone, or email
   */
  async search(query: string): Promise<Customer[]> {
    const q = query.toLowerCase();
    const filtered = this.mockData.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.companyName?.toLowerCase().includes(q)
    );
    return this.mockSuccess(filtered);
  }

  /**
   * Get customers by type
   */
  async getByType(type: CustomerType): Promise<Customer[]> {
    const filtered = this.mockData.filter((c) => c.type === type);
    return this.mockSuccess(filtered);
  }

  /**
   * Get customer by phone
   */
  async getByPhone(phone: string): Promise<Customer | null> {
    const customer = this.mockData.find((c) => c.phone === phone);
    return this.mockSuccess(customer || null);
  }

  /**
   * Get customer by code
   */
  async getByCode(code: string): Promise<Customer | null> {
    const customer = this.mockData.find((c) => c.code === code);
    return this.mockSuccess(customer || null);
  }
}

export const CustomerService = new CustomerServiceClass();
