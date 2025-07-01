import { z } from 'zod';

// Base pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// User schemas
export const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  assignedRoles: z.array(z.string()).default([]),
  preferences: z.record(z.any()).optional()
});

export const UpdateUserSchema = CreateUserSchema.partial();

export const UserFiltersSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  roleId: z.string().optional(),
  yachtId: z.string().optional()
});

// Role schemas
export const CreateRoleSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  sortOrder: z.number().optional(),
  isActive: z.boolean().default(true)
});

export const UpdateRoleSchema = CreateRoleSchema.partial();

// Currency schemas
export const CreateCurrencyCodeSchema = z.object({
  code: z.string().length(3),
  name: z.string().min(1),
  symbol: z.string().min(1),
  exchangeRateToUSD: z.number().positive().default(1),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

export const UpdateCurrencyCodeSchema = CreateCurrencyCodeSchema.partial();

// System configuration schemas
export const CreateSystemConfigSchema = z.object({
  category: z.string().min(1),
  key: z.string().min(1),
  value: z.string(),
  description: z.string().optional(),
  dataType: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  isSensitive: z.boolean().default(false)
});

export const UpdateSystemConfigSchema = CreateSystemConfigSchema.partial();

// Yacht schemas
export const CreateYachtSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  length: z.number().positive().optional(),
  flag: z.string().optional(),
  homePort: z.string().optional(),
  ownerUserId: z.string(),
  managerUserId: z.string().optional(),
  primaryCaptainUserId: z.string().optional(),
  description: z.string().optional()
});

export const UpdateYachtSchema = CreateYachtSchema.partial();

// Transaction schemas
export const CreateTransactionSchema = z.object({
  yachtId: z.string(),
  amount: z.number().positive(),
  currencyCodeId: z.string(),
  description: z.string().min(1),
  expenseCategoryId: z.string().optional(),
  recipientId: z.string().optional(),
  transactionDate: z.string().datetime(),
  location: z.string().optional(),
  notes: z.string().optional()
});

export const UpdateTransactionSchema = CreateTransactionSchema.partial();

export const TransactionFiltersSchema = z.object({
  yachtId: z.string().optional(),
  currencyCodeId: z.string().optional(),
  expenseCategoryId: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FLAGGED', 'CANCELLED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional()
});

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional()
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

// Export all schemas as a convenience
export const schemas = {
  // Base
  PaginationSchema,
  
  // User
  CreateUserSchema,
  UpdateUserSchema,
  UserFiltersSchema,
  
  // Role
  CreateRoleSchema,
  UpdateRoleSchema,
  
  // Currency
  CreateCurrencyCodeSchema,
  UpdateCurrencyCodeSchema,
  
  // System
  CreateSystemConfigSchema,
  UpdateSystemConfigSchema,
  
  // Yacht
  CreateYachtSchema,
  UpdateYachtSchema,
  
  // Transaction
  CreateTransactionSchema,
  UpdateTransactionSchema,
  TransactionFiltersSchema,
  
  // Auth
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema
};

// Type inference helpers
export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type CreateRoleData = z.infer<typeof CreateRoleSchema>;
export type CreateYachtData = z.infer<typeof CreateYachtSchema>;
export type CreateTransactionData = z.infer<typeof CreateTransactionSchema>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>;
export type UserFilters = z.infer<typeof UserFiltersSchema>; 