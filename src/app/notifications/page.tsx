'use client'

import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'
import { Pagination } from '@/components/ui/Pagination'
import {
  Notification,
  NotificationPreference,
  NotificationStats,
  UnreadCount,
  NotificationType,
  NotificationPriority,
} from '@/types/api'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Archive,
  Trash2,
  Search,
  Settings,
  Clock,
  AlertTriangle,
  ShoppingCart,
  CreditCard,
  Package,
  MessageSquare,
  Star,
  RefreshCw,
  MoreVertical,
  X,
  ChevronDown,
  Mail,
  Smartphone,
  Volume2,
  Moon,
  Inbox,
  Filter,
  Loader2,
  Info,
  CheckCircle,
  Zap,
} from 'lucide-react'

// Utility function for relative time
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

// Extract results helper for paginated responses
const extractResults = (data: any) => {
  if (Array.isArray(data)) return data
  if (data?.results && Array.isArray(data.results)) return data.results
  return []
}

// Icon mapping for notification types
const getNotificationIcon = (type: NotificationType) => {
  const icons: Record<NotificationType, React.ReactNode> = {
    system: <Bell className="w-5 h-5" />,
    order: <ShoppingCart className="w-5 h-5" />,
    payment: <CreditCard className="w-5 h-5" />,
    inventory: <Package className="w-5 h-5" />,
    alert: <AlertTriangle className="w-5 h-5" />,
    reminder: <Clock className="w-5 h-5" />,
    task: <CheckCircle className="w-5 h-5" />,
    message: <MessageSquare className="w-5 h-5" />,
    promotion: <Star className="w-5 h-5" />,
  }
  return icons[type] || <Bell className="w-5 h-5" />
}

// Color mapping for notification types
const getTypeColor = (type: NotificationType) => {
  const colors: Record<NotificationType, string> = {
    system: 'bg-slate-100 text-slate-600',
    order: 'bg-blue-50 text-blue-600',
    payment: 'bg-emerald-50 text-emerald-600',
    inventory: 'bg-amber-50 text-amber-600',
    alert: 'bg-red-50 text-red-600',
    reminder: 'bg-purple-50 text-purple-600',
    task: 'bg-cyan-50 text-cyan-600',
    message: 'bg-indigo-50 text-indigo-600',
    promotion: 'bg-yellow-50 text-yellow-600',
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}

// Priority colors
const getPriorityStyles = (priority: NotificationPriority) => {
  const styles: Record<NotificationPriority, { dot: string; badge: string; text: string }> = {
    urgent: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 border-red-200', text: 'Urgent' },
    high: { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200', text: 'High' },
    medium: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 border-blue-200', text: 'Medium' },
    low: { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600 border-gray-200', text: 'Low' },
  }
  return styles[priority] || styles.medium
}

type TabFilter = 'all' | 'unread' | 'read' | 'archived'

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // State
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showActionsFor, setShowActionsFor] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Fetch notifications
  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ['notifications', activeTab, typeFilter, priorityFilter, searchTerm],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (activeTab === 'unread') params.status = 'unread'
      if (activeTab === 'read') params.status = 'read'
      if (activeTab === 'archived') params.status = 'archived'
      if (typeFilter !== 'all') params.notification_type = typeFilter
      if (priorityFilter !== 'all') params.priority = priorityFilter
      if (searchTerm) params.search = searchTerm
      return apiClient.get<Notification[]>('/notifications/', params)
    },
  })

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => apiClient.get<UnreadCount>('/notifications/unread-count/'),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['notifications-stats'],
    queryFn: () => apiClient.get<NotificationStats>('/notifications/stats/'),
  })

  // Fetch preferences
  const { data: preferencesData } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => apiClient.get<NotificationPreference>('/notification-preferences/me/'),
  })

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/notifications/${id}/mark-read/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] })
    },
  })

  const markUnreadMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/notifications/${id}/mark-unread/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/notifications/${id}/archive/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] })
      addToast({ type: 'success', title: 'Archived', message: 'Notification archived' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/notifications/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] })
      addToast({ type: 'success', title: 'Deleted', message: 'Notification deleted' })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.post('/notifications/mark-all-read/'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] })
      addToast({ type: 'success', title: 'Done', message: 'All notifications marked as read' })
    },
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: Partial<NotificationPreference>) =>
      apiClient.patch('/notification-preferences/me/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      addToast({ type: 'success', title: 'Saved', message: 'Preferences updated' })
    },
  })

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, typeFilter, priorityFilter, searchTerm])

  // Data processing
  const allNotifications = useMemo(() => extractResults(notificationsData), [notificationsData])
  const unreadCount = unreadCountData?.total ?? 0
  const stats = statsData

  // Pagination calculations
  const totalCount = allNotifications.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const notifications = allNotifications.slice(startIndex, startIndex + pageSize)

  // Today's notifications count (from all data, not paginated)
  const todaysCount = useMemo(() => {
    const today = new Date().toDateString()
    return allNotifications.filter(
      (n: Notification) => new Date(n.created_at).toDateString() === today
    ).length
  }, [allNotifications])

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: stats?.total ?? 0,
    unread: stats?.unread ?? 0,
    read: stats?.read ?? 0,
    archived: stats?.archived ?? 0,
  }), [stats])

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'read', label: 'Read' },
    { key: 'archived', label: 'Archived' },
  ]

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'unread') {
      markReadMutation.mutate(notification.id)
    }
    setExpandedId(expandedId === notification.id ? null : notification.id)
  }

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Elegant Header Section */}
        <div className="relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl" />
          <div className="relative px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Bell className="w-7 h-7 text-white" />
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Notifications
                  </h1>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    Stay updated with your latest activities
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    className="gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats?.total ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Inbox className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Unread</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats?.unread ?? 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Today</p>
                  <p className="text-3xl font-bold text-secondary mt-1">{todaysCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Archived</p>
                  <p className="text-3xl font-bold text-gray-500 mt-1">{stats?.archived ?? 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Archive className="w-6 h-6 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                      ${activeTab === tab.key
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    {tab.label}
                    {tabCounts[tab.key] > 0 && (
                      <span className={`
                        ml-2 px-1.5 py-0.5 text-xs rounded-full
                        ${activeTab === tab.key
                          ? 'bg-primary/10 text-primary'
                          : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {tabCounts[tab.key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search and Filters */}
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="system">System</option>
                    <option value="order">Orders</option>
                    <option value="payment">Payments</option>
                    <option value="inventory">Inventory</option>
                    <option value="alert">Alerts</option>
                    <option value="reminder">Reminders</option>
                    <option value="task">Tasks</option>
                    <option value="message">Messages</option>
                    <option value="promotion">Promotions</option>
                  </select>

                  <select
                    className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading Skeletons
            [...Array(5)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="animate-pulse flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : notifications.length === 0 ? (
            // Empty State
            <Card className="overflow-hidden">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <BellOff className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No notifications
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all'
                    ? "No notifications match your current filters. Try adjusting your search criteria."
                    : "You're all caught up! New notifications will appear here."}
                </p>
              </CardContent>
            </Card>
          ) : (
            // Notification Cards
            notifications.map((notification: Notification, index: number) => {
              const priorityStyles = getPriorityStyles(notification.priority)
              const isExpanded = expandedId === notification.id
              const isUnread = notification.status === 'unread'

              return (
                <Card
                  key={notification.id}
                  className={`
                    group overflow-hidden transition-all duration-300 cursor-pointer
                    hover:shadow-lg hover:-translate-y-0.5
                    ${isUnread ? 'bg-primary/[0.02] border-l-4 border-l-primary' : ''}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                        transition-transform group-hover:scale-105
                        ${getTypeColor(notification.notification_type)}
                      `}>
                        {getNotificationIcon(notification.notification_type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`
                                text-sm font-semibold truncate
                                ${isUnread ? 'text-foreground' : 'text-muted-foreground'}
                              `}>
                                {notification.title}
                              </h3>
                              {/* Priority Badge */}
                              {notification.priority !== 'low' && (
                                <span className={`
                                  inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border
                                  ${priorityStyles.badge}
                                `}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${priorityStyles.dot}`} />
                                  {priorityStyles.text}
                                </span>
                              )}
                              {/* Unread indicator */}
                              {isUnread && (
                                <span className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className={`
                              text-sm mt-1 transition-all
                              ${isExpanded ? '' : 'line-clamp-2'}
                              ${isUnread ? 'text-foreground/80' : 'text-muted-foreground'}
                            `}>
                              {notification.message}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {getRelativeTime(notification.created_at)}
                            </span>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowActionsFor(showActionsFor === notification.id ? null : notification.id)
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>

                              {/* Dropdown Menu */}
                              {showActionsFor === notification.id && (
                                <div
                                  className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-10"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {notification.status === 'unread' ? (
                                    <button
                                      onClick={() => {
                                        markReadMutation.mutate(notification.id)
                                        setShowActionsFor(null)
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Check className="w-4 h-4" />
                                      Mark as read
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        markUnreadMutation.mutate(notification.id)
                                        setShowActionsFor(null)
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Bell className="w-4 h-4" />
                                      Mark as unread
                                    </button>
                                  )}
                                  {notification.status !== 'archived' && (
                                    <button
                                      onClick={() => {
                                        archiveMutation.mutate(notification.id)
                                        setShowActionsFor(null)
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Archive className="w-4 h-4" />
                                      Archive
                                    </button>
                                  )}
                                  <div className="my-1 border-t border-gray-100" />
                                  <button
                                    onClick={() => {
                                      deleteMutation.mutate(notification.id)
                                      setShowActionsFor(null)
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(notification.created_at).toLocaleString()}
                              </span>
                              {notification.sender_name && (
                                <span className="flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  From: {notification.sender_name}
                                </span>
                              )}
                            </div>
                            {notification.action_url && (
                              <a
                                href={notification.action_url}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                              >
                                View Details
                                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalCount > 0 && (
          <div className="mofad-card mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Notification Settings
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Customize how you receive notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Master Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Enable Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Turn all notifications on or off
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferencesData?.notifications_enabled ?? true}
                      onChange={(e) =>
                        updatePreferencesMutation.mutate({
                          notifications_enabled: e.target.checked,
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Channel Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Notification Channels
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">Email</p>
                          <p className="text-xs text-muted-foreground">Receive via email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={preferencesData?.email_notifications ?? true}
                          onChange={(e) =>
                            updatePreferencesMutation.mutate({
                              email_notifications: e.target.checked,
                            })
                          }
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">SMS</p>
                          <p className="text-xs text-muted-foreground">Receive via SMS</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={preferencesData?.sms_notifications ?? false}
                          onChange={(e) =>
                            updatePreferencesMutation.mutate({
                              sms_notifications: e.target.checked,
                            })
                          }
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                          <Volume2 className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">Push</p>
                          <p className="text-xs text-muted-foreground">Browser notifications</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={preferencesData?.push_notifications ?? true}
                          onChange={(e) =>
                            updatePreferencesMutation.mutate({
                              push_notifications: e.target.checked,
                            })
                          }
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Quiet Hours */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Quiet Hours
                  </h3>

                  <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Moon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Enable Quiet Hours</p>
                        <p className="text-xs text-muted-foreground">
                          Mute notifications during set times
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={preferencesData?.quiet_hours_enabled ?? false}
                        onChange={(e) =>
                          updatePreferencesMutation.mutate({
                            quiet_hours_enabled: e.target.checked,
                          })
                        }
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50/50 rounded-b-2xl">
                <Button
                  onClick={() => setShowSettings(false)}
                  className="w-full mofad-btn-primary"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {showActionsFor !== null && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowActionsFor(null)}
          />
        )}
      </div>
    </AppLayout>
  )
}
