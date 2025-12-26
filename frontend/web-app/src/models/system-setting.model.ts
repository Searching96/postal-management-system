/**
 * System Setting Interface
 * Configurable system settings (key-value pairs)
 */
export interface SystemSetting {
  id: number;
  settingKey: string; // Setting key (unique)
  settingValue: string; // Setting value (stored as text/JSON)
  dataType: string; // Data type (string, number, boolean, json)
  category?: string; // Setting category
  description?: string; // Description
  isPublic: boolean; // Whether visible to non-admins
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
