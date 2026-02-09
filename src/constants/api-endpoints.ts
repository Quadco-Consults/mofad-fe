// API endpoint constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/token/refresh/',
    CHANGE_PASSWORD: '/auth/change-password/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: '/auth/reset-password/',
    MFA_VERIFY: '/auth/mfa/verify/',
  },

  USERS: '/users/',
  CUSTOMERS: '/customers/',
  PRODUCTS: '/products/',
  SERVICES: '/services/',
  SUPPLIERS: '/suppliers/',
  WAREHOUSES: '/warehouses/',
  SUBSTORES: '/substores/',
  LUBEBAYS: '/lubebays/',

  ORDERS: {
    PRF: '/purchase-requisitions/',
    PRO: '/purchase-orders/',
  },

  INVENTORY: {
    WAREHOUSE: '/warehouse-inventory/',
    SUBSTORE: '/substore-inventory/',
    TRANSFERS: '/stock-transfers/',
    TRANSACTIONS: '/stock-transactions/',
  },

  ACCOUNTS: {
    EXPENSES: '/expenses/',
    LODGEMENTS: '/lodgements/',
    TRANSACTIONS: '/transactions/',
  },

  SETTINGS: {
    ROLES: '/roles/',
    DEPARTMENTS: '/departments/',
    LOCATIONS: '/locations/',
    STATES: '/states/',
    EXPENSE_TYPES: '/expense-types/',
    PRICE_SCHEMES: '/price-schemes/',
    AUDIT_LOGS: '/audit-logs/',
    SYSTEM: '/system-settings/',
  },
} as const
