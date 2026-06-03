import { ProductFormData } from '@/types/api'
import { Button } from '@/components/ui/Button'
import { X, Save, Loader2 } from 'lucide-react'
import { calculateMargin } from './product-utils'

interface ProductFormProps {
  mode: 'add' | 'edit'
  formData: ProductFormData
  formErrors: Record<string, string>
  isSaving: boolean
  suppliers: Array<{ id: number; name: string }>
  onChange: (field: keyof ProductFormData, value: any) => void
  onSubmit: () => void
  onCancel: () => void
}

export function ProductForm({
  mode,
  formData,
  formErrors,
  isSaving,
  suppliers,
  onChange,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const title = mode === 'add' ? 'Add New Product' : 'Edit Product'
  const submitText = mode === 'add' ? 'Add Product' : 'Save Changes'

  // Helper component for form inputs
  const FormInput = ({
    label,
    name,
    type = 'text',
    required = false,
    placeholder = '',
    value,
    onChange: onInputChange,
    error,
    min,
    step,
    helpText,
  }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
        value={value || ''}
        onChange={onInputChange}
        min={min}
        step={step}
      />
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          {/* Basic Information */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Product Name"
                name="name"
                required
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e: any) => onChange('name', e.target.value)}
                error={formErrors.name}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.category}
                  onChange={(e) => onChange('category', e.target.value)}
                >
                  <option value="engine_oil">Engine Oils</option>
                  <option value="hydraulic_oil">Hydraulic Oils</option>
                  <option value="gear_oil">Gear Oils</option>
                  <option value="brake_fluid">Brake Fluids</option>
                  <option value="coolant">Coolants</option>
                  <option value="grease">Greases</option>
                  <option value="filter">Filters</option>
                  <option value="additive">Additives</option>
                  <option value="transmission">Transmission Fluids</option>
                  <option value="specialty_products">Specialty Products</option>
                  <option value="other">Other</option>
                </select>
                {formErrors.category && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Product Code"
                name="code"
                required
                placeholder="e.g., CASTROL-GTX"
                value={formData.code}
                onChange={(e: any) => onChange('code', e.target.value)}
                error={formErrors.code}
              />
              <FormInput
                label="Package Size"
                name="package_size"
                type="number"
                placeholder="e.g., 1, 4, 200 (optional for filters)"
                value={formData.package_size}
                onChange={(e: any) =>
                  onChange('package_size', e.target.valueAsNumber || undefined)
                }
                min="0"
                step="0.1"
                helpText="Leave empty for filters. For oils with multiple sizes, create separate products."
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                value={formData.description || ''}
                onChange={(e) => onChange('description', e.target.value)}
                placeholder="Product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.brand || ''}
                  onChange={(e) => onChange('brand', e.target.value)}
                >
                  <option value="">Select brand...</option>
                  <option value="castrol">Castrol</option>
                  <option value="shell">Shell</option>
                  <option value="nnpc">NNPC</option>
                  <option value="total">Total</option>
                  <option value="mobil">Mobil</option>
                  <option value="eterna">Eterna</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.subcategory || ''}
                  onChange={(e) => onChange('subcategory', e.target.value)}
                >
                  <option value="">Select subcategory...</option>
                  <option value="automotive">Automotive</option>
                  <option value="industrial">Industrial</option>
                  <option value="marine">Marine</option>
                  <option value="heavy_duty">Heavy Duty</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit of Measure <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.unit_of_measure}
                  onChange={(e) => onChange('unit_of_measure', e.target.value)}
                >
                  <option value="liters">Liters</option>
                  <option value="gallons">Gallons</option>
                  <option value="kilograms">Kilograms</option>
                  <option value="pieces">Pieces</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-gray-900 mb-3">Pricing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Cost Price (₦)"
                name="cost_price"
                type="number"
                required
                placeholder="0.00"
                value={formData.cost_price}
                onChange={(e: any) => onChange('cost_price', e.target.valueAsNumber || 0)}
                min="0"
                step="0.01"
                error={formErrors.cost_price}
              />
              <FormInput
                label="Direct Sales Price (₦)"
                name="direct_sales_price"
                type="number"
                required
                placeholder="0.00"
                value={formData.direct_sales_price}
                onChange={(e: any) =>
                  onChange('direct_sales_price', e.target.valueAsNumber || 0)
                }
                min="0"
                step="0.01"
                error={formErrors.direct_sales_price}
              />
              <FormInput
                label="Retail Sales Price (₦)"
                name="retail_sales_price"
                type="number"
                placeholder="0.00"
                value={formData.retail_sales_price}
                onChange={(e: any) =>
                  onChange('retail_sales_price', e.target.valueAsNumber || 0)
                }
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Tax Rate (%)"
                name="tax_rate"
                type="number"
                placeholder="7.5"
                value={formData.tax_rate}
                onChange={(e: any) => onChange('tax_rate', e.target.valueAsNumber || 0)}
                min="0"
                step="0.1"
              />
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="tax_inclusive"
                  checked={formData.tax_inclusive}
                  onChange={(e) => onChange('tax_inclusive', e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="tax_inclusive" className="ml-2 text-sm text-gray-700">
                  Tax Inclusive
                </label>
              </div>
            </div>

            {/* Profit Margin Display */}
            {formData.direct_sales_price > 0 && formData.cost_price > 0 && (
              <div className="p-3 bg-gray-50 rounded-md mt-4">
                <span className="text-sm text-gray-600">Profit Margin: </span>
                <span className="font-semibold text-green-600">
                  {calculateMargin(formData.cost_price, formData.direct_sales_price).toFixed(
                    1
                  )}
                  %
                </span>
              </div>
            )}
          </div>

          {/* Inventory Settings */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-gray-900 mb-3">Inventory Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Minimum Stock Level"
                name="minimum_stock_level"
                type="number"
                placeholder="0"
                value={formData.minimum_stock_level}
                onChange={(e: any) =>
                  onChange('minimum_stock_level', e.target.valueAsNumber || 0)
                }
                min="0"
              />
              <FormInput
                label="Maximum Stock Level"
                name="maximum_stock_level"
                type="number"
                placeholder="0"
                value={formData.maximum_stock_level}
                onChange={(e: any) =>
                  onChange('maximum_stock_level', e.target.valueAsNumber || 0)
                }
                min="0"
              />
              <FormInput
                label="Reorder Point"
                name="reorder_point"
                type="number"
                placeholder="0"
                value={formData.reorder_point}
                onChange={(e: any) =>
                  onChange('reorder_point', e.target.valueAsNumber || 0)
                }
                min="0"
              />
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="track_inventory"
                checked={formData.track_inventory}
                onChange={(e) => onChange('track_inventory', e.target.checked)}
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="track_inventory" className="ml-2 text-sm text-gray-700">
                Track Inventory
              </label>
            </div>
          </div>

          {/* Supplier & Status */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-gray-900 mb-3">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Supplier
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.primary_supplier || ''}
                  onChange={(e) => onChange('primary_supplier', e.target.value)}
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 mt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => onChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Is Active
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_sellable"
                    checked={formData.is_sellable}
                    onChange={(e) => onChange('is_sellable', e.target.checked)}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="is_sellable" className="ml-2 text-sm text-gray-700">
                    Is Sellable
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_purchasable"
                    checked={formData.is_purchasable}
                    onChange={(e) => onChange('is_purchasable', e.target.checked)}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="is_purchasable" className="ml-2 text-sm text-gray-700">
                    Is Purchasable
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button className="mofad-btn-primary" onClick={onSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {submitText}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
