'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  Package,
  DollarSign,
  Users,
  Truck,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Building,
  Settings,
  Zap
} from 'lucide-react'

export interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info' | 'urgent'
  category: 'inventory' | 'financial' | 'operations' | 'orders' | 'system' | 'approval'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionable?: boolean
  actionText?: string
  actionUrl?: string
  data?: any
}

interface NotificationSystemProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDismiss: (id: string) => void
  onAction?: (notification: Notification) => void
}

// Notification icons based on category
const getNotificationIcon = (category: string, type: string) => {
  const iconClass = `w-5 h-5 ${
    type === 'success' ? 'text-green-500' :
    type === 'warning' ? 'text-yellow-500' :
    type === 'error' ? 'text-red-500' :
    type === 'urgent' ? 'text-red-600' :
    'text-blue-500'
  }`

  switch (category) {
    case 'inventory':
      return <Package className={iconClass} />
    case 'financial':
      return <DollarSign className={iconClass} />
    case 'operations':
      return <Settings className={iconClass} />
    case 'orders':
      return <ShoppingCart className={iconClass} />
    case 'approval':
      return <CheckCircle className={iconClass} />
    case 'system':
      return <Zap className={iconClass} />
    default:
      return <Info className={iconClass} />
  }
}

// Get notification background color based on type
const getNotificationBg = (type: string, read: boolean) => {
  const opacity = read ? 'opacity-50' : ''

  switch (type) {
    case 'success':
      return `bg-green-50 border-green-200 ${opacity}`
    case 'warning':
      return `bg-yellow-50 border-yellow-200 ${opacity}`
    case 'error':
    case 'urgent':
      return `bg-red-50 border-red-200 ${opacity}`
    default:
      return `bg-blue-50 border-blue-200 ${opacity}`
  }
}

// Priority indicator
const getPriorityDot = (priority: string) => {
  switch (priority) {
    case 'critical':
      return <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
    case 'high':
      return <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
    case 'medium':
      return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
    default:
      return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
  }
}

// Single notification item
function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
  onAction
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  onAction?: (notification: Notification) => void
}) {
  return (
    <Card className={`${getNotificationBg(notification.type, notification.read)} border transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Priority and Icon */}
          <div className="flex flex-col items-center space-y-2">
            {getPriorityDot(notification.priority)}
            {getNotificationIcon(notification.category, notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h4 className={`text-sm font-semibold ${notification.read ? 'text-gray-500' : 'text-gray-900'}`}>
                {notification.title}
              </h4>
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className={`text-sm ${notification.read ? 'text-gray-400' : 'text-gray-700'} mb-3`}>
              {notification.message}
            </p>

            {/* Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{formatDateTime(notification.timestamp).split(',')[1]}</span>
                <span className="capitalize">{notification.category}</span>
                {notification.priority === 'critical' && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                    URGENT
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {notification.actionable && onAction && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => onAction(notification)}
                  >
                    {notification.actionText || 'View'}
                  </Button>
                )}

                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NotificationSystem({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onAction
}: NotificationSystemProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && !notification.read) ||
      (filter === 'urgent' && (notification.type === 'urgent' || notification.priority === 'critical'))

    const matchesCategory =
      categoryFilter === 'all' || notification.category === categoryFilter

    return matchesFilter && matchesCategory
  })

  // Get counts
  const unreadCount = notifications.filter(n => !n.read).length
  const urgentCount = notifications.filter(n => n.type === 'urgent' || n.priority === 'critical').length

  // Get unique categories
  const categories = [...new Set(notifications.map(n => n.category))]

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
        <p className="text-gray-500">All caught up! You have no new notifications.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">
            {unreadCount} unread • {urgentCount} urgent • {notifications.length} total
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={onMarkAllAsRead}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            className={unreadCount > 0 ? 'relative' : ''}
          >
            Unread ({unreadCount})
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </Button>
          <Button
            variant={filter === 'urgent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('urgent')}
            className={urgentCount > 0 ? 'relative' : ''}
          >
            Urgent ({urgentCount})
            {urgentCount > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </Button>
        </div>

        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more notifications.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDismiss={onDismiss}
              onAction={onAction}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'urgent',
      category: 'inventory',
      title: 'Critical Stock Alert',
      message: 'Premium Motor Spirit (PMS) inventory has fallen below critical level. Only 2 days of supply remaining.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      read: false,
      priority: 'critical',
      actionable: true,
      actionText: 'Reorder Now',
      actionUrl: '/inventory/warehouse'
    },
    {
      id: '2',
      type: 'warning',
      category: 'financial',
      title: 'Payment Overdue',
      message: 'Total Oil Nigeria Ltd payment of ₦15.6M is 45 days overdue. Consider follow-up action.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      read: false,
      priority: 'high',
      actionable: true,
      actionText: 'Send Reminder',
      actionUrl: '/reports/financial'
    },
    {
      id: '3',
      type: 'info',
      category: 'orders',
      title: 'New PRF Submitted',
      message: 'PRF-2024-001847 from Mobil Oil Nigeria requires approval. Order value: ₦8.9M',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      read: false,
      priority: 'medium',
      actionable: true,
      actionText: 'Review',
      actionUrl: '/orders/approvals'
    },
    {
      id: '4',
      type: 'success',
      category: 'operations',
      title: 'Delivery Completed',
      message: 'Substore delivery to Lagos Zone 2 completed successfully. 15,000L AGO delivered.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      read: true,
      priority: 'low',
      actionable: false
    },
    {
      id: '5',
      type: 'warning',
      category: 'system',
      title: 'Backup Status Alert',
      message: 'Daily backup completed with warnings. Some files may not have been backed up properly.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      read: false,
      priority: 'medium',
      actionable: true,
      actionText: 'Check Logs',
      actionUrl: '/settings/system'
    },
    {
      id: '6',
      type: 'info',
      category: 'approval',
      title: 'PRO Approved',
      message: 'PRO-2024-000523 for NNPC Retail Ltd has been approved. Purchase value: ₦45.2M',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      read: true,
      priority: 'low',
      actionable: true,
      actionText: 'View Order',
      actionUrl: '/orders/pro'
    }
  ])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    dismiss,
    addNotification,
    unreadCount: notifications.filter(n => !n.read).length,
    urgentCount: notifications.filter(n => n.type === 'urgent' || n.priority === 'critical').length
  }
}