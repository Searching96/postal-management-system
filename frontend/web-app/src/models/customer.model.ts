import { CustomerType } from "./enums";

/**
 * Customer Interface
 * Represents customers who send packages
 */
export interface Customer {
  id: number;
  code: string; // Unique customer code (e.g., 'C001234')
  type: CustomerType; // INDIVIDUAL, SME, or ENTERPRISE
  fullName: string; // Full name (Vietnamese)
  companyName?: string; // Company name (for SME/Enterprise)
  phone: string; // Contact phone
  email?: string; // Email address
  address?: string; // Full address
  province?: string; // Province/City
  district?: string; // District
  ward?: string; // Ward/Commune
  isActive: boolean; // Active status
  createdBy: number; // User ID who created this customer
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
