import { OrganizationType } from "./enums";

/**
 * Organization Interface
 * Represents a 3-tier hierarchical structure: HQ -> Branch -> Post Office
 */
export interface Organization {
  id: number;
  code: string; // Unique code (e.g., 'HQ001', 'BR001', 'PO001')
  name: string; // Organization name
  type: OrganizationType; // HQ, BRANCH, or POST_OFFICE
  parentId: number | null; // Parent organization ID (null for HQ)
  level: number; // 1 = HQ, 2 = Branch, 3 = Post Office
  address?: string; // Full address
  province?: string; // Province/City
  district?: string; // District
  ward?: string; // Ward/Commune
  phone?: string; // Contact phone
  email?: string; // Contact email
  isActive: boolean; // Active status
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
