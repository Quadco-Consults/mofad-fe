// Mock API client for standalone frontend testing
import { LoginForm, User } from '../types'

// Mock user data
const MOCK_USER: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@mofadenergysolutions.com',
  email_verified_at: '2023-01-01T00:00:00.000Z',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  permissions: [
    { id: 1, name: 'dashboard_access', guard_name: 'web' },
    { id: 2, name: 'view_customers', guard_name: 'web' },
    { id: 3, name: 'manage_orders', guard_name: 'web' },
  ],
  roles: [
    {
      id: 1,
      name: 'Administrator',
      guard_name: 'web',
      permissions: [
        { id: 1, name: 'dashboard_access', guard_name: 'web' },
        { id: 2, name: 'view_customers', guard_name: 'web' },
        { id: 3, name: 'manage_orders', guard_name: 'web' },
      ],
    },
  ],
}

// Mock credentials for testing
const MOCK_CREDENTIALS = [
  { email: 'admin@mofadenergysolutions.com', password: 'admin123' },
  { email: 'john@mofadenergysolutions.com', password: 'password' },
  { email: 'manager@mofadenergysolutions.com', password: 'manager123' },
  { email: 'user@mofadenergysolutions.com', password: 'user123' },
]

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
    await delay(1500) // Simulate network delay

    const { email, password } = credentials

    // Check if credentials match any mock user
    const isValidCredentials = MOCK_CREDENTIALS.some(
      cred => cred.email === email && cred.password === password
    )

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

    return {
      user: {
        ...MOCK_USER,
        email, // Use the email from login
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

  // Mock pending approvals
  async getPendingApprovals() {
    await delay(900)

    const approvals = [
      {
        id: 1,
        type: 'PRF',
        title: 'Purchase Requisition #PRF-2024-001',
        description: 'Request for 50,000L PMS from NNPC Depot',
        amount: 4500000,
        requested_by: 'Store Manager Lagos',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        department: 'Operations'
      },
      {
        id: 2,
        type: 'PRO',
        title: 'Purchase Order #PRO-2024-012',
        description: 'Order for Lubricants and Additives',
        amount: 1200000,
        requested_by: 'Procurement Officer',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        department: 'Procurement'
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
        department: 'Logistics'
      }
    ]

    return approvals
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
      { product_name: 'PMS (Petrol)', quantity_sold: 15420, revenue: 12500000, profit: 2100000 },
      { product_name: 'AGO (Diesel)', quantity_sold: 9800, revenue: 8900000, profit: 1560000 },
      { product_name: 'DPK (Kerosene)', quantity_sold: 4200, revenue: 3200000, profit: 480000 },
      { product_name: 'Lubricants', quantity_sold: 850, revenue: 1200000, profit: 340000 },
      { product_name: 'Gas (LPG)', quantity_sold: 320, revenue: 450000, profit: 89000 }
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
      { id: 1, prf_number: 'PRF-2024-001', title: 'PMS Supply Request', description: 'Request for 50,000L Premium Motor Spirit', total_amount: 4500000, status: 'pending', priority: 'high', requested_by: 'Store Manager Lagos', department: 'Operations', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), required_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), items_count: 1 },
      { id: 2, prf_number: 'PRF-2024-002', title: 'AGO Bulk Purchase', description: 'Automotive Gas Oil for Substore Distribution', total_amount: 8900000, status: 'approved', priority: 'medium', requested_by: 'Procurement Officer', department: 'Procurement', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), required_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), items_count: 2 },
      { id: 3, prf_number: 'PRF-2024-003', title: 'Lubricants & Additives', description: 'Mixed lubricants for service centers', total_amount: 1200000, status: 'processing', priority: 'low', requested_by: 'Service Manager', department: 'Service', created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), required_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), items_count: 15 }
    ]
  }

  getMockPROData() {
    return [
      { id: 1, pro_number: 'PRO-2024-001', title: 'PMS Supply Contract', supplier: 'NNPC Retail Ltd', total_amount: 4500000, status: 'confirmed', delivery_status: 'pending', created_by: 'John Doe', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), expected_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), items_count: 1, payment_terms: 'NET 30' },
      { id: 2, pro_number: 'PRO-2024-002', title: 'AGO Bulk Order', supplier: 'Depot Direct Ltd', total_amount: 8900000, status: 'sent', delivery_status: 'pending', created_by: 'Jane Smith', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), items_count: 2, payment_terms: 'NET 15' }
    ]
  }

  getMockCustomersData() {
    return [
      { id: 1, name: 'ABC Motors Ltd', email: 'contact@abcmotors.com', phone: '+234-801-234-5678', customer_type: 'Corporate', address: '123 Victoria Island', city: 'Lagos', state: 'Lagos', credit_limit: 5000000, outstanding_balance: 450000, total_purchases: 12500000, last_transaction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'active', rating: 5, created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, name: 'XYZ Transport Services', email: 'info@xyztransport.ng', phone: '+234-803-567-8901', customer_type: 'Corporate', address: '45 Ikeja Industrial', city: 'Ikeja', state: 'Lagos', credit_limit: 3000000, outstanding_balance: 0, total_purchases: 8900000, last_transaction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active', rating: 4, created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, name: 'Individual Customer', email: 'john.customer@gmail.com', phone: '+234-805-123-4567', customer_type: 'Individual', address: '78 Allen Avenue', city: 'Ikeja', state: 'Lagos', credit_limit: 500000, outstanding_balance: 25000, total_purchases: 340000, last_transaction: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), status: 'active', rating: 3, created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  }

  getMockProductsData() {
    return [
      { id: 1, name: 'Premium Motor Spirit (PMS)', product_code: 'PMS-001', category: 'Fuel', unit_type: 'Litres', current_price: 617, cost_price: 580, stock_level: 45000, reorder_level: 10000, supplier: 'NNPC Retail Ltd', status: 'active', profit_margin: 6.4, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, name: 'Automotive Gas Oil (AGO)', product_code: 'AGO-001', category: 'Fuel', unit_type: 'Litres', current_price: 850, cost_price: 795, stock_level: 32000, reorder_level: 8000, supplier: 'NNPC Retail Ltd', status: 'active', profit_margin: 6.9, created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, name: 'Dual Purpose Kerosene (DPK)', product_code: 'DPK-001', category: 'Fuel', unit_type: 'Litres', current_price: 750, cost_price: 710, stock_level: 15000, reorder_level: 5000, supplier: 'NNPC Retail Ltd', status: 'active', profit_margin: 5.6, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 4, name: 'Liquefied Petroleum Gas (LPG)', product_code: 'LPG-001', category: 'Fuel', unit_type: 'Kg', current_price: 1200, cost_price: 1100, stock_level: 2500, reorder_level: 500, supplier: 'Gas Plus Ltd', status: 'active', profit_margin: 9.1, created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 5, name: 'Engine Oil SAE 20W-50', product_code: 'EO-20W50', category: 'Lubricants', unit_type: 'Litres', current_price: 4500, cost_price: 3200, stock_level: 450, reorder_level: 100, supplier: 'Total Energies Nigeria', status: 'active', profit_margin: 40.6, created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 6, name: 'Engine Oil SAE 10W-30', product_code: 'EO-10W30', category: 'Lubricants', unit_type: 'Litres', current_price: 5200, cost_price: 3800, stock_level: 320, reorder_level: 80, supplier: 'Shell Nigeria', status: 'active', profit_margin: 36.8, created_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 7, name: 'Gear Oil SAE 80W-90', product_code: 'GO-80W90', category: 'Lubricants', unit_type: 'Litres', current_price: 3800, cost_price: 2900, stock_level: 180, reorder_level: 50, supplier: 'Mobil Oil Nigeria', status: 'active', profit_margin: 31.0, created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 8, name: 'Brake Fluid DOT-3', product_code: 'BF-DOT3', category: 'Lubricants', unit_type: 'Litres', current_price: 2200, cost_price: 1600, stock_level: 85, reorder_level: 25, supplier: 'Valvoline Nigeria', status: 'active', profit_margin: 37.5, created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 9, name: 'Fuel System Cleaner', product_code: 'FSC-001', category: 'Additives', unit_type: 'Litres', current_price: 1500, cost_price: 900, stock_level: 120, reorder_level: 30, supplier: 'STP Products Ltd', status: 'active', profit_margin: 66.7, created_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 10, name: 'Engine Oil Additive', product_code: 'EOA-001', category: 'Additives', unit_type: 'Litres', current_price: 2800, cost_price: 1800, stock_level: 95, reorder_level: 20, supplier: 'Lucas Oil Nigeria', status: 'active', profit_margin: 55.6, created_at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 11, name: 'Radiator Coolant', product_code: 'RC-001', category: 'Additives', unit_type: 'Litres', current_price: 1800, cost_price: 1200, stock_level: 200, reorder_level: 40, supplier: 'Prestone Nigeria', status: 'active', profit_margin: 50.0, created_at: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 12, name: 'Oil Change Service', product_code: 'SRV-OCS', category: 'Services', unit_type: 'Service', current_price: 8500, cost_price: 6000, stock_level: 0, reorder_level: 0, supplier: 'Internal Service', status: 'active', profit_margin: 41.7, created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 13, name: 'Car Wash Premium', product_code: 'SRV-CWP', category: 'Services', unit_type: 'Service', current_price: 3500, cost_price: 2000, stock_level: 0, reorder_level: 0, supplier: 'Internal Service', status: 'active', profit_margin: 75.0, created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 14, name: 'Tire Pressure Check', product_code: 'SRV-TPC', category: 'Services', unit_type: 'Service', current_price: 1000, cost_price: 300, stock_level: 0, reorder_level: 0, supplier: 'Internal Service', status: 'active', profit_margin: 233.3, created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 15, name: 'Battery Testing', product_code: 'SRV-BT', category: 'Services', unit_type: 'Service', current_price: 1500, cost_price: 500, stock_level: 0, reorder_level: 0, supplier: 'Internal Service', status: 'inactive', profit_margin: 200.0, created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  }

  getMockPricingSchemesData() {
    return [
      { id: 1, scheme_name: 'Standard Retail', description: 'Default pricing for walk-in customers', markup_percentage: 15, min_margin: 8, max_margin: 25, applies_to: 'All Products', status: 'active', created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), products_count: 156 },
      { id: 2, scheme_name: 'Corporate Discount', description: 'Volume discount for corporate clients', markup_percentage: 8, min_margin: 5, max_margin: 15, applies_to: 'Fuel Products', status: 'active', created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), products_count: 45 },
      { id: 3, scheme_name: 'Lubebay Wholesale', description: 'Wholesale rates for Lubebay locations', markup_percentage: 12, min_margin: 6, max_margin: 18, applies_to: 'Lubricants', status: 'active', created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), products_count: 28 },
      { id: 4, scheme_name: 'Government Contract', description: 'Special pricing for government contracts', markup_percentage: 6, min_margin: 3, max_margin: 10, applies_to: 'Fuel Products', status: 'active', created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), products_count: 12 },
      { id: 5, scheme_name: 'Loyalty Customer', description: 'Preferred pricing for loyalty program members', markup_percentage: 10, min_margin: 7, max_margin: 20, applies_to: 'All Products', status: 'inactive', created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(), products_count: 89 }
    ]
  }

  getMockServicesData() {
    return [
      { id: 1, service_name: 'Premium Oil Change', description: 'Full synthetic oil change with filter replacement', duration_minutes: 45, base_price: 8500, materials_cost: 6000, labor_cost: 1500, category: 'Maintenance', status: 'active', popularity_score: 95, bookings_this_month: 156, created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, service_name: 'Express Car Wash', description: 'Quick exterior wash and dry service', duration_minutes: 20, base_price: 2500, materials_cost: 800, labor_cost: 1000, category: 'Cleaning', status: 'active', popularity_score: 88, bookings_this_month: 234, created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, service_name: 'Premium Car Wash', description: 'Interior and exterior detailing service', duration_minutes: 60, base_price: 4500, materials_cost: 1500, labor_cost: 2000, category: 'Cleaning', status: 'active', popularity_score: 92, bookings_this_month: 189, created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 4, service_name: 'Tire Pressure & Alignment', description: 'Tire pressure check and wheel alignment', duration_minutes: 30, base_price: 3000, materials_cost: 500, labor_cost: 1500, category: 'Maintenance', status: 'active', popularity_score: 75, bookings_this_month: 98, created_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 5, service_name: 'Battery Testing & Replacement', description: 'Battery health check and replacement service', duration_minutes: 25, base_price: 2500, materials_cost: 800, labor_cost: 1000, category: 'Electrical', status: 'active', popularity_score: 68, bookings_this_month: 67, created_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 6, service_name: 'Brake System Check', description: 'Comprehensive brake system inspection', duration_minutes: 40, base_price: 5000, materials_cost: 1200, labor_cost: 2500, category: 'Safety', status: 'active', popularity_score: 82, bookings_this_month: 78, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 7, service_name: 'Engine Diagnostics', description: 'Computer-based engine diagnostics scan', duration_minutes: 35, base_price: 4000, materials_cost: 500, labor_cost: 2000, category: 'Diagnostics', status: 'active', popularity_score: 71, bookings_this_month: 45, created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 8, service_name: 'AC System Service', description: 'Air conditioning system maintenance and refill', duration_minutes: 50, base_price: 6500, materials_cost: 2500, labor_cost: 2500, category: 'HVAC', status: 'inactive', popularity_score: 65, bookings_this_month: 23, created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  }

  getMockWarehouseInventoryData() {
    return [
      { id: 1, product_name: 'Premium Motor Spirit (PMS)', product_code: 'PMS-001', category: 'Fuel', current_stock: 45000, unit_type: 'Litres', cost_value: 26100000, retail_value: 27765000, reorder_level: 10000, max_level: 80000, location: 'Tank A1', last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 45 },
      { id: 2, product_name: 'Automotive Gas Oil (AGO)', product_code: 'AGO-001', category: 'Fuel', current_stock: 32000, unit_type: 'Litres', cost_value: 25440000, retail_value: 27200000, reorder_level: 8000, max_level: 60000, location: 'Tank B1', last_updated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 38 },
      { id: 3, product_name: 'Dual Purpose Kerosene (DPK)', product_code: 'DPK-001', category: 'Fuel', current_stock: 15000, unit_type: 'Litres', cost_value: 10650000, retail_value: 11250000, reorder_level: 5000, max_level: 40000, location: 'Tank C1', last_updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 30 },
      { id: 4, product_name: 'Engine Oil SAE 20W-50', product_code: 'EO-20W50', category: 'Lubricants', current_stock: 450, unit_type: 'Litres', cost_value: 1440000, retail_value: 2025000, reorder_level: 100, max_level: 1000, location: 'Rack L1', last_updated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', days_of_supply: 22 },
      { id: 5, product_name: 'Liquefied Petroleum Gas (LPG)', product_code: 'LPG-001', category: 'Fuel', current_stock: 800, unit_type: 'Kg', cost_value: 880000, retail_value: 960000, reorder_level: 500, max_level: 3000, location: 'Storage G1', last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), stock_status: 'low', days_of_supply: 8 },
      { id: 6, product_name: 'Brake Fluid DOT-3', product_code: 'BF-DOT3', category: 'Lubricants', current_stock: 25, unit_type: 'Litres', cost_value: 40000, retail_value: 55000, reorder_level: 25, max_level: 200, location: 'Rack L2', last_updated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), stock_status: 'critical', days_of_supply: 3 }
    ]
  }

  getMockSubstoreInventoryData() {
    return [
      { id: 1, substore_name: 'Lagos Island Substore', location: 'Lagos Island, Lagos', product_name: 'Premium Motor Spirit (PMS)', product_code: 'PMS-001', current_stock: 8500, unit_type: 'Litres', cost_value: 4930000, retail_value: 5244500, reorder_level: 2000, max_level: 15000, last_restocked: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'John Adebayo' },
      { id: 2, substore_name: 'Ikeja Substore', location: 'Ikeja, Lagos', product_name: 'Automotive Gas Oil (AGO)', product_code: 'AGO-001', current_stock: 6200, unit_type: 'Litres', cost_value: 4929000, retail_value: 5270000, reorder_level: 1500, max_level: 12000, last_restocked: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Maria Okafor' },
      { id: 3, substore_name: 'Abuja Central Substore', location: 'Central Business District, Abuja', product_name: 'Premium Motor Spirit (PMS)', product_code: 'PMS-001', current_stock: 1800, unit_type: 'Litres', cost_value: 1044000, retail_value: 1110600, reorder_level: 2000, max_level: 10000, last_restocked: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), stock_status: 'low', manager: 'Ibrahim Musa' },
      { id: 4, substore_name: 'Kano Substore', location: 'Kano City, Kano', product_name: 'Dual Purpose Kerosene (DPK)', product_code: 'DPK-001', current_stock: 450, unit_type: 'Litres', cost_value: 319500, retail_value: 337500, reorder_level: 500, max_level: 5000, last_restocked: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), stock_status: 'low', manager: 'Fatima Aliyu' },
      { id: 5, substore_name: 'Port Harcourt Substore', location: 'Port Harcourt, Rivers', product_name: 'Engine Oil SAE 20W-50', product_code: 'EO-20W50', current_stock: 75, unit_type: 'Litres', cost_value: 240000, retail_value: 337500, reorder_level: 50, max_level: 300, last_restocked: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(), stock_status: 'healthy', manager: 'Grace Eze' },
      { id: 6, substore_name: 'Ilorin Substore', location: 'Ilorin, Kwara', product_name: 'Automotive Gas Oil (AGO)', product_code: 'AGO-001', current_stock: 200, unit_type: 'Litres', cost_value: 159000, retail_value: 170000, reorder_level: 800, max_level: 8000, last_restocked: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(), stock_status: 'critical', manager: 'Ahmed Lawal' }
    ]
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
      { id: 1, name: 'Lagos Island Substore', code: 'SUB-LIS', location: 'Lagos Island, Lagos', state: 'Lagos', manager: 'John Adebayo', phone: '+234-801-234-5678', email: 'john.adebayo@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 15200000, commission_rate: 8.5, products_count: 12, last_transaction: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), rating: 4.8 },
      { id: 2, name: 'Ikeja Substore', code: 'SUB-IKJ', location: 'Ikeja GRA, Lagos', state: 'Lagos', manager: 'Maria Okafor', phone: '+234-803-567-8901', email: 'maria.okafor@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 545 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 12800000, commission_rate: 8.0, products_count: 15, last_transaction: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), rating: 4.6 },
      { id: 3, name: 'Abuja Central Substore', code: 'SUB-ABC', location: 'Central Business District, Abuja', state: 'FCT', manager: 'Ibrahim Musa', phone: '+234-805-123-4567', email: 'ibrahim.musa@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 9800000, commission_rate: 7.5, products_count: 10, last_transaction: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), rating: 4.4 },
      { id: 4, name: 'Kano Substore', code: 'SUB-KAN', location: 'Kano City, Kano', state: 'Kano', manager: 'Fatima Aliyu', phone: '+234-807-654-3210', email: 'fatima.aliyu@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 455 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 6700000, commission_rate: 7.0, products_count: 8, last_transaction: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), rating: 4.2 },
      { id: 5, name: 'Port Harcourt Substore', code: 'SUB-PHC', location: 'Port Harcourt, Rivers', state: 'Rivers', manager: 'Grace Eze', phone: '+234-809-876-5432', email: 'grace.eze@mofadenergysolutions.com', status: 'active', opening_date: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 8900000, commission_rate: 8.0, products_count: 11, last_transaction: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), rating: 4.7 },
      { id: 6, name: 'Ilorin Substore', code: 'SUB-ILR', location: 'Ilorin, Kwara', state: 'Kwara', manager: 'Ahmed Lawal', phone: '+234-811-111-2222', email: 'ahmed.lawal@mofadenergysolutions.com', status: 'inactive', opening_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), monthly_sales: 3200000, commission_rate: 6.5, products_count: 6, last_transaction: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), rating: 3.8 }
    ]
  }

  getMockSubstoreTransactionsData() {
    return [
      { id: 1, substore: 'Lagos Island Substore', transaction_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), product_name: 'Premium Motor Spirit (PMS)', quantity: 2500, unit_price: 617, total_amount: 1542500, transaction_type: 'sale', customer_type: 'retail', payment_method: 'cash', reference: 'SST-2024-001', status: 'completed', commission_earned: 131213, manager: 'John Adebayo' },
      { id: 2, substore: 'Ikeja Substore', transaction_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), product_name: 'Automotive Gas Oil (AGO)', quantity: 1800, unit_price: 850, total_amount: 1530000, transaction_type: 'sale', customer_type: 'wholesale', payment_method: 'bank_transfer', reference: 'SST-2024-002', status: 'completed', commission_earned: 122400, manager: 'Maria Okafor' },
      { id: 3, substore: 'Abuja Central Substore', transaction_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), product_name: 'Dual Purpose Kerosene (DPK)', quantity: 1200, unit_price: 750, total_amount: 900000, transaction_type: 'sale', customer_type: 'retail', payment_method: 'pos', reference: 'SST-2024-003', status: 'completed', commission_earned: 67500, manager: 'Ibrahim Musa' },
      { id: 4, substore: 'Port Harcourt Substore', transaction_date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), product_name: 'Engine Oil SAE 20W-50', quantity: 25, unit_price: 4500, total_amount: 112500, transaction_type: 'sale', customer_type: 'retail', payment_method: 'cash', reference: 'SST-2024-004', status: 'completed', commission_earned: 9000, manager: 'Grace Eze' },
      { id: 5, substore: 'Kano Substore', transaction_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), product_name: 'Premium Motor Spirit (PMS)', quantity: 800, unit_price: 617, total_amount: 493600, transaction_type: 'sale', customer_type: 'retail', payment_method: 'cash', reference: 'SST-2024-005', status: 'completed', commission_earned: 34552, manager: 'Fatima Aliyu' },
      { id: 6, substore: 'Lagos Island Substore', transaction_date: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), product_name: 'Automotive Gas Oil (AGO)', quantity: 500, unit_price: 850, total_amount: 425000, transaction_type: 'return', customer_type: 'wholesale', payment_method: 'bank_transfer', reference: 'SST-2024-006', status: 'pending', commission_earned: -34000, manager: 'John Adebayo' }
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
    if (url.includes('customers')) {
      return this.getMockCustomersData() as T
    }
    if (url.includes('products')) {
      return this.getMockProductsData() as T
    }
    if (url.includes('pricing-schemes')) {
      return this.getMockPricingSchemesData() as T
    }
    if (url.includes('services')) {
      return this.getMockServicesData() as T
    }
    if (url.includes('inventory/warehouse')) {
      return this.getMockWarehouseInventoryData() as T
    }
    if (url.includes('inventory/substore')) {
      return this.getMockSubstoreInventoryData() as T
    }
    if (url.includes('inventory/transactions')) {
      return this.getMockStockTransactionsData() as T
    }
    if (url.includes('inventory/transfers')) {
      return this.getMockStockTransfersData() as T
    }
    if (url.includes('channels/substores/transactions')) {
      return this.getMockSubstoreTransactionsData() as T
    }
    if (url.includes('channels/substores')) {
      return this.getMockSubstoresData() as T
    }
    if (url.includes('channels/lubebays/services')) {
      return this.getMockLubebayServicesData() as T
    }
    if (url.includes('channels/lubebays')) {
      return this.getMockLubebaysData() as T
    }

    // Default empty response
    return {} as T
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    await delay(1000)
    return {} as T
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    await delay(1000)
    return {} as T
  }

  async delete<T = any>(url: string): Promise<T> {
    await delay(800)
    return {} as T
  }
}

const mockApi = new MockApiClient()
export default mockApi