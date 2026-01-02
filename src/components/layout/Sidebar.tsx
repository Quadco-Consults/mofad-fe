'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ShoppingCart,
  Warehouse,
  TrendingUp,
  Settings,
  ClipboardList,
  ClipboardCheck,
  DollarSign,
  Car,
  Building2,
  ChevronDown,
  ChevronRight,
  Bell,
  Calculator,
  BookOpen,
  Receipt,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  Activity
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
  badge?: string
  isNew?: boolean
  color?: string
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'from-emerald-600 to-green-600'
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: FileText,
    color: 'from-emerald-500 to-teal-500',
    children: [
      { label: 'Purchase Requisitions', href: '/orders/prf', icon: FileText, badge: '12' },
      { label: 'Purchase Orders', href: '/orders/pro', icon: ClipboardList, badge: '8' },
      { label: 'Pending Approvals', href: '/orders/approvals', icon: ClipboardList, badge: '5' },
    ],
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
    color: 'from-purple-500 to-violet-500',
    children: [
      { label: 'All Customers', href: '/customers', icon: Users },
      { label: 'Customer Types', href: '/customers/types', icon: Users },
      { label: 'Customer Transactions', href: '/customers/transactions', icon: DollarSign },
    ],
  },
  {
    label: 'Products',
    href: '/products',
    icon: Package,
    color: 'from-orange-500 to-red-500',
    children: [
      { label: 'All Products', href: '/products', icon: Package },
      { label: 'Price Schemes', href: '/products/pricing', icon: DollarSign },
      { label: 'Services', href: '/products/services', icon: Settings },
    ],
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Warehouse,
    color: 'from-indigo-500 to-purple-500',
    children: [
      { label: 'Warehouse Inventory', href: '/inventory/warehouse', icon: Warehouse },
      { label: 'Substore Inventory', href: '/inventory/substore', icon: Building2 },
      { label: 'Stock Transactions', href: '/inventory/transactions', icon: TrendingUp },
      { label: 'Stock Transfers', href: '/inventory/transfers', icon: ShoppingCart },
    ],
  },
  {
    label: 'Sales Channels',
    href: '/channels',
    icon: Building2,
    color: 'from-pink-500 to-rose-500',
    children: [
      { label: 'Substores', href: '/channels/substores', icon: Building2 },
      { label: 'Substore Transactions', href: '/channels/substores/transactions', icon: ShoppingCart },
      { label: 'Lubebays', href: '/channels/lubebays', icon: Car },
      { label: 'Lubebay Services', href: '/channels/lubebays/services', icon: Settings },
    ],
  },
  {
    label: 'Accounts',
    href: '/accounts',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    children: [
      { label: 'All Accounts', href: '/accounts', icon: DollarSign },
      { label: 'Account Transactions', href: '/accounts/transactions', icon: TrendingUp },
      { label: 'Lodgements', href: '/accounts/lodgements', icon: DollarSign },
    ],
  },
  {
    label: 'Finance (SAGE)',
    href: '/finance',
    icon: Calculator,
    color: 'from-amber-500 to-yellow-500',
    isNew: true,
    children: [
      { label: 'Financial Dashboard', href: '/finance', icon: Calculator },
      { label: 'General Ledger', href: '/finance/general-ledger', icon: BookOpen },
      { label: 'Accounts Receivable', href: '/finance/receivables', icon: Receipt },
      { label: 'Accounts Payable', href: '/finance/payables', icon: CreditCard },
      { label: 'Cash Flow Analysis', href: '/finance/cash-flow', icon: TrendingUp },
      { label: 'Budget Management', href: '/finance/budget', icon: DollarSign },
    ],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: TrendingUp,
    color: 'from-cyan-500 to-blue-500',
    children: [
      { label: 'Sales Reports', href: '/reports/sales', icon: TrendingUp },
      { label: 'Inventory Reports', href: '/reports/inventory', icon: Warehouse },
      { label: 'Financial Reports', href: '/reports/financial', icon: DollarSign },
      { label: 'Customer Reports', href: '/reports/customers', icon: Users },
    ],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    color: 'from-slate-500 to-gray-500',
    children: [
      { label: 'User Management', href: '/settings/users', icon: Users },
      { label: 'System Settings', href: '/settings/system', icon: Settings },
      { label: 'Audit Logs', href: '/settings/audit-logs', icon: ClipboardCheck },
      { label: 'Warehouses', href: '/settings/warehouses', icon: Warehouse },
      { label: 'States', href: '/settings/states', icon: Building2 },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  // Auto-expand active parent
  useEffect(() => {
    navigation.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child =>
          pathname === child.href || pathname.startsWith(child.href + '/')
        )
        if (hasActiveChild && !expandedItems.includes(item.href)) {
          setExpandedItems(prev => [...prev, item.href])
        }
      }
    })
  }, [pathname])

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.href)
    const Icon = item.icon
    const isHovered = hoveredItem === item.href

    return (
      <div key={item.href} className="relative group">
        {/* Main Nav Item */}
        <div
          className={cn(
            "relative flex items-center group cursor-pointer transition-all duration-300 ease-out",
            depth === 0 ? "mx-3 mb-1" : "ml-6 mr-3 mb-1",
            collapsed && depth === 0 ? "justify-center" : "justify-between"
          )}
          onMouseEnter={() => setHoveredItem(item.href)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => hasChildren ? toggleExpanded(item.href) : null}
        >
          {/* Background with gradient and glassmorphism */}
          <div className={cn(
            "absolute inset-0 rounded-2xl transition-all duration-500 ease-out",
            isActive
              ? `bg-gradient-to-r ${item.color} shadow-lg shadow-current/25`
              : isHovered
                ? "bg-white/60 backdrop-blur-sm shadow-lg shadow-black/5 border border-white/20"
                : "hover:bg-white/40 hover:backdrop-blur-sm"
          )}></div>

          {/* Content */}
          <Link
            href={hasChildren ? '#' : item.href}
            className={cn(
              "relative flex items-center w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300",
              isActive ? "text-white" : "text-slate-700 hover:text-slate-900",
              depth > 0 && "pl-6 text-xs"
            )}
            onClick={(e) => hasChildren && e.preventDefault()}
          >
            {/* Icon with gradient background */}
            <div className={cn(
              "flex items-center justify-center rounded-xl transition-all duration-300",
              isActive
                ? "bg-white/20 text-white shadow-lg"
                : "bg-transparent text-slate-600",
              depth === 0 ? "w-10 h-10" : "w-8 h-8",
              collapsed && depth === 0 ? "mr-0" : "mr-3"
            )}>
              <Icon className={cn(
                "transition-all duration-300",
                depth === 0 ? "w-5 h-5" : "w-4 h-4",
                isActive && "animate-pulse"
              )} />
            </div>

            {/* Label and badges */}
            {(!collapsed || depth > 0) && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate">{item.label}</span>
                  {item.isNew && (
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-1.5 py-0.5 rounded-full font-bold">
                        NEW
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {hasChildren && (
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-all duration-300",
                      isExpanded && "rotate-90",
                      isActive ? "text-white" : "text-slate-400"
                    )} />
                  )}
                </div>
              </div>
            )}
          </Link>

          {/* Tooltip for collapsed state */}
          {collapsed && depth === 0 && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl">
              {item.label}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
            </div>
          )}
        </div>

        {/* Submenu with smooth animation */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="overflow-hidden">
            <div className="animate-in slide-in-from-top-2 duration-300 ease-out">
              <div className="ml-3 border-l-2 border-slate-200/50 pl-4 py-2 space-y-1">
                {item.children?.map((child) => renderNavItem(child, depth + 1))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "relative h-full flex flex-col transition-all duration-300 ease-out bg-white border-r border-gray-200",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Clean White Background */}
      <div className="absolute inset-0 bg-white"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Logo Area */}
        <div className="flex items-center px-6 py-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>

            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">MOFAD</h1>
                <p className="text-xs text-gray-500">Enterprise ERP</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 space-y-2">
            {navigation.map((item) => renderNavItem(item))}
          </div>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-white/20">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700">System Status</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span>Online</span>
                  <ArrowUpRight className="w-3 h-3" />
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}