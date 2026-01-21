'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
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
  Trash2
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface Lubebay {
  id: string
  name: string
  location: string
  state: string
  manager: string
  phone: string
  status: 'active' | 'maintenance' | 'inactive'
  bays: number
  monthlyRevenue: number
  lastInspection: string
  services: string[]
  rating: number
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

// Mock data for lubebay
const mockLubebay: Lubebay = {
  id: 'LB001',
  name: 'Victoria Island Lubebay',
  location: 'Plot 123, Ahmadu Bello Way, Victoria Island',
  state: 'Lagos',
  manager: 'Emeka Okafor',
  phone: '+234 803 123 4567',
  status: 'active',
  bays: 6,
  monthlyRevenue: 850000,
  lastInspection: '2024-12-10',
  services: ['Oil Change', 'Filter Replacement', 'Quick Service'],
  rating: 4.8
}

// Mock lubricant sales
const mockLubricantSales: LubricantSale[] = [
  {
    id: 'LS001',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    customerName: 'John Adebayo',
    customerPhone: '+234-801-234-5678',
    products: [
      { name: 'Mobil 1 5W-30', brand: 'Mobil', quantity: 2, unitPrice: 15000, total: 30000 },
      { name: 'Oil Filter', brand: 'Mann', quantity: 1, unitPrice: 3500, total: 3500 }
    ],
    subtotal: 33500,
    tax: 2512.50,
    discount: 1000,
    total: 35012.50,
    paymentMethod: 'cash',
    salesRep: 'Ahmed Musa',
    notes: 'Regular customer, 5% discount applied'
  },
  {
    id: 'LS002',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    customerName: 'Sarah Okafor',
    customerPhone: '+234-807-987-6543',
    products: [
      { name: 'Shell Helix HX7', brand: 'Shell', quantity: 1, unitPrice: 12500, total: 12500 },
      { name: 'Air Filter', brand: 'Bosch', quantity: 1, unitPrice: 4000, total: 4000 }
    ],
    subtotal: 16500,
    tax: 1237.50,
    discount: 0,
    total: 17737.50,
    paymentMethod: 'card',
    salesRep: 'Fatima Hassan',
    notes: 'First-time customer'
  }
]

// Mock service records
const mockServiceRecords: ServiceRecord[] = [
  {
    id: 'SR001',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    customerName: 'David Okwu',
    customerPhone: '+234-803-456-7890',
    vehicleInfo: {
      make: 'Toyota',
      model: 'Camry',
      year: '2018',
      plateNumber: 'ABC-123-DE'
    },
    services: [
      { name: 'Full Service', category: 'maintenance', duration: 90, price: 25000 },
      { name: 'Engine Diagnostics', category: 'inspection', duration: 30, price: 8000 }
    ],
    parts: [
      { name: 'Engine Oil 5W-30', quantity: 5, unitPrice: 3000, total: 15000 },
      { name: 'Oil Filter', quantity: 1, unitPrice: 3500, total: 3500 }
    ],
    laborCost: 33000,
    partsCost: 18500,
    total: 51500,
    paymentMethod: 'transfer',
    technician: 'Ibrahim Garba',
    bayNumber: 3,
    status: 'completed',
    notes: 'Full service completed, next service due in 6 months'
  },
  {
    id: 'SR002',
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    customerName: 'Grace Emeka',
    customerPhone: '+234-805-123-4567',
    vehicleInfo: {
      make: 'Honda',
      model: 'Civic',
      year: '2020',
      plateNumber: 'XYZ-789-FG'
    },
    services: [
      { name: 'Oil Change', category: 'maintenance', duration: 45, price: 15000 }
    ],
    parts: [
      { name: 'Engine Oil 0W-20', quantity: 4, unitPrice: 3500, total: 14000 },
      { name: 'Oil Filter', quantity: 1, unitPrice: 3000, total: 3000 }
    ],
    laborCost: 15000,
    partsCost: 17000,
    total: 32000,
    paymentMethod: 'cash',
    technician: 'Musa Abdullahi',
    bayNumber: 1,
    status: 'completed',
    notes: 'Quick oil change service'
  }
]

export default function LubebayDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const lubebayId = params.id as string

  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'services'>('overview')
  const [showRecordSaleModal, setShowRecordSaleModal] = useState(false)
  const [showRecordServiceModal, setShowRecordServiceModal] = useState(false)

  // Lubricant sale form state (simplified - no customer details)
  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date by default
    products: [{ name: '', brand: '', category: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    paymentMethod: 'cash' as 'cash' | 'pos' | 'bank_transfer' | 'bank_lodgement',
    notes: ''
  })

  // Service record form state (simplified - no customer details)
  const [serviceForm, setServiceForm] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date by default
    services: [{ name: '', category: 'maintenance' as 'maintenance' | 'repair' | 'inspection', duration: 30, price: 0 }],
    parts: [{ name: '', category: '', quantity: 1, unitPrice: 0 }],
    paymentMethod: 'cash' as 'cash' | 'pos' | 'bank_transfer' | 'bank_lodgement',
    notes: ''
  })

  // Fetch lubebay details from API
  const { data: lubebay, isLoading: lubebayLoading } = useQuery({
    queryKey: ['lubebay-detail', lubebayId],
    queryFn: async () => {
      try {
        return await apiClient.get(`/lubebays/${lubebayId}/`)
      } catch (error) {
        return mockLubebay
      }
    },
  })

  // Fetch lubebay transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['lubebay-transactions', lubebayId],
    queryFn: async () => {
      try {
        return await apiClient.get(`/lubebay-transactions/`, { lubebay: lubebayId })
      } catch (error) {
        return []
      }
    },
  })

  // Fetch service transactions
  const { data: serviceTransactions = [] } = useQuery({
    queryKey: ['lubebay-service-transactions', lubebayId],
    queryFn: async () => {
      try {
        return await apiClient.get(`/lubebay-service-transactions/`, { lubebay: lubebayId })
      } catch (error) {
        return []
      }
    },
  })

  // Use API data or fallback to mock data
  const lubricantSales = transactions.length > 0 ? transactions : mockLubricantSales
  const serviceRecords = serviceTransactions.length > 0 ? serviceTransactions : mockServiceRecords

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getServiceStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const totalSalesToday = lubricantSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalServicesToday = serviceRecords.reduce((sum, service) => sum + service.total, 0)
  const totalRevenueToday = totalSalesToday + totalServicesToday

  // Available products for sale
  const availableProducts = [
    // Engine Oils
    { name: 'Mobil 1 5W-30', brand: 'Mobil', category: 'Engine Oil', price: 15000 },
    { name: 'Shell Helix HX7', brand: 'Shell', category: 'Engine Oil', price: 12500 },
    { name: 'Castrol GTX', brand: 'Castrol', category: 'Engine Oil', price: 11000 },
    { name: 'Total Quartz', brand: 'Total', category: 'Engine Oil', price: 13000 },

    // Filters
    { name: 'Oil Filter', brand: 'Mann', category: 'Filter', price: 3500 },
    { name: 'Air Filter', brand: 'Bosch', category: 'Filter', price: 4000 },
    { name: 'Fuel Filter', brand: 'Mann', category: 'Filter', price: 4500 },
    { name: 'Cabin Filter', brand: 'Bosch', category: 'Filter', price: 3800 },

    // Brake Parts
    { name: 'Front Brake Pads', brand: 'Bosch', category: 'Brake Parts', price: 18000 },
    { name: 'Rear Brake Pads', brand: 'Ferodo', category: 'Brake Parts', price: 15000 },
    { name: 'Brake Disc (Front)', brand: 'Brembo', category: 'Brake Parts', price: 25000 },
    { name: 'Brake Fluid DOT 4', brand: 'Mobil', category: 'Brake Parts', price: 5000 },

    // Wipers & Electrical
    { name: 'Windshield Wipers (Pair)', brand: 'Bosch', category: 'Wipers', price: 8000 },
    { name: 'Headlight Bulb H4', brand: 'Philips', category: 'Electrical', price: 2500 },
    { name: 'Car Battery 12V', brand: 'Exide', category: 'Electrical', price: 45000 },

    // Tires & Suspension
    { name: 'Car Tire 195/65R15', brand: 'Michelin', category: 'Tires', price: 35000 },
    { name: 'Shock Absorber', brand: 'Monroe', category: 'Suspension', price: 22000 },

    // Fluids
    { name: 'Transmission Fluid', brand: 'Castrol', category: 'Fluids', price: 8000 },
    { name: 'Power Steering Fluid', brand: 'Lucas', category: 'Fluids', price: 6000 },
    { name: 'Coolant/Antifreeze', brand: 'Prestone', category: 'Fluids', price: 7000 }
  ]

  // Available services
  const availableServices = [
    { name: 'Full Service', category: 'maintenance', price: 25000, duration: 90 },
    { name: 'Oil Change', category: 'maintenance', price: 15000, duration: 45 },
    { name: 'Engine Diagnostics', category: 'inspection', price: 8000, duration: 30 },
    { name: 'Brake Service', category: 'maintenance', price: 20000, duration: 60 },
    { name: 'Tire Service', category: 'maintenance', price: 12000, duration: 30 },
    { name: 'AC Service', category: 'repair', price: 18000, duration: 75 }
  ]


  // Calculate sale total
  const calculateSaleTotal = () => {
    const subtotal = saleForm.products.reduce((sum, product) => sum + (product.quantity * product.unitPrice), 0)
    const tax = subtotal * 0.075 // 7.5% VAT
    const total = subtotal + tax - saleForm.discount
    return { subtotal, tax, total }
  }

  // Calculate service total
  const calculateServiceTotal = () => {
    const laborCost = serviceForm.services.reduce((sum, service) => sum + service.price, 0)
    const partsCost = serviceForm.parts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0)
    const total = laborCost + partsCost
    return { laborCost, partsCost, total }
  }

  // Add product to sale
  const addProductToSale = () => {
    setSaleForm(prev => ({
      ...prev,
      products: [...prev.products, { name: '', brand: '', category: '', quantity: 1, unitPrice: 0 }]
    }))
  }

  // Remove product from sale
  const removeProductFromSale = (index: number) => {
    if (saleForm.products.length > 1) {
      setSaleForm(prev => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index)
      }))
    }
  }

  // Add service to record
  const addServiceToRecord = () => {
    setServiceForm(prev => ({
      ...prev,
      services: [...prev.services, { name: '', category: 'maintenance', duration: 30, price: 0 }]
    }))
  }

  // Remove service from record
  const removeServiceFromRecord = (index: number) => {
    if (serviceForm.services.length > 1) {
      setServiceForm(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index)
      }))
    }
  }

  // Add part to service
  const addPartToService = () => {
    setServiceForm(prev => ({
      ...prev,
      parts: [...prev.parts, { name: '', category: '', quantity: 1, unitPrice: 0 }]
    }))
  }

  // Remove part from service
  const removePartFromService = (index: number) => {
    if (serviceForm.parts.length > 1) {
      setServiceForm(prev => ({
        ...prev,
        parts: prev.parts.filter((_, i) => i !== index)
      }))
    }
  }

  // Reset forms
  const resetSaleForm = () => {
    setSaleForm({
      date: new Date().toISOString().split('T')[0],
      products: [{ name: '', brand: '', category: '', quantity: 1, unitPrice: 0 }],
      discount: 0,
      paymentMethod: 'cash',
      notes: ''
    })
  }

  const resetServiceForm = () => {
    setServiceForm({
      date: new Date().toISOString().split('T')[0],
      services: [{ name: '', category: 'maintenance', duration: 30, price: 0 }],
      parts: [{ name: '', category: '', quantity: 1, unitPrice: 0 }],
      paymentMethod: 'cash',
      notes: ''
    })
  }

  if (lubebayLoading || !lubebay) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lubebays
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading lubebay details...</p>
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
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lubebays
          </Button>
        </div>

        {/* Lubebay Info Card */}
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
                      <h1 className="text-2xl font-bold text-foreground">{lubebay.name}</h1>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(lubebay.status || 'unknown')}`}>
                        {(lubebay.status || 'Unknown').charAt(0).toUpperCase() + (lubebay.status || 'unknown').slice(1)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{lubebay.location}, {lubebay.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Manager: {lubebay.manager}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{lubebay.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{lubebay.rating} rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Service Bays</div>
                  <div className="text-2xl font-bold text-primary">{lubebay.bays}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(lubebay.monthlyRevenue)}</div>
                </div>
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
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
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
                  <p className="text-sm text-muted-foreground">Lubricant Sales</p>
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
                  <p className="text-2xl font-bold text-purple-600">{lubricantSales.length + serviceRecords.length}</p>
                </div>
                <Receipt className="w-8 h-8 text-purple-600/60" />
              </div>
            </CardContent>
          </Card>
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
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Services
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Lubricant Sales */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Lubricant Sales</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowRecordSaleModal(true)}
                  className="mofad-btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Sale
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lubricantSales.slice(0, 3).map((sale) => (
                    <div key={sale.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{sale.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {sale.products.length} product(s) • {formatDateTime(sale.date)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sales Rep: {sale.salesRep}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{formatCurrency(sale.total)}</div>
                        <div className="text-sm text-muted-foreground">{sale.paymentMethod}</div>
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
                  {serviceRecords.slice(0, 3).map((service) => (
                    <div key={service.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{service.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.vehicleInfo.make} {service.vehicleInfo.model} • Bay {service.bayNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Technician: {service.technician}
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${getServiceStatusBadge(service.status)}`}>
                          {service.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{formatCurrency(service.total)}</div>
                        <div className="text-sm text-muted-foreground">{formatDateTime(service.date)}</div>
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
              <Button
                onClick={() => setShowRecordSaleModal(true)}
                className="mofad-btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record New Sale
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
                      {lubricantSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              {sale.products.slice(0, 2).map((product, index) => (
                                <div key={index} className="text-sm">
                                  {product.name} (x{product.quantity})
                                </div>
                              ))}
                              {sale.products.length > 2 && (
                                <div className="text-sm text-muted-foreground">
                                  +{sale.products.length - 2} more
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-bold text-primary">{formatCurrency(sale.total)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {sale.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{formatDateTime(sale.date)}</td>
                          <td className="py-3 px-4 text-center">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
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

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Service Records</h2>
              <Button
                onClick={() => setShowRecordServiceModal(true)}
                className="mofad-btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record New Service
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
                      {serviceRecords.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{service.vehicleInfo.make} {service.vehicleInfo.model}</div>
                              <div className="text-sm text-muted-foreground">{service.vehicleInfo.plateNumber}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              {service.services.slice(0, 2).map((svc, index) => (
                                <div key={index} className="text-sm">
                                  {svc.name}
                                </div>
                              ))}
                              {service.services.length > 2 && (
                                <div className="text-sm text-muted-foreground">
                                  +{service.services.length - 2} more
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-bold text-primary">{formatCurrency(service.total)}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceStatusBadge(service.status)}`}>
                              {service.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{formatDateTime(service.date)}</td>
                          <td className="py-3 px-4 text-center">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
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

        {/* Record Sale Modal */}
        {showRecordSaleModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Record Sales Transaction</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRecordSaleModal(false)
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
                        onClick={addProductToSale}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {saleForm.products.map((product, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Product {index + 1}</span>
                            {saleForm.products.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeProductFromSale(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>

                          <select
                            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={`${product.name}|${product.brand}|${product.category}|${product.unitPrice}`}
                            onChange={(e) => {
                              const [name, brand, category, price] = e.target.value.split('|')
                              setSaleForm(prev => ({
                                ...prev,
                                products: prev.products.map((p, i) =>
                                  i === index ? { ...p, name, brand, category, unitPrice: Number(price) } : p
                                )
                              }))
                            }}
                          >
                            <option value="">Select product</option>
                            {availableProducts.map(prod => (
                              <option key={`${prod.name}-${prod.brand}`} value={`${prod.name}|${prod.brand}|${prod.category}|${prod.price}`}>
                                {prod.name} - {prod.brand} - {prod.category} ({formatCurrency(prod.price)})
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
                                value={product.quantity}
                                onChange={(e) => setSaleForm(prev => ({
                                  ...prev,
                                  products: prev.products.map((p, i) =>
                                    i === index ? { ...p, quantity: Number(e.target.value) } : p
                                  )
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Unit Price (₦)</label>
                              <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={product.unitPrice}
                                onChange={(e) => setSaleForm(prev => ({
                                  ...prev,
                                  products: prev.products.map((p, i) =>
                                    i === index ? { ...p, unitPrice: Number(e.target.value) } : p
                                  )
                                }))}
                              />
                            </div>
                          </div>
                          {product.category && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              Category: {product.category}
                            </div>
                          )}
                          <div className="text-right font-medium text-lg">
                            Item Total: {formatCurrency(product.quantity * product.unitPrice)}
                          </div>
                        </div>
                      ))}
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
                          value={saleForm.paymentMethod}
                          onChange={(e) => setSaleForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                        >
                          <option value="cash">Cash</option>
                          <option value="pos">POS Payment</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="bank_lodgement">Bank Lodgement</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg">Sale Summary</h4>
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(calculateSaleTotal().subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (7.5% VAT):</span>
                        <span className="font-medium">{formatCurrency(calculateSaleTotal().tax)}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Discount (₦)</label>
                        <input
                          type="number"
                          min="0"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          value={saleForm.discount}
                          onChange={(e) => setSaleForm(prev => ({ ...prev, discount: Number(e.target.value) }))}
                          placeholder="Enter discount amount"
                        />
                      </div>
                      <hr className="border-gray-300" />
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
                      value={saleForm.notes}
                      onChange={(e) => setSaleForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about the sale..."
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      className="w-full mofad-btn-primary"
                      onClick={() => {
                        // In a real app, you'd submit the form here
                        console.log('Recording sale:', saleForm)
                        setShowRecordSaleModal(false)
                        resetSaleForm()
                      }}
                      disabled={saleForm.products.some(p => !p.name || !p.unitPrice)}
                    >
                      Record Sale
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowRecordSaleModal(false)
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
                {/* Services & Parts */}
                <div className="space-y-6">
                  {/* Services Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">Services Performed</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addServiceToRecord}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {serviceForm.services.map((service, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Service {index + 1}</span>
                            {serviceForm.services.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeServiceFromRecord(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>

                          <select
                            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={`${service.name}|${service.category}|${service.price}|${service.duration}`}
                            onChange={(e) => {
                              const [name, category, price, duration] = e.target.value.split('|')
                              setServiceForm(prev => ({
                                ...prev,
                                services: prev.services.map((s, i) =>
                                  i === index ? {
                                    ...s,
                                    name,
                                    category: category as any,
                                    price: Number(price),
                                    duration: Number(duration)
                                  } : s
                                )
                              }))
                            }}
                          >
                            <option value="">Select service</option>
                            {availableServices.map(svc => (
                              <option
                                key={svc.name}
                                value={`${svc.name}|${svc.category}|${svc.price}|${svc.duration}`}
                              >
                                {svc.name} - {formatCurrency(svc.price)} ({svc.duration}min)
                              </option>
                            ))}
                          </select>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1">Duration (min)</label>
                              <input
                                type="number"
                                min="15"
                                step="15"
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={service.duration}
                                onChange={(e) => setServiceForm(prev => ({
                                  ...prev,
                                  services: prev.services.map((s, i) =>
                                    i === index ? { ...s, duration: Number(e.target.value) } : s
                                  )
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Service Price (₦)</label>
                              <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={service.price}
                                onChange={(e) => setServiceForm(prev => ({
                                  ...prev,
                                  services: prev.services.map((s, i) =>
                                    i === index ? { ...s, price: Number(e.target.value) } : s
                                  )
                                }))}
                              />
                            </div>
                          </div>
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Category: {service.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parts Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">Parts & Materials Used</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addPartToService}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Part
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {serviceForm.parts.map((part, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Part {index + 1}</span>
                            {serviceForm.parts.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removePartFromService(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>

                          <select
                            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={`${part.name}|${part.category}|${part.unitPrice}`}
                            onChange={(e) => {
                              const [name, category, price] = e.target.value.split('|')
                              setServiceForm(prev => ({
                                ...prev,
                                parts: prev.parts.map((p, i) =>
                                  i === index ? { ...p, name, category, unitPrice: Number(price) } : p
                                )
                              }))
                            }}
                          >
                            <option value="">Select part</option>
                            {availableProducts.map(prod => (
                              <option key={`${prod.name}-${prod.brand}`} value={`${prod.name}|${prod.category}|${prod.price}`}>
                                {prod.name} - {prod.brand} - {prod.category} ({formatCurrency(prod.price)})
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
                                value={part.quantity}
                                onChange={(e) => setServiceForm(prev => ({
                                  ...prev,
                                  parts: prev.parts.map((p, i) =>
                                    i === index ? { ...p, quantity: Number(e.target.value) } : p
                                  )
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Unit Price (₦)</label>
                              <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={part.unitPrice}
                                onChange={(e) => setServiceForm(prev => ({
                                  ...prev,
                                  parts: prev.parts.map((p, i) =>
                                    i === index ? { ...p, unitPrice: Number(e.target.value) } : p
                                  )
                                }))}
                              />
                            </div>
                          </div>
                          {part.category && (
                            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                              Category: {part.category}
                            </div>
                          )}
                          <div className="text-right font-medium text-lg">
                            Part Total: {formatCurrency(part.quantity * part.unitPrice)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Service Details & Summary */}
                <div className="space-y-6">
                  {/* Service Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Service Details</h4>
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
                          value={serviceForm.paymentMethod}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                        >
                          <option value="cash">Cash</option>
                          <option value="pos">POS Payment</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="bank_lodgement">Bank Lodgement</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Service Summary */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Service Summary</h4>
                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Labor Cost:</span>
                          <span className="font-medium">{formatCurrency(calculateServiceTotal().laborCost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Parts Cost:</span>
                          <span className="font-medium">{formatCurrency(calculateServiceTotal().partsCost)}</span>
                        </div>
                        <hr className="border-gray-300" />
                        <div className="flex justify-between text-xl font-bold">
                          <span>Total Amount:</span>
                          <span className="text-primary">{formatCurrency(calculateServiceTotal().total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Service Notes (Optional)</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={4}
                      value={serviceForm.notes}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Service notes, recommendations, next service due..."
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      className="w-full mofad-btn-primary"
                      onClick={() => {
                        // In a real app, you'd submit the form here
                        console.log('Recording service:', serviceForm)
                        setShowRecordServiceModal(false)
                        resetServiceForm()
                      }}
                      disabled={serviceForm.services.some(s => !s.name || !s.price)}
                    >
                      Record Service
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
      </div>
    </AppLayout>
  )
}