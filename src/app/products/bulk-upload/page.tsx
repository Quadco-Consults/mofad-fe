'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { Upload, FileText, Download, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'

interface UploadResult {
  message: string
  summary: {
    total_rows: number
    created_count: number
    updated_count: number
    error_count: number
  }
  products: Array<{
    row: number
    product_code: string
    product_name: string
    action: 'created' | 'updated'
    old_values: {
      cost_price: number
      bulk_selling_price: number
      retail_selling_price: number
    }
    new_values: {
      cost_price: number
      bulk_selling_price: number
      retail_selling_price: number
    }
  }>
  errors: Array<{
    row: number
    error: string
    data: any
  }>
}

export default function BulkUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const uploadMutation = useMutation({
    mutationFn: (file: File) => apiClient.bulkUploadProductPrices(file),
    onSuccess: (data: UploadResult) => {
      setUploadResult(data)
      setSelectedFile(null)
    },
    onError: (error: any) => {
      console.error('Upload failed:', error)
    }
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file)
        setUploadResult(null)
      } else {
        alert('Please select a CSV file')
        event.target.value = ''
      }
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile)
    }
  }

  const handleDownloadTemplate = () => {
    const csvContent = `product_code,name,category,brand,package_size,cost_price,bulk_selling_price,retail_selling_price
CASTROL-GTX,Castrol GTX 10W40,engine_oil,castrol,1,800.00,1200.00,1500.00
CASTROL-GTX,Castrol GTX 10W40,engine_oil,castrol,4,3000.00,4500.00,5500.00
CASTROL-GTX,Castrol GTX 10W40,engine_oil,castrol,200,220000.00,250000.00,280000.00
FILTER-AIR-001,Air Filter XYZ123,filter,castrol,,500.00,750.00,900.00`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_upload_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <AppLayout
      title="Bulk Upload Product Prices"
      breadcrumbs={[
        { label: 'Products', href: '/products' },
        { label: 'Bulk Upload Prices', href: '/products/bulk-upload' }
      ]}
    >
      <div className="space-y-6">
        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">CSV File Format</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Your CSV file can include the following columns:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><code className="bg-gray-100 px-1 py-0.5 rounded">product_code</code> - The base product code (required)</li>
                  <li><code className="bg-gray-100 px-1 py-0.5 rounded">name</code> - Product name (required for new products, optional for updates)</li>
                  <li><code className="bg-gray-100 px-1 py-0.5 rounded">category</code> - Product category (optional: engine_oil, filter, etc.)</li>
                  <li><code className="bg-gray-100 px-1 py-0.5 rounded">brand</code> - Product brand (optional: castrol, shell, mobil, etc.)</li>
                  <li><code className="bg-gray-100 px-1 py-0.5 rounded">package_size</code> - Package size in liters (optional: 1, 4, 200, etc.)</li>
                  <li><code className="bg-gray-100 px-1 py-0.5 rounded">cost_price</code> - Cost price from dealer (optional)</li>
                  <li><code className="bg-gray-100 px-1 py-0.5 rounded">bulk_selling_price</code> - Direct/Wholesale selling price (optional)</li>
                  <li><code className="bg-gray-100 px-1 py-0.5 rounded">retail_selling_price</code> - Station/LubeBay selling price (optional)</li>
                </ul>
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-xs text-blue-800">
                    <strong>Important:</strong> Each package size with different pricing needs a separate row. For example, if CASTROL-GTX has different prices for 1L, 4L, and 200L sizes, create three rows with the same product_code but different package_size and price values. The system will create unique product codes like CASTROL-GTX-1L, CASTROL-GTX-4L, etc.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This upload can both create new products and update existing ones.
                  If a product code exists, it will be updated. If it doesn't exist and you provide a name, it will be created.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-500" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* File Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FileText className="w-12 h-12 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Click to select CSV file
                  </span>
                  <span className="text-xs text-muted-foreground">
                    or drag and drop
                  </span>
                </label>
              </div>

              {/* Selected File */}
              {selectedFile && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  <Button
                    onClick={() => setSelectedFile(null)}
                    variant="ghost"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload and Update Prices
                  </>
                )}
              </Button>

              {/* Error Message */}
              {uploadMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">Upload Failed</h4>
                      <p className="text-sm text-red-700">
                        {(uploadMutation.error as any)?.message || 'An error occurred while uploading the file'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        {uploadResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Upload Results
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-700 font-medium">Total Rows</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {uploadResult.summary.total_rows}
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-sm text-purple-700 font-medium">Created</div>
                    <div className="text-2xl font-bold text-purple-900">
                      {uploadResult.summary.created_count}
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-700 font-medium">Updated</div>
                    <div className="text-2xl font-bold text-green-900">
                      {uploadResult.summary.updated_count}
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-sm text-red-700 font-medium">Errors</div>
                    <div className="text-2xl font-bold text-red-900">
                      {uploadResult.summary.error_count}
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">{uploadResult.message}</p>
                </div>

                {/* Detailed Results */}
                {showDetails && (
                  <div className="space-y-4">
                    {/* Products */}
                    {uploadResult.products.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 text-green-800">Processed Products</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="max-h-96 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Code</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost Price</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bulk Price</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Retail Price</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {uploadResult.products.map((product, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm">{product.row}</td>
                                    <td className="px-4 py-2 text-sm">
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                        product.action === 'created'
                                          ? 'bg-purple-100 text-purple-700'
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {product.action === 'created' ? 'Created' : 'Updated'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm font-medium">{product.product_code}</td>
                                    <td className="px-4 py-2 text-sm">{product.product_name}</td>
                                    <td className="px-4 py-2 text-sm">
                                      <div className="flex flex-col">
                                        {product.action === 'updated' && (
                                          <span className="line-through text-gray-400">₦{product.old_values.cost_price.toLocaleString()}</span>
                                        )}
                                        <span className="text-green-600 font-medium">₦{product.new_values.cost_price.toLocaleString()}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      <div className="flex flex-col">
                                        {product.action === 'updated' && (
                                          <span className="line-through text-gray-400">₦{product.old_values.bulk_selling_price.toLocaleString()}</span>
                                        )}
                                        <span className="text-green-600 font-medium">₦{product.new_values.bulk_selling_price.toLocaleString()}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      <div className="flex flex-col">
                                        {product.action === 'updated' && (
                                          <span className="line-through text-gray-400">₦{product.old_values.retail_selling_price.toLocaleString()}</span>
                                        )}
                                        <span className="text-green-600 font-medium">₦{product.new_values.retail_selling_price.toLocaleString()}</span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Errors */}
                    {uploadResult.errors.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 text-red-800">Errors</h3>
                        <div className="space-y-2">
                          {uploadResult.errors.map((error, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-red-800">
                                    Row {error.row}: {error.error}
                                  </div>
                                  <div className="text-xs text-red-600 mt-1">
                                    Data: {JSON.stringify(error.data)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
