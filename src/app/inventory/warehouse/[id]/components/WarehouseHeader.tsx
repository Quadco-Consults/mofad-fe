import { ArrowLeft, Warehouse, MapPin, Plus, Upload } from 'lucide-react'

interface WarehouseHeaderProps {
  warehouseData: any
  warehouseId: number
  activeTab: string
  onBack: () => void
  onUploadClick: () => void
  onAddClick: () => void
}

export function WarehouseHeader({
  warehouseData,
  warehouseId,
  activeTab,
  onBack,
  onUploadClick,
  onAddClick,
}: WarehouseHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Warehouses
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          {warehouseData ? warehouseData.name : 'Warehouse Management'}
        </h1>
        <p className="text-gray-600">Manage inventory, process receipts from PRO and handle issues from PRF</p>

        {/* Warehouse Details */}
        {warehouseData && (
          <div className="mt-2 flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Warehouse className="w-4 h-4 mr-1" />
              <span>Code: {warehouseData.code || warehouseId}</span>
            </div>
            {warehouseData.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{warehouseData.location}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {activeTab === 'inventory' && (
        <div className="flex gap-2">
          <button
            onClick={onUploadClick}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Stock
          </button>
          <button
            onClick={onAddClick}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      )}
    </div>
  )
}
