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

export interface BulkDeleteResponse {
  batch_id: string
  operation: string
  deletion_type: 'soft' | 'hard'
  total_requested: number
  deleted_count: number
  failed_count: number
  deleted_ids: (number | string)[]
  failed: { id: number | string; error: string }[]
}

// Phase 8: System Settings Types
export interface SystemSettings {
  id: number
  company_name: string
  company_address: string | null
  company_email: string | null
  company_phone: string | null
  company_website: string | null
  company_logo: string | null
  company_favicon: string | null
  tax_id: string | null
  default_timezone: string
  default_currency: string
  currency_symbol: string
  currency_position: 'before' | 'after'
  date_format: string
  time_format: '12h' | '24h'
  default_language: string
  session_timeout_minutes: number
  password_min_length: number
  password_require_uppercase: boolean
  password_require_lowercase: boolean
  password_require_numbers: boolean
  password_require_special: boolean
  password_expiry_days: number
  enforce_two_factor: boolean
  max_login_attempts: number
  lockout_duration_minutes: number
  email_notifications_enabled: boolean
  sms_notifications_enabled: boolean
  push_notifications_enabled: boolean
  smtp_host: string | null
  smtp_port: number
  smtp_username: string | null
  smtp_use_tls: boolean
  email_from_address: string | null
  email_from_name: string
  sms_provider: string | null
  sms_sender_id: string | null
  auto_backup_enabled: boolean
  backup_frequency: 'daily' | 'weekly' | 'monthly'
  backup_time: string
  backup_retention_days: number
  allow_negative_inventory: boolean
  default_low_stock_threshold: number
  auto_generate_order_numbers: boolean
  order_number_prefix: string
  prf_number_prefix: string
  pro_number_prefix: string
  invoice_prefix: string
  invoice_footer_text: string | null
  show_company_logo_on_invoice: boolean
  maintenance_mode: boolean
  maintenance_message: string | null
  enable_public_api: boolean
  created_at: string
  updated_at: string
}

export interface ApprovalConfiguration {
  id: number
  process_type: string
  process_type_display: string
  description: string | null
  required_levels: number
  required_level_count: number
  level_1_required: boolean
  level_1_role: string | null
  level_1_description: string | null
  level_2_required: boolean
  level_2_role: string | null
  level_2_description: string | null
  level_3_required: boolean
  level_3_role: string | null
  level_3_description: string | null
  level_4_required: boolean
  level_4_role: string | null
  level_4_description: string | null
  level_5_required: boolean
  level_5_role: string | null
  level_5_description: string | null
  enable_amount_threshold: boolean
  amount_threshold_l2: number
  amount_threshold_l3: number
  amount_threshold_l4: number
  amount_threshold_l5: number
  allow_auto_approval: boolean
  auto_approval_max_amount: number
  notify_on_submission: boolean
  notify_on_approval: boolean
  notify_on_rejection: boolean
  escalation_hours: number
  is_active: boolean
  created_at: string
  updated_at: string
  level_configs: Array<{
    required: boolean
    role: string | null
    description: string | null
  }>
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

  // Flag to prevent multiple simultaneous refresh attempts
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  // Try to refresh the token
  private async tryRefreshToken(): Promise<boolean> {
    // If already refreshing, wait for that to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        const refreshToken = typeof window !== 'undefined'
          ? localStorage.getItem('refresh_token')
          : null

        if (!refreshToken) {
          return false
        }

        const url = `http://localhost:8000/api/token/refresh/`
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken })
        })

        if (!response.ok) {
          return false
        }

        const data = await response.json()
        if (data.access) {
          this.setAuthToken(data.access)
          if (data.refresh && typeof window !== 'undefined') {
            localStorage.setItem('refresh_token', data.refresh)
          }
          return true
        }
        return false
      } catch {
        return false
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnUnauthorized = true
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

      // If unauthorized (401), try to refresh the token and retry
      if (response.status === 401 && retryOnUnauthorized && this.authToken) {
        const refreshed = await this.tryRefreshToken()
        if (refreshed) {
          // Retry the request with the new token
          return this.request<T>(endpoint, options, false)
        }
        // Token refresh failed - clear auth and throw
        this.clearAuthToken()
        throw {
          message: 'Session expired. Please log in again.',
          status: 401
        } as ApiError
      }

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
      const url = `${this.baseURL}/auth/login/`
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
    }>('/auth/mfa/verify/', {
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

  // Password reset methods
  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset/initiate/', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async resetPassword(email: string, totp: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        totp,
        new_password: newPassword
      })
    })
  }

  async resendOtp(email: string, verificationType: 'EMAIL_VERIFICATION' | 'MFA' | 'PASSWORD_RESET'): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/otp/resend/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        verification_type: verificationType
      })
    })
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    // Note: This endpoint may need to be implemented in the backend
    return this.request<{ message: string }>('/auth/password/change/', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword
      })
    })
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
  // Use the /me endpoint to get current authenticated user
  async getUser(): Promise<User> {
    const response = await this.request<{
      id: number
      email: string
      first_name: string
      last_name: string
      phone: string | null
      is_active: boolean
      role?: string
    }>('/auth/users/me/')

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
      return await this.request<{
        total_sales_ytd: number
        total_orders: number
        pending_approvals: number
        low_stock_items: number
        substore_count: number
        lubebay_count: number
        customer_count: number
        total_users: number
        active_users: number
        inactive_users: number
      }>('/dashboard/stats/')
    } catch (error) {
      // Fallback to default values if API fails
      return {
        total_sales_ytd: 0,
        total_orders: 0,
        pending_approvals: 0,
        low_stock_items: 0,
        substore_count: 0,
        lubebay_count: 0,
        customer_count: 0,
        total_users: 0,
        active_users: 0,
        inactive_users: 0
      }
    }
  }

  async getSalesAnalytics(period: string = 'ytd') {
    try {
      return await this.request<any>(`/dashboard/sales-analytics/?period=${period}`)
    } catch (error) {
      return { monthly_sales: [] }
    }
  }

  async getRecentTransactions(limit: number = 10) {
    try {
      return await this.request<any[]>(`/dashboard/recent-transactions/?limit=${limit}`)
    } catch (error) {
      return []
    }
  }

  async getPendingApprovals(limit: number = 10) {
    try {
      return await this.request<any[]>(`/dashboard/pending-approvals/?limit=${limit}`)
    } catch (error) {
      return []
    }
  }

  // Comprehensive Pending Approvals Methods
  async getAllPendingApprovals(params?: {
    page?: number
    page_size?: number
    type?: string
    search?: string
  }): Promise<{
    items: Array<{
      id: number
      type: string
      number: string
      title: string
      description: string
      amount: number
      status: string
      created_at: string
      created_by: string
      entity_name?: string
    }>
    counts: {
      prfs: number
      pros: number
      ssts: number
      lsts: number
      stock_transfers: number
      expenses: number
      lodgements: number
      total: number
    }
    total: number
    page: number
    page_size: number
    total_pages: number
  }> {
    // Fetch pending items from multiple sources in parallel
    const [prfs, pros, ssts, lsts, stockTransfers, expenses, lodgements] = await Promise.all([
      this.getPrfs({ status: 'submitted', page_size: 100 }).catch(() => ({ results: [] })),
      this.getPros({ status: 'pending_approval', page_size: 100 }).catch(() => ({ results: [] })),
      this.get('/substore-transactions/awaiting-review/').catch(() => ({ results: [] })),
      this.get('/lubebay-service-transactions/pending/').catch(() => ({ results: [] })),
      this.getStockTransfers({ status: 'pending', page_size: 100 }).catch(() => ({ results: [] })),
      this.getExpenses({ status: 'pending', page_size: 100 }).catch(() => ({ results: [] })),
      this.getLodgements({ approval_status: 'awaiting_approval', page_size: 100 }).catch(() => ({ results: [] }))
    ])

    // Normalize items to a common format
    const normalizedItems: any[] = []

    // PRFs
    const prfList = Array.isArray(prfs) ? prfs : (prfs.results || [])
    prfList.forEach((prf: any) => {
      normalizedItems.push({
        id: prf.id,
        type: 'prf',
        number: prf.prf_number,
        title: prf.title || `PRF ${prf.prf_number}`,
        description: prf.description || prf.purpose || '',
        amount: prf.estimated_total || prf.order_total || 0,
        status: prf.status,
        created_at: prf.created_at,
        created_by: prf.requested_by_name || '',
        entity_name: prf.department
      })
    })

    // PROs
    const proList = Array.isArray(pros) ? pros : (pros.results || [])
    proList.forEach((pro: any) => {
      normalizedItems.push({
        id: pro.id,
        type: 'pro',
        number: pro.pro_number,
        title: pro.title || `PRO ${pro.pro_number}`,
        description: pro.description || '',
        amount: pro.total_amount || 0,
        status: pro.status,
        created_at: pro.created_at,
        created_by: pro.created_by_name || '',
        entity_name: pro.supplier
      })
    })

    // SSTs
    const sstList = Array.isArray(ssts) ? ssts : (ssts.results || [])
    sstList.forEach((sst: any) => {
      normalizedItems.push({
        id: sst.id,
        type: 'sst',
        number: sst.transaction_number,
        title: `SST ${sst.transaction_number}`,
        description: sst.comment || '',
        amount: sst.amount || 0,
        status: sst.approval_status,
        created_at: sst.created_at,
        created_by: sst.created_by_name || '',
        entity_name: sst.substore_name
      })
    })

    // LSTs
    const lstList = Array.isArray(lsts) ? lsts : (lsts.results || [])
    lstList.forEach((lst: any) => {
      normalizedItems.push({
        id: lst.id,
        type: 'lst',
        number: lst.transaction_number,
        title: `LST ${lst.transaction_number}`,
        description: lst.comment || '',
        amount: lst.total_amount || 0,
        status: lst.approval_status,
        created_at: lst.created_at,
        created_by: lst.created_by_name || '',
        entity_name: lst.lubebay_name
      })
    })

    // Stock Transfers
    const transferList = Array.isArray(stockTransfers) ? stockTransfers : (stockTransfers.results || [])
    transferList.forEach((transfer: any) => {
      normalizedItems.push({
        id: transfer.id,
        type: 'stock_transfer',
        number: transfer.transfer_number,
        title: `Transfer ${transfer.transfer_number}`,
        description: transfer.reason || '',
        amount: transfer.total_value || 0,
        status: transfer.status,
        created_at: transfer.created_at,
        created_by: transfer.created_by_name || '',
        entity_name: `${transfer.from_warehouse_name} → ${transfer.to_warehouse_name}`
      })
    })

    // Expenses
    const expenseList = Array.isArray(expenses) ? expenses : (expenses.results || [])
    expenseList.forEach((expense: any) => {
      normalizedItems.push({
        id: expense.id,
        type: 'expense',
        number: expense.expense_number,
        title: expense.description || `Expense ${expense.expense_number}`,
        description: expense.notes || '',
        amount: expense.amount || 0,
        status: expense.status,
        created_at: expense.created_at,
        created_by: expense.created_by_name || '',
        entity_name: expense.expense_type_name || expense.vendor_name
      })
    })

    // Lodgements
    const lodgementList = Array.isArray(lodgements) ? lodgements : (lodgements.results || [])
    lodgementList.forEach((lodgement: any) => {
      normalizedItems.push({
        id: lodgement.id,
        type: 'lodgement',
        number: lodgement.lodgement_number,
        title: `Lodgement ${lodgement.lodgement_number}`,
        description: lodgement.description || '',
        amount: lodgement.amount_lodged || 0,
        status: lodgement.approval_status,
        created_at: lodgement.created_at,
        created_by: lodgement.created_by_name || '',
        entity_name: lodgement.substore_name || lodgement.lubebay_name || lodgement.customer_name
      })
    })

    // Sort by created_at descending
    normalizedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Apply type filter if provided
    let filteredItems = normalizedItems
    if (params?.type && params.type !== 'all') {
      filteredItems = normalizedItems.filter(item => item.type === params.type)
    }

    // Apply search filter if provided
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredItems = filteredItems.filter(item =>
        item.number?.toLowerCase().includes(searchLower) ||
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.entity_name?.toLowerCase().includes(searchLower)
      )
    }

    // Pagination
    const page = params?.page || 1
    const pageSize = params?.page_size || 20
    const startIndex = (page - 1) * pageSize
    const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize)

    return {
      items: paginatedItems,
      counts: {
        prfs: prfList.length,
        pros: proList.length,
        ssts: sstList.length,
        lsts: lstList.length,
        stock_transfers: transferList.length,
        expenses: expenseList.length,
        lodgements: lodgementList.length,
        total: normalizedItems.length
      },
      total: filteredItems.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(filteredItems.length / pageSize)
    }
  }

  // Bulk Approval Methods
  async bulkApprovePrfs(ids: (number | string)[]): Promise<{ approved: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.approvePrf(id)))
    const approved = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { approved, failed }
  }

  async bulkRejectPrfs(ids: (number | string)[], reason: string): Promise<{ rejected: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.rejectPrf(id, reason)))
    const rejected = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { rejected, failed }
  }

  async bulkApprovePros(ids: (number | string)[]): Promise<{ approved: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.approvePro(id)))
    const approved = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { approved, failed }
  }

  async bulkRejectPros(ids: (number | string)[], reason: string): Promise<{ rejected: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.rejectPro(id, reason)))
    const rejected = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { rejected, failed }
  }

  async bulkApproveSsts(ids: (number | string)[]): Promise<{ approved: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.approveSst(id)))
    const approved = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { approved, failed }
  }

  async bulkRejectSsts(ids: (number | string)[], reason: string): Promise<{ rejected: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.rejectSst(id, reason)))
    const rejected = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { rejected, failed }
  }

  async bulkApproveLsts(ids: (number | string)[]): Promise<{ approved: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.confirmLst(id)))
    const approved = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { approved, failed }
  }

  async bulkRejectLsts(ids: (number | string)[], reason: string): Promise<{ rejected: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.rejectLst(id, reason)))
    const rejected = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { rejected, failed }
  }

  async bulkApproveStockTransfers(ids: (number | string)[]): Promise<{ approved: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.approveStockTransfer(id)))
    const approved = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { approved, failed }
  }

  async bulkRejectStockTransfers(ids: (number | string)[], reason: string): Promise<{ rejected: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.rejectStockTransfer(id, reason)))
    const rejected = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { rejected, failed }
  }

  async bulkApproveExpenses(ids: (number | string)[]): Promise<{ approved: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.approveExpense(id)))
    const approved = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { approved, failed }
  }

  async bulkRejectExpenses(ids: (number | string)[], reason: string): Promise<{ rejected: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.rejectExpense(id, reason)))
    const rejected = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { rejected, failed }
  }

  async bulkApproveLodgements(ids: (number | string)[]): Promise<{ approved: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.approveLodgement(id)))
    const approved = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { approved, failed }
  }

  async bulkRejectLodgements(ids: (number | string)[], reason: string): Promise<{ rejected: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.rejectLodgement(id, reason)))
    const rejected = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return { rejected, failed }
  }

  // User Management methods
  async getUsers(params?: {
    search?: string
    role?: string
    is_active?: boolean
    department?: string
    page?: number
    page_size?: number
  }): Promise<{
    paginator?: {
      count: number
      page: number
      page_size: number
      total_pages: number
      next: string | null
      previous: string | null
    }
    count?: number
    next?: string | null
    previous?: string | null
    results: any[]
  }> {
    let endpoint = '/auth/users/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getUserById(id: number | string): Promise<any> {
    return this.request(`/auth/users/${id}/`)
  }

  async createUser(userData: {
    email: string
    password: string
    confirm_password: string
    first_name: string
    last_name: string
    phone?: string
    role?: string
    department?: string
    employee_id?: string
    send_welcome_email?: boolean
  }): Promise<any> {
    return this.request('/auth/users/', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async updateUser(id: number | string, userData: {
    first_name?: string
    last_name?: string
    phone?: string
    role?: string
    department?: string
    employee_id?: string
    is_active?: boolean
  }): Promise<any> {
    return this.request(`/auth/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    })
  }

  async deleteUser(id: number | string): Promise<void> {
    await this.request(`/auth/users/${id}/`, {
      method: 'DELETE'
    })
  }

  async activateUser(id: number | string): Promise<any> {
    return this.request(`/auth/users/${id}/activate/`, {
      method: 'POST'
    })
  }

  async deactivateUser(id: number | string): Promise<any> {
    return this.request(`/auth/users/${id}/deactivate/`, {
      method: 'POST'
    })
  }

  async changeUserRole(id: number | string, role: string): Promise<any> {
    return this.request(`/auth/users/${id}/change-role/`, {
      method: 'POST',
      body: JSON.stringify({ role })
    })
  }

  // Role Management methods
  async getRoles(params?: {
    search?: string
    is_active?: boolean
    page?: number
    page_size?: number
  }): Promise<{
    count: number
    next: string | null
    previous: string | null
    results: any[]
  }> {
    let endpoint = '/authorization/roles'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getRoleById(id: number | string): Promise<any> {
    return this.request(`/authorization/roles/${id}`)
  }

  async createRole(roleData: {
    name: string
    description?: string
    permissions?: number[]
  }): Promise<any> {
    return this.request('/authorization/roles', {
      method: 'POST',
      body: JSON.stringify(roleData)
    })
  }

  async updateRole(id: number | string, roleData: {
    name?: string
    description?: string
    permissions?: number[]
  }): Promise<any> {
    return this.request(`/authorization/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(roleData)
    })
  }

  async deleteRole(id: number | string): Promise<void> {
    await this.request(`/authorization/roles/${id}`, {
      method: 'DELETE'
    })
  }

  async activateRole(id: number | string): Promise<any> {
    return this.request(`/authorization/roles/${id}/activate`, {
      method: 'POST'
    })
  }

  async deactivateRole(id: number | string): Promise<any> {
    return this.request(`/authorization/roles/${id}/deactivate`, {
      method: 'POST'
    })
  }

  // Permission methods
  async getPermissions(): Promise<any[]> {
    return this.request('/authorization/permissions')
  }

  // Entity Access Control methods
  async getUserEntityAccess(userId: number | string): Promise<any> {
    return this.request(`/auth/users/${userId}/entity-access/`)
  }

  async updateUserEntityAccess(userId: number | string, data: {
    has_all_warehouse_access?: boolean
    has_all_substore_access?: boolean
    has_all_lubebay_access?: boolean
    warehouse_ids?: number[]
    substore_ids?: number[]
    lubebay_ids?: number[]
  }): Promise<any> {
    return this.request(`/auth/users/${userId}/entity-access/update/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  // Entity listing methods for access assignment
  async getWarehouses(params?: { search?: string; is_active?: boolean }): Promise<any[]> {
    let endpoint = '/warehouses/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getSubstores(params?: { search?: string; is_active?: boolean; page?: number; page_size?: number }): Promise<any[]> {
    let endpoint = '/substores/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getLubebays(params?: { search?: string; is_active?: boolean; page?: number; page_size?: number }): Promise<any[]> {
    let endpoint = '/lubebays/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  // ========================================
  // PHASE 1: FOUNDATION MODULE API METHODS
  // ========================================

  // State Management
  async getStates(params?: { search?: string; is_active?: boolean }): Promise<any> {
    let endpoint = '/states/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getStateById(id: number | string): Promise<any> {
    return this.request(`/states/${id}/`)
  }

  async createState(data: {
    name: string
    code?: string
    is_active?: boolean
  }): Promise<any> {
    return this.request('/states/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateState(id: number | string, data: {
    name?: string
    code?: string
    is_active?: boolean
  }): Promise<any> {
    return this.request(`/states/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteState(id: number | string): Promise<void> {
    await this.request(`/states/${id}/`, {
      method: 'DELETE'
    })
  }

  // Location Management
  async getLocations(params?: { search?: string; state?: number; is_active?: boolean }): Promise<any> {
    let endpoint = '/locations/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getLocationById(id: number | string): Promise<any> {
    return this.request(`/locations/${id}/`)
  }

  async createLocation(data: {
    name: string
    code?: string
    state: number
    city?: string
    address?: string
    is_active?: boolean
  }): Promise<any> {
    return this.request('/locations/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateLocation(id: number | string, data: {
    name?: string
    code?: string
    state?: number
    city?: string
    address?: string
    is_active?: boolean
  }): Promise<any> {
    return this.request(`/locations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteLocation(id: number | string): Promise<void> {
    await this.request(`/locations/${id}/`, {
      method: 'DELETE'
    })
  }

  // Customer Management
  async getCustomers(params?: {
    search?: string;
    customer_type?: string;
    status?: string;
    is_verified?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<any> {
    let endpoint = '/customers/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getCustomer(id: number | string): Promise<any> {
    return this.request(`/customers/${id}/`)
  }

  async createCustomer(data: {
    name: string;
    email?: string;
    phone_number?: string;
    address?: string;
    customer_type: number;
    tax_number?: string;
    contact_person?: string;
    credit_limit?: number;
    payment_terms?: number;
    notes?: string;
  }): Promise<any> {
    return this.request('/customers/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateCustomer(id: number | string, data: {
    name?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    customer_type?: number;
    tax_number?: string;
    contact_person?: string;
    credit_limit?: number;
    payment_terms?: number;
    notes?: string;
    status?: string;
  }): Promise<any> {
    return this.request(`/customers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteCustomer(id: number | string): Promise<void> {
    await this.request(`/customers/${id}/`, {
      method: 'DELETE'
    })
  }

  // Customer verification
  async verifyCustomer(id: number | string): Promise<any> {
    return this.request(`/customers/${id}/verify/`, {
      method: 'POST'
    })
  }

  async unverifyCustomer(id: number | string): Promise<any> {
    return this.request(`/customers/${id}/unverify/`, {
      method: 'POST'
    })
  }

  // Customer status management
  async activateCustomer(id: number | string): Promise<any> {
    return this.request(`/customers/${id}/activate/`, {
      method: 'POST'
    })
  }

  async deactivateCustomer(id: number | string): Promise<any> {
    return this.request(`/customers/${id}/deactivate/`, {
      method: 'POST'
    })
  }

  async suspendCustomer(id: number | string): Promise<any> {
    return this.request(`/customers/${id}/suspend/`, {
      method: 'POST'
    })
  }

  // Customer payments
  async recordCustomerPayment(id: number | string, data: {
    amount: number;
    payment_method: string;
    reference_number?: string;
    notes?: string;
  }): Promise<any> {
    return this.request(`/customers/${id}/record_payment/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getCustomerPayments(id: number | string, params?: {
    page?: number;
    page_size?: number;
  }): Promise<any> {
    let endpoint = `/customers/${id}/payments/`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  // Customer balance and credit
  async getCustomerBalance(id: number | string): Promise<any> {
    return this.request(`/customers/${id}/balance/`)
  }

  async getCustomerCreditLimit(id: number | string): Promise<any> {
    return this.request(`/customers/${id}/credit_limit/`)
  }

  async updateCustomerCreditLimit(id: number | string, data: {
    credit_limit: number;
    notes?: string;
  }): Promise<any> {
    return this.request(`/customers/${id}/update_credit_limit/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Customer orders and sales history
  async getCustomerOrders(id: number | string, params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<any> {
    let endpoint = `/customers/${id}/orders/`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getCustomerSalesHistory(id: number | string, params?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
  }): Promise<any> {
    let endpoint = `/customers/${id}/sales_history/`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  // Customer analytics
  async getCustomerAnalytics(id: number | string): Promise<any> {
    return this.request(`/customers/${id}/analytics/`)
  }

  // Bulk operations
  async bulkUpdateCustomers(data: {
    customer_ids: number[];
    updates: {
      status?: string;
      customer_type?: number;
      credit_limit?: number;
    };
  }): Promise<any> {
    return this.request('/customers/bulk_update/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async exportCustomers(params?: {
    format?: 'csv' | 'excel';
    customer_type?: string;
    status?: string;
  }): Promise<any> {
    let endpoint = '/customers/export/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  // Customer Type Management
  async getCustomerTypes(params?: { search?: string; is_active?: boolean }): Promise<any> {
    let endpoint = '/customer-types/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getCustomerTypeById(id: number | string): Promise<any> {
    return this.request(`/customer-types/${id}/`)
  }

  async createCustomerType(data: {
    name: string
    description?: string
    discount_percentage?: number
    credit_limit?: number
    credit_days?: number
    requires_approval?: boolean
    is_active?: boolean
  }): Promise<any> {
    return this.request('/customer-types/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateCustomerType(id: number | string, data: {
    name?: string
    description?: string
    discount_percentage?: number
    credit_limit?: number
    credit_days?: number
    requires_approval?: boolean
    is_active?: boolean
  }): Promise<any> {
    return this.request(`/customer-types/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteCustomerType(id: number | string): Promise<void> {
    await this.request(`/customer-types/${id}/`, {
      method: 'DELETE'
    })
  }

  // Price Scheme Management
  async getPriceSchemes(params?: {
    search?: string
    customer_type?: number
    location?: number
    is_active?: boolean
  }): Promise<any> {
    let endpoint = '/price-schemes/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getPriceSchemeById(id: number | string): Promise<any> {
    return this.request(`/price-schemes/${id}/`)
  }

  async createPriceScheme(data: {
    name: string
    description?: string
    customer_type?: number
    location?: number
    effective_from: string
    effective_to?: string
    is_active?: boolean
  }): Promise<any> {
    return this.request('/price-schemes/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePriceScheme(id: number | string, data: {
    name?: string
    description?: string
    customer_type?: number
    location?: number
    effective_from?: string
    effective_to?: string
    is_active?: boolean
  }): Promise<any> {
    return this.request(`/price-schemes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deletePriceScheme(id: number | string): Promise<void> {
    await this.request(`/price-schemes/${id}/`, {
      method: 'DELETE'
    })
  }

  // Product Management
  async getProducts(params?: {
    search?: string
    category?: string
    is_active?: boolean
    page?: number
    size?: number
    page_size?: number
  }): Promise<any> {
    let endpoint = '/products/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getProductById(id: number | string): Promise<any> {
    return this.request(`/products/${id}/`)
  }

  async createProduct(data: {
    name: string
    description?: string
    product_code?: string
    category?: string
    subcategory?: string
    brand?: string
    unit_of_measure?: string
    cost_price: number
    direct_sales_price?: number
    minimum_selling_price?: number
    tax_rate?: number
    tax_inclusive?: boolean
    track_inventory?: boolean
    minimum_stock_level?: number
    reorder_level?: number
    maximum_stock_level?: number
    is_active?: boolean
  }): Promise<any> {
    return this.request('/products/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateProduct(id: number | string, data: {
    name?: string
    description?: string
    product_code?: string
    category?: string
    subcategory?: string
    brand?: string
    unit_of_measure?: string
    cost_price?: number
    direct_sales_price?: number
    minimum_selling_price?: number
    tax_rate?: number
    tax_inclusive?: boolean
    track_inventory?: boolean
    minimum_stock_level?: number
    reorder_level?: number
    maximum_stock_level?: number
    is_active?: boolean
  }): Promise<any> {
    return this.request(`/products/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteProduct(id: number | string): Promise<void> {
    await this.request(`/products/${id}/`, {
      method: 'DELETE'
    })
  }

  async activateProduct(id: number | string): Promise<any> {
    return this.request(`/products/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: true })
    })
  }

  async deactivateProduct(id: number | string): Promise<any> {
    return this.request(`/products/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: false })
    })
  }

  // Service Management (Lubebay Services)
  async getServices(params?: {
    search?: string
    category?: string
    is_active?: boolean
    page?: number
    page_size?: number
  }): Promise<any> {
    let endpoint = '/services/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getServiceById(id: number | string): Promise<any> {
    return this.request(`/services/${id}/`)
  }

  async createService(data: {
    service_name: string
    description?: string
    category?: string
    duration_minutes?: number
    base_price: number
    materials_cost?: number
    labor_cost?: number
    is_active?: boolean
  }): Promise<any> {
    return this.request('/services/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateService(id: number | string, data: {
    service_name?: string
    description?: string
    category?: string
    duration_minutes?: number
    base_price?: number
    materials_cost?: number
    labor_cost?: number
    is_active?: boolean
  }): Promise<any> {
    return this.request(`/services/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteService(id: number | string): Promise<void> {
    await this.request(`/services/${id}/`, {
      method: 'DELETE'
    })
  }

  async activateService(id: number | string): Promise<any> {
    return this.request(`/services/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: true })
    })
  }

  async deactivateService(id: number | string): Promise<any> {
    return this.request(`/services/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: false })
    })
  }

  // Expense Type Management
  async getExpenseTypes(params?: {
    search?: string
    category?: string
    is_active?: boolean
  }): Promise<any> {
    let endpoint = '/expense-types/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getExpenseTypeById(id: number | string): Promise<any> {
    return this.request(`/expense-types/${id}/`)
  }

  async createExpenseType(data: {
    name: string
    description?: string
    category?: string
    requires_approval?: boolean
    requires_receipt?: boolean
    gl_account_code?: string
    is_active?: boolean
  }): Promise<any> {
    return this.request('/expense-types/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateExpenseType(id: number | string, data: {
    name?: string
    description?: string
    category?: string
    requires_approval?: boolean
    requires_receipt?: boolean
    gl_account_code?: string
    is_active?: boolean
  }): Promise<any> {
    return this.request(`/expense-types/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteExpenseType(id: number | string): Promise<void> {
    await this.request(`/expense-types/${id}/`, {
      method: 'DELETE'
    })
  }

  // Expense Management
  async getExpenses(params?: {
    search?: string
    status?: string
    expense_type?: number | string
    payment_method?: string
    expense_date?: string
    page?: number
    page_size?: number
  }): Promise<any> {
    let endpoint = '/expenses/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'undefined') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getExpenseById(id: number | string): Promise<any> {
    return this.request(`/expenses/${id}/`)
  }

  async createExpense(data: {
    expense_type?: number
    description?: string
    amount: number
    expense_date?: string
    payment_method?: string
    vendor_name?: string
    vendor_contact?: string
    invoice_number?: string
    account?: number
    notes?: string
  }): Promise<any> {
    return this.request('/expenses/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateExpense(id: number | string, data: Partial<{
    expense_type: number
    description: string
    amount: number
    expense_date: string
    payment_method: string
    vendor_name: string
    vendor_contact: string
    invoice_number: string
    account: number
    notes: string
    status: string
  }>): Promise<any> {
    return this.request(`/expenses/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteExpense(id: number | string): Promise<void> {
    await this.request(`/expenses/${id}/`, {
      method: 'DELETE'
    })
  }

  async approveExpense(id: number | string): Promise<any> {
    return this.request(`/expenses/${id}/approve/`, {
      method: 'POST'
    })
  }

  async rejectExpense(id: number | string, reason?: string): Promise<any> {
    return this.request(`/expenses/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  async markExpensePaid(id: number | string): Promise<any> {
    return this.request(`/expenses/${id}/mark-paid/`, {
      method: 'POST'
    })
  }

  // Lubebay Expense Type Management
  async getLubebayExpenseTypes(params?: {
    search?: string
    category?: string
    is_active?: boolean
  }): Promise<any> {
    let endpoint = '/lubebay-expense-types/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getLubebayExpenseTypeById(id: number | string): Promise<any> {
    return this.request(`/lubebay-expense-types/${id}/`)
  }

  async createLubebayExpenseType(data: {
    name: string
    description?: string
    category?: string
    is_active?: boolean
  }): Promise<any> {
    return this.request('/lubebay-expense-types/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateLubebayExpenseType(id: number | string, data: {
    name?: string
    description?: string
    category?: string
    is_active?: boolean
  }): Promise<any> {
    return this.request(`/lubebay-expense-types/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteLubebayExpenseType(id: number | string): Promise<void> {
    await this.request(`/lubebay-expense-types/${id}/`, {
      method: 'DELETE'
    })
  }

  // Payment Type Management
  async getPaymentTypes(params?: { search?: string; is_active?: boolean }): Promise<any> {
    let endpoint = '/payment-types/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getPaymentTypeById(id: number | string): Promise<any> {
    return this.request(`/payment-types/${id}/`)
  }

  async createPaymentType(data: {
    name: string
    description?: string
    requires_reference?: boolean
    requires_credit_check?: boolean
    is_active?: boolean
  }): Promise<any> {
    return this.request('/payment-types/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePaymentType(id: number | string, data: {
    name?: string
    description?: string
    requires_reference?: boolean
    requires_credit_check?: boolean
    is_active?: boolean
  }): Promise<any> {
    return this.request(`/payment-types/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deletePaymentType(id: number | string): Promise<void> {
    await this.request(`/payment-types/${id}/`, {
      method: 'DELETE'
    })
  }

  // Audit Log
  async getAuditLogs(params?: {
    user?: number
    action?: string
    target_model?: string
    page?: number
    page_size?: number
  }): Promise<any> {
    let endpoint = '/audit-logs/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  async getMyAuditLogs(): Promise<any[]> {
    return this.request('/audit-logs/my_activity/')
  }

  // ========================================
  // BULK DELETE METHODS
  // ========================================

  /**
   * Generic bulk delete method for any entity.
   * @param endpoint - The API endpoint (e.g., '/products')
   * @param ids - Array of IDs to delete
   * @returns BulkDeleteResponse with deletion results
   */
  async bulkDelete(endpoint: string, ids: (number | string)[]): Promise<BulkDeleteResponse> {
    // Ensure endpoint ends with /bulk-delete/
    const bulkEndpoint = endpoint.endsWith('/')
      ? `${endpoint}bulk-delete/`
      : `${endpoint}/bulk-delete/`

    return this.request<BulkDeleteResponse>(bulkEndpoint, {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }

  // Convenience methods for each entity
  async bulkDeleteProducts(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/products', ids)
  }

  async bulkDeleteCustomers(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/customers', ids)
  }

  async bulkDeleteStates(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/states', ids)
  }

  async bulkDeleteLocations(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/locations', ids)
  }

  async bulkDeleteCustomerTypes(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/customer-types', ids)
  }

  async bulkDeletePaymentTypes(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/payment-types', ids)
  }

  async bulkDeleteExpenseTypes(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/expense-types', ids)
  }

  async bulkDeleteLubebayExpenseTypes(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/lubebay-expense-types', ids)
  }

  async bulkDeletePriceSchemes(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/price-schemes', ids)
  }

  async bulkDeleteWarehouses(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/warehouses', ids)
  }

  async bulkDeleteExpenses(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/expenses', ids)
  }

  async bulkDeleteServices(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/services', ids)
  }

  async bulkDeleteSubstores(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/substores', ids)
  }

  async bulkDeleteLubebays(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/lubebays', ids)
  }

  async bulkDeleteAccounts(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/accounts', ids)
  }

  // Generic CRUD methods
  async get<T = any>(url: string, params?: any): Promise<T> {
    let endpoint = url
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        // Filter out undefined, null, empty strings, and 'undefined' string
        if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
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

  // ========================================
  // PHASE 3: INVENTORY OPERATIONS API METHODS
  // ========================================

  // PRO (Purchase Receipt Order) Management
  async getPros(params?: {
    search?: string
    status?: string
    delivery_status?: string
    delivery_location?: number
    payment_method?: string
    page?: number
    page_size?: number
  }): Promise<any> {
    return this.get('/pros/', {
      ...params,
      fields: 'status,delivery_status,final_approval,approval_status,current_approval,created_at,submitted_at,approved_at,rejected_at,confirmed_at,delivered_at'
    })
  }

  async getProById(id: number | string): Promise<any> {
    return this.request(`/pros/${id}/`)
  }

  async createPro(data: {
    title?: string
    description?: string
    prf?: number
    supplier?: string
    supplier_contact?: string
    supplier_email?: string
    supplier_phone?: string
    delivery_address?: string
    delivery_location?: number
    expected_delivery_date?: string
    tax_amount?: number
    discount_amount?: number
    payment_terms?: string
    payment_method?: string
    notes?: string
    terms_conditions?: string
    items?: Array<{
      product: number
      quantity: number
      unit_price: number
      specifications?: string
      notes?: string
    }>
  }): Promise<any> {
    return this.request('/pros/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePro(id: number | string, data: any): Promise<any> {
    return this.request(`/pros/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deletePro(id: number | string): Promise<void> {
    await this.request(`/pros/${id}/`, {
      method: 'DELETE'
    })
  }

  async bulkDeletePros(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/pros', ids)
  }

  async getProStats(): Promise<{
    total: number
    draft: number
    pending_approval: number
    approved: number
    rejected: number
    sent: number
    confirmed: number
    partially_delivered: number
    delivered: number
    cancelled: number
    total_value: number
    pending_value: number
  }> {
    return this.request('/pros/stats/')
  }

  // PRO Workflow Actions
  async sendProToSupplier(id: number | string): Promise<any> {
    return this.request(`/pros/${id}/send-to-supplier/`, {
      method: 'POST'
    })
  }

  async confirmPro(id: number | string): Promise<any> {
    return this.request(`/pros/${id}/confirm/`, {
      method: 'POST'
    })
  }

  async receivePro(id: number | string, data: {
    items: Array<{
      product_id: number
      quantity_received: number
    }>
    notes?: string
  }): Promise<any> {
    return this.request(`/pros/${id}/receive/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async cancelPro(id: number | string): Promise<any> {
    return this.request(`/pros/${id}/cancel/`, {
      method: 'POST'
    })
  }

  // PRO Approval Actions
  async submitPro(id: number | string): Promise<any> {
    return this.request(`/pros/${id}/submit/`, {
      method: 'POST'
    })
  }

  async approvePro(id: number | string): Promise<any> {
    return this.request(`/pros/${id}/approve/`, {
      method: 'POST'
    })
  }

  async rejectPro(id: number | string, reason?: string): Promise<any> {
    return this.request(`/pros/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || '' })
    })
  }

  // PRO Item Management
  async addProItem(proId: number | string, data: {
    product: number
    quantity: number
    unit_price: number
    specifications?: string
    notes?: string
  }): Promise<any> {
    return this.request(`/pros/${proId}/items/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateProItem(proId: number | string, itemId: number | string, data: any): Promise<any> {
    return this.request(`/pros/${proId}/items/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async removeProItem(proId: number | string, itemId: number | string): Promise<any> {
    return this.request(`/pros/${proId}/items/${itemId}/delete/`, {
      method: 'DELETE'
    })
  }

  // Stock Transfer Management
  async getStockTransfers(params?: {
    search?: string
    status?: string
    from_warehouse?: number
    to_warehouse?: number
    page?: number
    page_size?: number
  }): Promise<any> {
    return this.get('/stock-transfers/', params)
  }

  async getStockTransferById(id: number | string): Promise<any> {
    return this.request(`/stock-transfers/${id}/`)
  }

  async createStockTransfer(data: {
    from_warehouse: number
    to_warehouse: number
    transfer_date?: string
    expected_date?: string
    reason?: string
    carrier?: string
    tracking_number?: string
    transport_cost?: number
    notes?: string
    items: Array<{
      product: number
      quantity_to_transfer: number
      unit_cost?: number
      batch_number?: string
      expiry_date?: string
    }>
  }): Promise<any> {
    return this.request('/stock-transfers/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateStockTransfer(id: number | string, data: any): Promise<any> {
    return this.request(`/stock-transfers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteStockTransfer(id: number | string): Promise<void> {
    await this.request(`/stock-transfers/${id}/`, {
      method: 'DELETE'
    })
  }

  async bulkDeleteStockTransfers(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.bulkDelete('/stock-transfers', ids)
  }

  async getStockTransferStats(): Promise<{
    total: number
    draft: number
    pending: number
    approved: number
    in_transit: number
    partially_received: number
    completed: number
    cancelled: number
    total_transport_cost: number
  }> {
    return this.request('/stock-transfers/stats/')
  }

  // Stock Transfer Workflow Actions
  async submitStockTransfer(id: number | string): Promise<any> {
    return this.request(`/stock-transfers/${id}/submit/`, {
      method: 'POST'
    })
  }

  async approveStockTransfer(id: number | string): Promise<any> {
    return this.request(`/stock-transfers/${id}/approve/`, {
      method: 'POST'
    })
  }

  async rejectStockTransfer(id: number | string, reason?: string): Promise<any> {
    return this.request(`/stock-transfers/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || '' })
    })
  }

  async shipStockTransfer(id: number | string): Promise<any> {
    return this.request(`/stock-transfers/${id}/ship/`, {
      method: 'POST'
    })
  }

  async receiveStockTransfer(id: number | string, data: {
    items: Array<{
      product_id: number
      quantity_received: number
      quantity_damaged?: number
      damage_notes?: string
    }>
    notes?: string
  }): Promise<any> {
    return this.request(`/stock-transfers/${id}/receive/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async cancelStockTransfer(id: number | string): Promise<any> {
    return this.request(`/stock-transfers/${id}/cancel/`, {
      method: 'POST'
    })
  }

  // Stock Transfer Item Management
  async addStockTransferItem(transferId: number | string, data: {
    product: number
    quantity_to_transfer: number
    unit_cost?: number
    batch_number?: string
    expiry_date?: string
  }): Promise<any> {
    return this.request(`/stock-transfers/${transferId}/items/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateStockTransferItem(transferId: number | string, itemId: number | string, data: any): Promise<any> {
    return this.request(`/stock-transfers/${transferId}/items/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async removeStockTransferItem(transferId: number | string, itemId: number | string): Promise<any> {
    return this.request(`/stock-transfers/${transferId}/items/${itemId}/delete/`, {
      method: 'DELETE'
    })
  }

  // Inventory Adjustment
  async adjustWarehouseInventory(warehouseId: number | string, data: {
    product_id: number
    quantity: number
    adjustment_type: 'set' | 'add' | 'subtract'
    reason: string
  }): Promise<any> {
    return this.request(`/warehouses/${warehouseId}/adjust-inventory/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async adjustSubstoreInventory(substoreId: number | string, data: {
    product_id: number
    quantity: number
    adjustment_type: 'set' | 'add' | 'subtract'
    reason: string
  }): Promise<any> {
    return this.request(`/substores/${substoreId}/adjust-inventory/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Warehouse Inventory Methods
  async getWarehouseById(id: number | string): Promise<any> {
    return this.request(`/warehouses/${id}/`)
  }

  async getWarehouseInventory(warehouseId: number | string, params?: {
    is_active?: boolean
    low_stock?: boolean
  }): Promise<{
    warehouse_id: number
    warehouse_name: string
    total_products: number
    total_value: number
    low_stock_count: number
    inventory: Array<{
      id: number
      warehouse: number
      product: number
      product_name: string
      product_code: string
      quantity_on_hand: number
      quantity_reserved: number
      quantity_available: number
      average_cost: number
      total_cost_value: number
      reorder_point: number
      max_stock_level: number
      is_active: boolean
      bin_location: string
      last_count_date: string | null
      last_movement_date: string | null
    }>
  }> {
    return this.get(`/warehouses/${warehouseId}/inventory/`, params)
  }

  async getWarehouseProductInventory(warehouseId: number | string, productId: number | string): Promise<any> {
    return this.request(`/warehouses/${warehouseId}/inventory/${productId}/`)
  }

  async getWarehouseBinCard(warehouseId: number | string, productId: number | string, params?: {
    start_date?: string
    end_date?: string
  }): Promise<{
    warehouse_id: number
    warehouse_name: string
    product_id: number
    product_name: string
    current_quantity: number
    total_receipts: number
    total_issues: number
    transaction_count: number
    transactions: Array<{
      id: number
      transaction_type: string
      quantity: number
      quantity_before: number
      quantity_after: number
      reason: string | null
      notes: string | null
      reference_type: string | null
      reference_id: number | null
      created_at: string
      created_by_name: string | null
    }>
  }> {
    return this.get(`/warehouses/${warehouseId}/bincard/${productId}/`, params)
  }

  // Substore Inventory Methods
  async getSubstoreById(id: number | string): Promise<any> {
    return this.request(`/substores/${id}/`)
  }

  async getSubstoreInventory(substoreId: number | string, params?: {
    is_active?: boolean
    low_stock?: boolean
  }): Promise<{
    substore_id: number
    substore_name: string
    total_products: number
    total_value: number
    low_stock_count: number
    inventory: Array<{
      id: number
      product_id: number
      product_name: string
      quantity_on_hand: number
      quantity_reserved: number
      quantity_available: number
      average_cost: number
      minimum_level: number
      maximum_level: number | null
      is_active: boolean
      is_low_stock: boolean
    }>
  }> {
    return this.get(`/substores/${substoreId}/inventory/`, params)
  }

  async getSubstoreProductInventory(substoreId: number | string, productId: number | string): Promise<any> {
    return this.request(`/substores/${substoreId}/inventory/${productId}/`)
  }

  async getSubstoreBinCard(substoreId: number | string, productId: number | string, params?: {
    start_date?: string
    end_date?: string
  }): Promise<{
    substore_id: number
    substore_name: string
    product_id: number
    product_name: string
    current_quantity: number
    total_receipts: number
    total_issues: number
    transaction_count: number
    transactions: Array<{
      id: number
      transaction_number: string
      transaction_type: string
      quantity: number
      stock_balance: number
      cost_price: number | null
      sale_price: number | null
      reference_number: string | null
      created_at: string
    }>
  }> {
    return this.get(`/substores/${substoreId}/bincard/${productId}/`, params)
  }

  // ==================== PRF (Purchase Requisition Form) Methods ====================

  async getPrfs(params?: {
    page?: number
    page_size?: number
    search?: string
    status?: string
    priority?: string
    department?: string
    ordering?: string
  }): Promise<any> {
    // Only fetch essential fields, exclude unnecessary ones like title, department, purpose, priority
    const requestParams = {
      ...params,
      fields: 'id,prf_number,estimated_total,status,requested_by_name,created_at,total_items,customer_name,client_id,client_type'
    }
    return this.get('/prfs/', requestParams)
  }

  async getPrfById(id: number | string): Promise<any> {
    return this.request(`/prfs/${id}/`)
  }

  async createPrf(data: {
    title: string
    description?: string
    department?: string
    purpose?: string
    priority?: string
    delivery_location?: number
    expected_delivery_date?: string
    estimated_total?: number
    budget_code?: string
    client_id?: number
    items?: Array<{
      product: number
      quantity_requested: number
      unit_price_estimate?: number
      specifications?: string
      preferred_supplier?: string
    }>
  }): Promise<any> {
    return this.request('/prfs/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePrf(id: number | string, data: any): Promise<any> {
    return this.request(`/prfs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deletePrf(id: number | string): Promise<void> {
    return this.request(`/prfs/${id}/`, { method: 'DELETE' })
  }

  async submitPrf(id: number | string): Promise<any> {
    return this.request(`/prfs/${id}/submit/`, { method: 'POST' })
  }

  async approvePrf(id: number | string): Promise<any> {
    return this.request(`/prfs/${id}/approve/`, { method: 'POST' })
  }

  async rejectPrf(id: number | string, reason: string): Promise<any> {
    return this.request(`/prfs/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  async issuePrfGoods(id: number | string): Promise<any> {
    return this.request(`/prfs/${id}/issue/`, { method: 'POST' })
  }

  async recordPrfPayment(id: number | string, data: {
    amount: number
    payment_method?: string
    payment_reference?: string
    notes?: string
  }): Promise<any> {
    return this.request(`/prfs/${id}/payment/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getPrfPayments(id: number | string): Promise<any> {
    return this.request(`/prfs/${id}/payments/`)
  }

  async getPrfStats(): Promise<{
    total: number
    draft: number
    submitted: number
    approved: number
    rejected: number
    fulfilled: number
    cancelled: number
    total_value: number
    pending_approval: number
  }> {
    return this.request('/prfs/stats/')
  }

  async cancelPrf(id: number | string): Promise<any> {
    return this.request(`/prfs/${id}/cancel/`, { method: 'POST' })
  }

  async bulkDeletePrfs(ids: (number | string)[]): Promise<BulkDeleteResponse> {
    return this.request('/prfs/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }

  // ==================== SST (Substore Transaction) Methods ====================

  async getSsts(params?: {
    page?: number
    page_size?: number
    search?: string
    substore?: number
    transaction_type?: string
    approval_status?: string
    ordering?: string
  }): Promise<any> {
    return this.get('/substore-transactions/', params)
  }

  async getSstById(id: number | string): Promise<any> {
    return this.request(`/substore-transactions/${id}/`)
  }

  async createSst(data: {
    substore: number
    transaction_type: 'CREDIT' | 'DEBIT'
    amount: number
    comment?: string
    bank_reference?: string
    sales_snapshot?: any
  }): Promise<any> {
    return this.request('/substore-transactions/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateSst(id: number | string, data: any): Promise<any> {
    return this.request(`/substore-transactions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteSst(id: number | string): Promise<void> {
    return this.request(`/substore-transactions/${id}/`, { method: 'DELETE' })
  }

  async approveSst(id: number | string, notes?: string): Promise<any> {
    return this.request(`/substore-transactions/${id}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ action: 'approve', notes })
    })
  }

  async rejectSst(id: number | string, reason: string): Promise<any> {
    return this.request(`/substore-transactions/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  async getSstPending(): Promise<any> {
    return this.request('/substore-transactions/pending/')
  }

  async getSstAwaitingReview(): Promise<any> {
    return this.request('/substore-transactions/awaiting-review/')
  }

  async getSstApproved(substoreId?: number): Promise<any> {
    const params = substoreId ? { substore: substoreId } : {}
    return this.get('/substore-transactions/approved/', params)
  }

  async getSstStats(substoreId?: number): Promise<{
    total: number
    pending: number
    awaiting_review: number
    approved: number
    rejected: number
    total_value: number
    credit_total: number
    debit_total: number
  }> {
    const params = substoreId ? { substore: substoreId } : {}
    return this.get('/substore-transactions/stats/', params)
  }

  async bulkDeleteSsts(ids: (number | string)[]): Promise<{ message: string; deleted_count: number }> {
    return this.request('/substore-transactions/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }

  // ==================== LST (Lubebay Service Transaction) Methods ====================

  async getLsts(params?: {
    page?: number
    page_size?: number
    search?: string
    lubebay?: number
    payment_method?: string
    approval_status?: string
    ordering?: string
  }): Promise<any> {
    return this.get('/lubebay-service-transactions/', params)
  }

  async getLstById(id: number | string): Promise<any> {
    return this.request(`/lubebay-service-transactions/${id}/`)
  }

  async createLst(data: {
    lubebay: number
    payment_method?: string
    comment?: string
    bank_reference?: string
    items: Array<{
      service: number
      quantity: number
      unit_price: number
    }>
  }): Promise<any> {
    return this.request('/lubebay-service-transactions/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateLst(id: number | string, data: any): Promise<any> {
    return this.request(`/lubebay-service-transactions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteLst(id: number | string): Promise<void> {
    return this.request(`/lubebay-service-transactions/${id}/`, { method: 'DELETE' })
  }

  async confirmLst(id: number | string, notes?: string): Promise<any> {
    return this.request(`/lubebay-service-transactions/${id}/confirm/`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    })
  }

  async rejectLst(id: number | string, reason: string): Promise<any> {
    return this.request(`/lubebay-service-transactions/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  async getLstPending(): Promise<any> {
    return this.request('/lubebay-service-transactions/pending/')
  }

  async getLstConfirmed(): Promise<any> {
    return this.request('/lubebay-service-transactions/confirmed/')
  }

  async getLstRejected(lubebayId?: number): Promise<any> {
    const params = lubebayId ? { lubebay: lubebayId } : {}
    return this.get('/lubebay-service-transactions/rejected/', params)
  }

  async getLstStats(lubebayId?: number): Promise<{
    total: number
    pending: number
    awaiting_confirmation: number
    confirmed: number
    rejected: number
    total_value: number
  }> {
    const params = lubebayId ? { lubebay: lubebayId } : {}
    return this.get('/lubebay-service-transactions/stats/', params)
  }

  async bulkDeleteLsts(ids: (number | string)[]): Promise<{ message: string; deleted_count: number }> {
    return this.request('/lubebay-service-transactions/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }

  // ==================== Lubebay Services Methods ====================

  async getServices(params?: {
    page?: number
    page_size?: number
    search?: string
    is_active?: boolean
  }): Promise<any> {
    return this.get('/services/', params)
  }

  async getServiceById(id: number | string): Promise<any> {
    return this.request(`/services/${id}/`)
  }

  // ==================== Lodgement Methods ====================

  async getLodgements(params?: {
    page?: number
    page_size?: number
    search?: string
    lodgement_type?: string
    approval_status?: string
    payment_method?: string
    substore?: number
    lubebay?: number
    customer?: number
  }): Promise<any> {
    return this.get('/lodgements/', params)
  }

  async getLodgementById(id: number | string): Promise<any> {
    return this.request(`/lodgements/${id}/`)
  }

  async createLodgement(data: {
    lodgement_type: 'substore' | 'lubebay' | 'customer'
    substore?: number
    lubebay?: number
    customer?: number
    prf?: number
    amount_lodged: number
    lodgement_date: string
    payment_method?: string
    bank_name?: string
    account_number?: string
    deposit_slip_number?: string
    reference_number?: string
    transaction_reference?: string
    description?: string
    notes?: string
    variance_reason?: string
    substore_transaction_ids?: number[]
    lubebay_transaction_ids?: number[]
  }): Promise<any> {
    return this.request('/lodgements/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateLodgement(id: number | string, data: Partial<{
    amount_lodged: number
    lodgement_date: string
    payment_method: string
    bank_name: string
    account_number: string
    deposit_slip_number: string
    reference_number: string
    transaction_reference: string
    description: string
    notes: string
    variance_reason: string
  }>): Promise<any> {
    return this.request(`/lodgements/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteLodgement(id: number | string): Promise<void> {
    return this.request(`/lodgements/${id}/`, { method: 'DELETE' })
  }

  async submitLodgement(id: number | string): Promise<any> {
    return this.request(`/lodgements/${id}/submit/`, { method: 'POST' })
  }

  async approveLodgement(id: number | string, notes?: string): Promise<any> {
    return this.request(`/lodgements/${id}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    })
  }

  async rejectLodgement(id: number | string, reason: string): Promise<any> {
    return this.request(`/lodgements/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  async cancelLodgement(id: number | string, reason?: string): Promise<any> {
    return this.request(`/lodgements/${id}/cancel/`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  async getLodgementStats(lodgement_type?: string): Promise<{
    total: number
    pending: number
    awaiting_approval: number
    approved: number
    rejected: number
    cancelled: number
    total_lodged: number
    total_expected: number
    total_variance: number
    by_type: Record<string, { count: number; total_amount: number }>
  }> {
    const params = lodgement_type ? { lodgement_type } : {}
    return this.get('/lodgements/stats/', params)
  }

  async getUnlodgedSsts(substoreId: number | string): Promise<{
    transactions: any[]
    count: number
    total_amount: number
  }> {
    return this.get('/lodgements/unlodged-ssts/', { substore_id: substoreId })
  }

  async getUnlodgedLsts(lubebayId: number | string): Promise<{
    transactions: any[]
    count: number
    total_amount: number
  }> {
    return this.get('/lodgements/unlodged-lsts/', { lubebay_id: lubebayId })
  }

  async getLodgementTransactions(id: number | string): Promise<{
    transactions: any[]
    count: number
  }> {
    return this.request(`/lodgements/${id}/transactions/`)
  }

  async bulkDeleteLodgements(ids: (number | string)[]): Promise<{ message: string; deleted_count: number }> {
    return this.request('/lodgements/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }

  // ========================================
  // PHASE 7: REPORTING & ANALYTICS API METHODS
  // ========================================

  // Entity-Specific Dashboard Methods
  async getWarehouseDashboard(warehouseId: number | string, period: string = 'ytd'): Promise<{
    warehouse: { id: number; name: string; code: string; location_name: string }
    inventory_summary: {
      total_products: number
      total_quantity: number
      total_value: number
      low_stock_count: number
    }
    monthly_movements: Array<{
      month: string
      inbound: number
      outbound: number
    }>
    top_products: Array<{
      id: number
      name: string
      product_code: string
      quantity: number
      value: number
    }>
    recent_transactions: any[]
    pending_transfers: number
    value_by_category: Record<string, number>
  }> {
    try {
      return await this.request(`/dashboard/warehouse/${warehouseId}/?period=${period}`)
    } catch (error) {
      return {
        warehouse: { id: 0, name: '', code: '', location_name: '' },
        inventory_summary: { total_products: 0, total_quantity: 0, total_value: 0, low_stock_count: 0 },
        monthly_movements: [],
        top_products: [],
        recent_transactions: [],
        pending_transfers: 0,
        value_by_category: {}
      }
    }
  }

  async getSubstoreDashboard(substoreId: number | string, period: string = 'ytd'): Promise<{
    substore: { id: number; name: string; code: string; warehouse_name: string; state_name: string }
    sales_summary: {
      total_transactions: number
      total_sales: number
      total_quantity_sold: number
      average_transaction: number
    }
    monthly_sales: Array<{
      month: string
      transactions: number
      amount: number
    }>
    top_products: Array<{
      id: number
      name: string
      quantity_sold: number
      revenue: number
    }>
    inventory_summary: {
      total_products: number
      total_quantity: number
      total_value: number
      low_stock_count: number
    }
    lodgement_status: {
      total_lodged: number
      pending_lodgement: number
      unlodged_amount: number
    }
    recent_transactions: any[]
  }> {
    try {
      return await this.request(`/dashboard/substore/${substoreId}/?period=${period}`)
    } catch (error) {
      return {
        substore: { id: 0, name: '', code: '', warehouse_name: '', state_name: '' },
        sales_summary: { total_transactions: 0, total_sales: 0, total_quantity_sold: 0, average_transaction: 0 },
        monthly_sales: [],
        top_products: [],
        inventory_summary: { total_products: 0, total_quantity: 0, total_value: 0, low_stock_count: 0 },
        lodgement_status: { total_lodged: 0, pending_lodgement: 0, unlodged_amount: 0 },
        recent_transactions: []
      }
    }
  }

  async getLubebayDashboard(lubebayId: number | string, period: string = 'ytd'): Promise<{
    lubebay: { id: number; name: string; code: string; state_name: string }
    service_summary: {
      total_transactions: number
      total_revenue: number
      total_services_rendered: number
      average_transaction: number
    }
    monthly_revenue: Array<{
      month: string
      transactions: number
      revenue: number
    }>
    top_services: Array<{
      id: number
      service_name: string
      count: number
      revenue: number
    }>
    expense_summary: {
      total_expenses: number
      by_category: Record<string, number>
    }
    lodgement_status: {
      total_lodged: number
      pending_lodgement: number
      unlodged_amount: number
    }
    recent_transactions: any[]
  }> {
    try {
      return await this.request(`/dashboard/lubebay/${lubebayId}/?period=${period}`)
    } catch (error) {
      return {
        lubebay: { id: 0, name: '', code: '', state_name: '' },
        service_summary: { total_transactions: 0, total_revenue: 0, total_services_rendered: 0, average_transaction: 0 },
        monthly_revenue: [],
        top_services: [],
        expense_summary: { total_expenses: 0, by_category: {} },
        lodgement_status: { total_lodged: 0, pending_lodgement: 0, unlodged_amount: 0 },
        recent_transactions: []
      }
    }
  }

  async getStateDashboard(stateId: number | string, period: string = 'ytd'): Promise<{
    state: { id: number; name: string; code: string }
    entity_counts: {
      warehouses: number
      substores: number
      lubebays: number
      customers: number
    }
    sales_summary: {
      substore_sales: number
      lubebay_revenue: number
      total_transactions: number
    }
    monthly_performance: Array<{
      month: string
      substore_sales: number
      lubebay_revenue: number
    }>
    top_substores: Array<{
      id: number
      name: string
      total_sales: number
    }>
    top_lubebays: Array<{
      id: number
      name: string
      total_revenue: number
    }>
    lodgement_status: {
      total_lodged: number
      pending: number
    }
  }> {
    try {
      return await this.request(`/dashboard/state/${stateId}/?period=${period}`)
    } catch (error) {
      return {
        state: { id: 0, name: '', code: '' },
        entity_counts: { warehouses: 0, substores: 0, lubebays: 0, customers: 0 },
        sales_summary: { substore_sales: 0, lubebay_revenue: 0, total_transactions: 0 },
        monthly_performance: [],
        top_substores: [],
        top_lubebays: [],
        lodgement_status: { total_lodged: 0, pending: 0 }
      }
    }
  }

  async getSalesrepDashboard(period: string = 'ytd'): Promise<{
    salesrep: { id: number; name: string; email: string }
    sales_summary: {
      total_transactions: number
      total_sales: number
      average_transaction: number
      customers_served: number
    }
    monthly_performance: Array<{
      month: string
      transactions: number
      sales: number
    }>
    top_customers: Array<{
      id: number
      name: string
      total_purchases: number
    }>
    top_products: Array<{
      id: number
      name: string
      quantity_sold: number
      revenue: number
    }>
    recent_transactions: any[]
  }> {
    try {
      return await this.request(`/dashboard/salesrep/?period=${period}`)
    } catch (error) {
      return {
        salesrep: { id: 0, name: '', email: '' },
        sales_summary: { total_transactions: 0, total_sales: 0, average_transaction: 0, customers_served: 0 },
        monthly_performance: [],
        top_customers: [],
        top_products: [],
        recent_transactions: []
      }
    }
  }

  // Advanced Reports API Methods
  async getFinancialDashboard(period: string = 'ytd'): Promise<{
    summary: {
      total_revenue: number
      total_expenses: number
      net_profit: number
      profit_margin: number
    }
    monthly_trends: Array<{
      month: string
      revenue: number
      expenses: number
      profit: number
    }>
    revenue_breakdown: {
      substore_sales: number
      lubebay_services: number
      other: number
    }
    expense_breakdown: Record<string, number>
    accounts_receivable: number
    accounts_payable: number
    cash_position: number
  }> {
    try {
      return await this.request(`/reports/financial-dashboard/?period=${period}`)
    } catch (error) {
      return {
        summary: { total_revenue: 0, total_expenses: 0, net_profit: 0, profit_margin: 0 },
        monthly_trends: [],
        revenue_breakdown: { substore_sales: 0, lubebay_services: 0, other: 0 },
        expense_breakdown: {},
        accounts_receivable: 0,
        accounts_payable: 0,
        cash_position: 0
      }
    }
  }

  async getSalesReport(params?: {
    start_date?: string
    end_date?: string
    period?: string
    warehouse_id?: number
    substore_id?: number
    product_id?: number
    customer_id?: number
    group_by?: 'day' | 'week' | 'month' | 'product' | 'customer' | 'substore'
  }): Promise<{
    summary: {
      total_sales: number
      total_transactions: number
      total_quantity: number
      average_order_value: number
      unique_customers: number
    }
    trends: Array<{
      period: string
      sales: number
      transactions: number
      quantity: number
    }>
    by_product: Array<{
      product_id: number
      product_name: string
      quantity_sold: number
      revenue: number
      percentage: number
    }>
    by_customer: Array<{
      customer_id: number
      customer_name: string
      transactions: number
      total_spent: number
      percentage: number
    }>
    by_substore: Array<{
      substore_id: number
      substore_name: string
      sales: number
      transactions: number
      percentage: number
    }>
  }> {
    try {
      let endpoint = '/reports/sales-analytics/'
      if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          endpoint += `?${queryString}`
        }
      }
      return await this.request(endpoint)
    } catch (error) {
      return {
        summary: { total_sales: 0, total_transactions: 0, total_quantity: 0, average_order_value: 0, unique_customers: 0 },
        trends: [],
        by_product: [],
        by_customer: [],
        by_substore: []
      }
    }
  }

  async getInventoryAnalytics(params?: {
    warehouse_id?: number
    substore_id?: number
    category?: string
    include_zero_stock?: boolean
  }): Promise<{
    summary: {
      total_products: number
      total_quantity: number
      total_value: number
      low_stock_items: number
      out_of_stock_items: number
      overstocked_items: number
    }
    by_category: Array<{
      category: string
      product_count: number
      total_quantity: number
      total_value: number
    }>
    by_warehouse: Array<{
      warehouse_id: number
      warehouse_name: string
      product_count: number
      total_quantity: number
      total_value: number
    }>
    stock_alerts: Array<{
      product_id: number
      product_name: string
      warehouse_name: string
      current_stock: number
      reorder_level: number
      status: 'low' | 'out_of_stock' | 'overstocked'
    }>
    movement_trends: Array<{
      month: string
      inbound: number
      outbound: number
      net_change: number
    }>
    top_moving_products: Array<{
      product_id: number
      product_name: string
      quantity_moved: number
      turnover_rate: number
    }>
    slow_moving_products: Array<{
      product_id: number
      product_name: string
      quantity_on_hand: number
      days_since_last_movement: number
    }>
  }> {
    try {
      let endpoint = '/reports/inventory-analytics/'
      if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          endpoint += `?${queryString}`
        }
      }
      return await this.request(endpoint)
    } catch (error) {
      return {
        summary: { total_products: 0, total_quantity: 0, total_value: 0, low_stock_items: 0, out_of_stock_items: 0, overstocked_items: 0 },
        by_category: [],
        by_warehouse: [],
        stock_alerts: [],
        movement_trends: [],
        top_moving_products: [],
        slow_moving_products: []
      }
    }
  }

  async getCustomerAnalytics(params?: {
    start_date?: string
    end_date?: string
    period?: string
    customer_type_id?: number
    state_id?: number
  }): Promise<{
    summary: {
      total_customers: number
      active_customers: number
      new_customers: number
      churned_customers: number
      average_lifetime_value: number
    }
    by_type: Array<{
      type_id: number
      type_name: string
      customer_count: number
      total_revenue: number
      average_order_value: number
    }>
    by_location: Array<{
      state_id: number
      state_name: string
      customer_count: number
      total_revenue: number
    }>
    top_customers: Array<{
      customer_id: number
      customer_name: string
      total_transactions: number
      total_spent: number
      last_purchase_date: string
    }>
    customer_trends: Array<{
      month: string
      new_customers: number
      active_customers: number
      churned: number
    }>
    purchase_frequency: {
      one_time: number
      occasional: number
      regular: number
      frequent: number
    }
  }> {
    try {
      let endpoint = '/reports/customer-analytics/'
      if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          endpoint += `?${queryString}`
        }
      }
      return await this.request(endpoint)
    } catch (error) {
      return {
        summary: { total_customers: 0, active_customers: 0, new_customers: 0, churned_customers: 0, average_lifetime_value: 0 },
        by_type: [],
        by_location: [],
        top_customers: [],
        customer_trends: [],
        purchase_frequency: { one_time: 0, occasional: 0, regular: 0, frequent: 0 }
      }
    }
  }

  async getOperationalDashboard(period: string = 'ytd'): Promise<{
    orders: {
      total_prfs: number
      pending_prfs: number
      total_pros: number
      pending_pros: number
      approved_pros: number
    }
    transfers: {
      total_transfers: number
      pending_transfers: number
      in_transit: number
      completed: number
    }
    inventory: {
      total_value: number
      low_stock_alerts: number
      stock_movements_today: number
    }
    approvals: {
      pending_prfs: number
      pending_pros: number
      pending_expenses: number
      pending_lodgements: number
      total_pending: number
    }
    recent_activities: any[]
  }> {
    try {
      return await this.request(`/reports/operational-dashboard/?period=${period}`)
    } catch (error) {
      return {
        orders: { total_prfs: 0, pending_prfs: 0, total_pros: 0, pending_pros: 0, approved_pros: 0 },
        transfers: { total_transfers: 0, pending_transfers: 0, in_transit: 0, completed: 0 },
        inventory: { total_value: 0, low_stock_alerts: 0, stock_movements_today: 0 },
        approvals: { pending_prfs: 0, pending_pros: 0, pending_expenses: 0, pending_lodgements: 0, total_pending: 0 },
        recent_activities: []
      }
    }
  }

  async getProfitLossReport(params?: {
    start_date?: string
    end_date?: string
    period?: string
  }): Promise<{
    period: { start: string; end: string }
    revenue: {
      substore_sales: number
      lubebay_services: number
      other_income: number
      total: number
    }
    cost_of_goods_sold: number
    gross_profit: number
    operating_expenses: {
      salaries: number
      rent: number
      utilities: number
      marketing: number
      other: number
      total: number
    }
    operating_income: number
    other_expenses: number
    net_profit: number
    profit_margin: number
    monthly_breakdown: Array<{
      month: string
      revenue: number
      expenses: number
      profit: number
    }>
  }> {
    try {
      let endpoint = '/reports/profit-loss/'
      if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          endpoint += `?${queryString}`
        }
      }
      return await this.request(endpoint)
    } catch (error) {
      return {
        period: { start: '', end: '' },
        revenue: { substore_sales: 0, lubebay_services: 0, other_income: 0, total: 0 },
        cost_of_goods_sold: 0,
        gross_profit: 0,
        operating_expenses: { salaries: 0, rent: 0, utilities: 0, marketing: 0, other: 0, total: 0 },
        operating_income: 0,
        other_expenses: 0,
        net_profit: 0,
        profit_margin: 0,
        monthly_breakdown: []
      }
    }
  }

  async getCashFlowReport(params?: {
    start_date?: string
    end_date?: string
    period?: string
  }): Promise<{
    period: { start: string; end: string }
    opening_balance: number
    closing_balance: number
    net_change: number
    operating_activities: {
      cash_from_sales: number
      cash_from_services: number
      payments_to_suppliers: number
      payments_for_expenses: number
      net: number
    }
    investing_activities: {
      purchase_of_equipment: number
      sale_of_assets: number
      net: number
    }
    financing_activities: {
      loans_received: number
      loan_repayments: number
      capital_contributions: number
      withdrawals: number
      net: number
    }
    monthly_cash_flow: Array<{
      month: string
      inflow: number
      outflow: number
      net: number
      balance: number
    }>
  }> {
    try {
      let endpoint = '/reports/cash-flow/'
      if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          endpoint += `?${queryString}`
        }
      }
      return await this.request(endpoint)
    } catch (error) {
      return {
        period: { start: '', end: '' },
        opening_balance: 0,
        closing_balance: 0,
        net_change: 0,
        operating_activities: { cash_from_sales: 0, cash_from_services: 0, payments_to_suppliers: 0, payments_for_expenses: 0, net: 0 },
        investing_activities: { purchase_of_equipment: 0, sale_of_assets: 0, net: 0 },
        financing_activities: { loans_received: 0, loan_repayments: 0, capital_contributions: 0, withdrawals: 0, net: 0 },
        monthly_cash_flow: []
      }
    }
  }

  async getProcurementAnalytics(params?: {
    start_date?: string
    end_date?: string
    period?: string
    supplier_id?: number
    warehouse_id?: number
  }): Promise<{
    summary: {
      total_prfs: number
      total_pros: number
      total_value: number
      average_lead_time: number
      on_time_delivery_rate: number
    }
    by_supplier: Array<{
      supplier_id: number
      supplier_name: string
      order_count: number
      total_value: number
      average_lead_time: number
      on_time_rate: number
    }>
    by_product: Array<{
      product_id: number
      product_name: string
      quantity_ordered: number
      total_value: number
      average_unit_price: number
    }>
    monthly_trends: Array<{
      month: string
      prfs: number
      pros: number
      value: number
    }>
    pending_orders: Array<{
      id: number
      number: string
      supplier: string
      status: string
      expected_date: string
      value: number
    }>
  }> {
    try {
      let endpoint = '/reports/procurement-analytics/'
      if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          endpoint += `?${queryString}`
        }
      }
      return await this.request(endpoint)
    } catch (error) {
      return {
        summary: { total_prfs: 0, total_pros: 0, total_value: 0, average_lead_time: 0, on_time_delivery_rate: 0 },
        by_supplier: [],
        by_product: [],
        monthly_trends: [],
        pending_orders: []
      }
    }
  }

  // Export Reports Methods
  async exportReportToExcel(reportType: string, params?: Record<string, any>): Promise<Blob> {
    let endpoint = `/reports/export/${reportType}/excel/`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }

    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': this.authToken ? `Bearer ${this.authToken}` : '',
      },
    })

    if (!response.ok) {
      throw {
        message: 'Failed to export report',
        status: response.status
      } as ApiError
    }

    return response.blob()
  }

  async exportReportToPdf(reportType: string, params?: Record<string, any>): Promise<Blob> {
    let endpoint = `/reports/export/${reportType}/pdf/`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }

    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': this.authToken ? `Bearer ${this.authToken}` : '',
      },
    })

    if (!response.ok) {
      throw {
        message: 'Failed to export report',
        status: response.status
      } as ApiError
    }

    return response.blob()
  }

  // General export helper
  async downloadReport(reportType: string, format: 'excel' | 'pdf', params?: Record<string, any>): Promise<void> {
    const blob = format === 'excel'
      ? await this.exportReportToExcel(reportType, params)
      : await this.exportReportToPdf(reportType, params)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportType}-report.${format === 'excel' ? 'xlsx' : 'pdf'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // ============================================
  // PHASE 8: SYSTEM ADMINISTRATION API METHODS
  // ============================================

  // System Settings API Methods

  /**
   * Get all system settings
   */
  async getSystemSettings(): Promise<SystemSettings> {
    return this.request<SystemSettings>('/system-settings/')
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    return this.request<SystemSettings>('/system-settings/1/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get general/company settings only
   */
  async getGeneralSettings(): Promise<Partial<SystemSettings>> {
    return this.request<Partial<SystemSettings>>('/system-settings/general/')
  }

  /**
   * Update general/company settings
   */
  async updateGeneralSettings(data: Partial<SystemSettings>): Promise<Partial<SystemSettings>> {
    return this.request<Partial<SystemSettings>>('/system-settings/general/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get security settings only
   */
  async getSecuritySettings(): Promise<Partial<SystemSettings>> {
    return this.request<Partial<SystemSettings>>('/system-settings/security/')
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(data: Partial<SystemSettings>): Promise<Partial<SystemSettings>> {
    return this.request<Partial<SystemSettings>>('/system-settings/security/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get notification settings only
   */
  async getNotificationSettings(): Promise<Partial<SystemSettings>> {
    return this.request<Partial<SystemSettings>>('/system-settings/notifications/')
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(data: Partial<SystemSettings>): Promise<Partial<SystemSettings>> {
    return this.request<Partial<SystemSettings>>('/system-settings/notifications/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get backup settings only
   */
  async getBackupSettings(): Promise<Partial<SystemSettings>> {
    return this.request<Partial<SystemSettings>>('/system-settings/backup/')
  }

  /**
   * Update backup settings
   */
  async updateBackupSettings(data: Partial<SystemSettings>): Promise<Partial<SystemSettings>> {
    return this.request<Partial<SystemSettings>>('/system-settings/backup/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(email: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/system-settings/test_email/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  /**
   * Test SMS configuration
   */
  async testSmsConfiguration(phone: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/system-settings/test_sms/', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    })
  }

  // Approval Configuration API Methods

  /**
   * Get all approval configurations
   */
  async getApprovalConfigurations(params?: {
    process_type?: string
    is_active?: boolean
    page?: number
  }): Promise<{
    count: number
    next: string | null
    previous: string | null
    results: ApprovalConfiguration[]
  }> {
    let endpoint = '/approval-configurations/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  /**
   * Get a single approval configuration
   */
  async getApprovalConfiguration(id: number): Promise<ApprovalConfiguration> {
    return this.request<ApprovalConfiguration>(`/approval-configurations/${id}/`)
  }

  /**
   * Create a new approval configuration
   */
  async createApprovalConfiguration(data: Partial<ApprovalConfiguration>): Promise<ApprovalConfiguration> {
    return this.request<ApprovalConfiguration>('/approval-configurations/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update an approval configuration
   */
  async updateApprovalConfiguration(id: number, data: Partial<ApprovalConfiguration>): Promise<ApprovalConfiguration> {
    return this.request<ApprovalConfiguration>(`/approval-configurations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete an approval configuration
   */
  async deleteApprovalConfiguration(id: number): Promise<void> {
    return this.request<void>(`/approval-configurations/${id}/`, {
      method: 'DELETE',
    })
  }

  /**
   * Bulk delete approval configurations
   */
  async bulkDeleteApprovalConfigurations(ids: number[]): Promise<BulkDeleteResponse> {
    return this.request<BulkDeleteResponse>('/approval-configurations/bulk_delete/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  }

  /**
   * Get all available process types
   */
  async getApprovalProcessTypes(): Promise<Array<{ value: string; label: string }>> {
    return this.request<Array<{ value: string; label: string }>>('/approval-configurations/process_types/')
  }

  /**
   * Get approval configuration by process type
   */
  async getApprovalConfigurationByProcess(processType: string): Promise<ApprovalConfiguration> {
    return this.request<ApprovalConfiguration>(`/approval-configurations/by_process/?process_type=${processType}`)
  }

  /**
   * Get required approval levels for a process with optional amount
   */
  async getRequiredApprovalLevels(processType: string, amount?: number): Promise<{
    process_type: string
    amount: number | null
    required_levels: number
    level_configs: Array<{
      required: boolean
      role: string | null
      description: string | null
    }>
    message?: string
  }> {
    return this.request('/approval-configurations/get_required_levels/', {
      method: 'POST',
      body: JSON.stringify({ process_type: processType, amount }),
    })
  }

  /**
   * Activate an approval configuration
   */
  async activateApprovalConfiguration(id: number): Promise<ApprovalConfiguration> {
    return this.request<ApprovalConfiguration>(`/approval-configurations/${id}/activate/`, {
      method: 'POST',
    })
  }

  /**
   * Deactivate an approval configuration
   */
  async deactivateApprovalConfiguration(id: number): Promise<ApprovalConfiguration> {
    return this.request<ApprovalConfiguration>(`/approval-configurations/${id}/deactivate/`, {
      method: 'POST',
    })
  }

  /**
   * Initialize default approval configurations for all process types
   */
  async initializeDefaultApprovalConfigurations(): Promise<{
    message: string
    created: string[]
  }> {
    return this.request('/approval-configurations/initialize_defaults/', {
      method: 'POST',
    })
  }

  // Audit Log API Methods

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(params?: {
    user?: number
    action?: string
    target_model?: string
    success?: boolean
    search?: string
    page?: number
    page_size?: number
    ordering?: string
  }): Promise<{
    count: number
    next: string | null
    previous: string | null
    results: Array<{
      id: number
      user: number | null
      user_email: string
      action: string
      target_model: string
      target_id: string
      details: Record<string, any>
      ip_address: string | null
      user_agent: string | null
      success: boolean
      error_message: string | null
      timestamp: string
    }>
  }> {
    let endpoint = '/audit-logs/'
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    return this.request(endpoint)
  }

  /**
   * Get a single audit log entry
   */
  async getAuditLog(id: number): Promise<{
    id: number
    user: number | null
    user_email: string
    action: string
    target_model: string
    target_id: string
    details: Record<string, any>
    ip_address: string | null
    user_agent: string | null
    success: boolean
    error_message: string | null
    timestamp: string
  }> {
    return this.request(`/audit-logs/${id}/`)
  }

  /**
   * Get current user's audit activity
   */
  async getMyAuditActivity(): Promise<Array<{
    id: number
    action: string
    target_model: string
    target_id: string
    timestamp: string
    success: boolean
  }>> {
    return this.request('/audit-logs/my_activity/')
  }
}

const apiClient = new ApiClient()
export default apiClient
