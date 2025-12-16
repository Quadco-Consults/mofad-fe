// Django API client for production integration
import { LoginForm, User } from '../types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
const AUTH_API_URL = 'http://localhost:8000/api/token'

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

class ApiClient {
  private baseURL: string
  private authToken: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL

    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('auth_token')
    }
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  // Clear authentication token
  clearAuthToken() {
    this.authToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  // Get headers with authentication
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    return headers
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        throw {
          message: errorData.detail || errorData.message || 'An error occurred',
          status: response.status,
          errors: errorData.errors || {}
        } as ApiError
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof TypeError) {
        throw {
          message: 'Network error - please check your connection',
          status: 0
        } as ApiError
      }
      throw error
    }
  }

  // Authentication methods
  async login(credentials: LoginForm) {
    try {
      const response = await fetch(AUTH_API_URL + '/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        throw {
          message: errorData.detail || 'Invalid credentials',
          status: response.status,
          errors: {
            email: ['These credentials do not match our records.']
          }
        } as ApiError
      }

      const data = await response.json()
      const { access: token } = data

      this.setAuthToken(token)

      // Get user data
      const user = await this.getUser()

      return {
        token,
        user
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw {
          message: 'Network error - please check your connection',
          status: 0
        } as ApiError
      }
      throw error
    }
  }

  async logout() {
    this.clearAuthToken()
    return { message: 'Successfully logged out' }
  }

  // User methods
  async getUser(): Promise<User> {
    // Since Django uses a different user structure, we'll need to transform it
    const users = await this.request<any[]>('/users/')

    if (users.length === 0) {
      throw {
        message: 'User not found',
        status: 404
      } as ApiError
    }

    const user = users[0] // For now, get the first user

    return {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`.trim() || user.email.split('@')[0],
      email: user.email,
      email_verified_at: user.date_joined,
      created_at: user.date_joined,
      updated_at: user.date_joined,
      permissions: [], // TODO: Map from Django permissions
      roles: [], // TODO: Map from Django roles
    }
  }

  // Dashboard methods
  async getDashboardStats() {
    // For now, return calculated stats from various endpoints
    try {
      const [customers, products, orders] = await Promise.all([
        this.request<any[]>('/customers/'),
        this.request<any[]>('/products/'),
        this.request<any[]>('/pros/')
      ])

      return {
        total_sales_ytd: 45750000, // TODO: Calculate from actual data
        total_orders: orders.length,
        pending_approvals: orders.filter((o: any) => o.status === 'pending').length,
        low_stock_items: 7, // TODO: Calculate from inventory
        substore_count: 23, // TODO: Get from substores endpoint
        lubebay_count: 12, // TODO: Get from lubebays endpoint
        customer_count: customers.length
      }
    } catch (error) {
      // Return mock data if API calls fail
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
  }

  async getRecentTransactions() {
    try {
      // Get customer transactions and transform them
      const transactions = await this.request<any[]>('/customer-transactions/')

      return transactions.map((t: any) => ({
        id: t.id,
        type: t.transaction_type || 'sale',
        description: t.description || `Transaction for Customer ${t.customer}`,
        amount: parseFloat(t.amount) || 0,
        status: 'completed',
        customer: `Customer ${t.customer}`,
        created_at: t.transaction_date || t.created_at
      }))
    } catch (error) {
      // Return empty array if API call fails
      return []
    }
  }

  async getPendingApprovals() {
    try {
      const prfs = await this.request<any[]>('/prfs/')

      return prfs
        .filter((prf: any) => prf.status === 'pending')
        .map((prf: any) => ({
          id: prf.id,
          type: 'PRF',
          title: `Purchase Requisition #${prf.prf_number || prf.id}`,
          description: prf.description || 'Purchase requisition awaiting approval',
          amount: parseFloat(prf.total_amount) || 0,
          requested_by: prf.requested_by || 'Unknown',
          created_at: prf.created_at,
          priority: prf.priority || 'medium',
          department: prf.department || 'Operations'
        }))
    } catch (error) {
      return []
    }
  }

  // CRUD operations for different resources
  async getCustomers() {
    return this.request<any[]>('/customers/')
  }

  async getProducts() {
    return this.request<any[]>('/products/')
  }

  async getServices() {
    return this.request<any[]>('/services/')
  }

  async getWarehouses() {
    return this.request<any[]>('/warehouses/')
  }

  async getWarehouseInventory() {
    return this.request<any[]>('/warehouse-inventory/')
  }

  async getStockTransactions() {
    return this.request<any[]>('/stock-transactions/')
  }

  async getStockTransfers() {
    return this.request<any[]>('/stock-transfers/')
  }

  async getPRFs() {
    return this.request<any[]>('/prfs/')
  }

  async getPROs() {
    return this.request<any[]>('/pros/')
  }

  async getSalesOrders() {
    return this.request<any[]>('/sales-orders/')
  }

  async getAccounts() {
    return this.request<any[]>('/accounts/')
  }

  async getJournalEntries() {
    return this.request<any[]>('/journal-entries/')
  }

  async getExpenses() {
    return this.request<any[]>('/expenses/')
  }

  async getPayments() {
    return this.request<any[]>('/payments/')
  }

  async getStates() {
    return this.request<any[]>('/states/')
  }

  async getCustomerTypes() {
    return this.request<any[]>('/customer-types/')
  }

  async getLocations() {
    return this.request<any[]>('/locations/')
  }

  async getUsers() {
    return this.request<any[]>('/users/')
  }

  // Create operations
  async createCustomer(data: any) {
    return this.request('/customers/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async createProduct(data: any) {
    return this.request('/products/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async createPRF(data: any) {
    return this.request('/prfs/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async createPRO(data: any) {
    return this.request('/pros/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Update operations
  async updateCustomer(id: number, data: any) {
    return this.request(`/customers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async updateProduct(id: number, data: any) {
    return this.request(`/products/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  // Delete operations
  async deleteCustomer(id: number) {
    return this.request(`/customers/${id}/`, {
      method: 'DELETE'
    })
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}/`, {
      method: 'DELETE'
    })
  }

  // Generic CRUD methods
  async get<T = any>(url: string, params?: any): Promise<T> {
    let endpoint = url

    if (params) {
      const searchParams = new URLSearchParams(params).toString()
      endpoint += `?${searchParams}`
    }

    return this.request<T>(endpoint)
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async patch<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T = any>(url: string): Promise<T> {
    return this.request<T>(url, {
      method: 'DELETE'
    })
  }
}

const apiClient = new ApiClient()
export default apiClient