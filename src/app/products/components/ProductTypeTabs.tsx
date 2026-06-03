import { Package, Droplets, Filter } from 'lucide-react'

interface ProductTypeTabsProps {
  activeTab: 'all' | 'lubricants' | 'filters'
  totalCount: number
  onTabChange: (tab: 'all' | 'lubricants' | 'filters') => void
}

export function ProductTypeTabs({
  activeTab,
  totalCount,
  onTabChange,
}: ProductTypeTabsProps) {
  const tabClass = (tab: string) =>
    `flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-green-500 text-green-600 bg-green-50/50'
        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
    }`

  const countClass = (tab: string) =>
    `ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
      activeTab === tab ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
    }`

  return (
    <div className="border-b border-border">
      <nav className="flex space-x-1" aria-label="Product type tabs">
        {/* All Products Tab */}
        <button onClick={() => onTabChange('all')} className={tabClass('all')}>
          <Package className="w-4 h-4" />
          All Products
          <span className={countClass('all')}>{totalCount}</span>
        </button>

        {/* Lubricants Tab */}
        <button
          onClick={() => onTabChange('lubricants')}
          className={tabClass('lubricants')}
        >
          <Droplets className="w-4 h-4" />
          Lubricants
        </button>

        {/* Filters Tab */}
        <button onClick={() => onTabChange('filters')} className={tabClass('filters')}>
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </nav>
    </div>
  )
}
