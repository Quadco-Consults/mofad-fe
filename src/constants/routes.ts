// Application route constants
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',

  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    MFA_VERIFY: '/auth/mfa-verify',
  },

  // Accounts routes
  ACCOUNTS: {
    INDEX: '/accounts',
    EXPENSES: '/accounts/expenses',
    LODGEMENTS: '/accounts/lodgements',
    REVERSALS: '/accounts/reversals',
    TRANSACTIONS: '/accounts/transactions',
  },

  // Customer routes
  CUSTOMERS: {
    INDEX: '/customers',
    TYPES: '/customers/types',
    TRANSACTIONS: '/customers/transactions',
  },

  // Inventory routes
  INVENTORY: {
    WAREHOUSE: '/inventory/warehouse',
    SUBSTORE: '/inventory/substore',
    TRANSFERS: '/inventory/transfers',
    TRANSACTIONS: '/inventory/transactions',
    RETURNS: '/inventory/returns',
  },

  // Orders routes
  ORDERS: {
    PRF: '/orders/prf',
    PRO: '/orders/pro',
    APPROVALS: '/orders/approvals',
  },

  // Products routes
  PRODUCTS: {
    INDEX: '/products',
    PRICING: '/products/pricing',
    SERVICES: '/products/services',
  },

  // Channels routes
  CHANNELS: {
    LUBEBAYS: '/channels/lubebays',
    SUBSTORES: '/channels/substores',
  },

  // Settings routes
  SETTINGS: {
    USERS: '/settings/users',
    ROLES: '/settings/roles',
    DEPARTMENTS: '/settings/departments',
    WAREHOUSES: '/settings/warehouses',
    LOCATIONS: '/settings/locations',
    STATES: '/settings/states',
    EXPENSE_TYPES: '/settings/expense-types',
    PRICE_SCHEMES: '/settings/price-schemes',
    AUDIT_LOGS: '/settings/audit-logs',
    SYSTEM: '/settings/system',
    LUBEBAY_CATALOG: '/settings/lubebay-catalog',
  },

  // Reports routes
  REPORTS: {
    INDEX: '/reports',
    FINANCIAL: '/reports/financial',
    INVENTORY: '/reports/inventory',
    SALES: '/reports/sales',
    CUSTOMERS: '/reports/customers',
    STOCK: '/reports/stock-report',
  },
} as const
