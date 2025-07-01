// Base types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User & Authentication
export interface User extends BaseEntity {
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  assignedRoles: string[]; // Role IDs
  permissions?: string[]; // Permission overrides
  lastLogin?: Date;
  createdByUserId?: string;
}

export interface Profile extends BaseEntity {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emergencyContact?: string;
  address?: string;
  country?: string;
  preferredLanguage: string;
  timezone: string;
  preferences: Record<string, any>;
  avatarUrl?: string;
}

// RBAC
export interface Role extends BaseEntity {
  name: string;
  displayName: string;
  description: string;
  permissions: string[]; // Permission IDs
  isSystemRole: boolean;
  isActive: boolean;
  sortOrder: number;
  createdByUserId: string;
}

export interface Permission extends BaseEntity {
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  isSystemPermission: boolean;
  isActive: boolean;
  createdByUserId: string;
}

// Yacht Management
export interface Yacht extends BaseEntity {
  name: string;
  imoNumber?: string;
  ownerUserId: string;
  primaryCaptainUserId?: string;
  managerUserId?: string;
  isActive: boolean;
}

export interface YachtUser {
  id: string;
  yachtId: string;
  userId: string;
  roleId: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  assignedByUserId: string;
}

// Financial
export interface CurrencyCode extends BaseEntity {
  code: string; // USD, EUR, GBP
  name: string; // US Dollar
  symbol: string; // $
  decimalPlaces: number;
  isActive: boolean;
  isDefault: boolean;
  createdByUserId: string;
}

export interface CashBalance extends BaseEntity {
  yachtId: string;
  currencyCodeId: string;
  amount: number;
  thresholdAlert: number;
  lastUpdated: Date;
  updatedByUserId: string;
}

export interface Transaction extends BaseEntity {
  yachtId: string;
  createdByUserId: string;
  recipientId?: string;
  expenseCategoryId: string;
  amount: number;
  currencyCodeId: string;
  description: string;
  transactionDate: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'confirmed' | 'flagged' | 'approved';
  notes?: string;
}

export interface Receipt extends BaseEntity {
  transactionId: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedByUserId: string;
}

export interface CashRecipient extends BaseEntity {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  country?: string;
  taxId?: string;
  isVerified: boolean;
  isBlacklisted: boolean;
  verificationNotes?: string;
  createdByUserId: string;
}

// Categories & Configuration
export interface ExpenseCategory extends BaseEntity {
  name: string;
  description?: string;
  yachtId?: string; // null for default categories
  defaultCategoryId?: string;
  isDefault: boolean;
  createdByUserId: string;
}

export interface DefaultExpenseCategory extends BaseEntity {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  createdByUserId: string;
}

// Workflow & Notifications
export interface Confirmation {
  id: string;
  transactionId: string;
  recipientId: string;
  method: 'sms' | 'email' | 'link';
  contactInfo: string;
  sentAt?: Date;
  confirmedAt?: Date;
  confirmationToken: string;
  status: 'pending' | 'confirmed' | 'expired' | 'failed';
  retryCount: number;
  failureReason?: string;
}

export interface TransactionFlag extends BaseEntity {
  transactionId: string;
  flaggedByUserId: string;
  flagTypeId: string;
  reason: string;
  resolutionNotes?: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolvedAt?: Date;
  resolvedByUserId?: string;
}

export interface FlagType extends BaseEntity {
  name: string;
  displayName: string;
  description: string;
  color: string;
  requiresApproval: boolean;
  isActive: boolean;
  createdByUserId: string;
}

export interface Alert extends BaseEntity {
  yachtId?: string;
  userId: string;
  alertTypeId: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  readAt?: Date;
  isRead: boolean;
}

export interface AlertType extends BaseEntity {
  name: string;
  displayName: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  defaultSettings: Record<string, any>;
  createdByUserId: string;
}

// System Configuration
export interface SystemConfiguration extends BaseEntity {
  key: string;
  value: string;
  description: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  isSensitive: boolean;
  category: string;
  updatedByUserId: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, any>;
} 