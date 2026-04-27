'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import apiClient from '@/lib/apiClient'
import { cn } from '@/lib/utils'
import {
  Bell,
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Package,
  TrendingUp,
  X,
  Command,
  Sparkles,
  ShoppingCart,
  CreditCard,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Notification as NotificationAPI, NotificationType, UnreadCount } from '@/types/api'

// Extract results helper
const extractResults = (data: any) => {
  if (Array.isArray(data)) return data
  if (data?.results && Array.isArray(data.results)) return data.results
  return []
}

// Icon mapping for notification types
const getNotificationIcon = (type: NotificationType) => {
  const icons: Record<NotificationType, React.ReactNode> = {
    system: <Bell className="w-4 h-4" />,
    order: <ShoppingCart className="w-4 h-4" />,
    payment: <CreditCard className="w-4 h-4" />,
    inventory: <Package className="w-4 h-4" />,
    alert: <AlertTriangle className="w-4 h-4" />,
    reminder: <Clock className="w-4 h-4" />,
    task: <CheckCircle className="w-4 h-4" />,
    message: <MessageSquare className="w-4 h-4" />,
    promotion: <Star className="w-4 h-4" />,
  }
  return icons[type] || <Bell className="w-4 h-4" />
}

// Relative time helper
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Get notification color based on type
const getNotificationColor = (type: NotificationType) => {
  const colors: Record<NotificationType, string> = {
    system: 'bg-slate-100 text-slate-600',
    order: 'bg-green-100 text-green-600',
    payment: 'bg-green-100 text-green-600',
    inventory: 'bg-green-100 text-green-600',
    alert: 'bg-red-100 text-red-600',
    reminder: 'bg-green-100 text-green-600',
    task: 'bg-green-100 text-green-600',
    message: 'bg-green-100 text-green-600',
    promotion: 'bg-green-100 text-green-600',
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}

interface HeaderProps {
  onToggleSidebar: () => void
}

interface QuickAction {
  label: string
  href: string
  icon: any
  color: string
  shortcut?: string
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch unread count from API
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => apiClient.get<UnreadCount>('/notifications/unread-count/'),
    refetchInterval: 30000,
  })

  // Fetch recent notifications from API
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications-preview'],
    queryFn: () => apiClient.get<NotificationAPI[]>('/notifications/', { status: 'unread' }),
    enabled: showNotifications,
  })

  const unreadCount = unreadCountData?.total ?? 0
  const apiNotifications = extractResults(notificationsData).slice(0, 5)

  const handleLogout = async () => {
    await logout()
    window.location.href = '/auth/login'
  }

  const quickActions: QuickAction[] = [
    { label: 'New PRF', href: '/orders/prf/new', icon: Package, color: 'blue', shortcut: 'Ctrl+P' },
    { label: 'Customer Search', href: '/customers', icon: User, color: 'green', shortcut: 'Ctrl+U' },
    { label: 'Stock Check', href: '/inventory', icon: Activity, color: 'green', shortcut: 'Ctrl+S' },
    { label: 'Financial Report', href: '/finance/reports', icon: TrendingUp, color: 'purple', shortcut: 'Ctrl+R' }
  ]

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Bar */}
            <div className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search anything..."
                  className="w-80 pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-mofad-green focus:border-mofad-green"
                />
                {searchValue && (
                  <button
                    onClick={() => setSearchValue('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Time and Date Display */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
              <Clock className="h-4 w-4 text-gray-500" />
              <div className="text-xs">
                <div className="font-semibold text-gray-900">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </div>
                <div className="text-gray-600">
                  {currentTime.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Quick Actions */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Command className="h-4 w-4" />
              </button>

              {showQuickActions && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-mofad-gold" />
                      Quick Actions
                    </h3>
                  </div>
                  <div className="p-2">
                    {quickActions.map((action, index) => {
                      const IconComponent = action.icon
                      return (
                        <a
                          key={index}
                          href={action.href}
                          className="flex items-center justify-between p-2.5 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-green-50 text-mofad-green">
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{action.label}</span>
                          </div>
                          {action.shortcut && (
                            <kbd className="px-2 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono">
                              {action.shortcut}
                            </kbd>
                          )}
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </div>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {apiNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No new notifications</p>
                      </div>
                    ) : (
                      apiNotifications.map((notification: NotificationAPI) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer",
                            notification.status === 'unread' && "bg-green-50/50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-md flex-shrink-0 ${getNotificationColor(notification.notification_type)}`}>
                              {getNotificationIcon(notification.notification_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 mb-0.5">{notification.title}</p>
                              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getRelativeTime(notification.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <Link
                      href="/notifications"
                      className="block w-full text-sm text-mofad-green hover:text-mofad-green/80 font-medium py-2 px-3 rounded-md hover:bg-gray-50 transition-colors text-center"
                      onClick={() => setShowNotifications(false)}
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-mofad-green rounded-md flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-600">{user?.email || 'admin@mofad.com'}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name || 'User'}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-mofad-green rounded-md flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-gray-600 truncate">{user?.email || 'admin@mofad.com'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <a
                      href="/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-green-50 text-mofad-green">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Profile Settings</span>
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-green-50 text-mofad-green">
                        <Settings className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">System Settings</span>
                    </a>
                    <a
                      href="/help"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-green-50 text-mofad-green">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Help & Support</span>
                    </a>
                  </div>
                  <div className="border-t border-gray-200 p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-red-50 text-red-600">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-red-700">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="lg:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search anything..."
                className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-mofad-green focus:border-mofad-green"
                autoFocus
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showNotifications || showQuickActions) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
            setShowQuickActions(false)
          }}
        />
      )}
    </header>
  )
}
