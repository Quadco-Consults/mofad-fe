'use client'

import { useState } from 'react'
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
  DollarSign,
  Car,
  Building2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: FileText,
    children: [
      { label: 'Purchase Requisitions (PRF)', href: '/orders/prf', icon: FileText },
      { label: 'Purchase Orders (PRO)', href: '/orders/pro', icon: ClipboardList },
      { label: 'Pending Approvals', href: '/orders/approvals', icon: ClipboardList },
    ],
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
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
    children: [
      { label: 'Substores', href: '/channels/substores', icon: Building2 },
      { label: 'Substore Transactions (SST)', href: '/channels/substores/transactions', icon: ShoppingCart },
      { label: 'Lubebays', href: '/channels/lubebays', icon: Car },
      { label: 'Lubebay Services (LST)', href: '/channels/lubebays/services', icon: Settings },
    ],
  },
  {
    label: 'Accounts',
    href: '/accounts',
    icon: DollarSign,
    children: [
      { label: 'All Accounts', href: '/accounts', icon: DollarSign },
      { label: 'Account Transactions', href: '/accounts/transactions', icon: TrendingUp },
      { label: 'Lodgements', href: '/accounts/lodgements', icon: DollarSign },
    ],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: TrendingUp,
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
    children: [
      { label: 'User Management', href: '/settings/users', icon: Users },
      { label: 'System Settings', href: '/settings/system', icon: Settings },
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

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.href)
    const Icon = item.icon

    return (
      <div key={item.href}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.href)}
            className={cn(
              'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              depth > 0 && 'ml-4',
              isActive
                ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <Icon className={cn('flex-shrink-0', collapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5')} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              depth > 0 && 'ml-4',
              isActive
                ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <Icon className={cn('flex-shrink-0', collapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5')} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        )}

        {hasChildren && !collapsed && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">MOFAD</h1>
              <p className="text-xs text-gray-500">Distribution System</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map(item => renderNavItem(item))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            &copy; 2024 MOFAD
          </p>
        </div>
      )}
    </div>
  )
}