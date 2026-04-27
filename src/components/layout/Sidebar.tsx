'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
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
  AlertTriangle,
  Building,
  BarChart3,
  Droplets
} from 'lucide-react'

// Define user roles for access control
type UserRole = 'admin' | 'manager' | 'accountant' | 'storekeeper' | 'user'

// All roles that have access to most features (not regular users)
const PRIVILEGED_ROLES: UserRole[] = ['admin', 'manager', 'accountant', 'storekeeper']
const ADMIN_ROLES: UserRole[] = ['admin', 'manager']

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
  badge?: string
  isNew?: boolean
  color?: string
  roles?: UserRole[] // If not specified, all authenticated users can see it
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'from-green-600 to-green-700',
    // No role restriction - all authenticated users can see
  },
]

// Navigation sections based on MOFAD screenshot
const navigationSections = [
  {
    title: 'CORE OPERATIONS',
    items: [
      {
        label: 'Orders',
        href: '/orders',
        icon: ShoppingCart,
        color: 'from-gray-500 to-gray-600',
        // No role restriction - all authenticated users can see
        children: [
          { label: 'PRF - Purchase Requisition', href: '/orders/prf', icon: FileText },
          { label: 'PRO - Purchase Request', href: '/orders/pro', icon: ShoppingCart },
        ],
      },
      {
        label: 'Warehouse Operations',
        href: '/inventory/warehouse',
        icon: Warehouse,
        color: 'from-gray-500 to-gray-600',
        // No role restriction - all authenticated users can see
        children: [
          { label: 'Warehouse Overview', href: '/inventory/warehouse', icon: Warehouse },
          { label: 'Stock Transfers', href: '/inventory/transfers', icon: Truck },
        ],
      },
      {
        label: 'Product Inventory',
        href: '/products',
        icon: Box,
        color: 'from-gray-500 to-gray-600',
        // No role restriction - all authenticated users can see
      },
      {
        label: 'Lubebay',
        href: '/channels/lubebays',
        icon: Car,
        color: 'from-gray-500 to-gray-600',
        // No role restriction - all authenticated users can see
        children: [
          { label: 'Lubebays', href: '/channels/lubebays', icon: Car },
          { label: 'All Lodgements', href: '/channels/lubebays/lodgements', icon: DollarSign },
          { label: 'All Expenses', href: '/channels/lubebays/expenses', icon: Receipt },
        ],
      },
      {
        label: 'Car Wash',
        href: '/channels/carwash',
        icon: Droplets,
        color: 'from-green-500 to-green-600',
        // No role restriction - all authenticated users can see
        children: [
          { label: 'Car Washes', href: '/channels/carwash', icon: Droplets },
          { label: 'Expenses', href: '/channels/carwash/expenses', icon: Receipt },
        ],
      },
      {
        label: 'Customers',
        href: '/customers',
        icon: Users,
        color: 'from-gray-500 to-gray-600',
        // No role restriction - all authenticated users can see
      },
      {
        label: 'Suppliers',
        href: '/suppliers',
        icon: Building,
        color: 'from-gray-500 to-gray-600',
        // No role restriction - all authenticated users can see
      },
      {
        label: 'Memo',
        href: '/admin/memo',
        icon: FileCheck,
        color: 'from-gray-500 to-gray-600',
        // No role restriction - all authenticated users can see
      },
      {
        label: 'Lodgements',
        href: '/accounts/lodgements',
        icon: DollarSign,
        color: 'from-gray-500 to-gray-600',
        // No role restriction - all authenticated users can see
      },
      {
        label: 'Reports',
        href: '/reports',
        icon: TrendingUp,
        color: 'from-green-500 to-green-600',
        // No role restriction - all authenticated users can see
        children: [
          { label: 'Current Stock Report', href: '/reports/stock-report', icon: Package },
          { label: 'Financial Reports', href: '/reports/financial', icon: TrendingUp },
          { label: 'Monthly P&L', href: '/reports/monthly', icon: Calendar },
          { label: 'Inventory Analytics', href: '/reports/inventory', icon: BarChart3 },
        ],
      },
    ]
  },
  {
    title: 'FINANCE & ACCOUNTING',
    items: [
      {
        label: 'Finance (SAGE)',
        href: '/finance',
        icon: Calculator,
        color: 'from-gray-500 to-gray-600',
        isNew: true,
        roles: ['admin', 'manager', 'accountant'],
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
        label: 'Accounting Dashboard',
        href: '/accounts',
        icon: BookOpen,
        color: 'from-gray-500 to-gray-600',
        roles: ['admin', 'manager', 'accountant'],
      },
      {
        label: 'Lodgements',
        href: '/accounts/lodgements',
        icon: DollarSign,
        color: 'from-gray-500 to-gray-600',
        // No role restriction - all authenticated users can see
      },
    ]
  },
  {
    title: 'OPERATIONS & HR',
    items: [
      {
        label: 'Payroll Management',
        href: '/hr/payroll',
        icon: Users,
        color: 'from-gray-500 to-gray-600',
        roles: ADMIN_ROLES,
      },
      {
        label: 'Incidents',
        href: '/incidents',
        icon: AlertTriangle,
        color: 'from-gray-500 to-gray-600',
        roles: ADMIN_ROLES,
        children: [
          { label: 'Leakages', href: '/incidents/leakages', icon: AlertTriangle },
          { label: 'Damages', href: '/incidents/damages', icon: AlertTriangle },
          { label: 'Reversal/Return', href: '/accounts/reversals', icon: ArrowUpRight },
        ],
      },
      {
        label: 'Expenses',
        href: '/accounts/expenses',
        icon: Receipt,
        color: 'from-gray-500 to-gray-600',
        roles: ['admin', 'manager', 'accountant'],
      },
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      {
        label: 'Asset Management',
        href: '/admin/inventory-management',
        icon: Box,
        color: 'from-gray-500 to-gray-600',
        roles: ADMIN_ROLES,
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
        color: 'from-gray-500 to-gray-600',
        roles: ADMIN_ROLES,
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
        color: 'from-gray-500 to-gray-600',
        roles: ADMIN_ROLES,
        children: [
          { label: 'Maintenance Schedule', href: '/admin/maintenance/schedule', icon: Calendar },
          { label: 'Work Orders', href: '/admin/maintenance/work-orders', icon: ClipboardList },
          { label: 'Preventive Maintenance', href: '/admin/maintenance/preventive', icon: Wrench },
          { label: 'Equipment History', href: '/admin/maintenance/history', icon: BookOpen },
          { label: 'Service Providers', href: '/admin/maintenance/providers', icon: Users },
        ],
      },
      {
        label: 'Memo',
        href: '/admin/memo',
        icon: FileCheck,
        color: 'from-gray-500 to-gray-600',
        // No role restriction - all authenticated users can see
      },
    ]
  },
  {
    title: 'SYSTEM SETTINGS',
    items: [
      {
        label: 'User & Employee Management',
        href: '/settings/users',
        icon: Users,
        color: 'from-gray-500 to-gray-600',
        roles: ADMIN_ROLES,
        children: [
          { label: 'Users', href: '/settings/users', icon: Users },
          { label: 'Roles and Permissions', href: '/settings/roles', icon: Shield },
          { label: 'Departments', href: '/settings/departments', icon: Building2 },
        ],
      },
      {
        label: 'System Configuration',
        href: '/settings/system',
        icon: Settings,
        color: 'from-gray-500 to-gray-600',
        roles: ADMIN_ROLES,
        children: [
          { label: 'Warehouses', href: '/settings/warehouses', icon: Warehouse },
          { label: 'States', href: '/settings/states', icon: Building2 },
          { label: 'Locations', href: '/settings/locations', icon: MapPin },
          { label: 'Lubebay Catalog', href: '/settings/lubebay-catalog', icon: Wrench },
          { label: 'Expense Types', href: '/settings/expense-types', icon: Receipt },
          { label: 'Audit Logs', href: '/settings/audit-logs', icon: ClipboardCheck },
        ],
      },
    ]
  },
]

interface SidebarProps {
  collapsed: boolean
}

// Helper function to check if user has access to a nav item
const hasAccess = (item: NavItem, userRole: string | undefined): boolean => {
  // If no roles specified, all authenticated users can access
  if (!item.roles || item.roles.length === 0) {
    return true
  }
  // Check if user's role is in the allowed roles
  return item.roles.includes(userRole as UserRole)
}

// Helper function to filter navigation based on user role
const filterNavigation = (items: NavItem[], userRole: string | undefined): NavItem[] => {
  return items
    .filter(item => hasAccess(item, userRole))
    .map(item => ({
      ...item,
      children: item.children ? filterNavigation(item.children, userRole) : undefined
    }))
}

// Helper function to filter navigation sections based on user role
const filterNavigationSections = (sections: any[], userRole: string | undefined) => {
  return sections.map(section => ({
    ...section,
    items: section.items
      .filter((item: NavItem) => hasAccess(item, userRole))
      .map((item: NavItem) => ({
        ...item,
        children: item.children ? filterNavigation(item.children, userRole) : undefined
      }))
  })).filter(section => section.items.length > 0)
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const activeItemRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)

  // Get user role - handle different ways role might be stored
  const userRole = useMemo(() => {
    if (!user) return undefined
    // Check if role is stored directly on user
    if ((user as any).role) return (user as any).role
    // Check if role is in roles array
    if (user.roles && user.roles.length > 0) return user.roles[0].name
    return 'user' // Default to regular user
  }, [user])

  // Filter navigation based on user role
  const filteredNavigation = useMemo(() => {
    return filterNavigation(navigation, userRole)
  }, [userRole])

  // Filter navigation sections based on user role
  const filteredNavigationSections = useMemo(() => {
    return filterNavigationSections(navigationSections, userRole)
  }, [userRole])

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  // Auto-expand active parent
  useEffect(() => {
    // Check main navigation
    filteredNavigation.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child =>
          pathname === child.href || pathname.startsWith(child.href + '/')
        )
        if (hasActiveChild && !expandedItems.includes(item.href)) {
          setExpandedItems(prev => [...prev, item.href])
        }
      }
    })

    // Check navigation sections
    filteredNavigationSections.forEach(section => {
      section.items.forEach((item: NavItem) => {
        if (item.children) {
          const hasActiveChild = item.children.some(child =>
            pathname === child.href || pathname.startsWith(child.href + '/')
          )
          if (hasActiveChild && !expandedItems.includes(item.href)) {
            setExpandedItems(prev => [...prev, item.href])
          }
        }
      })
    })
  }, [pathname, filteredNavigation, filteredNavigationSections])

  // Scroll active item into view when pathname changes
  useEffect(() => {
    if (activeItemRef.current && navRef.current) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        })
      }, 100)
    }
  }, [pathname])

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.href)
    const Icon = item.icon

    return (
      <div key={item.href} ref={isActive ? activeItemRef : null}>
        {/* Main Nav Item */}
        <div
          className={cn(
            "relative group cursor-pointer",
            depth === 0 ? "mb-0.5" : "mb-0.5"
          )}
          onClick={() => hasChildren ? toggleExpanded(item.href) : null}
        >
          <Link
            href={hasChildren ? '#' : item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
              isActive
                ? "bg-mofad-green text-white"
                : "text-gray-700 hover:bg-gray-100",
              depth > 0 && "pl-10 py-2 text-sm"
            )}
            onClick={(e) => hasChildren && e.preventDefault()}
          >
            {/* Icon */}
            <Icon className={cn(
              "flex-shrink-0",
              depth === 0 ? "w-5 h-5" : "w-4 h-4",
              isActive ? "text-white" : "text-gray-600"
            )} />

            {/* Label and badges */}
            {(!collapsed || depth > 0) && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "truncate font-medium",
                    depth === 0 ? "text-sm" : "text-xs"
                  )}>{item.label}</span>
                  {item.isNew && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-mofad-gold text-gray-900 uppercase">
                      <Sparkles className="w-3 h-3" />
                      New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-semibold rounded-full min-w-[20px] px-1.5 py-0.5 text-center">
                      {item.badge}
                    </span>
                  )}

                  {hasChildren && (
                    <ChevronRight className={cn(
                      "transition-transform duration-200 flex-shrink-0 w-4 h-4",
                      isExpanded && "rotate-90",
                      isActive ? "text-white" : "text-gray-400"
                    )} />
                  )}
                </div>
              </div>
            )}
          </Link>

          {/* Tooltip for collapsed state */}
          {collapsed && depth === 0 && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-lg">
              {item.label}
            </div>
          )}
        </div>

        {/* Submenu */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-0.5 mb-1">
            {item.children?.map((child) => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "h-full flex flex-col transition-all duration-300 bg-white border-r border-gray-200",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Logo Area */}
      <div className={cn(
        "flex items-center border-b border-gray-200",
        collapsed ? "px-4 py-5 justify-center" : "px-6 py-5"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img
              src="/modah_logo-removebg-preview.png"
              alt="MOFAD Energy Solutions"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">MOFAD Energy</h1>
              <p className="text-xs text-gray-600">ERP System</p>
            </div>
          </div>
        )}

        {collapsed && (
          <img
            src="/modah_logo-removebg-preview.png"
            alt="MOFAD"
            className="h-10 w-auto"
          />
        )}
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <div className={cn(collapsed ? "px-2" : "px-3")}>
          {/* Render main navigation (Dashboard) */}
          {filteredNavigation.map((item) => renderNavItem(item))}

          {/* Render sectioned navigation */}
          {!collapsed && filteredNavigationSections.map((section, sectionIndex) => (
            <div key={section.title} className={cn("mt-6", sectionIndex === 0 && "mt-5")}>
              {/* Section Header */}
              <div className="px-3 mb-2">
                <h3 className="text-[11px] font-semibold text-mofad-green uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>

              {/* Section Items */}
              <div>
                {section.items.map((item: NavItem) => renderNavItem(item))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-green-50 border border-green-100">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-mofad-green rounded-md flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900">System Status</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <p className="text-xs text-gray-600">Online</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}