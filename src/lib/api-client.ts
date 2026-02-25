// Unified API client - now only uses the real Django API
import apiClient from './apiClient'

// Export the API client
export default apiClient

// Also export as realApi for backward compatibility
export { apiClient as realApi }

// Export configuration for debugging
export const isUsingMockAPI = false
export const API_MODE = 'REAL'

// Only log in development
if (process.env.NODE_ENV === 'development') {
  console.log(`🔧 Unified API Client - Mode: ${API_MODE}`)
}
