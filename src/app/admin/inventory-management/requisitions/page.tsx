'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  Eye,
  ClipboardPenLine,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Calendar,
  User,
  MapPin,
  MessageSquare,
  Send,
  FileCheck,
  ArrowRight,
  Building,
  Coffee,
  Printer,
  FileText,
  Box,
} from 'lucide-react'

// Requisition interfaces
interface RequisitionItem {
  id: number
  itemName: string
  itemType: 'Asset' | 'Consumable'
  category: string
  quantity: number
  unit: string
  estimatedCost: number
  urgency: 'Low' | 'Medium' | 'High' | 'Critical'
  justification: string
}

interface Requisition {
  id: number
  requisitionNumber: string
  requestedBy: string
  department: string
  requestDate: string
  requiredDate: string
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Partially Approved' | 'Fulfilled' | 'Cancelled'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  purpose: string
  items: RequisitionItem[]
  totalEstimatedCost: number
  reviewedBy?: string
  reviewDate?: string
  approvedBy?: string
  approvalDate?: string
  rejectionReason?: string
  comments: string[]
  attachments?: string[]
}

// Mock data for requisitions
const generateMockRequisitions = (): Requisition[] => {
  const departments = [
    'Human Resources',
    'Finance & Accounting',
    'Information Technology',
    'Operations',
    'Sales & Marketing',
    'Administration',
    'Security',
    'Maintenance'
  ]

  const employees = [
    'Adebayo Johnson',
    'Fatima Usman',
    'Emeka Okafor',
    'Kemi Adebola',
    'Ibrahim Musa',
    'Grace Okoro',
    'Chinedu Okonkwo',
    'Aisha Bello',
    'Olumide Adeyemi',
    'Blessing Okafor',
    'Yusuf Hassan',
    'Chioma Nwankwo'
  ]

  const reviewers = [
    'Adebayo Johnson', // Manager
    'Fatima Usman',   // Supervisor
    'Ibrahim Musa',   // Department Head
  ]

  const sampleItems = [
    { name: 'Dell OptiPlex Desktop', type: 'Asset', category: 'IT Equipment', unit: 'Unit', cost: 450000 },
    { name: 'Office Chair Executive', type: 'Asset', category: 'Office Furniture', unit: 'Unit', cost: 85000 },
    { name: 'A4 Copy Paper', type: 'Consumable', category: 'Office Supplies', unit: 'Ream', cost: 3500 },
    { name: 'HP Laser Printer', type: 'Asset', category: 'IT Equipment', unit: 'Unit', cost: 125000 },
    { name: 'Ink Cartridge Black', type: 'Consumable', category: 'Printing Materials', unit: 'Piece', cost: 8500 },
    { name: 'Conference Table', type: 'Asset', category: 'Office Furniture', unit: 'Unit', cost: 320000 },
    { name: 'Hand Sanitizer', type: 'Consumable', category: 'Cleaning Supplies', unit: 'Bottle', cost: 2800 },
    { name: 'Whiteboard Markers', type: 'Consumable', category: 'Stationery', unit: 'Set', cost: 4500 },
    { name: 'Air Conditioning Unit', type: 'Asset', category: 'HVAC Equipment', unit: 'Unit', cost: 280000 },
    { name: 'USB Flash Drives', type: 'Consumable', category: 'IT Consumables', unit: 'Piece', cost: 5500 }
  ]

  const statuses: Requisition['status'][] = [
    'Submitted', 'Under Review', 'Approved', 'Rejected', 'Partially Approved', 'Fulfilled', 'Cancelled'
  ]

  const priorities: Requisition['priority'][] = ['Low', 'Medium', 'High', 'Critical']

  const purposes = [
    'New Employee Setup',
    'Equipment Replacement',
    'Office Expansion',
    'Maintenance Requirements',
    'Operational Efficiency',
    'Health & Safety Compliance',
    'Project Requirements',
    'Seasonal Needs'
  ]

  const requisitions: Requisition[] = []

  for (let i = 0; i < 45; i++) {
    const requestDate = new Date()
    requestDate.setDate(requestDate.getDate() - Math.random() * 60) // Random date in last 2 months

    const requiredDate = new Date(requestDate)
    requiredDate.setDate(requiredDate.getDate() + Math.random() * 30 + 7) // 1-5 weeks from request date

    const numItems = Math.floor(Math.random() * 4) + 1 // 1-4 items per requisition
    const items: RequisitionItem[] = []
    let totalCost = 0

    for (let j = 0; j < numItems; j++) {
      const sampleItem = sampleItems[Math.floor(Math.random() * sampleItems.length)]
      const quantity = Math.floor(Math.random() * 10) + 1
      const cost = sampleItem.cost * quantity

      items.push({
        id: j + 1,
        itemName: sampleItem.name,
        itemType: sampleItem.type as 'Asset' | 'Consumable',
        category: sampleItem.category,
        quantity,
        unit: sampleItem.unit,
        estimatedCost: cost,
        urgency: priorities[Math.floor(Math.random() * priorities.length)] as RequisitionItem['urgency'],
        justification: `Required for ${purposes[Math.floor(Math.random() * purposes.length)].toLowerCase()}`
      })
      totalCost += cost
    }

    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]

    // Generate review/approval data based on status
    let reviewedBy, reviewDate, approvedBy, approvalDate, rejectionReason

    if (['Under Review', 'Approved', 'Rejected', 'Partially Approved', 'Fulfilled'].includes(status)) {
      reviewedBy = reviewers[Math.floor(Math.random() * reviewers.length)]
      reviewDate = new Date(requestDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    if (['Approved', 'Partially Approved', 'Fulfilled'].includes(status)) {
      approvedBy = reviewedBy
      approvalDate = reviewDate
    }

    if (status === 'Rejected') {
      rejectionReason = ['Budget constraints', 'Item not available', 'Insufficient justification', 'Alternative solution suggested'][Math.floor(Math.random() * 4)]
    }

    const comments = []
    if (status !== 'Submitted') {
      comments.push(`Reviewed by ${reviewedBy} on ${reviewDate}`)
      if (status === 'Approved') {
        comments.push('All items approved. Please proceed with procurement.')
      } else if (status === 'Rejected') {
        comments.push(`Rejected: ${rejectionReason}`)
      }
    }

    const requisition: Requisition = {
      id: i + 1,
      requisitionNumber: `REQ-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      requestedBy: employees[Math.floor(Math.random() * employees.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      requestDate: requestDate.toISOString().split('T')[0],
      requiredDate: requiredDate.toISOString().split('T')[0],
      status,
      priority,
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      items,
      totalEstimatedCost: totalCost,
      reviewedBy,
      reviewDate,
      approvedBy,
      approvalDate,
      rejectionReason,
      comments
    }

    requisitions.push(requisition)
  }

  return requisitions.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getStatusColor = (status: Requisition['status']) => {
  const colors = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Submitted': 'bg-blue-100 text-blue-800',
    'Under Review': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Partially Approved': 'bg-orange-100 text-orange-800',
    'Fulfilled': 'bg-emerald-100 text-emerald-800',
    'Cancelled': 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getPriorityColor = (priority: Requisition['priority']) => {
  const colors = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  }
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

const getStatusIcon = (status: Requisition['status']) => {
  const icons = {
    'Draft': Edit,
    'Submitted': Send,
    'Under Review': Clock,
    'Approved': CheckCircle,
    'Rejected': XCircle,
    'Partially Approved': AlertTriangle,
    'Fulfilled': FileCheck,
    'Cancelled': XCircle
  }
  return icons[status] || Clock
}

export default function RequisitionsPage() {
  const router = useRouter()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRequisitions, setSelectedRequisitions] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Generate mock data
  const allRequisitions = useMemo(() => generateMockRequisitions(), [])

  // Filter requisitions
  const filteredRequisitions = useMemo(() => {
    let filtered = [...allRequisitions]

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.items.some(item => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(req => req.status === statusFilter)
    }

    if (priorityFilter) {
      filtered = filtered.filter(req => req.priority === priorityFilter)
    }

    if (departmentFilter) {
      filtered = filtered.filter(req => req.department === departmentFilter)
    }

    return filtered
  }, [allRequisitions, searchTerm, statusFilter, priorityFilter, departmentFilter])

  // Pagination
  const totalPages = Math.ceil(filteredRequisitions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentRequisitions = filteredRequisitions.slice(startIndex, startIndex + itemsPerPage)

  // Get unique values for filters
  const statuses = Array.from(new Set(allRequisitions.map(req => req.status)))
  const priorities = Array.from(new Set(allRequisitions.map(req => req.priority)))
  const departments = Array.from(new Set(allRequisitions.map(req => req.department)))

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalValue = allRequisitions.reduce((sum, req) => sum + req.totalEstimatedCost, 0)
    const pendingRequisitions = allRequisitions.filter(req => ['Submitted', 'Under Review'].includes(req.status)).length
    const approvedRequisitions = allRequisitions.filter(req => req.status === 'Approved').length
    const rejectedRequisitions = allRequisitions.filter(req => req.status === 'Rejected').length
    const criticalRequisitions = allRequisitions.filter(req => req.priority === 'Critical').length

    return {
      totalRequisitions: allRequisitions.length,
      totalValue,
      pendingRequisitions,
      approvedRequisitions,
      rejectedRequisitions,
      criticalRequisitions
    }
  }, [allRequisitions])

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-lg ring-1 ring-red-100">
                <ClipboardPenLine className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Item Requisitions</h1>
                <p className="text-gray-600 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-red-500" />
                  Staff requests for assets and consumables with approval workflow
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                variant="outline"
                className="flex items-center hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                onClick={() => router.push('/admin/inventory-management/requisitions/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Requisition
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Requests</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalRequisitions}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <ClipboardPenLine className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pendingRequisitions}</p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Approved</p>
                  <p className="text-3xl font-bold text-green-900">{stats.approvedRequisitions}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Critical</p>
                  <p className="text-3xl font-bold text-red-900">{stats.criticalRequisitions}</p>
                </div>
                <div className="p-3 bg-red-200 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Value</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <Package className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requisitions..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requisitions Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Requisition</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Requested By</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRequisitions.map((requisition) => {
                  const StatusIcon = getStatusIcon(requisition.status)

                  return (
                    <tr key={requisition.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{requisition.requisitionNumber}</div>
                          <div className="text-sm text-gray-500">{new Date(requisition.requestDate).toLocaleDateString()}</div>
                          <div className="text-xs text-blue-600">{requisition.purpose}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <User className="w-4 h-4 mr-1 text-gray-400" />
                            {requisition.requestedBy}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Building className="w-4 h-4 mr-1 text-gray-400" />
                            {requisition.department}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {requisition.items.length} item{requisition.items.length > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {requisition.items.slice(0, 2).map(item => item.itemName).join(', ')}
                          {requisition.items.length > 2 && ` +${requisition.items.length - 2} more`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(requisition.totalEstimatedCost)}</div>
                        <div className="text-xs text-gray-500">
                          Required: {new Date(requisition.requiredDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(requisition.priority)}`}>
                          {requisition.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-4 h-4 text-gray-400" />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(requisition.status)}`}>
                            {requisition.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-green-50">
                            <Edit className="w-4 h-4 text-green-600" />
                          </Button>
                          {requisition.status === 'Under Review' && (
                            <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                              <ArrowRight className="w-4 h-4 text-purple-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRequisitions.length)} of {filteredRequisitions.length} requisitions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}