// Export all types
export * from './types';

// Export all schemas
export * from './schemas';

// Default system data
export const DEFAULT_PERMISSIONS = {
  // User management
  'users.view': 'View user accounts and profiles',
  'users.create': 'Create new user accounts',
  'users.edit': 'Edit existing user accounts',
  'users.delete': 'Deactivate user accounts',
  
  // Role management
  'roles.view': 'View roles and permissions',
  'roles.create': 'Create new roles',
  'roles.edit': 'Edit existing roles',
  'roles.delete': 'Delete roles',
  
  // Yacht management
  'yachts.view': 'View yacht information',
  'yachts.create': 'Create new yacht records',
  'yachts.edit': 'Edit yacht information',
  'yachts.delete': 'Remove yacht records',
  
  // Transaction management
  'transactions.view': 'View transactions',
  'transactions.create': 'Create new transactions',
  'transactions.edit': 'Edit existing transactions',
  'transactions.delete': 'Delete transactions',
  'transactions.flag': 'Flag transactions for review',
  'transactions.approve': 'Approve flagged transactions',
  
  // Cash management
  'cash.view': 'View cash balances',
  'cash.manage': 'Manage cash balances and limits',
  
  // Reporting
  'reports.view': 'View reports and analytics',
  'reports.export': 'Export report data',
  
  // System administration
  'system.configure': 'Configure system settings',
  'system.monitor': 'Monitor system health and statistics'
};

export const DEFAULT_ROLES = [
  {
    name: 'super-admin',
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: Object.keys(DEFAULT_PERMISSIONS),
    isSystemRole: true,
    isActive: true,
    sortOrder: 0
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Administrative access to most system functions',
    permissions: [
      'users.view', 'users.create', 'users.edit',
      'roles.view', 'roles.create', 'roles.edit',
      'yachts.view', 'yachts.create', 'yachts.edit',
      'transactions.view', 'transactions.edit', 'transactions.flag', 'transactions.approve',
      'cash.view', 'cash.manage',
      'reports.view', 'reports.export',
      'system.monitor'
    ],
    isSystemRole: true,
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'manager',
    displayName: 'Yacht Manager',
    description: 'Management access for yacht operations and oversight',
    permissions: [
      'users.view',
      'yachts.view', 'yachts.edit',
      'transactions.view', 'transactions.edit', 'transactions.flag',
      'cash.view',
      'reports.view'
    ],
    isSystemRole: true,
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'captain',
    displayName: 'Captain',
    description: 'Operational access for yacht captains',
    permissions: [
      'transactions.view', 'transactions.create', 'transactions.edit',
      'cash.view'
    ],
    isSystemRole: true,
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'crew',
    displayName: 'Crew Member',
    description: 'Limited access for crew members',
    permissions: [
      'transactions.view', 'transactions.create'
    ],
    isSystemRole: true,
    isActive: true,
    sortOrder: 4
  }
];

export const DEFAULT_CURRENCIES = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    exchangeRateToUSD: 1.0,
    isDefault: true,
    isActive: true
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    exchangeRateToUSD: 0.85,
    isDefault: false,
    isActive: true
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    exchangeRateToUSD: 0.73,
    isDefault: false,
    isActive: true
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    exchangeRateToUSD: 1.35,
    isDefault: false,
    isActive: true
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    exchangeRateToUSD: 1.25,
    isDefault: false,
    isActive: true
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    exchangeRateToUSD: 0.92,
    isDefault: false,
    isActive: true
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    exchangeRateToUSD: 110.0,
    isDefault: false,
    isActive: true
  }
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  {
    name: 'Provisions',
    description: 'Food, beverages, and consumables',
    icon: 'shopping-cart'
  },
  {
    name: 'Fuel',
    description: 'Diesel, gas, and other fuel expenses',
    icon: 'gas-station'
  },
  {
    name: 'Maintenance',
    description: 'Repairs, parts, and maintenance services',
    icon: 'tools'
  },
  {
    name: 'Port Fees',
    description: 'Marina fees, docking, and port charges',
    icon: 'anchor'
  },
  {
    name: 'Crew Expenses',
    description: 'Crew wages, tips, and personal expenses',
    icon: 'users'
  },
  {
    name: 'Guest Services',
    description: 'Guest entertainment and services',
    icon: 'star'
  },
  {
    name: 'Communications',
    description: 'Internet, phone, and communication costs',
    icon: 'phone'
  },
  {
    name: 'Safety & Security',
    description: 'Safety equipment and security services',
    icon: 'shield'
  },
  {
    name: 'Transportation',
    description: 'Taxis, flights, and local transportation',
    icon: 'car'
  },
  {
    name: 'Administrative',
    description: 'Permits, documentation, and admin fees',
    icon: 'file-text'
  },
  {
    name: 'Emergency',
    description: 'Unexpected and emergency expenses',
    icon: 'alert-triangle'
  },
  {
    name: 'Other',
    description: 'Miscellaneous expenses not covered above',
    icon: 'more-horizontal'
  }
];

// Utility functions
export const formatCurrency = (amount: number, currencyCode: string, locale = 'en-US'): string => {
  const currency = DEFAULT_CURRENCIES.find(c => c.code === currencyCode);
  if (!currency) return `${amount} ${currencyCode}`;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: string | Date, locale = 'en-US'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

export const formatDateShort = (date: string | Date, locale = 'en-US'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
}; 