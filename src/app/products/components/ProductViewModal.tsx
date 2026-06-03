import { useState } from 'react'
import { Product } from '@/types/api'
import { Button } from '@/components/ui/Button'
import { X, Edit, FileText, Package } from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import {
  getCategoryIcon,
  getCategoryLabel,
  getStatusBadge,
  calculateMargin,
} from './product-utils'
import { BinCardView, BinCardData } from './BinCardView'

interface ProductViewModalProps {
  product: Product
  warehouses: Array<{ id: number; name: string; code: string }>
  binCardData: BinCardData | null
  binCardLoading: boolean
  binCardError: any
  selectedWarehouseId: number | null
  onClose: () => void
  onEdit: () => void
  onWarehouseChange: (warehouseId: number | null) => void
}

export function ProductViewModal({
  product,
  warehouses,
  binCardData,
  binCardLoading,
  binCardError,
  selectedWarehouseId,
  onClose,
  onEdit,
  onWarehouseChange,
}: ProductViewModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'bincard'>('details')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {getCategoryIcon(product.category)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-muted-foreground font-mono">{product.code}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Product Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bincard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bincard'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Bin Card
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Status and Last Updated */}
              <div className="flex items-center gap-2">
                {getStatusBadge(product.is_active)}
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">
                  Last updated: {formatDateTime(product.updated_at)}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900 mt-1">{product.description}</p>
                </div>
              )}

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-gray-900">{getCategoryLabel(product.category)}</p>
                  </div>
                  {product.subcategory && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Subcategory
                      </label>
                      <p className="text-gray-900">{product.subcategory}</p>
                    </div>
                  )}
                  {product.brand && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Brand</label>
                      <p className="text-gray-900">{product.brand}</p>
                    </div>
                  )}
                  {product.package_size && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Package Size
                      </label>
                      <p className="text-gray-900">
                        {product.package_size} {product.unit_of_measure}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Unit of Measure
                    </label>
                    <p className="text-gray-900 capitalize">{product.unit_of_measure}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {product.primary_supplier && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Primary Supplier
                      </label>
                      <p className="text-gray-900">{product.primary_supplier}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Is Sellable</label>
                    <p className="text-gray-900">
                      {product.is_sellable ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Is Purchasable
                    </label>
                    <p className="text-gray-900">
                      {product.is_purchasable ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Track Inventory
                    </label>
                    <p className="text-gray-900">
                      {product.track_inventory ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pricing Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cost Price</label>
                    <p className="text-gray-900 font-semibold">
                      {formatCurrency(product.cost_price)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Direct Sales Price
                    </label>
                    <p className="text-primary font-bold text-lg">
                      {formatCurrency((product as any).direct_sales_price || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Profit Margin
                    </label>
                    <p className="text-green-600 font-bold">
                      {calculateMargin(
                        product.cost_price,
                        (product as any).direct_sales_price || 0
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tax Rate</label>
                    <p className="text-gray-900">
                      {product.tax_rate}%
                      {product.tax_inclusive && ' (Inclusive)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inventory Section */}
              {product.track_inventory && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Inventory Settings
                  </h3>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <label className="text-sm text-gray-500">Minimum Stock</label>
                      <p className="font-semibold">{product.minimum_stock_level}</p>
                    </div>
                    {product.maximum_stock_level && (
                      <div>
                        <label className="text-sm text-gray-500">Maximum Stock</label>
                        <p className="font-semibold">{product.maximum_stock_level}</p>
                      </div>
                    )}
                    {product.reorder_point && (
                      <div>
                        <label className="text-sm text-gray-500">Reorder Point</label>
                        <p className="font-semibold">{product.reorder_point}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bin Card Tab */}
          {activeTab === 'bincard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Bin Card - Product Movement
                  </h3>
                  <p className="text-sm text-gray-600">
                    Track all inventory transactions for {product.name}
                  </p>
                </div>
              </div>

              <BinCardView
                binCardData={binCardData}
                isLoading={binCardLoading}
                error={binCardError}
                warehouses={warehouses}
                selectedWarehouseId={selectedWarehouseId}
                onWarehouseChange={onWarehouseChange}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="mofad-btn-primary" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Product
          </Button>
        </div>
      </div>
    </div>
  )
}
