// Mock API client for standalone frontend testing
import { LoginForm, User } from '../types'

// Mock user data
// Default user with Super Admin permissions for compatibility
const MOCK_USER: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@mofadenergysolutions.com',
  email_verified_at: '2023-01-01T00:00:00.000Z',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  permissions: MOCK_ROLES.Super_Admin.permissions,
  roles: [MOCK_ROLES.Super_Admin],
}

// Mock credentials for testing with MOFAD organizational roles
const MOCK_CREDENTIALS = [
  { email: 'superadmin@mofadenergysolutions.com', password: 'superadmin123', role: 'Super_Admin' },
  { email: 'management@mofadenergysolutions.com', password: 'management123', role: 'Management' },
  { email: 'finance.manager@mofadenergysolutions.com', password: 'finance123', role: 'Finance_Manager' },
  { email: 'store.keeper@mofadenergysolutions.com', password: 'store123', role: 'Store_Keeper' },
  { email: 'lubebay.manager@mofadenergysolutions.com', password: 'lube123', role: 'Lube_Bay_Manager' },
  { email: 'sales.rep@mofadenergysolutions.com', password: 'sales123', role: 'Sales_Rep' },
  { email: 'user@mofadenergysolutions.com', password: 'user123', role: 'User' },
]

// MOFAD Organizational Roles with Business-Specific Permissions
const MOCK_ROLES = {
  Super_Admin: {
    id: 1,
    name: 'Super Admin',
    guard_name: 'web',
    permissions: [
      // Full System Access
      { id: 1, name: 'dashboard_access', guard_name: 'web' },
      { id: 2, name: 'view_customers', guard_name: 'web' },
      { id: 3, name: 'manage_customers', guard_name: 'web' },
      { id: 4, name: 'view_products', guard_name: 'web' },
      { id: 5, name: 'manage_products', guard_name: 'web' },
      { id: 6, name: 'view_inventory', guard_name: 'web' },
      { id: 7, name: 'manage_inventory', guard_name: 'web' },
      { id: 8, name: 'view_sales', guard_name: 'web' },
      { id: 9, name: 'record_sales', guard_name: 'web' },
      { id: 10, name: 'view_lodgements', guard_name: 'web' },
      { id: 11, name: 'record_lodgements', guard_name: 'web' },
      { id: 12, name: 'approve_lodgements', guard_name: 'web' },
      { id: 13, name: 'view_prf', guard_name: 'web' },
      { id: 14, name: 'create_prf', guard_name: 'web' },
      { id: 15, name: 'review_prf', guard_name: 'web' },
      { id: 16, name: 'approve_prf', guard_name: 'web' },
      { id: 17, name: 'view_pro', guard_name: 'web' },
      { id: 18, name: 'create_pro', guard_name: 'web' },
      { id: 19, name: 'review_pro', guard_name: 'web' },
      { id: 20, name: 'approve_pro', guard_name: 'web' },
      { id: 21, name: 'receive_products', guard_name: 'web' },
      { id: 22, name: 'issue_products', guard_name: 'web' },
      { id: 23, name: 'stock_transfer', guard_name: 'web' },
      { id: 24, name: 'manage_lubebays', guard_name: 'web' },
      { id: 25, name: 'view_accounts', guard_name: 'web' },
      { id: 26, name: 'manage_accounts', guard_name: 'web' },
      { id: 27, name: 'view_reports', guard_name: 'web' },
      { id: 28, name: 'generate_reports', guard_name: 'web' },
      // Super Admin Only
      { id: 29, name: 'manage_users', guard_name: 'web' },
      { id: 30, name: 'manage_settings', guard_name: 'web' },
      { id: 31, name: 'system_configuration', guard_name: 'web' },
    ],
  },
  Management: {
    id: 2,
    name: 'Management',
    guard_name: 'web',
    permissions: [
      // All business operations except user management and settings
      { id: 1, name: 'dashboard_access', guard_name: 'web' },
      { id: 2, name: 'view_customers', guard_name: 'web' },
      { id: 3, name: 'manage_customers', guard_name: 'web' },
      { id: 4, name: 'view_products', guard_name: 'web' },
      { id: 5, name: 'manage_products', guard_name: 'web' },
      { id: 6, name: 'view_inventory', guard_name: 'web' },
      { id: 7, name: 'manage_inventory', guard_name: 'web' },
      { id: 8, name: 'view_sales', guard_name: 'web' },
      { id: 9, name: 'record_sales', guard_name: 'web' },
      { id: 10, name: 'view_lodgements', guard_name: 'web' },
      { id: 11, name: 'record_lodgements', guard_name: 'web' },
      { id: 12, name: 'approve_lodgements', guard_name: 'web' },
      { id: 13, name: 'view_prf', guard_name: 'web' },
      { id: 14, name: 'create_prf', guard_name: 'web' },
      { id: 15, name: 'review_prf', guard_name: 'web' },
      { id: 16, name: 'approve_prf', guard_name: 'web' },
      { id: 17, name: 'view_pro', guard_name: 'web' },
      { id: 18, name: 'create_pro', guard_name: 'web' },
      { id: 19, name: 'review_pro', guard_name: 'web' },
      { id: 20, name: 'approve_pro', guard_name: 'web' },
      { id: 21, name: 'receive_products', guard_name: 'web' },
      { id: 22, name: 'issue_products', guard_name: 'web' },
      { id: 23, name: 'stock_transfer', guard_name: 'web' },
      { id: 24, name: 'manage_lubebays', guard_name: 'web' },
      { id: 25, name: 'view_accounts', guard_name: 'web' },
      { id: 26, name: 'manage_accounts', guard_name: 'web' },
      { id: 27, name: 'view_reports', guard_name: 'web' },
      { id: 28, name: 'generate_reports', guard_name: 'web' },
    ],
  },
  Finance_Manager: {
    id: 3,
    name: 'Finance Manager',
    guard_name: 'web',
    permissions: [
      { id: 1, name: 'dashboard_access', guard_name: 'web' },
      { id: 2, name: 'view_customers', guard_name: 'web' },
      { id: 8, name: 'view_sales', guard_name: 'web' },
      { id: 10, name: 'view_lodgements', guard_name: 'web' },
      { id: 12, name: 'approve_lodgements', guard_name: 'web' },
      { id: 13, name: 'view_prf', guard_name: 'web' },
      { id: 16, name: 'approve_prf', guard_name: 'web' },
      { id: 17, name: 'view_pro', guard_name: 'web' },
      { id: 20, name: 'approve_pro', guard_name: 'web' },
      { id: 25, name: 'view_accounts', guard_name: 'web' },
      { id: 26, name: 'manage_accounts', guard_name: 'web' },
      { id: 27, name: 'view_reports', guard_name: 'web' },
      { id: 28, name: 'generate_reports', guard_name: 'web' },
    ],
  },
  Store_Keeper: {
    id: 4,
    name: 'Store Keeper',
    guard_name: 'web',
    permissions: [
      { id: 1, name: 'dashboard_access', guard_name: 'web' },
      { id: 4, name: 'view_products', guard_name: 'web' },
      { id: 6, name: 'view_inventory', guard_name: 'web' },
      { id: 7, name: 'manage_inventory', guard_name: 'web' },
      { id: 13, name: 'view_prf', guard_name: 'web' },
      { id: 17, name: 'view_pro', guard_name: 'web' },
      { id: 21, name: 'receive_products', guard_name: 'web' },
      { id: 22, name: 'issue_products', guard_name: 'web' },
      { id: 23, name: 'stock_transfer', guard_name: 'web' },
      { id: 27, name: 'view_reports', guard_name: 'web' },
    ],
  },
  Lube_Bay_Manager: {
    id: 5,
    name: 'Lube Bay Manager',
    guard_name: 'web',
    permissions: [
      { id: 1, name: 'dashboard_access', guard_name: 'web' },
      { id: 2, name: 'view_customers', guard_name: 'web' },
      { id: 8, name: 'view_sales', guard_name: 'web' },
      { id: 9, name: 'record_sales', guard_name: 'web' },
      { id: 10, name: 'view_lodgements', guard_name: 'web' },
      { id: 11, name: 'record_lodgements', guard_name: 'web' },
      { id: 24, name: 'manage_lubebays', guard_name: 'web' },
      { id: 27, name: 'view_reports', guard_name: 'web' },
    ],
  },
  Sales_Rep: {
    id: 6,
    name: 'Sales Representative',
    guard_name: 'web',
    permissions: [
      { id: 1, name: 'dashboard_access', guard_name: 'web' },
      { id: 2, name: 'view_customers', guard_name: 'web' },
      { id: 3, name: 'manage_customers', guard_name: 'web' },
      { id: 4, name: 'view_products', guard_name: 'web' },
      { id: 8, name: 'view_sales', guard_name: 'web' },
      { id: 9, name: 'record_sales', guard_name: 'web' },
      { id: 10, name: 'view_lodgements', guard_name: 'web' },
      { id: 11, name: 'record_lodgements', guard_name: 'web' },
      { id: 13, name: 'view_prf', guard_name: 'web' },
      { id: 14, name: 'create_prf', guard_name: 'web' },
      { id: 27, name: 'view_reports', guard_name: 'web' },
    ],
  },
  User: {
    id: 7,
    name: 'General User',
    guard_name: 'web',
    permissions: [
      { id: 1, name: 'dashboard_access', guard_name: 'web' },
      { id: 2, name: 'view_customers', guard_name: 'web' },
      { id: 4, name: 'view_products', guard_name: 'web' },
      { id: 6, name: 'view_inventory', guard_name: 'web' },
      { id: 8, name: 'view_sales', guard_name: 'web' },
      { id: 27, name: 'view_reports', guard_name: 'web' },
    ],
  },
}

// Simulate network delay
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms))

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

class MockApiClient {
  // Mock login - accepts any valid email/password combination
  // Returns same format as apiClient for type compatibility
  async login(credentials: LoginForm): Promise<{
    user: User
    tokens: { access_token: string; refresh_token: string } | null
    is_mfa_required: boolean
    force_password_reset: boolean
  }> {
    console.log('🔐 Mock API Login Attempt:', {
      email: credentials.email,
      password: '***' + credentials.password.slice(-3),
      availableCredentials: MOCK_CREDENTIALS.map(c => ({
        email: c.email,
        password: '***' + c.password.slice(-3)
      }))
    })

    await delay(1500) // Simulate network delay

    const { email, password } = credentials

    // Check if credentials match any mock user
    const isValidCredentials = MOCK_CREDENTIALS.some(
      cred => cred.email === email && cred.password === password
    )

    console.log('🔐 Credentials Check:', {
      email,
      isValid: isValidCredentials,
      matchingCredential: MOCK_CREDENTIALS.find(c => c.email === email)
    })

    if (!isValidCredentials) {
      throw {
        message: 'Invalid credentials. Please check your email and password.',
        status: 401,
        errors: {
          email: ['These credentials do not match our records.']
        }
      } as ApiError
    }

    // Generate mock token
    const token = btoa(`${email}:${Date.now()}:${Math.random()}`)
    const refreshToken = btoa(`refresh:${email}:${Date.now()}:${Math.random()}`)

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('refresh_token', refreshToken)
    }

    // Get user role from credentials
    const userCredential = MOCK_CREDENTIALS.find(c => c.email === email && c.password === password)
    const userRole = userCredential?.role || 'User'
    const roleData = MOCK_ROLES[userRole as keyof typeof MOCK_ROLES]

    return {
      user: {
        id: 1,
        email, // Use the email from login
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email_verified_at: '2023-01-01T00:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        permissions: roleData.permissions,
        roles: [roleData],
      },
      tokens: {
        access_token: token,
        refresh_token: refreshToken
      },
      is_mfa_required: false,
      force_password_reset: false
    }
  }

  // Mock MFA verification
  async verifyMFA(email: string, totp: string): Promise<{
    user: User
    tokens: { access_token: string; refresh_token: string } | null
    is_mfa_required: boolean
    force_password_reset: boolean
  }> {
    await delay(1000) // Simulate network delay for MFA verification

    // Simple MFA validation - accept any 6-digit code
    if (!totp || totp.length !== 6 || !/^\d{6}$/.test(totp)) {
      throw {
        message: 'Invalid MFA code. Please enter a 6-digit code.',
        status: 401,
        errors: {
          totp: ['Invalid MFA code format.']
        }
      } as ApiError
    }

    // Generate mock tokens
    const token = btoa(`${email}:mfa:${Date.now()}:${Math.random()}`)
    const refreshToken = btoa(`refresh:mfa:${email}:${Date.now()}:${Math.random()}`)

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('refresh_token', refreshToken)
    }

    return {
      user: {
        ...MOCK_USER,
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())
      },
      tokens: {
        access_token: token,
        refresh_token: refreshToken
      },
      is_mfa_required: false,
      force_password_reset: false
    }
  }

  // Mock logout
  async logout() {
    await delay(500)

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
    }

    return { message: 'Successfully logged out' }
  }

  // Mock recent transactions
  async getRecentTransactions() {
    await delay(1000)

    const transactions = [
      {
        id: 1,
        type: 'sale',
        description: 'PMS Sale - Substore Lagos Island',
        amount: 125000,
        status: 'completed',
        customer: 'Lagos Island Substore',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        type: 'purchase',
        description: 'AGO Purchase Order - PRO#4521',
        amount: -890000,
        status: 'pending',
        customer: 'NNPC Depot',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        type: 'sale',
        description: 'Lubricants Sale - Direct Customer',
        amount: 45000,
        status: 'completed',
        customer: 'ABC Motors Ltd',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        type: 'lodgement',
        description: 'Cash Lodgement - Substore Ikeja',
        amount: 230000,
        status: 'completed',
        customer: 'Ikeja Substore',
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 5,
        type: 'sale',
        description: 'DPK Sale - Lubebay Surulere',
        amount: 85000,
        status: 'completed',
        customer: 'Surulere Lubebay',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      }
    ]

    return transactions
  }

  // Helper function to get PRF data from localStorage
  getMockPRFsForApprovals() {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem('mofad_mock_prfs')
      if (stored) {
        const prfs = JSON.parse(stored)
        // Only show PRFs that are submitted and not yet approved/rejected
        return prfs.filter((prf: any) => prf.status === 'submitted' && !prf.approved_at).map((prf: any) => ({
          id: `prf-${prf.id}`,
          type: 'PRF',
          title: `Purchase Requisition #${prf.prf_number}`,
          description: `Request from ${prf.customer_name || 'Customer'} - ${(prf.items || []).length} item(s)`,
          amount: prf.estimated_total,
          requested_by: prf.created_by || 'Sales Representative',
          customer_name: prf.customer_name,
          created_at: prf.created_at,
          priority: prf.priority || 'medium',
          department: 'Sales',
          current_level: 0,
          required_level: 3,
          approvers: [
            { level: 1, name: 'Sales Manager', status: 'pending', comments: '' },
            { level: 2, name: 'Finance Manager', status: 'pending', comments: '' },
            { level: 3, name: 'General Manager', status: 'pending', comments: '' }
          ]
        }))
      } else {
        // Initialize with some sample PRFs if none exist
        this.initializeSampleData()
        // Try again after initialization
        const newStored = localStorage.getItem('mofad_mock_prfs')
        if (newStored) {
          const prfs = JSON.parse(newStored)
          return prfs.filter((prf: any) => prf.status === 'submitted').map((prf: any) => ({
            id: `prf-${prf.id}`,
            type: 'PRF',
            title: `Purchase Requisition #${prf.prf_number}`,
            description: `Request from ${prf.customer_name || 'Customer'} - ${(prf.items || []).length} item(s)`,
            amount: prf.estimated_total,
            requested_by: prf.created_by || 'Sales Representative',
            customer_name: prf.customer_name,
            created_at: prf.created_at,
            priority: prf.priority || 'medium',
            department: 'Sales',
            current_level: 0,
            required_level: 3,
            approvers: [
              { level: 1, name: 'Sales Manager', status: 'pending', comments: '' },
              { level: 2, name: 'Finance Manager', status: 'pending', comments: '' },
              { level: 3, name: 'General Manager', status: 'pending', comments: '' }
            ]
          }))
        }
      }
    } catch (error) {
      console.error('Error reading PRFs from localStorage:', error)
    }

    return []
  }

  // Helper function to get PRO data from localStorage
  getMockPROsForApprovals() {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem('mofad_mock_pros')
      if (stored) {
        const pros = JSON.parse(stored)
        // Only show PROs that are submitted/draft and not yet approved/rejected
        return pros.filter((pro: any) => (pro.status === 'submitted' || pro.status === 'draft') && !pro.approved_at).map((pro: any) => ({
          id: `pro-${pro.id}`,
          type: 'PRO',
          title: `Purchase Order #${pro.pro_number}`,
          description: `Order to ${pro.supplier_name || pro.supplier_details?.name || 'Supplier'} - ${(pro.items || []).length} item(s)`,
          amount: pro.estimated_total,
          requested_by: pro.created_by || 'Procurement Officer',
          supplier_name: pro.supplier_name || pro.supplier_details?.name,
          created_at: pro.created_at,
          priority: pro.priority || 'medium',
          department: 'Procurement',
          current_level: 0,
          required_level: 2,
          approvers: [
            { level: 1, name: 'Procurement Manager', status: 'pending', comments: '' },
            { level: 2, name: 'Finance Manager', status: 'pending', comments: '' }
          ]
        }))
      }
    } catch (error) {
      console.error('Error reading PROs from localStorage:', error)
    }

    return []
  }

  // Initialize sample PRF and PRO data in localStorage for testing
  initializeSampleData() {
    if (typeof window === 'undefined') return

    try {
      // Initialize sample PRF data
      const samplePRFs = [
        {
          id: 101,
          prf_number: 'PRF-2024-101',
          title: 'Urgent PMS Supply Request',
          description: 'Emergency fuel supply for Lagos operations due to increased demand',
          customer_name: 'Lagos Island Filling Station',
          estimated_total: 4500000,
          status: 'submitted',
          priority: 'urgent',
          created_by: 'Store Manager Lagos',
          department: 'Operations',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              product: 'Premium Motor Spirit (PMS)',
              quantity: 7500,
              unit: 'Litres',
              estimated_price: 600,
              total: 4500000
            }
          ]
        },
        {
          id: 102,
          prf_number: 'PRF-2024-102',
          title: 'AGO Bulk Purchase',
          description: 'Diesel purchase for commercial clients and substore distribution',
          customer_name: 'XYZ Transport Services',
          estimated_total: 6800000,
          status: 'submitted',
          priority: 'high',
          created_by: 'Regional Manager North',
          department: 'Sales',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              product: 'Automotive Gas Oil (AGO)',
              quantity: 8000,
              unit: 'Litres',
              estimated_price: 850,
              total: 6800000
            }
          ]
        },
        {
          id: 103,
          prf_number: 'PRF-2024-103',
          title: 'Lubricants Package',
          description: 'Mixed lubricants for service centers and retail outlets',
          customer_name: 'Multi-Service Center',
          estimated_total: 1200000,
          status: 'submitted',
          priority: 'medium',
          created_by: 'Service Manager',
          department: 'Service',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              product: 'Engine Oil SAE 20W-50',
              quantity: 200,
              unit: 'Litres',
              estimated_price: 4500,
              total: 900000
            },
            {
              product: 'Brake Fluid DOT-3',
              quantity: 100,
              unit: 'Litres',
              estimated_price: 3000,
              total: 300000
            }
          ]
        }
      ]

      // Initialize sample PRO data
      const samplePROs = [
        {
          id: 201,
          pro_number: 'PRO-2024-201',
          title: 'NNPC Fuel Supply Contract',
          supplier_name: 'NNPC Retail Ltd',
          supplier_details: {
            name: 'NNPC Retail Ltd',
            email: 'supply@nnpcretail.com',
            phone: '+234-901-234-5678',
            address: '123 Herbert Macaulay Way, Central Business District, Abuja'
          },
          estimated_total: 8900000,
          status: 'submitted',
          priority: 'high',
          created_by: 'Procurement Manager',
          department: 'Procurement',
          payment_terms: 'NET 30',
          expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              product: 'Premium Motor Spirit (PMS)',
              quantity: 15000,
              unit: 'Litres',
              unit_price: 580,
              total: 8700000
            },
            {
              product: 'Automotive Gas Oil (AGO)',
              quantity: 250,
              unit: 'Litres',
              unit_price: 800,
              total: 200000
            }
          ]
        },
        {
          id: 202,
          pro_number: 'PRO-2024-202',
          title: 'Shell Lubricants Order',
          supplier_name: 'Shell Nigeria Ltd',
          supplier_details: {
            name: 'Shell Nigeria Ltd',
            email: 'orders@shell.ng',
            phone: '+234-802-400-7000',
            address: '21A Kofo Abayomi Street, Victoria Island, Lagos'
          },
          estimated_total: 2400000,
          status: 'draft',
          priority: 'medium',
          created_by: 'Purchase Officer',
          department: 'Procurement',
          payment_terms: 'NET 30',
          expected_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              product: 'Engine Oil SAE 10W-30',
              quantity: 400,
              unit: 'Litres',
              unit_price: 3800,
              total: 1520000
            },
            {
              product: 'Fuel System Cleaner',
              quantity: 980,
              unit: 'Litres',
              unit_price: 900,
              total: 882000
            }
          ]
        }
      ]

      // Store the sample data in localStorage
      localStorage.setItem('mofad_mock_prfs', JSON.stringify(samplePRFs))
      localStorage.setItem('mofad_mock_pros', JSON.stringify(samplePROs))

      console.log('✅ Sample PRF and PRO data initialized in localStorage')
      console.log('Sample PRFs:', samplePRFs.length)
      console.log('Sample PROs:', samplePROs.length)
    } catch (error) {
      console.error('❌ Error initializing sample data:', error)
    }
  }

  // Mock pending approvals
  async getPendingApprovals() {
    await delay(900)

    // Get real PRF and PRO data from localStorage
    const prfApprovals = this.getMockPRFsForApprovals()
    const proApprovals = this.getMockPROsForApprovals()

    // Static mock data for other types
    const staticApprovals = [
      {
        id: 1,
        type: 'PRF',
        title: 'Purchase Requisition #PRF-2024-001',
        description: 'Request for 50,000L PMS from NNPC Depot',
        amount: 4500000,
        requested_by: 'Store Manager Lagos',
        customer_name: 'NNPC Retail Station',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        department: 'Operations',
        current_level: 1,
        required_level: 3,
        approvers: [
          { level: 1, name: 'Department Head', status: 'approved', approved_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), comments: 'Approved for processing' },
          { level: 2, name: 'Finance Manager', status: 'pending', comments: '' },
          { level: 3, name: 'General Manager', status: 'pending', comments: '' }
        ]
      },
      {
        id: 2,
        type: 'PRO',
        title: 'Purchase Order #PRO-2024-012',
        description: 'Order for Lubricants and Additives',
        amount: 1200000,
        requested_by: 'Procurement Officer',
        supplier_name: 'Shell Nigeria',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        department: 'Procurement',
        current_level: 0,
        required_level: 2,
        approvers: [
          { level: 1, name: 'Procurement Manager', status: 'pending', comments: '' },
          { level: 2, name: 'Finance Manager', status: 'pending', comments: '' }
        ]
      },
      {
        id: 3,
        type: 'Stock Transfer',
        title: 'Stock Transfer #ST-2024-045',
        description: 'Transfer AGO from Warehouse to Substore Abuja',
        amount: 850000,
        requested_by: 'Substore Manager Abuja',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        priority: 'low',
        department: 'Logistics',
        current_level: 2,
        required_level: 2,
        approvers: [
          { level: 1, name: 'Logistics Manager', status: 'approved', approved_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), comments: 'Approved for transfer' },
          { level: 2, name: 'Operations Manager', status: 'approved', approved_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), comments: 'Final approval granted' }
        ]
      },
      {
        id: 4,
        type: 'PRF',
        title: 'Purchase Requisition #PRF-2024-002',
        description: 'Urgent request for diesel supply to Kano outlet',
        amount: 2800000,
        requested_by: 'Regional Manager North',
        customer_name: 'Dangote Cement',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        priority: 'urgent',
        department: 'Sales',
        current_level: 0,
        required_level: 4,
        approvers: [
          { level: 1, name: 'Sales Manager', status: 'pending', comments: '' },
          { level: 2, name: 'Department Head', status: 'pending', comments: '' },
          { level: 3, name: 'Finance Manager', status: 'pending', comments: '' },
          { level: 4, name: 'General Manager', status: 'pending', comments: '' }
        ]
      },
      {
        id: 5,
        type: 'PRO',
        title: 'Purchase Order #PRO-2024-013',
        description: 'Equipment maintenance and spare parts',
        amount: 950000,
        requested_by: 'Maintenance Engineer',
        supplier_name: 'Industrial Parts Ltd',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        department: 'Maintenance',
        current_level: 1,
        required_level: 3,
        approvers: [
          { level: 1, name: 'Maintenance Manager', status: 'approved', approved_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), comments: 'Critical equipment maintenance' },
          { level: 2, name: 'Operations Manager', status: 'pending', comments: '' },
          { level: 3, name: 'Finance Manager', status: 'pending', comments: '' }
        ]
      }
    ]

    // Combine all approvals and sort by creation time (most recent first)
    const allApprovals = [...prfApprovals, ...proApprovals, ...staticApprovals]
    return allApprovals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Mock get user
  async getUser() {
    await delay(800)

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')

      if (!token) {
        throw {
          message: 'Unauthenticated.',
          status: 401
        } as ApiError
      }
    }

    return MOCK_USER
  }

  // Mock dashboard stats
  async getDashboardStats() {
    await delay(1200)

    return {
      total_sales_ytd: 45750000,
      total_orders: 1247,
      pending_approvals: 18,
      low_stock_items: 7,
      substore_count: 23,
      lubebay_count: 12,
      customer_count: 456
    }
  }

  // Mock sales analytics
  async getSalesAnalytics() {
    await delay(1500)

    // Generate mock data for last 30 days
    const dailySales = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))

      return {
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 2000000) + 500000,
        orders: Math.floor(Math.random() * 50) + 10
      }
    })

    const productPerformance = [
      { product_name: 'Engine Oil SAE 20W-50', quantity_sold: 15420, revenue: 12500000, profit: 2100000 },
      { product_name: 'Engine Oil SAE 15W-40', quantity_sold: 9800, revenue: 8900000, profit: 1560000 },
      { product_name: 'Transmission Fluid ATF', quantity_sold: 4200, revenue: 3200000, profit: 480000 },
      { product_name: 'Hydraulic Oil ISO 46', quantity_sold: 850, revenue: 1200000, profit: 340000 },
      { product_name: 'Oil Filters & Air Filters', quantity_sold: 320, revenue: 450000, profit: 89000 }
    ]

    const channelPerformance = {
      direct_sales: 18750000,
      substore_sales: 15200000,
      lubebay_sales: 8300000
    }

    const statePerformance = [
      { state_name: 'Lagos', sales: 15200000, profit: 2850000 },
      { state_name: 'Abuja', sales: 12800000, profit: 2400000 },
      { state_name: 'Kano', sales: 8900000, profit: 1680000 },
      { state_name: 'Rivers', sales: 6700000, profit: 1250000 },
      { state_name: 'Oyo', sales: 4850000, profit: 920000 }
    ]

    return {
      daily_sales: dailySales,
      product_performance: productPerformance,
      channel_performance: channelPerformance,
      state_performance: statePerformance
    }
  }

  // Mock data for all pages
  getMockPRFData() {
    return [
      { id: 1, prf_number: 'PRF-2024-001', title: 'Engine Oil SAE 20W-50 Supply Request', description: 'Request for 500 drums of Engine Oil SAE 20W-50', total_amount: 4500000, status: 'pending', priority: 'high', requested_by: 'Store Manager Lagos', department: 'Operations', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), required_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), items_count: 1 },
      { id: 2, prf_number: 'PRF-2024-002', title: 'Hydraulic Oil Bulk Purchase', description: 'Hydraulic Oil ISO 46 for Lubebay Distribution', total_amount: 8900000, status: 'approved', priority: 'medium', requested_by: 'Procurement Officer', department: 'Procurement', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), required_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), items_count: 2 },
      { id: 3, prf_number: 'PRF-2024-003', title: 'Lubricants & Additives', description: 'Mixed lubricants for service centers', total_amount: 1200000, status: 'processing', priority: 'low', requested_by: 'Service Manager', department: 'Service', created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), required_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), items_count: 15 }
    ]
  }

  getMockPROData() {
    // Updated 2026-01-05-17:05:00 - Now reads from localStorage
    // Get PROs from localStorage (created by users)
    let storedPROs = []
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mofad_mock_pros')
        console.log('Raw localStorage data:', stored)
        if (stored) {
          storedPROs = JSON.parse(stored)
          console.log('Parsed stored PROs:', storedPROs)
        }
      } catch (error) {
        console.error('Error reading PROs from localStorage:', error)
      }
    }

    // Default PROs for demo purposes
    const defaultPROs = [
      { id: 1, pro_number: 'PRO-2024-001', title: 'Engine Oil SAE 20W-50 Supply Contract', supplier: 'Eterna Oil Ltd', total_amount: 4500000, status: 'confirmed', delivery_status: 'pending', created_by: 'John Doe', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), expected_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), items_count: 1, payment_terms: 'NET 30' },
      { id: 2, pro_number: 'PRO-2024-002', title: 'Hydraulic Oil Bulk Order', supplier: 'Total Energies Nigeria Ltd', total_amount: 8900000, status: 'sent', delivery_status: 'pending', created_by: 'Jane Smith', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), items_count: 2, payment_terms: 'NET 15' }
    ]

    // Transform stored PROs to match the expected format for the table
    const transformedStoredPROs = storedPROs.map(pro => ({
      id: pro.id,
      pro_number: pro.pro_number,
      title: `${pro.supplier_name || pro.supplier_details?.name || 'Supplier'} Order`,
      supplier: pro.supplier_name || pro.supplier_details?.name || 'Unknown Supplier',
      total_amount: pro.estimated_total,
      status: pro.status === 'submitted' ? 'sent' : pro.status,
      delivery_status: 'pending',
      created_by: pro.created_by,
      created_at: pro.created_at,
      expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      items_count: pro.items?.length || 0,
      payment_terms: pro.payment_terms || 'NET 30'
    }))

    // Combine stored PROs with default PROs, with stored PROs first
    const finalPROs = [...transformedStoredPROs, ...defaultPROs]
    console.log('Final PRO list being returned:', finalPROs)
    return finalPROs
  }

  getMockCustomersData() {
    return [
      {
        id: 1,
        name: 'ABC Motors Ltd',
        customer_code: 'CUST-0001',
        email: 'contact@abcmotors.com',
        phone: '+234-801-234-5678',
        alt_phone: '+234-802-345-6789',
        customer_type: 2, // Corporate
        customer_type_name: 'Corporate',
        payment_type: 2, // Bank Transfer
        payment_type_name: 'Bank Transfer',
        old_reference_id: 'OLD-001',
        address: '123 Victoria Island, Lagos',
        city: 'Lagos',
        state: 1, // Lagos
        state_name: 'Lagos',
        postal_code: '101001',
        business_name: 'ABC Motors Limited',
        credit_limit: 5000000,
        current_balance: 450000,
        total_spent: 12500000,
        payment_terms: 'NET 30',
        contact_person: 'John Adebayo',
        contact_person_phone: '+234-806-789-0123',
        contact_person_email: 'john@abcmotors.com',
        status: 'active',
        preferred_delivery_method: 'delivery',
        is_verified: true,
        notes: 'Premium corporate client with excellent payment history',
        created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'XYZ Transport Services',
        customer_code: 'CUST-0002',
        email: 'info@xyztransport.ng',
        phone: '+234-803-567-8901',
        alt_phone: null,
        customer_type: 2, // Corporate
        customer_type_name: 'Corporate',
        payment_type: 1, // Cash
        payment_type_name: 'Cash',
        old_reference_id: null,
        address: '45 Ikeja Industrial Estate, Lagos',
        city: 'Ikeja',
        state: 1, // Lagos
        state_name: 'Lagos',
        postal_code: '100001',
        business_name: 'XYZ Transport Services Ltd',
        credit_limit: 3000000,
        current_balance: 0,
        total_spent: 8900000,
        payment_terms: 'Cash on Delivery',
        contact_person: 'Maria Okafor',
        contact_person_phone: '+234-805-432-1098',
        contact_person_email: 'maria@xyztransport.ng',
        status: 'active',
        preferred_delivery_method: 'pickup',
        is_verified: true,
        notes: 'Reliable transport company, always pays on time',
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: 'Olumide Johnson',
        customer_code: 'CUST-0003',
        email: 'olumide.johnson@gmail.com',
        phone: '+234-805-123-4567',
        alt_phone: '+234-806-234-5678',
        customer_type: 1, // Individual
        customer_type_name: 'Individual',
        payment_type: 3, // Credit Card
        payment_type_name: 'Credit Card',
        old_reference_id: 'IND-025',
        address: '78 Allen Avenue, Ikeja',
        city: 'Ikeja',
        state: 1, // Lagos
        state_name: 'Lagos',
        postal_code: '100271',
        business_name: null,
        credit_limit: 500000,
        current_balance: 25000,
        total_spent: 340000,
        payment_terms: 'Immediate',
        contact_person: null,
        contact_person_phone: null,
        contact_person_email: null,
        status: 'active',
        preferred_delivery_method: 'both',
        is_verified: false,
        notes: 'Individual customer, occasional bulk purchases',
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        name: 'Dangote Industries Plc',
        customer_code: 'CUST-0004',
        email: 'procurement@dangote.com',
        phone: '+234-701-800-9000',
        alt_phone: '+234-708-900-1000',
        customer_type: 2, // Corporate
        customer_type_name: 'Corporate',
        payment_type: 2, // Bank Transfer
        payment_type_name: 'Bank Transfer',
        old_reference_id: 'DAN-001',
        address: 'Dangote Industries Complex, Obajana',
        city: 'Obajana',
        state: 9, // Kwara
        state_name: 'Kwara',
        postal_code: '240001',
        business_name: 'Dangote Industries Plc',
        credit_limit: 50000000,
        current_balance: 2500000,
        total_spent: 45000000,
        payment_terms: 'NET 45',
        contact_person: 'Fatima Aliyu',
        contact_person_phone: '+234-802-456-7890',
        contact_person_email: 'fatima@dangote.com',
        status: 'active',
        preferred_delivery_method: 'delivery',
        is_verified: true,
        notes: 'Major corporate client, high volume orders',
        created_at: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        name: 'NNPC Retail Station',
        customer_code: 'CUST-0005',
        email: 'retail@nnpc.gov.ng',
        phone: '+234-809-111-2222',
        alt_phone: null,
        customer_type: 3, // Government
        customer_type_name: 'Government',
        payment_type: 6, // Cheque
        payment_type_name: 'Cheque',
        old_reference_id: 'NNPC-RET-001',
        address: 'NNPC Towers, Central Business District',
        city: 'Abuja',
        state: 2, // FCT
        state_name: 'Abuja (FCT)',
        postal_code: '900001',
        business_name: 'Nigerian National Petroleum Corporation',
        credit_limit: 100000000,
        current_balance: 0,
        total_spent: 89000000,
        payment_terms: 'NET 60',
        contact_person: 'Ibrahim Musa',
        contact_person_phone: '+234-803-333-4444',
        contact_person_email: 'ibrahim@nnpc.gov.ng',
        status: 'active',
        preferred_delivery_method: 'delivery',
        is_verified: true,
        notes: 'Government client, follows strict procurement processes',
        created_at: new Date(Date.now() - 1095 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 6,
        name: 'Lagos State Transport Corp',
        customer_code: 'CUST-0006',
        email: 'fleet@lasg.gov.ng',
        phone: '+234-802-555-7777',
        alt_phone: '+234-803-666-8888',
        customer_type: 5, // Fleet
        customer_type_name: 'Fleet',
        payment_type: 7, // Credit Terms
        payment_type_name: 'Credit Terms',
        old_reference_id: 'LASG-001',
        address: 'Lagos State Secretariat Complex, Alausa',
        city: 'Ikeja',
        state: 1, // Lagos
        state_name: 'Lagos',
        postal_code: '100271',
        business_name: 'Lagos State Transport Corporation',
        credit_limit: 25000000,
        current_balance: 1200000,
        total_spent: 18500000,
        payment_terms: 'NET 90',
        contact_person: 'Grace Eze',
        contact_person_phone: '+234-807-999-0000',
        contact_person_email: 'grace@lasg.gov.ng',
        status: 'active',
        preferred_delivery_method: 'delivery',
        is_verified: true,
        notes: 'State government fleet management, bulk fuel orders',
        created_at: new Date(Date.now() - 455 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  getMockProductsData() {
    return [
      { id: 1, name: 'Oil Filter - Standard', code: 'OF-STD-001', category: 'filters', unit_of_measure: 'pieces', direct_sales_price: 3500, cost_price: 2800, minimum_stock_level: 200, primary_supplier: 'Bosch Nigeria Ltd', is_active: true, is_sellable: true, is_purchasable: true, is_service: false, requires_batch_tracking: true, tax_rate: 7.5, tax_inclusive: false, track_inventory: true, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 3800 },
      { id: 2, name: 'Air Filter - Heavy Duty', code: 'AF-HD-001', category: 'filters', unit_of_measure: 'pieces', direct_sales_price: 4200, cost_price: 3500, minimum_stock_level: 150, primary_supplier: 'Mann+Hummel Nigeria', is_active: true, is_sellable: true, is_purchasable: true, is_service: false, requires_batch_tracking: true, tax_rate: 7.5, tax_inclusive: false, track_inventory: true, created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 4500 },
      { id: 3, name: 'Fuel Filter - Diesel', code: 'FF-DSL-001', category: 'filters', unit_of_measure: 'pieces', direct_sales_price: 2800, cost_price: 2200, minimum_stock_level: 100, primary_supplier: 'Mahle Nigeria Ltd', is_active: true, is_sellable: true, is_purchasable: true, is_service: false, requires_batch_tracking: true, tax_rate: 7.5, tax_inclusive: false, track_inventory: true, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 3200 },
      { id: 4, name: 'Cabin Air Filter', code: 'CAF-001', category: 'filters', unit_of_measure: 'pieces', direct_sales_price: 3200, cost_price: 2600, minimum_stock_level: 120, primary_supplier: 'Fram Nigeria Ltd', is_active: true, is_sellable: true, is_purchasable: true, is_service: false, requires_batch_tracking: true, tax_rate: 7.5, tax_inclusive: false, track_inventory: true, created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 3600 },
      { id: 5, name: 'Engine Oil SAE 20W-50', code: 'EO-20W50', category: 'lubricant', unit_of_measure: 'liters', direct_sales_price: 4500, cost_price: 3200, minimum_stock_level: 100, primary_supplier: 'Total Energies Nigeria', is_active: true, is_sellable: true, is_purchasable: true, is_service: false, requires_batch_tracking: false, tax_rate: 7.5, tax_inclusive: false, track_inventory: true, viscosity_grade: '20W-50', brand: 'Total', created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 4800 },
      { id: 6, name: 'Engine Oil SAE 10W-30', code: 'EO-10W30', category: 'lubricant', unit_of_measure: 'liters', direct_sales_price: 5200, cost_price: 3800, minimum_stock_level: 80, primary_supplier: 'Shell Nigeria', is_active: true, is_sellable: true, is_purchasable: true, is_service: false, requires_batch_tracking: false, tax_rate: 7.5, tax_inclusive: false, track_inventory: true, viscosity_grade: '10W-30', brand: 'Shell', created_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 5500 },
      { id: 7, name: 'Gear Oil SAE 80W-90', code: 'GO-80W90', category: 'lubricant', unit_of_measure: 'liters', direct_sales_price: 3800, cost_price: 2900, minimum_stock_level: 50, primary_supplier: 'Mobil Oil Nigeria', is_active: true, is_sellable: true, is_purchasable: true, is_service: false, requires_batch_tracking: false, tax_rate: 7.5, tax_inclusive: false, track_inventory: true, viscosity_grade: '80W-90', brand: 'Mobil', created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 4000 },
      { id: 8, name: 'Brake Fluid DOT-3', code: 'BF-DOT3', category: 'lubricant', unit_of_measure: 'liters', direct_sales_price: 2200, cost_price: 1600, minimum_stock_level: 25, primary_supplier: 'Valvoline Nigeria', is_active: true, is_sellable: true, is_purchasable: true, is_service: false, requires_batch_tracking: false, tax_rate: 7.5, tax_inclusive: false, track_inventory: true, brand: 'Valvoline', created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 2400 },
      { id: 9, name: 'Fuel System Cleaner', code: 'FSC-001', category: 'additive', unit_of_measure: 'liters', direct_sales_price: 1500, cost_price: 900, minimum_stock_level: 30, primary_supplier: 'STP Products Ltd', is_active: true, is_sellable: true, is_purchasable: true, is_service: false, requires_batch_tracking: false, tax_rate: 7.5, tax_inclusive: false, track_inventory: true, brand: 'STP', created_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 1650 },
      { id: 10, name: 'Engine Oil Additive', code: 'EOA-001', category: 'additive', unit_of_measure: 'liters', direct_sales_price: 2800, cost_price: 1800, minimum_stock_level: 20, primary_supplier: 'Lucas Oil Nigeria', is_active: true, is_sellable: true, is_purchasable: true, is_service: false, requires_batch_tracking: false, tax_rate: 7.5, tax_inclusive: false, track_inventory: true, brand: 'Lucas', created_at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 3000 },
      { id: 11, name: 'Radiator Coolant', code: 'RC-001', category: 'additive', unit_of_measure: 'liters', direct_sales_price: 1800, cost_price: 1200, minimum_stock_level: 40, primary_supplier: 'Prestone Nigeria', is_active: true, is_sellable: true, is_purchasable: true, is_service: false, requires_batch_tracking: false, tax_rate: 7.5, tax_inclusive: false, track_inventory: true, brand: 'Prestone', created_at: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 1950 },
      { id: 12, name: 'Oil Change Service', code: 'SRV-OCS', category: 'service', unit_of_measure: 'pieces', direct_sales_price: 8500, cost_price: 6000, minimum_stock_level: 0, primary_supplier: 'Internal Service', is_active: true, is_sellable: true, is_purchasable: false, is_service: true, requires_batch_tracking: false, tax_rate: 7.5, tax_inclusive: false, track_inventory: false, created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 9000 },
      { id: 13, name: 'Car Wash Premium', code: 'SRV-CWP', category: 'service', unit_of_measure: 'pieces', direct_sales_price: 3500, cost_price: 2000, minimum_stock_level: 0, primary_supplier: 'Internal Service', is_active: true, is_sellable: true, is_purchasable: false, is_service: true, requires_batch_tracking: false, tax_rate: 7.5, tax_inclusive: false, track_inventory: false, created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 4000 },
      { id: 14, name: 'Tire Pressure Check', code: 'SRV-TPC', category: 'service', unit_of_measure: 'pieces', direct_sales_price: 1000, cost_price: 300, minimum_stock_level: 0, primary_supplier: 'Internal Service', is_active: true, is_sellable: true, is_purchasable: false, is_service: true, requires_batch_tracking: false, tax_rate: 7.5, tax_inclusive: false, track_inventory: false, created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 1200 },
      { id: 15, name: 'Battery Testing', code: 'SRV-BT', category: 'service', unit_of_measure: 'pieces', direct_sales_price: 1500, cost_price: 500, minimum_stock_level: 0, primary_supplier: 'Internal Service', is_active: false, is_sellable: true, is_purchasable: false, is_service: true, requires_batch_tracking: false, tax_rate: 7.5, tax_inclusive: false, track_inventory: false, created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), retail_selling_price: 1800 }
    ]
  }

  getMockPricingSchemesData() {
    return [
      { id: 1, scheme_name: 'Standard Retail', description: 'Default pricing for walk-in customers', markup_percentage: 15, min_margin: 8, max_margin: 25, applies_to: 'All Products', status: 'active', created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), products_count: 156 },
      { id: 2, scheme_name: 'Corporate Discount', description: 'Volume discount for corporate clients', markup_percentage: 8, min_margin: 5, max_margin: 15, applies_to: 'Lubricants & Filters', status: 'active', created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), products_count: 45 },
      { id: 3, scheme_name: 'Lubebay Wholesale', description: 'Wholesale rates for Lubebay locations', markup_percentage: 12, min_margin: 6, max_margin: 18, applies_to: 'Lubricants', status: 'active', created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), products_count: 28 },
      { id: 4, scheme_name: 'Government Contract', description: 'Special pricing for government contracts', markup_percentage: 6, min_margin: 3, max_margin: 10, applies_to: 'Service Contracts', status: 'active', created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), products_count: 12 },
      { id: 5, scheme_name: 'Loyalty Customer', description: 'Preferred pricing for loyalty program members', markup_percentage: 10, min_margin: 7, max_margin: 20, applies_to: 'All Products', status: 'inactive', created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(), products_count: 89 }
    ]
  }

  getMockServicesData() {
    return [
      // Oil Change Services
      { id: 1, service_name: 'Standard Oil Change', description: 'Conventional oil change with standard filter replacement', duration_minutes: 30, base_price: 4500, materials_cost: 2800, labor_cost: 1700, category: 'Oil Change', status: 'active', popularity_score: 95, bookings_this_month: 289, created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, service_name: 'Premium Oil Change', description: 'Full synthetic oil change with premium filter replacement', duration_minutes: 45, base_price: 8500, materials_cost: 6000, labor_cost: 2500, category: 'Oil Change', status: 'active', popularity_score: 98, bookings_this_month: 234, created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, service_name: 'High-Mileage Oil Change', description: 'Specialized oil change for vehicles with 75,000+ miles', duration_minutes: 40, base_price: 6800, materials_cost: 4200, labor_cost: 2600, category: 'Oil Change', status: 'active', popularity_score: 87, bookings_this_month: 156, created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },

      // Wheel Services
      { id: 4, service_name: 'Wheel Balancing', description: 'Professional wheel balancing to eliminate vibrations and ensure smooth ride', duration_minutes: 45, base_price: 5500, materials_cost: 800, labor_cost: 3000, category: 'Wheel Services', status: 'active', popularity_score: 82, bookings_this_month: 145, created_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 5, service_name: 'Wheel Alignment', description: 'Four-wheel alignment service to correct steering and tire wear issues', duration_minutes: 60, base_price: 12000, materials_cost: 1500, labor_cost: 6000, category: 'Wheel Services', status: 'active', popularity_score: 89, bookings_this_month: 98, created_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 6, service_name: 'Tire Rotation & Balance', description: 'Tire rotation and balancing to extend tire life', duration_minutes: 35, base_price: 4000, materials_cost: 500, labor_cost: 2500, category: 'Wheel Services', status: 'active', popularity_score: 75, bookings_this_month: 123, created_at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString() },

      // Brake Services
      { id: 7, service_name: 'Brake Pad Replacement', description: 'Front or rear brake pad replacement with inspection', duration_minutes: 90, base_price: 15000, materials_cost: 8500, labor_cost: 6500, category: 'Brake Services', status: 'active', popularity_score: 92, bookings_this_month: 78, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 8, service_name: 'Brake System Inspection', description: 'Comprehensive brake system check and fluid top-up', duration_minutes: 30, base_price: 3500, materials_cost: 800, labor_cost: 2000, category: 'Brake Services', status: 'active', popularity_score: 85, bookings_this_month: 167, created_at: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString() },

      // Transmission Services
      { id: 9, service_name: 'Transmission Fluid Change', description: 'Complete transmission fluid replacement and filter change', duration_minutes: 75, base_price: 18000, materials_cost: 12000, labor_cost: 6000, category: 'Transmission', status: 'active', popularity_score: 88, bookings_this_month: 67, created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 10, service_name: 'Transmission Service', description: 'Basic transmission service with fluid top-up and inspection', duration_minutes: 45, base_price: 8500, materials_cost: 4500, labor_cost: 4000, category: 'Transmission', status: 'active', popularity_score: 76, bookings_this_month: 89, created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },

      // Engine Services
      { id: 11, service_name: 'Engine Tune-Up', description: 'Complete engine tune-up with spark plug replacement', duration_minutes: 120, base_price: 25000, materials_cost: 15000, labor_cost: 10000, category: 'Engine Services', status: 'active', popularity_score: 91, bookings_this_month: 45, created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 12, service_name: 'Engine Diagnostics', description: 'Computer-based engine diagnostics and fault code reading', duration_minutes: 35, base_price: 5000, materials_cost: 500, labor_cost: 3500, category: 'Engine Services', status: 'active', popularity_score: 83, bookings_this_month: 134, created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() },

      // Battery & Electrical
      { id: 13, service_name: 'Battery Testing & Replacement', description: 'Battery health check and replacement with warranty', duration_minutes: 25, base_price: 12000, materials_cost: 8000, labor_cost: 2000, category: 'Electrical', status: 'active', popularity_score: 79, bookings_this_month: 98, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 14, service_name: 'Alternator & Starter Check', description: 'Electrical system inspection for charging and starting issues', duration_minutes: 40, base_price: 4500, materials_cost: 800, labor_cost: 3000, category: 'Electrical', status: 'active', popularity_score: 72, bookings_this_month: 56, created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },

      // Cooling System
      { id: 15, service_name: 'Radiator Flush', description: 'Complete cooling system flush and coolant replacement', duration_minutes: 60, base_price: 8500, materials_cost: 4500, labor_cost: 4000, category: 'Cooling System', status: 'active', popularity_score: 77, bookings_this_month: 78, created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 16, service_name: 'AC System Service', description: 'Air conditioning system maintenance, leak check, and refrigerant refill', duration_minutes: 50, base_price: 12500, materials_cost: 6500, labor_cost: 4500, category: 'AC Services', status: 'active', popularity_score: 86, bookings_this_month: 89, created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },

      // Filter Services
      { id: 17, service_name: 'Air Filter Replacement', description: 'Engine air filter replacement for improved performance', duration_minutes: 15, base_price: 2800, materials_cost: 1500, labor_cost: 1000, category: 'Filter Services', status: 'active', popularity_score: 68, bookings_this_month: 145, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 18, service_name: 'Cabin Filter Replacement', description: 'Cabin air filter replacement for clean interior air', duration_minutes: 20, base_price: 3500, materials_cost: 2000, labor_cost: 1200, category: 'Filter Services', status: 'active', popularity_score: 64, bookings_this_month: 112, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },

      // Car Wash Services
      { id: 19, service_name: 'Express Car Wash', description: 'Quick exterior wash with rinse, soap, and dry', duration_minutes: 15, base_price: 2500, materials_cost: 800, labor_cost: 1200, category: 'Car Wash', status: 'active', popularity_score: 92, bookings_this_month: 245, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 20, service_name: 'Premium Car Wash', description: 'Full exterior wash with wax, tire shine, and interior vacuum', duration_minutes: 30, base_price: 4500, materials_cost: 1500, labor_cost: 2200, category: 'Car Wash', status: 'active', popularity_score: 89, bookings_this_month: 189, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 21, service_name: 'Deluxe Car Wash & Detail', description: 'Complete interior and exterior detail with polish, leather treatment, and dashboard care', duration_minutes: 60, base_price: 8500, materials_cost: 3000, labor_cost: 4500, category: 'Car Wash', status: 'active', popularity_score: 85, bookings_this_month: 156, created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 22, service_name: 'Undercarriage Wash', description: 'Specialized undercarriage cleaning to remove dirt, salt, and road grime', duration_minutes: 20, base_price: 3500, materials_cost: 1200, labor_cost: 1800, category: 'Car Wash', status: 'active', popularity_score: 76, bookings_this_month: 134, created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 23, service_name: 'Engine Bay Cleaning', description: 'Professional engine bay degreasing and cleaning service', duration_minutes: 45, base_price: 6000, materials_cost: 2500, labor_cost: 3000, category: 'Car Wash', status: 'active', popularity_score: 78, bookings_this_month: 98, created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  }

  getMockWarehousesData() {
    return [
      {
        id: 1,
        name: 'Main Warehouse - Lagos',
        location: 'Lagos Island, Lagos State',
        type: 'Primary',
        capacity: 150000,
        current_utilization: 85600,
        manager: 'John Adebayo',
        phone: '+234 803 555 0101',
        email: 'lagos.warehouse@mofadenergy.com',
        status: 'active',
        total_products: 6,
        last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        address: 'Plot 123, Warehouse Complex, Lagos Island',
        established: '2020-01-15'
      },
      {
        id: 2,
        name: 'Regional Warehouse - Abuja',
        location: 'Central Business District, FCT',
        type: 'Secondary',
        capacity: 80000,
        current_utilization: 45200,
        manager: 'Ibrahim Musa',
        phone: '+234 809 555 0102',
        email: 'abuja.warehouse@mofadenergy.com',
        status: 'active',
        total_products: 4,
        last_updated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        address: 'Block 45, Industrial Zone, Abuja',
        established: '2021-03-20'
      },
      {
        id: 3,
        name: 'Regional Warehouse - Kano',
        location: 'Kano Industrial Estate, Kano',
        type: 'Secondary',
        capacity: 60000,
        current_utilization: 32100,
        manager: 'Fatima Aliyu',
        phone: '+234 808 555 0103',
        email: 'kano.warehouse@mofadenergy.com',
        status: 'active',
        total_products: 5,
        last_updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        address: 'Zone 7, Industrial Layout, Kano',
        established: '2021-08-10'
      },
      {
        id: 4,
        name: 'Hub Warehouse - Port Harcourt',
        location: 'Trans Amadi, Port Harcourt',
        type: 'Hub',
        capacity: 45000,
        current_utilization: 28900,
        manager: 'Grace Eze',
        phone: '+234 804 555 0104',
        email: 'portharcourt.warehouse@mofadenergy.com',
        status: 'active',
        total_products: 3,
        last_updated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        address: 'Plot 67, Trans Amadi Industrial Layout',
        established: '2022-01-05'
      }
    ]
  }

  getMockWarehouseInventoryData(warehouseId?: number) {
    const allInventory = [
      // Lagos Main Warehouse (ID: 1)
      // Engine Oil SAE 20W-50 in various packaging sizes
      { id: 1, warehouse_id: 1, product_name: 'Engine Oil SAE 20W-50 (1L)', product_code: 'EO-20W50-1L', category: 'Lubricants', current_stock: 450, unit_type: '1L Bottles', cost_value: 1350000, retail_value: 1890000, reorder_level: 100, max_level: 800, location: 'Rack L1-A', last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 30, package_size: '1L' },
      { id: 2, warehouse_id: 1, product_name: 'Engine Oil SAE 20W-50 (4L)', product_code: 'EO-20W50-4L', category: 'Lubricants', current_stock: 180, unit_type: '4L Containers', cost_value: 2016000, retail_value: 2520000, reorder_level: 50, max_level: 300, location: 'Rack L1-B', last_updated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 25, package_size: '4L' },
      { id: 3, warehouse_id: 1, product_name: 'Engine Oil SAE 20W-50 (5L)', product_code: 'EO-20W50-5L', category: 'Lubricants', current_stock: 125, unit_type: '5L Jerricans', cost_value: 1875000, retail_value: 2437500, reorder_level: 40, max_level: 200, location: 'Rack L1-C', last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 22, package_size: '5L' },
      { id: 4, warehouse_id: 1, product_name: 'Engine Oil SAE 20W-50 (20L Keg)', product_code: 'EO-20W50-20L', category: 'Lubricants', current_stock: 65, unit_type: '20L Kegs', cost_value: 3900000, retail_value: 4875000, reorder_level: 20, max_level: 100, location: 'Rack L1-D', last_updated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 35, package_size: '20L Keg' },
      { id: 5, warehouse_id: 1, product_name: 'Engine Oil SAE 20W-50 (200L Drum)', product_code: 'EO-20W50-200L', category: 'Lubricants', current_stock: 12, unit_type: '200L Drums', cost_value: 7200000, retail_value: 8640000, reorder_level: 5, max_level: 25, location: 'Bay L1-Drums', last_updated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 45, package_size: '200L Drum' },

      // Engine Oil SAE 15W-40 in various packaging sizes
      { id: 6, warehouse_id: 1, product_name: 'Engine Oil SAE 15W-40 (1L)', product_code: 'EO-15W40-1L', category: 'Lubricants', current_stock: 520, unit_type: '1L Bottles', cost_value: 1404000, retail_value: 2080000, reorder_level: 120, max_level: 800, location: 'Rack L2-A', last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 32, package_size: '1L' },
      { id: 7, warehouse_id: 1, product_name: 'Engine Oil SAE 15W-40 (4L)', product_code: 'EO-15W40-4L', category: 'Lubricants', current_stock: 205, unit_type: '4L Containers', cost_value: 2050000, retail_value: 2870000, reorder_level: 60, max_level: 400, location: 'Rack L2-B', last_updated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 28, package_size: '4L' },
      { id: 8, warehouse_id: 1, product_name: 'Engine Oil SAE 15W-40 (5L)', product_code: 'EO-15W40-5L', category: 'Lubricants', current_stock: 145, unit_type: '5L Jerricans', cost_value: 1885000, retail_value: 2537500, reorder_level: 50, max_level: 250, location: 'Rack L2-C', last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 24, package_size: '5L' },

      // Hydraulic Oil ISO 46 in various packaging sizes
      { id: 9, warehouse_id: 1, product_name: 'Hydraulic Oil ISO 46 (5L)', product_code: 'HO-46-5L', category: 'Hydraulics', current_stock: 95, unit_type: '5L Jerricans', cost_value: 1425000, retail_value: 1805000, reorder_level: 30, max_level: 150, location: 'Rack H1-A', last_updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 20, package_size: '5L' },
      { id: 10, warehouse_id: 1, product_name: 'Hydraulic Oil ISO 46 (20L Keg)', product_code: 'HO-46-20L', category: 'Hydraulics', current_stock: 38, unit_type: '20L Kegs', cost_value: 2280000, retail_value: 2850000, reorder_level: 15, max_level: 80, location: 'Rack H1-B', last_updated: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 25, package_size: '20L Keg' },
      { id: 11, warehouse_id: 1, product_name: 'Hydraulic Oil ISO 46 (200L Drum)', product_code: 'HO-46-200L', category: 'Hydraulics', current_stock: 8, unit_type: '200L Drums', cost_value: 4800000, retail_value: 5600000, reorder_level: 3, max_level: 20, location: 'Bay H1-Drums', last_updated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 40, package_size: '200L Drum' },

      // Transmission Fluid ATF Dexron III
      { id: 12, warehouse_id: 1, product_name: 'Transmission Fluid ATF Dexron III (1L)', product_code: 'ATF-DIII-1L', category: 'Lubricants', current_stock: 280, unit_type: '1L Bottles', cost_value: 1120000, retail_value: 1540000, reorder_level: 80, max_level: 500, location: 'Rack L3-A', last_updated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 18, package_size: '1L' },
      { id: 13, warehouse_id: 1, product_name: 'Transmission Fluid ATF Dexron III (4L)', product_code: 'ATF-DIII-4L', category: 'Lubricants', current_stock: 95, unit_type: '4L Containers', cost_value: 1520000, retail_value: 2090000, reorder_level: 30, max_level: 150, location: 'Rack L3-B', last_updated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 22, package_size: '4L' },

      // Brake Fluid DOT-4
      { id: 14, warehouse_id: 1, product_name: 'Brake Fluid DOT-4 (500ml)', product_code: 'BF-DOT4-500ML', category: 'Lubricants', current_stock: 240, unit_type: '500ml Bottles', cost_value: 480000, retail_value: 672000, reorder_level: 80, max_level: 400, location: 'Rack L4-A', last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 15, package_size: '500ml' },

      // Power Steering Fluid
      { id: 15, warehouse_id: 1, product_name: 'Power Steering Fluid (1L)', product_code: 'PSF-001-1L', category: 'Hydraulics', current_stock: 85, unit_type: '1L Bottles', cost_value: 170000, retail_value: 238000, reorder_level: 40, max_level: 200, location: 'Rack H2-A', last_updated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), stock_status: 'critical', days_of_supply: 8, package_size: '1L' },

      // Abuja Warehouse (ID: 2) - Engine Oil SAE 10W-30
      { id: 16, warehouse_id: 2, product_name: 'Engine Oil SAE 10W-30 (1L)', product_code: 'EO-10W30-1L', category: 'Lubricants', current_stock: 420, unit_type: '1L Bottles', cost_value: 1260000, retail_value: 1890000, reorder_level: 100, max_level: 600, location: 'Rack L1-A', last_updated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 28, package_size: '1L' },
      { id: 17, warehouse_id: 2, product_name: 'Engine Oil SAE 10W-30 (4L)', product_code: 'EO-10W30-4L', category: 'Lubricants', current_stock: 165, unit_type: '4L Containers', cost_value: 1980000, retail_value: 2640000, reorder_level: 50, max_level: 300, location: 'Rack L1-B', last_updated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 25, package_size: '4L' },
      { id: 18, warehouse_id: 2, product_name: 'Engine Oil SAE 10W-30 (20L Keg)', product_code: 'EO-10W30-20L', category: 'Lubricants', current_stock: 45, unit_type: '20L Kegs', cost_value: 2700000, retail_value: 3375000, reorder_level: 15, max_level: 80, location: 'Rack L1-C', last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 30, package_size: '20L Keg' },

      // Hydraulic Oil ISO 68 at Abuja
      { id: 19, warehouse_id: 2, product_name: 'Hydraulic Oil ISO 68 (5L)', product_code: 'HO-68-5L', category: 'Hydraulics', current_stock: 85, unit_type: '5L Jerricans', cost_value: 1530000, retail_value: 1912500, reorder_level: 25, max_level: 150, location: 'Rack H1-A', last_updated: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 18, package_size: '5L' },
      { id: 20, warehouse_id: 2, product_name: 'Hydraulic Oil ISO 68 (200L Drum)', product_code: 'HO-68-200L', category: 'Hydraulics', current_stock: 6, unit_type: '200L Drums', cost_value: 3600000, retail_value: 4200000, reorder_level: 2, max_level: 15, location: 'Bay H1-Drums', last_updated: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), stock_status: 'low', days_of_supply: 12, package_size: '200L Drum' },

      // Transmission Fluid ATF at Abuja
      { id: 21, warehouse_id: 2, product_name: 'Transmission Fluid ATF (1L)', product_code: 'TF-ATF-1L', category: 'Lubricants', current_stock: 285, unit_type: '1L Bottles', cost_value: 1140000, retail_value: 1567500, reorder_level: 80, max_level: 500, location: 'Rack L2-A', last_updated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 20, package_size: '1L' },

      // Coolant Fluid at Abuja
      { id: 22, warehouse_id: 2, product_name: 'Coolant Fluid (1L)', product_code: 'CF-001-1L', category: 'Lubricants', current_stock: 145, unit_type: '1L Bottles', cost_value: 217500, retail_value: 290000, reorder_level: 50, max_level: 300, location: 'Rack L3-A', last_updated: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 12, package_size: '1L' },

      // Kano Warehouse (ID: 3) - Diesel Engine Oil 15W-40
      { id: 23, warehouse_id: 3, product_name: 'Diesel Engine Oil 15W-40 (1L)', product_code: 'DEO-15W40-1L', category: 'Lubricants', current_stock: 350, unit_type: '1L Bottles', cost_value: 1050000, retail_value: 1575000, reorder_level: 80, max_level: 500, location: 'Rack L1-A', last_updated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 25, package_size: '1L' },
      { id: 24, warehouse_id: 3, product_name: 'Diesel Engine Oil 15W-40 (5L)', product_code: 'DEO-15W40-5L', category: 'Lubricants', current_stock: 120, unit_type: '5L Jerricans', cost_value: 1800000, retail_value: 2400000, reorder_level: 40, max_level: 200, location: 'Rack L1-B', last_updated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 22, package_size: '5L' },
      { id: 25, warehouse_id: 3, product_name: 'Diesel Engine Oil 15W-40 (200L Drum)', product_code: 'DEO-15W40-200L', category: 'Lubricants', current_stock: 8, unit_type: '200L Drums', cost_value: 4800000, retail_value: 5600000, reorder_level: 3, max_level: 20, location: 'Bay L1-Drums', last_updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 35, package_size: '200L Drum' },

      // Multi-Purpose Grease
      { id: 26, warehouse_id: 3, product_name: 'Grease Multi-Purpose (500g)', product_code: 'GR-MP-500G', category: 'Lubricants', current_stock: 180, unit_type: '500g Tubs', cost_value: 540000, retail_value: 720000, reorder_level: 50, max_level: 400, location: 'Rack L2', last_updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 25, package_size: '500g' },

      // Industrial Gear Oil
      { id: 27, warehouse_id: 3, product_name: 'Industrial Gear Oil (5L)', product_code: 'IGO-220-5L', category: 'Lubricants', current_stock: 95, unit_type: '5L Jerricans', cost_value: 1425000, retail_value: 1662500, reorder_level: 30, max_level: 200, location: 'Rack L3-A', last_updated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 18, package_size: '5L' },

      // Hydraulic Oil AW 32
      { id: 28, warehouse_id: 3, product_name: 'Hydraulic Oil AW 32 (5L)', product_code: 'HO-AW32-5L', category: 'Hydraulics', current_stock: 55, unit_type: '5L Jerricans', cost_value: 660000, retail_value: 825000, reorder_level: 20, max_level: 120, location: 'Rack H1-A', last_updated: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), stock_status: 'low', days_of_supply: 8, package_size: '5L' },
      { id: 29, warehouse_id: 3, product_name: 'Hydraulic Oil AW 32 (20L Keg)', product_code: 'HO-AW32-20L', category: 'Hydraulics', current_stock: 18, unit_type: '20L Kegs', cost_value: 1080000, retail_value: 1350000, reorder_level: 8, max_level: 40, location: 'Rack H1-B', last_updated: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(), stock_status: 'low', days_of_supply: 6, package_size: '20L Keg' },

      // Compressor Oil
      { id: 30, warehouse_id: 3, product_name: 'Compressor Oil (5L)', product_code: 'CO-100-5L', category: 'Lubricants', current_stock: 45, unit_type: '5L Jerricans', cost_value: 675000, retail_value: 787500, reorder_level: 15, max_level: 100, location: 'Rack L4-A', last_updated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 15, package_size: '5L' },

      // Port Harcourt Warehouse (ID: 4) - Marine products
      { id: 31, warehouse_id: 4, product_name: 'Marine Hydraulic Oil (5L)', product_code: 'MHO-32-5L', category: 'Hydraulics', current_stock: 85, unit_type: '5L Jerricans', cost_value: 2125000, retail_value: 2550000, reorder_level: 25, max_level: 150, location: 'Rack H1-A', last_updated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 18, package_size: '5L' },
      { id: 32, warehouse_id: 4, product_name: 'Marine Hydraulic Oil (20L Keg)', product_code: 'MHO-32-20L', category: 'Hydraulics', current_stock: 35, unit_type: '20L Kegs', cost_value: 3500000, retail_value: 4200000, reorder_level: 10, max_level: 60, location: 'Rack H1-B', last_updated: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 22, package_size: '20L Keg' },
      { id: 33, warehouse_id: 4, product_name: 'Marine Engine Oil (1L)', product_code: 'MEO-001-1L', category: 'Lubricants', current_stock: 200, unit_type: '1L Bottles', cost_value: 800000, retail_value: 1100000, reorder_level: 60, max_level: 300, location: 'Rack L1-A', last_updated: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 16, package_size: '1L' },
      { id: 34, warehouse_id: 4, product_name: 'Heavy Duty Hydraulic Fluid (200L Drum)', product_code: 'HDHF-46-200L', category: 'Hydraulics', current_stock: 7, unit_type: '200L Drums', cost_value: 4200000, retail_value: 4900000, reorder_level: 2, max_level: 15, location: 'Bay H2-Drums', last_updated: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), stock_status: 'low', days_of_supply: 12, package_size: '200L Drum' }
    ]

    if (warehouseId) {
      return allInventory.filter(item => item.warehouse_id === warehouseId)
    }

    return allInventory
  }

  getMockSubstoreInventoryData(substoreId?: number) {
    const allInventory = [
      // Lagos Island Lubebay (ID: 1)
      { id: 1, substore_id: 1, substore_name: 'Lagos Island Lubebay', location: 'Lagos Island, Lagos', product_name: 'Engine Oil SAE 20W-50 (1L)', product_code: 'EO-20W50-1L', category: 'Lubricants', current_stock: 145, unit_type: '1L Bottles', cost_value: 435000, retail_value: 609000, reorder_level: 50, max_level: 300, last_restocked: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'John Adebayo', package_size: '1L' },
      { id: 2, substore_id: 1, substore_name: 'Lagos Island Lubebay', location: 'Lagos Island, Lagos', product_name: 'Engine Oil SAE 15W-40 (1L)', product_code: 'EO-15W40-1L', category: 'Lubricants', current_stock: 120, unit_type: '1L Bottles', cost_value: 324000, retail_value: 480000, reorder_level: 40, max_level: 250, last_restocked: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'John Adebayo', package_size: '1L' },
      { id: 3, substore_id: 1, substore_name: 'Lagos Island Lubebay', location: 'Lagos Island, Lagos', product_name: 'Brake Fluid DOT-4 (500ml)', product_code: 'BF-DOT4-500ML', category: 'Lubricants', current_stock: 85, unit_type: '500ml Bottles', cost_value: 170000, retail_value: 238000, reorder_level: 30, max_level: 150, last_restocked: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'John Adebayo', package_size: '500ml' },
      { id: 4, substore_id: 1, substore_name: 'Lagos Island Lubebay', location: 'Lagos Island, Lagos', product_name: 'Power Steering Fluid (1L)', product_code: 'PSF-001-1L', category: 'Hydraulics', current_stock: 45, unit_type: '1L Bottles', cost_value: 90000, retail_value: 126000, reorder_level: 20, max_level: 100, last_restocked: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'John Adebayo', package_size: '1L' },

      // Ikeja Lubebay (ID: 2)
      { id: 5, substore_id: 2, substore_name: 'Ikeja Lubebay', location: 'Ikeja, Lagos', product_name: 'Engine Oil SAE 10W-30 (1L)', product_code: 'EO-10W30-1L', category: 'Lubricants', current_stock: 180, unit_type: '1L Bottles', cost_value: 540000, retail_value: 810000, reorder_level: 60, max_level: 400, last_restocked: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Maria Okafor', package_size: '1L' },
      { id: 6, substore_id: 2, substore_name: 'Ikeja Lubebay', location: 'Ikeja, Lagos', product_name: 'Engine Oil SAE 10W-30 (4L)', product_code: 'EO-10W30-4L', category: 'Lubricants', current_stock: 65, unit_type: '4L Containers', cost_value: 780000, retail_value: 1040000, reorder_level: 20, max_level: 120, last_restocked: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Maria Okafor', package_size: '4L' },
      { id: 7, substore_id: 2, substore_name: 'Ikeja Lubebay', location: 'Ikeja, Lagos', product_name: 'Transmission Fluid ATF (1L)', product_code: 'TF-ATF-1L', category: 'Lubricants', current_stock: 75, unit_type: '1L Bottles', cost_value: 300000, retail_value: 412500, reorder_level: 25, max_level: 150, last_restocked: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Maria Okafor', package_size: '1L' },
      { id: 8, substore_id: 2, substore_name: 'Ikeja Lubebay', location: 'Ikeja, Lagos', product_name: 'Hydraulic Oil ISO 46 (5L)', product_code: 'HO-46-5L', category: 'Hydraulics', current_stock: 32, unit_type: '5L Jerricans', cost_value: 480000, retail_value: 608000, reorder_level: 15, max_level: 80, last_restocked: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Maria Okafor', package_size: '5L' },

      // Abuja Central Lubebay (ID: 3)
      { id: 9, substore_id: 3, substore_name: 'Abuja Central Lubebay', location: 'Central Business District, Abuja', product_name: 'Engine Oil SAE 15W-40 (1L)', product_code: 'EO-15W40-1L', category: 'Lubricants', current_stock: 85, unit_type: '1L Bottles', cost_value: 229500, retail_value: 340000, reorder_level: 40, max_level: 200, last_restocked: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Ibrahim Musa', package_size: '1L' },
      { id: 10, substore_id: 3, substore_name: 'Abuja Central Lubebay', location: 'Central Business District, Abuja', product_name: 'Engine Oil SAE 20W-50 (1L)', product_code: 'EO-20W50-1L', category: 'Lubricants', current_stock: 15, unit_type: '1L Bottles', cost_value: 45000, retail_value: 63000, reorder_level: 50, max_level: 200, last_restocked: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(), stock_status: 'critical', manager: 'Ibrahim Musa', package_size: '1L' },
      { id: 11, substore_id: 3, substore_name: 'Abuja Central Lubebay', location: 'Central Business District, Abuja', product_name: 'Coolant Fluid (1L)', product_code: 'CF-001-1L', category: 'Lubricants', current_stock: 65, unit_type: '1L Bottles', cost_value: 97500, retail_value: 130000, reorder_level: 30, max_level: 150, last_restocked: new Date(Date.now() - 84 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Ibrahim Musa', package_size: '1L' },

      // Kano Lubebay (ID: 4)
      { id: 12, substore_id: 4, substore_name: 'Kano Lubebay', location: 'Kano City, Kano', product_name: 'Diesel Engine Oil 15W-40 (1L)', product_code: 'DEO-15W40-1L', category: 'Lubricants', current_stock: 110, unit_type: '1L Bottles', cost_value: 330000, retail_value: 495000, reorder_level: 40, max_level: 250, last_restocked: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Fatima Aliyu', package_size: '1L' },
      { id: 13, substore_id: 4, substore_name: 'Kano Lubebay', location: 'Kano City, Kano', product_name: 'Diesel Engine Oil 15W-40 (5L)', product_code: 'DEO-15W40-5L', category: 'Lubricants', current_stock: 25, unit_type: '5L Jerricans', cost_value: 375000, retail_value: 500000, reorder_level: 15, max_level: 60, last_restocked: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), stock_status: 'low', manager: 'Fatima Aliyu', package_size: '5L' },
      { id: 14, substore_id: 4, substore_name: 'Kano Lubebay', location: 'Kano City, Kano', product_name: 'Grease Multi-Purpose (500g)', product_code: 'GR-MP-500G', category: 'Lubricants', current_stock: 35, unit_type: '500g Tubs', cost_value: 105000, retail_value: 140000, reorder_level: 20, max_level: 80, last_restocked: new Date(Date.now() - 108 * 60 * 60 * 1000).toISOString(), stock_status: 'low', manager: 'Fatima Aliyu', package_size: '500g' },

      // Port Harcourt Lubebay (ID: 5)
      { id: 15, substore_id: 5, substore_name: 'Port Harcourt Lubebay', location: 'Port Harcourt, Rivers', product_name: 'Marine Engine Oil (1L)', product_code: 'MEO-001-1L', category: 'Lubricants', current_stock: 75, unit_type: '1L Bottles', cost_value: 300000, retail_value: 412500, reorder_level: 30, max_level: 150, last_restocked: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Grace Eze', package_size: '1L' },
      { id: 16, substore_id: 5, substore_name: 'Port Harcourt Lubebay', location: 'Port Harcourt, Rivers', product_name: 'Marine Hydraulic Oil (5L)', product_code: 'MHO-32-5L', category: 'Hydraulics', current_stock: 18, unit_type: '5L Jerricans', cost_value: 450000, retail_value: 540000, reorder_level: 10, max_level: 50, last_restocked: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(), stock_status: 'low', manager: 'Grace Eze', package_size: '5L' },
      { id: 17, substore_id: 5, substore_name: 'Port Harcourt Lubebay', location: 'Port Harcourt, Rivers', product_name: 'Engine Oil SAE 20W-50 (1L)', product_code: 'EO-20W50-1L', category: 'Lubricants', current_stock: 45, unit_type: '1L Bottles', cost_value: 135000, retail_value: 189000, reorder_level: 25, max_level: 100, last_restocked: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Grace Eze', package_size: '1L' },

      // Ilorin Lubebay (ID: 6)
      { id: 18, substore_id: 6, substore_name: 'Ilorin Lubebay', location: 'Ilorin, Kwara', product_name: 'Engine Oil SAE 15W-40 (1L)', product_code: 'EO-15W40-1L', category: 'Lubricants', current_stock: 8, unit_type: '1L Bottles', cost_value: 21600, retail_value: 32000, reorder_level: 40, max_level: 200, last_restocked: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(), stock_status: 'critical', manager: 'Ahmed Lawal', package_size: '1L' },
      { id: 19, substore_id: 6, substore_name: 'Ilorin Lubebay', location: 'Ilorin, Kwara', product_name: 'Transmission Fluid ATF (1L)', product_code: 'TF-ATF-1L', category: 'Lubricants', current_stock: 25, unit_type: '1L Bottles', cost_value: 100000, retail_value: 137500, reorder_level: 20, max_level: 100, last_restocked: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Ahmed Lawal', package_size: '1L' },
      { id: 20, substore_id: 6, substore_name: 'Ilorin Lubebay', location: 'Ilorin, Kwara', product_name: 'Hydraulic Oil AW 32 (5L)', product_code: 'HO-AW32-5L', category: 'Hydraulics', current_stock: 12, unit_type: '5L Jerricans', cost_value: 144000, retail_value: 180000, reorder_level: 10, max_level: 40, last_restocked: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Ahmed Lawal', package_size: '5L' }
    ]

    if (substoreId) {
      return allInventory.filter(item => item.substore_id === substoreId)
    }

    return allInventory
  }

  getMockSubstoreBinCardData(productId: number, substoreId: number) {
    // Generate bin card data for specific product in specific substore
    const binCardData = [
      // Opening Balance
      {
        id: 1,
        product_id: productId,
        substore_id: substoreId,
        transaction_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Opening Balance',
        description: 'Opening balance brought forward from system migration',
        reference: 'OB-SUBSTORE-2024-001',
        received: 0,
        issued: 0,
        balance: productId <= 5 ? 200 : productId <= 10 ? 150 : productId <= 15 ? 100 : 80,
        unit_cost: productId <= 5 ? 3000 : productId <= 10 ? 3500 : productId <= 15 ? 4000 : 2800,
        created_by: 'System'
      },
      // Recent Receipts from Main Warehouse
      {
        id: 2,
        product_id: productId,
        substore_id: substoreId,
        transaction_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Transfer In',
        description: 'Transfer from Lagos Main Warehouse',
        reference: 'TRF-MW-SUB-001',
        received: productId <= 5 ? 100 : productId <= 10 ? 80 : productId <= 15 ? 50 : 60,
        issued: 0,
        balance: productId <= 5 ? 300 : productId <= 10 ? 230 : productId <= 15 ? 150 : 140,
        unit_cost: productId <= 5 ? 3000 : productId <= 10 ? 3500 : productId <= 15 ? 4000 : 2800,
        created_by: 'Transfer Manager'
      },
      // Sales/Issues to customers
      {
        id: 3,
        product_id: productId,
        substore_id: substoreId,
        transaction_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Sale',
        description: 'Retail sale to walk-in customer',
        reference: 'SALE-SUB-2024-089',
        received: 0,
        issued: productId <= 5 ? 25 : productId <= 10 ? 20 : productId <= 15 ? 15 : 18,
        balance: productId <= 5 ? 275 : productId <= 10 ? 210 : productId <= 15 ? 135 : 122,
        unit_cost: productId <= 5 ? 3000 : productId <= 10 ? 3500 : productId <= 15 ? 4000 : 2800,
        created_by: 'Sales Associate'
      },
      // Another sale
      {
        id: 4,
        product_id: productId,
        substore_id: substoreId,
        transaction_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Sale',
        description: 'Bulk sale to automotive workshop',
        reference: 'SALE-SUB-2024-095',
        received: 0,
        issued: productId <= 5 ? 35 : productId <= 10 ? 30 : productId <= 15 ? 25 : 20,
        balance: productId <= 5 ? 240 : productId <= 10 ? 180 : productId <= 15 ? 110 : 102,
        unit_cost: productId <= 5 ? 3000 : productId <= 10 ? 3500 : productId <= 15 ? 4000 : 2800,
        created_by: 'Sales Associate'
      },
      // Stock adjustment
      {
        id: 5,
        product_id: productId,
        substore_id: substoreId,
        transaction_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Adjustment',
        description: 'Stock count adjustment - damaged containers',
        reference: 'ADJ-SUB-2024-003',
        received: 0,
        issued: productId <= 5 ? 5 : productId <= 10 ? 3 : productId <= 15 ? 2 : 4,
        balance: productId <= 5 ? 235 : productId <= 10 ? 177 : productId <= 15 ? 108 : 98,
        unit_cost: productId <= 5 ? 3000 : productId <= 10 ? 3500 : productId <= 15 ? 4000 : 2800,
        created_by: 'Store Manager'
      },
      // Recent transfer from another substore
      {
        id: 6,
        product_id: productId,
        substore_id: substoreId,
        transaction_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Transfer In',
        description: 'Emergency transfer from Ikeja Lubebay',
        reference: 'TRF-SUB-SUB-012',
        received: productId <= 5 ? 15 : productId <= 10 ? 12 : productId <= 15 ? 8 : 10,
        issued: 0,
        balance: productId <= 5 ? 250 : productId <= 10 ? 189 : productId <= 15 ? 116 : 108,
        unit_cost: productId <= 5 ? 3000 : productId <= 10 ? 3500 : productId <= 15 ? 4000 : 2800,
        created_by: 'Store Manager'
      },
      // More recent sales
      {
        id: 7,
        product_id: productId,
        substore_id: substoreId,
        transaction_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Sale',
        description: 'Sale to corporate client',
        reference: 'SALE-SUB-2024-102',
        received: 0,
        issued: productId <= 5 ? 45 : productId <= 10 ? 25 : productId <= 15 ? 18 : 22,
        balance: productId <= 5 ? 205 : productId <= 10 ? 164 : productId <= 15 ? 98 : 86,
        unit_cost: productId <= 5 ? 3000 : productId <= 10 ? 3500 : productId <= 15 ? 4000 : 2800,
        created_by: 'Sales Associate'
      },
      // Current balance matches what's in the inventory
      {
        id: 8,
        product_id: productId,
        substore_id: substoreId,
        transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Sale',
        description: 'Recent retail sales',
        reference: 'SALE-SUB-2024-108',
        received: 0,
        issued: productId <= 5 ? 60 : productId <= 10 ? 44 : productId <= 15 ? 23 : 31,
        balance: productId <= 5 ? 145 : productId <= 10 ? 120 : productId <= 15 ? 75 : 55,
        unit_cost: productId <= 5 ? 3000 : productId <= 10 ? 3500 : productId <= 15 ? 4000 : 2800,
        created_by: 'Sales Associate'
      }
    ]

    return binCardData
  }

  getMockStockTransactionsData() {
    return [
      { id: 1, transaction_type: 'Inbound', product_name: 'Premium Motor Spirit (PMS)', product_code: 'PMS-001', quantity: 25000, unit_type: 'Litres', unit_cost: 580, total_cost: 14500000, reference: 'PO-2024-001', source: 'NNPC Depot Lagos', destination: 'Main Warehouse', transaction_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), status: 'completed', created_by: 'John Doe' },
      { id: 2, transaction_type: 'Transfer', product_name: 'Automotive Gas Oil (AGO)', product_code: 'AGO-001', quantity: 5000, unit_type: 'Litres', unit_cost: 795, total_cost: 3975000, reference: 'TRF-2024-012', source: 'Main Warehouse', destination: 'Lagos Island Substore', transaction_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: 'completed', created_by: 'Store Manager' },
      { id: 3, transaction_type: 'Adjustment', product_name: 'Engine Oil SAE 20W-50', product_code: 'EO-20W50', quantity: -15, unit_type: 'Litres', unit_cost: 3200, total_cost: -48000, reference: 'ADJ-2024-003', source: 'Main Warehouse', destination: 'Adjustment', transaction_date: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), status: 'completed', created_by: 'Inventory Manager' },
      { id: 4, transaction_type: 'Outbound', product_name: 'Dual Purpose Kerosene (DPK)', product_code: 'DPK-001', quantity: 2000, unit_type: 'Litres', unit_cost: 710, total_cost: 1420000, reference: 'SALE-2024-089', source: 'Main Warehouse', destination: 'Direct Customer', transaction_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), status: 'completed', created_by: 'Sales Rep' },
      { id: 5, transaction_type: 'Transfer', product_name: 'Liquefied Petroleum Gas (LPG)', product_code: 'LPG-001', quantity: 500, unit_type: 'Kg', unit_cost: 1100, total_cost: 550000, reference: 'TRF-2024-013', source: 'Main Warehouse', destination: 'Abuja Central Substore', transaction_date: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(), status: 'pending', created_by: 'Logistics Manager' },
      { id: 6, transaction_type: 'Inbound', product_name: 'Brake Fluid DOT-3', product_code: 'BF-DOT3', quantity: 100, unit_type: 'Litres', unit_cost: 1600, total_cost: 160000, reference: 'PO-2024-002', source: 'Valvoline Nigeria', destination: 'Main Warehouse', transaction_date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), status: 'pending', created_by: 'Purchase Manager' }
    ]
  }

  getMockProductBinCardData(productId: number, warehouseId: number) {
    // Generate bin card data for specific product in specific warehouse
    const binCardData = [
      // Opening Balance
      {
        id: 1,
        product_id: productId,
        warehouse_id: warehouseId,
        transaction_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Opening Balance',
        description: 'Opening balance brought forward',
        reference: 'OB-2024-001',
        received: 0,
        issued: 0,
        balance: productId === 1 ? 20000 : productId === 7 ? 15000 : productId === 11 ? 12000 : productId === 16 ? 8000 : 5000,
        unit_cost: productId === 1 ? 580 : productId === 7 ? 580 : productId === 11 ? 580 : productId === 16 ? 795 : 3200,
        created_by: 'System'
      },
      // Recent Receipts
      {
        id: 2,
        product_id: productId,
        warehouse_id: warehouseId,
        transaction_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Receipt',
        description: 'Purchase from NNPC Depot',
        reference: 'PO-2024-001',
        received: productId === 1 ? 30000 : productId === 7 ? 15000 : productId === 11 ? 10000 : productId === 16 ? 8000 : 200,
        issued: 0,
        balance: productId === 1 ? 50000 : productId === 7 ? 30000 : productId === 11 ? 22000 : productId === 16 ? 16000 : 5200,
        unit_cost: productId === 1 ? 580 : productId === 7 ? 580 : productId === 11 ? 580 : productId === 16 ? 795 : 3200,
        created_by: 'Purchase Manager'
      },
      // Issues/Transfers
      {
        id: 3,
        product_id: productId,
        warehouse_id: warehouseId,
        transaction_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Issue',
        description: 'Transfer to Lagos Island Substore',
        reference: 'TRF-2024-012',
        received: 0,
        issued: productId === 1 ? 3000 : productId === 7 ? 5000 : productId === 11 ? 2000 : productId === 16 ? 2000 : 50,
        balance: productId === 1 ? 47000 : productId === 7 ? 25000 : productId === 11 ? 20000 : productId === 16 ? 14000 : 5150,
        unit_cost: productId === 1 ? 580 : productId === 7 ? 580 : productId === 11 ? 580 : productId === 16 ? 795 : 3200,
        created_by: 'Store Manager'
      },
      {
        id: 4,
        product_id: productId,
        warehouse_id: warehouseId,
        transaction_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Issue',
        description: 'Direct sales to customer',
        reference: 'SALE-2024-089',
        received: 0,
        issued: productId === 1 ? 2000 : productId === 7 ? 3000 : productId === 11 ? 1500 : productId === 16 ? 2000 : 25,
        balance: productId === 1 ? 45000 : productId === 7 ? 22000 : productId === 11 ? 18500 : productId === 16 ? 12000 : 5125,
        unit_cost: productId === 1 ? 580 : productId === 7 ? 580 : productId === 11 ? 580 : productId === 16 ? 795 : 3200,
        created_by: 'Sales Representative'
      },
      // Current Balance matches inventory
      {
        id: 5,
        product_id: productId,
        warehouse_id: warehouseId,
        transaction_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'Current Balance',
        description: 'Current stock position',
        reference: 'CB-2024-CURRENT',
        received: 0,
        issued: 0,
        balance: productId === 1 ? 45000 : productId === 7 ? 22000 : productId === 11 ? 18500 : productId === 16 ? 12000 : 200,
        unit_cost: productId === 1 ? 580 : productId === 7 ? 580 : productId === 11 ? 580 : productId === 16 ? 795 : 3200,
        created_by: 'System'
      }
    ]

    return binCardData
  }

  getMockStockTransfersData() {
    return [
      { id: 1, transfer_number: 'TRF-2024-001', source_location: 'Main Warehouse', destination_location: 'Lagos Island Substore', product_name: 'Premium Motor Spirit (PMS)', product_code: 'PMS-001', quantity: 5000, unit_type: 'Litres', status: 'completed', requested_by: 'John Adebayo', approved_by: 'Store Manager', created_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), transfer_date: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), received_date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), notes: 'Regular restocking' },
      { id: 2, transfer_number: 'TRF-2024-002', source_location: 'Main Warehouse', destination_location: 'Ikeja Substore', product_name: 'Automotive Gas Oil (AGO)', product_code: 'AGO-001', quantity: 3000, unit_type: 'Litres', status: 'in_transit', requested_by: 'Maria Okafor', approved_by: 'Store Manager', created_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), transfer_date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), received_date: null, notes: 'Emergency restock due to high demand' },
      { id: 3, transfer_number: 'TRF-2024-003', source_location: 'Lagos Island Substore', destination_location: 'Abuja Central Substore', product_name: 'Engine Oil SAE 20W-50', product_code: 'EO-20W50', quantity: 50, unit_type: 'Litres', status: 'pending', requested_by: 'Ibrahim Musa', approved_by: null, created_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), transfer_date: null, received_date: null, notes: 'Inter-substore transfer for stock balancing' },
      { id: 4, transfer_number: 'TRF-2024-004', source_location: 'Main Warehouse', destination_location: 'Kano Substore', product_name: 'Dual Purpose Kerosene (DPK)', product_code: 'DPK-001', quantity: 2500, unit_type: 'Litres', status: 'approved', requested_by: 'Fatima Aliyu', approved_by: 'Logistics Manager', created_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), transfer_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), received_date: null, notes: 'Scheduled transfer for next delivery cycle' },
      { id: 5, transfer_number: 'TRF-2024-005', source_location: 'Main Warehouse', destination_location: 'Port Harcourt Substore', product_name: 'Liquefied Petroleum Gas (LPG)', product_code: 'LPG-001', quantity: 200, unit_type: 'Kg', status: 'rejected', requested_by: 'Grace Eze', approved_by: 'Store Manager', created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), transfer_date: null, received_date: null, notes: 'Rejected due to insufficient stock at source' }
    ]
  }

  getMockSubstoresData() {
    return [
      { id: 1, name: 'Lagos Island Lubebay', code: 'LUB-LIS', type: 'lubebay', location: 'Lagos Island, Lagos', state: 'Lagos', manager: 'John Adebayo', phone: '+234-801-234-5678', email: 'john.adebayo@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 15200000, commission_rate: 8.5, products_count: 12, last_transaction: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), rating: 4.8 },
      { id: 2, name: 'Ikeja Filling Station', code: 'FS-IKJ', type: 'filling_station', location: 'Ikeja GRA, Lagos', state: 'Lagos', manager: 'Maria Okafor', phone: '+234-803-567-8901', email: 'maria.okafor@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 545 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 12800000, commission_rate: 8.0, products_count: 15, last_transaction: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), rating: 4.6 },
      { id: 3, name: 'Abuja Central Lubebay', code: 'LUB-ABC', type: 'lubebay', location: 'Central Business District, Abuja', state: 'FCT', manager: 'Ibrahim Musa', phone: '+234-805-123-4567', email: 'ibrahim.musa@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 9800000, commission_rate: 7.5, products_count: 10, last_transaction: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), rating: 4.4 },
      { id: 4, name: 'Kano Filling Station', code: 'FS-KAN', type: 'filling_station', location: 'Kano City, Kano', state: 'Kano', manager: 'Fatima Aliyu', phone: '+234-807-654-3210', email: 'fatima.aliyu@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 455 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 6700000, commission_rate: 7.0, products_count: 8, last_transaction: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), rating: 4.2 },
      { id: 5, name: 'Port Harcourt Lubebay', code: 'LUB-PHC', type: 'lubebay', location: 'Port Harcourt, Rivers', state: 'Rivers', manager: 'Grace Eze', phone: '+234-809-876-5432', email: 'grace.eze@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 8900000, commission_rate: 8.0, products_count: 11, last_transaction: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), rating: 4.7 },
      { id: 6, name: 'Ilorin Filling Station', code: 'FS-ILR', type: 'filling_station', location: 'Ilorin, Kwara', state: 'Kwara', manager: 'Ahmed Lawal', phone: '+234-811-111-2222', email: 'ahmed.lawal@mofadenergysolutions.com', status: 'inactive', opening_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 3200000, commission_rate: 6.5, products_count: 6, last_transaction: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), rating: 3.8 }
    ]
  }

  getMockLocationsData() {
    return [
      { id: 'main-warehouse', name: 'Main Warehouse', type: 'warehouse' },
      { id: 'lagos-island', name: 'Lagos Island Substore', type: 'substore' },
      { id: 'victoria-island', name: 'Victoria Island Substore', type: 'substore' },
      { id: 'ikeja', name: 'Ikeja Substore', type: 'substore' },
      { id: 'abuja-central', name: 'Abuja Central Substore', type: 'substore' },
      { id: 'port-harcourt', name: 'Port Harcourt Substore', type: 'substore' },
      { id: 'kano-central', name: 'Kano Central Substore', type: 'substore' }
    ]
  }

  getMockProductsByLocation(location: string) {
    // Return different products based on location
    const commonProducts = [
      { id: 1, name: 'Engine Oil SAE 20W-50 (1L)', code: 'EO-20W50-1L', unit: '1L Bottles', current_stock: 145 },
      { id: 2, name: 'Engine Oil SAE 15W-40 (1L)', code: 'EO-15W40-1L', unit: '1L Bottles', current_stock: 120 },
      { id: 3, name: 'Brake Fluid DOT-4 (500ml)', code: 'BF-DOT4-500ML', unit: '500ml Bottles', current_stock: 85 }
    ]

    const warehouseProducts = [
      ...commonProducts,
      { id: 4, name: 'Premium Motor Spirit (PMS)', code: 'PMS-001', unit: 'Litres', current_stock: 5000 },
      { id: 5, name: 'Automotive Gas Oil (AGO)', code: 'AGO-001', unit: 'Litres', current_stock: 3000 },
      { id: 6, name: 'Liquefied Petroleum Gas (LPG)', code: 'LPG-001', unit: 'Kg', current_stock: 1500 },
      { id: 7, name: 'Liquefied Natural Gas (LNG)', code: 'LNG-001', unit: 'Kg', current_stock: 800 }
    ]

    if (location.toLowerCase().includes('warehouse')) {
      return warehouseProducts
    }

    return commonProducts
  }

  getMockSubstoreTransactionsData() {
    return [
      { id: 1, substore: 'Lagos Island Substore', transaction_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), product_name: 'Engine Oil SAE 20W-50 (1L)', quantity: 125, unit_price: 4500, total_amount: 562500, transaction_type: 'sale', customer_type: 'retail', payment_method: 'cash', reference: 'SST-2024-001', status: 'completed', commission_earned: 45000, manager: 'John Adebayo' },
      { id: 2, substore: 'Ikeja Substore', transaction_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), product_name: 'Oil Filter - Standard', quantity: 80, unit_price: 3500, total_amount: 280000, transaction_type: 'sale', customer_type: 'wholesale', payment_method: 'bank_transfer', reference: 'SST-2024-002', status: 'completed', commission_earned: 22400, manager: 'Maria Okafor' },
      { id: 3, substore: 'Abuja Central Substore', transaction_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), product_name: 'Air Filter - Heavy Duty', quantity: 65, unit_price: 4200, total_amount: 273000, transaction_type: 'sale', customer_type: 'retail', payment_method: 'pos', reference: 'SST-2024-003', status: 'completed', commission_earned: 21840, manager: 'Ibrahim Musa' },
      { id: 4, substore: 'Port Harcourt Substore', transaction_date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), product_name: 'Engine Oil SAE 20W-50', quantity: 25, unit_price: 4500, total_amount: 112500, transaction_type: 'sale', customer_type: 'retail', payment_method: 'cash', reference: 'SST-2024-004', status: 'completed', commission_earned: 9000, manager: 'Grace Eze' },
      { id: 5, substore: 'Kano Substore', transaction_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), product_name: 'Brake Fluid DOT-3', quantity: 45, unit_price: 2200, total_amount: 99000, transaction_type: 'sale', customer_type: 'retail', payment_method: 'cash', reference: 'SST-2024-005', status: 'completed', commission_earned: 7920, manager: 'Fatima Aliyu' },
      { id: 6, substore: 'Lagos Island Substore', transaction_date: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), product_name: 'Hydraulic Oil ISO 46', quantity: 15, unit_price: 15000, total_amount: 225000, transaction_type: 'return', customer_type: 'wholesale', payment_method: 'bank_transfer', reference: 'SST-2024-006', status: 'pending', commission_earned: -18000, manager: 'John Adebayo' }
    ]
  }

  getMockLubebaysData() {
    return [
      { id: 1, name: 'Surulere Lubebay', code: 'LUB-SUR', location: 'Surulere, Lagos', state: 'Lagos', manager: 'Kunle Adeniyi', phone: '+234-802-333-4444', email: 'kunle.adeniyi@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString(), monthly_revenue: 8500000, service_bays: 4, services_offered: 8, last_service: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), rating: 4.6, specialization: 'Quick Service' },
      { id: 2, name: 'Wuse II Lubebay', code: 'LUB-WUS', location: 'Wuse II, Abuja', state: 'FCT', manager: 'Blessing Okoro', phone: '+234-804-555-6666', email: 'blessing.okoro@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 420 * 24 * 60 * 60 * 1000).toISOString(), monthly_revenue: 6800000, service_bays: 3, services_offered: 6, last_service: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), rating: 4.4, specialization: 'Full Service' },
      { id: 3, name: 'Kaduna Lubebay', code: 'LUB-KAD', location: 'Kaduna South, Kaduna', state: 'Kaduna', manager: 'Sani Muhammad', phone: '+234-806-777-8888', email: 'sani.muhammad@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(), monthly_revenue: 4200000, service_bays: 2, services_offered: 5, last_service: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), rating: 4.2, specialization: 'Express Service' },
      { id: 4, name: 'Benin City Lubebay', code: 'LUB-BEN', location: 'Benin City, Edo', state: 'Edo', manager: 'Osaze Okafor', phone: '+234-808-999-0000', email: 'osaze.okafor@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(), monthly_revenue: 5600000, service_bays: 3, services_offered: 7, last_service: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), rating: 4.5, specialization: 'Premium Service' },
      { id: 5, name: 'Enugu Lubebay', code: 'LUB-ENU', location: 'Independence Layout, Enugu', state: 'Enugu', manager: 'Chioma Eze', phone: '+234-810-123-4567', email: 'chioma.eze@mofadenergysolutions.com', status: 'inactive', opening_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), monthly_revenue: 2100000, service_bays: 2, services_offered: 4, last_service: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), rating: 3.9, specialization: 'Basic Service' }
    ]
  }

  getMockLubebayServicesData() {
    return [
      { id: 1, lubebay: 'Surulere Lubebay', service_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), service_type: 'Premium Oil Change', vehicle_type: 'Sedan', customer_name: 'Mr. James Okoye', total_amount: 8500, service_duration: 45, technician: 'Emeka John', bay_number: 2, payment_method: 'card', reference: 'LST-2024-001', status: 'completed', commission_earned: 2550, rating: 5 },
      { id: 2, lubebay: 'Wuse II Lubebay', service_date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), service_type: 'Express Car Wash', vehicle_type: 'SUV', customer_name: 'Mrs. Aisha Mohammed', total_amount: 3500, service_duration: 25, technician: 'David Okon', bay_number: 1, payment_method: 'cash', reference: 'LST-2024-002', status: 'completed', commission_earned: 1050, rating: 4 },
      { id: 3, lubebay: 'Kaduna Lubebay', service_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), service_type: 'Tire Pressure Check', vehicle_type: 'Hatchback', customer_name: 'Mallam Sule Ahmad', total_amount: 1500, service_duration: 15, technician: 'Ibrahim Yakubu', bay_number: 1, payment_method: 'cash', reference: 'LST-2024-003', status: 'completed', commission_earned: 450, rating: 5 },
      { id: 4, lubebay: 'Benin City Lubebay', service_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), service_type: 'Engine Diagnostics', vehicle_type: 'Truck', customer_name: 'Chief Osagie Edo', total_amount: 6000, service_duration: 60, technician: 'Monday Osas', bay_number: 3, payment_method: 'bank_transfer', reference: 'LST-2024-004', status: 'completed', commission_earned: 1800, rating: 4 },
      { id: 5, lubebay: 'Surulere Lubebay', service_date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), service_type: 'Premium Car Wash', vehicle_type: 'Luxury Car', customer_name: 'Dr. Folake Adebayo', total_amount: 5500, service_duration: 50, technician: 'Tunde Akin', bay_number: 4, payment_method: 'card', reference: 'LST-2024-005', status: 'completed', commission_earned: 1650, rating: 5 },
      { id: 6, lubebay: 'Wuse II Lubebay', service_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), service_type: 'Brake System Check', vehicle_type: 'Van', customer_name: 'Rev. Peter Okoh', total_amount: 4500, service_duration: 40, technician: 'Samuel Bello', bay_number: 2, payment_method: 'pos', reference: 'LST-2024-006', status: 'in_progress', commission_earned: 0, rating: 0 }
    ]
  }

  getMockSuppliersData() {
    return [
      {
        id: 1,
        name: 'NNPC Retail Ltd',
        email: 'supply@nnpcretail.com',
        phone: '+234-901-234-5678',
        address: '123 Herbert Macaulay Way, Central Business District, Abuja',
        contact_person: 'Mr. Adamu Mohammed',
        contact_phone: '+234-803-555-0001',
        payment_terms: 'NET 30',
        credit_limit: 100000000,
        current_balance: 12500000,
        supplier_type: 'Primary',
        products_supplied: ['Engine Oil SAE 20W-50', 'Engine Oil SAE 15W-40', 'Transmission Fluid', 'Hydraulic Oil'],
        rating: 4.8,
        status: 'active',
        last_order_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 45,
        total_value_ytd: 185000000,
        created_at: new Date(Date.now() - 1095 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'ETERNA Plc',
        email: 'procurement@eterna.ng',
        phone: '+234-701-111-2222',
        address: '56 Marina Street, Lagos Island, Lagos',
        contact_person: 'Mrs. Funmi Adebayo',
        contact_phone: '+234-805-111-2222',
        payment_terms: 'NET 15',
        credit_limit: 75000000,
        current_balance: 8900000,
        supplier_type: 'Premium',
        products_supplied: ['Engine Oil SAE 10W-30', 'Engine Oil SAE 15W-40', 'Brake Fluid DOT-3', 'Gear Oil', 'Lubricants'],
        rating: 4.7,
        status: 'active',
        last_order_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 38,
        total_value_ytd: 142000000,
        created_at: new Date(Date.now() - 890 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: 'ARDOVA Plc',
        email: 'supply@ardova.com',
        phone: '+234-802-333-4444',
        address: '24 Creek Road, Apapa, Lagos',
        contact_person: 'Mr. Emeka Okonkwo',
        contact_phone: '+234-807-333-4444',
        payment_terms: 'NET 21',
        credit_limit: 60000000,
        current_balance: 5600000,
        supplier_type: 'Premium',
        products_supplied: ['PMS (Petrol)', 'AGO (Diesel)', 'Aviation Fuel', 'Marine Gas Oil'],
        rating: 4.6,
        status: 'active',
        last_order_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 32,
        total_value_ytd: 128000000,
        created_at: new Date(Date.now() - 750 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        name: 'Total Energies Nigeria',
        email: 'procurement@totalenergies.ng',
        phone: '+234-701-800-9000',
        address: '16 Broad Street, Victoria Island, Lagos',
        contact_person: 'Mrs. Florence Okafor',
        contact_phone: '+234-805-666-0002',
        payment_terms: 'NET 15',
        credit_limit: 55000000,
        current_balance: 4500000,
        supplier_type: 'Premium',
        products_supplied: ['PMS (Petrol)', 'AGO (Diesel)', 'Engine Oil SAE 20W-50', 'Engine Oil SAE 10W-30', 'Brake Fluid'],
        rating: 4.9,
        status: 'active',
        last_order_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 28,
        total_value_ytd: 95000000,
        created_at: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        name: 'Shell Nigeria Ltd',
        email: 'orders@shell.ng',
        phone: '+234-802-400-7000',
        address: '21A Kofo Abayomi Street, Victoria Island, Lagos',
        contact_person: 'Mr. David Chen',
        contact_phone: '+234-807-777-0003',
        payment_terms: 'NET 30',
        credit_limit: 70000000,
        current_balance: 8900000,
        supplier_type: 'Premium',
        products_supplied: ['PMS (Petrol)', 'AGO (Diesel)', 'Engine Oil SAE 10W-30', 'Gear Oil', 'Fuel System Cleaner'],
        rating: 4.8,
        status: 'active',
        last_order_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 25,
        total_value_ytd: 112000000,
        created_at: new Date(Date.now() - 912 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 6,
        name: 'Conoil Plc',
        email: 'procurement@conoil.com',
        phone: '+234-803-555-6666',
        address: '38 Marina Street, Lagos Island, Lagos',
        contact_person: 'Alhaji Musa Ibrahim',
        contact_phone: '+234-809-555-6666',
        payment_terms: 'NET 45',
        credit_limit: 40000000,
        current_balance: 3200000,
        supplier_type: 'Standard',
        products_supplied: ['PMS (Petrol)', 'AGO (Diesel)', 'DPK (Kerosene)', 'Base Oil'],
        rating: 4.4,
        status: 'active',
        last_order_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 22,
        total_value_ytd: 78000000,
        created_at: new Date(Date.now() - 1200 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 7,
        name: 'MRS Oil Nigeria Plc',
        email: 'supply@mrsoil.com',
        phone: '+234-804-777-8888',
        address: '4 Akin Adesola Street, Victoria Island, Lagos',
        contact_person: 'Mrs. Adunni Balogun',
        contact_phone: '+234-811-777-8888',
        payment_terms: 'NET 30',
        credit_limit: 45000000,
        current_balance: 6700000,
        supplier_type: 'Standard',
        products_supplied: ['PMS (Petrol)', 'AGO (Diesel)', 'Aviation Fuel', 'Bitumen'],
        rating: 4.5,
        status: 'active',
        last_order_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 20,
        total_value_ytd: 85000000,
        created_at: new Date(Date.now() - 980 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 8,
        name: 'Oando Plc',
        email: 'procurement@oando.com',
        phone: '+234-805-888-9999',
        address: '2 Ajose Adeogun Street, Victoria Island, Lagos',
        contact_person: 'Dr. Chinwe Okeke',
        contact_phone: '+234-813-888-9999',
        payment_terms: 'NET 21',
        credit_limit: 65000000,
        current_balance: 7800000,
        supplier_type: 'Premium',
        products_supplied: ['PMS (Petrol)', 'AGO (Diesel)', 'DPK (Kerosene)', 'Aviation Fuel', 'Lubricants'],
        rating: 4.6,
        status: 'active',
        last_order_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 30,
        total_value_ytd: 118000000,
        created_at: new Date(Date.now() - 1350 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 9,
        name: 'Mobil Oil Nigeria',
        email: 'supply@mobiloil.ng',
        phone: '+234-803-500-8000',
        address: '54 Marina Street, Lagos Island, Lagos',
        contact_person: 'Engr. Kemi Adebayo',
        contact_phone: '+234-809-888-0004',
        payment_terms: 'NET 45',
        credit_limit: 35000000,
        current_balance: 6200000,
        supplier_type: 'Standard',
        products_supplied: ['Engine Oil SAE 20W-50', 'Gear Oil SAE 80W-90', 'Engine Oil Additive', 'Radiator Coolant'],
        rating: 4.6,
        status: 'active',
        last_order_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 18,
        total_value_ytd: 48500000,
        created_at: new Date(Date.now() - 1460 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 10,
        name: 'Chevron Nigeria Ltd',
        email: 'procurement@chevron.ng',
        phone: '+234-806-999-0000',
        address: '1 Chevron Drive, Lekki, Lagos',
        contact_person: 'Mr. James Anderson',
        contact_phone: '+234-815-999-0000',
        payment_terms: 'NET 30',
        credit_limit: 80000000,
        current_balance: 9500000,
        supplier_type: 'Premium',
        products_supplied: ['PMS (Petrol)', 'AGO (Diesel)', 'Base Oil', 'Industrial Lubricants', 'Marine Fuel'],
        rating: 4.7,
        status: 'active',
        last_order_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 24,
        total_value_ytd: 105000000,
        created_at: new Date(Date.now() - 1680 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 11,
        name: 'Forte Oil Plc (ARDOVA)',
        email: 'supply@forteoil.com',
        phone: '+234-807-111-2222',
        address: '12 Idowu Taylor Street, Victoria Island, Lagos',
        contact_person: 'Mrs. Yemi Ogundimu',
        contact_phone: '+234-817-111-2222',
        payment_terms: 'NET 21',
        credit_limit: 35000000,
        current_balance: 4300000,
        supplier_type: 'Standard',
        products_supplied: ['Engine Oil SAE 20W-50', 'Engine Oil SAE 15W-40', 'Transmission Fluid', 'Hydraulic Oil'],
        rating: 4.3,
        status: 'active',
        last_order_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 19,
        total_value_ytd: 62000000,
        created_at: new Date(Date.now() - 890 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 12,
        name: 'Nipco Plc',
        email: 'procurement@nipco.ng',
        phone: '+234-808-222-3333',
        address: '23 Wharf Road, Apapa, Lagos',
        contact_person: 'Alhaji Abdullahi Sani',
        contact_phone: '+234-818-222-3333',
        payment_terms: 'NET 30',
        credit_limit: 25000000,
        current_balance: 2800000,
        supplier_type: 'Standard',
        products_supplied: ['PMS (Petrol)', 'AGO (Diesel)', 'DPK (Kerosene)', 'Base Oil'],
        rating: 4.2,
        status: 'active',
        last_order_date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
        total_orders_ytd: 15,
        total_value_ytd: 45000000,
        created_at: new Date(Date.now() - 1250 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  getMockSupplierTransactionsSummary() {
    return [
      {
        supplier_id: 1,
        supplier_name: 'NNPC Retail Ltd',
        total_transactions: 45,
        total_amount: 185000000,
        ytd_transactions: 23,
        ytd_amount: 95000000,
        pending_amount: 12500000,
        last_transaction_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        supplier_id: 2,
        supplier_name: 'ETERNA Plc',
        total_transactions: 38,
        total_amount: 142000000,
        ytd_transactions: 19,
        ytd_amount: 75000000,
        pending_amount: 8900000,
        last_transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        supplier_id: 3,
        supplier_name: 'ARDOVA Plc',
        total_transactions: 32,
        total_amount: 98000000,
        ytd_transactions: 16,
        ytd_amount: 52000000,
        pending_amount: 6200000,
        last_transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        supplier_id: 4,
        supplier_name: 'Total Energies Nigeria',
        total_transactions: 28,
        total_amount: 87000000,
        ytd_transactions: 14,
        ytd_amount: 45000000,
        pending_amount: 4300000,
        last_transaction_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        supplier_id: 5,
        supplier_name: 'Shell Nigeria Ltd',
        total_transactions: 25,
        total_amount: 76000000,
        ytd_transactions: 12,
        ytd_amount: 38000000,
        pending_amount: 3100000,
        last_transaction_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        supplier_id: 6,
        supplier_name: 'Mobil Oil Nigeria',
        total_transactions: 22,
        total_amount: 65000000,
        ytd_transactions: 11,
        ytd_amount: 32000000,
        pending_amount: 2800000,
        last_transaction_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  getMockSupplierTransactions(supplierId?: string | number) {
    // If supplierId is provided, filter transactions for that supplier
    const allTransactions = [
      // NNPC Retail Ltd Transactions
      {
        id: 1,
        supplier_id: 1,
        supplier_name: 'NNPC Retail Ltd',
        transaction_id: 'TXN-2024-001',
        transaction_type: 'Purchase Order',
        reference_number: 'PO-2024-001',
        description: 'Premium Motor Spirit (PMS) - 25,000L',
        amount: 14500000,
        status: 'completed',
        payment_status: 'paid',
        transaction_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        payment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
        products: [
          { name: 'Premium Motor Spirit (PMS)', quantity: 25000, unit: 'Litres', unit_price: 580, total: 14500000 }
        ]
      },
      {
        id: 2,
        supplier_id: 1,
        supplier_name: 'NNPC Retail Ltd',
        transaction_id: 'TXN-2024-002',
        transaction_type: 'Purchase Order',
        reference_number: 'PO-2024-002',
        description: 'AGO Bulk Purchase - 15,000L',
        amount: 11925000,
        status: 'completed',
        payment_status: 'pending',
        transaction_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        payment_date: null,
        due_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        products: [
          { name: 'Automotive Gas Oil (AGO)', quantity: 15000, unit: 'Litres', unit_price: 795, total: 11925000 }
        ]
      },
      {
        id: 3,
        supplier_id: 1,
        supplier_name: 'NNPC Retail Ltd',
        transaction_id: 'TXN-2024-003',
        transaction_type: 'Purchase Order',
        reference_number: 'PO-2024-003',
        description: 'DPK Supply - 8,000L',
        amount: 5680000,
        status: 'completed',
        payment_status: 'paid',
        transaction_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        payment_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        products: [
          { name: 'Dual Purpose Kerosene (DPK)', quantity: 8000, unit: 'Litres', unit_price: 710, total: 5680000 }
        ]
      },

      // ETERNA Plc Transactions
      {
        id: 4,
        supplier_id: 2,
        supplier_name: 'ETERNA Plc',
        transaction_id: 'TXN-2024-004',
        transaction_type: 'Purchase Order',
        reference_number: 'PO-2024-004',
        description: 'Castrol Engine Oil - Mixed Grades',
        amount: 3200000,
        status: 'completed',
        payment_status: 'pending',
        transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        payment_date: null,
        due_date: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
        products: [
          { name: 'Castrol GTX Engine Oil SAE 20W-50', quantity: 1000, unit: 'Litres', unit_price: 3200, total: 3200000 }
        ]
      },
      {
        id: 5,
        supplier_id: 2,
        supplier_name: 'ETERNA Plc',
        transaction_id: 'TXN-2024-005',
        transaction_type: 'Purchase Order',
        reference_number: 'PO-2024-005',
        description: 'Eterna PMS Supply - 12,000L',
        amount: 7020000,
        status: 'completed',
        payment_status: 'paid',
        transaction_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        payment_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        products: [
          { name: 'Eterna Premium Motor Spirit (PMS)', quantity: 12000, unit: 'Litres', unit_price: 585, total: 7020000 }
        ]
      },

      // ARDOVA Plc Transactions
      {
        id: 6,
        supplier_id: 3,
        supplier_name: 'ARDOVA Plc',
        transaction_id: 'TXN-2024-006',
        transaction_type: 'Purchase Order',
        reference_number: 'PO-2024-006',
        description: 'Shell Helix Engine Oil',
        amount: 3040000,
        status: 'completed',
        payment_status: 'paid',
        transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        payment_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        products: [
          { name: 'Shell Helix Engine Oil SAE 10W-30', quantity: 800, unit: 'Litres', unit_price: 3800, total: 3040000 }
        ]
      },
      {
        id: 7,
        supplier_id: 3,
        supplier_name: 'ARDOVA Plc',
        transaction_id: 'TXN-2024-007',
        transaction_type: 'Purchase Order',
        reference_number: 'PO-2024-007',
        description: 'Ardova AGO Supply - 10,000L',
        amount: 8000000,
        status: 'pending',
        payment_status: 'pending',
        transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        payment_date: null,
        due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        products: [
          { name: 'Ardova Premium AGO', quantity: 10000, unit: 'Litres', unit_price: 800, total: 8000000 }
        ]
      }
    ]

    if (supplierId) {
      const parsedId = typeof supplierId === 'string' ? parseInt(supplierId) : supplierId
      return allTransactions.filter(t => t.supplier_id === parsedId)
    }

    return allTransactions
  }

  getMockSupplierProductsData() {
    return [
      // NNPC Retail Ltd Products
      {
        id: 1,
        supplier_id: 1,
        supplier_name: 'NNPC Retail Ltd',
        product_name: 'Premium Motor Spirit (PMS)',
        product_code: 'PMS-001',
        category: 'Fuel',
        unit_type: 'Litres',
        supplier_price: 580,
        current_market_price: 617,
        minimum_order_quantity: 10000,
        lead_time_days: 7,
        availability_status: 'available',
        quality_grade: 'Premium',
        specifications: 'Octane Rating: 91, Sulphur Content: < 150ppm',
        last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        supplier_id: 1,
        supplier_name: 'NNPC Retail Ltd',
        product_name: 'Automotive Gas Oil (AGO)',
        product_code: 'AGO-001',
        category: 'Fuel',
        unit_type: 'Litres',
        supplier_price: 795,
        current_market_price: 850,
        minimum_order_quantity: 8000,
        lead_time_days: 5,
        availability_status: 'available',
        quality_grade: 'Standard',
        specifications: 'Cetane Number: 51, Sulphur Content: < 10ppm',
        last_updated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        supplier_id: 1,
        supplier_name: 'NNPC Retail Ltd',
        product_name: 'Dual Purpose Kerosene (DPK)',
        product_code: 'DPK-001',
        category: 'Fuel',
        unit_type: 'Litres',
        supplier_price: 710,
        current_market_price: 750,
        minimum_order_quantity: 5000,
        lead_time_days: 3,
        availability_status: 'limited',
        quality_grade: 'Standard',
        specifications: 'Flash Point: > 38°C, Smoke Point: > 25mm',
        last_updated: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 12,
        supplier_id: 1,
        supplier_name: 'NNPC Retail Ltd',
        product_name: 'Liquefied Petroleum Gas (LPG)',
        product_code: 'LPG-001',
        category: 'Fuel',
        unit_type: 'Kg',
        supplier_price: 1100,
        current_market_price: 1200,
        minimum_order_quantity: 1000,
        lead_time_days: 2,
        availability_status: 'available',
        quality_grade: 'Standard',
        specifications: 'Propane/Butane Mix, 95% Purity',
        last_updated: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      },

      // ETERNA Plc Products (Castrol and Eterna brands)
      {
        id: 4,
        supplier_id: 2,
        supplier_name: 'ETERNA Plc',
        product_name: 'Castrol GTX Engine Oil SAE 20W-50',
        product_code: 'CASTROL-20W50',
        category: 'Lubricants',
        unit_type: 'Litres',
        supplier_price: 3200,
        current_market_price: 4500,
        minimum_order_quantity: 100,
        lead_time_days: 14,
        availability_status: 'available',
        quality_grade: 'Premium',
        specifications: 'API SN/CF, Viscosity Index: 120',
        last_updated: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        supplier_id: 2,
        supplier_name: 'ETERNA Plc',
        product_name: 'Castrol Brake Fluid DOT-3',
        product_code: 'CASTROL-BF-DOT3',
        category: 'Lubricants',
        unit_type: 'Litres',
        supplier_price: 1600,
        current_market_price: 2200,
        minimum_order_quantity: 50,
        lead_time_days: 10,
        availability_status: 'available',
        quality_grade: 'Standard',
        specifications: 'DOT 3 Specification, Dry Boiling Point: > 205°C',
        last_updated: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 10,
        supplier_id: 2,
        supplier_name: 'ETERNA Plc',
        product_name: 'Eterna Premium Motor Spirit (PMS)',
        product_code: 'ETERNA-PMS',
        category: 'Fuel',
        unit_type: 'Litres',
        supplier_price: 585,
        current_market_price: 620,
        minimum_order_quantity: 15000,
        lead_time_days: 5,
        availability_status: 'available',
        quality_grade: 'Premium',
        specifications: 'Octane Rating: 92, Sulphur Content: < 100ppm',
        last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },

      // ARDOVA Plc Products (Shell and Ardova brands)
      {
        id: 6,
        supplier_id: 3,
        supplier_name: 'ARDOVA Plc',
        product_name: 'Shell Helix Engine Oil SAE 10W-30',
        product_code: 'SHELL-10W30',
        category: 'Lubricants',
        unit_type: 'Litres',
        supplier_price: 3800,
        current_market_price: 5200,
        minimum_order_quantity: 80,
        lead_time_days: 21,
        availability_status: 'available',
        quality_grade: 'Premium',
        specifications: 'API SP, ACEA A3/B4, Viscosity Index: 155',
        last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 7,
        supplier_id: 3,
        supplier_name: 'ARDOVA Plc',
        product_name: 'Shell V-Power Fuel System Cleaner',
        product_code: 'SHELL-FSC',
        category: 'Additives',
        unit_type: 'Litres',
        supplier_price: 900,
        current_market_price: 1500,
        minimum_order_quantity: 25,
        lead_time_days: 7,
        availability_status: 'available',
        quality_grade: 'Premium',
        specifications: 'Detergent/Dispersant Package, Corrosion Inhibitor',
        last_updated: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 11,
        supplier_id: 3,
        supplier_name: 'ARDOVA Plc',
        product_name: 'Ardova Premium AGO',
        product_code: 'ARDOVA-AGO',
        category: 'Fuel',
        unit_type: 'Litres',
        supplier_price: 800,
        current_market_price: 855,
        minimum_order_quantity: 12000,
        lead_time_days: 7,
        availability_status: 'available',
        quality_grade: 'Standard',
        specifications: 'Cetane Number: 52, Sulphur Content: < 10ppm',
        last_updated: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
      },

      // Mobil Oil Nigeria Products
      {
        id: 8,
        supplier_id: 4,
        supplier_name: 'Mobil Oil Nigeria',
        product_name: 'Gear Oil SAE 80W-90',
        product_code: 'GO-80W90',
        category: 'Lubricants',
        unit_type: 'Litres',
        supplier_price: 2900,
        current_market_price: 3800,
        minimum_order_quantity: 60,
        lead_time_days: 18,
        availability_status: 'available',
        quality_grade: 'Standard',
        specifications: 'API GL-4, Extreme Pressure Additives',
        last_updated: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 9,
        supplier_id: 4,
        supplier_name: 'Mobil Oil Nigeria',
        product_name: 'Radiator Coolant',
        product_code: 'RC-001',
        category: 'Additives',
        unit_type: 'Litres',
        supplier_price: 1200,
        current_market_price: 1800,
        minimum_order_quantity: 40,
        lead_time_days: 12,
        availability_status: 'available',
        quality_grade: 'Standard',
        specifications: 'Ethylene Glycol Base, Anti-Corrosion Inhibitors',
        last_updated: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString()
      },

      // Gas Plus Ltd Products
      {
        id: 10,
        supplier_id: 5,
        supplier_name: 'Gas Plus Ltd',
        product_name: 'Liquefied Petroleum Gas (LPG)',
        product_code: 'LPG-001',
        category: 'Fuel',
        unit_type: 'Kg',
        supplier_price: 1100,
        current_market_price: 1200,
        minimum_order_quantity: 500,
        lead_time_days: 3,
        availability_status: 'available',
        quality_grade: 'Standard',
        specifications: 'Propane/Butane Mix 60/40, Purity > 95%',
        last_updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },

      // Valvoline Nigeria Products
      {
        id: 11,
        supplier_id: 6,
        supplier_name: 'Valvoline Nigeria',
        product_name: 'Engine Oil Additive',
        product_code: 'EOA-001',
        category: 'Additives',
        unit_type: 'Litres',
        supplier_price: 1800,
        current_market_price: 2800,
        minimum_order_quantity: 20,
        lead_time_days: 15,
        availability_status: 'available',
        quality_grade: 'Premium',
        specifications: 'Zinc Dialkyl Dithiophosphate (ZDDP), Friction Modifiers',
        last_updated: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  getMockCustomerTypesData() {
    return [
      {
        id: 1,
        name: 'Lube Bays',
        description: 'Automotive service centers and lube bay operators',
        pricing_scheme_id: 2,
        pricing_scheme_name: 'Direct Sales Price',
        discount_percentage: 15,
        min_order_quantity: 100,
        payment_terms: 'NET 30',
        commission_rate: 8.5,
        customer_count: 25,
        status: 'active',
        created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'Filling Stations',
        description: 'Petrol stations and fuel retail outlets',
        pricing_scheme_id: 3,
        pricing_scheme_name: 'Retail Price',
        discount_percentage: 25,
        min_order_quantity: 5000,
        payment_terms: 'NET 15',
        commission_rate: 5.5,
        customer_count: 45,
        status: 'active',
        created_at: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: 'Suppliers',
        description: 'Petroleum product suppliers and vendors',
        pricing_scheme_id: 1,
        pricing_scheme_name: 'Cost Price',
        discount_percentage: 0,
        min_order_quantity: 10000,
        payment_terms: 'NET 45',
        commission_rate: 0,
        customer_count: 12,
        status: 'active',
        created_at: new Date(Date.now() - 1095 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        name: 'Direct Sales Customers',
        description: 'Individual and corporate direct purchase customers',
        pricing_scheme_id: 2,
        pricing_scheme_name: 'Direct Sales Price',
        discount_percentage: 15,
        min_order_quantity: 50,
        payment_terms: 'NET 30',
        commission_rate: 12.0,
        customer_count: 78,
        status: 'active',
        created_at: new Date(Date.now() - 545 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        name: 'Fleet Operators',
        description: 'Commercial fleet and transportation companies',
        pricing_scheme_id: 2,
        pricing_scheme_name: 'Direct Sales Price',
        discount_percentage: 18,
        min_order_quantity: 2000,
        payment_terms: 'NET 30',
        commission_rate: 6.5,
        customer_count: 32,
        status: 'active',
        created_at: new Date(Date.now() - 455 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 6,
        name: 'Government Agencies',
        description: 'Federal, state, and local government organizations',
        pricing_scheme_id: 2,
        pricing_scheme_name: 'Direct Sales Price',
        discount_percentage: 8,
        min_order_quantity: 1000,
        payment_terms: 'NET 60',
        commission_rate: 4.0,
        customer_count: 18,
        status: 'active',
        created_at: new Date(Date.now() - 820 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 7,
        name: 'Industrial Clients',
        description: 'Manufacturing and industrial companies',
        pricing_scheme_id: 2,
        pricing_scheme_name: 'Direct Sales Price',
        discount_percentage: 20,
        min_order_quantity: 8000,
        payment_terms: 'NET 30',
        commission_rate: 7.0,
        customer_count: 15,
        status: 'active',
        created_at: new Date(Date.now() - 275 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 8,
        name: 'Export Customers',
        description: 'International and export clients',
        pricing_scheme_id: 2,
        pricing_scheme_name: 'Direct Sales Price',
        discount_percentage: 10,
        min_order_quantity: 20000,
        payment_terms: 'NET 30',
        commission_rate: 3.5,
        customer_count: 8,
        status: 'inactive',
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  getMockPaymentTypesData() {
    return [
      { id: 1, name: 'Cash', description: 'Cash payment' },
      { id: 2, name: 'Bank Transfer', description: 'Bank transfer payment' },
      { id: 3, name: 'Credit Card', description: 'Credit card payment' },
      { id: 4, name: 'Debit Card', description: 'Debit card payment' },
      { id: 5, name: 'Mobile Money', description: 'Mobile money payment' },
      { id: 6, name: 'Cheque', description: 'Cheque payment' },
      { id: 7, name: 'Credit Terms', description: 'Payment on credit terms' }
    ]
  }

  getMockStatesData() {
    return [
      { id: 1, name: 'Lagos', code: 'LAG', country: 'Nigeria' },
      { id: 2, name: 'Abuja (FCT)', code: 'FCT', country: 'Nigeria' },
      { id: 3, name: 'Kano', code: 'KAN', country: 'Nigeria' },
      { id: 4, name: 'Rivers', code: 'RIV', country: 'Nigeria' },
      { id: 5, name: 'Kaduna', code: 'KAD', country: 'Nigeria' },
      { id: 6, name: 'Oyo', code: 'OYO', country: 'Nigeria' },
      { id: 7, name: 'Edo', code: 'EDO', country: 'Nigeria' },
      { id: 8, name: 'Delta', code: 'DEL', country: 'Nigeria' },
      { id: 9, name: 'Kwara', code: 'KWA', country: 'Nigeria' },
      { id: 10, name: 'Enugu', code: 'ENU', country: 'Nigeria' }
    ]
  }


  getMockCustomerTransactionsData() {
    return [
      {
        id: '1',
        transaction_id: 'TXN-2024-001',
        customer_id: 'CUST-001',
        customer_name: 'AutoCare Services Ltd',
        customer_type: 'Lube Bays',
        date: '2024-12-20T14:30:00Z',
        type: 'payment',
        description: 'Payment for lubricant supplies - Invoice INV-2024-145',
        amount: 2850000,
        balance_before: -3500000,
        balance_after: -650000,
        payment_method: 'Bank Transfer',
        status: 'completed',
        reference: 'PAY-AUTOCARE-001',
        sales_rep: 'Adebayo Johnson',
        location: 'Lagos Island',
        invoice_number: 'INV-2024-145',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        transaction_id: 'TXN-2024-002',
        customer_id: 'CUST-015',
        customer_name: 'Total Filling Station - Ikeja',
        customer_type: 'Filling Stations',
        date: '2024-12-20T10:15:00Z',
        type: 'payment',
        description: 'Payment for fuel supply - Invoice INV-2024-142',
        amount: 15750000,
        balance_before: -18200000,
        balance_after: -2450000,
        payment_method: 'Bank Transfer',
        status: 'completed',
        reference: 'PAY-TOTAL-002',
        sales_rep: 'Fatima Usman',
        location: 'Ikeja',
        invoice_number: 'INV-2024-142',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        transaction_id: 'TXN-2024-003',
        customer_id: 'CUST-045',
        customer_name: 'Quick Lube Express',
        customer_type: 'Lube Bays',
        date: '2024-12-19T16:45:00Z',
        type: 'payment',
        description: 'Partial payment for engine oil supplies',
        amount: 1200000,
        balance_before: -2100000,
        balance_after: -900000,
        payment_method: 'Cash',
        status: 'completed',
        reference: 'PAY-QUICK-003',
        sales_rep: 'Emeka Okafor',
        location: 'Victoria Island',
        invoice_number: 'INV-2024-138',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        transaction_id: 'TXN-2024-004',
        customer_id: 'CUST-067',
        customer_name: 'ABC Transport Ltd',
        customer_type: 'Fleet Operators',
        date: '2024-12-19T09:20:00Z',
        type: 'payment',
        description: 'Fleet maintenance products payment',
        amount: 4500000,
        balance_before: -5200000,
        balance_after: -700000,
        payment_method: 'Bank Transfer',
        status: 'completed',
        reference: 'PAY-ABC-004',
        sales_rep: 'Ibrahim Musa',
        location: 'Kano',
        invoice_number: 'INV-2024-135',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        transaction_id: 'TXN-2024-005',
        customer_id: 'CUST-023',
        customer_name: 'Oil Change Plus',
        customer_type: 'Lube Bays',
        date: '2024-12-18T13:10:00Z',
        type: 'payment',
        description: 'Full payment for lubricant order',
        amount: 890000,
        balance_before: -890000,
        balance_after: 0,
        payment_method: 'Cheque',
        status: 'completed',
        reference: 'PAY-OILPLUS-005',
        sales_rep: 'Kemi Adebola',
        location: 'Abuja',
        invoice_number: 'INV-2024-131',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '6',
        transaction_id: 'TXN-2024-006',
        customer_id: 'CUST-089',
        customer_name: 'Mobil Filling Station - Surulere',
        customer_type: 'Filling Stations',
        date: '2024-12-18T11:30:00Z',
        type: 'payment',
        description: 'Payment for premium fuel products',
        amount: 22100000,
        balance_before: -25000000,
        balance_after: -2900000,
        payment_method: 'Bank Transfer',
        status: 'completed',
        reference: 'PAY-MOBIL-006',
        sales_rep: 'Adebayo Johnson',
        location: 'Surulere',
        invoice_number: 'INV-2024-128',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '7',
        transaction_id: 'TXN-2024-007',
        customer_id: 'CUST-012',
        customer_name: 'Lagos State Transport Corp',
        customer_type: 'Government Agencies',
        date: '2024-12-17T15:45:00Z',
        type: 'payment',
        description: 'Government voucher payment - Fleet supplies',
        amount: 8750000,
        balance_before: -12000000,
        balance_after: -3250000,
        payment_method: 'Government Voucher',
        status: 'completed',
        reference: 'PAY-LSTC-007',
        sales_rep: 'Fatima Usman',
        location: 'Lagos Island',
        invoice_number: 'INV-2024-125',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '8',
        transaction_id: 'TXN-2024-008',
        customer_id: 'CUST-156',
        customer_name: 'Pro Lube Services',
        customer_type: 'Lube Bays',
        date: '2024-12-17T08:20:00Z',
        type: 'payment',
        description: 'Payment for hydraulic oils and additives',
        amount: 1650000,
        balance_before: -2800000,
        balance_after: -1150000,
        payment_method: 'Bank Transfer',
        status: 'completed',
        reference: 'PAY-PROLUBE-008',
        sales_rep: 'Emeka Okafor',
        location: 'Port Harcourt',
        invoice_number: 'INV-2024-122',
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '9',
        transaction_id: 'TXN-2024-009',
        customer_id: 'CUST-078',
        customer_name: 'Max Drive Fleet Services',
        customer_type: 'Fleet Operators',
        date: '2024-12-16T12:15:00Z',
        type: 'payment',
        description: 'Monthly fleet maintenance payment',
        amount: 6200000,
        balance_before: -8500000,
        balance_after: -2300000,
        payment_method: 'Bank Transfer',
        status: 'completed',
        reference: 'PAY-MAXDRIVE-009',
        sales_rep: 'Ibrahim Musa',
        location: 'Kaduna',
        invoice_number: 'INV-2024-119',
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '10',
        transaction_id: 'TXN-2024-010',
        customer_id: 'CUST-034',
        customer_name: 'Shell Filling Station - Ikoyi',
        customer_type: 'Filling Stations',
        date: '2024-12-16T14:50:00Z',
        type: 'payment',
        description: 'Payment for premium gasoline supply',
        amount: 18900000,
        balance_before: -20500000,
        balance_after: -1600000,
        payment_method: 'Bank Transfer',
        status: 'completed',
        reference: 'PAY-SHELL-010',
        sales_rep: 'Kemi Adebola',
        location: 'Ikoyi',
        invoice_number: 'INV-2024-116',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '11',
        transaction_id: 'TXN-2024-011',
        customer_id: 'CUST-145',
        customer_name: 'Express Lube & Care',
        customer_type: 'Lube Bays',
        date: '2024-12-15T10:30:00Z',
        type: 'payment',
        description: 'Payment for transmission fluids and filters',
        amount: 950000,
        balance_before: -1400000,
        balance_after: -450000,
        payment_method: 'Cash',
        status: 'completed',
        reference: 'PAY-EXPRESS-011',
        sales_rep: 'Adebayo Johnson',
        location: 'Ibadan',
        invoice_number: 'INV-2024-113',
        created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '12',
        transaction_id: 'TXN-2024-012',
        customer_id: 'CUST-198',
        customer_name: 'Industrial Solutions Ltd',
        customer_type: 'Industrial Clients',
        date: '2024-12-15T09:15:00Z',
        type: 'payment',
        description: 'Payment for industrial lubricant supplies',
        amount: 12500000,
        balance_before: -15800000,
        balance_after: -3300000,
        payment_method: 'Bank Transfer',
        status: 'completed',
        reference: 'PAY-INDUSTRIAL-012',
        sales_rep: 'Fatima Usman',
        location: 'Onitsha',
        invoice_number: 'INV-2024-110',
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  // Generic mock methods
  async get<T = any>(url: string, params?: any): Promise<T> {
    await delay(800)

    // Route to appropriate mock based on URL
    if (url.includes('dashboard-stats')) {
      return this.getDashboardStats() as T
    }
    if (url.includes('sales-analytics')) {
      return this.getSalesAnalytics() as T
    }
    if (url.includes('transactions/recent')) {
      return this.getRecentTransactions() as T
    }
    if (url.includes('approvals/pending')) {
      return this.getPendingApprovals() as T
    }
    if (url.includes('orders/prf')) {
      return this.getMockPRFData() as T
    }
    if (url.includes('orders/pro')) {
      return this.getMockPROData() as T
    }
    if (url.includes('customers/transactions')) {
      return this.getMockCustomerTransactionsData() as T
    }
    if (url.includes('customers')) {
      return this.getMockCustomersData() as T
    }
    if (url.includes('customer-types')) {
      return this.getMockCustomerTypesData() as T
    }
    if (url.includes('payment-types')) {
      return this.getMockPaymentTypesData() as T
    }
    if (url.includes('states')) {
      return this.getMockStatesData() as T
    }
    if (url.includes('suppliers/transactions/summary')) {
      console.log('🔍 Mock API: Fetching supplier transactions summary')
      const data = this.getMockSupplierTransactionsSummary()
      console.log('📦 Supplier Transactions Summary:', data.length, 'suppliers found')
      return data as T
    }
    if (url.includes('suppliers/transactions/')) {
      // Extract supplier ID from URL like /suppliers/transactions/1
      const match = url.match(/suppliers\/transactions\/(\d+)/)
      const supplierId = match ? match[1] : null
      console.log('🔍 Mock API: Fetching supplier transactions', supplierId ? `for supplier ${supplierId}` : '')
      const data = this.getMockSupplierTransactions(supplierId)
      console.log('📦 Supplier Transactions:', data.length, 'transactions found')
      return data as T
    }
    if (url.includes('suppliers/products')) {
      console.log('🔍 Mock API: Fetching supplier products data')
      const data = this.getMockSupplierProductsData()
      console.log('📦 Supplier Products Data:', data.length, 'products found')
      return data as T
    }
    if (url.includes('products')) {
      // Check for updated products in localStorage first
      try {
        const storedProducts = localStorage.getItem('mock_products_data')
        if (storedProducts) {
          return JSON.parse(storedProducts) as T
        }
      } catch {
        // Fall back to default data if localStorage fails
      }
      return this.getMockProductsData() as T
    }
    if (url.includes('pricing-schemes')) {
      return this.getMockPricingSchemesData() as T
    }
    if (url.includes('services')) {
      // Check for updated services in localStorage first
      try {
        const storedServices = localStorage.getItem('mock_services_data')
        if (storedServices) {
          return JSON.parse(storedServices) as T
        }
      } catch {
        // Fall back to default data if localStorage fails
      }
      return this.getMockServicesData() as T
    }
    if (url.includes('warehouses/')) {
      // Handle product bin card: /warehouses/1/products/123/bin-card
      const binCardMatch = url.match(/warehouses\/(\d+)\/products\/(\d+)\/bin-card/)
      if (binCardMatch) {
        const warehouseId = parseInt(binCardMatch[1], 10)
        const productId = parseInt(binCardMatch[2], 10)
        return this.getMockProductBinCardData(productId, warehouseId) as T
      }

      // Handle specific warehouse inventory: /warehouses/1, /warehouses/2, etc.
      const warehouseIdMatch = url.match(/warehouses\/(\d+)/)
      if (warehouseIdMatch) {
        const warehouseId = parseInt(warehouseIdMatch[1], 10)
        return this.getMockWarehouseInventoryData(warehouseId) as T
      }
    }
    if (url.includes('warehouses')) {
      // Handle warehouse list: /warehouses
      return this.getMockWarehousesData() as T
    }
    if (url.includes('inventory/warehouse')) {
      // Handle legacy warehouse inventory endpoint
      return this.getMockWarehouseInventoryData() as T
    }
    if (url.includes('inventory/substore')) {
      // Handle specific substore inventory: /substores/1/products/2/bin-card
      const substoreBinCardMatch = url.match(/substores\/(\d+)\/products\/(\d+)\/bin-card/)
      if (substoreBinCardMatch) {
        const substoreId = parseInt(substoreBinCardMatch[1], 10)
        const productId = parseInt(substoreBinCardMatch[2], 10)
        return this.getMockSubstoreBinCardData(productId, substoreId) as T
      }

      // Handle specific substore inventory: /substores/1
      const substoreIdMatch = url.match(/substores\/(\d+)/)
      if (substoreIdMatch) {
        const substoreId = parseInt(substoreIdMatch[1], 10)
        return this.getMockSubstoreInventoryData(substoreId) as T
      }

      return this.getMockSubstoreInventoryData() as T
    }
    if (url.includes('inventory/transactions')) {
      return this.getMockStockTransactionsData() as T
    }
    if (url.includes('inventory/transfers')) {
      // Check if requesting specific transfer (e.g., /inventory/transfers/1)
      const transferIdMatch = url.match(/\/inventory\/transfers\/(\d+)$/)

      if (transferIdMatch) {
        // Get specific transfer by ID
        const transferId = parseInt(transferIdMatch[1])
        let transfers = []

        try {
          const storedTransfers = localStorage.getItem('mock_transfers_data')
          if (storedTransfers) {
            transfers = JSON.parse(storedTransfers)
          } else {
            transfers = this.getMockStockTransfersData()
          }
        } catch {
          transfers = this.getMockStockTransfersData()
        }

        const transfer = transfers.find((t: any) => t.id === transferId)
        if (transfer) {
          return transfer as T
        } else {
          throw new Error('Transfer not found')
        }
      } else {
        // Get all transfers
        try {
          const storedTransfers = localStorage.getItem('mock_transfers_data')
          if (storedTransfers) {
            return JSON.parse(storedTransfers) as T
          }
        } catch {
          // Fall back to mock data if localStorage fails
        }
        return this.getMockStockTransfersData() as T
      }
    }
    if (url.includes('/locations')) {
      return this.getMockLocationsData() as T
    }
    if (url.includes('/inventory/products')) {
      // Extract location from query parameters
      const urlObj = new URL(url, 'http://localhost')
      const location = urlObj.searchParams.get('location')

      if (location) {
        return this.getMockProductsByLocation(location) as T
      }

      // Return all products if no location specified
      return this.getMockProductsByLocation('Main Warehouse') as T
    }
    if (url.includes('channels/substores/transactions')) {
      return this.getMockSubstoreTransactionsData() as T
    }
    if (url.includes('channels/substores')) {
      // Check if requesting specific substore (e.g., /channels/substores/1)
      const substoreIdMatch = url.match(/\/channels\/substores\/(\d+)$/)

      if (substoreIdMatch) {
        // Get specific substore by ID
        const substoreId = parseInt(substoreIdMatch[1])
        const substores = this.getMockSubstoresData()
        const substore = substores.find((s: any) => s.id === substoreId)

        if (substore) {
          return substore as T
        } else {
          throw new Error('Substore not found')
        }
      } else {
        // Get all substores
        return this.getMockSubstoresData() as T
      }
    }
    if (url.includes('channels/lubebays/services')) {
      return this.getMockLubebayServicesData() as T
    }
    if (url.includes('channels/lubebays')) {
      return this.getMockLubebaysData() as T
    }
    if (url.includes('suppliers')) {
      return this.getMockSuppliersData() as T
    }

    // Comprehensive Reporting System
    if (url.includes('reports/sales')) {
      return this.getMockSalesReportsData() as T
    }
    if (url.includes('reports/inventory')) {
      return this.getMockInventoryReportsData() as T
    }
    if (url.includes('reports/financial')) {
      return this.getMockFinancialReportsData() as T
    }
    if (url.includes('reports/operational')) {
      return this.getMockOperationalReportsData() as T
    }
    if (url.includes('reports/customer')) {
      return this.getMockCustomerReportsData() as T
    }
    if (url.includes('reports/user-activity')) {
      return this.getMockUserActivityReportsData() as T
    }
    if (url.includes('reports/generate')) {
      const urlObj = new URL(url, 'http://localhost')
      const reportType = urlObj.searchParams.get('type')
      const params = Object.fromEntries(urlObj.searchParams.entries())
      return this.generateReport(reportType || 'sales', params) as T
    }

    // Default empty response
    return {} as T
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    await delay(1000)

    // Handle service creation
    if (url.includes('/services')) {
      // Get current services from localStorage or use mock data
      let services = []
      try {
        const storedServices = localStorage.getItem('mock_services_data')
        if (storedServices) {
          services = JSON.parse(storedServices)
        } else {
          services = getMockServicesData()
        }
      } catch {
        services = getMockServicesData()
      }

      // Create new service with auto-generated ID and timestamps
      const newService = {
        ...data,
        id: Math.max(...services.map((s: any) => s.id), 0) + 1,
        popularity_score: 75, // Default popularity score
        bookings_this_month: 0, // Default bookings
        created_at: new Date().toISOString()
      }

      // Add to services array
      services.push(newService)

      // Save back to localStorage
      localStorage.setItem('mock_services_data', JSON.stringify(services))

      return newService as T
    }

    // Handle product creation
    if (url.includes('/products')) {
      // Get current products from localStorage or use mock data
      let products = []
      try {
        const storedProducts = localStorage.getItem('mock_products_data')
        if (storedProducts) {
          products = JSON.parse(storedProducts)
        } else {
          products = getMockProductsData()
        }
      } catch {
        products = getMockProductsData()
      }

      // Create new product with auto-generated ID
      const newProduct = {
        ...data,
        id: Math.max(...products.map((p: any) => p.id), 0) + 1,
      }

      // Add to products array
      products.push(newProduct)

      // Save back to localStorage
      localStorage.setItem('mock_products_data', JSON.stringify(products))

      return newProduct as T
    }

    // Handle stock transfer creation
    if (url.includes('/inventory/transfers') && !url.includes('approve') && !url.includes('reject')) {
      // Get current transfers from localStorage or use mock data
      let transfers = []
      try {
        const storedTransfers = localStorage.getItem('mock_transfers_data')
        if (storedTransfers) {
          transfers = JSON.parse(storedTransfers)
        } else {
          transfers = this.getMockStockTransfersData()
        }
      } catch {
        transfers = this.getMockStockTransfersData()
      }

      // Generate transfer number
      const transferNumber = `TRF-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(3, '0')}`

      // Create new transfer with auto-generated ID
      const newTransfer = {
        id: Math.max(...transfers.map((t: any) => t.id), 0) + 1,
        transfer_number: transferNumber,
        source_location: data.source_location,
        destination_location: data.destination_location,
        // For simplicity, we'll use the first item for the main product info
        product_name: data.items[0]?.product_name || 'Multiple Items',
        product_code: data.items[0]?.product_code || 'MULTI',
        quantity: data.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        unit_type: data.items[0]?.unit_type || 'Units',
        status: 'pending',
        requested_by: 'Current User', // In real app, this would be from auth
        approved_by: null,
        created_date: new Date().toISOString(),
        transfer_date: null,
        received_date: null,
        notes: data.notes || ''
      }

      // Add to transfers array
      transfers.push(newTransfer)

      // Save back to localStorage
      localStorage.setItem('mock_transfers_data', JSON.stringify(transfers))

      return newTransfer as T
    }

    // Handle transfer approval
    if (url.includes('approve')) {
      const transferId = parseInt(url.split('/')[3]) // Extract ID from URL
      let transfers = []
      try {
        const storedTransfers = localStorage.getItem('mock_transfers_data')
        if (storedTransfers) {
          transfers = JSON.parse(storedTransfers)
        } else {
          transfers = this.getMockStockTransfersData()
        }
      } catch {
        transfers = this.getMockStockTransfersData()
      }

      // Update transfer status
      const updatedTransfers = transfers.map((transfer: any) => {
        if (transfer.id === transferId) {
          return {
            ...transfer,
            status: 'approved',
            approved_by: 'Current User',
            transfer_date: new Date().toISOString()
          }
        }
        return transfer
      })

      // Save back to localStorage
      localStorage.setItem('mock_transfers_data', JSON.stringify(updatedTransfers))

      return { success: true } as T
    }

    // Handle transfer rejection
    if (url.includes('reject')) {
      const transferId = parseInt(url.split('/')[3]) // Extract ID from URL
      let transfers = []
      try {
        const storedTransfers = localStorage.getItem('mock_transfers_data')
        if (storedTransfers) {
          transfers = JSON.parse(storedTransfers)
        } else {
          transfers = this.getMockStockTransfersData()
        }
      } catch {
        transfers = this.getMockStockTransfersData()
      }

      // Update transfer status
      const updatedTransfers = transfers.map((transfer: any) => {
        if (transfer.id === transferId) {
          return {
            ...transfer,
            status: 'rejected',
            approved_by: 'Current User'
          }
        }
        return transfer
      })

      // Save back to localStorage
      localStorage.setItem('mock_transfers_data', JSON.stringify(updatedTransfers))

      return { success: true } as T
    }

    return {} as T
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    await delay(1000)
    return {} as T
  }

  async patch<T = any>(url: string, data?: any): Promise<T> {
    await delay(500)

    // Handle product price updates
    if (url.match(/^\/products\/\d+\/$/)) {
      const productId = parseInt(url.match(/\/products\/(\d+)\//)?.[1] || '0')

      // Get current products from localStorage or use mock data
      let products = []
      try {
        const storedProducts = localStorage.getItem('mock_products_data')
        if (storedProducts) {
          products = JSON.parse(storedProducts)
        } else {
          products = getMockProductsData()
        }
      } catch {
        products = getMockProductsData()
      }

      // Find and update the product
      const productIndex = products.findIndex((p: any) => p.id === productId)
      if (productIndex !== -1) {
        products[productIndex] = { ...products[productIndex], ...data }

        // Save back to localStorage
        localStorage.setItem('mock_products_data', JSON.stringify(products))

        return products[productIndex] as T
      }
    }

    // Handle service updates
    if (url.match(/^\/services\/\d+\/$/)) {
      const serviceId = parseInt(url.match(/\/services\/(\d+)\//)?.[1] || '0')

      // Get current services from localStorage or use mock data
      let services = []
      try {
        const storedServices = localStorage.getItem('mock_services_data')
        if (storedServices) {
          services = JSON.parse(storedServices)
        } else {
          services = getMockServicesData()
        }
      } catch {
        services = getMockServicesData()
      }

      // Find and update the service
      const serviceIndex = services.findIndex((s: any) => s.id === serviceId)
      if (serviceIndex !== -1) {
        services[serviceIndex] = { ...services[serviceIndex], ...data }

        // Save back to localStorage
        localStorage.setItem('mock_services_data', JSON.stringify(services))

        return services[serviceIndex] as T
      }
    }

    return {} as T
  }

  async delete<T = any>(url: string): Promise<T> {
    await delay(800)

    // Handle service deletion
    if (url.match(/^\/services\/\d+\/$/)) {
      const serviceId = parseInt(url.match(/\/services\/(\d+)\//)?.[1] || '0')

      // Get current services from localStorage or use mock data
      let services = []
      try {
        const storedServices = localStorage.getItem('mock_services_data')
        if (storedServices) {
          services = JSON.parse(storedServices)
        } else {
          services = getMockServicesData()
        }
      } catch {
        services = getMockServicesData()
      }

      // Find and remove the service
      const serviceIndex = services.findIndex((s: any) => s.id === serviceId)
      if (serviceIndex !== -1) {
        const deletedService = services[serviceIndex]
        services.splice(serviceIndex, 1)

        // Save back to localStorage
        localStorage.setItem('mock_services_data', JSON.stringify(services))

        return { success: true, deletedService } as T
      }
    }

    // Handle product deletion
    if (url.match(/^\/products\/\d+\/$/)) {
      const productId = parseInt(url.match(/\/products\/(\d+)\//)?.[1] || '0')

      // Get current products from localStorage or use mock data
      let products = []
      try {
        const storedProducts = localStorage.getItem('mock_products_data')
        if (storedProducts) {
          products = JSON.parse(storedProducts)
        } else {
          products = getMockProductsData()
        }
      } catch {
        products = getMockProductsData()
      }

      // Find and remove the product
      const productIndex = products.findIndex((p: any) => p.id === productId)
      if (productIndex !== -1) {
        const deletedProduct = products[productIndex]
        products.splice(productIndex, 1)

        // Save back to localStorage
        localStorage.setItem('mock_products_data', JSON.stringify(products))

        return { success: true, deletedProduct } as T
      }
    }

    return {} as T
  }

  // Comprehensive Reporting System for MOFAD Business Operations
  getMockSalesReportsData() {
    return {
      daily_sales: [
        { date: '2024-01-01', total_sales: 850000, lubebay_sales: 320000, direct_sales: 530000, transactions: 45 },
        { date: '2024-01-02', total_sales: 920000, lubebay_sales: 380000, direct_sales: 540000, transactions: 52 },
        { date: '2024-01-03', total_sales: 750000, lubebay_sales: 290000, direct_sales: 460000, transactions: 38 },
        { date: '2024-01-04', total_sales: 1200000, lubebay_sales: 450000, direct_sales: 750000, transactions: 67 },
        { date: '2024-01-05', total_sales: 980000, lubebay_sales: 400000, direct_sales: 580000, transactions: 58 },
      ],
      monthly_summary: {
        total_sales: 24500000,
        lubebay_sales: 9800000,
        direct_sales: 14700000,
        total_transactions: 1247,
        average_transaction_value: 19646,
        top_selling_product: 'Engine Oil SAE 20W-50',
        growth_percentage: 12.5
      },
      sales_by_rep: [
        { rep_name: 'Ahmed Musa', total_sales: 5200000, transactions: 156, commission: 416000 },
        { rep_name: 'Fatima Bello', total_sales: 4800000, transactions: 143, commission: 384000 },
        { rep_name: 'John Adebayo', total_sales: 6200000, transactions: 189, commission: 496000 },
        { rep_name: 'Maria Santos', total_sales: 4300000, transactions: 124, commission: 344000 },
      ]
    }
  }

  getMockInventoryReportsData() {
    return {
      stock_levels: [
        { product_name: 'Engine Oil SAE 20W-50', current_stock: 450, reorder_level: 100, status: 'healthy', days_supply: 30 },
        { product_name: 'Oil Filter - Standard', current_stock: 85, reorder_level: 120, status: 'low', days_supply: 8 },
        { product_name: 'Air Filter - Heavy Duty', current_stock: 200, reorder_level: 150, status: 'healthy', days_supply: 22 },
        { product_name: 'Brake Fluid DOT-3', current_stock: 45, reorder_level: 80, status: 'critical', days_supply: 5 },
      ],
      warehouse_utilization: [
        { warehouse: 'Lagos Main', capacity: 150000, current: 85600, utilization: 57.1, status: 'optimal' },
        { warehouse: 'Abuja Regional', capacity: 80000, current: 62400, utilization: 78.0, status: 'high' },
        { warehouse: 'Kano Branch', capacity: 50000, current: 28900, utilization: 57.8, status: 'optimal' },
      ],
      stock_movements: [
        { date: '2024-01-05', type: 'inbound', quantity: 500, product: 'Engine Oil SAE 15W-40', warehouse: 'Lagos Main' },
        { date: '2024-01-05', type: 'outbound', quantity: 120, product: 'Oil Filter - Standard', warehouse: 'Lagos Main' },
        { date: '2024-01-04', type: 'transfer', quantity: 200, product: 'Air Filter - Heavy Duty', from: 'Lagos Main', to: 'Abuja Regional' },
      ]
    }
  }

  getMockFinancialReportsData() {
    return {
      revenue_summary: {
        total_revenue: 24500000,
        cost_of_goods: 18200000,
        gross_profit: 6300000,
        gross_margin: 25.7,
        operating_expenses: 3200000,
        net_profit: 3100000,
        net_margin: 12.7
      },
      lodgements: [
        { date: '2024-01-05', amount: 850000, type: 'lubebay_sales', status: 'approved', approved_by: 'Finance Manager' },
        { date: '2024-01-05', amount: 1200000, type: 'direct_sales', status: 'pending', lodged_by: 'Sales Rep Ahmed' },
        { date: '2024-01-04', amount: 680000, type: 'car_wash', status: 'approved', approved_by: 'Finance Manager' },
      ],
      accounts_receivable: [
        { customer: 'ABC Motors Limited', amount_due: 1250000, days_overdue: 0, status: 'current' },
        { customer: 'Dangote Industries Plc', amount_due: 2800000, days_overdue: 15, status: 'overdue' },
        { customer: 'XYZ Transport Services', amount_due: 450000, days_overdue: 45, status: 'critical' },
      ],
      payment_trends: [
        { month: '2023-11', collections: 18200000, outstanding: 4500000, collection_rate: 80.2 },
        { month: '2023-12', collections: 22100000, outstanding: 3200000, collection_rate: 87.4 },
        { month: '2024-01', collections: 19800000, outstanding: 5100000, collection_rate: 79.5 },
      ]
    }
  }

  getMockOperationalReportsData() {
    return {
      prf_summary: {
        total_prfs: 45,
        pending_review: 8,
        pending_approval: 5,
        approved: 25,
        rejected: 7,
        average_approval_time: 2.3
      },
      pro_summary: {
        total_pros: 32,
        pending_review: 6,
        pending_approval: 3,
        confirmed: 18,
        cancelled: 5,
        average_processing_time: 1.8
      },
      lubebay_performance: [
        { lubebay: 'Surulere Lubebay', services: 245, revenue: 1850000, rating: 4.6, utilization: 78 },
        { lubebay: 'Ikeja Lubebay', services: 189, revenue: 1420000, rating: 4.4, utilization: 65 },
        { lubebay: 'Abuja Central', services: 156, revenue: 1180000, rating: 4.7, utilization: 58 },
      ],
      supplier_performance: [
        { supplier: 'Eterna Plc', orders: 12, on_time_delivery: 91.7, quality_rating: 4.5, total_value: 8500000 },
        { supplier: 'Shell Nigeria', orders: 8, on_time_delivery: 87.5, quality_rating: 4.6, total_value: 5200000 },
        { supplier: 'Total Energies', orders: 15, on_time_delivery: 93.3, quality_rating: 4.4, total_value: 9800000 },
      ]
    }
  }

  getMockCustomerReportsData() {
    return {
      top_customers: [
        { customer: 'Dangote Industries Plc', total_purchases: 18500000, transactions: 45, avg_transaction: 411111 },
        { customer: 'ABC Motors Limited', total_purchases: 12500000, transactions: 67, avg_transaction: 186567 },
        { customer: 'XYZ Transport Services', total_purchases: 8900000, transactions: 123, avg_transaction: 72358 },
        { customer: 'NNPC Retail Station', total_purchases: 6700000, transactions: 34, avg_transaction: 197059 },
      ],
      customer_segments: {
        corporate: { count: 45, revenue: 35200000, percentage: 68.2 },
        retail: { count: 156, revenue: 12800000, percentage: 24.8 },
        government: { count: 8, revenue: 3600000, percentage: 7.0 }
      },
      customer_retention: {
        new_customers: 23,
        returning_customers: 186,
        retention_rate: 89.0,
        churn_rate: 11.0
      },
      geographic_distribution: [
        { state: 'Lagos', customers: 89, revenue: 28500000, percentage: 55.2 },
        { state: 'Abuja/FCT', customers: 45, revenue: 12300000, percentage: 23.8 },
        { state: 'Kano', customers: 34, revenue: 7800000, percentage: 15.1 },
        { state: 'Rivers', customers: 21, revenue: 3100000, percentage: 6.0 },
      ]
    }
  }

  getMockUserActivityReportsData() {
    return {
      login_activity: [
        { user: 'John Adebayo (Management)', last_login: '2024-01-05 14:30', sessions_today: 3, total_actions: 45 },
        { user: 'Ahmed Musa (Sales Rep)', last_login: '2024-01-05 16:22', sessions_today: 2, total_actions: 28 },
        { user: 'Fatima Bello (Store Keeper)', last_login: '2024-01-05 09:15', sessions_today: 4, total_actions: 67 },
        { user: 'Finance Manager', last_login: '2024-01-05 11:45', sessions_today: 2, total_actions: 23 },
      ],
      permission_usage: [
        { permission: 'record_sales', usage_count: 245, users: ['Sales Rep', 'Lube Bay Manager'] },
        { permission: 'approve_prf', usage_count: 67, users: ['Management', 'Finance Manager'] },
        { permission: 'stock_transfer', usage_count: 34, users: ['Store Keeper', 'Management'] },
      ],
      audit_trail: [
        { timestamp: '2024-01-05 16:30', user: 'Sales Rep Ahmed', action: 'Created PRF-2024-045', resource: 'PRF' },
        { timestamp: '2024-01-05 15:45', user: 'Finance Manager', action: 'Approved lodgement LDG-2024-123', resource: 'Lodgement' },
        { timestamp: '2024-01-05 14:20', user: 'Store Keeper Fatima', action: 'Transferred 200 units Engine Oil', resource: 'Inventory' },
      ]
    }
  }

  // Report Generation Endpoints
  async generateReport(reportType: string, params?: any): Promise<any> {
    await delay(2000) // Simulate report generation time

    switch (reportType) {
      case 'sales':
        return this.getMockSalesReportsData()
      case 'inventory':
        return this.getMockInventoryReportsData()
      case 'financial':
        return this.getMockFinancialReportsData()
      case 'operational':
        return this.getMockOperationalReportsData()
      case 'customer':
        return this.getMockCustomerReportsData()
      case 'user_activity':
        return this.getMockUserActivityReportsData()
      default:
        throw new Error(`Report type '${reportType}' not supported`)
    }
  }
}

const mockApi = new MockApiClient()
export default mockApi