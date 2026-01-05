// Unified API client that automatically switches between real and mock API
// Based on the NEXT_PUBLIC_USE_REAL_API environment variable

import mockApi from './mockApi'
import apiClient from './apiClient'

// Use real Django API by default, fallback to mock if needed
const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API !== 'false'

// Export the appropriate client
const api = USE_REAL_API ? apiClient : mockApi

export default api

// Also export individual clients if needed
export { apiClient as realApi, mockApi }

// Export configuration for debugging
export const isUsingMockAPI = !USE_REAL_API
export const API_MODE = USE_REAL_API ? 'REAL' : 'MOCK'

console.log(`🔧 API Mode: ${API_MODE} (NEXT_PUBLIC_USE_REAL_API=${process.env.NEXT_PUBLIC_USE_REAL_API})`)