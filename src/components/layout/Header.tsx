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
    order: 'bg-blue-100 text-blue-600',
    payment: 'bg-green-100 text-green-600',
    inventory: 'bg-orange-100 text-orange-600',
    alert: 'bg-red-100 text-red-600',
    reminder: 'bg-purple-100 text-purple-600',
    task: 'bg-cyan-100 text-cyan-600',
    message: 'bg-indigo-100 text-indigo-600',
    promotion: 'bg-yellow-100 text-yellow-600',
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
    { label: 'Stock Check', href: '/inventory', icon: Activity, color: 'orange', shortcut: 'Ctrl+S' },
    { label: 'Financial Report', href: '/finance/reports', icon: TrendingUp, color: 'purple', shortcut: 'Ctrl+R' }
  ]

  return (
    <header className="relative">
      {/* Background with glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-xl border-b border-white/20 shadow-lg"></div>

      {/* Content */}
      <div className="relative px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            {/* Sidebar Toggle with Modern Design */}
            <button
              onClick={onToggleSidebar}
              className="group relative p-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Menu className="relative h-5 w-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
            </button>

            {/* Enhanced Search Bar */}
            <div className="hidden lg:block relative">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 w-96 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
                  <Search className="h-4 w-4 text-slate-400 mr-3 transition-colors group-hover:text-slate-600" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search anything... ⌘K"
                    className="flex-1 bg-transparent placeholder-slate-400 text-slate-700 text-sm focus:outline-none font-medium"
                  />
                  {searchValue && (
                    <button
                      onClick={() => setSearchValue('')}
                      className="ml-2 p-1 rounded-full hover:bg-white/50 transition-colors"
                    >
                      <X className="h-3 w-3 text-slate-400" />
                    </button>
                  )}
                  <kbd className="hidden xl:inline-flex items-center px-2 py-0.5 ml-2 text-xs font-semibold text-slate-500 bg-white/50 border border-white/30 rounded-lg">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Time and Date Display */}
            <div className="hidden xl:flex items-center space-x-2 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
              <Clock className="h-4 w-4 text-slate-500" />
              <div className="text-sm">
                <div className="font-semibold text-slate-700">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </div>
                <div className="text-xs text-slate-500">
                  {currentTime.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden p-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 shadow-lg"
            >
              <Search className="h-4 w-4 text-slate-600" />
            </button>

            {/* Quick Actions */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="group relative p-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Command className="relative h-4 w-4 text-slate-600 group-hover:text-slate-800 transition-colors" />
              </button>

              {showQuickActions && (
                <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden">
                  <div className="p-4 border-b border-white/20 bg-gradient-to-r from-slate-50 to-blue-50">
                    <h3 className="font-semibold text-slate-800 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
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
                          className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-all duration-200 border border-transparent hover:border-white/30"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                              action.color === 'green' ? 'bg-green-100 text-green-600' :
                              action.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                              action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            } group-hover:scale-110 transition-transform`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{action.label}</span>
                          </div>
                          {action.shortcut && (
                            <kbd className="px-2 py-1 text-xs bg-white/50 border border-white/30 rounded-md text-slate-500 font-mono">
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

            {/* Enhanced Notifications - With Real API */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="group relative p-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Bell className="relative h-4 w-4 text-slate-600 group-hover:text-slate-800 transition-colors" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-xs font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </div>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden">
                  <div className="p-4 border-b border-white/20 bg-gradient-to-r from-slate-50 to-blue-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {apiNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No new notifications</p>
                      </div>
                    ) : (
                      apiNotifications.map((notification: NotificationAPI) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 border-b border-white/10 hover:bg-white/40 transition-colors cursor-pointer relative",
                            notification.status === 'unread' && "bg-blue-50/50"
                          )}
                        >
                          {notification.status === 'unread' && (
                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <div className="flex items-start space-x-3 pl-4">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${getNotificationColor(notification.notification_type)}`}>
                              {getNotificationIcon(notification.notification_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 mb-1">{notification.title}</p>
                              <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-slate-500 mt-2 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {getRelativeTime(notification.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t border-white/20 bg-gradient-to-r from-slate-50 to-blue-50">
                    <Link
                      href="/notifications"
                      className="block w-full text-sm text-blue-600 hover:text-blue-800 font-semibold py-2 px-4 rounded-xl hover:bg-white/60 transition-colors text-center"
                      onClick={() => setShowNotifications(false)}
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="group flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-800">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-500">{user?.email || 'admin@mofad.com'}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden">
                  <div className="p-4 border-b border-white/20 bg-gradient-to-r from-slate-50 to-blue-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-slate-500">{user?.email || 'admin@mofad.com'}</p>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs text-green-600 font-medium">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <a
                      href="/profile"
                      className="group flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/60 transition-all duration-200 border border-transparent hover:border-white/30"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Profile Settings</span>
                    </a>
                    <a
                      href="/settings"
                      className="group flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/60 transition-all duration-200 border border-transparent hover:border-white/30"
                    >
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                        <Settings className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">System Settings</span>
                    </a>
                    <a
                      href="/help"
                      className="group flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/60 transition-all duration-200 border border-transparent hover:border-white/30"
                    >
                      <div className="p-2 rounded-lg bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Help & Support</span>
                    </a>
                  </div>
                  <div className="border-t border-white/20 p-2">
                    <button
                      onClick={handleLogout}
                      className="group w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-200"
                    >
                      <div className="p-2 rounded-lg bg-red-100 text-red-600 group-hover:scale-110 transition-transform">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-red-700 group-hover:text-red-800">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="lg:hidden mt-4 animate-in slide-in-from-top-2 duration-300">
            <div className="relative">
              <div className="flex items-center bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 shadow-lg">
                <Search className="h-4 w-4 text-slate-400 mr-3" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search anything..."
                  className="flex-1 bg-transparent placeholder-slate-400 text-slate-700 text-sm focus:outline-none"
                  autoFocus
                />
                {searchValue && (
                  <button
                    onClick={() => setSearchValue('')}
                    className="ml-2 p-1 rounded-full hover:bg-white/50 transition-colors"
                  >
                    <X className="h-3 w-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showNotifications || showQuickActions) && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
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
