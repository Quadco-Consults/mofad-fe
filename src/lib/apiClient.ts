// Django API client for MOFAD backend integration
import { LoginForm, User } from '../types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

export interface LoginResponse {
  access_token: string | null
  refresh_token: string | null
  token_type: string
  force_password_reset: boolean
  is_mfa_required: boolean
}

export interface AuthenticatedUser {
  user: User
  tokens: {
    access_token: string
    refresh_token: string
  } | null
  is_mfa_required: boolean
  force_password_reset: boolean
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
      localStorage.removeItem('refresh_token')
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

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return {} as T
      }

      const jsonResponse = await response.json()

      // Backend wraps responses in { status, message, data } format
      // Return the data field if it exists, otherwise return the whole response
      const data = jsonResponse.data !== undefined ? jsonResponse.data : jsonResponse
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

  // Authentication methods - using MOFAD backend endpoints
  // Note: auth module uses trailing_slash=False, so no trailing slashes on those endpoints
  async login(credentials: LoginForm): Promise<AuthenticatedUser> {
    // Clear any existing tokens before login to prevent expired token errors
    this.clearAuthToken()

    try {
      // Use the custom MOFAD authentication endpoint
      const url = `http://localhost:8000/api/v1/auth/auth/login`
      const response = await fetch(url, {
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
          message: errorData.detail || errorData.message || 'Login failed',
          status: response.status,
          errors: errorData.errors || {}
        } as ApiError
      }

      const jsonResponse = await response.json()

      // Custom auth endpoint returns wrapped response with {status, data, etc}
      const loginResponse = jsonResponse.data || jsonResponse

      // Check if MFA is required
      if (loginResponse.is_mfa_required) {
        return {
          user: {
            id: 0,
            name: '',
            email: credentials.email,
            email_verified_at: undefined,
            created_at: '',
            updated_at: '',
            permissions: [],
            roles: []
          },
          tokens: null,
          is_mfa_required: true,
          force_password_reset: loginResponse.force_password_reset || false
        }
      }

      // Check if force password reset is required
      if (loginResponse.force_password_reset) {
        return {
          user: {
            id: 0,
            name: '',
            email: credentials.email,
            email_verified_at: undefined,
            created_at: '',
            updated_at: '',
            permissions: [],
            roles: []
          },
          tokens: null,
          is_mfa_required: false,
          force_password_reset: true
        }
      }

      // Login successful - has tokens
      if (loginResponse.access_token) {
        this.setAuthToken(loginResponse.access_token)

        if (typeof window !== 'undefined' && loginResponse.refresh_token) {
          localStorage.setItem('refresh_token', loginResponse.refresh_token)
        }

        // Get user data
        const user = await this.getUser()

        return {
          user,
          tokens: {
            access_token: loginResponse.access_token,
            refresh_token: loginResponse.refresh_token
          },
          is_mfa_required: false,
          force_password_reset: false
        }
      }

      // Fallback - login failed
      throw {
        message: 'Login failed - no tokens received',
        status: 401
      } as ApiError
    } catch (error) {
      if ((error as ApiError).status === 0) {
        throw error
      }
      throw {
        message: (error as ApiError).message || 'Invalid credentials',
        status: (error as ApiError).status || 401,
        errors: {
          email: ['Invalid email or password.']
        }
      } as ApiError
    }
  }

  async verifyMFA(email: string, totp: string): Promise<AuthenticatedUser> {
    const response = await this.request<{
      access_token: string
      refresh_token: string
      token_type: string
    }>('/auth/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ email, totp })
    })

    if (response.access_token) {
      this.setAuthToken(response.access_token)

      if (typeof window !== 'undefined' && response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token)
      }

      const user = await this.getUser()

      return {
        user,
        tokens: {
          access_token: response.access_token,
          refresh_token: response.refresh_token
        },
        is_mfa_required: false,
        force_password_reset: false
      }
    }

    throw {
      message: 'MFA verification failed',
      status: 401
    } as ApiError
  }

  async logout() {
    this.clearAuthToken()
    return { message: 'Successfully logged out' }
  }

  async refreshToken(): Promise<{ access_token: string; refresh_token?: string }> {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('refresh_token')
      : null

    if (!refreshToken) {
      throw {
        message: 'No refresh token available',
        status: 401
      } as ApiError
    }

    const response = await this.request<{
      access: string
      refresh?: string
    }>('/api/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken })
    })

    if (response.access) {
      this.setAuthToken(response.access)

      if (response.refresh && typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refresh)
      }
    }

    return response
  }

  // User methods
  // Note: Using main router endpoint with user ID from JWT token
  async getUser(): Promise<User> {
    // Extract user ID from JWT token
    const userId = this.getUserIdFromToken()
    if (!userId) {
      throw {
        message: 'No user ID found in token',
        status: 401
      } as ApiError
    }

    const response = await this.request<{
      id: number
      email: string
      first_name: string
      last_name: string
      phone: string | null
      is_active: boolean
      role?: string
    }>(`/auth/users/${userId}`)

    return {
      id: response.id,
      name: `${response.first_name} ${response.last_name}`.trim(),
      email: response.email,
      email_verified_at: undefined,
      created_at: '',
      updated_at: '',
      permissions: [],
      roles: response.role ? [{ id: 0, name: response.role, guard_name: 'web' }] : [],
    }
  }

  // Helper method to extract user ID from JWT token
  private getUserIdFromToken(): string | null {
    if (!this.authToken) return null

    try {
      // JWT tokens have 3 parts separated by dots
      const parts = this.authToken.split('.')
      if (parts.length !== 3) return null

      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]))
      return payload.user_id || null
    } catch (error) {
      return null
    }
  }

  // Dashboard methods
  async getDashboardStats() {
    try {
      const [customers, products] = await Promise.all([
        this.request<any[]>('/customers/').catch(() => []),
        this.request<any[]>('/products/').catch(() => [])
      ])

      return {
        total_sales_ytd: 45750000,
        total_orders: 0,
        pending_approvals: 0,
        low_stock_items: 7,
        substore_count: 23,
        lubebay_count: 12,
        customer_count: Array.isArray(customers) ? customers.length : 0
      }
    } catch (error) {
      return {
        total_sales_ytd: 45750000,
        total_orders: 0,
        pending_approvals: 0,
        low_stock_items: 7,
        substore_count: 23,
        lubebay_count: 12,
        customer_count: 0
      }
    }
  }

  async getRecentTransactions() {
    try {
      const transactions = await this.request<any[]>('/customer-transactions/')
      return Array.isArray(transactions) ? transactions.map((t: any) => ({
        id: t.id,
        type: t.transaction_type || 'sale',
        description: t.description || `Transaction for Customer ${t.customer}`,
        amount: parseFloat(t.amount) || 0,
        status: 'completed',
        customer: `Customer ${t.customer}`,
        created_at: t.transaction_date || t.created_at
      })) : []
    } catch (error) {
      return []
    }
  }

  async getPendingApprovals() {
    try {
      const prfs = await this.request<any[]>('/prfs/')
      return Array.isArray(prfs) ? prfs
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
        })) : []
    } catch (error) {
      return []
    }
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
