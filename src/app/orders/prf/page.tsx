'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { PRF, Warehouse, Product, Customer } from '@/types/api'
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Save,
  Calendar,
  User,
  Building,
  Loader2,
  RefreshCw,
  Send,
  Check,
  Ban,
} from 'lucide-react'

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft':
      return <Edit className="w-4 h-4 text-gray-500" />
    case 'submitted':
      return <Clock className="w-4 h-4 text-yellow-500" />
    case 'approved':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'rejected':
      return <XCircle className="w-4 h-4 text-red-500" />
    case 'partially_fulfilled':
      return <AlertTriangle className="w-4 h-4 text-blue-500" />
    case 'fulfilled':
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case 'cancelled':
      return <Ban className="w-4 h-4 text-gray-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    partially_fulfilled: 'bg-blue-100 text-blue-800',
    fulfilled: 'bg-green-200 text-green-900',
    cancelled: 'bg-gray-200 text-gray-700',
  }

  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
    partially_fulfilled: 'Partially Fulfilled',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
      {labels[status] || status}
    </span>
  )
}

const getPriorityBadge = (priority: string) => {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || colors.medium}`}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  )
}

interface PRFItem {
  id?: number
  product: number
  product_name?: string
  product_code?: string
  quantity: number
  unit_price: number
  total_amount: number
  notes?: string
}

interface PRFFormData {
  prf_number?: string
  customer: number
  customer_name?: string
  customer_location: number
  customer_location_name?: string
  order_date: string
  order_reference?: string
  notes?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  items: PRFItem[]
  estimated_total: number
}

const initialFormData: PRFFormData = {
  customer: 0,
  customer_name: '',
  customer_location: 0,
  customer_location_name: '',
  order_date: new Date().toISOString().split('T')[0], // Current date
  order_reference: '',
  notes: '',
  priority: 'medium',
  items: [],
  estimated_total: 0,
}

export default function PRFPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedPRF, setSelectedPRF] = useState<PRF | null>(null)
  const [formData, setFormData] = useState<PRFFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Helper functions for localStorage management
  const getMockPRFs = (): PRF[] => {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem('mofad_mock_prfs')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error reading PRFs from localStorage:', error)
    }

    // Default mock data if none stored
    const defaultMockPRFs: PRF[] = [
      {
        id: 1,
        prf_number: 'PRF-2024-001',
        title: 'Office Supplies Purchase',
        purpose: 'Monthly office supplies procurement',
        description: 'Purchase of office stationery, printing paper, and consumables',
        department: 'Operations',
        status: 'submitted',
        priority: 'medium',
        estimated_total: 125000,
        delivery_location: 1,
        expected_delivery_date: '2024-01-15',
        budget_code: 'OP-SUP-2024',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      },
      {
        id: 2,
        prf_number: 'PRF-2024-002',
        title: 'IT Equipment Procurement',
        purpose: 'New laptops for development team',
        description: 'Purchase of 5 laptops for expanding development team',
        department: 'IT',
        status: 'approved',
        priority: 'high',
        estimated_total: 750000,
        delivery_location: 1,
        expected_delivery_date: '2024-01-20',
        budget_code: 'IT-EQP-2024',
        created_at: '2024-01-02T09:30:00Z',
        updated_at: '2024-01-02T09:30:00Z'
      },
      {
        id: 3,
        prf_number: 'PRF-2024-003',
        title: 'Vehicle Maintenance',
        purpose: 'Quarterly vehicle service',
        description: 'Regular maintenance for company vehicles',
        department: 'Operations',
        status: 'draft',
        priority: 'low',
        estimated_total: 85000,
        delivery_location: 2,
        expected_delivery_date: '2024-01-25',
        budget_code: 'VH-MNT-2024',
        created_at: '2024-01-03T11:15:00Z',
        updated_at: '2024-01-03T11:15:00Z'
      }
    ]

    // Store default data
    saveMockPRFs(defaultMockPRFs)
    return defaultMockPRFs
  }

  const saveMockPRFs = (prfs: PRF[]) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('mofad_mock_prfs', JSON.stringify(prfs))
    } catch (error) {
      console.error('Error saving PRFs to localStorage:', error)
    }
  }

  const getNextPRFId = (): number => {
    const existingPRFs = getMockPRFs()
    return existingPRFs.length > 0 ? Math.max(...existingPRFs.map(p => p.id)) + 1 : 1
  }

  // Check if we should use mock API
  const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API !== 'false'

  // Fetch PRFs (use mock data when backend is disabled)
  const { data: prfData, isLoading, error, refetch } = useQuery({
    queryKey: ['prfs', searchTerm, statusFilter, priorityFilter],
    queryFn: async () => {
      if (!USE_REAL_API) {
        // Use localStorage mock data directly when mock mode is enabled
        console.log('🔧 Using localStorage mock data (mock mode enabled)')
        const storedPRFs = getMockPRFs()

        // Apply filters to stored data
        let filteredPRFs = storedPRFs
        if (statusFilter !== 'all') {
          filteredPRFs = filteredPRFs.filter(prf => prf.status === statusFilter)
        }
        if (priorityFilter !== 'all') {
          filteredPRFs = filteredPRFs.filter(prf => prf.priority === priorityFilter)
        }
        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          filteredPRFs = filteredPRFs.filter(prf =>
            prf.prf_number.toLowerCase().includes(term) ||
            prf.title?.toLowerCase().includes(term) ||
            prf.purpose?.toLowerCase().includes(term)
          )
        }

        return filteredPRFs
      }

      // Only try real API when explicitly enabled
      try {
        const params: Record<string, string> = {}
        if (statusFilter !== 'all') params.status = statusFilter
        if (priorityFilter !== 'all') params.priority = priorityFilter
        if (searchTerm) params.search = searchTerm
        return apiClient.get<PRF[]>('/prfs/', params)
      } catch (error) {
        // Fallback to mock data if real API fails
        console.log('🔧 Real API failed, falling back to localStorage mock data')
        const storedPRFs = getMockPRFs()

        // Apply filters to stored data
        let filteredPRFs = storedPRFs
        if (statusFilter !== 'all') {
          filteredPRFs = filteredPRFs.filter(prf => prf.status === statusFilter)
        }
        if (priorityFilter !== 'all') {
          filteredPRFs = filteredPRFs.filter(prf => prf.priority === priorityFilter)
        }
        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          filteredPRFs = filteredPRFs.filter(prf =>
            prf.prf_number.toLowerCase().includes(term) ||
            prf.title?.toLowerCase().includes(term) ||
            prf.purpose?.toLowerCase().includes(term)
          )
        }

        return filteredPRFs
      }
    },
  })

  // Fetch warehouses for delivery location dropdown
  const { data: warehousesData, isLoading: isWarehousesLoading, error: warehousesError } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      if (!USE_REAL_API) {
        // Use mock warehouses data directly when mock mode is enabled
        console.log('🔧 Using mock warehouses data (mock mode enabled)')
        const mockData = [
          { id: 1, name: 'Main Warehouse - Lagos', location: 'Lagos', code: 'WH-LG-01' },
          { id: 2, name: 'Abuja Distribution Center', location: 'Abuja', code: 'WH-AB-01' },
          { id: 3, name: 'Port Harcourt Depot', location: 'Port Harcourt', code: 'WH-PH-01' }
        ]
        return mockData
      }

      // Only try real API when explicitly enabled
      try {
        return await apiClient.get<any[]>('/warehouses/')
      } catch (error) {
        // Fallback to mock data if real API fails
        console.log('🔧 Real warehouse API failed, using mock data')
        const mockData = [
          { id: 1, name: 'Main Warehouse - Lagos', location: 'Lagos', code: 'WH-LG-01' },
          { id: 2, name: 'Abuja Distribution Center', location: 'Abuja', code: 'WH-AB-01' },
          { id: 3, name: 'Port Harcourt Depot', location: 'Port Harcourt', code: 'WH-PH-01' }
        ]
        return mockData
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch customers for customer selection
  const { data: customersData, isLoading: isCustomersLoading, error: customersError } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!USE_REAL_API) {
        // Use mock customers data directly when mock mode is enabled
        console.log('🔧 Using mock customers data (mock mode enabled)')
        const mockData = [
          {
            id: 1,
            name: 'Total Nigeria Plc',
            business_name: 'Total Nigeria Plc',
            customer_code: 'TNP001',
            email: 'orders@total.com.ng',
            phone: '+234-1-2345678',
            credit_limit: 5000000,
            locations: [
              { id: 1, name: 'Total Head Office - Victoria Island, Lagos', address: 'Plot 991/992, Cadastral Zone A0, Central Business District, Lagos', primary: true },
              { id: 2, name: 'Total Abuja Office', address: '23 Ebitu Ukiwe Street, Jabi, Abuja', primary: false },
              { id: 3, name: 'Total Port Harcourt Branch', address: 'Plot 18, Trans Amadi Industrial Layout, Port Harcourt', primary: false }
            ]
          },
          {
            id: 2,
            name: 'Oando Marketing',
            business_name: 'Oando Marketing Plc',
            customer_code: 'OMP002',
            email: 'procurement@oando.com',
            phone: '+234-1-8765432',
            credit_limit: 3000000,
            locations: [
              { id: 4, name: 'Oando Towers - Lekki, Lagos', address: '2 Ajose Adeogun Street, Victoria Island, Lagos', primary: true },
              { id: 5, name: 'Oando Kano Office', address: '12 Murtala Muhammad Way, Kano', primary: false }
            ]
          },
          {
            id: 3,
            name: 'Mobil Oil Nigeria',
            business_name: 'Mobil Oil Nigeria',
            customer_code: 'MON003',
            email: 'orders@mobil.com.ng',
            phone: '+234-1-5556789',
            credit_limit: 4500000,
            locations: [
              { id: 6, name: 'Mobil House - Lagos Island', address: '1 Lekki-Epe Expressway, Lagos', primary: true },
              { id: 7, name: 'Mobil Warri Office', address: 'Petrolex House, Warri, Delta State', primary: false },
              { id: 8, name: 'Mobil Kaduna Depot', address: 'KM 16, Kaduna-Abuja Expressway, Kaduna', primary: false }
            ]
          }
        ]
        return mockData
      }

      // Only try real API when explicitly enabled
      try {
        return await apiClient.get<any[]>('/customers/')
      } catch (error) {
        // Fallback to mock data if real API fails
        console.log('🔧 Real customer API failed, using mock data')
        const mockData = [
          {
            id: 1,
            name: 'Total Nigeria Plc',
            business_name: 'Total Nigeria Plc',
            customer_code: 'TNP001',
            email: 'orders@total.com.ng',
            phone: '+234-1-2345678',
            credit_limit: 5000000,
            locations: [
              { id: 1, name: 'Total Head Office - Victoria Island, Lagos', address: 'Plot 991/992, Cadastral Zone A0, Central Business District, Lagos', primary: true },
              { id: 2, name: 'Total Abuja Office', address: '23 Ebitu Ukiwe Street, Jabi, Abuja', primary: false },
              { id: 3, name: 'Total Port Harcourt Branch', address: 'Plot 18, Trans Amadi Industrial Layout, Port Harcourt', primary: false }
            ]
          },
          {
            id: 2,
            name: 'Oando Marketing',
            business_name: 'Oando Marketing Plc',
            customer_code: 'OMP002',
            email: 'procurement@oando.com',
            phone: '+234-1-8765432',
            credit_limit: 3000000,
            locations: [
              { id: 4, name: 'Oando Towers - Lekki, Lagos', address: '2 Ajose Adeogun Street, Victoria Island, Lagos', primary: true },
              { id: 5, name: 'Oando Kano Office', address: '12 Murtala Muhammad Way, Kano', primary: false }
            ]
          },
          {
            id: 3,
            name: 'Mobil Oil Nigeria',
            business_name: 'Mobil Oil Nigeria',
            customer_code: 'MON003',
            email: 'orders@mobil.com.ng',
            phone: '+234-1-5556789',
            credit_limit: 4500000,
            locations: [
              { id: 6, name: 'Mobil House - Lagos Island', address: '1 Lekki-Epe Expressway, Lagos', primary: true },
              { id: 7, name: 'Mobil Warri Office', address: 'Petrolex House, Warri, Delta State', primary: false },
              { id: 8, name: 'Mobil Kaduna Depot', address: 'KM 16, Kaduna-Abuja Expressway, Kaduna', primary: false }
            ]
          }
        ]
        return mockData
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch products for product selection
  const { data: productsData, isLoading: isProductsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!USE_REAL_API) {
        // Use mock products data directly when mock mode is enabled
        console.log('🔧 Using mock products data (mock mode enabled)')
        const mockData = [
          {
            id: 1,
            name: 'Premium Motor Spirit (PMS)',
            code: 'PMS-001',
            bulk_selling_price: 617,
            retail_selling_price: 650,
            category: 'Petroleum Products'
          },
          {
            id: 2,
            name: 'Automotive Gas Oil (Diesel)',
            code: 'AGO-001',
            bulk_selling_price: 1050,
            retail_selling_price: 1100,
            category: 'Petroleum Products'
          },
          {
            id: 3,
            name: 'Dual Purpose Kerosene (DPK)',
            code: 'DPK-001',
            bulk_selling_price: 850,
            retail_selling_price: 900,
            category: 'Petroleum Products'
          },
          {
            id: 4,
            name: 'Engine Oil SAE 20W-50',
            code: 'ENG-001',
            bulk_selling_price: 3500,
            retail_selling_price: 3800,
            category: 'Lubricants'
          }
        ]
        return mockData
      }

      // Only try real API when explicitly enabled
      try {
        return await apiClient.get<any[]>('/products/')
      } catch (error) {
        // Fallback to mock data if real API fails
        console.log('🔧 Real products API failed, using mock data')
        const mockData = [
          {
            id: 1,
            name: 'Premium Motor Spirit (PMS)',
            code: 'PMS-001',
            bulk_selling_price: 617,
            retail_selling_price: 650,
            category: 'Petroleum Products'
          },
          {
            id: 2,
            name: 'Automotive Gas Oil (Diesel)',
            code: 'AGO-001',
            bulk_selling_price: 1050,
            retail_selling_price: 1100,
            category: 'Petroleum Products'
          },
          {
            id: 3,
            name: 'Dual Purpose Kerosene (DPK)',
            code: 'DPK-001',
            bulk_selling_price: 850,
            retail_selling_price: 900,
            category: 'Petroleum Products'
          },
          {
            id: 4,
            name: 'Engine Oil SAE 20W-50',
            code: 'ENG-001',
            bulk_selling_price: 3500,
            retail_selling_price: 3800,
            category: 'Lubricants'
          }
        ]
        return mockData
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const prfs = Array.isArray(prfData) ? prfData : []
  const warehouses = Array.isArray(warehousesData) ? warehousesData : []
  const customers = Array.isArray(customersData) ? customersData : []
  const products = Array.isArray(productsData) ? productsData : []

  // Debug logging to help identify issues
  console.log('Dropdown Data Debug:', {
    warehouses: { count: warehouses.length, data: warehouses },
    customers: { count: customers.length, data: customers },
    products: { count: products.length, data: products },
    isWarehousesLoading,
    isCustomersLoading,
    isProductsLoading,
    warehousesError,
    customersError,
    productsError
  })

  // Create PRF mutation (with localStorage fallback)
  const createMutation = useMutation({
    mutationFn: async (data: PRFFormData) => {
      if (!USE_REAL_API) {
        // Use localStorage directly when mock mode is enabled
        console.log('🔧 Creating PRF in localStorage (mock mode enabled)')

        const existingPRFs = getMockPRFs()
        const newId = getNextPRFId()
        const now = new Date().toISOString()

        const newPRF: PRF = {
          id: newId,
          prf_number: data.prf_number || generatePRFNumber(),
          title: `Customer Order - ${data.customer_name || 'Unknown Customer'}`,
          purpose: `Purchase requisition for customer order ${data.order_reference || ''}`,
          description: data.notes || 'Customer purchase order',
          department: 'Sales',
          status: 'draft',
          priority: data.priority,
          estimated_total: data.estimated_total,
          delivery_location: data.customer_location,
          expected_delivery_date: data.order_date,
          budget_code: '',
          created_at: now,
          updated_at: now,
          // Additional fields for customer order
          customer: data.customer,
          customer_name: data.customer_name,
          order_reference: data.order_reference,
          notes: data.notes,
          items: data.items
        } as any

        const updatedPRFs = [...existingPRFs, newPRF as PRF]
        saveMockPRFs(updatedPRFs)

        return newPRF as PRF
      }

      // Only try real API when explicitly enabled
      try {
        return await apiClient.post<PRF>('/prfs/', data)
      } catch (error) {
        // Fallback to localStorage when real API is not available
        console.log('🔧 Creating PRF in localStorage (real API not available)')

        const existingPRFs = getMockPRFs()
        const newId = getNextPRFId()
        const now = new Date().toISOString()

        const newPRF: PRF = {
          id: newId,
          prf_number: data.prf_number || generatePRFNumber(),
          title: `Customer Order - ${data.customer_name || 'Unknown Customer'}`,
          purpose: `Purchase requisition for customer order ${data.order_reference || ''}`,
          description: data.notes || 'Customer purchase order',
          department: 'Sales',
          status: 'draft',
          priority: data.priority,
          estimated_total: data.estimated_total,
          delivery_location: data.customer_location,
          expected_delivery_date: data.order_date,
          budget_code: '',
          created_at: now,
          updated_at: now,
          // Additional fields for customer order
          customer: data.customer,
          customer_name: data.customer_name,
          order_reference: data.order_reference,
          notes: data.notes,
          items: data.items
        } as any

        const updatedPRFs = [...existingPRFs, newPRF as PRF]
        saveMockPRFs(updatedPRFs)

        return newPRF as PRF
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prfs'] })
      setShowAddModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'PRF created successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create PRF' })
      if (error.errors) setFormErrors(error.errors)
    },
  })

  // Update PRF mutation (with localStorage fallback)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PRFFormData> }) => {
      try {
        return await apiClient.patch<PRF>(`/prfs/${id}/`, data)
      } catch (error) {
        // Fallback to localStorage when backend is not available
        console.log('🔧 Updating PRF in localStorage (backend not available)')

        const existingPRFs = getMockPRFs()
        const prfIndex = existingPRFs.findIndex(p => p.id === id)

        if (prfIndex === -1) {
          throw new Error('PRF not found')
        }

        const updatedPRF: PRF = {
          ...existingPRFs[prfIndex],
          title: `Customer Order - ${data.customer_name || existingPRFs[prfIndex].title}`,
          purpose: `Purchase requisition for customer order ${data.order_reference || ''}`,
          description: data.notes || existingPRFs[prfIndex].description || '',
          department: 'Sales',
          priority: data.priority || existingPRFs[prfIndex].priority,
          estimated_total: data.estimated_total || existingPRFs[prfIndex].estimated_total,
          delivery_location: data.customer_location || existingPRFs[prfIndex].delivery_location,
          expected_delivery_date: data.order_date || existingPRFs[prfIndex].expected_delivery_date,
          budget_code: '',
          updated_at: new Date().toISOString(),
          // Update customer order fields
          customer: data.customer || (existingPRFs[prfIndex] as any).customer,
          customer_name: data.customer_name || (existingPRFs[prfIndex] as any).customer_name,
          order_reference: data.order_reference || (existingPRFs[prfIndex] as any).order_reference,
          notes: data.notes,
          items: data.items || (existingPRFs[prfIndex] as any).items
        }

        const updatedPRFs = [...existingPRFs]
        updatedPRFs[prfIndex] = updatedPRF
        saveMockPRFs(updatedPRFs)

        return updatedPRF
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prfs'] })
      setShowEditModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'PRF updated successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to update PRF' })
      if (error.errors) setFormErrors(error.errors)
    },
  })

  // Delete PRF mutation (with localStorage fallback)
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await apiClient.delete(`/prfs/${id}/`)
      } catch (error) {
        // Fallback to localStorage when backend is not available
        console.log('🔧 Deleting PRF in localStorage (backend not available)')

        const existingPRFs = getMockPRFs()
        const filteredPRFs = existingPRFs.filter(p => p.id !== id)
        saveMockPRFs(filteredPRFs)

        return { success: true }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prfs'] })
      setShowDeleteModal(false)
      setSelectedPRF(null)
      addToast({ type: 'success', title: 'Success', message: 'PRF deleted successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete PRF' })
    },
  })

  // Submit PRF mutation (with localStorage fallback)
  const submitMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await apiClient.post<PRF>(`/prfs/${id}/submit/`)
      } catch (error) {
        // Fallback to localStorage when backend is not available
        console.log('🔧 Submitting PRF in localStorage (backend not available)')

        const existingPRFs = getMockPRFs()
        const prfIndex = existingPRFs.findIndex(p => p.id === id)

        if (prfIndex === -1) {
          throw new Error('PRF not found')
        }

        const updatedPRF: PRF = {
          ...existingPRFs[prfIndex],
          status: 'submitted',
          updated_at: new Date().toISOString(),
        }

        const updatedPRFs = [...existingPRFs]
        updatedPRFs[prfIndex] = updatedPRF
        saveMockPRFs(updatedPRFs)

        return updatedPRF
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prfs'] })
      addToast({ type: 'success', title: 'Submitted', message: 'PRF submitted for approval' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to submit PRF' })
    },
  })

  // Approve PRF mutation (with localStorage fallback)
  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await apiClient.post<PRF>(`/prfs/${id}/approve/`)
      } catch (error) {
        // Fallback to localStorage when backend is not available
        console.log('🔧 Approving PRF in localStorage (backend not available)')

        const existingPRFs = getMockPRFs()
        const prfIndex = existingPRFs.findIndex(p => p.id === id)

        if (prfIndex === -1) {
          throw new Error('PRF not found')
        }

        const updatedPRF: PRF = {
          ...existingPRFs[prfIndex],
          status: 'approved',
          updated_at: new Date().toISOString(),
        }

        const updatedPRFs = [...existingPRFs]
        updatedPRFs[prfIndex] = updatedPRF
        saveMockPRFs(updatedPRFs)

        return updatedPRF
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prfs'] })
      setShowApprovalModal(false)
      setSelectedPRF(null)
      addToast({ type: 'success', title: 'Approved', message: 'PRF has been approved' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to approve PRF' })
    },
  })

  // Reject PRF mutation (with localStorage fallback)
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      try {
        return await apiClient.post<PRF>(`/prfs/${id}/reject/`, { reason })
      } catch (error) {
        // Fallback to localStorage when backend is not available
        console.log('🔧 Rejecting PRF in localStorage (backend not available)')

        const existingPRFs = getMockPRFs()
        const prfIndex = existingPRFs.findIndex(p => p.id === id)

        if (prfIndex === -1) {
          throw new Error('PRF not found')
        }

        const updatedPRF: PRF = {
          ...existingPRFs[prfIndex],
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        }

        const updatedPRFs = [...existingPRFs]
        updatedPRFs[prfIndex] = updatedPRF
        saveMockPRFs(updatedPRFs)

        return updatedPRF
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prfs'] })
      setShowApprovalModal(false)
      setSelectedPRF(null)
      setRejectionReason('')
      addToast({ type: 'info', title: 'Rejected', message: 'PRF has been rejected' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject PRF' })
    },
  })

  // Helper functions
  const resetForm = () => {
    setFormData(initialFormData)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Required fields validation
    if (!formData.customer) errors.customer = 'Customer is required'
    if (!formData.customer_location) errors.customer_location = 'Customer location is required'
    if (formData.items.length === 0) errors.items = 'At least one product item is required'

    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.product) errors[`items.${index}.product`] = 'Product is required'
      if (item.quantity <= 0) errors[`items.${index}.quantity`] = 'Quantity must be greater than 0'
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Helper functions for managing PRF items
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product: 0,
          quantity: 1,
          unit_price: 0,
          total_amount: 0,
        }
      ]
    })
  }

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    const newTotal = newItems.reduce((sum, item) => sum + item.total_amount, 0)
    setFormData({
      ...formData,
      items: newItems,
      estimated_total: newTotal
    })
  }

  const updateItem = (index: number, field: keyof PRFItem, value: any) => {
    const newItems = [...formData.items]
    const item = { ...newItems[index] }

    if (field === 'product') {
      const selectedProduct = products.find(p => p.id === value)
      if (selectedProduct) {
        item.product = value
        item.product_name = selectedProduct.name
        item.product_code = selectedProduct.code
        item.unit_price = selectedProduct.bulk_selling_price || 0 // Use direct sales price
      }
    } else if (field === 'quantity') {
      item.quantity = value
    } else {
      item[field] = value
    }

    // Recalculate total amount for this item
    item.total_amount = item.quantity * item.unit_price

    newItems[index] = item

    // Recalculate estimated total
    const newTotal = newItems.reduce((sum, item) => sum + item.total_amount, 0)

    setFormData({
      ...formData,
      items: newItems,
      estimated_total: newTotal
    })
  }

  const generatePRFNumber = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0')

    return `PRF-${year}${month}${day}-${time}`
  }

  const generateOrderReference = (customerCode: string): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0')

    return `ORD-${customerCode}-${year}${month}${day}-${time}`
  }

  const selectCustomer = (customerId: number) => {
    const selectedCustomer = customers.find(c => c.id === customerId)
    if (selectedCustomer) {
      const orderRef = generateOrderReference(selectedCustomer.customer_code || 'GEN')
      // Auto-select the primary location if available
      const primaryLocation = (selectedCustomer as any).locations?.find((loc: any) => loc.primary) || (selectedCustomer as any).locations?.[0]
      setFormData({
        ...formData,
        customer: customerId,
        customer_name: selectedCustomer.name || selectedCustomer.business_name || '',
        order_reference: orderRef,
        customer_location: primaryLocation?.id || 0,
        customer_location_name: primaryLocation?.name || ''
      })
    }
  }

  const handleAdd = () => {
    resetForm()
    // Generate PRF number and set current date when opening the form
    setFormData({
      ...initialFormData,
      prf_number: generatePRFNumber(),
      order_date: new Date().toISOString().split('T')[0] // Always set to today's date
    })
    setShowAddModal(true)
  }

  const handleView = (prf: PRF) => {
    // Navigate to the dedicated PRF view page using Next.js router
    router.push(`/orders/prf/${prf.id}`)
  }

  const handleEdit = (prf: PRF) => {
    setSelectedPRF(prf)
    // Load PRF data into the simplified form structure
    setFormData({
      customer: (prf as any).customer || 0,
      customer_name: (prf as any).customer_name || '',
      customer_location: prf.delivery_location || 0,
      customer_location_name: '',
      order_date: prf.expected_delivery_date || new Date().toISOString().split('T')[0],
      order_reference: (prf as any).order_reference || '',
      notes: (prf as any).notes || prf.description || '',
      priority: prf.priority,
      items: (prf as any).items || [],
      estimated_total: prf.estimated_total,
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDelete = (prf: PRF) => {
    setSelectedPRF(prf)
    setShowDeleteModal(true)
  }

  const handleSubmit = (prf: PRF) => {
    submitMutation.mutate(prf.id)
  }

  const handleApproval = (prf: PRF, action: 'approve' | 'reject') => {
    setSelectedPRF(prf)
    setApprovalAction(action)
    setRejectionReason('')
    setShowApprovalModal(true)
  }

  const handleSaveNew = () => {
    if (!validateForm()) return
    createMutation.mutate(formData)
  }

  const handleSaveEdit = () => {
    if (!validateForm() || !selectedPRF) return
    updateMutation.mutate({ id: selectedPRF.id, data: formData })
  }

  const confirmDelete = () => {
    if (selectedPRF) {
      deleteMutation.mutate(selectedPRF.id)
    }
  }

  const confirmApproval = () => {
    if (!selectedPRF) return
    if (approvalAction === 'approve') {
      approveMutation.mutate(selectedPRF.id)
    } else {
      rejectMutation.mutate({ id: selectedPRF.id, reason: rejectionReason })
    }
  }

  // Stats calculation
  const totalPRFs = prfs.length
  const pendingPRFs = prfs.filter((p) => p.status === 'submitted').length
  const approvedPRFs = prfs.filter((p) => p.status === 'approved').length
  const totalValue = prfs.reduce((sum, p) => sum + (p.estimated_total || 0), 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Purchase Requisitions (PRF)</h1>
            <p className="text-muted-foreground">Manage purchase requisition forms and approvals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              New PRF
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total PRFs</p>
                  <p className="text-2xl font-bold text-primary">{totalPRFs}</p>
                </div>
                <Clock className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingPRFs}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedPRFs}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-secondary">{formatCurrency(totalValue)}</p>
                </div>
                <Download className="w-8 h-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search PRFs..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="fulfilled">Fulfilled</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">Error loading PRFs</p>
                  <p className="text-sm text-red-600">{(error as any).message || 'An unexpected error occurred'}</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PRF List */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Requisitions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : prfs.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No PRFs found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first PRF'}
                </p>
                <Button className="mofad-btn-primary" onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create PRF
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">PRF Number</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prfs.map((prf: PRF) => (
                      <tr key={prf.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getStatusIcon(prf.status)}
                            <span className="ml-2 font-medium font-mono">{prf.prf_number}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{prf.description || 'No description'}</p>
                            <p className="text-sm text-muted-foreground">{(prf as any).order_reference || 'Customer Order'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{(prf as any).customer_name || 'N/A'}</td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(prf.estimated_total)}</td>
                        <td className="py-3 px-4">{getPriorityBadge(prf.priority)}</td>
                        <td className="py-3 px-4">{getStatusBadge(prf.status)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDateTime(prf.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleView(prf)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {prf.status === 'draft' && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(prf)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSubmit(prf)}
                                  disabled={submitMutation.isPending}
                                  title="Submit for approval"
                                >
                                  <Send className="w-4 h-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(prf)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            {prf.status === 'submitted' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproval(prf, 'approve')}
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4 text-green-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproval(prf, 'reject')}
                                  title="Reject"
                                >
                                  <Ban className="w-4 h-4 text-red-500" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add PRF Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Create Customer Order PRF</h2>
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-medium text-blue-700 mb-1">PRF Number</label>
                  <div className="text-lg font-bold text-blue-900 font-mono">
                    {formData.prf_number || 'Auto-generated'}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">This number is automatically generated</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      formErrors.customer ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.customer}
                    onChange={(e) => {
                      const customerId = parseInt(e.target.value) || 0
                      console.log('Customer dropdown changed:', { value: e.target.value, customerId, customers })
                      selectCustomer(customerId)
                    }}
                    disabled={isCustomersLoading}
                  >
                    <option value={0}>{isCustomersLoading ? 'Loading customers...' : 'Select Customer'}</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name || customer.business_name} ({customer.customer_code})
                      </option>
                    ))}
                  </select>
                  {formErrors.customer && <p className="text-red-500 text-xs mt-1">{formErrors.customer}</p>}
                </div>

                {formData.customer > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Customer Details</h4>
                    <div className="text-sm text-blue-700">
                      <p><strong>Name:</strong> {formData.customer_name}</p>
                      {(() => {
                        const customer = customers.find(c => c.id === formData.customer)
                        return customer ? (
                          <>
                            <p><strong>Email:</strong> {customer.email}</p>
                            <p><strong>Phone:</strong> {customer.phone}</p>
                            <p><strong>Credit Limit:</strong> {formatCurrency(customer.credit_limit || 0)}</p>
                          </>
                        ) : null
                      })()}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Reference</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 font-mono text-sm"
                    value={formData.order_reference}
                    readOnly
                    placeholder="Auto-generated when customer is selected"
                  />
                  <p className="text-xs text-gray-500 mt-1">Automatically generated based on customer and timestamp</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this order"
                  />
                </div>

                {/* Product Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Items <span className="text-red-500">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Product
                    </Button>
                  </div>

                  {formErrors.items && <p className="text-red-500 text-xs mb-2">{formErrors.items}</p>}

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {formData.items.map((item, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                            <select
                              className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary ${
                                formErrors[`items.${index}.product`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={item.product}
                              onChange={(e) => {
                                const productId = parseInt(e.target.value) || 0
                                console.log('Product dropdown changed:', { index, value: e.target.value, productId, products })
                                updateItem(index, 'product', productId)
                              }}
                              disabled={isProductsLoading}
                            >
                              <option value={0}>{isProductsLoading ? 'Loading products...' : 'Select Product'}</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - ₦{formatCurrency(product.bulk_selling_price || 0)}/L
                                </option>
                              ))}
                            </select>
                            {formErrors[`items.${index}.product`] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors[`items.${index}.product`]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                            <input
                              type="number"
                              className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary ${
                                formErrors[`items.${index}.quantity`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              min="1"
                            />
                            {formErrors[`items.${index}.quantity`] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors[`items.${index}.quantity`]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price</label>
                            <input
                              type="text"
                              className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
                              value={formatCurrency(item.unit_price)}
                              readOnly
                            />
                          </div>
                          <div className="flex items-end">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Total</label>
                              <div className="text-sm font-medium text-green-600 px-2 py-1 bg-green-50 rounded">
                                {formatCurrency(item.total_amount)}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:bg-red-50 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.items.length === 0 && (
                    <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <p>No products added yet</p>
                      <p className="text-sm">Click "Add Product" to get started</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as PRFFormData['priority'] })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.customer_location ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.customer_location}
                      onChange={(e) => {
                        const locationId = parseInt(e.target.value) || 0
                        const selectedCustomer = customers.find(c => c.id === formData.customer)
                        const selectedLocation = (selectedCustomer as any)?.locations?.find((loc: any) => loc.id === locationId)
                        console.log('Customer location changed:', { value: e.target.value, locationId, selectedLocation })
                        setFormData({
                          ...formData,
                          customer_location: locationId,
                          customer_location_name: selectedLocation?.name || ''
                        })
                      }}
                      disabled={!formData.customer || formData.customer === 0}
                    >
                      <option value={0}>{!formData.customer ? 'Select Customer First' : 'Select Customer Location'}</option>
                      {formData.customer > 0 && (() => {
                        const selectedCustomer = customers.find(c => c.id === formData.customer)
                        return (selectedCustomer as any)?.locations?.map((location: any) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        )) || []
                      })()}
                    </select>
                    {formErrors.customer_location && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.customer_location}</p>
                    )}
                    {formData.customer_location > 0 && (() => {
                      const selectedCustomer = customers.find(c => c.id === formData.customer)
                      const selectedLocation = (selectedCustomer as any)?.locations?.find((loc: any) => loc.id === formData.customer_location)
                      return selectedLocation ? (
                        <p className="text-xs text-gray-500 mt-1">{selectedLocation.address}</p>
                      ) : null
                    })()}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
                      value={formData.order_date}
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Automatically set to today's date</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-green-800">Total Order Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(formData.estimated_total)}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {formData.items.length} item(s) • Direct sales pricing applied
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="mofad-btn-primary" onClick={handleSaveNew} disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Create PRF
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit PRF Modal */}
        {showEditModal && selectedPRF && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Edit PRF - {selectedPRF.prf_number}</h2>
                <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                {/* Same form fields as Add Modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Operations">Operations</option>
                      <option value="Sales">Sales</option>
                      <option value="Finance">Finance</option>
                      <option value="Procurement">Procurement</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as PRFFormData['priority'] })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Location *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.customer_location}
                      onChange={(e) => {
                        const locationId = parseInt(e.target.value) || 0
                        const selectedCustomer = customers.find(c => c.id === formData.customer)
                        const selectedLocation = (selectedCustomer as any)?.locations?.find((loc: any) => loc.id === locationId)
                        setFormData({
                          ...formData,
                          customer_location: locationId,
                          customer_location_name: selectedLocation?.name || ''
                        })
                      }}
                      disabled={!formData.customer || formData.customer === 0}
                    >
                      <option value={0}>{!formData.customer ? 'Select Customer First' : 'Select Customer Location'}</option>
                      {formData.customer > 0 && (() => {
                        const selectedCustomer = customers.find(c => c.id === formData.customer)
                        return (selectedCustomer as any)?.locations?.map((location: any) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        )) || []
                      })()}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
                      value={formData.order_date}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Total (₦)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.estimated_total}
                      onChange={(e) =>
                        setFormData({ ...formData, estimated_total: parseFloat(e.target.value) || 0 })
                      }
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.budget_code}
                    onChange={(e) => setFormData({ ...formData, budget_code: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button className="mofad-btn-primary" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Update PRF
                </Button>
              </div>
            </div>
          </div>
        )}


        {/* Approval Modal */}
        {showApprovalModal && selectedPRF && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className={`text-xl font-semibold ${approvalAction === 'approve' ? 'text-green-600' : 'text-red-600'}`}>
                  {approvalAction === 'approve' ? 'Approve PRF' : 'Reject PRF'}
                </h2>
                <Button variant="ghost" onClick={() => setShowApprovalModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      approvalAction === 'approve' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {approvalAction === 'approve' ? (
                      <Check className="w-6 h-6 text-green-600" />
                    ) : (
                      <Ban className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedPRF.prf_number}</h3>
                    <p className="text-sm text-gray-600">{selectedPRF.title}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  {approvalAction === 'approve'
                    ? 'Are you sure you want to approve this purchase requisition?'
                    : 'Please provide a reason for rejecting this PRF.'}
                </p>
                {approvalAction === 'reject' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                  Cancel
                </Button>
                <Button
                  className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                  onClick={confirmApproval}
                  disabled={
                    (approvalAction === 'approve' && approveMutation.isPending) ||
                    (approvalAction === 'reject' && (rejectMutation.isPending || !rejectionReason.trim()))
                  }
                >
                  {(approveMutation.isPending || rejectMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : approvalAction === 'approve' ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Ban className="w-4 h-4 mr-2" />
                  )}
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedPRF && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-red-600">Confirm Deletion</h2>
                <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Delete Purchase Requisition</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  Are you sure you want to delete PRF <strong>{selectedPRF.prf_number}</strong>? This will permanently
                  remove all associated data.
                </p>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete PRF
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
