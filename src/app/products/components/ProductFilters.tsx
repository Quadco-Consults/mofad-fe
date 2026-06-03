import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface ProductFiltersProps {
  searchTerm: string
  categoryFilter: string
  statusFilter: string
  productTypeTab: 'all' | 'lubricants' | 'filters'
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function ProductFilters({
  searchTerm,
  categoryFilter,
  statusFilter,
  productTypeTab,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
}: ProductFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products by name, code, supplier..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {/* Category Filter */}
            {productTypeTab !== 'filters' && (
              <select
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={categoryFilter}
                onChange={(e) => onCategoryChange(e.target.value)}
              >
                <option value="all">
                  All {productTypeTab === 'lubricants' ? 'Lubricants' : 'Categories'}
                </option>
                {productTypeTab !== 'lubricants' && (
                  <option value="filter">Filters</option>
                )}
                <option value="engine_oil">Engine Oils</option>
                <option value="hydraulic_oil">Hydraulic Oils</option>
                <option value="gear_oil">Gear Oils</option>
                <option value="brake_fluid">Brake Fluids</option>
                <option value="coolant">Coolants</option>
                <option value="grease">Greases</option>
                <option value="transmission">Transmission Fluids</option>
                <option value="specialty_products">Specialty Products</option>
                <option value="service">Services</option>
                <option value="equipment">Equipment</option>
                <option value="other">Other</option>
              </select>
            )}

            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
