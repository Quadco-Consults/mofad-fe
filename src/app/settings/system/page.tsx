'use client'

import { useState } from 'react'
import { Save, Settings, Database, Mail, Shield, Globe, Bell, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface SystemSettings {
  general: {
    companyName: string
    companyEmail: string
    companyPhone: string
    address: string
    timezone: string
    dateFormat: string
    currency: string
    language: string
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    lowStockAlerts: boolean
    paymentAlerts: boolean
    systemMaintenanceAlerts: boolean
  }
  security: {
    sessionTimeout: number
    passwordPolicy: string
    twoFactorAuth: boolean
    loginAttempts: number
    accountLockout: number
  }
  backup: {
    autoBackup: boolean
    backupFrequency: string
    backupRetention: number
    lastBackup: string
  }
  integrations: {
    bankingApi: boolean
    smsProvider: string
    emailProvider: string
    paymentGateway: string
  }
}

const mockSystemSettings: SystemSettings = {
  general: {
    companyName: 'MOFAD Energy Solutions Limited',
    companyEmail: 'info@mofadenergysolutions.com',
    companyPhone: '+234 809 123 4567',
    address: 'Plot 45, Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    timezone: 'Africa/Lagos',
    dateFormat: 'DD/MM/YYYY',
    currency: 'NGN',
    language: 'English'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    lowStockAlerts: true,
    paymentAlerts: true,
    systemMaintenanceAlerts: true
  },
  security: {
    sessionTimeout: 60,
    passwordPolicy: 'strong',
    twoFactorAuth: false,
    loginAttempts: 3,
    accountLockout: 15
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    lastBackup: '2024-12-16T02:00:00Z'
  },
  integrations: {
    bankingApi: true,
    smsProvider: 'Termii',
    emailProvider: 'SendGrid',
    paymentGateway: 'Paystack'
  }
}

function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(mockSystemSettings)
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = () => {
    console.log('Saving settings:', settings)
    setHasChanges(false)
  }

  const handleChange = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasChanges(true)
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
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
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
                        value={settings.general.companyName}
                        onChange={(e) => handleChange('general', 'companyName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.general.companyEmail}
                        onChange={(e) => handleChange('general', 'companyEmail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.general.companyPhone}
                        onChange={(e) => handleChange('general', 'companyPhone', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.general.timezone}
                        onChange={(e) => handleChange('general', 'timezone', e.target.value)}
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
                      value={settings.general.address}
                      onChange={(e) => handleChange('general', 'address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.general.dateFormat}
                        onChange={(e) => handleChange('general', 'dateFormat', e.target.value)}
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
                        value={settings.general.currency}
                        onChange={(e) => handleChange('general', 'currency', e.target.value)}
                      >
                        <option value="NGN">NGN (₦)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.general.language}
                        onChange={(e) => handleChange('general', 'language', e.target.value)}
                      >
                        <option value="English">English</option>
                        <option value="French">French</option>
                        <option value="Hausa">Hausa</option>
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
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
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
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => handleChange('notifications', 'smsNotifications', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Low Stock Alerts</h4>
                        <p className="text-sm text-gray-500">Get notified when inventory is low</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.lowStockAlerts}
                        onChange={(e) => handleChange('notifications', 'lowStockAlerts', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Payment Alerts</h4>
                        <p className="text-sm text-gray-500">Notifications for payment activities</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.paymentAlerts}
                        onChange={(e) => handleChange('notifications', 'paymentAlerts', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
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
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.security.passwordPolicy}
                        onChange={(e) => handleChange('security', 'passwordPolicy', e.target.value)}
                      >
                        <option value="weak">Weak (6+ characters)</option>
                        <option value="medium">Medium (8+ characters, mixed case)</option>
                        <option value="strong">Strong (10+ characters, mixed case, numbers, symbols)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Require 2FA for all users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleChange('security', 'twoFactorAuth', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.security.loginAttempts}
                        onChange={(e) => handleChange('security', 'loginAttempts', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Lockout (minutes)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.security.accountLockout}
                        onChange={(e) => handleChange('security', 'accountLockout', parseInt(e.target.value))}
                      />
                    </div>
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
                      checked={settings.backup.autoBackup}
                      onChange={(e) => handleChange('backup', 'autoBackup', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.backup.backupFrequency}
                        onChange={(e) => handleChange('backup', 'backupFrequency', e.target.value)}
                        disabled={!settings.backup.autoBackup}
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.backup.backupRetention}
                        onChange={(e) => handleChange('backup', 'backupRetention', parseInt(e.target.value))}
                        disabled={!settings.backup.autoBackup}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Last Backup</h4>
                    <p className="text-sm text-gray-600">{formatDate(settings.backup.lastBackup)}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Run Backup Now
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Third-Party Integrations</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMS Provider</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.integrations.smsProvider}
                        onChange={(e) => handleChange('integrations', 'smsProvider', e.target.value)}
                      >
                        <option value="Termii">Termii</option>
                        <option value="Twilio">Twilio</option>
                        <option value="BulkSMS">BulkSMS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={settings.integrations.emailProvider}
                        onChange={(e) => handleChange('integrations', 'emailProvider', e.target.value)}
                      >
                        <option value="SendGrid">SendGrid</option>
                        <option value="Mailgun">Mailgun</option>
                        <option value="AWS SES">AWS SES</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Gateway</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={settings.integrations.paymentGateway}
                      onChange={(e) => handleChange('integrations', 'paymentGateway', e.target.value)}
                    >
                      <option value="Paystack">Paystack</option>
                      <option value="Flutterwave">Flutterwave</option>
                      <option value="Stripe">Stripe</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Banking API Integration</h4>
                      <p className="text-sm text-gray-500">Connect with bank APIs for real-time transaction data</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.integrations.bankingApi}
                      onChange={(e) => handleChange('integrations', 'bankingApi', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
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
                <Button variant="outline" size="sm" onClick={() => setHasChanges(false)}>
                  Discard
                </Button>
                <Button size="sm" className="mofad-btn-primary" onClick={handleSave}>
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