import { Product } from '@/types/api'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Card, CardContent } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import {
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Package,
  Filter,
  Plus,
  Loader2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  getCategoryIcon,
  getCategoryLabel,
  getFilterSubTypeBadge,
  getStatusBadge,
  getPriceFromSchemes,
} from './product-utils'

interface ProductTableProps {
  products: Product[]
  isLoading: boolean
  productTypeTab: 'all' | 'lubricants' | 'filters'
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  searchTerm: string
  categoryFilter: string
  statusFilter: string
  selection: {
    isAllSelected: (items: Product[]) => boolean
    isPartiallySelected: (items: Product[]) => boolean
    isSelected: (id: number | string) => boolean
    toggleAll: (items: Product[]) => void
    toggle: (id: number | string) => void
  }
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onToggleStatus: (product: Product) => void
  onPageChange: (page: number) => void
  onAdd: () => void
  isTogglingStatus: boolean
}

export function ProductTable({
  products,
  isLoading,
  productTypeTab,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  searchTerm,
  categoryFilter,
  statusFilter,
  selection,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange,
  onAdd,
  isTogglingStatus,
}: ProductTableProps) {
  // Loading State
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty State
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          {productTypeTab === 'filters' ? (
            <Filter className="w-12 h-12 text-green-400 mx-auto mb-4" />
          ) : (
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {productTypeTab === 'filters'
              ? 'No filters found'
              : productTypeTab === 'lubricants'
              ? 'No lubricants found'
              : 'No products found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : `Get started by adding your first ${
                  productTypeTab === 'filters'
                    ? 'filter product'
                    : productTypeTab === 'lubricants'
                    ? 'lubricant'
                    : 'product'
                }`}
          </p>
          <Button className="mofad-btn-primary" onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            {productTypeTab === 'filters' ? 'Add Filter' : 'Add Product'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Table with Data
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-12 py-3 px-4">
                  <Checkbox
                    checked={selection.isAllSelected(products)}
                    indeterminate={selection.isPartiallySelected(products)}
                    onChange={() => selection.toggleAll(products)}
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Product
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Brand</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Package Size
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Cost Price
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Direct (Wholesale)
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  LubeBay
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Station (Retail)
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Stock</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">
                  Status
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-gray-50 ${
                    selection.isSelected(product.id) ? 'bg-primary-50' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selection.isSelected(product.id)}
                      onChange={() => selection.toggle(product.id)}
                    />
                  </td>

                  {/* Product Name & Icon */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {getCategoryIcon(product.category)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        {productTypeTab === 'filters' ? (
                          <div className="mt-0.5">{getFilterSubTypeBadge(product.name)}</div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {(product as any).viscosity_grade}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Code */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-gray-700">{product.code}</span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">
                      {getCategoryLabel(product.category)}
                    </span>
                  </td>

                  {/* Brand */}
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700 capitalize">
                      {product.brand || '-'}
                    </span>
                  </td>

                  {/* Package Size */}
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-700">
                      {product.package_size ? (
                        <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                          {product.package_size}
                          {product.unit_of_measure === 'liters'
                            ? 'L'
                            : product.unit_of_measure === 'gallons'
                            ? 'gal'
                            : product.unit_of_measure === 'kilograms'
                            ? 'kg'
                            : 'pc'}
                        </span>
                      ) : (product as any).bulk_size || (product as any).retail_size ? (
                        <span className="flex flex-wrap gap-1">
                          {(product as any).retail_size && (
                            <span className="inline-block px-2 py-0.5 bg-blue-100 rounded text-xs font-medium">
                              {(product as any).retail_size}
                              {product.unit_of_measure === 'liters'
                                ? 'L'
                                : product.unit_of_measure === 'gallons'
                                ? 'gal'
                                : 'kg'}
                            </span>
                          )}
                          {(product as any).bulk_size && (
                            <span className="inline-block px-2 py-0.5 bg-green-100 rounded text-xs font-medium">
                              {(product as any).bulk_size}
                              {product.unit_of_measure === 'liters'
                                ? 'L'
                                : product.unit_of_measure === 'gallons'
                                ? 'gal'
                                : 'kg'}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>

                  {/* Cost Price */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-medium text-gray-700">
                      {formatCurrency(product.cost_price)}
                    </span>
                  </td>

                  {/* Direct (Wholesale) Price */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(getPriceFromSchemes(product, 'direct'))}
                    </span>
                  </td>

                  {/* LubeBay Price */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(getPriceFromSchemes(product, 'lubebay'))}
                    </span>
                  </td>

                  {/* Station (Retail) Price */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-primary">
                      {formatCurrency(getPriceFromSchemes(product, 'station'))}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4 text-center">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">0</div>
                      <div className="text-gray-500">Min: {product.minimum_stock_level}</div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">{getStatusBadge(product.is_active)}</td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onView(product)}
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onEdit(product)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onToggleStatus(product)}
                        disabled={isTogglingStatus}
                        title={product.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {isTogglingStatus ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : product.is_active ? (
                          <PowerOff className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <Power className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onDelete(product)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={onPageChange}
            className="border-t"
          />
        )}
      </CardContent>
    </Card>
  )
}
