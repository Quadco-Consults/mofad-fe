import axios, { AxiosInstance, AxiosError } from 'axios'

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
      withCredentials: true, // Important for Laravel Sanctum
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            window.location.href = '/auth/login'
          }
        }
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const data = error.response.data as any
      return {
        message: data.message || 'An error occurred',
        errors: data.errors,
        status: error.response.status,
      }
    }
    return {
      message: error.message || 'Network error',
      status: 0,
    }
  }

  // Auth methods
  async login(credentials: { email: string; password: string }) {
    // First, get CSRF cookie
    await this.client.get('/sanctum/csrf-cookie', {
      baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000',
    })

    const response = await this.client.post('/auth/login', credentials)

    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }

    return response.data
  }

  async logout() {
    try {
      await this.client.post('/auth/logout')
    } finally {
      localStorage.removeItem('auth_token')
    }
  }

  async getUser() {
    const response = await this.client.get('/auth/user')
    return response.data
  }

  // Generic CRUD methods
  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get(url, { params })
    return response.data
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data)
    return response.data
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data)
    return response.data
  }

  async patch<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch(url, data)
    return response.data
  }

  async delete<T = any>(url: string): Promise<T> {
    const response = await this.client.delete(url)
    return response.data
  }

  // Dashboard
  async getDashboardStats() {
    return this.get('/dashboard/stats')
  }

  async getSalesAnalytics(filters?: Record<string, any>) {
    return this.get('/dashboard/sales-analytics', filters)
  }

  // Customers
  async getCustomers(params?: Record<string, any>) {
    return this.get('/customers', params)
  }

  async getCustomer(id: number) {
    return this.get(`/customers/${id}`)
  }

  async createCustomer(data: any) {
    return this.post('/customers', data)
  }

  async updateCustomer(id: number, data: any) {
    return this.put(`/customers/${id}`, data)
  }

  async deleteCustomer(id: number) {
    return this.delete(`/customers/${id}`)
  }

  // Products
  async getProducts(params?: Record<string, any>) {
    return this.get('/products', params)
  }

  async getProduct(id: number) {
    return this.get(`/products/${id}`)
  }

  async createProduct(data: any) {
    return this.post('/products', data)
  }

  async updateProduct(id: number, data: any) {
    return this.put(`/products/${id}`, data)
  }

  // PRF Management
  async getPrfs(params?: Record<string, any>) {
    return this.get('/prfs', params)
  }

  async getPrf(id: number) {
    return this.get(`/prfs/${id}`)
  }

  async createPrf(data: any) {
    return this.post('/prfs', data)
  }

  async updatePrf(id: number, data: any) {
    return this.put(`/prfs/${id}`, data)
  }

  async approvePrf(id: number, level: number) {
    return this.post(`/prfs/${id}/approve`, { level })
  }

  async reversePrf(id: number, reason?: string) {
    return this.post(`/prfs/${id}/reverse`, { reason })
  }

  // Substore Management
  async getSubstores(params?: Record<string, any>) {
    return this.get('/substores', params)
  }

  async getSubstore(id: number) {
    return this.get(`/substores/${id}`)
  }

  async createSubstore(data: any) {
    return this.post('/substores', data)
  }

  async updateSubstore(id: number, data: any) {
    return this.put(`/substores/${id}`, data)
  }

  // Substore Transactions
  async getSubstoreTransactions(substoreId: number, params?: Record<string, any>) {
    return this.get(`/substores/${substoreId}/transactions`, params)
  }

  async createSubstoreTransaction(substoreId: number, data: any) {
    return this.post(`/substores/${substoreId}/transactions`, data)
  }

  async approveSubstoreTransaction(transactionId: number, level: number) {
    return this.post(`/substore-transactions/${transactionId}/approve`, { level })
  }

  // Lubebay Management
  async getLubebays(params?: Record<string, any>) {
    return this.get('/lubebays', params)
  }

  async getLubebay(id: number) {
    return this.get(`/lubebays/${id}`)
  }

  async createLubebay(data: any) {
    return this.post('/lubebays', data)
  }

  // Lubebay Service Transactions
  async getLubebayServiceTransactions(lubebayId: number, params?: Record<string, any>) {
    return this.get(`/lubebays/${lubebayId}/service-transactions`, params)
  }

  async createLubebayServiceTransaction(lubebayId: number, data: any) {
    return this.post(`/lubebays/${lubebayId}/service-transactions`, data)
  }

  // Inventory
  async getWarehouseInventory(warehouseId: number, params?: Record<string, any>) {
    return this.get(`/warehouses/${warehouseId}/inventory`, params)
  }

  async getSubstoreInventory(substoreId: number, params?: Record<string, any>) {
    return this.get(`/substores/${substoreId}/inventory`, params)
  }

  async adjustInventory(type: 'warehouse' | 'substore', id: number, data: any) {
    return this.post(`/${type}s/${id}/inventory/adjust`, data)
  }

  // Reports
  async getReport(reportType: string, params?: Record<string, any>) {
    return this.get(`/reports/${reportType}`, params)
  }

  async exportReport(reportType: string, format: 'excel' | 'pdf', params?: Record<string, any>) {
    const response = await this.client.get(`/reports/${reportType}/export`, {
      params: { ...params, format },
      responseType: 'blob',
    })
    return response.data
  }

  // Approvals
  async getPendingApprovals(params?: Record<string, any>) {
    return this.get('/approvals/pending', params)
  }

  async approveItem(approvalId: number, level: number) {
    return this.post(`/approvals/${approvalId}/approve`, { level })
  }

  async rejectItem(approvalId: number, reason: string) {
    return this.post(`/approvals/${approvalId}/reject`, { reason })
  }

  // Master Data
  async getWarehouses() {
    return this.get('/warehouses')
  }

  async getStates() {
    return this.get('/states')
  }

  async getCustomerTypes() {
    return this.get('/customer-types')
  }

  async getExpenseTypes() {
    return this.get('/expense-types')
  }

  async getServices() {
    return this.get('/services')
  }
}

export const api = new ApiClient()