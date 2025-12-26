/**
 * Location Models
 * Vietnamese administrative divisions
 */

export interface Province {
  code: string; // Province code
  name: string; // Province name (Vietnamese)
  nameEn?: string; // Province name (English)
}

export interface District {
  code: string; // District code
  name: string; // District name (Vietnamese)
  nameEn?: string; // District name (English)
  provinceCode: string; // Parent province code
}

export interface Ward {
  code: string; // Ward code
  name: string; // Ward name (Vietnamese)
  nameEn?: string; // Ward name (English)
  districtCode: string; // Parent district code
}
