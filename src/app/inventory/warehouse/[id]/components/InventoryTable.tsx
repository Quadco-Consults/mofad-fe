import { Search, Filter, Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { InventoryItem, getStatusBadge, getCategoryColor, getStockLevelIndicator, formatCurrency, getCategoryIcon } from './warehouse-utils'

interface InventoryTableProps {
  items: InventoryItem[]
  isLoading: boolean
  searchTerm: string
  stockFilter: 'all' | 'in-stock' | 'out-of-stock'
  onSearchChange: (value: string) => void
  onStockFilterChange: (value: 'all' | 'in-stock' | 'out-of-stock') => void
  onViewDetails: (item: InventoryItem) => void
  onApproveRestock: (item: InventoryItem) => void
  onDeclineRestock: (item: InventoryItem) => void
}

export function InventoryTable({
  items,
  isLoading,
  searchTerm,
  stockFilter,
  onSearchChange,
  onStockFilterChange,
  onViewDetails,
  onApproveRestock,
  onDeclineRestock,
}: InventoryTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading inventory...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name, code, or category..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
                value={stockFilter}
                onChange={(e) => onStockFilterChange(e.target.value as 'all' | 'in-stock' | 'out-of-stock')}
              >
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock Only</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Product Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Product Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Size</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Current Stock</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Unit Price</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Total Value</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    No inventory items found for this warehouse.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={`${item.product?.id}-${item.id}`}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${item.current_stock === 0 ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {item.product?.code || `ID-${item.id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      <div className="flex items-center gap-2">
                        <div>
                          {item.product?.code && (
                            <div className="text-xs text-gray-500 font-normal">{item.product.code}</div>
                          )}
                          <div>{item.product?.name || 'Unknown Product'}</div>
                        </div>
                        {item.current_stock === 0 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                            Not in warehouse
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {item.product?.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.product?.category || '')}`}>
                        {getCategoryIcon()}
                        {item.product?.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.warehouse?.location || item.warehouse?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span>{item.current_stock?.toLocaleString() || '0'}</span>
                        {getStockLevelIndicator(item.current_stock || 0, item.reorder_level || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(item.unit_cost || item.product?.cost_price || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(item.total_value || 0)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => onViewDetails(item)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {item.status === 'low-stock' && (
                          <>
                            <button
                              onClick={() => onApproveRestock(item)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Approve Restock"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeclineRestock(item)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Mark as Reviewed"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
