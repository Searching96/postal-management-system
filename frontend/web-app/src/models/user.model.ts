import { UserRole } from "./enums";

/**
 * User Interface
 * Represents system users (staff members)
 */
export interface User {
  id: number;
  organizationId: number; // Belongs to which organization
  username: string; // Login username (unique)
  email: string; // Email (unique)
  passwordHash: string; // Hashed password (not exposed to frontend in real app)
  fullName: string; // Full name (Vietnamese)
  phone?: string; // Phone number
  role: UserRole; // User role
  isActive: boolean; // Active status
  lastLogin?: Date; // Last login timestamp
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}

/**
 * Auth Response Interface (for login)
 */
export interface AuthResponse {
  user: Omit<User, "passwordHash">; // User without password
  token: string; // JWT token (mock)
  expiresAt: Date; // Token expiration
}
