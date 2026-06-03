import { Package, Filter, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface ProductStatsCardsProps {
  productTypeTab: 'all' | 'lubricants' | 'filters'
  totalProducts: number
  activeProducts: number
  lowStockCount: number
  categories: number
  avgMargin: number
}

export function ProductStatsCards({
  productTypeTab,
  totalProducts,
  activeProducts,
  lowStockCount,
  categories,
  avgMargin,
}: ProductStatsCardsProps) {
  const getTitle = () => {
    if (productTypeTab === 'filters') return 'Total Filters'
    if (productTypeTab === 'lubricants') return 'Total Lubricants'
    return 'Total Products'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Total Products */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{getTitle()}</p>
              <p className="text-2xl font-bold text-primary">{totalProducts}</p>
            </div>
            {productTypeTab === 'filters' ? (
              <Filter className="w-8 h-8 text-green-500/60" />
            ) : (
              <Package className="w-8 h-8 text-green-500/60" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Products */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600/60" />
          </div>
        </CardContent>
      </Card>

      {/* Low Stock */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600/60" />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold text-secondary">{categories}</p>
            </div>
            <Package className="w-8 h-8 text-secondary/60" />
          </div>
        </CardContent>
      </Card>

      {/* Average Margin */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Margin</p>
              <p className="text-2xl font-bold text-accent">{avgMargin.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent/60" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
