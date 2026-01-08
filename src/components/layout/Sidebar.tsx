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
  Activity,
  Truck,
  Shield,
  Box,
  Coffee,
  FileCheck,
  FileX,
  Clipboard,
  ClipboardPenLine,
  Wrench,
  Fuel,
  MapPin,
  Calendar,
  AlertTriangle
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
    label: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
    color: 'from-blue-500 to-indigo-500',
    children: [
      { label: 'All Suppliers', href: '/suppliers', icon: Truck },
      { label: 'Supplier Products', href: '/suppliers/products', icon: Package },
      { label: 'Supplier Transactions', href: '/suppliers/transactions', icon: DollarSign },
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
    label: 'Admin',
    href: '/admin',
    icon: Shield,
    color: 'from-red-500 to-rose-500',
    children: [
      {
        label: 'Inventory Management',
        href: '/admin/inventory-management',
        icon: Box,
        children: [
          { label: 'Assets', href: '/admin/inventory-management/assets', icon: Box },
          { label: 'Consumables', href: '/admin/inventory-management/consumables', icon: Coffee },
          { label: 'Item Requisition', href: '/admin/inventory-management/requisitions', icon: ClipboardPenLine },
        ],
      },
      {
        label: 'Fleet Management',
        href: '/admin/fleet-management',
        icon: Truck,
        children: [
          { label: 'Vehicle Registry', href: '/admin/fleet-management/vehicles', icon: Truck },
          { label: 'Fuel Management', href: '/admin/fleet-management/fuel', icon: Fuel },
          { label: 'Vehicle Assignment', href: '/admin/fleet-management/assignments', icon: MapPin },
          { label: 'Trip Logs', href: '/admin/fleet-management/trips', icon: Calendar },
          { label: 'Vehicle Reports', href: '/admin/fleet-management/reports', icon: ClipboardCheck },
        ],
      },
      {
        label: 'Maintenance',
        href: '/admin/maintenance',
        icon: Wrench,
        children: [
          { label: 'Maintenance Schedule', href: '/admin/maintenance/schedule', icon: Calendar },
          { label: 'Work Orders', href: '/admin/maintenance/work-orders', icon: ClipboardList },
          { label: 'Preventive Maintenance', href: '/admin/maintenance/preventive', icon: Wrench },
          { label: 'Equipment History', href: '/admin/maintenance/history', icon: BookOpen },
          { label: 'Service Providers', href: '/admin/maintenance/providers', icon: Users },
        ],
      },
      { label: 'Memo', href: '/admin/memo', icon: FileCheck },
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
  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
    color: 'from-blue-500 to-indigo-500',
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
            depth === 0 ? "mx-2 mb-1.5" : "ml-8 mr-2 mb-1",
            collapsed && depth === 0 ? "justify-center" : "justify-between"
          )}
          onMouseEnter={() => setHoveredItem(item.href)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => hasChildren ? toggleExpanded(item.href) : null}
        >
          {/* Enhanced Background with better shadows */}
          <div className={cn(
            "absolute inset-0 rounded-2xl transition-all duration-500 ease-out",
            isActive
              ? `bg-gradient-to-r ${item.color} shadow-lg shadow-green-500/25 border border-green-400/20`
              : isHovered
                ? "bg-gradient-to-r from-white to-slate-50 shadow-md shadow-slate-200/50 border border-slate-200/40 backdrop-blur-sm"
                : "hover:bg-gradient-to-r hover:from-slate-50/70 hover:to-white hover:shadow-sm hover:border hover:border-slate-200/30"
          )}></div>

          {/* Enhanced Content */}
          <Link
            href={hasChildren ? '#' : item.href}
            className={cn(
              "relative flex items-center w-full rounded-2xl transition-all duration-300",
              isActive ? "text-white" : "text-slate-700 hover:text-slate-900",
              depth === 0 ? "px-4 py-3.5" : "px-3 py-3",
              depth > 0 && "text-sm font-normal"
            )}
            onClick={(e) => hasChildren && e.preventDefault()}
          >
            {/* Enhanced Icon with better styling */}
            <div className={cn(
              "flex items-center justify-center rounded-xl transition-all duration-300 flex-shrink-0",
              isActive
                ? "bg-white/25 text-white shadow-lg shadow-white/25 backdrop-blur-sm border border-white/20"
                : isHovered
                  ? "bg-slate-100/80 text-slate-700 shadow-sm border border-slate-200/50"
                  : "bg-slate-100/40 text-slate-600 border border-transparent",
              depth === 0 ? "w-11 h-11" : "w-8 h-8",
              collapsed && depth === 0 ? "mr-0" : depth > 0 ? "mr-3" : "mr-4"
            )}>
              <Icon className={cn(
                "transition-all duration-300",
                depth === 0 ? "w-5 h-5" : "w-4 h-4",
                isActive && "scale-110"
              )} />
            </div>

            {/* Enhanced Label and badges */}
            {(!collapsed || depth > 0) && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className={cn(
                    "truncate font-medium tracking-wide",
                    depth === 0 ? "text-sm" : "text-xs",
                    isActive ? "font-semibold" : "font-medium"
                  )}>{item.label}</span>
                  {item.isNew && (
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                      <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        NEW
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.badge && (
                    <span className={cn(
                      "bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-full min-w-[20px] text-center shadow-sm border border-red-400/20",
                      depth > 0 ? "text-[10px] px-1.5 py-0.5 min-w-[18px]" : "text-xs px-2 py-1 animate-pulse"
                    )}>
                      {item.badge}
                    </span>
                  )}

                  {hasChildren && (
                    <ChevronRight className={cn(
                      "transition-all duration-300 flex-shrink-0",
                      depth === 0 ? "w-4 h-4" : "w-3.5 h-3.5",
                      isExpanded && "rotate-90",
                      isActive ? "text-white/80" : "text-slate-400 group-hover:text-slate-600"
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

        {/* Enhanced Submenu with better animation and styling */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="overflow-hidden">
            <div className="animate-in slide-in-from-top-2 duration-500 ease-out">
              <div className="relative ml-8 mt-2 mb-3">
                {/* Vertical connecting line */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-slate-300 via-slate-200 to-transparent"></div>

                {/* Submenu items */}
                <div className="space-y-0.5 pl-6">
                  {item.children?.map((child, index) => (
                    <div key={child.href} className="relative">
                      {/* Horizontal connecting line */}
                      <div className="absolute -left-6 top-1/2 w-6 h-px bg-gradient-to-r from-slate-300 to-transparent"></div>

                      {/* Connecting dot */}
                      <div className="absolute -left-7 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-slate-300 rounded-full border-2 border-white shadow-sm"></div>

                      {renderNavItem(child, depth + 1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "relative h-full flex flex-col transition-all duration-300 ease-out",
      "bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 shadow-sm",
      collapsed ? "w-20" : "w-80"
    )}>
      {/* Enhanced Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50/30"></div>

      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Enhanced Logo Area */}
        <div className={cn(
          "flex items-center border-b border-slate-200/50 bg-gradient-to-r from-white to-slate-50/50",
          collapsed ? "px-4 py-6 justify-center" : "px-6 py-6"
        )}>
          <div className="flex items-center gap-3">
            {!collapsed && (
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src="/modah_logo-removebg-preview.png"
                    alt="MOFAD Energy Solutions"
                    className="h-14 w-auto drop-shadow-sm"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                </div>
                <div className="ml-4">
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">MOFAD Energy</h1>
                  <p className="text-sm text-slate-600 font-medium">Enterprise ERP System</p>
                </div>
              </div>
            )}

            {collapsed && (
              <div className="relative">
                <img
                  src="/modah_logo-removebg-preview.png"
                  alt="MOFAD"
                  className="h-10 w-auto drop-shadow-sm"
                />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow-sm animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <div className={cn(
            "space-y-1",
            collapsed ? "px-3" : "px-5"
          )}>
            {navigation.map((item) => renderNavItem(item))}
          </div>
        </nav>

        {/* Enhanced Footer with better design */}
        {!collapsed && (
          <div className="p-5 border-t border-slate-200/50">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-600/10 border border-green-200/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5"></div>
              <div className="relative flex items-center gap-4 p-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm animate-ping"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">System Status</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-green-700 font-medium">All Systems Online</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}