'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Star,
  Plus,
  Eye,
  Wrench,
  Fuel,
  Building2,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  X,
  Trash2,
} from 'lucide-react'

interface Substore {
  id: number
  name: string
  code: string
  type: 'lubebay' | 'filling_station'
  location: string
  state: string
  manager: string
  phone: string
  email: string
  status: 'active' | 'inactive'
  opening_date: string
  monthly_sales: number
  commission_rate: number
  products_count: number
  last_transaction: string
  rating: number
}

interface Sale {
  id: number
  product_name: string
  quantity: number
  unit_price: number
  total_amount: number
  customer_name: string
  sale_date: string
  payment_method: string
  status: 'completed' | 'pending' | 'refunded'
}

interface Service {
  id: number
  service_type: string
  vehicle_type: string
  customer_name: string
  service_duration: number
  total_amount: number
  service_date: string
  technician: string
  status: 'completed' | 'in_progress' | 'scheduled'
}

const getTypeBadge = (type: string) => {
  const typeConfig = {
    lubebay: {
      label: 'Lubebay',
      color: 'bg-blue-100 text-blue-800',
      icon: <Wrench className="w-3 h-3" />
    },
    filling_station: {
      label: 'Filling Station',
      color: 'bg-orange-100 text-orange-800',
      icon: <Fuel className="w-3 h-3" />
    }
  }

  const config = typeConfig[type as keyof typeof typeConfig]
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  )
}

const getStatusBadge = (status: string) => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    refunded: 'bg-red-100 text-red-800',
    in_progress: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-purple-100 text-purple-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  )
}

const getRatingStars = (rating: number) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">({rating})</span>
    </div>
  )
}

export default function SubstoreDashboard() {
  const params = useParams()
  const router = useRouter()
  const substoreId = parseInt(params?.id as string)
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'services'>('overview')
  const [showRecordSaleModal, setShowRecordSaleModal] = useState(false)
  const [showRecordServiceModal, setShowRecordServiceModal] = useState(false)

  // Sale form state (simplified - no customer details)
  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().split('T')[0],
    products: [{ name: '', brand: '', category: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    paymentMethod: 'cash' as 'cash' | 'pos' | 'bank_transfer' | 'bank_lodgement',
    notes: ''
  })

  // Service record form state (simplified - no customer details)
  const [serviceForm, setServiceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    services: [{ name: '', category: 'maintenance' as 'maintenance' | 'repair' | 'inspection', duration: 30, price: 0 }],
    parts: [{ name: '', category: '', quantity: 1, unitPrice: 0 }],
    paymentMethod: 'cash' as 'cash' | 'pos' | 'bank_transfer' | 'bank_lodgement',
    notes: ''
  })

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

  // Fetch substore details
  const { data: substore, isLoading: substoreLoading } = useQuery({
    queryKey: ['substore-details', substoreId],
    queryFn: () => mockApi.get(`/channels/substores/${substoreId}`)
  })

  // Mock recent sales data
  const mockSales: Sale[] = [
    { id: 1, product_name: 'Engine Oil SAE 20W-50', quantity: 4, unit_price: 2500, total_amount: 10000, customer_name: 'John Doe', sale_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), payment_method: 'cash', status: 'completed' },
    { id: 2, product_name: 'Brake Fluid DOT 4', quantity: 2, unit_price: 1200, total_amount: 2400, customer_name: 'Jane Smith', sale_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), payment_method: 'card', status: 'completed' },
    { id: 3, product_name: 'Coolant Concentrate', quantity: 1, unit_price: 3500, total_amount: 3500, customer_name: 'Mike Johnson', sale_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), payment_method: 'transfer', status: 'pending' }
  ]

  // Mock services data (for lubebays)
  const mockServices: Service[] = [
    { id: 1, service_type: 'Oil Change', vehicle_type: 'Sedan', customer_name: 'Ahmed Ibrahim', service_duration: 30, total_amount: 8000, service_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), technician: 'Hassan Ali', status: 'completed' },
    { id: 2, service_type: 'Brake Service', vehicle_type: 'SUV', customer_name: 'Mary Okon', service_duration: 45, total_amount: 12000, service_date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), technician: 'James Peter', status: 'in_progress' },
    { id: 3, service_type: 'Engine Diagnostics', vehicle_type: 'Truck', customer_name: 'Paul Adamu', service_duration: 60, total_amount: 15000, service_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), technician: 'David Wilson', status: 'scheduled' }
  ]

  if (substoreLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-500">Loading substore details...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!substore) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Substore not found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/channels/substores')}
            >
              Back to Substores
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Calculate today's stats
  const todaysSales = mockSales.filter(sale => {
    const saleDate = new Date(sale.sale_date)
    const today = new Date()
    return saleDate.toDateString() === today.toDateString()
  })
  const todaysSalesAmount = todaysSales.reduce((sum, sale) => sum + sale.total_amount, 0)

  const todaysServices = mockServices.filter(service => {
    const serviceDate = new Date(service.service_date)
    const today = new Date()
    return serviceDate.toDateString() === today.toDateString()
  })
  const todaysServiceAmount = todaysServices.reduce((sum, service) => sum + service.total_amount, 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/channels/substores')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Substores
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{substore.name}</h1>
                {getTypeBadge(substore.type)}
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-600">{substore.location}</p>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-500">Manager: {substore.manager}</p>
                </div>
              </div>
              <div className="mt-2">
                {getRatingStars(substore.rating)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today's Sales</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(todaysSalesAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sales Count</p>
                  <p className="text-2xl font-bold text-blue-600">{todaysSales.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {substore.type === 'lubebay' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Services Revenue</p>
                    <p className="text-xl font-bold text-purple-600">{formatCurrency(todaysServiceAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-orange-600">{substore.products_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sales'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('sales')}
            >
              Sales
            </button>
            {substore.type === 'lubebay' && (
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('services')}
              >
                Services
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Substore Info */}
            <Card>
              <CardHeader>
                <CardTitle>Substore Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Code</label>
                  <p className="font-mono text-gray-900">{substore.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact</label>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{substore.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 text-sm">{substore.email}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Operating Since</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{formatDateTime(substore.opening_date).split(',')[0]}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Commission Rate</label>
                  <p className="text-lg font-semibold text-green-600">{substore.commission_rate}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Monthly Sales</label>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(substore.monthly_sales)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Transaction</label>
                  <p className="text-gray-900">{formatDateTime(substore.last_transaction)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="inline-block">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      substore.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {substore.status.charAt(0).toUpperCase() + substore.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Sales</h3>
              <Button
                className="mofad-btn-primary"
                onClick={() => setShowRecordSaleModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Sale
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Quantity</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{sale.product_name}</div>
                            <div className="text-sm text-gray-500">{sale.payment_method}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-medium">{sale.quantity}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-gray-900">{formatCurrency(sale.total_amount)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(sale.status)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-500">{formatDateTime(sale.sale_date)}</span>
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

        {activeTab === 'services' && substore.type === 'lubebay' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Services</h3>
              <Button
                className="mofad-btn-primary"
                onClick={() => setShowRecordServiceModal(true)}
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
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Duration</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockServices.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{service.service_type}</div>
                            <div className="text-sm text-gray-500">{service.vehicle_type}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-gray-900">{service.service_duration}min</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-gray-900">{formatCurrency(service.total_amount)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(service.status)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-500">{formatDateTime(service.service_date)}</span>
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