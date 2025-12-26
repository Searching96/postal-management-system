import { Province, District, Ward } from "../models";
import { BaseService } from "./base.service";

/**
 * Location Service
 * Provides Vietnamese administrative divisions (Province, District, Ward)
 */
class LocationServiceClass extends BaseService<Province> {
  private provinces: Province[] = [
    { code: "HCM", name: "TP. Hồ Chí Minh", nameEn: "Ho Chi Minh City" },
    { code: "HN", name: "Hà Nội", nameEn: "Hanoi" },
    { code: "DN", name: "Đà Nẵng", nameEn: "Da Nang" },
    { code: "BD", name: "Bình Dương", nameEn: "Binh Duong" },
    { code: "DNA", name: "Đồng Nai", nameEn: "Dong Nai" },
    { code: "CT", name: "Cần Thơ", nameEn: "Can Tho" },
    { code: "HP", name: "Hải Phòng", nameEn: "Hai Phong" },
    { code: "KH", name: "Khánh Hòa", nameEn: "Khanh Hoa" },
  ];

  private districts: District[] = [
    // TP. Hồ Chí Minh
    {
      code: "HCM-Q1",
      name: "Quận 1",
      nameEn: "District 1",
      provinceCode: "HCM",
    },
    {
      code: "HCM-Q3",
      name: "Quận 3",
      nameEn: "District 3",
      provinceCode: "HCM",
    },
    {
      code: "HCM-Q5",
      name: "Quận 5",
      nameEn: "District 5",
      provinceCode: "HCM",
    },
    {
      code: "HCM-Q7",
      name: "Quận 7",
      nameEn: "District 7",
      provinceCode: "HCM",
    },
    {
      code: "HCM-Q10",
      name: "Quận 10",
      nameEn: "District 10",
      provinceCode: "HCM",
    },
    {
      code: "HCM-TB",
      name: "Quận Tân Bình",
      nameEn: "Tan Binh District",
      provinceCode: "HCM",
    },
    {
      code: "HCM-BT",
      name: "Quận Bình Thạnh",
      nameEn: "Binh Thanh District",
      provinceCode: "HCM",
    },
    {
      code: "HCM-PN",
      name: "Quận Phú Nhuận",
      nameEn: "Phu Nhuan District",
      provinceCode: "HCM",
    },
    {
      code: "HCM-TD",
      name: "Quận Thủ Đức",
      nameEn: "Thu Duc District",
      provinceCode: "HCM",
    },

    // Hà Nội
    {
      code: "HN-HK",
      name: "Quận Hoàn Kiếm",
      nameEn: "Hoan Kiem District",
      provinceCode: "HN",
    },
    {
      code: "HN-BD",
      name: "Quận Ba Đình",
      nameEn: "Ba Dinh District",
      provinceCode: "HN",
    },
    {
      code: "HN-DD",
      name: "Quận Đống Đa",
      nameEn: "Dong Da District",
      provinceCode: "HN",
    },
    {
      code: "HN-HBT",
      name: "Quận Hai Bà Trưng",
      nameEn: "Hai Ba Trung District",
      provinceCode: "HN",
    },
    {
      code: "HN-CG",
      name: "Quận Cầu Giấy",
      nameEn: "Cau Giay District",
      provinceCode: "HN",
    },

    // Đà Nẵng
    {
      code: "DN-HC",
      name: "Quận Hải Châu",
      nameEn: "Hai Chau District",
      provinceCode: "DN",
    },
    {
      code: "DN-TK",
      name: "Quận Thanh Khê",
      nameEn: "Thanh Khe District",
      provinceCode: "DN",
    },
  ];

  private wards: Ward[] = [
    // Quận 1, TP.HCM
    {
      code: "HCM-Q1-BN",
      name: "Phường Bến Nghé",
      nameEn: "Ben Nghe Ward",
      districtCode: "HCM-Q1",
    },
    {
      code: "HCM-Q1-BT",
      name: "Phường Bến Thành",
      nameEn: "Ben Thanh Ward",
      districtCode: "HCM-Q1",
    },
    {
      code: "HCM-Q1-NT",
      name: "Phường Nguyễn Thái Bình",
      nameEn: "Nguyen Thai Binh Ward",
      districtCode: "HCM-Q1",
    },

    // Quận 3, TP.HCM
    {
      code: "HCM-Q3-P1",
      name: "Phường 1",
      nameEn: "Ward 1",
      districtCode: "HCM-Q3",
    },
    {
      code: "HCM-Q3-P2",
      name: "Phường 2",
      nameEn: "Ward 2",
      districtCode: "HCM-Q3",
    },
    {
      code: "HCM-Q3-P3",
      name: "Phường 3",
      nameEn: "Ward 3",
      districtCode: "HCM-Q3",
    },

    // Quận Hoàn Kiếm, Hà Nội
    {
      code: "HN-HK-CTD",
      name: "Phường Cửa Đông",
      nameEn: "Cua Dong Ward",
      districtCode: "HN-HK",
    },
    {
      code: "HN-HK-CTN",
      name: "Phường Cửa Nam",
      nameEn: "Cua Nam Ward",
      districtCode: "HN-HK",
    },
  ];

  async getAll(): Promise<Province[]> {
    return this.mockSuccess(this.provinces);
  }

  async getById(id: number): Promise<Province | null> {
    return this.mockSuccess(null); // Not used for provinces
  }

  async create(data: Partial<Province>): Promise<Province> {
    throw new Error("Not implemented for location service");
  }

  async update(id: number, data: Partial<Province>): Promise<Province> {
    throw new Error("Not implemented for location service");
  }

  async delete(id: number): Promise<boolean> {
    throw new Error("Not implemented for location service");
  }

  /**
   * Get all provinces
   */
  async getProvinces(): Promise<Province[]> {
    return this.mockSuccess(this.provinces);
  }

  /**
   * Get districts by province code
   */
  async getDistrictsByProvince(provinceCode: string): Promise<District[]> {
    const filtered = this.districts.filter(
      (d) => d.provinceCode === provinceCode
    );
    return this.mockSuccess(filtered);
  }

  /**
   * Get wards by district code
   */
  async getWardsByDistrict(districtCode: string): Promise<Ward[]> {
    const filtered = this.wards.filter((w) => w.districtCode === districtCode);
    return this.mockSuccess(filtered);
  }

  /**
   * Search location by name
   */
  async searchLocation(query: string): Promise<{
    provinces: Province[];
    districts: District[];
    wards: Ward[];
  }> {
    const q = query.toLowerCase();

    const provinces = this.provinces.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.nameEn?.toLowerCase().includes(q)
    );

    const districts = this.districts.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.nameEn?.toLowerCase().includes(q)
    );

    const wards = this.wards.filter(
      (w) =>
        w.name.toLowerCase().includes(q) || w.nameEn?.toLowerCase().includes(q)
    );

    return this.mockSuccess({ provinces, districts, wards });
  }
}

export const LocationService = new LocationServiceClass();
