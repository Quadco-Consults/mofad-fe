'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createPortal } from 'react-dom'
import apiClient from '@/lib/apiClient'
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Phone,
  MapPin,
  Wrench,
  Star,
  Receipt,
  ShoppingCart,
  Package,
  Settings,
  Eye,
  X,
  Trash2,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface Carwash {
  id: string
  name: string
  // API fields
  address?: string
  state_name?: string
  manager_name?: string
  phone?: string | null
  is_active?: boolean
  // Mock data fields (optional for compatibility)
  location?: string
  state?: string
  manager?: string
  status?: 'active' | 'maintenance' | 'inactive'
  bays?: number
  monthlyRevenue?: number
  lastInspection?: string
  services?: string[]
  rating?: number
}

interface LubricantSale {
  id: string
  date: string
  customerName: string
  customerPhone: string
  products: Array<{
    name: string
    brand: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'transfer'
  salesRep: string
  notes: string
}

interface ServiceRecord {
  id: string
  date: string
  customerName: string
  customerPhone: string
  vehicleInfo: {
    make: string
    model: string
    year: string
    plateNumber: string
  }
  services: Array<{
    name: string
    category: 'maintenance' | 'repair' | 'inspection'
    duration: number // minutes
    price: number
  }>
  parts: Array<{
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  laborCost: number
  partsCost: number
  total: number
  paymentMethod: 'cash' | 'card' | 'transfer'
  technician: string
  bayNumber: number
  status: 'completed' | 'in_progress' | 'pending'
  notes: string
}

export default function CarwashMonthlyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const carwashId = params.id as string
  const year = parseInt(params.year as string)
  const month = parseInt(params.month as string)

  // Calculate date range for the selected month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  // Format month label for display
  const monthLabel = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })

  // Previous/Next month calculation
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year

  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'filters' | 'services' | 'expenses' | 'lodgements' | 'inventory'>('overview')
  const [showRecordSaleModal, setShowRecordSaleModal] = useState(false)
  const [saleType, setSaleType] = useState<'lubricant' | 'filter'>('lubricant')
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [showRecordServiceModal, setShowRecordServiceModal] = useState(false)
  const [showCreateExpenseModal, setShowCreateExpenseModal] = useState(false)
  const [showCreateLodgementModal, setShowCreateLodgementModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [selectedLodgement, setSelectedLodgement] = useState<any>(null)
  const [showTransactionDetailModal, setShowTransactionDetailModal] = useState(false)
  const [showExpenseDetailModal, setShowExpenseDetailModal] = useState(false)
  const [showLodgementDetailModal, setShowLodgementDetailModal] = useState(false)

  // Edit modals
  const [showEditSaleModal, setShowEditSaleModal] = useState(false)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false)
  const [showEditLodgementModal, setShowEditLodgementModal] = useState(false)

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: any; name: string } | null>(null)

  // Bin card modal
  const [showBinCardModal, setShowBinCardModal] = useState(false)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null)

  // Stock upload modal
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{
    status: 'idle' | 'uploading' | 'success' | 'error'
    created: number
    updated: number
    errors: string[]
  }>({ status: 'idle', created: 0, updated: 0, errors: [] })

  // Lubricant sale form state (simplified - no customer details)
  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date by default
    items: [{ service: '', quantity: 1, unit_price: 0, notes: '' }],
    payment_method: 'cash' as 'cash' | 'pos' | 'bank_transfer',
    bank_reference: '',
    comment: ''
  })

  // Service record form state (simplified - no customer/vehicle details)
  const [serviceForm, setServiceForm] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date by default
    items: [{ service: '', quantity: 1, unit_price: 0, notes: '' }],
    payment_method: 'cash' as 'cash' | 'pos' | 'bank_transfer',
    bank_reference: '',
    comment: ''
  })

  // Edit Expense form state
  const [editExpenseForm, setEditExpenseForm] = useState({
    name: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    expense_type: null as number | null,
    notes: ''
  })

  // Edit Lodgement form state
  const [editLodgementForm, setEditLodgementForm] = useState({
    amount_lodged: 0,
    lodgement_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    bank_name: '',
    deposit_slip_number: '',
    description: '',
    notes: ''
  })

  // Edit Sale/Service form state (for transactions with items)
  const [editTransactionForm, setEditTransactionForm] = useState({
    payment_method: 'cash' as 'cash' | 'pos' | 'bank_transfer',
    bank_reference: '',
    comment: '',
    items: [] as Array<{ id?: number; service: number; service_name?: string; quantity: number; unit_price: number; notes: string }>
  })

  // Fetch available services for dropdown
  const { data: availableServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/services/')
        return response.results || response
      } catch (error) {
        // Silently handle error - services dropdown will be empty if API fails
        return []
      }
    }
  })

  // Fetch carwash details from API
  const { data: carwash, isLoading: carwashLoading } = useQuery({
    queryKey: ['carwash-detail', carwashId],
    queryFn: async () => {
      const data = await apiClient.get(`/carwashs/${carwashId}/`)
      console.log('🏪 Carwash data:', data)
      console.log('🏭 Carwash warehouse ID:', data?.warehouse)
      return data
    },
  })

  // Fetch carwash transactions (optional - cash movements)
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['carwash-transactions', carwashId, year, month],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/carwash-transactions/?carwash=${carwashId}&created_datetime__gte=${startDate}&created_datetime__lte=${endDate}`)
        return response
      } catch (error) {
        // Optional query - no transactions is normal
        return null
      }
    },
  })

  // Fetch carwash inventory from multiple possible endpoints
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['carwash-inventory', carwashId],
    queryFn: async () => {
      // Try multiple endpoints in order
      const endpoints = [
        `/substore/inventory/${carwashId}`,  // Legacy endpoint
        `/substores/${carwashId}/inventory/`,
        `/carwash-inventory/?carwash=${carwashId}`,
        carwash?.warehouse ? `/warehouse-inventory/?warehouse=${carwash.warehouse}` : null
      ].filter(Boolean)

      for (const endpoint of endpoints) {
        try {
          const response = await apiClient.get(endpoint as string)
          console.log(`✅ Inventory loaded from ${endpoint}:`, response)
          return response
        } catch (error) {
          console.log(`❌ Failed to load from ${endpoint}`)
        }
      }

      console.error('⚠️ All inventory endpoints failed')
      return { results: [] }
    },
    enabled: true
  })

  // Fetch stock transactions for bin card (only when modal is open)
  const { data: binCardData, isLoading: binCardLoading } = useQuery({
    queryKey: ['bin-card', carwash?.warehouse, selectedInventoryItem?.product],
    queryFn: async () => {
      try {
        if (!carwash?.warehouse || !selectedInventoryItem?.product) return { results: [] }
        const response = await apiClient.get(`/stock-transactions/?warehouse=${carwash.warehouse}&product=${selectedInventoryItem.product}`)
        console.log('📋 Bin card data:', response)
        return response
      } catch (error) {
        console.error('Error fetching bin card:', error)
        return { results: [] }
      }
    },
    enabled: !!showBinCardModal && !!carwash?.warehouse && !!selectedInventoryItem?.product
  })

  // Fetch monthly inventory snapshot for this month/year (optional)
  const { data: monthlySnapshot, isLoading: snapshotLoading, refetch: refetchSnapshot } = useQuery({
    queryKey: ['monthly-inventory-snapshot', carwashId, year, month],
    queryFn: async () => {
      try {
        const response = await apiClient.getCarwashMonthlyInventorySnapshots(carwashId, {
          year,
          month
        })
        console.log('📊 Monthly snapshot:', response)
        return response?.results?.[0] || null
      } catch (error) {
        // Optional query - no snapshot is normal if not yet created
        return null
      }
    }
  })

  // Fetch service transactions and sales from multiple endpoints
  const { data: serviceTransactionsData, isLoading: serviceTransactionsLoading } = useQuery({
    queryKey: ['carwash-service-transactions', carwashId, year, month],
    queryFn: async () => {
      let servicesData: any[] = []
      let salesData: any[] = []

      // Try to fetch services (lst - carwash service transactions)
      const serviceEndpoints = [
        `/lst/?carwash=${carwashId}&date__gte=${startDate}&date__lte=${endDate}`,
        `/carwash/days-transactions/?carwash=${carwashId}&date__gte=${startDate}&date__lte=${endDate}`,
        `/carwash-service-transactions/?carwash=${carwashId}&transaction_type=services&created_datetime__gte=${startDate}&created_datetime__lte=${endDate}`
      ]

      for (const endpoint of serviceEndpoints) {
        try {
          const response = await apiClient.get(endpoint)
          console.log(`✅ Services loaded from ${endpoint}:`, response)
          const results = response?.results || response?.data || response || []
          servicesData = Array.isArray(results) ? results : []
          if (servicesData.length > 0) {
            // Mark as services and break
            servicesData = servicesData.map((item: any) => ({ ...item, transaction_type: 'services' }))
            break
          }
        } catch (error) {
          console.log(`❌ Failed to load services from ${endpoint}`)
        }
      }

      // Try to fetch sales (sst - substore sales transactions)
      const salesEndpoints = [
        `/sst/?carwash=${carwashId}&date__gte=${startDate}&date__lte=${endDate}`,
        `/carwash/substore/days-transactions/?carwash=${carwashId}&date__gte=${startDate}&date__lte=${endDate}`,
        `/carwash-service-transactions/?carwash=${carwashId}&transaction_type=lubricant_sales&created_datetime__gte=${startDate}&created_datetime__lte=${endDate}`
      ]

      for (const endpoint of salesEndpoints) {
        try {
          const response = await apiClient.get(endpoint)
          console.log(`✅ Sales loaded from ${endpoint}:`, response)
          const results = response?.results || response?.data || response || []
          salesData = Array.isArray(results) ? results : []
          if (salesData.length > 0) {
            // Mark as lubricant_sales and break
            salesData = salesData.map((item: any) => ({ ...item, transaction_type: 'lubricant_sales' }))
            break
          }
        } catch (error) {
          console.log(`❌ Failed to load sales from ${endpoint}`)
        }
      }

      // Combine services and sales
      const combined = [...servicesData, ...salesData]
      console.log(`📊 Combined transactions: ${servicesData.length} services + ${salesData.length} sales = ${combined.length} total`)

      return {
        results: combined,
        count: combined.length
      }
    },
  })

  // Fetch products (filtered by carwash's warehouse if available)
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', carwash?.warehouse],
    queryFn: async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams({ is_active: 'true' })

        // Add warehouse filter if carwash has a warehouse
        if (carwash?.warehouse) {
          params.append('warehouse', carwash.warehouse.toString())
          console.log('🏭 Fetching products for warehouse:', carwash.warehouse)
        } else {
          console.log('⚠️ No warehouse found for carwash, fetching all products')
        }

        const url = `/products/?${params.toString()}`
        console.log('📦 Products API URL:', url)
        const response = await apiClient.get(url)
        console.log('✅ Products response:', response)
        return response
      } catch (error) {
        console.error('Error fetching products:', error)
        return null
      }
    },
    enabled: !!carwash, // Only fetch when carwash data is loaded
  })

  // Fetch services
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/services/?is_active=true')
        return response
      } catch (error) {
        console.error('Error fetching services:', error)
        return null
      }
    },
  })

  // Fetch carwash expenses from multiple endpoints
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['carwash-expenses', carwashId, year, month],
    queryFn: async () => {
      const endpoints = [
        `/substore/expenses/${carwashId}/?start_date=${startDate}&end_date=${endDate}`,
        `/substores/${carwashId}/expenses/?expense_date__gte=${startDate}&expense_date__lte=${endDate}`,
        `/carwash-expenses/?carwash=${carwashId}&expense_date__gte=${startDate}&expense_date__lte=${endDate}`
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await apiClient.get(endpoint)
          console.log(`✅ Expenses loaded from ${endpoint}`)
          return response
        } catch (error) {
          console.log(`❌ Failed to load expenses from ${endpoint}`)
        }
      }
      return null
    },
  })

  // Fetch carwash lodgements from multiple endpoints
  const { data: lodgementsData, isLoading: lodgementsLoading } = useQuery({
    queryKey: ['carwash-lodgements', carwashId, year, month],
    queryFn: async () => {
      const endpoints = [
        `/substore/lodgements/${carwashId}/?start_date=${startDate}&end_date=${endDate}`,
        `/substores/${carwashId}/lodgements/?lodgement_date__gte=${startDate}&lodgement_date__lte=${endDate}`,
        `/lodgements/?carwash=${carwashId}&lodgement_type=carwash&lodgement_date__gte=${startDate}&lodgement_date__lte=${endDate}`
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await apiClient.get(endpoint)
          console.log(`✅ Lodgements loaded from ${endpoint}`)
          return response
        } catch (error) {
          console.log(`❌ Failed to load lodgements from ${endpoint}`)
        }
      }
      return null
    },
  })

  // Extract results from API response
  const extractResults = (data: any) => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.results) return data.results
    if (data.data) return Array.isArray(data.data) ? data.data : data.data.results || []
    return []
  }

  const transactions = extractResults(transactionsData)
  const serviceTransactions = extractResults(serviceTransactionsData)
  const products = extractResults(productsData)
  const services = extractResults(servicesData)
  const expenses = extractResults(expensesData)
  const lodgements = extractResults(lodgementsData)

  // Use API data
  // Note: carwash-transactions are cash movements (CREDIT/DEBIT), not product sales
  // carwash-service-transactions include BOTH services AND lubricant_sales
  const transactions_raw = (transactions && transactions.length > 0) ? transactions : []
  const serviceTransactions_raw = (serviceTransactions && serviceTransactions.length > 0) ? serviceTransactions : []

  console.log('📝 Raw service transactions:', serviceTransactions_raw.length)
  console.log('🔍 First transaction sample:', serviceTransactions_raw[0])
  console.log('🏷️ Transaction types found:', Array.from(new Set(serviceTransactions_raw.map((t: any) => t.transaction_type))))

  // Split service transactions by type for proper display
  const allProductSales = serviceTransactions_raw.filter((t: any) => t.transaction_type === 'lubricant_sales')
  const serviceRecords = serviceTransactions_raw.filter((t: any) => t.transaction_type === 'services')

  console.log('💰 Product sales count:', allProductSales.length)
  console.log('🔧 Service records count:', serviceRecords.length)

  // Separate lubricant sales from filter sales based on product category
  const lubricantSales = allProductSales.filter((sale: any) => {
    // Check if any product in the sale is a lubricant (not a filter)
    if (!sale.products || !Array.isArray(sale.products) || sale.products.length === 0) {
      return true // Default to lubricant if no products info
    }
    return sale.products.some((product: any) =>
      product.category !== 'filter' && product.category !== 'Filters'
    )
  })

  const filterSales = allProductSales.filter((sale: any) => {
    // Check if any product in the sale is a filter
    if (!sale.products || !Array.isArray(sale.products) || sale.products.length === 0) {
      return false
    }
    return sale.products.some((product: any) =>
      product.category === 'filter' || product.category === 'Filters'
    )
  })

  // Use real data only
  const finalLubricantSales = lubricantSales
  const finalFilterSales = filterSales
  const finalServiceRecords = serviceRecords

  const getStatusBadge = (status: string | boolean) => {
    // Handle is_active boolean from API
    if (typeof status === 'boolean') {
      return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }
    const styles = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (carwash: Carwash) => {
    if (typeof carwash.is_active === 'boolean') {
      return carwash.is_active ? 'Active' : 'Inactive'
    }
    if (carwash.status) {
      return carwash.status.charAt(0).toUpperCase() + carwash.status.slice(1)
    }
    return 'Unknown'
  }

  const getServiceStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  // Safely calculate totals with fallback
  const totalSalesToday = finalLubricantSales.reduce((sum: number, sale: any) => {
    const amount = sale?.total_amount || sale?.total || sale?.amount || 0
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0
    return sum + numAmount
  }, 0)

  const totalServicesToday = finalServiceRecords.reduce((sum: number, service: any) => {
    const amount = service?.total_amount || service?.total || service?.amount || 0
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0
    return sum + numAmount
  }, 0)

  const totalRevenueToday = (totalSalesToday || 0) + (totalServicesToday || 0)

  // Mutation for creating product sale transaction
  const createProductSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiClient.post('/carwash-service-transactions/', {
        carwash: parseInt(carwashId),
        transaction_type: 'lubricant_sales',
        ...data
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwash-service-transactions', carwashId] })
      setShowRecordSaleModal(false)
      resetSaleForm()
      alert('Product sale recorded successfully!')
    },
    onError: (error: any) => {
      console.error('Error creating product sale:', error)
      alert(`Error: ${error.response?.data?.message || 'Failed to record product sale'}`)
    }
  })

  // Mutation for creating service transaction
  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiClient.post('/carwash-service-transactions/', {
        carwash: parseInt(carwashId),
        transaction_type: 'services',
        ...data
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwash-service-transactions', carwashId] })
      setShowRecordServiceModal(false)
      resetServiceForm()
      alert('Service recorded successfully!')
    },
    onError: (error: any) => {
      console.error('Error creating service:', error)
      alert(`Error: ${error.response?.data?.message || 'Failed to record service'}`)
    }
  })

  // Get inventory items for stock levels
  const inventoryItems = inventoryData?.results || []

  // Use products from API (all products) and join with inventory for stock levels
  const productsForSale = products.map((product: any) => {
    // Find matching inventory item to get stock levels
    const inventoryItem = inventoryItems.find((item: any) => item.product === product.id)

    return {
      id: product.id,
      code: product.sku,
      name: product.name,
      category: product.category,
      selling_price: product.retail_selling_price || product.bulk_selling_price || 0,
      quantity_on_hand: inventoryItem?.quantity_on_hand || 0,
      quantity_available: inventoryItem?.quantity_available || 0,
      unit_of_measure: product.unit_of_measurement || 'Unit'
    }
  })

  // Calculate sale total
  const calculateSaleTotal = () => {
    const total = saleForm.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price)
    }, 0)
    return { total }
  }

  // Calculate service total
  const calculateServiceTotal = () => {
    const total = serviceForm.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price)
    }, 0)
    return { total }
  }

  // Add item to sale
  const addItemToSale = () => {
    setSaleForm(prev => ({
      ...prev,
      items: [...prev.items, { service: '', quantity: 1, unit_price: 0, notes: '' }]
    }))
  }

  // Remove item from sale
  const removeItemFromSale = (index: number) => {
    if (saleForm.items.length > 1) {
      setSaleForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  // Stock upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
        alert('Please select a valid CSV or Excel file (.csv, .xlsx, .xls)')
        return
      }
      setUploadFile(file)
      setUploadProgress({ status: 'idle', created: 0, updated: 0, errors: [] })
    }
  }

  const handleUploadStock = async () => {
    if (!uploadFile) {
      alert('Please select a file first')
      return
    }

    setUploadProgress({ status: 'uploading', created: 0, updated: 0, errors: [] })

    try {
      const result = await apiClient.uploadWarehouseStock(uploadFile)
      setUploadProgress({
        status: 'success',
        created: result.created,
        updated: result.updated,
        errors: result.errors
      })

      // Refresh inventory data
      queryClient.invalidateQueries({ queryKey: ['carwash-inventory', carwash?.warehouse] })

      // Close modal after a delay if successful and no errors
      if (result.errors.length === 0) {
        setTimeout(() => {
          setShowUploadModal(false)
          setUploadFile(null)
          setUploadProgress({ status: 'idle', created: 0, updated: 0, errors: [] })
        }, 2000)
      }
    } catch (error: any) {
      setUploadProgress({
        status: 'error',
        created: 0,
        updated: 0,
        errors: [error.message || 'Failed to upload stock data']
      })
    }
  }

  const handleDownloadTemplate = async () => {
    if (!carwash?.warehouse) {
      alert('No warehouse assigned to this carwash')
      return
    }

    try {
      const blob = await apiClient.downloadStockTemplate(carwash.warehouse)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stock_template_warehouse_${carwash.warehouse}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Failed to download template')
    }
  }

  // Reset sale form
  const resetSaleForm = () => {
    setSaleForm({
      date: new Date().toISOString().split('T')[0],
      items: [{ service: '', quantity: 1, unit_price: 0, notes: '' }],
      payment_method: 'cash',
      bank_reference: '',
      comment: ''
    })
  }

  // Submit sale
  const handleSubmitSale = () => {
    // Validate
    if (saleForm.items.length === 0 || !saleForm.items[0].service) {
      alert('Please add at least one product')
      return
    }

    // Convert service IDs to numbers and validate prices
    const items = saleForm.items.map(item => ({
      service: parseInt(item.service),
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price.toString()),
      notes: item.notes || ''
    }))

    createProductSaleMutation.mutate({
      items,
      payment_method: saleForm.payment_method,
      bank_reference: saleForm.bank_reference || undefined,
      comment: saleForm.comment || undefined
    })
  }

  // Add item to service
  const addItemToService = () => {
    setServiceForm(prev => ({
      ...prev,
      items: [...prev.items, { service: '', quantity: 1, unit_price: 0, notes: '' }]
    }))
  }

  // Remove item from service
  const removeItemFromService = (index: number) => {
    if (serviceForm.items.length > 1) {
      setServiceForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  // Reset service form
  const resetServiceForm = () => {
    setServiceForm({
      date: new Date().toISOString().split('T')[0],
      items: [{ service: '', quantity: 1, unit_price: 0, notes: '' }],
      payment_method: 'cash',
      bank_reference: '',
      comment: ''
    })
  }

  // Submit service
  const handleSubmitService = () => {
    // Validate
    if (serviceForm.items.length === 0 || !serviceForm.items[0].service) {
      alert('Please add at least one service')
      return
    }

    // Convert service IDs to numbers and validate prices
    const items = serviceForm.items.map(item => ({
      service: parseInt(item.service),
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price.toString()),
      notes: item.notes || ''
    }))

    createServiceMutation.mutate({
      items,
      payment_method: serviceForm.payment_method,
      bank_reference: serviceForm.bank_reference || undefined,
      comment: serviceForm.comment || undefined
    })
  }

  if (carwashLoading || !carwash) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/channels/carwash/${carwashId}/monthly`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Monthly Overview
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading carwash details...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/channels/carwash/${carwashId}/monthly`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Monthly Overview
          </Button>
        </div>

        {/* Carwash Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-foreground">{carwash.name}</h1>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(carwash.is_active !== undefined ? carwash.is_active : carwash.status || 'unknown')}`}>
                        {getStatusText(carwash)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{carwash.address || carwash.location || 'Unknown'}, {carwash.state_name || carwash.state || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Manager: {carwash.manager_name || carwash.manager || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{carwash.phone || 'N/A'}</span>
                      </div>
                      {carwash.rating && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span>{carwash.rating} rating</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {carwash.bays !== undefined && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Service Bays</div>
                    <div className="text-2xl font-bold text-primary">{carwash.bays}</div>
                  </div>
                )}
                {carwash.monthlyRevenue !== undefined && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                    <div className="text-xl font-bold text-green-600">{formatCurrency(carwash.monthlyRevenue || 0)}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today&apos;s Revenue</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalRevenueToday)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Product Sales</p>
                  <p className="text-xs text-muted-foreground">(Lubricants, Filters, Parts)</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSalesToday)}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Service Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalServicesToday)}</p>
                </div>
                <Wrench className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(Array.isArray(finalLubricantSales) ? finalLubricantSales.length : 0) +
                     (Array.isArray(finalServiceRecords) ? finalServiceRecords.length : 0)}
                  </p>
                </div>
                <Receipt className="w-8 h-8 text-purple-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Month Navigation Bar */}
        <div className="bg-white border-b mb-6">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(`/channels/carwash/${carwashId}/monthly/${prevYear}/${prevMonth}`)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-xl font-semibold text-gray-900">
                  {monthLabel}
                </div>

                <button
                  onClick={() => router.push(`/channels/carwash/${carwashId}/monthly/${nextYear}/${nextMonth}`)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <Link
                href={`/channels/carwash/${carwashId}/monthly`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Months
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sales'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lubricant Sales
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'filters'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Filter Sales
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'expenses'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('lodgements')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'lodgements'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lodgements
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inventory
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Product Sales */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Product Sales</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowRecordSaleModal(true)}
                  className="mofad-btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Product Sale
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(finalLubricantSales) && finalLubricantSales.slice(0, 3).map((sale) => (
                    <div key={sale.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{sale.customerName || sale.customer_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {sale.products?.length || 0} product(s) • {formatDateTime(sale.date || sale.transaction_date || sale.created_datetime || sale.created_at)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sales Rep: {sale.salesRep || sale.sales_rep || 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{formatCurrency(sale.total_amount || sale.total || sale.amount || 0)}</div>
                        <div className="text-sm text-muted-foreground">{sale.paymentMethod || sale.payment_method || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Services */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Services</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowRecordServiceModal(true)}
                  className="mofad-btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Service
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(finalServiceRecords) && finalServiceRecords.slice(0, 3).map((service) => (
                    <div key={service.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{service.customerName || service.customer_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.vehicleInfo?.make || service.vehicle_info?.make || 'N/A'} {service.vehicleInfo?.model || service.vehicle_info?.model || ''} • Bay {service.bayNumber || service.bay_number || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Technician: {service.technician || 'N/A'}
                        </div>
                        {service.status && (
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${getServiceStatusBadge(service.status || 'completed')}`}>
                            {(service.status || 'completed').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{formatCurrency(service.total_amount || service.total || service.amount || 0)}</div>
                        <div className="text-sm text-muted-foreground">{formatDateTime(service.date || service.transaction_date || service.created_datetime || service.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'sales' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Lubricant Sales</h2>
              <p className="text-sm text-muted-foreground">Engine Oil, Transmission Fluid, Grease & Other Lubricants</p>
              <Button
                onClick={() => {
                  setSaleType('lubricant')
                  setProductSearchTerm('')
                  setShowRecordSaleModal(true)
                }}
                className="mofad-btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Lubricant Sale
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Products</th>
                        <th className="text-right py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Payment</th>
                        <th className="text-left py-3 px-4 font-medium">Transaction Date</th>
                        <th className="text-center py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Array.isArray(finalLubricantSales) && finalLubricantSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              {sale.products && Array.isArray(sale.products) && sale.products.slice(0, 2).map((product: any, index: number) => (
                                <div key={index} className="text-sm">
                                  {product.name || product.product_name || 'N/A'} (x{product.quantity || 1})
                                </div>
                              ))}
                              {sale.products && sale.products.length > 2 && (
                                <div className="text-sm text-muted-foreground">
                                  +{sale.products.length - 2} more
                                </div>
                              )}
                              {(!sale.products || !Array.isArray(sale.products)) && (
                                <div className="text-sm">Product sale</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-bold text-primary">{formatCurrency(sale.total_amount || sale.total || sale.amount || 0)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {sale.paymentMethod || sale.payment_method || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{formatDateTime(sale.date || sale.transaction_date || sale.created_datetime || sale.created_at)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  router.push(`/channels/carwash/transactions/${sale.id}`)
                                }}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const details = await apiClient.get(`/carwash-service-transactions/${sale.id}/`)
                                    console.log('Edit Sale - Full details:', details)
                                    setSelectedTransaction(details)
                                    // Initialize edit form with existing data
                                    setEditTransactionForm({
                                      payment_method: details.payment_method || 'cash',
                                      bank_reference: details.bank_reference || '',
                                      comment: details.comment || '',
                                      items: (details.items || []).map((item: any) => ({
                                        id: item.id,
                                        service: item.service_id || item.service,
                                        service_name: item.service_name,
                                        quantity: item.quantity,
                                        unit_price: parseFloat(item.unit_price),
                                        notes: item.notes || ''
                                      }))
                                    })
                                    setShowEditSaleModal(true)
                                  } catch (error) {
                                    console.error('Error fetching transaction:', error)
                                    setSelectedTransaction(sale)
                                    setShowEditSaleModal(true)
                                  }
                                }}
                                title="Edit"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteTarget({
                                    type: 'sale',
                                    id: sale.id,
                                    name: sale.transaction_number || `Sale #${sale.id}`
                                  })
                                  setShowDeleteConfirm(true)
                                }}
                                title="Delete"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'filters' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Filter Sales</h2>
              <p className="text-sm text-muted-foreground">Oil Filters, Air Filters, Fuel Filters & Cabin Filters</p>
              <Button
                onClick={() => {
                  setSaleType('filter')
                  setProductSearchTerm('')
                  setShowRecordSaleModal(true)
                }}
                className="mofad-btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Filter Sale
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Products</th>
                        <th className="text-right py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Payment</th>
                        <th className="text-left py-3 px-4 font-medium">Transaction Date</th>
                        <th className="text-center py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Array.isArray(finalFilterSales) && finalFilterSales.length > 0 ? (
                        finalFilterSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                {sale.products && Array.isArray(sale.products) && sale.products.slice(0, 2).map((product: any, index: number) => (
                                  <div key={index} className="text-sm">
                                    {product.name || product.product_name || 'N/A'} (x{product.quantity || 1})
                                  </div>
                                ))}
                                {sale.products && sale.products.length > 2 && (
                                  <div className="text-sm text-muted-foreground">
                                    +{sale.products.length - 2} more
                                  </div>
                                )}
                                {(!sale.products || !Array.isArray(sale.products)) && (
                                  <div className="text-sm">Filter sale</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-bold text-primary">{formatCurrency(sale.total_amount || sale.total || sale.amount || 0)}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {sale.paymentMethod || sale.payment_method || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">{formatDateTime(sale.date || sale.transaction_date || sale.created_datetime || sale.created_at)}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    router.push(`/channels/carwash/transactions/${sale.id}`)
                                  }}
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const details = await apiClient.get(`/carwash-service-transactions/${sale.id}/`)
                                      console.log('Edit Sale - Full details:', details)
                                      setSelectedTransaction(details)
                                      // Initialize edit form with existing data
                                      setEditTransactionForm({
                                        payment_method: details.payment_method || 'cash',
                                        bank_reference: details.bank_reference || '',
                                        comment: details.comment || '',
                                        items: (details.items || []).map((item: any) => ({
                                          id: item.id,
                                          service: item.service_id || item.service,
                                          service_name: item.service_name,
                                          quantity: item.quantity,
                                          unit_price: parseFloat(item.unit_price),
                                          notes: item.notes || ''
                                        }))
                                      })
                                      setShowEditSaleModal(true)
                                    } catch (error) {
                                      console.error('Error fetching transaction:', error)
                                      setSelectedTransaction(sale)
                                      setShowEditSaleModal(true)
                                    }
                                  }}
                                  title="Edit"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteTarget({
                                      type: 'sale',
                                      id: sale.id,
                                      name: sale.transaction_number || `Sale #${sale.id}`
                                    })
                                    setShowDeleteConfirm(true)
                                  }}
                                  title="Delete"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No filter sales recorded yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Service Records</h2>
              <p className="text-sm text-muted-foreground">Oil Changes, Maintenance, Repairs & Inspections</p>
              <Button
                onClick={() => setShowRecordServiceModal(true)}
                className="mofad-btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Service
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Vehicle</th>
                        <th className="text-left py-3 px-4 font-medium">Services</th>
                        <th className="text-right py-3 px-4 font-medium">Amount</th>
                        <th className="text-center py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Transaction Date</th>
                        <th className="text-center py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Array.isArray(finalServiceRecords) && finalServiceRecords.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">
                                {service.vehicleInfo?.make || service.vehicle_info?.make || 'N/A'} {service.vehicleInfo?.model || service.vehicle_info?.model || ''}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {service.vehicleInfo?.plateNumber || service.vehicle_info?.plate_number || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              {service.services && Array.isArray(service.services) && service.services.slice(0, 2).map((svc: any, index: number) => (
                                <div key={index} className="text-sm">
                                  {svc.name || svc.service_name || 'N/A'}
                                </div>
                              ))}
                              {service.services && service.services.length > 2 && (
                                <div className="text-sm text-muted-foreground">
                                  +{service.services.length - 2} more
                                </div>
                              )}
                              {(!service.services || !Array.isArray(service.services)) && (
                                <div className="text-sm">Service completed</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-bold text-primary">{formatCurrency(service.total_amount || service.total || service.amount || 0)}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {service.approval_status ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceStatusBadge(service.approval_status)}`}>
                                {service.approval_status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </span>
                            ) : service.status ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceStatusBadge(service.status)}`}>
                                {service.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                N/A
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">{formatDateTime(service.date || service.transaction_date || service.created_datetime || service.created_at)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  router.push(`/channels/carwash/transactions/${service.id}`)
                                }}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const details = await apiClient.get(`/carwash-service-transactions/${service.id}/`)
                                    console.log('Edit Service - Full details:', details)
                                    setSelectedTransaction(details)
                                    // Initialize edit form with existing data
                                    setEditTransactionForm({
                                      payment_method: details.payment_method || 'cash',
                                      bank_reference: details.bank_reference || '',
                                      comment: details.comment || '',
                                      items: (details.items || []).map((item: any) => ({
                                        id: item.id,
                                        service: item.service_id || item.service,
                                        service_name: item.service_name,
                                        quantity: item.quantity,
                                        unit_price: parseFloat(item.unit_price),
                                        notes: item.notes || ''
                                      }))
                                    })
                                    setShowEditServiceModal(true)
                                  } catch (error) {
                                    console.error('Error fetching transaction:', error)
                                    setSelectedTransaction(service)
                                    setShowEditServiceModal(true)
                                  }
                                }}
                                title="Edit"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteTarget({
                                    type: 'service',
                                    id: service.id,
                                    name: service.transaction_number || `Service #${service.id}`
                                  })
                                  setShowDeleteConfirm(true)
                                }}
                                title="Delete"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Carwash Expenses</h2>
              <p className="text-sm text-muted-foreground">Daily Operating Expenses</p>
              <Button
                onClick={() => setShowCreateExpenseModal(true)}
                className="mofad-btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Expense
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Description</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-right py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-center py-3 px-4 font-medium">Status</th>
                        <th className="text-center py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Array.isArray(expenses) && expenses.map((expense: any) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{expense.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{expense.expense_number}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm">{expense.expense_type_name || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-bold text-red-600">{formatCurrency(expense.amount || 0)}</div>
                          </td>
                          <td className="py-3 px-4 text-sm">{formatDateTime(expense.expense_date)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              expense.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                              expense.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {expense.approval_status?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedExpense(expense)
                                  setShowExpenseDetailModal(true)
                                }}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  console.log('Edit Expense clicked:', expense)
                                  setSelectedExpense(expense)
                                  setShowEditExpenseModal(true)
                                  console.log('showEditExpenseModal set to true')
                                }}
                                title="Edit"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteTarget({
                                    type: 'expense',
                                    id: expense.id,
                                    name: expense.expense_number || expense.name || `Expense #${expense.id}`
                                  })
                                  setShowDeleteConfirm(true)
                                }}
                                title="Delete"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'lodgements' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Bank Lodgements</h2>
              <p className="text-sm text-muted-foreground">Daily Cash Deposits</p>
              <Button
                onClick={() => setShowCreateLodgementModal(true)}
                className="mofad-btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Lodgement
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Lodgement #</th>
                        <th className="text-right py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Bank</th>
                        <th className="text-left py-3 px-4 font-medium">Teller #</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-center py-3 px-4 font-medium">Status</th>
                        <th className="text-center py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Array.isArray(lodgements) && lodgements.map((lodgement: any) => (
                        <tr key={lodgement.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{lodgement.lodgement_number}</div>
                            <div className="text-sm text-gray-500">{lodgement.payment_method}</div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-bold text-green-600">{formatCurrency(lodgement.amount_lodged || 0)}</div>
                            {lodgement.variance && parseFloat(lodgement.variance) !== 0 && (
                              <div className="text-xs text-orange-600">
                                Variance: {formatCurrency(Math.abs(parseFloat(lodgement.variance)))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm">{lodgement.bank_name || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono">{lodgement.deposit_slip_number || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4 text-sm">{formatDateTime(lodgement.lodgement_date)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              lodgement.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                              lodgement.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {lodgement.approval_status?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedLodgement(lodgement)
                                  setShowLodgementDetailModal(true)
                                }}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedLodgement(lodgement)
                                  setShowEditLodgementModal(true)
                                }}
                                title="Edit"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteTarget({
                                    type: 'lodgement',
                                    id: lodgement.id,
                                    name: lodgement.lodgement_number || `Lodgement #${lodgement.id}`
                                  })
                                  setShowDeleteConfirm(true)
                                }}
                                title="Delete"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Lubricants Inventory</h2>
                <p className="text-sm text-muted-foreground">Stock of Engine Oils & Lubricants</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Stock
                </Button>
              </div>
            </div>

            {inventoryLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading inventory...</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium">Product Code</th>
                          <th className="text-left py-3 px-4 font-medium">Product Name</th>
                          <th className="text-left py-3 px-4 font-medium">Category</th>
                          <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                          <th className="text-right py-3 px-4 font-medium">Quantity</th>
                          <th className="text-left py-3 px-4 font-medium">Unit</th>
                          <th className="text-center py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inventoryData?.results && inventoryData.results.filter((item: any) =>
                          !item.product_category?.toLowerCase().includes('filter')
                        ).length > 0 ? (
                          inventoryData.results.filter((item: any) =>
                            !item.product_category?.toLowerCase().includes('filter')
                          ).map((item: any) => (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setSelectedInventoryItem(item)
                                setShowBinCardModal(true)
                              }}
                            >
                              <td className="py-3 px-4">
                                <span className="font-mono text-sm">{item.product_code || 'N/A'}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-gray-900">{item.product_name}</div>
                                {item.product_description && (
                                  <div className="text-xs text-gray-500 mt-1">{item.product_description}</div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {item.product_category || 'Lubricant'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(item.product_retail_selling_price || item.product_bulk_selling_price || 0)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={`font-bold ${
                                  Number(item.quantity_on_hand) > 10
                                    ? 'text-green-600'
                                    : Number(item.quantity_on_hand) > 0
                                    ? 'text-orange-600'
                                    : 'text-red-600'
                                }`}>
                                  {Number(item.quantity_on_hand).toFixed(2)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm">{item.unit_of_measure || 'Units'}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedInventoryItem(item)
                                    setShowBinCardModal(true)
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                  <span className="ml-1">Bin Card</span>
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-500">
                              <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                              <p>No lubricants found for this carwash</p>
                              <p className="text-sm mt-1">Lubricant stock items will appear here once added to the warehouse</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filter Inventory Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Filter Inventory</h2>
                  <p className="text-sm text-muted-foreground">Stock of Oil Filters & Air Filters</p>
                </div>
              </div>

              {inventoryLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading inventory...</p>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium">Product Code</th>
                            <th className="text-left py-3 px-4 font-medium">Product Name</th>
                            <th className="text-left py-3 px-4 font-medium">Category</th>
                            <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                            <th className="text-right py-3 px-4 font-medium">Quantity</th>
                            <th className="text-left py-3 px-4 font-medium">Unit</th>
                            <th className="text-center py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {inventoryData?.results && inventoryData.results.filter((item: any) =>
                            item.product_category?.toLowerCase().includes('filter')
                          ).length > 0 ? (
                            inventoryData.results.filter((item: any) =>
                              item.product_category?.toLowerCase().includes('filter')
                            ).map((item: any) => (
                              <tr
                                key={item.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                  setSelectedInventoryItem(item)
                                  setShowBinCardModal(true)
                                }}
                              >
                                <td className="py-3 px-4">
                                  <span className="font-mono text-sm">{item.product_code || 'N/A'}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-medium text-gray-900">{item.product_name}</div>
                                  {item.product_description && (
                                    <div className="text-xs text-gray-500 mt-1">{item.product_description}</div>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {item.product_category || 'Filter'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className="font-medium text-gray-900">
                                    {formatCurrency(item.product_retail_selling_price || item.product_bulk_selling_price || 0)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className={`font-bold ${
                                    Number(item.quantity_on_hand) > 10
                                      ? 'text-green-600'
                                      : Number(item.quantity_on_hand) > 0
                                      ? 'text-orange-600'
                                      : 'text-red-600'
                                  }`}>
                                    {Number(item.quantity_on_hand).toFixed(2)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm">{item.unit_of_measure || 'Units'}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedInventoryItem(item)
                                      setShowBinCardModal(true)
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span className="ml-1">Bin Card</span>
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p>No filters found for this carwash</p>
                                <p className="text-sm mt-1">Filter stock items will appear here once added to the warehouse</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Monthly Inventory Closing Section */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Month-End Inventory Closing</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Reconcile physical counts and close inventory for {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {snapshotLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading closing status...</p>
                    </div>
                  ) : monthlySnapshot ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Snapshot Number</p>
                            <p className="font-mono text-sm font-medium">{monthlySnapshot.snapshot_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              monthlySnapshot.status === 'closed' ? 'bg-indigo-100 text-indigo-700' :
                              monthlySnapshot.status === 'balanced' ? 'bg-green-100 text-green-700' :
                              monthlySnapshot.status === 'reconciling' ? 'bg-yellow-100 text-yellow-700' :
                              monthlySnapshot.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {monthlySnapshot.status === 'closed' ? 'Closed' :
                               monthlySnapshot.status === 'balanced' ? 'Balanced' :
                               monthlySnapshot.status === 'reconciling' ? 'Reconciling' :
                               monthlySnapshot.status === 'in_progress' ? 'In Progress' :
                               'Draft'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Products</p>
                            <p className="font-semibold">{monthlySnapshot.total_products_count}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Closing Value</p>
                            <p className="font-semibold text-indigo-600">{formatCurrency(monthlySnapshot.total_closing_value || 0)}</p>
                          </div>
                          {monthlySnapshot.is_balanced && (
                            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded px-2 py-1.5">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Balanced</span>
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/channels/carwash/${carwashId}/inventory-closing/${monthlySnapshot.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          View Closing Details
                          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                      {monthlySnapshot.notes && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700">{monthlySnapshot.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">No Month-End Closing</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Month-end closing has not been initiated for this period
                      </p>
                      <Link
                        href={`/channels/carwash/${carwashId}/inventory-closing`}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Initiate Month-End Closing
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Record Sale Modal */}
        {showRecordSaleModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  Record {saleType === 'filter' ? 'Filter' : 'Lubricant'} Sale
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRecordSaleModal(false)
                    setProductSearchTerm('')
                    resetSaleForm()
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Products & Transaction Details */}
                <div className="space-y-6">
                  {/* Products Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">Products Sold</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addItemToSale}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {saleForm.items.map((item, index) => {
                        const selectedProduct = productsForSale.find((p: any) => p.id === parseInt(item.service))
                        return (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Product {index + 1}</span>
                            {saleForm.items.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItemFromSale(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search inventory by name or code..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={productSearchTerm}
                                onChange={(e) => setProductSearchTerm(e.target.value)}
                              />
                            </div>
                            <select
                              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent max-h-48"
                              value={item.service}
                              onChange={(e) => {
                                const productId = e.target.value
                                const product = productsForSale.find((p: any) => p.id === parseInt(productId))
                                setSaleForm(prev => ({
                                  ...prev,
                                  items: prev.items.map((it, i) =>
                                    i === index ? { ...it, service: productId, unit_price: product?.selling_price || 0 } : it
                                  )
                                }))
                              }}
                              size={8}
                            >
                              <option value="">Select product from inventory</option>
                              {productsForSale.filter((p: any) => {
                                // Filter by category based on sale type
                                const isCorrectCategory = saleType === 'filter'
                                  ? (p.category === 'filter' || p.category === 'Filters')
                                  : (p.category !== 'filter' && p.category !== 'Filters')

                                // Filter by search term
                                const matchesSearch = !productSearchTerm ||
                                  (p.name || '').toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                  (p.code || '').toLowerCase().includes(productSearchTerm.toLowerCase())

                                return p.name && isCorrectCategory && matchesSearch
                              }).map((prod: any) => (
                                <option key={prod.id} value={prod.id}>
                                  [{prod.code}] {prod.name} - Stock: {prod.quantity_available} {prod.unit_of_measure} ({formatCurrency(prod.selling_price || 0)})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1">Quantity</label>
                              <input
                                type="number"
                                min="1"
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={item.quantity}
                                onChange={(e) => setSaleForm(prev => ({
                                  ...prev,
                                  items: prev.items.map((it, i) =>
                                    i === index ? { ...it, quantity: Number(e.target.value) } : it
                                  )
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Unit Price (₦)</label>
                              <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={item.unit_price}
                                onChange={(e) => setSaleForm(prev => ({
                                  ...prev,
                                  items: prev.items.map((it, i) =>
                                    i === index ? { ...it, unit_price: Number(e.target.value) } : it
                                  )
                                }))}
                              />
                            </div>
                          </div>
                          {selectedProduct && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {selectedProduct.code} • {selectedProduct.category || 'N/A'}
                            </div>
                          )}
                          <div className="text-right font-medium text-lg">
                            Item Total: {formatCurrency(item.quantity * item.unit_price)}
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>

                  {/* Transaction Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Transaction Details</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Sale Date</label>
                        <input
                          type="date"
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          value={saleForm.date}
                          onChange={(e) => setSaleForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Payment Method</label>
                        <select
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          value={saleForm.payment_method}
                          onChange={(e) => setSaleForm(prev => ({ ...prev, payment_method: e.target.value as any }))}
                        >
                          <option value="cash">Cash</option>
                          <option value="pos">POS Payment</option>
                          <option value="bank_transfer">Bank Transfer</option>
                        </select>
                      </div>
                      {saleForm.payment_method === 'bank_transfer' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Bank Reference</label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={saleForm.bank_reference}
                            onChange={(e) => setSaleForm(prev => ({ ...prev, bank_reference: e.target.value }))}
                            placeholder="Enter bank reference number"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg">Sale Summary</h4>
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total Amount:</span>
                        <span className="text-primary">{formatCurrency(calculateSaleTotal().total)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={4}
                      value={saleForm.comment}
                      onChange={(e) => setSaleForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Additional notes about the sale..."
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      className="w-full mofad-btn-primary"
                      onClick={handleSubmitSale}
                      disabled={createProductSaleMutation.isPending || saleForm.items.some(it => !it.service || !it.unit_price)}
                    >
                      {createProductSaleMutation.isPending ? 'Recording...' : 'Record Sale'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowRecordSaleModal(false)
                        setProductSearchTerm('')
                        resetSaleForm()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Record Service Modal */}
        {showRecordServiceModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Record Service Transaction</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRecordServiceModal(false)
                    resetServiceForm()
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Services */}
                <div className="space-y-6">
                  {/* Services Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">Services Performed</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addItemToService}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {serviceForm.items.map((item, index) => {
                        const selectedService = services.find((s: any) => s.id === parseInt(item.service))
                        return (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Service {index + 1}</span>
                            {serviceForm.items.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItemFromService(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>

                          <select
                            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={item.service}
                            onChange={(e) => {
                              const serviceId = e.target.value
                              const service = services.find((s: any) => s.id === parseInt(serviceId))
                              setServiceForm(prev => ({
                                ...prev,
                                items: prev.items.map((it, i) =>
                                  i === index ? { ...it, service: serviceId, unit_price: parseFloat(service?.base_price || 0) } : it
                                )
                              }))
                            }}
                          >
                            <option value="">Select service</option>
                            {services.filter((s: any) => s.name).map((service: any) => (
                              <option key={service.id} value={service.id}>
                                {service.name} {service.category ? `- ${service.category}` : ''} ({formatCurrency(parseFloat(service.base_price || 0))})
                              </option>
                            ))}
                          </select>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1">Quantity</label>
                              <input
                                type="number"
                                min="1"
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={item.quantity}
                                onChange={(e) => setServiceForm(prev => ({
                                  ...prev,
                                  items: prev.items.map((it, i) =>
                                    i === index ? { ...it, quantity: Number(e.target.value) } : it
                                  )
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Unit Price (₦)</label>
                              <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={item.unit_price}
                                onChange={(e) => setServiceForm(prev => ({
                                  ...prev,
                                  items: prev.items.map((it, i) =>
                                    i === index ? { ...it, unit_price: Number(e.target.value) } : it
                                  )
                                }))}
                              />
                            </div>
                          </div>
                          {selectedService && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {selectedService.code} • {selectedService.category || 'N/A'}
                            </div>
                          )}
                          <div className="text-right font-medium text-lg">
                            Item Total: {formatCurrency(item.quantity * item.unit_price)}
                          </div>
                        </div>
                        )
                      })}

                    </div>
                  </div>

                  {/* Transaction Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Transaction Details</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Service Date</label>
                        <input
                          type="date"
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          value={serviceForm.date}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Payment Method</label>
                        <select
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          value={serviceForm.payment_method}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, payment_method: e.target.value as any }))}
                        >
                          <option value="cash">Cash</option>
                          <option value="pos">POS Payment</option>
                          <option value="bank_transfer">Bank Transfer</option>
                        </select>
                      </div>
                      {serviceForm.payment_method === 'bank_transfer' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Bank Reference</label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={serviceForm.bank_reference}
                            onChange={(e) => setServiceForm(prev => ({ ...prev, bank_reference: e.target.value }))}
                            placeholder="Enter bank reference number"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Service Summary */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg">Service Summary</h4>
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total Amount:</span>
                        <span className="text-primary">{formatCurrency(calculateServiceTotal().total)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={4}
                      value={serviceForm.comment}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Additional notes about the service..."
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      className="w-full mofad-btn-primary"
                      onClick={handleSubmitService}
                      disabled={createServiceMutation.isPending || serviceForm.items.some(it => !it.service || !it.unit_price)}
                    >
                      {createServiceMutation.isPending ? 'Recording...' : 'Record Service'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowRecordServiceModal(false)
                        resetServiceForm()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Create Expense Modal */}
        {showCreateExpenseModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Record Expense</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateExpenseModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                alert('Expense creation functionality to be implemented')
                setShowCreateExpenseModal(false)
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Equipment repair, Utility bill"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date *</label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Additional notes or details..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCreateExpenseModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 mofad-btn-primary"
                  >
                    Record Expense
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Create Lodgement Modal */}
        {showCreateLodgementModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Record Lodgement</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateLodgementModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                alert('Lodgement creation functionality to be implemented')
                setShowCreateLodgementModal(false)
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount Lodged *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date *</label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    defaultValue="bank_transfer"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="pos">POS</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bank Name</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., First Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deposit Slip #</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Teller/slip number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Bank lodgement description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={2}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCreateLodgementModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 mofad-btn-primary"
                  >
                    Record Lodgement
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Transaction Detail Modal */}
        {showTransactionDetailModal && selectedTransaction && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Transaction Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowTransactionDetailModal(false)
                      setSelectedTransaction(null)
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Transaction Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction Number</p>
                      <p className="font-semibold">{selectedTransaction.transaction_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction Date</p>
                      <p className="font-semibold">{formatDateTime(selectedTransaction.date || selectedTransaction.transaction_date || selectedTransaction.created_datetime || selectedTransaction.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-semibold capitalize">{selectedTransaction.paymentMethod || selectedTransaction.payment_method || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-primary text-xl">{formatCurrency(selectedTransaction.total_amount || selectedTransaction.total || selectedTransaction.amount || 0)}</p>
                    </div>
                    {selectedTransaction.approval_status && (
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceStatusBadge(selectedTransaction.approval_status)}`}>
                          {selectedTransaction.approval_status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                    {selectedTransaction.bank_reference && (
                      <div>
                        <p className="text-sm text-muted-foreground">Bank Reference</p>
                        <p className="font-semibold">{selectedTransaction.bank_reference}</p>
                      </div>
                    )}
                  </div>

                  {/* Items/Services */}
                  {(selectedTransaction.transaction_type === 'lubricant_sales' || selectedTransaction.products) && (
                    <div>
                      <h4 className="font-semibold mb-3">Products Sold</h4>
                      {((selectedTransaction.items && selectedTransaction.items.length > 0) || (selectedTransaction.products && selectedTransaction.products.length > 0)) ? (
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left py-2 px-3 text-sm font-medium">Product</th>
                                <th className="text-center py-2 px-3 text-sm font-medium">Qty</th>
                                <th className="text-right py-2 px-3 text-sm font-medium">Unit Price</th>
                                <th className="text-right py-2 px-3 text-sm font-medium">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {(selectedTransaction.items || selectedTransaction.products || []).map((item: any, index: number) => (
                                <tr key={index}>
                                  <td className="py-2 px-3 text-sm">{item.product_name || item.name || 'N/A'}</td>
                                  <td className="py-2 px-3 text-sm text-center">{item.quantity || 1}</td>
                                  <td className="py-2 px-3 text-sm text-right">{formatCurrency(item.unit_price || item.unitPrice || 0)}</td>
                                  <td className="py-2 px-3 text-sm text-right font-semibold">{formatCurrency(item.total_price || item.total || 0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No item details available</p>
                      )}
                    </div>
                  )}

                  {(selectedTransaction.transaction_type === 'services' || selectedTransaction.services) && (
                    <div>
                      <h4 className="font-semibold mb-3">Services Performed</h4>
                      {((selectedTransaction.items && selectedTransaction.items.length > 0) || (selectedTransaction.services && selectedTransaction.services.length > 0)) ? (
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left py-2 px-3 text-sm font-medium">Service</th>
                                <th className="text-center py-2 px-3 text-sm font-medium">Qty</th>
                                <th className="text-right py-2 px-3 text-sm font-medium">Unit Price</th>
                                <th className="text-right py-2 px-3 text-sm font-medium">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {(selectedTransaction.items || selectedTransaction.services || []).map((item: any, index: number) => (
                                <tr key={index}>
                                  <td className="py-2 px-3 text-sm">{item.service_name || item.name || 'N/A'}</td>
                                  <td className="py-2 px-3 text-sm text-center">{item.quantity || 1}</td>
                                  <td className="py-2 px-3 text-sm text-right">{formatCurrency(item.unit_price || item.price || 0)}</td>
                                  <td className="py-2 px-3 text-sm text-right font-semibold">{formatCurrency(item.total_price || item.total || 0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No service details available</p>
                      )}

                      {/* Vehicle Info for Services */}
                      {selectedTransaction.vehicleInfo && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-semibold mb-2">Vehicle Information</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Vehicle:</span>
                              <span className="ml-2 font-medium">{selectedTransaction.vehicleInfo.make} {selectedTransaction.vehicleInfo.model} ({selectedTransaction.vehicleInfo.year})</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Plate:</span>
                              <span className="ml-2 font-medium">{selectedTransaction.vehicleInfo.plateNumber}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Customer Information */}
                  {(selectedTransaction.customerName || selectedTransaction.customer_name || selectedTransaction.customerPhone) && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="text-sm font-semibold mb-2">Customer Information</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {(selectedTransaction.customerName || selectedTransaction.customer_name) && (
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <span className="ml-2 font-medium">{selectedTransaction.customerName || selectedTransaction.customer_name}</span>
                          </div>
                        )}
                        {selectedTransaction.customerPhone && (
                          <div>
                            <span className="text-muted-foreground">Phone:</span>
                            <span className="ml-2 font-medium">{selectedTransaction.customerPhone}</span>
                          </div>
                        )}
                        {(selectedTransaction.salesRep || selectedTransaction.sales_rep) && (
                          <div>
                            <span className="text-muted-foreground">Sales Rep:</span>
                            <span className="ml-2 font-medium">{selectedTransaction.salesRep || selectedTransaction.sales_rep}</span>
                          </div>
                        )}
                        {selectedTransaction.technician && (
                          <div>
                            <span className="text-muted-foreground">Technician:</span>
                            <span className="ml-2 font-medium">{selectedTransaction.technician}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Transaction Breakdown */}
                  {(selectedTransaction.subtotal || selectedTransaction.tax || selectedTransaction.discount || selectedTransaction.laborCost || selectedTransaction.partsCost) && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-semibold mb-2">Cost Breakdown</h5>
                      <div className="space-y-1 text-sm">
                        {selectedTransaction.subtotal && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium">{formatCurrency(selectedTransaction.subtotal)}</span>
                          </div>
                        )}
                        {selectedTransaction.laborCost && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Labor Cost:</span>
                            <span className="font-medium">{formatCurrency(selectedTransaction.laborCost)}</span>
                          </div>
                        )}
                        {selectedTransaction.partsCost && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Parts Cost:</span>
                            <span className="font-medium">{formatCurrency(selectedTransaction.partsCost)}</span>
                          </div>
                        )}
                        {selectedTransaction.tax && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax:</span>
                            <span className="font-medium">{formatCurrency(selectedTransaction.tax)}</span>
                          </div>
                        )}
                        {selectedTransaction.discount && selectedTransaction.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span className="font-medium">-{formatCurrency(selectedTransaction.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-primary">{formatCurrency(selectedTransaction.total_amount || selectedTransaction.total || selectedTransaction.amount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes/Comments */}
                  {(selectedTransaction.comment || selectedTransaction.notes) && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">{selectedTransaction.comment || selectedTransaction.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTransactionDetailModal(false)
                      setSelectedTransaction(null)
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Edit Expense Modal */}
        {showEditExpenseModal && selectedExpense && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Edit Expense</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditExpenseModal(false)
                    setSelectedExpense(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  await apiClient.put(`/carwash-expenses/${selectedExpense.id}/`, {
                    carwash: carwashId,
                    name: editExpenseForm.name || selectedExpense.name,
                    amount: editExpenseForm.amount || selectedExpense.amount,
                    expense_date: editExpenseForm.expense_date || selectedExpense.expense_date,
                    expense_type: editExpenseForm.expense_type !== null ? editExpenseForm.expense_type : selectedExpense.expense_type,
                    notes: editExpenseForm.notes || selectedExpense.notes
                  })
                  queryClient.invalidateQueries({ queryKey: ['carwash-expenses'] })
                  setShowEditExpenseModal(false)
                  setSelectedExpense(null)
                  alert('Expense updated successfully!')
                } catch (error: any) {
                  alert(`Failed to update expense: ${error.message}`)
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    defaultValue={selectedExpense.name}
                    onChange={(e) => setEditExpenseForm({...editExpenseForm, name: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      defaultValue={selectedExpense.amount}
                      onChange={(e) => setEditExpenseForm({...editExpenseForm, amount: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date *</label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      defaultValue={selectedExpense.expense_date}
                      onChange={(e) => setEditExpenseForm({...editExpenseForm, expense_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md"
                    rows={3}
                    defaultValue={selectedExpense.notes || ''}
                    onChange={(e) => setEditExpenseForm({...editExpenseForm, notes: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowEditExpenseModal(false)
                      setSelectedExpense(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 mofad-btn-primary"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Edit Lodgement Modal */}
        {showEditLodgementModal && selectedLodgement && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Edit Lodgement</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditLodgementModal(false)
                    setSelectedLodgement(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  await apiClient.put(`/lodgements/${selectedLodgement.id}/`, {
                    carwash: carwashId,
                    lodgement_type: 'carwash',
                    amount_lodged: editLodgementForm.amount_lodged || selectedLodgement.amount_lodged,
                    lodgement_date: editLodgementForm.lodgement_date || selectedLodgement.lodgement_date,
                    payment_method: editLodgementForm.payment_method || selectedLodgement.payment_method,
                    bank_name: editLodgementForm.bank_name || selectedLodgement.bank_name,
                    deposit_slip_number: editLodgementForm.deposit_slip_number || selectedLodgement.deposit_slip_number,
                    description: editLodgementForm.description || selectedLodgement.description,
                    notes: editLodgementForm.notes || selectedLodgement.notes
                  })
                  queryClient.invalidateQueries({ queryKey: ['carwash-lodgements'] })
                  setShowEditLodgementModal(false)
                  setSelectedLodgement(null)
                  alert('Lodgement updated successfully!')
                } catch (error: any) {
                  alert(`Failed to update lodgement: ${error.message}`)
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount Lodged *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      defaultValue={selectedLodgement.amount_lodged}
                      onChange={(e) => setEditLodgementForm({...editLodgementForm, amount_lodged: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date *</label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      defaultValue={selectedLodgement.lodgement_date}
                      onChange={(e) => setEditLodgementForm({...editLodgementForm, lodgement_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bank Name</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      defaultValue={selectedLodgement.bank_name || ''}
                      onChange={(e) => setEditLodgementForm({...editLodgementForm, bank_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deposit Slip #</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      defaultValue={selectedLodgement.deposit_slip_number || ''}
                      onChange={(e) => setEditLodgementForm({...editLodgementForm, deposit_slip_number: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md"
                    rows={2}
                    defaultValue={selectedLodgement.notes || ''}
                    onChange={(e) => setEditLodgementForm({...editLodgementForm, notes: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowEditLodgementModal(false)
                      setSelectedLodgement(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 mofad-btn-primary"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Edit Sale/Service Modal */}
        {(showEditSaleModal || showEditServiceModal) && selectedTransaction && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">
                    {showEditSaleModal ? 'Edit Product Sale' : 'Edit Service'}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedTransaction.transaction_number}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditSaleModal(false)
                    setShowEditServiceModal(false)
                    setSelectedTransaction(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  const updateData = {
                    payment_method: editTransactionForm.payment_method || selectedTransaction.payment_method,
                    bank_reference: editTransactionForm.bank_reference || selectedTransaction.bank_reference,
                    comment: editTransactionForm.comment || selectedTransaction.comment,
                    items: editTransactionForm.items.length > 0 ? editTransactionForm.items.map(item => ({
                      service: item.service,
                      quantity: item.quantity,
                      unit_price: item.unit_price,
                      notes: item.notes
                    })) : undefined
                  }

                  await apiClient.put(`/carwash-service-transactions/${selectedTransaction.id}/`, updateData)
                  queryClient.invalidateQueries({ queryKey: ['carwash-service-transactions'] })
                  setShowEditSaleModal(false)
                  setShowEditServiceModal(false)
                  setSelectedTransaction(null)
                  setEditTransactionForm({
                    payment_method: 'cash',
                    bank_reference: '',
                    comment: '',
                    items: []
                  })
                  alert('Transaction updated successfully!')
                } catch (error: any) {
                  alert(`Failed to update transaction: ${error.message}`)
                }
              }} className="space-y-6">

                {/* Payment Information */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-3">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Payment Method</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-md"
                        defaultValue={selectedTransaction.payment_method}
                        onChange={(e) => setEditTransactionForm({
                          ...editTransactionForm,
                          payment_method: e.target.value as 'cash' | 'pos' | 'bank_transfer'
                        })}
                      >
                        <option value="cash">Cash</option>
                        <option value="pos">POS</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bank Reference</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-md"
                        defaultValue={selectedTransaction.bank_reference || ''}
                        onChange={(e) => setEditTransactionForm({
                          ...editTransactionForm,
                          bank_reference: e.target.value
                        })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>

                {/* Transaction Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">
                      {showEditSaleModal ? 'Products' : 'Services'}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditTransactionForm({
                          ...editTransactionForm,
                          items: [
                            ...editTransactionForm.items,
                            { service: 0, quantity: 1, unit_price: 0, notes: '' }
                          ]
                        })
                      }}
                      className="text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  {editTransactionForm.items.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-2 px-3 text-sm font-medium">
                              {showEditSaleModal ? 'Product' : 'Service'}
                            </th>
                            <th className="text-center py-2 px-3 text-sm font-medium w-24">Qty</th>
                            <th className="text-right py-2 px-3 text-sm font-medium w-32">Unit Price</th>
                            <th className="text-right py-2 px-3 text-sm font-medium w-32">Total</th>
                            <th className="w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {editTransactionForm.items.map((item: any, index: number) => {
                            const itemTotal = (item.quantity || 0) * (item.unit_price || 0)
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="py-2 px-3">
                                  <select
                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                    value={item.service || 0}
                                    onChange={(e) => {
                                      const serviceId = parseInt(e.target.value)
                                      const service = availableServices?.find((s: any) => s.id === serviceId)
                                      const newItems = [...editTransactionForm.items]
                                      newItems[index] = {
                                        ...newItems[index],
                                        service: serviceId,
                                        service_name: service?.name,
                                        unit_price: service?.base_price || newItems[index].unit_price
                                      }
                                      setEditTransactionForm({ ...editTransactionForm, items: newItems })
                                    }}
                                  >
                                    <option value={0}>Select {showEditSaleModal ? 'Product' : 'Service'}</option>
                                    {availableServices?.map((service: any) => (
                                      <option key={service.id} value={service.id}>
                                        {service.name} - {formatCurrency(service.base_price || 0)}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border border-gray-300 rounded text-sm text-center"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const newItems = [...editTransactionForm.items]
                                      newItems[index].quantity = parseInt(e.target.value) || 1
                                      setEditTransactionForm({ ...editTransactionForm, items: newItems })
                                    }}
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full p-2 border border-gray-300 rounded text-sm text-right"
                                    value={item.unit_price}
                                    onChange={(e) => {
                                      const newItems = [...editTransactionForm.items]
                                      newItems[index].unit_price = parseFloat(e.target.value) || 0
                                      setEditTransactionForm({ ...editTransactionForm, items: newItems })
                                    }}
                                  />
                                </td>
                                <td className="py-2 px-3 text-sm text-right font-semibold">
                                  {formatCurrency(itemTotal)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newItems = editTransactionForm.items.filter((_, i) => i !== index)
                                      setEditTransactionForm({ ...editTransactionForm, items: newItems })
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2">
                          <tr>
                            <td colSpan={3} className="py-2 px-3 text-sm font-semibold text-right">Total:</td>
                            <td className="py-2 px-3 text-sm text-right font-bold text-primary">
                              {formatCurrency(
                                editTransactionForm.items.reduce((sum, item) =>
                                  sum + ((item.quantity || 0) * (item.unit_price || 0)), 0
                                )
                              )}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded">
                      No items added yet. Click &ldquo;Add Item&rdquo; to start.
                    </p>
                  )}
                </div>

                {/* Notes/Comments */}
                <div>
                  <label className="block text-sm font-medium mb-2">Notes/Comments</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md"
                    rows={3}
                    defaultValue={selectedTransaction.comment || ''}
                    onChange={(e) => setEditTransactionForm({
                      ...editTransactionForm,
                      comment: e.target.value
                    })}
                    placeholder="Add any notes about this transaction..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowEditSaleModal(false)
                      setShowEditServiceModal(false)
                      setSelectedTransaction(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 mofad-btn-primary"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deleteTarget && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteTarget(null)
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete this {deleteTarget.type}?
                </p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <strong>{deleteTarget.name}</strong>
                </p>
                <p className="text-sm text-red-600 mt-3">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteTarget(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={async () => {
                    try {
                      let endpoint = ''
                      switch (deleteTarget.type) {
                        case 'sale':
                        case 'service':
                          endpoint = `/carwash-service-transactions/${deleteTarget.id}/`
                          break
                        case 'expense':
                          endpoint = `/carwash-expenses/${deleteTarget.id}/`
                          break
                        case 'lodgement':
                          endpoint = `/lodgements/${deleteTarget.id}/`
                          break
                      }

                      await apiClient.delete(endpoint)

                      // Refresh the data
                      queryClient.invalidateQueries({ queryKey: ['carwash-service-transactions'] })
                      queryClient.invalidateQueries({ queryKey: ['carwash-expenses'] })
                      queryClient.invalidateQueries({ queryKey: ['carwash-lodgements'] })

                      setShowDeleteConfirm(false)
                      setDeleteTarget(null)

                      alert(`${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted successfully!`)
                    } catch (error: any) {
                      console.error('Delete error:', error)
                      alert(`Failed to delete: ${error.message || 'Unknown error'}`)
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Bin Card Modal */}
        {showBinCardModal && selectedInventoryItem && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Bin Card - {selectedInventoryItem.product_name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Product Code: {selectedInventoryItem.product_code} | Current Stock: {Number(selectedInventoryItem.quantity_on_hand).toFixed(2)} {selectedInventoryItem.unit_of_measure}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowBinCardModal(false)
                    setSelectedInventoryItem(null)
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {binCardLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading transaction history...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Reference</th>
                        <th className="text-right py-3 px-4 font-medium">Qty In</th>
                        <th className="text-right py-3 px-4 font-medium">Qty Out</th>
                        <th className="text-right py-3 px-4 font-medium">Balance</th>
                        <th className="text-left py-3 px-4 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {binCardData?.results && binCardData.results.length > 0 ? (
                        binCardData.results.map((txn: any, index: number) => {
                          const isReceipt = txn.transaction_type === 'receipt' || txn.transaction_type === 'purchase'
                          const isIssue = txn.transaction_type === 'issue' || txn.transaction_type === 'sale'

                          return (
                            <tr key={txn.id || index} className="hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="text-sm">{new Date(txn.transaction_date).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">{new Date(txn.transaction_date).toLocaleTimeString()}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  isReceipt
                                    ? 'bg-green-100 text-green-800'
                                    : isIssue
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {txn.transaction_type}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm font-medium">{txn.reference_number || '-'}</div>
                                {txn.reference_type && (
                                  <div className="text-xs text-gray-500">{txn.reference_type}</div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {isReceipt ? (
                                  <span className="font-bold text-green-600">+{Number(txn.quantity).toFixed(2)}</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {isIssue ? (
                                  <span className="font-bold text-red-600">-{Number(txn.quantity).toFixed(2)}</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-bold">{Number(txn.balance_after || 0).toFixed(2)}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">{txn.notes || '-'}</span>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
                            <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p>No transaction history available</p>
                            <p className="text-sm mt-1">Transactions will appear here once recorded</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBinCardModal(false)
                    setSelectedInventoryItem(null)
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Stock Upload Modal */}
        {showUploadModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Upload Stock Count</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFile(null)
                    setUploadProgress({ status: 'idle', created: 0, updated: 0, errors: [] })
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Download the template using the "Download Template" button</li>
                    <li>Fill in the quantity and cost columns in Excel</li>
                    <li>Save the file (Excel .xlsx or CSV format)</li>
                    <li>Upload it here</li>
                  </ol>
                  <p className="text-xs text-blue-700 mt-2">
                    <strong>Required columns:</strong> warehouse_id, product_code, quantity_on_hand, average_cost
                  </p>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {uploadFile ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="w-12 h-12 mx-auto text-green-600" />
                      <p className="font-medium text-gray-900">{uploadFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadFile.size / 1024).toFixed(2)} KB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadFile(null)}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          Click to select file
                        </span>
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Supports CSV, Excel (.xlsx, .xls)
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadProgress.status !== 'idle' && (
                  <div className={`rounded-lg p-4 ${
                    uploadProgress.status === 'uploading' ? 'bg-blue-50 border border-blue-200' :
                    uploadProgress.status === 'success' ? 'bg-green-50 border border-green-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    {uploadProgress.status === 'uploading' && (
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <p className="text-blue-900 font-medium">Uploading stock data...</p>
                      </div>
                    )}

                    {uploadProgress.status === 'success' && (
                      <div className="space-y-2">
                        <p className="text-green-900 font-semibold">Upload Successful!</p>
                        <div className="text-sm text-green-800">
                          <p>Created: {uploadProgress.created} items</p>
                          <p>Updated: {uploadProgress.updated} items</p>
                        </div>
                        {uploadProgress.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="text-orange-900 font-medium">Warnings:</p>
                            <ul className="text-xs text-orange-800 list-disc list-inside max-h-32 overflow-y-auto">
                              {uploadProgress.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {uploadProgress.status === 'error' && (
                      <div className="space-y-2">
                        <p className="text-red-900 font-semibold">Upload Failed</p>
                        <ul className="text-sm text-red-800 list-disc list-inside max-h-32 overflow-y-auto">
                          {uploadProgress.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUploadModal(false)
                      setUploadFile(null)
                      setUploadProgress({ status: 'idle', created: 0, updated: 0, errors: [] })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleUploadStock}
                    disabled={!uploadFile || uploadProgress.status === 'uploading'}
                  >
                    {uploadProgress.status === 'uploading' ? 'Uploading...' : 'Upload Stock'}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AppLayout>
  )
}