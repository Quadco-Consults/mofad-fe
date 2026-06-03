import {
  Package,
  Droplets,
  Fuel,
  Settings,
  Power,
  Filter,
  TrendingUp,
} from 'lucide-react'
import { ProductFormData } from '@/types/api'

// Category icon mapping
export const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'filter':
    case 'filters':
      return <Filter className="w-5 h-5 text-green-500" />
    case 'lubricants':
    case 'engine_oil':
    case 'engine_oils':
      return <Droplets className="w-5 h-5 text-green-500" />
    case 'hydraulic_oil':
    case 'hydraulics':
    case 'hydraulic_oils':
      return <Settings className="w-5 h-5 text-green-500" />
    case 'transmission':
    case 'transmission_fluids':
      return <Power className="w-5 h-5 text-green-500" />
    case 'specialty_products':
    case 'marine':
      return <Package className="w-5 h-5 text-green-500" />
    case 'service':
      return <TrendingUp className="w-5 h-5 text-green-500" />
    case 'equipment':
      return <Package className="w-5 h-5 text-gray-500" />
    default:
      return <Droplets className="w-5 h-5 text-green-500" />
  }
}

// Category label mapping
export const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    lubricants: 'Lubricants',
    engine_oil: 'Engine Oils',
    engine_oils: 'Engine Oils',
    hydraulic_oil: 'Hydraulic Oils',
    hydraulics: 'Hydraulic Oils',
    hydraulic_oils: 'Hydraulic Oils',
    gear_oil: 'Gear Oils',
    brake_fluid: 'Brake Fluids',
    coolant: 'Coolants',
    grease: 'Greases',
    filter: 'Filters',
    additive: 'Additives',
    transmission: 'Transmission Fluids',
    transmission_fluids: 'Transmission Fluids',
    specialty_products: 'Specialty Products',
    marine: 'Marine Products',
    service: 'Services',
    equipment: 'Equipment',
    other: 'Other',
  }
  return (
    labels[category] ||
    category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  )
}

// Get price from price schemes
export const getPriceFromSchemes = (
  product: any,
  type: 'direct' | 'lubebay' | 'station'
): number => {
  if (!product.price_schemes || !Array.isArray(product.price_schemes)) return 0

  const scheme = product.price_schemes.find((s: any) => {
    const name = (s.name || '').toLowerCase()
    if (type === 'direct') return name.includes('direct')
    if (type === 'lubebay') return name.includes('lubebay') || name.includes('lube')
    if (type === 'station') return name.includes('station')
    return false
  })

  return scheme?.price || 0
}

// Filter subtype detection
export const getFilterSubType = (name: string): string => {
  const lower = name.toLowerCase()
  if (lower.includes('oil filter')) return 'Oil Filter'
  if (lower.includes('air filter')) return 'Air Filter'
  if (lower.includes('cabin') && lower.includes('filter')) return 'Cabin Filter'
  if (lower.includes('fuel filter')) return 'Fuel Filter'
  if (lower.includes('hydraulic') && lower.includes('filter'))
    return 'Hydraulic Filter'
  if (lower.includes('transmission') && lower.includes('filter'))
    return 'Transmission Filter'
  if (lower.includes('oil')) return 'Oil Filter'
  return 'Filter'
}

// Filter subtype badge
export const getFilterSubTypeBadge = (name: string) => {
  const subType = getFilterSubType(name)
  const colors: Record<string, string> = {
    'Oil Filter': 'bg-green-100 text-green-800',
    'Air Filter': 'bg-sky-100 text-sky-800',
    'Cabin Filter': 'bg-teal-100 text-teal-800',
    'Fuel Filter': 'bg-orange-100 text-orange-800',
    'Hydraulic Filter': 'bg-purple-100 text-purple-800',
    'Transmission Filter': 'bg-indigo-100 text-indigo-800',
    Filter: 'bg-gray-100 text-gray-700',
  }
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        colors[subType] || colors['Filter']
      }`}
    >
      {subType}
    </span>
  )
}

// Status badge
export const getStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Active
    </span>
  ) : (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      Inactive
    </span>
  )
}

// Calculate profit margin
export const calculateMargin = (costPrice: number, sellingPrice: number): number => {
  if (!costPrice || costPrice === 0) return 0
  return ((sellingPrice - costPrice) / costPrice) * 100
}

// Initial form data
export const initialFormData: ProductFormData = {
  name: '',
  code: '',
  description: '',
  category: 'engine_oil',
  subcategory: '',
  brand: '',
  package_size: undefined,
  unit_of_measure: 'liters',
  cost_price: 0,
  direct_sales_price: 0,
  tax_rate: 7.5,
  tax_inclusive: false,
  track_inventory: true,
  minimum_stock_level: 0,
  maximum_stock_level: 0,
  reorder_point: 0,
  is_active: true,
  is_sellable: true,
  is_purchasable: true,
  primary_supplier: '',
}

// Filter categories
export const filterCategories = ['filter']
