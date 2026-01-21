'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Settings, Database, Mail, Shield, Globe, Bell, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'

interface SystemSettingsData {
  id: number
  company_name: string
  company_address: string | null
  company_email: string | null
  company_phone: string | null
  company_website: string | null
  tax_id: string | null
  default_timezone: string
  default_currency: string
  currency_symbol: string
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
  maintenance_mode: boolean
  updated_at: string
}

function SystemSettingsPage() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [formData, setFormData] = useState<Partial<SystemSettingsData>>({})

  // Fetch system settings
  const { data: settings, isLoading, error, refetch } = useQuery<SystemSettingsData>({
    queryKey: ['systemSettings'],
    queryFn: () => apiClient.getSystemSettings(),
  })

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<SystemSettingsData>) => apiClient.updateSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] })
      setHasChanges(false)
      addToast({ type: 'success', title: 'Settings saved successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: error.message || 'Failed to save settings' })
    },
  })

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: (email: string) => apiClient.testEmailConfiguration(email),
    onSuccess: (data) => {
      addToast({ type: 'success', title: data.message })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: error.message || 'Failed to send test email' })
    },
  })

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const handleChange = (key: keyof SystemSettingsData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleDiscard = () => {
    if (settings) {
      setFormData(settings)
    }
    setHasChanges(false)
  }

  const handleTestEmail = () => {
    const email = formData.email_from_address || settings?.company_email
    if (email) {
      testEmailMutation.mutate(email)
    } else {
      addToast({ type: 'error', title: 'Please enter an email address first' })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG')
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'backup', name: 'Backup', icon: Database },
    { id: 'integrations', name: 'Integrations', icon: Globe }
  ]

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load system settings. Please try again.</p>
            <Button onClick={() => refetch()} className="mt-2" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure system-wide settings and preferences</p>
          </div>
          <Button
            className="mofad-btn-primary"
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 space-y-2 pr-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-800 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {tab.name}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="mofad-card">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.company_name || ''}
                        onChange={(e) => handleChange('company_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.company_email || ''}
                        onChange={(e) => handleChange('company_email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.company_phone || ''}
                        onChange={(e) => handleChange('company_phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.company_website || ''}
                        onChange={(e) => handleChange('company_website', e.target.value)}
                        placeholder="https://"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.tax_id || ''}
                        onChange={(e) => handleChange('tax_id', e.target.value)}
                        placeholder="Company TIN"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.default_timezone || ''}
                        onChange={(e) => handleChange('default_timezone', e.target.value)}
                      >
                        <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                        <option value="UTC">UTC</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                      value={formData.company_address || ''}
                      onChange={(e) => handleChange('company_address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.date_format || ''}
                        onChange={(e) => handleChange('date_format', e.target.value)}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.default_currency || ''}
                        onChange={(e) => handleChange('default_currency', e.target.value)}
                      >
                        <option value="NGN">NGN ({formData.currency_symbol || '₦'})</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.default_language || ''}
                        onChange={(e) => handleChange('default_language', e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="ha">Hausa</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.email_notifications_enabled || false}
                        onChange={(e) => handleChange('email_notifications_enabled', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.sms_notifications_enabled || false}
                        onChange={(e) => handleChange('sms_notifications_enabled', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-500">Enable browser push notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.push_notifications_enabled || false}
                        onChange={(e) => handleChange('push_notifications_enabled', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Email Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={formData.smtp_host || ''}
                          onChange={(e) => handleChange('smtp_host', e.target.value)}
                          placeholder="smtp.example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={formData.smtp_port || 587}
                          onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={formData.smtp_username || ''}
                          onChange={(e) => handleChange('smtp_username', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={formData.email_from_address || ''}
                          onChange={(e) => handleChange('email_from_address', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="smtp_tls"
                          checked={formData.smtp_use_tls || false}
                          onChange={(e) => handleChange('smtp_use_tls', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="smtp_tls" className="ml-2 text-sm text-gray-700">Use TLS</label>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestEmail}
                        disabled={testEmailMutation.isPending}
                      >
                        {testEmailMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4 mr-2" />
                        )}
                        Test Email
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.session_timeout_minutes || 30}
                        onChange={(e) => handleChange('session_timeout_minutes', parseInt(e.target.value))}
                        min={5}
                        max={480}
                      />
                      <p className="text-xs text-gray-500 mt-1">Between 5 and 480 minutes</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Minimum Length</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.password_min_length || 8}
                        onChange={(e) => handleChange('password_min_length', parseInt(e.target.value))}
                        min={6}
                        max={32}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Password Requirements</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="req_upper"
                          checked={formData.password_require_uppercase || false}
                          onChange={(e) => handleChange('password_require_uppercase', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="req_upper" className="ml-2 text-sm text-gray-700">Require uppercase letters</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="req_lower"
                          checked={formData.password_require_lowercase || false}
                          onChange={(e) => handleChange('password_require_lowercase', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="req_lower" className="ml-2 text-sm text-gray-700">Require lowercase letters</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="req_num"
                          checked={formData.password_require_numbers || false}
                          onChange={(e) => handleChange('password_require_numbers', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="req_num" className="ml-2 text-sm text-gray-700">Require numbers</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="req_special"
                          checked={formData.password_require_special || false}
                          onChange={(e) => handleChange('password_require_special', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="req_special" className="ml-2 text-sm text-gray-700">Require special characters</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Require 2FA for all users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enforce_two_factor || false}
                      onChange={(e) => handleChange('enforce_two_factor', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.max_login_attempts || 5}
                        onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value))}
                        min={3}
                        max={10}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Lockout Duration (minutes)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.lockout_duration_minutes || 15}
                        onChange={(e) => handleChange('lockout_duration_minutes', parseInt(e.target.value))}
                        min={5}
                        max={60}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={formData.password_expiry_days || 90}
                      onChange={(e) => handleChange('password_expiry_days', parseInt(e.target.value))}
                      min={0}
                    />
                    <p className="text-xs text-gray-500 mt-1">Set to 0 for no expiry</p>
                  </div>
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Backup Settings</h3>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Automatic Backup</h4>
                      <p className="text-sm text-gray-500">Enable automatic database backups</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.auto_backup_enabled || false}
                      onChange={(e) => handleChange('auto_backup_enabled', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.backup_frequency || 'daily'}
                        onChange={(e) => handleChange('backup_frequency', e.target.value)}
                        disabled={!formData.auto_backup_enabled}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Time</label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.backup_time || '02:00'}
                        onChange={(e) => handleChange('backup_time', e.target.value)}
                        disabled={!formData.auto_backup_enabled}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={formData.backup_retention_days || 30}
                      onChange={(e) => handleChange('backup_retention_days', parseInt(e.target.value))}
                      disabled={!formData.auto_backup_enabled}
                      min={1}
                    />
                  </div>

                  {settings?.updated_at && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                      <p className="text-sm text-gray-600">{formatDate(settings.updated_at)}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Third-Party Integrations</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMS Provider</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.sms_provider || ''}
                        onChange={(e) => handleChange('sms_provider', e.target.value)}
                        placeholder="e.g., Termii, Twilio"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMS Sender ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.sms_sender_id || ''}
                        onChange={(e) => handleChange('sms_sender_id', e.target.value)}
                        placeholder="Your sender ID"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Business Rules</h4>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Allow Negative Inventory</h4>
                          <p className="text-sm text-gray-500">Allow inventory to go below zero</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.allow_negative_inventory || false}
                          onChange={(e) => handleChange('allow_negative_inventory', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Low Stock Threshold</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={formData.default_low_stock_threshold || 10}
                          onChange={(e) => handleChange('default_low_stock_threshold', parseInt(e.target.value))}
                          min={1}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                          <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.maintenance_mode || false}
                          onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {hasChanges && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-2">You have unsaved changes</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDiscard}>
                  Discard
                </Button>
                <Button
                  size="sm"
                  className="mofad-btn-primary"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default SystemSettingsPage
